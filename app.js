/**
 * CF Problem Browser - Main Application
 * Fetches and displays Codeforces problems with filtering
 */

// =========================================
// Configuration & State
// =========================================
const API_ENDPOINTS = {
    contests: 'https://codeforces.com/api/contest.list',
    problems: 'https://codeforces.com/api/problemset.problems'
};

const state = {
    contests: [],
    problems: [],
    filteredProblems: [],
    selectedDivisions: ['2'],
    selectedIndices: ['B'],
    sortOrder: 'newest',
    currentView: 'list'
};

// =========================================
// DOM Elements
// =========================================
const elements = {
    listViewBtn: document.getElementById('listViewBtn'),
    cardViewBtn: document.getElementById('cardViewBtn'),
    listView: document.getElementById('listView'),
    cardView: document.getElementById('cardView'),
    loadingState: document.getElementById('loadingState'),
    errorState: document.getElementById('errorState'),
    emptyState: document.getElementById('emptyState'),
    retryBtn: document.getElementById('retryBtn'),
    problemsTableBody: document.getElementById('problemsTableBody'),
    problemsCardGrid: document.getElementById('problemsCardGrid'),
    problemCount: document.getElementById('problemCount'),
    divisionFilters: document.getElementById('divisionFilters'),
    indexFilters: document.getElementById('indexFilters')
};

// =========================================
// Utility Functions
// =========================================

/**
 * Parse division from contest name
 */
function parseDivision(contestName) {
    const name = contestName.toLowerCase();

    // Check for combined Div 1 + Div 2
    if (name.includes('div. 1 + div. 2') || name.includes('div. 1+div. 2') ||
        name.includes('div.1 + div.2') || name.includes('(div. 1 + div. 2)')) {
        return '1+2';
    }

    // Check for Div 4
    if (name.includes('div. 4') || name.includes('(div.4)') || name.includes('div 4')) {
        return '4';
    }

    // Check for Div 3
    if (name.includes('div. 3') || name.includes('(div.3)') || name.includes('div 3')) {
        return '3';
    }

    // Check for Div 2
    if (name.includes('div. 2') || name.includes('(div.2)') || name.includes('div 2')) {
        return '2';
    }

    // Check for Div 1
    if (name.includes('div. 1') || name.includes('(div.1)') || name.includes('div 1')) {
        return '1';
    }

    // Educational rounds are typically Div 2
    if (name.includes('educational')) {
        return '2';
    }

    // Global rounds are typically Div 1+2
    if (name.includes('global round')) {
        return '1+2';
    }

    return null;
}

/**
 * Format timestamp to readable date
 */
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Get division badge class
 */
function getDivisionClass(division) {
    const classMap = {
        '1': 'div-1',
        '2': 'div-2',
        '3': 'div-3',
        '4': 'div-4',
        '1+2': 'div-1-2'
    };
    return classMap[division] || '';
}

/**
 * Get division display text
 */
function getDivisionText(division) {
    return division === '1+2' ? 'Div 1+2' : `Div ${division}`;
}

// =========================================
// API Functions
// =========================================

/**
 * Fetch data from Codeforces API
 */
async function fetchData() {
    showLoading();

    try {
        // Fetch contests and problems in parallel
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

        // Process contests
        state.contests = contestsData.result
            .filter(c => c.phase === 'FINISHED')
            .reduce((acc, contest) => {
                acc[contest.id] = {
                    ...contest,
                    division: parseDivision(contest.name)
                };
                return acc;
            }, {});

        // Process problems with contest data
        state.problems = problemsData.result.problems
            .filter(problem => {
                const contest = state.contests[problem.contestId];
                return contest && contest.division;
            })
            .map(problem => {
                const contest = state.contests[problem.contestId];
                return {
                    ...problem,
                    contestName: contest.name,
                    division: contest.division,
                    startTime: contest.startTimeSeconds,
                    link: `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`
                };
            });

        console.log(`Loaded ${state.problems.length} problems from ${Object.keys(state.contests).length} contests`);

        applyFilters();
        hideLoading();

    } catch (error) {
        console.error('Error fetching data:', error);
        showError();
    }
}

// =========================================
// Filter Functions
// =========================================

/**
 * Apply all filters and update display
 */
function applyFilters() {
    // Filter by division and index
    state.filteredProblems = state.problems.filter(problem => {
        const divisionMatch = state.selectedDivisions.includes(problem.division);
        const indexMatch = state.selectedIndices.includes(problem.index);
        return divisionMatch && indexMatch;
    });

    // Sort by date
    state.filteredProblems.sort((a, b) => {
        return state.sortOrder === 'newest'
            ? b.startTime - a.startTime
            : a.startTime - b.startTime;
    });

    // Update count
    updateProblemCount();

    // Render based on current view
    renderProblems();
}

/**
 * Update problem count display
 */
function updateProblemCount() {
    const count = state.filteredProblems.length;
    elements.problemCount.innerHTML = `<strong>${count}</strong> problem${count !== 1 ? 's' : ''} found`;
}

// =========================================
// Render Functions
// =========================================

/**
 * Render problems based on current view
 */
