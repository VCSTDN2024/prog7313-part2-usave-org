// Period button selection (stats-style)
const periodButtons = document.querySelectorAll('.period-button');
const periodContents = document.querySelectorAll('.period-content');

periodButtons.forEach(button => {
    button.addEventListener('click', function() {
        periodButtons.forEach(btn => btn.classList.remove('active'));
        periodContents.forEach(content => content.classList.remove('active'));
        this.classList.add('active');
        const periodType = this.dataset.period;
        document.querySelector(`.${periodType}-container`).classList.add('active');
    });
});

// Toggle plus dropdown
function togglePlusDropdown() {
    const dropdown = document.getElementById('plusDropdown');
    dropdown.classList.toggle('active');
}

function navigateTo(page) {
    let pageFile = page.toLowerCase();
    if (pageFile === 'calendar') {
        pageFile = 'calendar.html';
    } else if (pageFile === 'overview') {
        pageFile = 'overview.html';
    } else if (pageFile === 'statistics') {
        pageFile = 'stats.html';
    } else if (pageFile === 'settings') {
        pageFile = 'settings.html';
    } else {
        pageFile = `${pageFile}.html`;
    }
    window.location.href = pageFile;
}

function showActionPage(action) {
    window.location.href = `add_${action}.html`;
    document.getElementById('plusDropdown').classList.remove('active');
}

function fetchTransactions() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.id) {
            console.error("No user logged in");
            return [];
        }
        const userId = currentUser.id;
        
        // Make sure this SQL query includes user_id
        const sql = 'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC';
        const result = window.AndroidDB.query(sql, JSON.stringify([userId]));
        return JSON.parse(result);
    } catch (e) {
        console.error("Error fetching transactions:", e);
        return [];
    }
}

// Group transactions by period for calendar view
function groupTransactionsByPeriod(transactions) {
    const today = new Date().toISOString().slice(0, 10);
    const transactionData = {
        day: [],
        month: {},
        year: []
    };

    transactions.forEach(tx => {
        if (tx.date === today) {
            transactionData.day.push({
                title: tx.name,
                note: tx.notes || '',
                amount: (tx.type === 'expense' ? '- ' : '+ ') + 'R' + Number(tx.amount).toFixed(2),
                isExpense: tx.type === 'expense'
            });
        }

        // Month view: group by week of the month
        const txDate = new Date(tx.date);
        const weekNum = Math.ceil(txDate.getDate() / 7);
        const weekKey = `week${weekNum}`;
        if (!transactionData.month[weekKey]) transactionData.month[weekKey] = [];
        transactionData.month[weekKey].push({
            title: tx.name,
            note: tx.notes || '',
            amount: (tx.type === 'expense' ? '- ' : '+ ') + 'R' + Number(tx.amount).toFixed(2),
            isExpense: tx.type === 'expense'
        });

        // Year view: just collect all
        transactionData.year.push({
            title: tx.name,
            note: tx.notes || '',
            amount: (tx.type === 'expense' ? '- ' : '+ ') + 'R' + Number(tx.amount).toFixed(2),
            isExpense: tx.type === 'expense'
        });
    });

    return transactionData;
}

// Function to render day transactions
function renderDayTransactions() {
    const dayContainer = document.getElementById('day-container');
    const emptyDay = document.getElementById('empty-day');
    dayContainer.innerHTML = '';

    if (window.transactionData.day.length === 0) {
        dayContainer.appendChild(emptyDay);
        return;
    }

    window.transactionData.day.forEach(transaction => {
        const transactionItem = createTransactionElement(transaction);
        dayContainer.appendChild(transactionItem);
    });
}

