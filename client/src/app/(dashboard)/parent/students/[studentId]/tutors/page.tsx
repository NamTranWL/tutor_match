'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useStudentDetail } from '@/shared/services/api/queries/useStudent.query';
import { useTutorList } from '@/shared/services/api/queries/useTutor.query';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { TutorListParams } from '@/shared/types/api/tutor';

export default function StudentTutorSearchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const studentId = params.studentId as string;

  const { data: student } = useStudentDetail(studentId);
  
  // Initialize filters from student profile or URL
  const [filters, setFilters] = useState<TutorListParams>({
    mode: searchParams.get('mode') as any || undefined,
    minRate: searchParams.get('minRate') ? Number(searchParams.get('minRate')) : undefined,
    maxRate: searchParams.get('maxRate') ? Number(searchParams.get('maxRate')) : undefined,
    sort: (searchParams.get('sort') as any) || 'rating',
    current: Number(searchParams.get('page')) || 1,
    pageSize: 12,
  });



  const { data: tutorData, isLoading } = useTutorList(filters);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.mode) params.set('mode', filters.mode);
    if (filters.minRate) params.set('minRate', filters.minRate.toString());
    if (filters.maxRate) params.set('maxRate', filters.maxRate.toString());
    if (filters.sort && filters.sort !== 'rating') params.set('sort', filters.sort);
    if (filters.current && filters.current > 1) params.set('page', filters.current.toString());
    
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.replace(`/parent/students/${studentId}/tutors${newUrl}`, { scroll: false });
  }, [filters, studentId, router]);

  const tutors = tutorData?.results || [];
  const totalPages = tutorData?.totalPages || 1;

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <Link href="/parent/students" className="hover:underline">
            Students
          </Link>
          <span className="mx-2">{'>'}</span>
          <Link
            href={`/parent/students/${studentId}`}
            className="hover:underline"
          >
            {student?.fullName || 'Student'}
          </Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-gray-900">Find Tutors</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900">
          Find Tutors for {student?.fullName}
        </h1>
        <p className="text-gray-600 mt-1">
          Browse and filter tutors based on your requirements
        </p>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-6 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Filters</h3>
              
              {/* Mode Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode
                </label>
                <select
                  value={filters.mode || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, mode: e.target.value as any, current: 1 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All</option>
                  <option value="online">Online</option>
                  <option value="offline">In-Person</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (VND/hr)
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minRate || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        minRate: e.target.value ? Number(e.target.value) : undefined,
                        current: 1,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxRate || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        maxRate: e.target.value ? Number(e.target.value) : undefined,
                        current: 1,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sort || 'rating'}
                  onChange={(e) =>
                    setFilters({ ...filters, sort: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="rating">Highest Rating</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              <button
                onClick={() =>
                  setFilters({
                    sort: 'rating',
                    current: 1,
                    pageSize: 12,
                  })
                }
                className="w-full mt-4 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </aside>

        {/* Tutors Grid */}
        <main className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : tutors.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tutors found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters to see more results
              </p>
              <button
                onClick={() =>
                  setFilters({
                    sort: 'rating',
                    current: 1,
                    pageSize: 12,
                  })
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Found {tutors.length} tutor{tutors.length !== 1 ? 's' : ''}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tutors.map((tutor) => (
                  <TutorCard key={tutor._id} tutor={tutor} studentId={studentId} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <button
                    disabled={filters.current === 1}
                    onClick={() =>
                      setFilters({ ...filters, current: (filters.current || 1) - 1 })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Page {filters.current} of {totalPages}
                  </span>
                  <button
                    disabled={filters.current === totalPages}
                    onClick={() =>
                      setFilters({ ...filters, current: (filters.current || 1) + 1 })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function TutorCard({ tutor, studentId }: { tutor: any; studentId: string }) {
  return (
    <Link href={`/parent/tutors/${tutor._id}?studentId=${studentId}`}>
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow p-6 h-full cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">
              {tutor.userId?.name || 'Tutor'}
            </h3>
            {tutor.headline && (
              <p className="text-sm text-gray-600 mt-1">{tutor.headline}</p>
            )}
          </div>
          {tutor.isVerified && (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
              Verified
            </span>
          )}
        </div>

        <div className="space-y-2 text-sm">
          {tutor.yearsExp && (
            <div className="text-gray-600">{tutor.yearsExp} years experience</div>
          )}
          
          <div className="flex items-center">
            <span className="text-yellow-400 mr-1">★</span>
            <span className="font-medium text-gray-900">
              {tutor.ratingAvg?.toFixed(1) || 'New'}
            </span>
            {tutor.ratingCount > 0 && (
              <span className="text-gray-600 ml-1">
                ({tutor.ratingCount})
              </span>
            )}
          </div>

          <div className="font-semibold text-blue-600">
            {tutor.hourlyRate.toLocaleString()} VND/hr
          </div>

          {tutor.mode && (
            <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
              {tutor.mode}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
