// Fetch and update balance card values
function updateBalanceCard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userId = currentUser?.id;
    if (!userId || !window.AndroidDB) return;

    // Query for totals
    const sql = `
        SELECT 
            SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as totalIncome,
            SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as totalExpense
        FROM transactions WHERE user_id = ?
    `;
    window.AndroidDB.query(sql, JSON.stringify([userId]), function(result) {
        let totalIncome = 0, totalExpense = 0;
        try {
            const row = JSON.parse(result)[0];
            totalIncome = row.totalIncome || 0;
            totalExpense = row.totalExpense || 0;
        } catch {}
        const balance = totalIncome - totalExpense;
        document.querySelector('.balance-amount').textContent = 'R' + balance.toLocaleString(undefined, {minimumFractionDigits: 2});
        document.querySelector('.income-amount').textContent = 'R' + totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2});
        document.querySelector('.expense-amount').textContent = 'R' + totalExpense.toLocaleString(undefined, {minimumFractionDigits: 2});
    });
}

// Category selection
const categoryOptions = document.querySelectorAll('.category-option');
let activeCategory = null;

categoryOptions.forEach(option => {
    option.addEventListener('click', function() {
        if (this === activeCategory) return;
        if (activeCategory) activeCategory.classList.remove('active');
        this.classList.add('active');
        activeCategory = this;
        if (this.dataset.category === 'custom') {
            const customCategory = prompt('Enter custom category name:');
            if (customCategory && customCategory.trim() !== '') {
                this.textContent = customCategory;
            } else {
                this.classList.remove('active');
                activeCategory = null;
            }
        }
    });
});

// Set default dates (today and +30 days)
const today = new Date();
const thirtyDaysLater = new Date();
thirtyDaysLater.setDate(today.getDate() + 30);

document.getElementById('start-date').valueAsDate = today;
document.getElementById('end-date').valueAsDate = thirtyDaysLater;

// Format money input
const budgetInput = document.getElementById('budget-amount');
budgetInput.addEventListener('input', function(e) {
    let value = this.value.replace(/[^0-9]/g, '');
    if (value) {
        value = parseFloat(value) / 100;
        this.value = 'R   ' + value.toFixed(2);
    } else {
        this.value = 'R   0.00';
    }
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

document.querySelector('.add-btn').addEventListener('click', function() {
    const amount = parseFloat(document.getElementById('budget-amount').value.replace(/[^0-9.]/g, ''));
    const category = document.querySelector('.category-option.active')?.textContent || '';
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    if (isNaN(amount) || !category || !startDate || !endDate) {
        alert('Please fill in all required fields.');
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userId = currentUser?.id;

    // Store the budget as a transaction of type 'budget'
    const sql = `INSERT INTO transactions (user_id, type, name, amount, category, date, notes, recurring)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    // Use startDate as the main date, and store endDate in notes for reference
    const params = [userId, 'budget', 'Budget', amount, category, startDate, `End: ${endDate}`, 0];
    window.AndroidDB.execute(sql, JSON.stringify(params));
    showSuccessAndRedirect('Budget added successfully!');
});

function showSuccessAndRedirect(message) {
    let successDiv = document.createElement('div');
    successDiv.textContent = message;
    successDiv.style.position = 'fixed';
    successDiv.style.top = '50%';
    successDiv.style.left = '50%';
    successDiv.style.transform = 'translate(-50%, -50%)';
    successDiv.style.background = '#52c41a';
    successDiv.style.color = 'white';
    successDiv.style.padding = '20px 40px';
    successDiv.style.borderRadius = '10px';
    successDiv.style.fontSize = '20px';
    successDiv.style.zIndex = '9999';
    document.body.appendChild(successDiv);

    setTimeout(() => {
        successDiv.remove();
        window.location.href = 'overview.html';
    }, 2000);
}

// Update balance card on page load
window.addEventListener('DOMContentLoaded', updateBalanceCard);