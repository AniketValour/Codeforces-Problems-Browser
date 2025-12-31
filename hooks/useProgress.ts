'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProgressMap, Progress } from '@/types';

const STORAGE_KEY = 'cf_problem_browser_progress';

export function useProgress() {
    const [progress, setProgress] = useState<ProgressMap>({});
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setProgress(JSON.parse(saved));
            }
        } catch (e) {
            console.error('Failed to load progress:', e);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever progress changes
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
            } catch (e) {
                console.error('Failed to save progress:', e);
            }
        }
    }, [progress, isLoaded]);

    const getProgress = useCallback((contestId: number, index: string): Progress => {
        const key = `${contestId}_${index}`;
        return progress[key] || { done: false, notes: '' };
    }, [progress]);

    const updateProgress = useCallback((contestId: number, index: string, updates: Partial<Progress>) => {
        const key = `${contestId}_${index}`;
        setProgress(prev => ({
            ...prev,
            [key]: {
                ...prev[key] || { done: false, notes: '' },
                ...updates,
                updatedAt: Date.now()
            }
        }));
    }, []);

    const getDoneCount = useCallback((problems: { contestId: number; index: string }[]): number => {
        return problems.filter(p => getProgress(p.contestId, p.index).done).length;
    }, [getProgress]);

    return { progress, getProgress, updateProgress, getDoneCount, isLoaded };
}
