'use client';

import { useState, useMemo } from 'react';
import { Problem, FilterState, ViewMode } from '@/types';

export function useFilters(problems: Problem[]) {
    const [filters, setFilters] = useState<FilterState>({
        divisions: ['2'],
        indices: ['B'],
        sortOrder: 'newest'
    });
    const [viewMode, setViewMode] = useState<ViewMode>('list');

    const filteredProblems = useMemo(() => {
        let result = problems.filter(problem => {
            const divisionMatch = filters.divisions.includes(problem.division);
            const indexMatch = filters.indices.includes(problem.index);
            return divisionMatch && indexMatch;
        });

        result.sort((a, b) => {
            return filters.sortOrder === 'newest'
                ? b.startTime - a.startTime
                : a.startTime - b.startTime;
        });

        return result;
    }, [problems, filters]);

    const toggleDivision = (division: string) => {
        setFilters(prev => ({
            ...prev,
            divisions: prev.divisions.includes(division)
                ? prev.divisions.filter(d => d !== division)
                : [...prev.divisions, division]
        }));
    };

    const toggleIndex = (index: string) => {
        setFilters(prev => ({
            ...prev,
            indices: prev.indices.includes(index)
                ? prev.indices.filter(i => i !== index)
                : [...prev.indices, index]
        }));
    };

    const setSortOrder = (order: 'newest' | 'oldest') => {
        setFilters(prev => ({ ...prev, sortOrder: order }));
    };

    return {
        filters,
        filteredProblems,
        viewMode,
        setViewMode,
        toggleDivision,
        toggleIndex,
        setSortOrder
    };
}
