'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateStudent } from '@/shared/services/api/mutations/useStudent.mutation';
import type {
  CreateStudentDto,
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

const STORAGE_KEY = 'create_student_form_data';

export default function CreateStudentPage() {
  const router = useRouter();
  const createStudent = useCreateStudent();
  const [showProfileError, setShowProfileError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [formData, setFormData] = useState<CreateStudentDto>({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    school: '',
    grade: '',
    gradeLevel: '',
    specialNeeds: '',
    subjectsNeeded: [],
    learningGoals: '',
    schedulePreferences: [],
    mode: undefined,
    location: undefined,
    budgetRange: undefined,
    notes: '',
  });

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (e) {
        console.error('Failed to parse saved form data', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save data on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, isLoaded]);

  const [scheduleInput, setScheduleInput] = useState({
    weekday: 1,
    startTime: '16:00',
    endTime: '18:00',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Clean up data before submission
      // Clean up data before submission
      const cleanedData: CreateStudentDto = {
        ...formData,
        gender: formData.gender || undefined,
        mode: formData.mode || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        school: formData.school || undefined,
        grade: formData.grade || undefined,
        gradeLevel: formData.gradeLevel || undefined,
        specialNeeds: formData.specialNeeds || undefined,
        learningGoals: formData.learningGoals || undefined,
        notes: formData.notes || undefined,
        subjectsNeeded:
          formData.subjectsNeeded && formData.subjectsNeeded.length > 0
            ? formData.subjectsNeeded
            : undefined,
        schedulePreferences:
          formData.schedulePreferences &&
          formData.schedulePreferences.length > 0
            ? formData.schedulePreferences
            : undefined,
        budgetRange: formData.budgetRange?.min
          ? formData.budgetRange
          : undefined,
        location: formData.location?.city ? formData.location : undefined,
      };

      await createStudent.mutateAsync(cleanedData);
      
      // Clear saved data on success
      localStorage.removeItem(STORAGE_KEY);
      
      router.push('/parent/students');
    } catch (error: any) {
      console.error('Failed to create student:', error);
      
      // Check if the error is about missing parent profile
      const errorMessage = error?.response?.data?.message || error?.message || '';
      if (errorMessage.includes('Parent profile not found')) {
        setShowProfileError(true);
        // Scroll to top to show the error banner
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert('Failed to create student profile. Please try again.');
      }
    }
  };

  const addScheduleSlot = () => {
    const newSlot: ScheduleSlot = {
      start: scheduleInput.startTime,
      end: scheduleInput.endTime,
    };

    const existingDayIndex = formData.schedulePreferences?.findIndex(
      (s) => s.weekday === scheduleInput.weekday,
    );

    if (
      existingDayIndex !== undefined &&
      existingDayIndex >= 0 &&
      formData.schedulePreferences
    ) {
      // Add to existing day
      const updated = [...formData.schedulePreferences];
      updated[existingDayIndex].slots.push(newSlot);
      setFormData({ ...formData, schedulePreferences: updated });
    } else {
      // Create new day
      const newSchedule: WeekdaySchedule = {
        weekday: scheduleInput.weekday,
        slots: [newSlot],
      };
      setFormData({
        ...formData,
        schedulePreferences: [
          ...(formData.schedulePreferences || []),
          newSchedule,
        ],
      });
    }
  };

  const removeScheduleSlot = (weekday: number, slotIndex: number) => {
    if (!formData.schedulePreferences) return;

    const updated = formData.schedulePreferences
      .map((sched) => {
        if (sched.weekday === weekday) {
          return {
            ...sched,
            slots: sched.slots.filter((_, idx) => idx !== slotIndex),
          };
        }
        return sched;
      })
      .filter((sched) => sched.slots.length > 0);

    setFormData({ ...formData, schedulePreferences: updated });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Create Student Profile
        </h1>
        <p className="text-gray-600 mt-1">
          Add your child&apos;s information to find the perfect tutor
        </p>
      </div>

      {showProfileError && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-red-800 font-semibold mb-1">
                Parent Profile Required
              </h3>
              <p className="text-red-700 text-sm mb-3">
                You need to create your parent profile first before adding students.
                Please click the button below to create your profile.
              </p>
              <button
                type="button"
                onClick={() => router.push('/parent/profile')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Create My Profile
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowProfileError(false)}
              className="ml-4 text-red-500 hover:text-red-700 font-bold text-xl"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter student name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade Level
              </label>
              <input
                type="text"
                value={formData.gradeLevel}
                onChange={(e) =>
                  setFormData({ ...formData, gradeLevel: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Grade 9, High School"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School
              </label>
              <input
                type="text"
                value={formData.school}
                onChange={(e) =>
                  setFormData({ ...formData, school: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="School name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Grade
              </label>
              <input
                type="text"
                value={formData.grade}
                onChange={(e) =>
                  setFormData({ ...formData, grade: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 9th grade"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Needs
            </label>
            <textarea
              value={formData.specialNeeds}
              onChange={(e) =>
                setFormData({ ...formData, specialNeeds: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Any learning accommodations or special needs"
            />
          </div>
        </section>

        {/* Learning Needs */}
        <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Learning Needs
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Learning Goals
            </label>
            <textarea
              value={formData.learningGoals}
              onChange={(e) =>
                setFormData({ ...formData, learningGoals: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="What do you want your child to achieve? (e.g., improve math grades, prepare for exams)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Additional information about your child"
            />
          </div>
        </section>

        {/* Schedule Preferences */}
        <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Available Schedule
          </h2>

          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day
              </label>
              <select
                value={scheduleInput.weekday}
                onChange={(e) =>
                  setScheduleInput({
                    ...scheduleInput,
                    weekday: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {WEEKDAY_NAMES.map((name, idx) => (
                  <option key={idx} value={idx}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[120px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={scheduleInput.startTime}
                onChange={(e) =>
                  setScheduleInput({
                    ...scheduleInput,
                    startTime: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex-1 min-w-[120px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={scheduleInput.endTime}
                onChange={(e) =>
                  setScheduleInput({
                    ...scheduleInput,
                    endTime: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <button
              type="button"
              onClick={addScheduleSlot}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Add Slot
            </button>
          </div>

          {formData.schedulePreferences &&
            formData.schedulePreferences.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Added Schedule:
                </p>
                {formData.schedulePreferences.map((sched) => (
                  <div key={sched.weekday} className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">
                      {WEEKDAY_NAMES[sched.weekday]}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sched.slots.map((slot, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200"
                        >
                          <span className="text-sm">
                            {slot.start} - {slot.end}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              removeScheduleSlot(sched.weekday, idx)
                            }
                            className="ml-2 text-blue-700 hover:text-blue-900"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </section>

        {/* Mode & Location */}
        <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Tutoring Preferences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Mode
              </label>
              <select
                value={formData.mode || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mode: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select mode</option>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">In-Person</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            {(formData.mode === 'OFFLINE' || formData.mode === 'HYBRID') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.location?.city || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          city: e.target.value,
                        } as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.location?.district || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          city: formData.location?.city || '',
                          district: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your district"
                  />
                </div>
              </>
            )}
          </div>
        </section>

        {/* Budget Range */}
        <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Budget Range
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum (VND/hour)
              </label>
              <input
                type="number"
                min="0"
                value={formData.budgetRange?.min || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budgetRange: {
                      min: parseInt(e.target.value) || 0,
                      max: formData.budgetRange?.max || 0,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum (VND/hour)
              </label>
              <input
                type="number"
                min="0"
                value={formData.budgetRange?.max || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budgetRange: {
                      min: formData.budgetRange?.min || 0,
                      max: parseInt(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="200000"
              />
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createStudent.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createStudent.isPending ? 'Creating...' : 'Create Student Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
