// Set default date to today
const today = new Date();
document.getElementById('expense-date').valueAsDate = today;

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

// Format money input
const amountInput = document.getElementById('expense-amount');
amountInput.addEventListener('input', function(e) {
    let value = this.value.replace(/[^0-9]/g, '');
    if (value) {
        value = parseFloat(value) / 100;
        this.value = 'R' + value.toFixed(2);
    } else {
        this.value = '';
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
    const name = document.getElementById('expense-name').value;
    const amount = parseFloat(document.getElementById('expense-amount').value.replace(/[^0-9.]/g, ''));
    const category = document.querySelector('.category-option.active')?.textContent || '';
    const date = document.getElementById('expense-date').value;
    const notes = document.getElementById('expense-notes').value;
    const recurring = document.getElementById('recurring-expense').checked ? 1 : 0;

    if (!name || isNaN(amount) || !date) {
        alert('Please fill in all required fields.');
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userId = currentUser?.id;

    const sql = `INSERT INTO transactions (user_id, type, name, amount, category, date, notes, recurring)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [userId, 'expense', name, amount, category, date, notes, recurring];
    window.AndroidDB.execute(sql, JSON.stringify(params));

    showSuccessAndRedirect('Expense added successfully!');
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