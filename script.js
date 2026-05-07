/* ================================================
   InvenPro — Inventory Management System
   script.js — Complete Application Logic
   ================================================ */

"use strict";

/* ================================================
   STATE & STORAGE
   ================================================ */

const APP_KEYS = {
  products:  'invenpro_products',
  sales:     'invenpro_sales',
  movements: 'invenpro_movements',
  settings:  'invenpro_settings',
  profile:   'invenpro_profile',
  session:   'invenpro_session'
};

// Default demo data
const DEFAULT_PRODUCTS = [
  { id: 'p1', name: 'Laptop Pro 15',      category: 'Electronics', stock: 24, price: 75999, sku: 'ELC-001', supplier: 'TechHub', desc: 'High performance laptop', image: '', createdAt: new Date().toISOString() },
  { id: 'p2', name: 'Wireless Mouse',     category: 'Electronics', stock: 5,  price: 1299,  sku: 'ELC-002', supplier: 'TechHub', desc: 'Ergonomic wireless mouse', image: '', createdAt: new Date().toISOString() },
  { id: 'p3', name: 'Office Chair',       category: 'Furniture',   stock: 12, price: 8999,  sku: 'FUR-001', supplier: 'FurnCo', desc: 'Ergonomic office chair', image: '', createdAt: new Date().toISOString() },
  { id: 'p4', name: 'A4 Notebooks (10)',  category: 'Stationery',  stock: 0,  price: 149,   sku: 'STA-001', supplier: 'StationMart', desc: 'Pack of 10 ruled notebooks', image: '', createdAt: new Date().toISOString() },
  { id: 'p5', name: 'Blue Denim Jeans',   category: 'Clothing',    stock: 38, price: 1599,  sku: 'CLO-001', supplier: 'FashionWorld', desc: 'Slim-fit denim jeans', image: '', createdAt: new Date().toISOString() },
  { id: 'p6', name: 'Basmati Rice 5kg',   category: 'Food',        stock: 7,  price: 649,   sku: 'FOD-001', supplier: 'FoodLink', desc: 'Premium aged basmati rice', image: '', createdAt: new Date().toISOString() },
  { id: 'p7', name: '27" Monitor 4K',     category: 'Electronics', stock: 9,  price: 32999, sku: 'ELC-003', supplier: 'TechHub', desc: '4K UHD gaming monitor', image: '', createdAt: new Date().toISOString() },
  { id: 'p8', name: 'Wooden Desk 120cm',  category: 'Furniture',   stock: 3,  price: 12499, sku: 'FUR-002', supplier: 'FurnCo', desc: 'Solid wood work desk', image: '', createdAt: new Date().toISOString() },
];

const DEFAULT_SALES = [
  { id: 's1', productId:'p1', productName:'Laptop Pro 15', category:'Electronics', qty:2, price:75999, total:151998, customer:'Riya Singh', date: getDateStr(3) },
  { id: 's2', productId:'p5', productName:'Blue Denim Jeans', category:'Clothing', qty:5, price:1599, total:7995, customer:'Arjun Mehta', date: getDateStr(2) },
  { id: 's3', productId:'p3', productName:'Office Chair', category:'Furniture', qty:1, price:8999, total:8999, customer:'Sandeep Corp', date: getDateStr(1) },
  { id: 's4', productId:'p7', productName:'27" Monitor 4K', category:'Electronics', qty:1, price:32999, total:32999, customer:'Walk-in', date: getDateStr(0) },
  { id: 's5', productId:'p6', productName:'Basmati Rice 5kg', category:'Food', qty:10, price:649, total:6490, customer:'Pooja Stores', date: getDateStr(0) },
];

const DEFAULT_MOVEMENTS = [
  { id:'m1', productId:'p1', productName:'Laptop Pro 15', type:'in',  qty:10, reason:'Initial stock', by:'Admin', date:getDateStr(7) },
  { id:'m2', productId:'p1', productName:'Laptop Pro 15', type:'out', qty:2,  reason:'Sale order',    by:'Admin', date:getDateStr(3) },
  { id:'m3', productId:'p4', productName:'A4 Notebooks',  type:'out', qty:50, reason:'Consumed',      by:'Admin', date:getDateStr(2) },
];

const DEFAULT_SETTINGS = {
  darkMode: false,
  compact: false,
  lowStockThreshold: 10,
  lowStockAlerts: true,
  salesAlerts: true
};

const DEFAULT_PROFILE = {
  name: 'Admin User',
  username: 'admin',
  email: 'admin@invenpro.com',
  phone: '+91 9876543210',
  bio: 'System Administrator for InvenPro Inventory Management.',
  password: 'admin123'
};

function getDateStr(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

// Load or init storage
function loadStorage(key, defaultVal) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultVal;
  } catch { return defaultVal; }
}

