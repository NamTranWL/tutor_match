'use client';

import { useState } from 'react';
import { useTutorListQuery } from '@/shared/services/api/queries/useTutor.query';
import Link from 'next/link';
import type { TutorProfile } from '@/shared/types/api/tutor';

export default function ParentSearchPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    mode: '' as '' | 'online' | 'offline' | 'hybrid',
    minRate: '',
    maxRate: '',
    sort: 'rating' as 'rating' | 'price_asc' | 'price_desc' | 'newest' | 'oldest',
  });

  const { data, isLoading } = useTutorListQuery({
    current: currentPage,
    pageSize: 12,
    ...(filters.mode && { mode: filters.mode }),
    ...(filters.minRate && { minRate: Number(filters.minRate) }),
    ...(filters.maxRate && { maxRate: Number(filters.maxRate) }),
    sort: filters.sort,
  });

  const tutors = data?.results || [];
  const totalPages = data?.totalPages || 1;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Find Tutors</h1>
        <p className="text-gray-600 mt-1">
          Browse our qualified tutors and find the perfect match for your student
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teaching Mode
            </label>
            <select
              value={filters.mode}
              onChange={(e) => {
                setFilters({ ...filters, mode: e.target.value as any });
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Modes</option>
              <option value="online">Online</option>
              <option value="offline">In-Person</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Rate (VND/hr)
            </label>
            <input
              type="number"
              value={filters.minRate}
              onChange={(e) => {
                setFilters({ ...filters, minRate: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="50000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Rate (VND/hr)
            </label>
            <input
              type="number"
              value={filters.maxRate}
              onChange={(e) => {
                setFilters({ ...filters, maxRate: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="200000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={filters.sort}
              onChange={(e) => {
                setFilters({ ...filters, sort: e.target.value as any });
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="rating">Highest Rating</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => {
            setFilters({
              mode: '',
              minRate: '',
              maxRate: '',
              sort: 'rating',
            });
            setCurrentPage(1);
          }}
          className="mt-4 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : tutors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
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
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {tutors.length} of {data?.total || 0} tutors
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {tutors.map((tutor) => (
              <TutorCard key={tutor._id} tutor={tutor} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TutorCard({ tutor }: { tutor: TutorProfile }) {
  return (
    <Link href={`/parent/tutors/${tutor._id}`}>
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {tutor.headline || 'Professional Tutor'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {tutor.ratingAvg !== undefined && (
                <div className="flex items-center text-yellow-500">
                  <svg
                    className="h-4 w-4 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-900">
                    {tutor.ratingAvg.toFixed(1)}
                  </span>
                  {tutor.ratingCount !== undefined && (
                    <span className="ml-1 text-sm text-gray-600">
                      ({tutor.ratingCount})
                    </span>
                  )}
                </div>
              )}
              {tutor.isVerified && (
                <span className="px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 rounded border border-green-200">
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {tutor.bio && (
          <p className="text-sm text-gray-600 line-clamp-2">{tutor.bio}</p>
        )}

        <div className="space-y-2">
          {tutor.yearsExp !== undefined && (
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
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>{tutor.yearsExp} years experience</span>
            </div>
          )}

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
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span className="capitalize">{tutor.mode}</span>
          </div>

          <div className="flex items-center text-sm font-semibold text-blue-600">
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
            <span>{tutor.hourlyRate.toLocaleString()} {tutor.currency}/hr</span>
          </div>
        </div>

        <button className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
          View Profile →
        </button>
      </div>
    </Link>
  );
}
