'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useTutorDetail } from '@/shared/services/api/queries/useTutor.query';
import { useStudentDetail } from '@/shared/services/api/queries/useStudent.query';
import { useCreateRequestBooking } from '@/shared/services/api/mutations/useRequestBooking.mutation';
import { useTutorPublicSlots } from '@/shared/services/api/queries/useTutorSchedule.query';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { App, Button, Spin, Modal, Input, Alert, Typography } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import Link from 'next/link';
import type { TutorScheduleSlot } from '@/shared/types/api/tutor';
import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function fmtHour(h: number) {
  return `${String(h).padStart(2, '0')}:00`;
}

function weekRange(anchor: Dayjs) {
  const start = anchor.startOf('isoWeek');
  return Array.from({ length: 7 }, (_, i) => start.add(i, 'day'));
}

// ─── Slot Picker inside the modal ─────────────────────────────────────────────
function SlotPicker({
  tutorProfileId,
  selected,
  onSelect,
}: {
  tutorProfileId: string;
  selected: TutorScheduleSlot | null;
  onSelect: (slot: TutorScheduleSlot | null) => void;
}) {
  const [weekAnchor, setWeekAnchor] = useState(dayjs());
  const days = useMemo(() => weekRange(weekAnchor), [weekAnchor]);

  const { data: slots = [], isLoading } = useTutorPublicSlots(tutorProfileId, {
    fromDate: days[0].format('YYYY-MM-DD'),
    toDate: days[6].format('YYYY-MM-DD'),
  });

  const slotsByDate = useMemo(() => {
    const m: Record<string, TutorScheduleSlot[]> = {};
    for (const s of slots) {
      const d = s.date.split('T')[0];
      (m[d] ??= []).push(s);
    }
    return m;
  }, [slots]);

  return (
    <div>
      {/* Week navigation */}
      <div className="flex items-center gap-3 mb-3">
        <Button size="small" onClick={() => setWeekAnchor((w) => w.subtract(1, 'week'))}>
          ←
        </Button>
        <span className="text-sm font-medium flex-1 text-center">
          {days[0].format('DD/MM')} – {days[6].format('DD/MM/YYYY')}
        </span>
        <Button size="small" onClick={() => setWeekAnchor((w) => w.add(1, 'week'))}>
          →
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spin />
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-sm">
          No available slots this week. Try another week.
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const key = day.format('YYYY-MM-DD');
            const daySlots = slotsByDate[key] ?? [];
            const isToday = day.isSame(dayjs(), 'day');
            return (
              <div key={key} className="text-center">
                <div
                  className={`text-xs font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-500'}`}
                >
                  {DAY_LABELS[day.day()]}
                  <br />
                  <span className="font-normal">{day.format('DD')}</span>
                </div>
                <div className="space-y-1">
                  {daySlots.length === 0 ? (
                    <div className="text-xs text-gray-200 py-1">—</div>
                  ) : (
                    daySlots.map((s) => {
                      const isSelected = selected?._id === s._id;
                      return (
                        <button
                          key={s._id}
                          onClick={() => onSelect(isSelected ? null : s)}
                          className={`w-full text-xs rounded px-1 py-1.5 border transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                              : 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                          }`}
                        >
                          {fmtHour(s.startHour)}
                          <br />
                          {fmtHour(s.endHour)}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-100 border border-green-300 inline-block" />
          Available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
          Selected
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function TutorDetailPage() {
  const { message } = App.useApp();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tutorId = params.tutorId as string;
  const studentId = searchParams.get('studentId');

  const { data: tutor, isLoading: tutorLoading } = useTutorDetail(tutorId);
  const { data: student } = useStudentDetail(studentId || undefined);
  const createRequest = useCreateRequestBooking();

  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TutorScheduleSlot | null>(null);
  const [note, setNote] = useState('');

  const handleSendRequest = async () => {
    if (!student) return;
    if (!selectedSlot) {
      message.warning('Please select an available time slot');
      return;
    }

    try {
      await createRequest.mutateAsync({
        tutorIds: [tutorId],
        studentId: student._id,
        requestedDate: selectedSlot.date,
        slotId: selectedSlot._id,
        note,
      });
      message.success('Booking request sent successfully!');
      setShowRequestDialog(false);
      setSelectedSlot(null);
      setNote('');
      router.push('/parent/requests');
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? 'Failed to send request, please try again');
    }
  };

  if (tutorLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="container mx-auto p-6 text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tutor not found</h2>
        <Link href="/parent/search" className="text-blue-600 hover:underline">
          Back to search
        </Link>
      </div>
    );
  }

  const suitability = student ? calculateSuitability(tutor, student) : null;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        {studentId && (
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Link href="/parent/students" className="hover:underline">Students</Link>
            <span className="mx-2">{'>'}</span>
            <Link href={`/parent/students/${studentId}`} className="hover:underline">
              {student?.fullName || 'Student'}
            </Link>
            <span className="mx-2">{'>'}</span>
            <Link href={`/parent/students/${studentId}/tutors`} className="hover:underline">Find Tutors</Link>
            <span className="mx-2">{'>'}</span>
            <span className="text-gray-900">Tutor Profile</span>
          </div>
        )}

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {(tutor as any).userId?.name || 'Tutor Profile'}
            </h1>
            {tutor.headline && (
              <p className="text-xl text-gray-600 mt-1">{tutor.headline}</p>
            )}
          </div>

          {student && (
            <Button
              type="primary"
              size="large"
              onClick={() => setShowRequestDialog(true)}
            >
              Book for {student.fullName}
            </Button>
          )}
        </div>
      </div>

      {/* Suitability */}
      {suitability && (
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Compatibility with {student?.fullName}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SuitabilityCard label="Teaching Mode" value={suitability.modeMatch} icon="📍" />
            <SuitabilityCard label="Tuition Fee" value={suitability.priceFit} icon="💰" />
            <SuitabilityCard label="Overall" value={suitability.overall} icon="✨" />
          </div>
        </section>
      )}

      {/* Tutor info */}
      <div className="space-y-6">
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
          <div className="space-y-4">
            {tutor.bio && <p className="text-gray-700">{tutor.bio}</p>}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <InfoItem label="Experience" value={`${tutor.yearsExp || 0} years`} />
              <InfoItem label="Rate" value={`${tutor.hourlyRate.toLocaleString()} VND/h`} />
              <InfoItem label="Mode" value={tutor.mode || 'Online'} />
              <InfoItem
                label="Rating"
                value={tutor.ratingAvg ? `★ ${tutor.ratingAvg.toFixed(1)} (${tutor.ratingCount})` : 'New'}
              />
            </div>
          </div>
        </section>

        {/* Weekly availability preview */}
        {(tutor as any).weeklyAvailability?.length > 0 && (
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Schedule</h2>
            <div className="flex flex-wrap gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label, dow) => {
                const daySlots = (tutor as any).weeklyAvailability.filter(
                  (s: any) => s.dayOfWeek === dow,
                );
                if (!daySlots.length) return null;
                return (
                  <div key={dow} className="bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
                    <div className="text-xs font-bold text-blue-700 mb-1">{label}</div>
                    {daySlots.map((s: any, i: number) => (
                      <div key={i} className="text-xs text-blue-600">
                        {fmtHour(s.startHour)}–{fmtHour(s.endHour)}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {tutor.subjects && tutor.subjects.length > 0 && (
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Subjects</h2>
            <div className="flex flex-wrap gap-2">
              {tutor.subjects.map((subject: any, idx: number) => (
                <span key={idx} className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                  {(subject.subjectId as any)?.name || 'Subject'}
                  {subject.level && ` - ${subject.level}`}
                </span>
              ))}
            </div>
          </section>
        )}

        {tutor.teachingStyles && tutor.teachingStyles.length > 0 && (
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Teaching Style</h2>
            <div className="flex flex-wrap gap-2">
              {tutor.teachingStyles.map((style, idx) => (
                <span key={idx} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg">
                  {style}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Booking Request Modal with slot picker */}
      <Modal
        open={showRequestDialog}
        title="Select a Time Slot"
        onCancel={() => { setShowRequestDialog(false); setSelectedSlot(null); setNote(''); }}
        footer={null}
        width={680}
      >
        <div className="space-y-5 mt-2">
          {/* Student info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
              {student?.fullName}
            </div>
          </div>

          {/* Slot picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose an available slot <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <SlotPicker
                tutorProfileId={tutorId}
                selected={selectedSlot}
                onSelect={setSelectedSlot}
              />
            </div>
          </div>

          {/* Selected slot summary */}
          {selectedSlot && (() => {
            const match = checkSlotMatchesStudentSchedule(selectedSlot, student);
            return (
              <>
                <Alert
                  type="success"
                  showIcon
                  message={
                    <span>
                      Selected: <b>{dayjs(selectedSlot.date).format('dddd, DD/MM/YYYY')}</b> at{' '}
                      <b>{fmtHour(selectedSlot.startHour)} – {fmtHour(selectedSlot.endHour)}</b>
                    </span>
                  }
                />
                {!match.ok && (
                  <Alert
                    type="warning"
                    showIcon
                    icon={<WarningOutlined />}
                    message="Schedule mismatch"
                    description={match.reason + " This slot may not suit the student's availability."}
                  />
                )}
              </>
            );
          })()}

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
            <Input.TextArea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Special requests, subjects to focus on..."
              maxLength={500}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1"
              onClick={() => { setShowRequestDialog(false); setSelectedSlot(null); setNote(''); }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="flex-1"
              disabled={!selectedSlot}
              loading={createRequest.isPending}
              onClick={handleSendRequest}
            >
              {createRequest.isPending ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function checkSlotMatchesStudentSchedule(
  slot: TutorScheduleSlot,
  student: any,
): { ok: boolean; reason: string } {
  const prefs = student?.schedulePreferences;
  if (!prefs || prefs.length === 0) {
    return { ok: true, reason: '' }; // student has no preferences set → no warning needed
  }

  const dow = dayjs(slot.date).day(); // 0=Sun … 6=Sat
  const dayPrefs = prefs.filter((p: any) => p.weekday === dow);

  if (dayPrefs.length === 0) {
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dow];
    return {
      ok: false,
      reason: `${student.fullName}'s schedule has no availability on ${dayName}s.`,
    };
  }

  // Check if the slot time overlaps with any student preference window
  const slotStart = slot.startHour * 60;
  const slotEnd   = slot.endHour   * 60;

  const overlaps = dayPrefs.some((dayPref: any) =>
    (dayPref.slots ?? []).some((s: any) => {
      const [sh, sm] = s.start.split(':').map(Number);
      const [eh, em] = s.end.split(':').map(Number);
      const prefStart = sh * 60 + (sm || 0);
      const prefEnd   = eh * 60 + (em || 0);
      // overlap: not (slotEnd <= prefStart || slotStart >= prefEnd)
      return slotEnd > prefStart && slotStart < prefEnd;
    }),
  );

  if (!overlaps) {
    const windows = dayPrefs
      .flatMap((p: any) => p.slots ?? [])
      .map((s: any) => `${s.start}–${s.end}`)
      .join(', ');
    return {
      ok: false,
      reason: `${student.fullName} is only available at: ${windows} on this day.`,
    };
  }

  return { ok: true, reason: '' };
}

function calculateSuitability(tutor: any, student: any) {
  let modeMatch = 'Unknown';
  let priceFit = 'Unknown';
  let overall = 'Good';

  if (student.mode && tutor.mode) {
    modeMatch = student.mode === tutor.mode || tutor.mode === 'hybrid' ? 'Compatible' : 'Different';
  }
  if (student.budgetRange && tutor.hourlyRate) {
    if (tutor.hourlyRate >= student.budgetRange.min && tutor.hourlyRate <= student.budgetRange.max) {
      priceFit = 'Within budget';
    } else if (tutor.hourlyRate < student.budgetRange.min) {
      priceFit = 'Below budget';
    } else {
      priceFit = 'Over budget';
    }
  }
  if (modeMatch === 'Compatible' && priceFit === 'Within budget') overall = 'Excellent';
  else if (modeMatch === 'Different' || priceFit === 'Over budget') overall = 'Acceptable';

  return { modeMatch, priceFit, overall };
}

function SuitabilityCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  const getColor = (v: string) => {
    if (v === 'Compatible' || v === 'Within budget' || v === 'Excellent')
      return 'text-green-700 bg-green-50 border-green-200';
    if (v === 'Over budget' || v === 'Acceptable')
      return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-gray-700 bg-gray-50 border-gray-200';
  };
  return (
    <div className={`p-4 rounded-lg border ${getColor(value)}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm font-medium mb-1">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="font-medium text-gray-900">{value}</div>
    </div>
  );
}