function saveStorage(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

// Initialize data if not present
if (!localStorage.getItem(APP_KEYS.products))  saveStorage(APP_KEYS.products,  DEFAULT_PRODUCTS);
if (!localStorage.getItem(APP_KEYS.sales))     saveStorage(APP_KEYS.sales,     DEFAULT_SALES);
if (!localStorage.getItem(APP_KEYS.movements)) saveStorage(APP_KEYS.movements, DEFAULT_MOVEMENTS);
if (!localStorage.getItem(APP_KEYS.settings))  saveStorage(APP_KEYS.settings,  DEFAULT_SETTINGS);
if (!localStorage.getItem(APP_KEYS.profile))   saveStorage(APP_KEYS.profile,   DEFAULT_PROFILE);

// App state
let state = {
  products:   loadStorage(APP_KEYS.products,  DEFAULT_PRODUCTS),
  sales:      loadStorage(APP_KEYS.sales,     DEFAULT_SALES),
  movements:  loadStorage(APP_KEYS.movements, DEFAULT_MOVEMENTS),
  settings:   loadStorage(APP_KEYS.settings,  DEFAULT_SETTINGS),
  profile:    loadStorage(APP_KEYS.profile,   DEFAULT_PROFILE),
  editingProductId: null,
  deleteProductId:  null,
  charts: {}
};

/* ================================================
   UTILITIES
   ================================================ */

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatCurrency(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

function getCategoryIcon(cat) {
  const icons = {
    Electronics: 'fa-microchip',
    Clothing:    'fa-shirt',
    Food:        'fa-utensils',
    Furniture:   'fa-couch',
    Stationery:  'fa-pen',
    Other:       'fa-box'
  };
  return icons[cat] || 'fa-box';
}

function getStockStatus(stock, threshold) {
  const t = threshold || state.settings.lowStockThreshold || 10;
  if (stock === 0)      return { label: 'Out of Stock', cls: 'status-out' };
  if (stock < t)        return { label: 'Low Stock',    cls: 'status-low' };
  return                       { label: 'In Stock',     cls: 'status-ok'  };
}

/* ================================================
   TOAST NOTIFICATIONS
   ================================================ */

function showToast(msg, type = 'success', duration = 3500) {
  const icons = { success:'fa-check-circle', error:'fa-times-circle', warning:'fa-exclamation-triangle', info:'fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type]}"></i>
    <span>${msg}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <i class="fa-solid fa-xmark"></i>
    </button>`;
  document.getElementById('toastContainer').appendChild(toast);
  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

/* ================================================
   LOADING SCREEN
   ================================================ */

function initLoadingScreen() {
  const screen = document.getElementById('loadingScreen');
  const msgs = ['Initializing system...', 'Loading products...', 'Setting up charts...', 'Ready!'];
  let i = 0;
  const txt = screen.querySelector('.loader-text');
  const interval = setInterval(() => {
    i++;
    if (i < msgs.length) txt.textContent = msgs[i];
  }, 550);

  setTimeout(() => {
    clearInterval(interval);
    screen.classList.add('fade-out');
    setTimeout(() => {
      screen.remove();
      checkSession();
    }, 600);
  }, 2400);
}

/* ================================================
   AUTH / SESSION
   ================================================ */

function checkSession() {
  const session = loadStorage(APP_KEYS.session, null);
  if (session && session.loggedIn) {
    showApp();
  } else {
    showLogin();
  }
}

function showLogin() {
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('appLayout').classList.add('hidden');
}

function showApp() {
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('appLayout').classList.remove('hidden');
  initApp();
}

// Login Form
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  let valid = true;

  // Clear errors
  document.getElementById('usernameError').textContent = '';
  document.getElementById('passwordError').textContent = '';

  if (!username) {
    document.getElementById('usernameError').textContent = 'Username is required.';
    valid = false;
  }
  if (!password) {
    document.getElementById('passwordError').textContent = 'Password is required.';
    valid = false;
  }
  if (!valid) return;

  const profile = state.profile;
  const isValid = username === profile.username && password === profile.password;

  if (!isValid) {
    document.getElementById('passwordError').textContent = 'Invalid username or password.';
    document.getElementById('loginBtn').classList.add('shake');
    setTimeout(() => document.getElementById('loginBtn').classList.remove('shake'), 500);
    return;
  }

  // Save session
  saveStorage(APP_KEYS.session, { loggedIn: true, username });
  showToast('Welcome back, ' + username + '!', 'success');
  showApp();
});

// Show/hide password
document.getElementById('togglePass').addEventListener('click', function() {
  const input = document.getElementById('loginPassword');
  const icon  = document.getElementById('eyeIcon');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fa-solid fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fa-solid fa-eye';
  }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', function() {
  saveStorage(APP_KEYS.session, { loggedIn: false });
  showToast('Logged out successfully.', 'info');
  showLogin();
});

/* ================================================
   APP INIT
   ================================================ */

function initApp() {
  updateUserUI();
  setCurrentDate();
  applySettings();
  navigateTo('dashboard');
  initNotifications();
  initGlobalSearch();
}

function updateUserUI() {
  const name = state.profile.name || 'Admin';
  const initial = name.charAt(0).toUpperCase();
  document.getElementById('sidebarAvatar').textContent   = initial;
  document.getElementById('topbarAvatar').textContent    = initial;
  document.getElementById('profileAvatarDisplay').textContent = initial;
  document.getElementById('sidebarUsername').textContent = state.profile.username || 'admin';
  document.getElementById('topbarUsername').textContent  = (name.split(' ')[0]) || 'Admin';
  document.getElementById('dashGreetName').textContent   = name.split(' ')[0] || 'Admin';
}

function setCurrentDate() {
  const now = new Date();
  document.getElementById('currentDate').textContent =
    now.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

/* ================================================
   NAVIGATION
   ================================================ */

function navigateTo(pageId) {
  // Deactivate all
  document.querySelectorAll('.app-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));

  // Activate target
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  const navItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
  if (navItem) navItem.classList.add('active');

  // Render page content
  const renderers = {
    dashboard: renderDashboard,
    products:  renderProducts,
    inventory: renderInventory,
    sales:     renderSales,
    profile:   renderProfile,
    settings:  renderSettings,
  };
  if (renderers[pageId]) renderers[pageId]();

  // Close sidebar on mobile
  if (window.innerWidth <= 900) closeSidebar();
}

// Nav item clicks
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    navigateTo(this.dataset.page);
  });
});

// Sidebar toggle
document.getElementById('menuToggle').addEventListener('click', openSidebar);
document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);

function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('active');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('active');
}

/* ================================================
   NOTIFICATIONS
   ================================================ */

function initNotifications() {
  buildNotifList();
  document.getElementById('notifBtn').addEventListener('click', function(e) {
    e.stopPropagation();
    document.getElementById('notifPanel').classList.toggle('show');
  });
  document.getElementById('clearNotifs').addEventListener('click', function() {
    document.getElementById('notifList').innerHTML = '<div class="empty-state"><i class="fa-solid fa-bell-slash"></i><p>No notifications</p></div>';
    document.getElementById('notifBadge').textContent = '0';
    document.getElementById('notifPanel').classList.remove('show');
  });
  document.addEventListener('click', function(e) {
    if (!document.getElementById('notifPanel').contains(e.target) &&
        !document.getElementById('notifBtn').contains(e.target)) {
      document.getElementById('notifPanel').classList.remove('show');
    }
  });
}

function buildNotifList() {
  const threshold = state.settings.lowStockThreshold;
  const lowItems  = state.products.filter(p => p.stock > 0 && p.stock < threshold);
  const outItems  = state.products.filter(p => p.stock === 0);
  const notifs = [];

  outItems.forEach(p => notifs.push({ type:'danger', icon:'fa-ban', text:`<strong>${p.name}</strong> is out of stock!`, time:'Now' }));
  lowItems.forEach(p => notifs.push({ type:'warning', icon:'fa-triangle-exclamation', text:`<strong>${p.name}</strong> has only ${p.stock} units left`, time:'Now' }));
  notifs.push({ type:'info', icon:'fa-info-circle', text:'Welcome to InvenPro dashboard', time:'Today' });

  const list = document.getElementById('notifList');
  if (!notifs.length) {
    list.innerHTML = '<div class="empty-state"><i class="fa-solid fa-bell-slash"></i><p>No notifications</p></div>';
    document.getElementById('notifBadge').textContent = '0';
    return;
  }
  list.innerHTML = notifs.map(n => `
    <div class="notif-item">
      <div class="notif-icon ${n.type}"><i class="fa-solid ${n.icon}"></i></div>
      <div><p>${n.text}</p><small>${n.time}</small></div>
    </div>`).join('');
  document.getElementById('notifBadge').textContent = notifs.length;
}

/* ================================================
   GLOBAL SEARCH
   ================================================ */

function initGlobalSearch() {
  const input   = document.getElementById('globalSearch');
  const results = document.getElementById('searchResults');

  input.addEventListener('input', function() {
    const q = this.value.trim().toLowerCase();
    if (!q) { results.classList.remove('show'); return; }

    const matches = state.products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q))
    ).slice(0, 6);

    if (!matches.length) {
      results.innerHTML = '<div class="empty-state" style="padding:1rem"><p>No results found</p></div>';
    } else {
      results.innerHTML = matches.map(p => `
        <div class="search-result-item" onclick="openProductFromSearch('${p.id}')">
          <i class="fa-solid ${getCategoryIcon(p.category)}"></i>
          <div>
            <div class="result-name">${p.name}</div>
            <div class="result-cat">${p.category} · Stock: ${p.stock}</div>
          </div>
        </div>`).join('');
    }
    results.classList.add('show');
  });

  document.addEventListener('click', function(e) {
    if (!document.querySelector('.search-wrap').contains(e.target)) {
      results.classList.remove('show');
      input.value = '';
    }
  });
}

function openProductFromSearch(id) {
  document.getElementById('searchResults').classList.remove('show');
  document.getElementById('globalSearch').value = '';
  navigateTo('products');
  setTimeout(() => {
    document.getElementById('productSearch').value =
      state.products.find(p => p.id === id)?.name || '';
    renderProductsTable();
  }, 100);
}

/* ================================================
   THEME TOGGLE
   ================================================ */

document.getElementById('themeToggle').addEventListener('click', toggleTheme);
document.getElementById('settingDarkMode').addEventListener('change', function() {
  state.settings.darkMode = this.checked;
  applySettings();
  saveStorage(APP_KEYS.settings, state.settings);
});

function toggleTheme() {
  state.settings.darkMode = !state.settings.darkMode;
  applySettings();
  saveStorage(APP_KEYS.settings, state.settings);
  document.getElementById('settingDarkMode').checked = state.settings.darkMode;
}

function applySettings() {
  const isDark = state.settings.darkMode;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  document.getElementById('themeIcon').className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';

  const isCompact = state.settings.compact;
  document.body.classList.toggle('compact', isCompact);

  // Sync settings toggles if on settings page
  const dm = document.getElementById('settingDarkMode');
  if (dm) dm.checked = isDark;
  const cp = document.getElementById('settingCompact');
  if (cp) cp.checked = isCompact;

  // Re-render charts if they exist (theme change)
  if (state.charts.sales)    rebuildAllCharts();
}

/* ================================================
   DASHBOARD
   ================================================ */

function renderDashboard() {
  const products  = state.products;
  const threshold = state.settings.lowStockThreshold;

  const totalProducts = products.length;
  const totalStock    = products.reduce((s, p) => s + p.stock, 0);
  const lowStockItems = products.filter(p => p.stock < threshold && p.stock > 0);
  const outOfStock    = products.filter(p => p.stock === 0);
  const totalSalesVal = state.sales.reduce((s, sale) => s + sale.total, 0);

  animateCounter('totalProductsVal', totalProducts);
  animateCounter('totalStockVal', totalStock);
  animateCounter('lowStockVal', lowStockItems.length + outOfStock.length);
  animateCounterCurrency('totalSalesVal', totalSalesVal);

  // Recent products table
  const tbody = document.getElementById('recentProductsTable');
  const recent = [...products].slice(-5).reverse();
  tbody.innerHTML = recent.length ? recent.map(p => {
    const st = getStockStatus(p.stock, threshold);
    return `<tr>
      <td><div class="prod-cell"><div class="prod-thumb"><i class="fa-solid ${getCategoryIcon(p.category)}"></i></div><span>${p.name}</span></div></td>
      <td><span class="cat-chip">${p.category}</span></td>
      <td><span class="stock-num">${p.stock}</span></td>
      <td>${formatCurrency(p.price)}</td>
    </tr>`;
  }).join('') : '<tr><td colspan="4"><div class="empty-state"><i class="fa-solid fa-box-open"></i><p>No products yet</p></div></td></tr>';

  // Low stock alerts
  const alertsList = document.getElementById('lowStockList');
  const allAlerts  = [...outOfStock, ...lowStockItems];
  document.getElementById('alertCount').textContent = allAlerts.length;
  alertsList.innerHTML = allAlerts.length ? allAlerts.map(p => `
    <div class="alert-item ${p.stock === 0 ? 'alert-item-critical' : ''}">
      <div>
        <div class="alert-name">${p.name}</div>
        <div style="font-size:.75rem;color:var(--text3)">${p.category}</div>
      </div>
      <span class="alert-stock">${p.stock === 0 ? 'OUT' : p.stock + ' left'}</span>
    </div>`).join('') :
    '<div class="empty-state"><i class="fa-solid fa-check-circle" style="color:var(--success)"></i><p>All stock healthy!</p></div>';

  buildDashboardCharts();
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step = Math.max(1, Math.floor(target / 30));
  const interval = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current.toLocaleString('en-IN');
    if (current >= target) clearInterval(interval);
  }, 40);
}

function animateCounterCurrency(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step = Math.max(1, Math.floor(target / 30));
  const interval = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = formatCurrency(current);
    if (current >= target) clearInterval(interval);
  }, 40);
}

function buildDashboardCharts() {
  const isDark    = state.settings.darkMode;
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  // Sales Chart
  const salesCtx = document.getElementById('salesChart');
  if (!salesCtx) return;
  if (state.charts.sales) { state.charts.sales.destroy(); }

  const labels = getLast7Days();
  const salesData = labels.map(label => {
    return state.sales
      .filter(s => formatDate(s.date) === formatDate(label))
      .reduce((sum, s) => sum + s.total, 0);
  });

  state.charts.sales = new Chart(salesCtx, {
    type: 'bar',
    data: {
      labels: labels.map(d => new Date(d).toLocaleDateString('en-IN', {day:'2-digit', month:'short'})),
      datasets: [{
        label: 'Sales (₹)',
        data: salesData,
        backgroundColor: 'rgba(37,99,235,0.2)',
        borderColor: '#2563eb',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: chartOptions(textColor, gridColor, true)
  });

  // Category Chart (Donut)
  const catCtx = document.getElementById('categoryChart');
  if (state.charts.category) state.charts.category.destroy();

  const categories = {};
  state.products.forEach(p => { categories[p.category] = (categories[p.category] || 0) + 1; });
  const catLabels = Object.keys(categories);
  const catData   = Object.values(categories);

  state.charts.category = new Chart(catCtx, {
    type: 'doughnut',
    data: {
      labels: catLabels,
      datasets: [{
        data: catData,
        backgroundColor: ['#2563eb','#06b6d4','#10b981','#f59e0b','#8b5cf6','#ef4444'],
        borderWidth: 0,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      cutout: '68%',
      plugins: {
        legend: { position: 'bottom', labels: { color: textColor, padding: 12, font: { size: 11, family: 'Sora' } } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} products` } }
      }
    }
  });
}

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
}

