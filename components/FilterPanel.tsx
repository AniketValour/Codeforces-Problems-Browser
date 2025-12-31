'use client';

import { FilterState } from '@/types';

interface FilterPanelProps {
    filters: FilterState;
    problemCount: number;
    doneCount: number;
    onToggleDivision: (division: string) => void;
    onToggleIndex: (index: string) => void;
    onSortChange: (order: 'newest' | 'oldest') => void;
}

const DIVISIONS = ['1', '2', '3', '4', '1+2'];
const INDICES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const divisionColors: { [key: string]: string } = {
    '1': 'bg-red-500 border-red-500 shadow-red-500/30',
    '2': 'bg-blue-500 border-blue-500 shadow-blue-500/30',
    '3': 'bg-purple-500 border-purple-500 shadow-purple-500/30',
    '4': 'bg-green-500 border-green-500 shadow-green-500/30',
    '1+2': 'bg-gradient-to-r from-red-500 to-blue-500 border-transparent'
};

export function FilterPanel({
    filters,
    problemCount,
    doneCount,
    onToggleDivision,
    onToggleIndex,
    onSortChange
}: FilterPanelProps) {
    return (
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/95 border border-slate-700 rounded-xl p-6 backdrop-blur-lg">
            <div className="flex flex-wrap gap-8 items-start">
                {/* Division Filters */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Division</h3>
                    <div className="flex flex-wrap gap-2">
                        {DIVISIONS.map(div => (
                            <button
                                key={div}
                                onClick={() => onToggleDivision(div)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${filters.divisions.includes(div)
                                        ? `${divisionColors[div]} text-white shadow-lg`
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-blue-500 hover:text-white'
                                    }`}
                            >
                                {div === '1+2' ? 'Div 1+2' : `Div ${div}`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Index Filters */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Problem Index</h3>
                    <div className="flex flex-wrap gap-2">
                        {INDICES.map(idx => (
                            <button
                                key={idx}
                                onClick={() => onToggleIndex(idx)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${filters.indices.includes(idx)
                                        ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-blue-500 hover:text-white'
                                    }`}
                            >
                                {idx}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sort */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sort By Date</h3>
                    <div className="flex gap-2">
                        {(['newest', 'oldest'] as const).map(order => (
                            <button
                                key={order}
                                onClick={() => onSortChange(order)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${filters.sortOrder === order
                                        ? 'bg-slate-700 border-blue-500 text-blue-400'
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-blue-500'
                                    }`}
                            >
                                {order === 'newest' ? 'Newest First' : 'Oldest First'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="ml-auto flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                    <span className="text-slate-400 text-sm">
                        <strong className="text-blue-400">{problemCount}</strong> problems
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400 text-sm">
                        <strong className="text-green-400">{doneCount}</strong> done
                    </span>
                </div>
            </div>
        </div>
    );
}
