// Function to toggle plus dropdown
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

// Fetch transactions for the current user, most recent first
function fetchTransactions() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.id) return [];
        const userId = currentUser.id;
        const sql = 'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, id DESC LIMIT 10';
        const result = window.AndroidDB.query(sql, JSON.stringify([userId]));
        return JSON.parse(result);
    } catch (e) {
        return [];
    }
}

// Render transactions in the overview page
function renderTransactions() {
    const transactionsContainer = document.querySelector('.transactions-container');
    // Remove all transaction items and empty states
    Array.from(transactionsContainer.querySelectorAll('.transaction-item, .empty-state')).forEach(el => el.remove());

    const transactions = fetchTransactions();

    if (transactions.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-state';
        emptyDiv.style.color = 'white';
        emptyDiv.style.textAlign = 'center';
        emptyDiv.style.marginTop = '30px';
        emptyDiv.innerHTML = `<p>No transactions yet.</p>`;
        transactionsContainer.appendChild(emptyDiv);
        return;
    }

    transactions.forEach(tx => {
        const transactionItem = document.createElement('div');
        transactionItem.className = 'transaction-item';
        transactionItem.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-icon">
                    <svg width="40" height="40" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <filter id="filter_transaction" x="0" y="0" width="68" height="68" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                                <feOffset dy="4"/>
                                <feGaussianBlur stdDeviation="1.33333"/>
                                <feComposite in2="hardAlpha" operator="out" k2="-1" k3="1"/>
                                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                                <feBlend mode="normal" in2="BackgroundImageFix" result="effect_dropShadow_1"/>
                                <feBlend mode="normal" in="SourceGraphic" in2="effect_dropShadow_1" result="shape"/>
                            </filter>
                        </defs>
                        <g filter="url(#filter_transaction)">
                            <path d="M34 0C50.56 0 64 13.43 64 30C64 46.56 50.56 60 34 60C17.43 60 4 46.56 4 30C4 13.43 17.43 0 34 0Z" fill="#FDC500"/>
                        </g>
                        <path d="M49.5 21.5C49.5 19.56 47.93 18 46 18L21.5 18C19.56 18 18 19.56 18 21.5L18 25L18 39C18 40.93 19.56 42.5 21.5 42.5L46 42.5C47.93 42.5 49.5 40.93 49.5 39L49.5 25L49.5 21.5ZM49.5 25L18 25M23.25 37.25L30.25 37.25" stroke="#000000" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
                    </svg>
                </div>
                <div class="transaction-details">
                    <p class="transaction-title">${tx.name || tx.title || '(No Title)'}</p>
                    <p class="transaction-date">${formatDate(tx.date)}</p>
                </div>
            </div>
            <div class="transaction-right">
                <p class="transaction-amount ${tx.type === 'income' ? 'income' : 'expense'}">
                    ${tx.type === 'income' ? '+' : '-'}R${Number(tx.amount).toLocaleString()}
                </p>
                <p class="transaction-second-date">${formatDate(tx.date)}</p>
            </div>
        `;
        transactionsContainer.appendChild(transactionItem);
    });
}

// Format date as readable string
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}


function updateBudgetBars(availablePercentage = 55, goalPercentage = 63) {
    const availableBar = document.querySelector('.budget-card:nth-child(1) .progress-bar');
    const goalBar = document.querySelector('.budget-card:nth-child(2) .progress-bar');
    if (availableBar) availableBar.style.width = `${availablePercentage}%`;
    if (goalBar) goalBar.style.width = `${goalPercentage}%`;
}

// On page load, render transactions and update budget bars
window.addEventListener('DOMContentLoaded', function() {
    renderTransactions();
    updateBudgetBars();
});