function chartOptions(textColor, gridColor, showGrid = false) {
  return {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ` ₹${Number(ctx.parsed.y).toLocaleString('en-IN')}` } }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, font: { size: 11, family: 'Sora' } },
        border: { display: false }
      },
      y: {
        grid: { color: gridColor, drawBorder: false },
        ticks: { color: textColor, font: { size: 11, family: 'Sora' }, callback: v => '₹' + (v >= 1000 ? Math.floor(v/1000)+'k' : v) },
        border: { display: false }
      }
    }
  };
}

function rebuildAllCharts() {
  const page = document.querySelector('.app-page.active');
  if (!page) return;
  const id = page.id.replace('page-', '');
  if (id === 'dashboard') buildDashboardCharts();
  if (id === 'sales')     buildSalesCharts();
}

// Sales chart filter
document.getElementById('salesChartFilter')?.addEventListener('change', buildDashboardCharts);

/* ================================================
   PRODUCTS
   ================================================ */

function renderProducts() {
  renderProductsTable();
}

function renderProductsTable() {
  const search   = (document.getElementById('productSearch')?.value || '').toLowerCase();
  const catFilter  = document.getElementById('categoryFilter')?.value || '';
  const stockFilter = document.getElementById('stockFilter')?.value || '';
  const threshold  = state.settings.lowStockThreshold;

  let products = [...state.products];

  if (search) products = products.filter(p =>
    p.name.toLowerCase().includes(search) ||
    p.category.toLowerCase().includes(search) ||
    (p.sku && p.sku.toLowerCase().includes(search))
  );
  if (catFilter) products = products.filter(p => p.category === catFilter);
  if (stockFilter === 'low') products = products.filter(p => p.stock > 0 && p.stock < threshold);
  if (stockFilter === 'out') products = products.filter(p => p.stock === 0);
  if (stockFilter === 'ok')  products = products.filter(p => p.stock >= threshold);

  document.getElementById('productCount').textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;

  const tbody = document.getElementById('productsTableBody');
  if (!products.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fa-solid fa-box-open"></i><p>No products found. Try different filters or <a href="#" onclick="openAddProduct()">add a product</a>.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = products.map((p, idx) => {
    const st = getStockStatus(p.stock, threshold);
    const imgContent = p.image
      ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px" onerror="this.style.display='none'">`
      : `<i class="fa-solid ${getCategoryIcon(p.category)}"></i>`;
    return `<tr>
      <td style="color:var(--text3);font-size:.8rem">${idx + 1}</td>
      <td>
        <div class="prod-cell">
          <div class="prod-thumb">${imgContent}</div>
          <div>
            <div class="prod-name">${escHtml(p.name)}</div>
            <div class="prod-sku">${p.sku || '—'}</div>
          </div>
        </div>
      </td>
      <td><span class="cat-chip">${p.category}</span></td>
      <td><span class="stock-num">${p.stock}</span></td>
      <td>${formatCurrency(p.price)}</td>
      <td><span class="status-badge ${st.cls}">${st.label}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn-edit" onclick="editProduct('${p.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-del"  onclick="confirmDeleteProduct('${p.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// Filters
document.getElementById('productSearch')?.addEventListener('input', renderProductsTable);
document.getElementById('categoryFilter')?.addEventListener('change', renderProductsTable);
document.getElementById('stockFilter')?.addEventListener('change', renderProductsTable);
document.getElementById('clearFilters')?.addEventListener('click', function() {
  document.getElementById('productSearch').value = '';
  document.getElementById('categoryFilter').value = '';
  document.getElementById('stockFilter').value = '';
  renderProductsTable();
});

// Open Add Product Modal
document.getElementById('openAddProduct')?.addEventListener('click', openAddProduct);
function openAddProduct() {
  state.editingProductId = null;
  document.getElementById('modalTitle').textContent = 'Add New Product';
  document.getElementById('saveProductBtn').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Product';
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
  clearProductFormErrors();
  document.getElementById('productModal').classList.add('show');
}

function editProduct(id) {
  const p = state.products.find(p => p.id === id);
  if (!p) return;
  state.editingProductId = id;
  document.getElementById('modalTitle').textContent = 'Edit Product';
  document.getElementById('saveProductBtn').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Update Product';
  document.getElementById('productId').value = id;
  document.getElementById('prodName').value     = p.name;
  document.getElementById('prodCategory').value = p.category;
  document.getElementById('prodStock').value    = p.stock;
  document.getElementById('prodPrice').value    = p.price;
  document.getElementById('prodDesc').value     = p.desc || '';
  document.getElementById('prodSku').value      = p.sku || '';
  document.getElementById('prodSupplier').value = p.supplier || '';
  document.getElementById('prodImage').value    = p.image || '';
  clearProductFormErrors();
  document.getElementById('productModal').classList.add('show');
}

function clearProductFormErrors() {
  ['prodNameErr','prodCatErr','prodStockErr','prodPriceErr'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

// Close modals
document.getElementById('closeProductModal')?.addEventListener('click', () =>
  document.getElementById('productModal').classList.remove('show'));
document.getElementById('cancelProductModal')?.addEventListener('click', () =>
  document.getElementById('productModal').classList.remove('show'));

// Product Form Submit
document.getElementById('productForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  let valid = true;
  clearProductFormErrors();

  const name     = document.getElementById('prodName').value.trim();
  const category = document.getElementById('prodCategory').value;
  const stock    = parseInt(document.getElementById('prodStock').value);
  const price    = parseFloat(document.getElementById('prodPrice').value);

  if (!name)      { document.getElementById('prodNameErr').textContent  = 'Product name is required.'; valid = false; }
  if (!category)  { document.getElementById('prodCatErr').textContent   = 'Category is required.'; valid = false; }
  if (isNaN(stock) || stock < 0) { document.getElementById('prodStockErr').textContent = 'Valid stock quantity required.'; valid = false; }
  if (isNaN(price) || price < 0) { document.getElementById('prodPriceErr').textContent = 'Valid price required.'; valid = false; }

  if (!valid) return;

  const productData = {
    name, category, stock, price,
    desc:     document.getElementById('prodDesc').value.trim(),
    sku:      document.getElementById('prodSku').value.trim(),
    supplier: document.getElementById('prodSupplier').value.trim(),
    image:    document.getElementById('prodImage').value.trim(),
    updatedAt: new Date().toISOString()
  };

  if (state.editingProductId) {
    const idx = state.products.findIndex(p => p.id === state.editingProductId);
    if (idx !== -1) {
      state.products[idx] = { ...state.products[idx], ...productData };
      showToast('Product updated successfully!', 'success');
    }
  } else {
    state.products.push({ id: uid(), ...productData, createdAt: new Date().toISOString() });
    showToast('Product added successfully!', 'success');
  }

  saveStorage(APP_KEYS.products, state.products);
  document.getElementById('productModal').classList.remove('show');
  renderProductsTable();
  buildNotifList();
});

// Confirm Delete
function confirmDeleteProduct(id) {
  state.deleteProductId = id;
  document.getElementById('confirmModal').classList.add('show');
}

document.getElementById('cancelDelete')?.addEventListener('click', () => {
  state.deleteProductId = null;
  document.getElementById('confirmModal').classList.remove('show');
});

document.getElementById('confirmDelete')?.addEventListener('click', function() {
  const id = state.deleteProductId;
  if (!id) return;
  state.products = state.products.filter(p => p.id !== id);
  saveStorage(APP_KEYS.products, state.products);
  document.getElementById('confirmModal').classList.remove('show');
  showToast('Product deleted.', 'warning');
  renderProductsTable();
  buildNotifList();
  state.deleteProductId = null;
});

/* ================================================
   INVENTORY
   ================================================ */

function renderInventory() {
  const threshold = state.settings.lowStockThreshold;
  const products  = state.products;

  const totalUnits   = products.reduce((s, p) => s + p.stock, 0);
  const lowCount     = products.filter(p => p.stock > 0 && p.stock < threshold).length;
  const outCount     = products.filter(p => p.stock === 0).length;
  const healthyCount = products.filter(p => p.stock >= threshold).length;

  document.getElementById('invTotalUnits').textContent  = totalUnits;
  document.getElementById('invLowCount').textContent    = lowCount;
  document.getElementById('invOutCount').textContent    = outCount;
  document.getElementById('invHealthyCount').textContent = healthyCount;

  renderInventoryTable();
  renderMovementLog();
  populateStockSelect();
}

function renderInventoryTable(filter = '') {
  const threshold = state.settings.lowStockThreshold;
  let products = [...state.products];
  if (filter) products = products.filter(p =>
    p.name.toLowerCase().includes(filter) ||
    p.category.toLowerCase().includes(filter)
  );

  const tbody = document.getElementById('inventoryTableBody');
  tbody.innerHTML = products.map(p => {
    const st = getStockStatus(p.stock, threshold);
    return `<tr>
      <td><strong>${escHtml(p.name)}</strong></td>
      <td><span class="mono" style="font-size:.82rem;color:var(--text3)">${p.sku || '—'}</span></td>
      <td><span class="cat-chip">${p.category}</span></td>
      <td>
        <div class="stock-cell">
          <span class="stock-num">${p.stock}</span>
          ${p.stock < threshold && p.stock > 0 ? '<i class="fa-solid fa-triangle-exclamation" style="color:var(--warning);font-size:.85rem"></i>' : ''}
          ${p.stock === 0 ? '<i class="fa-solid fa-ban" style="color:var(--danger);font-size:.85rem"></i>' : ''}
        </div>
      </td>
      <td><span class="status-badge ${st.cls}">${st.label}</span></td>
      <td style="color:var(--text3);font-size:.82rem">${p.updatedAt ? formatDate(p.updatedAt) : '—'}</td>
    </tr>`;
  }).join('') || '<tr><td colspan="6"><div class="empty-state"><i class="fa-solid fa-warehouse"></i><p>No inventory items</p></div></td></tr>';
}

function renderMovementLog() {
  const tbody = document.getElementById('movementLogBody');
  const logs  = [...state.movements].reverse().slice(0, 20);
  tbody.innerHTML = logs.map(m => `
    <tr>
      <td style="font-size:.82rem;color:var(--text3)">${formatDate(m.date)}</td>
      <td><strong>${escHtml(m.productName)}</strong></td>
      <td><span class="movement-type ${m.type === 'in' ? 'type-in' : 'type-out'}">
        <i class="fa-solid ${m.type === 'in' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
        ${m.type === 'in' ? 'IN' : 'OUT'}
      </span></td>
      <td><strong>${m.qty}</strong></td>
      <td style="color:var(--text2)">${escHtml(m.reason || '—')}</td>
      <td style="color:var(--text3)">${m.by || 'Admin'}</td>
    </tr>`).join('') || '<tr><td colspan="6"><div class="empty-state"><p>No movements logged</p></div></td></tr>';
}

function populateStockSelect() {
  const sel = document.getElementById('stockProductSelect');
  sel.innerHTML = state.products.map(p => `<option value="${p.id}">${escHtml(p.name)} (Stock: ${p.stock})</option>`).join('');
}

document.getElementById('invSearch')?.addEventListener('input', function() {
  renderInventoryTable(this.value.toLowerCase());
});

// Stock Modal
document.getElementById('openStockModal')?.addEventListener('click', () => {
  populateStockSelect();
  document.getElementById('stockModal').classList.add('show');
});
document.getElementById('closeStockModal')?.addEventListener('click', () => document.getElementById('stockModal').classList.remove('show'));
document.getElementById('cancelStockModal')?.addEventListener('click', () => document.getElementById('stockModal').classList.remove('show'));

document.getElementById('saveStockBtn')?.addEventListener('click', function() {
  const productId = document.getElementById('stockProductSelect').value;
  const type      = document.getElementById('stockType').value;
  const qty       = parseInt(document.getElementById('stockQty').value);
  const reason    = document.getElementById('stockReason').value.trim();

  if (!productId)      { showToast('Please select a product.', 'error'); return; }
  if (isNaN(qty) || qty <= 0) { showToast('Please enter a valid quantity.', 'error'); return; }

  const idx = state.products.findIndex(p => p.id === productId);
  if (idx === -1) return;

  if (type === 'out' && state.products[idx].stock < qty) {
    showToast('Insufficient stock!', 'error'); return;
  }

  const product = state.products[idx];
  state.products[idx].stock += (type === 'in' ? qty : -qty);
  state.products[idx].updatedAt = new Date().toISOString();

  state.movements.push({
    id: uid(), productId, productName: product.name,
    type, qty, reason: reason || (type === 'in' ? 'Stock received' : 'Stock issued'),
    by: state.profile.username || 'Admin',
    date: new Date().toISOString().split('T')[0]
  });

  saveStorage(APP_KEYS.products,  state.products);
  saveStorage(APP_KEYS.movements, state.movements);

  document.getElementById('stockModal').classList.remove('show');
  document.getElementById('stockQty').value = '';
  document.getElementById('stockReason').value = '';
  showToast(`Stock ${type === 'in' ? 'added' : 'removed'}: ${qty} units of ${product.name}`, type === 'in' ? 'success' : 'warning');
  renderInventory();
  buildNotifList();
});

/* ================================================
   SALES
   ================================================ */

function renderSales() {
  const sales = state.sales;
  const totalRevenue = sales.reduce((s, sale) => s + sale.total, 0);
  const totalOrders  = sales.length;
  const avgOrder     = totalOrders ? (totalRevenue / totalOrders) : 0;

  // Top product
  const productTotals = {};
  sales.forEach(s => { productTotals[s.productName] = (productTotals[s.productName] || 0) + s.total; });
  const topProduct = Object.entries(productTotals).sort((a,b) => b[1]-a[1])[0]?.[0] || '—';

  document.getElementById('salesTotalOrders').textContent  = totalOrders;
  document.getElementById('salesTotalRevenue').textContent = formatCurrency(totalRevenue);
  document.getElementById('salesTopProduct').textContent   = topProduct.length > 12 ? topProduct.slice(0,12)+'…' : topProduct;
  document.getElementById('salesAvgOrder').textContent     = formatCurrency(Math.round(avgOrder));

  buildSalesCharts();
  renderSalesTable();
  populateSaleProductSelect();
}

function buildSalesCharts() {
  const isDark    = state.settings.darkMode;
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  // Revenue Trend
  const revCtx = document.getElementById('revenueChart');
  if (!revCtx) return;
  if (state.charts.revenue) state.charts.revenue.destroy();

  const days     = getLast7Days();
  const revData  = days.map(d => state.sales.filter(s => s.date === d).reduce((sum, s) => sum + s.total, 0));

  state.charts.revenue = new Chart(revCtx, {
    type: 'line',
    data: {
      labels: days.map(d => new Date(d).toLocaleDateString('en-IN', {day:'2-digit', month:'short'})),
      datasets: [{
        label: 'Revenue (₹)',
        data: revData,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.08)',
        borderWidth: 2.5,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#2563eb',
        pointRadius: 4,
        pointHoverRadius: 7
      }]
    },
    options: chartOptions(textColor, gridColor, true)
  });

  // Top Products Horizontal Bar
  const tpCtx = document.getElementById('topProductsChart');
  if (state.charts.topProducts) state.charts.topProducts.destroy();

  const ptotals = {};
  state.sales.forEach(s => { ptotals[s.productName] = (ptotals[s.productName] || 0) + s.total; });
  const sorted = Object.entries(ptotals).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const shortNames = sorted.map(([name]) => name.length > 14 ? name.slice(0,12)+'…' : name);

  state.charts.topProducts = new Chart(tpCtx, {
    type: 'bar',
    data: {
      labels: shortNames,
      datasets: [{
        data: sorted.map(([,v]) => v),
        backgroundColor: ['#2563eb','#06b6d4','#10b981','#f59e0b','#8b5cf6'],
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ' ₹' + Number(ctx.parsed.x).toLocaleString('en-IN') } }
      },
      scales: {
        x: { ticks: { color: textColor, font: { size: 10, family: 'Sora' } }, grid: { color: gridColor }, border: { display: false } },
        y: { ticks: { color: textColor, font: { size: 11, family: 'Sora' } }, grid: { display: false }, border: { display: false } }
      }
    }
  });
}

function renderSalesTable(filter = '', dateFilter = '') {
  let sales = [...state.sales].reverse();

  if (filter) sales = sales.filter(s =>
    s.productName.toLowerCase().includes(filter) ||
    (s.customer && s.customer.toLowerCase().includes(filter))
  );

  const today = new Date().toISOString().split('T')[0];
  if (dateFilter === 'today') {
    sales = sales.filter(s => s.date === today);
  } else if (dateFilter === 'week') {
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    sales = sales.filter(s => new Date(s.date) >= weekAgo);
  } else if (dateFilter === 'month') {
    const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);
    sales = sales.filter(s => new Date(s.date) >= monthAgo);
  }

  const tbody = document.getElementById('salesTableBody');
  tbody.innerHTML = sales.length ? sales.map((s, idx) => `
    <tr>
      <td style="color:var(--text3);font-size:.8rem">${idx + 1}</td>
      <td style="font-size:.82rem;color:var(--text3)">${formatDate(s.date)}</td>
      <td><strong>${escHtml(s.productName)}</strong></td>
      <td><span class="cat-chip">${s.category}</span></td>
      <td>${s.qty}</td>
      <td>${formatCurrency(s.price)}</td>
      <td style="font-weight:700;color:var(--success)">${formatCurrency(s.total)}</td>
    </tr>`).join('') :
    '<tr><td colspan="7"><div class="empty-state"><i class="fa-solid fa-chart-line"></i><p>No sales data found</p></div></td></tr>';
}

document.getElementById('salesSearch')?.addEventListener('input', function() {
  renderSalesTable(this.value.toLowerCase(), document.getElementById('salesDateFilter').value);
});
document.getElementById('salesDateFilter')?.addEventListener('change', function() {
  renderSalesTable(document.getElementById('salesSearch').value.toLowerCase(), this.value);
});

// Sale Modal
document.getElementById('openSaleModal')?.addEventListener('click', () => {
  populateSaleProductSelect();
  document.getElementById('saleModal').classList.add('show');
});
document.getElementById('closeSaleModal')?.addEventListener('click', () => document.getElementById('saleModal').classList.remove('show'));
document.getElementById('cancelSaleModal')?.addEventListener('click', () => document.getElementById('saleModal').classList.remove('show'));

function populateSaleProductSelect() {
  const availProducts = state.products.filter(p => p.stock > 0);
  const sel = document.getElementById('saleProductSelect');
  sel.innerHTML = availProducts.length
    ? availProducts.map(p => `<option value="${p.id}" data-price="${p.price}">${escHtml(p.name)} (Stock: ${p.stock})</option>`).join('')
    : '<option value="">No products in stock</option>';

  // Auto-fill price on select change
  sel.onchange = function() {
    const opt = sel.options[sel.selectedIndex];
    const price = opt?.dataset.price;
    if (price) document.getElementById('salePrice').value = price;
  };
  sel.dispatchEvent(new Event('change'));
}

document.getElementById('saveSaleBtn')?.addEventListener('click', function() {
  const productId = document.getElementById('saleProductSelect').value;
  const qty       = parseInt(document.getElementById('saleQty').value);
  const price     = parseFloat(document.getElementById('salePrice').value);
  const customer  = document.getElementById('saleCustomer').value.trim() || 'Walk-in Customer';

  if (!productId)      { showToast('Select a product.', 'error'); return; }
  if (isNaN(qty) || qty <= 0) { showToast('Enter valid quantity.', 'error'); return; }
  if (isNaN(price) || price <= 0) { showToast('Enter valid price.', 'error'); return; }

  const idx = state.products.findIndex(p => p.id === productId);
  if (idx === -1) return;
  if (state.products[idx].stock < qty) { showToast('Not enough stock!', 'error'); return; }

  const product = state.products[idx];
  const total   = qty * price;

  // Create sale record
  state.sales.push({
    id: uid(), productId, productName: product.name,
    category: product.category, qty, price, total, customer,
    date: new Date().toISOString().split('T')[0]
  });

  // Deduct stock
  state.products[idx].stock -= qty;
  state.products[idx].updatedAt = new Date().toISOString();

  // Log movement
  state.movements.push({
    id: uid(), productId, productName: product.name,
    type: 'out', qty,
    reason: `Sale to ${customer}`,
    by: state.profile.username || 'Admin',
    date: new Date().toISOString().split('T')[0]
  });

  saveStorage(APP_KEYS.sales,     state.sales);
  saveStorage(APP_KEYS.products,  state.products);
  saveStorage(APP_KEYS.movements, state.movements);

  document.getElementById('saleModal').classList.remove('show');
  document.getElementById('saleQty').value = '';
  document.getElementById('saleCustomer').value = '';
  showToast(`Sale recorded: ${qty}x ${product.name} — ${formatCurrency(total)}`, 'success');
  renderSales();
  buildNotifList();
});

// Export CSV
document.getElementById('exportSalesBtn')?.addEventListener('click', function() {
  const headers = ['#','Date','Product','Category','Qty','Unit Price','Total'];
  const rows    = state.sales.map((s, i) => [
    i+1, s.date, s.productName, s.category, s.qty, s.price, s.total
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'invenpro_sales_report.csv';
  a.click(); URL.revokeObjectURL(url);
  showToast('Sales report exported!', 'success');
});

/* ================================================
   PROFILE
   ================================================ */

function renderProfile() {
  const p = state.profile;
  document.getElementById('profileDisplayName').textContent = p.name || 'Admin User';
  document.getElementById('profileName').value     = p.name || '';
  document.getElementById('profileUsername').value = p.username || '';
  document.getElementById('profileEmail').value    = p.email || '';
  document.getElementById('profilePhone').value    = p.phone || '';
  document.getElementById('profileBio').value      = p.bio || '';
  document.getElementById('profileProductCount').textContent = state.products.length;
  document.getElementById('profileSalesCount').textContent   = state.sales.length;
  updateUserUI();
}

document.getElementById('profileForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  state.profile.name     = document.getElementById('profileName').value.trim();
  state.profile.username = document.getElementById('profileUsername').value.trim();
  state.profile.email    = document.getElementById('profileEmail').value.trim();
  state.profile.phone    = document.getElementById('profilePhone').value.trim();
  state.profile.bio      = document.getElementById('profileBio').value.trim();
  saveStorage(APP_KEYS.profile, state.profile);
  updateUserUI();
  showToast('Profile updated successfully!', 'success');
});

document.getElementById('securityForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const current = document.getElementById('currentPass').value;
  const newPass  = document.getElementById('newPass').value;
  const confirm  = document.getElementById('confirmPass').value;

  if (current !== state.profile.password) { showToast('Current password is incorrect.', 'error'); return; }
  if (!newPass || newPass.length < 6)     { showToast('New password must be at least 6 characters.', 'error'); return; }
  if (newPass !== confirm)                { showToast('Passwords do not match.', 'error'); return; }

  state.profile.password = newPass;
  saveStorage(APP_KEYS.profile, state.profile);
  this.reset();
  showToast('Password updated!', 'success');
});

// Profile tabs
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', function() {
    const tabId = this.dataset.tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    this.classList.add('active');
    document.getElementById('tab-' + tabId)?.classList.add('active');
  });
});

/* ================================================
   SETTINGS
   ================================================ */

function renderSettings() {
  const s = state.settings;
  document.getElementById('settingDarkMode').checked    = s.darkMode;
  document.getElementById('settingCompact').checked     = s.compact;
  document.getElementById('settingLowStock').checked    = s.lowStockAlerts !== false;
  document.getElementById('settingSales').checked       = s.salesAlerts !== false;
  document.getElementById('lowStockThreshold').value    = s.lowStockThreshold || 10;
}

document.getElementById('settingCompact')?.addEventListener('change', function() {
  state.settings.compact = this.checked;
  applySettings();
  saveStorage(APP_KEYS.settings, state.settings);
});

document.getElementById('saveSettingsBtn')?.addEventListener('click', function() {
  state.settings.lowStockThreshold = parseInt(document.getElementById('lowStockThreshold').value) || 10;
  state.settings.lowStockAlerts    = document.getElementById('settingLowStock').checked;
  state.settings.salesAlerts       = document.getElementById('settingSales').checked;
  saveStorage(APP_KEYS.settings, state.settings);
  showToast('Settings saved!', 'success');
  buildNotifList();
});

document.getElementById('exportDataBtn')?.addEventListener('click', function() {
  const data = {
    products:  state.products,
    sales:     state.sales,
    movements: state.movements,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'invenpro_data_export.json';
  a.click(); URL.revokeObjectURL(url);
  showToast('Data exported successfully!', 'success');
});

document.getElementById('clearDataBtn')?.addEventListener('click', function() {
  if (!confirm('This will delete ALL products, sales and movements. Are you sure?')) return;
  state.products  = [];
  state.sales     = [];
  state.movements = [];
  saveStorage(APP_KEYS.products,  state.products);
  saveStorage(APP_KEYS.sales,     state.sales);
  saveStorage(APP_KEYS.movements, state.movements);
  showToast('All data cleared.', 'warning');
  renderDashboard();
});

/* ================================================
   CONTACT FORM
   ================================================ */

document.getElementById('contactForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const name    = document.getElementById('contactName').value.trim();
  const email   = document.getElementById('contactEmail').value.trim();
  const subject = document.getElementById('contactSubject').value.trim();
  const message = document.getElementById('contactMessage').value.trim();

  if (!name || !email || !message) {
    showToast('Please fill in all required fields.', 'error'); return;
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    showToast('Please enter a valid email address.', 'error'); return;
  }

  this.reset();
  showToast('Message sent successfully! We will get back to you soon.', 'success');
});

/* ================================================
   CLOSE MODALS ON OVERLAY CLICK
   ================================================ */

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('show');
  });
});

/* ================================================
   KEYBOARD SHORTCUTS
   ================================================ */

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.show').forEach(m => m.classList.remove('show'));
    document.getElementById('notifPanel').classList.remove('show');
  }
});

/* ================================================
   START APP
   ================================================ */

document.addEventListener('DOMContentLoaded', function() {
  initLoadingScreen();
});