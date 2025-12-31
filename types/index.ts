// TypeScript types for CF Problem Browser

export interface Contest {
    id: number;
    name: string;
    type: string;
    phase: string;
    startTimeSeconds: number;
    division: string | null;
}

export interface Problem {
    contestId: number;
    index: string;
    name: string;
    rating?: number;
    tags?: string[];
    contestName: string;
    division: string;
    startTime: number;
    link: string;
}

export interface Progress {
    done: boolean;
    notes: string;
    updatedAt?: number;
}

export interface ProgressMap {
    [key: string]: Progress;
}

export interface FilterState {
    divisions: string[];
    indices: string[];
    sortOrder: 'newest' | 'oldest';
}

export type ViewMode = 'list' | 'card';
