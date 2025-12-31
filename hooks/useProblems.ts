'use client';

import { useState, useEffect } from 'react';
import { Problem } from '@/types';
import { fetchProblems } from '@/lib/api';

export function useProblems() {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadProblems();
    }, []);

    const loadProblems = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchProblems();
            setProblems(data);
        } catch (e) {
            console.error('Failed to fetch problems:', e);
            setError('Failed to load problems from Codeforces API');
        } finally {
            setIsLoading(false);
        }
    };

    return { problems, isLoading, error, retry: loadProblems };
}
