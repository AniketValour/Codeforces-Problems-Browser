'use client';

import { Problem, Progress } from '@/types';

interface ProblemGridProps {
    problems: Problem[];
    getProgress: (contestId: number, index: string) => Progress;
    onUpdateProgress: (contestId: number, index: string, updates: Partial<Progress>) => void;
}

function formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

const divisionBadgeColors: { [key: string]: string } = {
    '1': 'bg-red-500/15 border-red-500 text-red-400',
    '2': 'bg-blue-500/15 border-blue-500 text-blue-400',
    '3': 'bg-purple-500/15 border-purple-500 text-purple-400',
    '4': 'bg-green-500/15 border-green-500 text-green-400',
    '1+2': 'bg-gradient-to-r from-red-500/15 to-blue-500/15 border-purple-500 text-purple-400'
};

export function ProblemGrid({ problems, getProgress, onUpdateProgress }: ProblemGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {problems.map(problem => {
                const progress = getProgress(problem.contestId, problem.index);
                return (
                    <div
                        key={`${problem.contestId}_${problem.index}`}
                        className={`bg-gradient-to-br from-slate-800/90 to-slate-900/95 border rounded-xl p-5 
                       transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10
                       ${progress.done ? 'border-green-500 bg-gradient-to-br from-green-500/10 to-slate-900/95' : 'border-slate-700 hover:border-blue-500'}`}
                    >
                        {/* Checkbox Row */}
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
                            <input
                                type="checkbox"
                                id={`done-${problem.contestId}-${problem.index}`}
                                checked={progress.done}
                                onChange={e => onUpdateProgress(problem.contestId, problem.index, { done: e.target.checked })}
                                className="w-5 h-5 rounded-md bg-slate-700 border-2 border-slate-600 text-green-500 
                         focus:ring-green-500 focus:ring-offset-slate-800 cursor-pointer
                         checked:bg-green-500 checked:border-green-500"
                            />
                            <label
                                htmlFor={`done-${problem.contestId}-${problem.index}`}
                                className="text-sm text-slate-400 cursor-pointer"
                            >
                                Mark as done
                            </label>
                        </div>

                        {/* Header */}
                        <div className="flex justify-between items-start gap-3 mt-4">
                            <div className="flex-1 min-w-0">
                                <h3 className={`font-semibold text-white leading-tight ${progress.done ? 'line-through opacity-70' : ''}`}>
                                    {problem.name}
                                </h3>
                                <p className="text-sm text-slate-400 mt-1 truncate" title={problem.contestName}>
                                    {problem.contestName.length > 40 ? problem.contestName.slice(0, 40) + '...' : problem.contestName}
                                </p>
                            </div>
                            <span className="w-9 h-9 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-sm flex-shrink-0">
                                {problem.index}
                            </span>
                        </div>

                        {/* Notes */}
                        <div className="mt-4">
                            <textarea
                                value={progress.notes}
                                onChange={e => onUpdateProgress(problem.contestId, problem.index, { notes: e.target.value })}
                                placeholder="Add notes..."
                                rows={2}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white 
                         placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                            />
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${divisionBadgeColors[problem.division]}`}>
                                {problem.division === '1+2' ? 'Div 1+2' : `Div ${problem.division}`}
                            </span>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-700">
                            <span className="text-sm text-slate-500">{formatDate(problem.startTime)}</span>
                            <a
                                href={problem.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Open Problem →
                            </a>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
