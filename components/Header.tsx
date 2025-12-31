'use client';

import { ViewMode } from '@/types';

interface HeaderProps {
    viewMode: ViewMode;
    onViewChange: (mode: ViewMode) => void;
}

export function Header({ viewMode, onViewChange }: HeaderProps) {
    return (
        <header className="sticky top-0 z-50 bg-slate-900/85 backdrop-blur-xl border-b border-slate-700">
            <div className="max-w-7xl mx-auto px-6 h-[70px] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-2xl animate-pulse">⚡</span>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                        CF Problem Browser
                    </h1>
                </div>

                <div className="flex gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                    <button
                        onClick={() => onViewChange('list')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'list'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                        title="List View"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="8" y1="6" x2="21" y2="6" />
                            <line x1="8" y1="12" x2="21" y2="12" />
                            <line x1="8" y1="18" x2="21" y2="18" />
                            <line x1="3" y1="6" x2="3.01" y2="6" />
                            <line x1="3" y1="12" x2="3.01" y2="12" />
                            <line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onViewChange('card')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'card'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                        title="Card View"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
}
