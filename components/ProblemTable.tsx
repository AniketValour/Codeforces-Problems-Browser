'use client';

import { Problem, Progress } from '@/types';

interface ProblemTableProps {
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

export function ProblemTable({ problems, getProgress, onUpdateProgress }: ProblemTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                <thead className="bg-slate-900">
                    <tr>
                        <th className="w-16 px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400 text-center">Done</th>
                        <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400 text-left">Problem</th>
                        <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400 text-left">Contest</th>
                        <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400 text-left">Division</th>
                        <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400 text-left">Index</th>
                        <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400 text-left">Date</th>
                        <th className="w-48 px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400 text-left">Notes</th>
                        <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-400 text-left">Link</th>
                    </tr>
                </thead>
                <tbody>
                    {problems.map(problem => {
                        const progress = getProgress(problem.contestId, problem.index);
                        return (
                            <tr
                                key={`${problem.contestId}_${problem.index}`}
                                className={`border-t border-slate-700 transition-colors hover:bg-slate-700/50 ${progress.done ? 'bg-green-500/5' : ''
                                    }`}
                            >
                                <td className="px-4 py-4 text-center">
                                    <input
                                        type="checkbox"
                                        checked={progress.done}
                                        onChange={e => onUpdateProgress(problem.contestId, problem.index, { done: e.target.checked })}
                                        className="w-5 h-5 rounded-md bg-slate-700 border-2 border-slate-600 text-green-500 
                             focus:ring-green-500 focus:ring-offset-slate-800 cursor-pointer
                             checked:bg-green-500 checked:border-green-500"
                                    />
                                </td>
                                <td className={`px-4 py-4 font-medium text-white ${progress.done ? 'line-through opacity-70' : ''}`}>
                                    {problem.name}
                                </td>
                                <td className="px-4 py-4 text-slate-400 max-w-[200px] truncate" title={problem.contestName}>
                                    {problem.contestName.length > 35 ? problem.contestName.slice(0, 35) + '...' : problem.contestName}
                                </td>
                                <td className="px-4 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${divisionBadgeColors[problem.division]}`}>
                                        {problem.division === '1+2' ? 'Div 1+2' : `Div ${problem.division}`}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-sm">
                                        {problem.index}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-slate-400 text-sm">
                                    {formatDate(problem.startTime)}
                                </td>
                                <td className="px-4 py-4">
                                    <input
                                        type="text"
                                        value={progress.notes}
                                        onChange={e => onUpdateProgress(problem.contestId, problem.index, { notes: e.target.value })}
                                        placeholder="Add notes..."
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white 
                             placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </td>
                                <td className="px-4 py-4">
                                    <a
                                        href={problem.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 border border-blue-500 text-blue-400 rounded-lg text-sm font-medium
                             hover:bg-blue-500 hover:text-white transition-colors inline-block"
                                    >
                                        Open →
                                    </a>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
