/**
 * CF Problem Browser - Main Application (v2)
 * Fetches and displays Codeforces problems with filtering
 * v2: Added progress tracking with LocalStorage persistence
 */

// =========================================
// Configuration & State
 
const API_ENDPOINTS = {
    contests: 'https://codeforces.com/api/contest.list',
    problems: 'https://codeforces.com/api/problemset.problems'
};

const STORAGE_KEY = 'cf_problem_browser_progress';

const state = {
    contests: [],
    problems: [],
    filteredProblems: [],
    selectedDivisions: ['2'],
    selectedIndices: ['B'],
    sortOrder: 'newest',
    currentView: 'list',
    progress: {} // { "contestId_index": { done: bool, notes: string } }
};

// =========================================
// DOM Elements
 
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
    progressStats: document.getElementById('progressStats'),
    divisionFilters: document.getElementById('divisionFilters'),
    indexFilters: document.getElementById('indexFilters')
};

// =========================================
// LocalStorage Functions 

/**
 * Load progress from LocalStorage
 */
function loadProgress() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            state.progress = JSON.parse(saved);
            console.log(`Loaded progress for ${Object.keys(state.progress).length} problems`);
        }
    } catch (e) {
        console.error('Failed to load progress:', e);
        state.progress = {};
    }
}

/**
 * Save progress to LocalStorage
 */
function saveProgress() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
    } catch (e) {
        console.error('Failed to save progress:', e);
    }
}

/**
 * Get problem key for storage
 */
function getProblemKey(contestId, index) {
    return `${contestId}_${index}`;
}

/**
 * Get progress for a problem
 */
function getProgress(contestId, index) {
    const key = getProblemKey(contestId, index);
    return state.progress[key] || { done: false, notes: '' };
}

/**
 * Update progress for a problem
 */
function updateProgress(contestId, index, updates) {
    const key = getProblemKey(contestId, index);
    state.progress[key] = {
        ...getProgress(contestId, index),
        ...updates,
        updatedAt: Date.now()
    };
    saveProgress();
    updateProgressStats();
}

// =========================================
// Utility Functions
 

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
// API Functions
 

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

    // Update counts
    updateProblemCount();
    updateProgressStats();

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

/**
 * Update progress stats display
 */
function updateProgressStats() {
    // Count done problems in current filtered view
    const doneCount = state.filteredProblems.filter(p => {
        const progress = getProgress(p.contestId, p.index);
        return progress.done;
    }).length;

    const doneCountEl = elements.progressStats.querySelector('.done-count');
    if (doneCountEl) {
        doneCountEl.textContent = doneCount;
    }
}

// =========================================
// Render Functions
 

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
    const html = state.filteredProblems.map(problem => {
        const progress = getProgress(problem.contestId, problem.index);
        const rowClass = progress.done ? 'row-done' : '';
        const checkedAttr = progress.done ? 'checked' : '';
        const notesValue = escapeHtml(progress.notes || '');

        return `
        <tr class="${rowClass}" data-contest-id="${problem.contestId}" data-index="${problem.index}">
            <td class="done-checkbox">
                <input type="checkbox" ${checkedAttr} onchange="handleDoneChange(${problem.contestId}, '${problem.index}', this.checked)">
            </td>
            <td>${escapeHtml(problem.name)}</td>
            <td title="${escapeHtml(problem.contestName)}">${escapeHtml(truncate(problem.contestName, 35))}</td>
            <td><span class="division-badge ${getDivisionClass(problem.division)}">${getDivisionText(problem.division)}</span></td>
            <td><span class="index-badge">${problem.index}</span></td>
            <td>${formatDate(problem.startTime)}</td>
            <td>
                <input type="text" class="notes-input" placeholder="Add notes..." 
                    value="${notesValue}"
                    onchange="handleNotesChange(${problem.contestId}, '${problem.index}', this.value)">
            </td>
            <td>
                <a href="${problem.link}" target="_blank" rel="noopener" class="link-btn">
                    Open →
                </a>
            </td>
        </tr>
    `}).join('');

    elements.problemsTableBody.innerHTML = html;
}

/**
 * Render card view
 */
function renderCardView() {
    const html = state.filteredProblems.map(problem => {
        const progress = getProgress(problem.contestId, problem.index);
        const cardClass = progress.done ? 'card-done' : '';
        const checkedAttr = progress.done ? 'checked' : '';
        const notesValue = escapeHtml(progress.notes || '');

        return `
        <div class="problem-card ${cardClass}" data-contest-id="${problem.contestId}" data-index="${problem.index}">
            <div class="problem-card-actions">
                <div class="card-checkbox">
                    <input type="checkbox" id="done-${problem.contestId}-${problem.index}" ${checkedAttr} 
                        onchange="handleDoneChange(${problem.contestId}, '${problem.index}', this.checked)">
                    <label for="done-${problem.contestId}-${problem.index}">Done</label>
                </div>
            </div>
            <div class="problem-card-header">
                <div>
                    <div class="problem-card-title">${escapeHtml(problem.name)}</div>
                    <div class="problem-card-contest">${escapeHtml(truncate(problem.contestName, 45))}</div>
                </div>
                <span class="index-badge">${problem.index}</span>
            </div>
            <div class="card-notes">
                <textarea class="card-notes-input" placeholder="Add notes..." 
                    onchange="handleNotesChange(${problem.contestId}, '${problem.index}', this.value)">${notesValue}</textarea>
            </div>
            <div class="problem-card-meta">
                <span class="division-badge ${getDivisionClass(problem.division)}">${getDivisionText(problem.division)}</span>
            </div>
            <div class="problem-card-footer">
                <span class="problem-card-date">${formatDate(problem.startTime)}</span>
                <a href="${problem.link}" target="_blank" rel="noopener" class="problem-card-link" onclick="event.stopPropagation()">Open Problem →</a>
            </div>
        </div>
    `}).join('');

    elements.problemsCardGrid.innerHTML = html;
}

// =========================================
// Progress Event Handlers
 

/**
 * Handle done checkbox change
 */
function handleDoneChange(contestId, index, done) {
    updateProgress(contestId, index, { done });

    // Update row/card styling
    const selector = `[data-contest-id="${contestId}"][data-index="${index}"]`;
    const element = document.querySelector(selector);

    if (element) {
        if (state.currentView === 'list') {
            element.classList.toggle('row-done', done);
        } else {
            element.classList.toggle('card-done', done);
        }
    }
}

/**
 * Handle notes input change
 */
function handleNotesChange(contestId, index, notes) {
    updateProgress(contestId, index, { notes });
}

// Make handlers globally available
window.handleDoneChange = handleDoneChange;
window.handleNotesChange = handleNotesChange;

// =========================================
// UI State Functions
 

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
 

function init() {
    // Load saved progress
    loadProgress();

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
