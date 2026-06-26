// State Management
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let budgetLimit = parseFloat(localStorage.getItem('budgetLimit')) || 0;
let currentTheme = localStorage.getItem('theme') || 'light';

// DOM Elements
const form = document.getElementById('transactionForm');
const list = document.getElementById('transactionList');
const totalExpensesEl = document.getElementById('totalExpenses');
const budgetInput = document.getElementById('budgetLimit');
const saveBudgetBtn = document.getElementById('saveBudgetBtn');
const budgetStatus = document.getElementById('budgetStatus');
const themeToggle = document.getElementById('themeToggle');
const sortInput = document.getElementById('sortInput');
const chartContainer = document.getElementById('chartContainer');
const summaryCard = document.querySelector('.summary-card');

// Inisialisasi Aplikasi
function init() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeButton();
    budgetInput.value = budgetLimit || '';
    renderApp();
}

// Render Keseluruhan UI
function renderApp() {
    updateBalanceAndBudget();
    renderTransactions();
    renderChart();
    saveData();
}

// Format Rupiah (Sederhana)
function formatMoney(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
}

// Tambah Transaksi
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const desc = document.getElementById('descInput').value;
    const amount = parseFloat(document.getElementById('amountInput').value);
    const category = document.getElementById('categoryInput').value;

    const transaction = {
        id: generateID(),
        desc,
        amount,
        category,
        date: new Date().getTime()
    };

    transactions.push(transaction);
    form.reset();
    renderApp();
});

// Generate ID Acak
function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// Hapus Transaksi
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    renderApp();
}

// Update Saldo & Peringatan Limit
function updateBalanceAndBudget() {
    const total = transactions.reduce((acc, curr) => acc + curr.amount, 0);
    totalExpensesEl.innerText = formatMoney(total);

    if (budgetLimit > 0) {
        if (total > budgetLimit) {
            summaryCard.classList.add('over-budget-card');
            totalExpensesEl.parentElement.classList.add('over-budget');
            budgetStatus.innerText = `⚠️ Melebihi budget sebesar ${formatMoney(total - budgetLimit)}`;
            budgetStatus.style.color = 'var(--danger-color)';
        } else {
            summaryCard.classList.remove('over-budget-card');
            totalExpensesEl.parentElement.classList.remove('over-budget');
            budgetStatus.innerText = `Sisa budget: ${formatMoney(budgetLimit - total)}`;
            budgetStatus.style.color = 'var(--success-color)';
        }
    } else {
        budgetStatus.innerText = "Budget belum diatur.";
        budgetStatus.style.color = "var(--text-color)";
    }
}

// Visualisasi Chart Sederhana (Vanilla JS)
function renderChart() {
    chartContainer.innerHTML = '';
    const total = transactions.reduce((acc, curr) => acc + curr.amount, 0);
    if (total === 0) {
        chartContainer.innerHTML = '<p style="text-size:0.9rem; color: #888;">Belum ada data pengeluaran.</p>';
        return;
    }

    // Kelompokkan berdasarkan kategori
    const categoryTotals = {};
    transactions.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    // Buat elemen Bar
    for (const [category, amount] of Object.entries(categoryTotals)) {
        const percentage = Math.round((amount / total) * 100);
        
        const row = document.createElement('div');
        row.classList.add('bar-row');
        row.innerHTML = `
            <div class="bar-label">${category}</div>
            <div class="bar-track">
                <div class="bar-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="bar-value">${percentage}%</div>
        `;
        chartContainer.appendChild(row);
    }
}

// Render & Sort Daftar Transaksi
function renderTransactions() {
    list.innerHTML = '';
    let sortedTransactions = [...transactions];
    const sortVal = sortInput.value;

    if (sortVal === 'amountHigh') {
        sortedTransactions.sort((a, b) => b.amount - a.amount);
    } else if (sortVal === 'amountLow') {
        sortedTransactions.sort((a, b) => a.amount - b.amount);
    } else if (sortVal === 'category') {
        sortedTransactions.sort((a, b) => a.category.localeCompare(b.category));
    } else {
        // newest default
        sortedTransactions.sort((a, b) => b.date - a.date);
    }

    sortedTransactions.forEach(t => {
        const li = document.createElement('li');
        li.classList.add('transaction-item');
        li.innerHTML = `
            <div class="t-info">
                <span>${t.desc}</span>
                <span class="t-category">${t.category}</span>
            </div>
            <div>
                <span class="t-amount">${formatMoney(t.amount)}</span>
                <button class="delete-btn" onclick="deleteTransaction(${t.id})">×</button>
            </div>
        `;
        list.appendChild(li);
    });
}

// Event Listeners Tambahan
saveBudgetBtn.addEventListener('click', () => {
    budgetLimit = parseFloat(budgetInput.value) || 0;
    renderApp();
});

sortInput.addEventListener('change', renderTransactions);

themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeButton();
});

function updateThemeButton() {
    themeToggle.innerText = currentTheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
}

// Simpan ke LocalStorage
function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('budgetLimit', budgetLimit);
}

// Jalankan saat load
init();