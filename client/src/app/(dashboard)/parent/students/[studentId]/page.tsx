'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useParentProfileByUser } from '@/shared/services/api/queries/useProfile.query';
import { useStudentDetail } from '@/shared/services/api/queries/useStudent.query';
import { useUpdateStudent } from '@/shared/services/api/mutations/useStudent.mutation';
import Link from 'next/link';
import { useState } from 'react';
import type {
  UpdateStudentDto,
  WeekdaySchedule,
  ScheduleSlot,
} from '@/shared/types/api/student';

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;

  const { data: session } = useSession();
  const { data: parentProfile } = useParentProfileByUser(
    session?.user?._id as string | undefined,
  );
  const { data: student, isLoading } = useStudentDetail(studentId);
  const updateStudent = useUpdateStudent();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateStudentDto>({});
  const [scheduleInput, setScheduleInput] = useState({
    weekday: 1,
    startTime: '16:00',
    endTime: '18:00',
  });

  const handleEdit = () => {
    setEditData({
      fullName: student?.fullName,
      gender: student?.gender,
      dateOfBirth: student?.dateOfBirth,
      school: student?.school,
      grade: student?.grade,
      gradeLevel: student?.gradeLevel,
      specialNeeds: student?.specialNeeds,
      learningGoals: student?.learningGoals,
      schedulePreferences: student?.schedulePreferences
        ? JSON.parse(JSON.stringify(student.schedulePreferences))
        : [],
      mode: student?.mode,
      location: student?.location,
      budgetRange: student?.budgetRange,
      notes: student?.notes,
    });
    setIsEditing(true);
  };

  const addScheduleSlot = () => {
    if (scheduleInput.endTime <= scheduleInput.startTime) return;
    const newSlot: ScheduleSlot = {
      start: scheduleInput.startTime,
      end: scheduleInput.endTime,
    };
    const prefs = editData.schedulePreferences ?? [];
    const existingIdx = prefs.findIndex((s) => s.weekday === scheduleInput.weekday);
    if (existingIdx >= 0) {
      const updated = prefs.map((s, i) =>
        i === existingIdx ? { ...s, slots: [...s.slots, newSlot] } : s,
      );
      setEditData({ ...editData, schedulePreferences: updated });
    } else {
      const newDay: WeekdaySchedule = {
        weekday: scheduleInput.weekday,
        slots: [newSlot],
      };
      setEditData({
        ...editData,
        schedulePreferences: [...prefs, newDay].sort((a, b) => a.weekday - b.weekday),
      });
    }
  };

  const removeScheduleSlot = (weekday: number, slotIndex: number) => {
    const prefs = editData.schedulePreferences ?? [];
    const updated = prefs
      .map((s) =>
        s.weekday === weekday
          ? { ...s, slots: s.slots.filter((_, i) => i !== slotIndex) }
          : s,
      )
      .filter((s) => s.slots.length > 0);
    setEditData({ ...editData, schedulePreferences: updated });
  };

  const handleSave = async () => {
    if (!student) return;
    try {
      await updateStudent.mutateAsync({ id: student._id, dto: editData });
      setIsEditing(false);
    } catch {
      alert('Failed to update student profile. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Student not found</h2>
          <Link href="/parent/students" className="text-blue-600 hover:underline">
            Back to students
          </Link>
        </div>
      </div>
    );
  }

  const subjects =
    student.subjectsNeeded?.map((s) => (typeof s === 'string' ? s : s.name)) || [];

  const displayPrefs = isEditing
    ? (editData.schedulePreferences ?? [])
    : (student.schedulePreferences ?? []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <Link href="/parent/students" className="hover:underline">Students</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-gray-900">{student.fullName || 'Student'}</span>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? (
                <input
                  type="text"
                  value={editData.fullName || ''}
                  onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              ) : (
                student.fullName || 'Unnamed Student'
              )}
            </h1>
            <p className="text-gray-600 mt-1">
              {student.gradeLevel || student.grade || 'Grade not specified'}
            </p>
          </div>

          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Edit
                </button>
                <Link
                  href={`/parent/students/${studentId}/tutors`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
                >
                  Find Tutors for {student.fullName}
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateStudent.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {updateStudent.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Basic Information */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField
              label="Gender"
              value={
                isEditing ? (
                  <select
                    value={editData.gender || ''}
                    onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Not specified</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  student.gender || 'Not specified'
                )
              }
            />
            <InfoField
              label="Date of Birth"
              value={
                isEditing ? (
                  <input
                    type="date"
                    value={editData.dateOfBirth || ''}
                    onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  student.dateOfBirth
                    ? new Date(student.dateOfBirth).toLocaleDateString()
                    : 'Not specified'
                )
              }
            />
            <InfoField
              label="School"
              value={
                isEditing ? (
                  <input
                    type="text"
                    value={editData.school || ''}
                    onChange={(e) => setEditData({ ...editData, school: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  student.school || 'Not specified'
                )
              }
            />
            <InfoField
              label="Grade"
              value={
                isEditing ? (
                  <input
                    type="text"
                    value={editData.grade || ''}
                    onChange={(e) => setEditData({ ...editData, grade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  student.grade || 'Not specified'
                )
              }
            />
          </div>
        </section>

        {/* Learning Information */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Information</h2>
          <div className="space-y-4">
            {subjects.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subjects Needed
                </label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-lg border border-blue-200"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <InfoField
              label="Learning Goals"
              value={
                isEditing ? (
                  <textarea
                    value={editData.learningGoals || ''}
                    onChange={(e) => setEditData({ ...editData, learningGoals: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                ) : (
                  student.learningGoals || 'Not specified'
                )
              }
            />

            {student.specialNeeds && (
              <InfoField label="Special Needs" value={student.specialNeeds} />
            )}
          </div>
        </section>

        {/* Schedule & Availability */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Schedule</h2>

          {/* Edit controls */}
          {isEditing && (
            <div className="flex flex-wrap gap-3 items-end mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs font-medium text-gray-600 mb-1">Day</label>
                <select
                  value={scheduleInput.weekday}
                  onChange={(e) =>
                    setScheduleInput({ ...scheduleInput, weekday: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {WEEKDAY_NAMES.map((name, idx) => (
                    <option key={idx} value={idx}>{name}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[110px]">
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                <input
                  type="time"
                  value={scheduleInput.startTime}
                  onChange={(e) =>
                    setScheduleInput({ ...scheduleInput, startTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex-1 min-w-[110px]">
                <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
                <input
                  type="time"
                  value={scheduleInput.endTime}
                  onChange={(e) =>
                    setScheduleInput({ ...scheduleInput, endTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <button
                type="button"
                onClick={addScheduleSlot}
                disabled={scheduleInput.endTime <= scheduleInput.startTime}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-40"
              >
                + Add Slot
              </button>
            </div>
          )}

          {/* Display schedule */}
          {displayPrefs.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              {isEditing ? 'No slots added yet. Use the form above to add availability.' : 'No schedule set.'}
            </p>
          ) : (
            <div className="space-y-3">
              {displayPrefs
                .slice()
                .sort((a, b) => a.weekday - b.weekday)
                .map((sched) => (
                  <div key={sched.weekday}>
                    <p className="text-sm font-medium text-gray-700 mb-1.5">
                      {WEEKDAY_NAMES[sched.weekday]}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sched.slots.map((slot, idx) => (
                        <div
                          key={idx}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm rounded-lg border ${
                            isEditing
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          <span>{slot.start} – {slot.end}</span>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => removeScheduleSlot(sched.weekday, idx)}
                              className="text-blue-400 hover:text-red-500 transition-colors leading-none font-bold"
                              aria-label="Remove slot"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* Tutoring Preferences */}
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tutoring Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField
              label="Preferred Mode"
              value={student.mode || 'Not specified'}
            />
            {student.location && (
              <InfoField
                label="Location"
                value={`${student.location.city}${student.location.district ? `, ${student.location.district}` : ''}`}
              />
            )}
            {student.budgetRange && (
              <InfoField
                label="Budget Range"
                value={`${student.budgetRange.min.toLocaleString()} – ${student.budgetRange.max.toLocaleString()} VND/hr`}
              />
            )}
          </div>
        </section>

        {student.notes && (
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
            <p className="text-gray-700">{student.notes}</p>
          </section>
        )}
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="text-gray-900">{value}</div>
    </div>
  );
}
