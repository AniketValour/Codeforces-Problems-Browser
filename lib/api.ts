// API helper functions for Codeforces

import { Contest, Problem } from '@/types';

const API_ENDPOINTS = {
    contests: 'https://codeforces.com/api/contest.list',
    problems: 'https://codeforces.com/api/problemset.problems'
};

/**
 * Parse division from contest name
 */
function parseDivision(contestName: string): string | null {
    const name = contestName.toLowerCase();

    if (name.includes('div. 1 + div. 2') || name.includes('div. 1+div. 2') ||
        name.includes('div.1 + div.2') || name.includes('(div. 1 + div. 2)')) {
        return '1+2';
    }
    if (name.includes('div. 4') || name.includes('(div.4)') || name.includes('div 4')) return '4';
    if (name.includes('div. 3') || name.includes('(div.3)') || name.includes('div 3')) return '3';
    if (name.includes('div. 2') || name.includes('(div.2)') || name.includes('div 2')) return '2';
    if (name.includes('div. 1') || name.includes('(div.1)') || name.includes('div 1')) return '1';
    if (name.includes('educational')) return '2';
    if (name.includes('global round')) return '1+2';

    return null;
}

/**
 * Fetch contests and problems from Codeforces API
 */
export async function fetchProblems(): Promise<Problem[]> {
    const [contestsRes, problemsRes] = await Promise.all([
        fetch(API_ENDPOINTS.contests),
        fetch(API_ENDPOINTS.problems)
    ]);

    if (!contestsRes.ok || !problemsRes.ok) {
        throw new Error('Failed to fetch data from Codeforces API');
    }

    const contestsData = await contestsRes.json();
    const problemsData = await problemsRes.json();

    if (contestsData.status !== 'OK' || problemsData.status !== 'OK') {
        throw new Error('API returned error status');
    }

    // Process contests into a map
    const contestsMap: { [id: number]: Contest } = {};
    contestsData.result
        .filter((c: Contest) => c.phase === 'FINISHED')
        .forEach((contest: Contest) => {
            contestsMap[contest.id] = {
                ...contest,
                division: parseDivision(contest.name)
            };
        });

    // Process problems with contest data
    const problems: Problem[] = problemsData.result.problems
        .filter((problem: { contestId: number }) => {
            const contest = contestsMap[problem.contestId];
            return contest && contest.division;
        })
        .map((problem: { contestId: number; index: string; name: string; rating?: number; tags?: string[] }) => {
            const contest = contestsMap[problem.contestId];
            return {
                ...problem,
                contestName: contest.name,
                division: contest.division!,
                startTime: contest.startTimeSeconds,
                link: `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`
            };
        });

    return problems;
}