// Function to render month transactions
function renderMonthTransactions() {
    const monthContainer = document.getElementById('month-container');
    monthContainer.innerHTML = '';

    const monthData = window.transactionData.month;
    if (!monthData || Object.keys(monthData).length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.6)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <p>No transactions this month</p>
        `;
        monthContainer.appendChild(emptyState);
        return;
    }

    for (const weekKey in monthData) {
        if (monthData[weekKey].length > 0) {
            const weekNum = weekKey.replace('week', '');
            const weekSection = document.createElement('div');
            weekSection.className = 'week-section';
            weekSection.dataset.week = weekNum;

            // Create week header
            const weekHeader = document.createElement('div');
            weekHeader.className = 'week-header';
            weekHeader.innerHTML = `
                <div class="week-title">Week ${weekNum}</div>
                <div class="week-date-range">${getWeekDateRange(weekNum)}</div>
            `;
            weekSection.appendChild(weekHeader);

            // Create transactions for this week
            monthData[weekKey].forEach(transaction => {
                const transactionItem = createTransactionElement(transaction);
                weekSection.appendChild(transactionItem);
            });

            monthContainer.appendChild(weekSection);
        }
    }
}

// Function to render year transactions
function renderYearTransactions() {
    const yearContainer = document.getElementById('year-container');
    const emptyYear = document.getElementById('empty-year');
    yearContainer.innerHTML = '';

    if (window.transactionData.year.length === 0) {
        yearContainer.appendChild(emptyYear);
        return;
    }

    window.transactionData.year.forEach(transaction => {
        const transactionItem = createTransactionElement(transaction);
        yearContainer.appendChild(transactionItem);
    });
}

// Helper function to create transaction element
function createTransactionElement(transaction) {
    const transactionElement = document.createElement('div');
    transactionElement.className = 'transaction-item';

    transactionElement.innerHTML = `
        <div class="transaction-info">
            <div class="transaction-icon">
                <svg width="43" height="43" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <filter id="filter_183_602_dd" x="0" y="0" width="43" height="43" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                            <feOffset dx="0" dy="4"/>
                            <feGaussianBlur stdDeviation="1.33333"/>
                            <feComposite in2="hardAlpha" operator="out" k2="-1" k3="1"/>
                            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                            <feBlend mode="normal" in2="BackgroundImageFix" result="effect_dropShadow_1"/>
                            <feBlend mode="normal" in="SourceGraphic" in2="effect_dropShadow_1" result="shape"/>
                        </filter>
                    </defs>
                    <g filter="url(#filter_183_602_dd)">
                        <path id="Bg" d="M21.5 0C31.16 0 39 7.83 39 17.5C39 27.16 31.16 35 21.5 35C11.83 35 4 27.16 4 17.5C4 7.83 11.83 0 21.5 0Z" fill="#FDC500" fill-opacity="1.000000" fill-rule="nonzero"/>
                    </g>
                    <path id="Vector" d="M31 13C31 11.89 30.05 11 28.88 11L14.11 11C12.94 11 12 11.89 12 13L12 15L12 23C12 24.1 12.94 25 14.11 25L28.88 25C30.05 25 31 24.1 31 23L31 15L31 13ZM31 15L12 15M15.16 22L19.38 22" stroke="#000000" stroke-opacity="1.000000" stroke-width="2.000000" stroke-linejoin="round" stroke-linecap="round"/>
                </svg>
            </div>
            <div class="transaction-details">
                <div class="transaction-title">${transaction.title}</div>
                <div class="transaction-note">${transaction.note}</div>
            </div>
        </div>
        <div class="transaction-right">
            <div class="transaction-amount ${transaction.isExpense ? 'expense' : 'income'}">${transaction.amount}</div>
        </div>
    `;

    return transactionElement;
}

// Helper function to get week date range
function getWeekDateRange(weekNum) {
    if (weekNum == 2) {
        return "(8th to the 15th)";
    } else if (weekNum == 3) {
        return "(16th to the 23rd)";
    } else {
        return `(Week ${weekNum})`;
    }
}

// On page load, fetch and render transactions
window.addEventListener('load', function() {
    const transactions = fetchTransactions();
    window.transactionData = groupTransactionsByPeriod(transactions);
    renderDayTransactions();
    renderMonthTransactions();
    renderYearTransactions();
});