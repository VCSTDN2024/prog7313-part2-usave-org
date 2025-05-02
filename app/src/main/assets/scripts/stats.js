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
// Group transactions by period (day, month, year)
function groupTransactions(transactions, period) {
    const now = new Date();
    let filtered = [];
    if (period === 'day') {
        const today = now.toISOString().slice(0, 10);
        filtered = transactions.filter(tx => tx.date === today);
    } else if (period === 'month') {
        const month = now.getMonth();
        const year = now.getFullYear();
        filtered = transactions.filter(tx => {
            const d = new Date(tx.date);
            return d.getMonth() === month && d.getFullYear() === year;
        });
    } else if (period === 'year') {
        const year = now.getFullYear();
        filtered = transactions.filter(tx => (new Date(tx.date)).getFullYear() === year);
    }
    return filtered;
}

// Prepare chart data for Chart.js
function prepareChartData(transactions, period) {
    if (period === 'day') {
        // Group by hour
        const hours = Array.from({length: 24}, (_, i) => i);
        const incomeData = Array(24).fill(0);
        const expenseData = Array(24).fill(0);
        transactions.forEach(tx => {
            const hour = new Date(tx.date).getHours();
            if (tx.type === 'income') incomeData[hour] += Number(tx.amount);
            if (tx.type === 'expense') expenseData[hour] += Number(tx.amount);
        });
        return {
            labels: hours.map(h => `${h}:00`),
            incomeData,
            expenseData
        };
    } else if (period === 'month') {
        // Group by week of month
        const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
        const incomeData = Array(5).fill(0);
        const expenseData = Array(5).fill(0);
        transactions.forEach(tx => {
            const date = new Date(tx.date);
            const week = Math.min(Math.floor((date.getDate() - 1) / 7), 4);
            if (tx.type === 'income') incomeData[week] += Number(tx.amount);
            if (tx.type === 'expense') expenseData[week] += Number(tx.amount);
        });
        return {
            labels: weeks,
            incomeData,
            expenseData
        };
    } else if (period === 'year') {
        // Group by month
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const incomeData = Array(12).fill(0);
        const expenseData = Array(12).fill(0);
        transactions.forEach(tx => {
            const date = new Date(tx.date);
            const month = date.getMonth();
            if (tx.type === 'income') incomeData[month] += Number(tx.amount);
            if (tx.type === 'expense') expenseData[month] += Number(tx.amount);
        });
        return {
            labels: months,
            incomeData,
            expenseData
        };
    }
    return { labels: [], incomeData: [], expenseData: [] };
}

// Calculate total income and expenses
function calculateTotals(transactions) {
    let income = 0, expense = 0;
    transactions.forEach(tx => {
        if (tx.type === 'income') income += Number(tx.amount);
        if (tx.type === 'expense') expense += Number(tx.amount);
    });
    return { income, expense };
}

let financialChart;
let currentPeriod = 'year';

// Initialize Chart and Stats
function initStats() {
    let transactions = fetchTransactions();
    updateStatsAndChart(transactions, currentPeriod);

    // Period button event listeners
    document.querySelectorAll('.period-button').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.period-button').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentPeriod = this.dataset.period;
            updateStatsAndChart(transactions, currentPeriod);
        });
    });
}

function updateStatsAndChart(transactions, period) {
    const periodTx = groupTransactions(transactions, period);
    const chartData = prepareChartData(periodTx, period);
    const totals = calculateTotals(periodTx);

    // Update stats cards
    document.querySelector('.income-value').textContent = 'R' + totals.income.toLocaleString();
    document.querySelector('.expense-value').textContent = 'R' + totals.expense.toLocaleString();

    // Draw or update chart
    if (!financialChart) {
        const ctx = document.getElementById('financialChart').getContext('2d');
        financialChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: 'Income',
                        data: chartData.incomeData,
                        borderColor: 'rgba(16, 185, 129, 1)',
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(58, 90, 64, 0.56)',
                        pointBorderColor: 'rgba(16, 185, 129, 1)',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        tension: 0.3
                    },
                    {
                        label: 'Expenses',
                        data: chartData.expenseData,
                        borderColor: 'rgba(239, 68, 68, 1)',
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(58, 90, 64, 0.56)',
                        pointBorderColor: 'rgba(239, 68, 68, 1)',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        titleColor: '#333',
                        bodyColor: '#333',
                        bodyFont: { size: 12 },
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) label += ': ';
                                if (context.parsed.y !== null) {
                                    label += 'R' + context.parsed.y;
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(13.81, 4.14, 4.14, 0.3)',
                            borderDash: [5, 5]
                        },
                        ticks: {
                            color: 'rgba(245, 245, 245, 1)',
                            callback: function(value) {
                                return 'R' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: 'rgba(245, 245, 245, 1)' }
                    }
                }
            }
        });
    } else {
        financialChart.data.labels = chartData.labels;
        financialChart.data.datasets[0].data = chartData.incomeData;
        financialChart.data.datasets[1].data = chartData.expenseData;
        financialChart.update();
    }
}

// Toggle plus dropdown
function togglePlusDropdown() {
    const dropdown = document.getElementById('plusDropdown');
    dropdown.classList.toggle('active');
}

// Function to navigate to different pages
function navigateTo(page) {
    // Normalize page name to lowercase and handle special case for 'calendar'
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

window.addEventListener('load', initStats);