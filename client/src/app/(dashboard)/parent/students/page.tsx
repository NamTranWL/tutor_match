'use client';

import { useSession } from 'next-auth/react';
import { useParentProfileByUser } from '@/shared/services/api/queries/useProfile.query';
import { useStudentsByParent } from '@/shared/services/api/queries/useStudent.query';
import Link from 'next/link';
import type { StudentProfile } from '@/shared/types/api/student';

export default function ParentStudentsPage() {
  const { data: session } = useSession();
  const { data: parentProfile, isLoading: parentLoading } =
    useParentProfileByUser(session?.user?._id as string | undefined);
  const { data: students, isLoading: studentsLoading } = useStudentsByParent(
    parentProfile?._id,
  );

  // Show loading if parent is loading, or if parent exists but students are still loading
  const isLoading = parentLoading || (parentProfile && studentsLoading);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-44 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const hasStudents = students && students.length > 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Student Profiles
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your children&apos;s learning profiles
          </p>
        </div>
        <Link
          href="/parent/students/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg
            className="mr-2 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Student Profile
        </Link>
      </div>

      {!hasStudents ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-16">
          <div className="flex flex-col items-center justify-center text-center">
            <svg
              className="h-16 w-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No students yet
            </h3>
            <p className="text-gray-600 max-w-sm mb-6">
              Create your first student profile to start searching for tutors
              and managing tutoring sessions.
            </p>
            <Link
              href="/parent/students/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Student Profile
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <StudentCard key={student._id} student={student} />
          ))}
        </div>
      )}
    </div>
  );
}

function StudentCard({ student }: { student: StudentProfile }) {
  const subjects =
    student.subjectsNeeded
      ?.map((s) => (typeof s === 'string' ? s : s.name))
      .slice(0, 3) || [];
  const hasMore = (student.subjectsNeeded?.length || 0) > 3;

  return (
    <Link href={`/parent/students/${student._id}`}>
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {student.fullName || 'Unnamed Student'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {student.gradeLevel || student.grade || 'Grade not specified'}
            </p>
          </div>
          {student.mode && (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
              {student.mode}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {subjects.length > 0 && (
            <div>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <svg
                  className="h-4 w-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <span>Subjects</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {subjects.map((subject, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200"
                  >
                    {subject}
                  </span>
                ))}
                {hasMore && (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-50 text-gray-700 rounded border border-gray-200">
                    +{(student.subjectsNeeded?.length || 0) - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {student.location && (
            <div className="flex items-center text-sm text-gray-600">
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>
                {student.location.city}
                {student.location.district && `, ${student.location.district}`}
              </span>
            </div>
          )}

          {student.budgetRange && (
            <div className="flex items-center text-sm text-gray-600">
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                {student.budgetRange.min.toLocaleString()} -{' '}
                {student.budgetRange.max.toLocaleString()} VND/hr
              </span>
            </div>
          )}

          <button className="w-full mt-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors">
            View Details →
          </button>
        </div>
      </div>
    </Link>
  );
}
