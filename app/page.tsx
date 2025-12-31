'use client';

import { Header } from '@/components/Header';
import { FilterPanel } from '@/components/FilterPanel';
import { ProblemTable } from '@/components/ProblemTable';
import { ProblemGrid } from '@/components/ProblemGrid';
import { useProblems } from '@/hooks/useProblems';
import { useFilters } from '@/hooks/useFilters';
import { useProgress } from '@/hooks/useProgress';

export default function Home() {
  const { problems, isLoading, error, retry } = useProblems();
  const {
    filters,
    filteredProblems,
    viewMode,
    setViewMode,
    toggleDivision,
    toggleIndex,
    setSortOrder
  } = useFilters(problems);
  const { getProgress, updateProgress, getDoneCount } = useProgress();

  const doneCount = getDoneCount(filteredProblems);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

      <Header viewMode={viewMode} onViewChange={setViewMode} />

      <main className="max-w-7xl mx-auto px-6 py-6 relative">
        {/* Filters */}
        <section className="mb-6">
          <FilterPanel
            filters={filters}
            problemCount={filteredProblems.length}
            doneCount={doneCount}
            onToggleDivision={toggleDivision}
            onToggleIndex={toggleIndex}
            onSortChange={setSortOrder}
          />
        </section>

        {/* Results */}
        <section className="min-h-[400px]">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-5">
              <div className="w-12 h-12 border-3 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-slate-400">Fetching problems from Codeforces...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16 text-red-400">
              <p>⚠️ {error}</p>
              <button
                onClick={retry}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredProblems.length === 0 && (
            <div className="text-center py-20 text-slate-400 text-lg">
              🔍 No problems found matching your filters.
            </div>
          )}

          {/* Results */}
          {!isLoading && !error && filteredProblems.length > 0 && (
            viewMode === 'list' ? (
              <ProblemTable
                problems={filteredProblems}
                getProgress={getProgress}
                onUpdateProgress={updateProgress}
              />
            ) : (
              <ProblemGrid
                problems={filteredProblems}
                getProgress={getProgress}
                onUpdateProgress={updateProgress}
              />
            )
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-slate-500 text-sm border-t border-slate-800">
        Data from{' '}
        <a href="https://codeforces.com" target="_blank" rel="noopener" className="text-blue-400 hover:underline">
          Codeforces API
        </a>
        {' '}• Built with Next.js + Tailwind
      </footer>
    </div>
  );
}
