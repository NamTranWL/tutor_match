'use client';

import { useState, useMemo } from 'react';
import {
  App,
  Button,
  Card,
  Table,
  Tag,
  Tabs,
  DatePicker,
  Select,
  Modal,
  Form,
  Input,
  Popconfirm,
  Empty,
  Spin,
  Badge,
  Avatar,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  ThunderboltOutlined,
  DeleteOutlined,
  StopOutlined,
  CheckCircleOutlined,
  UserOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tutorService } from '@/shared/services/api/tutor.service';
import { useMyTutorProfile } from '@/shared/services/api/queries/useProfile.query';
import { useMyTutorSlots } from '@/shared/services/api/queries/useTutorSchedule.query';
import { useBookingListQuery } from '@/shared/services/api/queries/useBooking.query';
import {
  useCreateSlotMutation,
  useGenerateSlotsMutation,
  useUpdateSlotMutation,
  useDeleteSlotMutation,
} from '@/shared/services/api/mutations/useTutorSchedule.mutation';
import type { TutorScheduleSlot, WeeklyAvailabilitySlot } from '@/shared/types/api/tutor';
import type { BookingDoc } from '@/shared/types/api/booking';
import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

// ─── Constants ────────────────────────────────────────────────────────────────
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_FULL   = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SLOT_STATUS_COLOR: Record<string, string> = {
  available: 'success',
  booked:    'processing',
  blocked:   'default',
};
const SLOT_STATUS_LABEL: Record<string, string> = {
  available: 'Available',
  booked:    'Booked',
  blocked:   'Blocked',
};
const BOOKING_STATUS_COLOR: Record<string, string> = {
  active:    'success',
  pending:   'warning',
  cancelled: 'error',
  completed: 'default',
};
const BOOKING_STATUS_LABEL: Record<string, string> = {
  active:    'Active',
  pending:   'Pending',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtHour(h: number) {
  return `${String(h).padStart(2, '0')}:00`;
}
function weekRange(anchor: Dayjs) {
  const start = anchor.startOf('isoWeek');
  return Array.from({ length: 7 }, (_, i) => start.add(i, 'day'));
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TAB 1 — Weekly Availability
// ═══════════════════════════════════════════════════════════════════════════════
function WeeklyAvailabilityTab({ profile }: { profile: any }) {
  const { message } = App.useApp();
  const qc = useQueryClient();
  const [slots, setSlots] = useState<WeeklyAvailabilitySlot[]>(
    () => profile?.weeklyAvailability ?? [],
  );
  const [addingDay, setAddingDay] = useState<number | null>(null);
  const [newSlot, setNewSlot] = useState({ startHour: 8, endHour: 17 });

  const saveMutation = useMutation({
    mutationFn: (wa: WeeklyAvailabilitySlot[]) =>
      tutorService.updateTutorProfile(profile._id, { weeklyAvailability: wa }),
    onSuccess: () => {
      message.success('Weekly schedule saved');
      qc.invalidateQueries({ queryKey: ['my-tutor-profile'] });
    },
    onError: () => message.error('Failed to save, please try again'),
  });

  const addSlot = () => {
    if (addingDay === null) return;
    if (newSlot.endHour <= newSlot.startHour) {
      message.warning('End time must be after start time');
      return;
    }
    setSlots(prev => [
      ...prev,
      { dayOfWeek: addingDay, startHour: newSlot.startHour, endHour: newSlot.endHour },
    ]);
    setAddingDay(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-gray-500 text-sm">
          Set your recurring weekly availability. Then use the{' '}
          <b>Manage Slots</b> tab to generate concrete bookable slots.
        </p>
        <Button
          type="primary"
          loading={saveMutation.isPending}
          onClick={() => saveMutation.mutate(slots)}
          icon={<CheckCircleOutlined />}
        >
          Save Weekly Schedule
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {Array.from({ length: 7 }, (_, dow) => {
          const daySlots = slots.filter(s => s.dayOfWeek === dow);
          return (
            <Card
              key={dow}
              size="small"
              className="min-h-28"
              title={<span className="text-xs font-bold">{DAY_FULL[dow]}</span>}
              extra={
                <Button
                  size="small"
                  type="link"
                  icon={<PlusOutlined />}
                  onClick={() => { setAddingDay(dow); setNewSlot({ startHour: 8, endHour: 17 }); }}
                />
              }
            >
              {daySlots.length === 0 ? (
                <p className="text-xs text-gray-300 text-center py-2">No slots</p>
              ) : (
                daySlots.map((s, i) => {
                  const gi = slots.indexOf(s);
                  return (
                    <div key={i} className="flex items-center justify-between mb-1 gap-1">
                      <Tag color="blue" className="text-xs m-0">
                        {fmtHour(s.startHour)}–{fmtHour(s.endHour)}
                      </Tag>
                      <Button
                        size="small" type="text" danger
                        icon={<DeleteOutlined />}
                        onClick={() => setSlots(p => p.filter((_, idx) => idx !== gi))}
                      />
                    </div>
                  );
                })
              )}
            </Card>
          );
        })}
      </div>

      <Modal
        open={addingDay !== null}
        title={`Add time slot — ${addingDay !== null ? DAY_FULL[addingDay] : ''}`}
        onOk={addSlot}
        onCancel={() => setAddingDay(null)}
        okText="Add" cancelText="Cancel"
      >
        <div className="flex gap-4 mt-4">
          {(['startHour', 'endHour'] as const).map(key => (
            <div key={key} className="flex-1">
              <label className="block text-sm font-medium mb-1">
                {key === 'startHour' ? 'Start time' : 'End time'}
              </label>
              <Select
                className="w-full"
                value={newSlot[key]}
                onChange={v => setNewSlot(p => ({ ...p, [key]: v }))}
                options={Array.from({ length: 24 }, (_, i) => ({
                  value: key === 'startHour' ? i : i + 1,
                  label: fmtHour(key === 'startHour' ? i : i + 1),
                }))}
              />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TAB 2 — Slot management
// ═══════════════════════════════════════════════════════════════════════════════
function SlotManagementTab() {
  const { message } = App.useApp();
  const [weekAnchor, setWeekAnchor] = useState(dayjs());
  const [showCreate, setShowCreate] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [form] = Form.useForm();
  const [genForm] = Form.useForm();

  const days     = useMemo(() => weekRange(weekAnchor), [weekAnchor]);
  const fromDate = days[0].format('YYYY-MM-DD');
  const toDate   = days[6].format('YYYY-MM-DD');

  const { data: slots = [], isLoading } = useMyTutorSlots({ fromDate, toDate });

  const createSlot    = useCreateSlotMutation();
  const generateSlots = useGenerateSlotsMutation();
  const updateSlot    = useUpdateSlotMutation();
  const deleteSlot    = useDeleteSlotMutation();

  const slotsByDate = useMemo(() => {
    const m: Record<string, TutorScheduleSlot[]> = {};
    slots.forEach(s => {
      const d = s.date.split('T')[0];
      (m[d] ??= []).push(s);
    });
    return m;
  }, [slots]);

  const handleCreate = async () => {
    try {
      const v = await form.validateFields();
      if (v.endHour <= v.startHour) { message.warning('End time must be after start time'); return; }
      await createSlot.mutateAsync({
        date: (v.date as Dayjs).format('YYYY-MM-DD'),
        startHour: v.startHour, endHour: v.endHour,
        status: v.status ?? 'available', note: v.note,
      });
      message.success('Slot created');
      setShowCreate(false); form.resetFields();
    } catch { /* validation */ }
  };

  const handleGenerate = async () => {
    try {
      const v = await genForm.validateFields();
      const [from, to] = v.dateRange as [Dayjs, Dayjs];
      const r = await generateSlots.mutateAsync({
        fromDate: from.format('YYYY-MM-DD'),
        toDate:   to.format('YYYY-MM-DD'),
      });
      message.success(`Created ${r.created} slots, skipped ${r.skipped} duplicates`);
      setShowGenerate(false); genForm.resetFields();
    } catch { /* validation */ }
  };

  const columns = [
    {
      title: 'Date', dataIndex: 'date', key: 'date',
      render: (v: string) => dayjs(v).format('ddd DD/MM/YYYY'),
    },
    {
      title: 'Time', key: 'time',
      render: (_: any, r: TutorScheduleSlot) => `${fmtHour(r.startHour)} – ${fmtHour(r.endHour)}`,
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (s: string) => (
        <Tag color={SLOT_STATUS_COLOR[s] ?? 'default'}>{SLOT_STATUS_LABEL[s] ?? s}</Tag>
      ),
    },
    { title: 'Note', dataIndex: 'note', key: 'note', render: (v?: string) => v || '—' },
    {
      title: 'Actions', key: 'actions',
      render: (_: any, r: TutorScheduleSlot) => {
        if (r.status === 'booked') return <Tag color="processing">Booked by student</Tag>;
        const isBlocked = r.status === 'blocked';
        return (
          <div className="flex gap-2">
            <Button
              size="small"
              icon={isBlocked ? <CheckCircleOutlined /> : <StopOutlined />}
              onClick={() => {
                const ns = isBlocked ? 'available' : 'blocked';
                updateSlot.mutate(
                  { id: r._id, body: { status: ns } },
                  { onSuccess: () => message.success(isBlocked ? 'Slot opened' : 'Slot blocked') },
                );
              }}
            >
              {isBlocked ? 'Open' : 'Block'}
            </Button>
            <Popconfirm
              title="Delete this slot?"
              okText="Delete" cancelText="Cancel"
              onConfirm={() =>
                deleteSlot.mutate(r._id, {
                  onSuccess: () => message.success('Slot deleted'),
                  onError: (e: any) => message.error(e?.response?.data?.message ?? 'Delete failed'),
                })
              }
            >
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button onClick={() => setWeekAnchor(w => w.subtract(1, 'week'))}>← Prev week</Button>
        <span className="font-semibold">
          {days[0].format('DD/MM')} – {days[6].format('DD/MM/YYYY')}
        </span>
        <Button onClick={() => setWeekAnchor(w => w.add(1, 'week'))}>Next week →</Button>
        <Button size="small" onClick={() => setWeekAnchor(dayjs())}>Today</Button>
        <div className="ml-auto flex gap-2">
          <Button icon={<ThunderboltOutlined />} onClick={() => setShowGenerate(true)}>
            Generate from schedule
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowCreate(true)}>
            Add slot
          </Button>
        </div>
      </div>

      {/* Week mini calendar */}
      {isLoading ? (
        <div className="flex justify-center py-8"><Spin /></div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const key = day.format('YYYY-MM-DD');
            const ds  = slotsByDate[key] ?? [];
            const isToday = day.isSame(dayjs(), 'day');
            return (
              <div
                key={key}
                className={`rounded-lg border p-2 min-h-24 ${
                  isToday ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className={`text-xs font-bold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                  {DAY_LABELS[day.day()]} <span className="font-normal">{day.format('DD')}</span>
                </div>
                {ds.length === 0 ? (
                  <p className="text-xs text-gray-200">—</p>
                ) : (
                  ds.map(s => (
                    <Tooltip key={s._id} title={`${SLOT_STATUS_LABEL[s.status]}${s.note ? ` — ${s.note}` : ''}`}>
                      <div className={`text-xs rounded px-1 py-0.5 mb-1 truncate cursor-default border ${
                        s.status === 'available' ? 'bg-green-100 text-green-700 border-green-200' :
                        s.status === 'booked'    ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                   'bg-gray-100 text-gray-400 line-through border-gray-200'
                      }`}>
                        {fmtHour(s.startHour)}–{fmtHour(s.endHour)}
                      </div>
                    </Tooltip>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail table */}
      <Table
        rowKey="_id" dataSource={slots} columns={columns}
        loading={isLoading} size="small" pagination={false}
        locale={{ emptyText: <Empty description="No slots this week" /> }}
      />

      {/* Create modal */}
      <Modal
        open={showCreate} title="Add slot manually"
        onOk={handleCreate} onCancel={() => { setShowCreate(false); form.resetFields(); }}
        confirmLoading={createSlot.isPending} okText="Create" cancelText="Cancel"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Select a date' }]}>
            <DatePicker className="w-full" format="DD/MM/YYYY"
              disabledDate={d => d.isBefore(dayjs(), 'day')} />
          </Form.Item>
          <div className="flex gap-4">
            <Form.Item name="startHour" label="Start time" className="flex-1"
              rules={[{ required: true }]} initialValue={8}>
              <Select options={Array.from({ length: 24 }, (_, i) => ({ value: i, label: fmtHour(i) }))} />
            </Form.Item>
            <Form.Item name="endHour" label="End time" className="flex-1"
              rules={[{ required: true }]} initialValue={10}>
              <Select options={Array.from({ length: 24 }, (_, i) => ({ value: i + 1, label: fmtHour(i + 1) }))} />
            </Form.Item>
          </div>
          <Form.Item name="status" label="Status" initialValue="available">
            <Select options={[
              { value: 'available', label: 'Available' },
              { value: 'blocked',   label: 'Blocked' },
            ]} />
          </Form.Item>
          <Form.Item name="note" label="Note">
            <Input placeholder="e.g. Online only" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Generate modal */}
      <Modal
        open={showGenerate} title="Generate slots from weekly schedule"
        onOk={handleGenerate} onCancel={() => { setShowGenerate(false); genForm.resetFields(); }}
        confirmLoading={generateSlots.isPending} okText="Generate" cancelText="Cancel"
      >
        <p className="text-sm text-gray-500 mb-4">
          Slots will be created based on your weekly availability. Duplicate date/time slots are skipped.
        </p>
        <Form form={genForm} layout="vertical">
          <Form.Item name="dateRange" label="Date range"
            rules={[{ required: true, message: 'Select a date range' }]}>
            <DatePicker.RangePicker
              className="w-full" format="DD/MM/YYYY"
              disabledDate={d => d.isBefore(dayjs(), 'day')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TAB 3 — Sessions with students
// ═══════════════════════════════════════════════════════════════════════════════
function StudentSessionsTab({ tutorProfileId }: { tutorProfileId: string }) {
  const [weekAnchor, setWeekAnchor] = useState(dayjs());
  const days = useMemo(() => weekRange(weekAnchor), [weekAnchor]);

  const { data, isLoading } = useBookingListQuery({
    tutorProfileId,
    pageSize: 100,
    current: 1,
  });

  const bookings: BookingDoc[] = data?.results ?? [];

  const weekBookings = useMemo(() =>
    bookings.filter(b => {
      const d = dayjs(b.date);
      return d.isAfter(days[0].subtract(1, 'day')) && d.isBefore(days[6].add(1, 'day'));
    }),
    [bookings, days],
  );

  const bookingsByDate = useMemo(() => {
    const m: Record<string, BookingDoc[]> = {};
    weekBookings.forEach(b => {
      const d = dayjs(b.date).format('YYYY-MM-DD');
      (m[d] ??= []).push(b);
    });
    return m;
  }, [weekBookings]);

  const upcomingSessions = useMemo(() =>
    bookings
      .filter(b => dayjs(b.date).isAfter(dayjs().subtract(1, 'day')) && b.status !== 'cancelled')
      .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
      .slice(0, 10),
    [bookings],
  );

  const sessionColumns = [
    {
      title: 'Student',
      key: 'student',
      render: (_: any, r: BookingDoc) => (
        <div className="flex items-center gap-2">
          <Avatar size="small" icon={<UserOutlined />} className="bg-blue-500" />
          <div>
            <div className="font-medium text-sm">{r.student?.name ?? '—'}</div>
            <div className="text-xs text-gray-400">{r.parent?.name ?? ''}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Session Date',
      dataIndex: 'date',
      key: 'date',
      render: (v: string) => (
        <div>
          <div className="font-medium">{dayjs(v).format('dddd')}</div>
          <div className="text-sm text-gray-500">{dayjs(v).format('DD/MM/YYYY')}</div>
        </div>
      ),
    },
    {
      title: 'Fee',
      dataIndex: 'amount',
      key: 'amount',
      render: (v: number) => (
        <span className="font-medium text-green-700">
          {v?.toLocaleString()} VND
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => (
        <Tag color={BOOKING_STATUS_COLOR[s] ?? 'default'}>
          {BOOKING_STATUS_LABEL[s] ?? s}
        </Tag>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Week calendar */}
      <Card
        size="small"
        title={
          <div className="flex items-center gap-3">
            <Button size="small" onClick={() => setWeekAnchor(w => w.subtract(1, 'week'))}>←</Button>
            <span className="font-semibold text-sm">
              {days[0].format('DD/MM')} – {days[6].format('DD/MM/YYYY')}
            </span>
            <Button size="small" onClick={() => setWeekAnchor(w => w.add(1, 'week'))}>→</Button>
            <Button size="small" onClick={() => setWeekAnchor(dayjs())}>Today</Button>
          </div>
        }
      >
        {isLoading ? (
          <div className="flex justify-center py-8"><Spin /></div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {days.map(day => {
              const key = day.format('YYYY-MM-DD');
              const dbs = bookingsByDate[key] ?? [];
              const isToday = day.isSame(dayjs(), 'day');
              return (
                <div
                  key={key}
                  className={`rounded-lg border p-2 min-h-28 ${
                    isToday ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className={`text-xs font-bold mb-2 ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                    {DAY_LABELS[day.day()]}{' '}
                    <span className="font-normal">{day.format('DD')}</span>
                  </div>
                  {dbs.length === 0 ? (
                    <p className="text-xs text-gray-200 text-center">—</p>
                  ) : (
                    dbs.map(b => (
                      <Tooltip
                        key={b._id}
                        title={`${b.student?.name ?? 'Student'} — ${BOOKING_STATUS_LABEL[b.status] ?? b.status}`}
                      >
                        <div className={`text-xs rounded px-1.5 py-1 mb-1 truncate cursor-default border ${
                          b.status === 'active'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : b.status === 'cancelled'
                            ? 'bg-red-50 text-red-400 border-red-200 line-through'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                          <div className="flex items-center gap-1">
                            <UserOutlined className="text-xs" />
                            <span className="truncate">{b.student?.name ?? '—'}</span>
                          </div>
                        </div>
                      </Tooltip>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Upcoming sessions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CalendarOutlined className="text-blue-500" />
          <h3 className="font-semibold text-gray-800">Upcoming Sessions</h3>
          <Badge count={upcomingSessions.length} style={{ backgroundColor: '#3b82f6' }} />
        </div>
        {isLoading ? (
          <div className="flex justify-center py-6"><Spin /></div>
        ) : upcomingSessions.length === 0 ? (
          <Empty description="No confirmed sessions yet" />
        ) : (
          <Table
            rowKey="_id"
            dataSource={upcomingSessions}
            columns={sessionColumns}
            size="small"
            pagination={false}
            rowClassName={r => dayjs(r.date).isSame(dayjs(), 'day') ? 'bg-blue-50' : ''}
          />
        )}
      </div>

      {/* All bookings */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-semibold text-gray-800">All Sessions</h3>
          <Badge count={bookings.length} style={{ backgroundColor: '#6b7280' }} />
        </div>
        <Table
          rowKey="_id"
          dataSource={bookings}
          columns={sessionColumns}
          loading={isLoading}
          size="small"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          locale={{ emptyText: <Empty description="No sessions found" /> }}
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Main Page
// ═══════════════════════════════════════════════════════════════════════════════
export default function TutorSchedulePage() {
  const { data: profile, isLoading } = useMyTutorProfile();

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spin size="large" /></div>;
  }

  if (!profile) {
    return (
      <div className="p-6">
        <Card>
          <Empty description="You don't have a tutor profile yet." />
          <div className="flex justify-center mt-4">
            <Button type="primary" href="/tutor/profile">Create Tutor Profile</Button>
          </div>
        </Card>
      </div>
    );
  }

  const weeklyCount = (profile as any).weeklyAvailability?.length ?? 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Configure your weekly availability, manage bookable slots, and view your sessions with students.
        </p>
      </div>

      <Tabs
        defaultActiveKey="weekly"
        size="large"
        items={[
          {
            key: 'weekly',
            label: (
              <span className="flex items-center gap-1">
                Weekly Availability
                {weeklyCount > 0 && (
                  <Badge count={weeklyCount} style={{ backgroundColor: '#22c55e' }} />
                )}
              </span>
            ),
            children: <WeeklyAvailabilityTab profile={profile} />,
          },
          {
            key: 'slots',
            label: 'Manage Slots',
            children: <SlotManagementTab />,
          },
          {
            key: 'students',
            label: (
              <span className="flex items-center gap-1">
                <UserOutlined />
                Sessions with Students
              </span>
            ),
            children: <StudentSessionsTab tutorProfileId={profile._id} />,
          },
        ]}
      />
    </div>
  );
}