function renderProblems() {
    if (state.filteredProblems.length === 0) {
        elements.listView.classList.add('hidden');
        elements.cardView.classList.add('hidden');
        elements.emptyState.classList.remove('hidden');
        return;
    }

    elements.emptyState.classList.add('hidden');

    if (state.currentView === 'list') {
        renderListView();
        elements.listView.classList.remove('hidden');
        elements.cardView.classList.add('hidden');
    } else {
        renderCardView();
        elements.cardView.classList.remove('hidden');
        elements.listView.classList.add('hidden');
    }
}

/**
 * Render list/table view
 */
function renderListView() {
    const html = state.filteredProblems.map(problem => `
        <tr>
            <td>${escapeHtml(problem.name)}</td>
            <td title="${escapeHtml(problem.contestName)}">${escapeHtml(truncate(problem.contestName, 40))}</td>
            <td><span class="division-badge ${getDivisionClass(problem.division)}">${getDivisionText(problem.division)}</span></td>
            <td><span class="index-badge">${problem.index}</span></td>
            <td>${formatDate(problem.startTime)}</td>
            <td>
                <a href="${problem.link}" target="_blank" rel="noopener" class="link-btn">
                    Open →
                </a>
            </td>
        </tr>
    `).join('');

    elements.problemsTableBody.innerHTML = html;
}

/**
 * Render card view
 */
function renderCardView() {
    const html = state.filteredProblems.map(problem => `
        <a href="${problem.link}" target="_blank" rel="noopener" class="problem-card">
            <div class="problem-card-header">
                <div>
                    <div class="problem-card-title">${escapeHtml(problem.name)}</div>
                    <div class="problem-card-contest">${escapeHtml(truncate(problem.contestName, 50))}</div>
                </div>
                <span class="index-badge">${problem.index}</span>
            </div>
            <div class="problem-card-meta">
                <span class="division-badge ${getDivisionClass(problem.division)}">${getDivisionText(problem.division)}</span>
            </div>
            <div class="problem-card-footer">
                <span class="problem-card-date">${formatDate(problem.startTime)}</span>
                <span class="problem-card-link">Open Problem →</span>
            </div>
        </a>
    `).join('');

    elements.problemsCardGrid.innerHTML = html;
}

/**
 * Truncate text with ellipsis
 */
function truncate(str, maxLength) {
    if (str.length <= maxLength) return str;
    return str.substr(0, maxLength - 3) + '...';
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// =========================================
// UI State Functions
// =========================================

function showLoading() {
    elements.loadingState.classList.remove('hidden');
    elements.errorState.classList.add('hidden');
    elements.listView.classList.add('hidden');
    elements.cardView.classList.add('hidden');
    elements.emptyState.classList.add('hidden');
}

function hideLoading() {
    elements.loadingState.classList.add('hidden');
}

function showError() {
    elements.loadingState.classList.add('hidden');
    elements.errorState.classList.remove('hidden');
}

// =========================================
// Event Handlers
// =========================================

/**
 * Handle division filter clicks
 */
function handleDivisionClick(event) {
    const chip = event.target.closest('.chip[data-division]');
    if (!chip) return;

    const division = chip.dataset.division;

    // Toggle selection
    chip.classList.toggle('active');

    if (chip.classList.contains('active')) {
        if (!state.selectedDivisions.includes(division)) {
            state.selectedDivisions.push(division);
        }
    } else {
        state.selectedDivisions = state.selectedDivisions.filter(d => d !== division);
    }

    applyFilters();
}

/**
 * Handle index filter clicks
 */
function handleIndexClick(event) {
    const chip = event.target.closest('.chip[data-index]');
    if (!chip) return;

    const index = chip.dataset.index;

    // Toggle selection
    chip.classList.toggle('active');

    if (chip.classList.contains('active')) {
        if (!state.selectedIndices.includes(index)) {
            state.selectedIndices.push(index);
        }
    } else {
        state.selectedIndices = state.selectedIndices.filter(i => i !== index);
    }

    applyFilters();
}

/**
 * Handle sort button clicks
 */
function handleSortClick(event) {
    const btn = event.target.closest('.sort-btn');
    if (!btn) return;

    const sort = btn.dataset.sort;
    state.sortOrder = sort;

    // Update active state
    document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    applyFilters();
}

/**
 * Handle view toggle
 */
function handleViewToggle(view) {
    state.currentView = view;

    // Update button states
    elements.listViewBtn.classList.toggle('active', view === 'list');
    elements.cardViewBtn.classList.toggle('active', view === 'card');

    // Re-render
    renderProblems();
}

// =========================================
// Initialization
// =========================================

function init() {
    // View toggle handlers
    elements.listViewBtn.addEventListener('click', () => handleViewToggle('list'));
    elements.cardViewBtn.addEventListener('click', () => handleViewToggle('card'));

    // Filter handlers
    elements.divisionFilters.addEventListener('click', handleDivisionClick);
    elements.indexFilters.addEventListener('click', handleIndexClick);

    // Sort handlers
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', handleSortClick);
    });

    // Retry handler
    elements.retryBtn.addEventListener('click', fetchData);

    // Fetch initial data
    fetchData();
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
