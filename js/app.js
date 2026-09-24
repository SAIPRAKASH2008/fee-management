/* =====================================================
   app.js — Router, Auth, Global State, Toast, Utils
   ===================================================== */

/* ─── GLOBAL STATE ─────────────────────────────────── */
const App = {
  currentUser: null,
  currentPage: 'dashboard',
  charts: {},

  init() {
    const saved = sessionStorage.getItem('fms_session');
    if (saved) {
      this.currentUser = JSON.parse(saved);
      this.boot();
    } else {
      window.location.href = 'index.html';
    }
  },

  login(user) {
    this.currentUser = user;
    sessionStorage.setItem('fms_session', JSON.stringify(user));
  },

  logout() {
    sessionStorage.removeItem('fms_session');
    window.location.href = 'index.html';
  },

  boot() {
    this.renderShell();
    this.navigate('dashboard');
    this.initMobileSidebar();
    this.updateNotifBadge();
  },

  // ─── SIDEBAR RENDERING ──────────────────────────────
  getSidebarNav() {
    const role = this.currentUser.role;
    const navs = {
      admin: [
        { section: 'Overview' },
        { id:'dashboard',      icon:'📊', label:'Dashboard' },
        { section: 'Management' },
        { id:'students',       icon:'🎓', label:'Students' },
        { id:'add-student',    icon:'➕', label:'Add Student' },
        { id:'fee-structures', icon:'💰', label:'Fee Structures' },
        { id:'payments',       icon:'💳', label:'All Payments' },
        { section: 'Reports' },
        { id:'reports',        icon:'📈', label:'Reports & Analytics' },
        { id:'defaulters',     icon:'⚠️', label:'Defaulters' },
        { id:'audit-logs',     icon:'📋', label:'Audit Logs' },
        { section: 'System' },
        { id:'notifications',  icon:'🔔', label:'Notifications', badge: true },
        { id:'settings',       icon:'⚙️', label:'Settings' },
      ],
      staff: [
        { section: 'Overview' },
        { id:'dashboard',    icon:'📊', label:'Dashboard' },
        { section: 'Payments' },
        { id:'record-payment',icon:'💳', label:'Record Payment' },
        { id:'payments',     icon:'📋', label:'Payment History' },
        { section: 'Students' },
        { id:'students',     icon:'🎓', label:'Students' },
        { id:'add-student',  icon:'➕', label:'Add Student' },
        { section: 'System' },
        { id:'notifications',icon:'🔔', label:'Notifications', badge:true },
      ],
      accountant: [
        { section: 'Overview' },
        { id:'dashboard',    icon:'📊', label:'Dashboard' },
        { section: 'Payments' },
        { id:'record-payment',icon:'💳', label:'Record Payment' },
        { id:'payments',     icon:'📋', label:'Payment History' },
        { section: 'Students' },
        { id:'students',     icon:'🎓', label:'Students' },
        { id:'add-student',  icon:'➕', label:'Add Student' },
        { section: 'System' },
        { id:'notifications',icon:'🔔', label:'Notifications', badge:true },
      ],
      student: [
        { section: 'My Account' },
        { id:'dashboard',    icon:'🏠', label:'Dashboard' },
        { id:'my-fees',      icon:'💰', label:'My Fees' },
        { id:'pay-now',      icon:'💳', label:'Pay Now' },
        { section: 'History' },
        { id:'history',      icon:'📋', label:'Payment History' },
        { id:'receipts',     icon:'🧾', label:'My Receipts' },
        { section: 'Alerts' },
        { id:'notifications',icon:'🔔', label:'Notifications', badge:true },
      ],
    };
    return navs[role] || [];
  },

  renderShell() {
    const u = this.currentUser;
    const nav = this.getSidebarNav();
    const student = u.role === 'student' ? FMS.getStudentByUserId(u.user_id) : null;

    let navHTML = '';
    nav.forEach(item => {
      if (item.section) {
        navHTML += `<div class="nav-section-label">${item.section}</div>`;
      } else {
        const unread = item.badge ? FMS.getUnreadCount(student?.student_id) : 0;
        navHTML += `
          <div class="nav-item" id="nav-${item.id}" data-page="${item.id}" onclick="App.navigate('${item.id}')">
            <span class="nav-icon">${item.icon}</span>
            <span>${item.label}</span>
            ${unread > 0 ? `<span class="nav-badge">${unread}</span>` : ''}
          </div>`;
      }
    });

    const roleColors = { admin:'badge-purple', staff:'badge-amber', accountant:'badge-green', student:'badge-blue' };

    document.getElementById('app-shell').innerHTML = `
      <div class="sidebar-overlay" id="sidebar-overlay" onclick="App.closeSidebar()"></div>
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">🏛️</div>
          <div class="sidebar-title">FeeManager<span>Educational Portal</span></div>
        </div>
        <div class="sidebar-user">
          <div class="sidebar-avatar">${u.avatar || u.name[0]}</div>
          <div class="sidebar-user-info">
            <strong>${u.name}</strong>
            <span>${u.role.charAt(0).toUpperCase()+u.role.slice(1)}</span>
          </div>
        </div>
        <nav class="sidebar-nav" id="sidebar-nav">${navHTML}</nav>
        <div class="sidebar-footer">
          <button class="btn btn-ghost btn-full btn-sm" onclick="App.logout()">
            🚪 Sign Out
          </button>
        </div>
      </aside>

      <div class="main-content">
        <header class="topbar">
          <button class="hamburger" id="hamburger-btn" onclick="App.toggleSidebar()">☰</button>
          <div class="topbar-title">
            <h3 id="topbar-title">Dashboard</h3>
            <p id="topbar-subtitle">Loading...</p>
          </div>
          <div class="topbar-actions">
            <button class="notif-btn" onclick="App.navigate('notifications')" title="Notifications">
              🔔 <span class="notif-dot" id="notif-dot" style="display:none"></span>
            </button>
            <div class="d-flex items-center gap-2" style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-md);padding:.375rem .875rem;cursor:default">
              <div class="avatar avatar-sm">${u.avatar||u.name[0]}</div>
              <span class="text-sm font-medium">${u.name.split(' ')[0]}</span>
            </div>
          </div>
        </header>
        <div class="page-content animate-fade" id="page-content">
          <div class="d-flex items-center justify-center" style="height:60vh">
            <div class="spinner" style="width:40px;height:40px;border-width:3px"></div>
          </div>
        </div>
      </div>`;

    // Toast container
    if (!document.getElementById('toast-container')) {
      const tc = document.createElement('div');
      tc.id = 'toast-container'; tc.className = 'toast-container';
      document.body.appendChild(tc);
    }
  },

  // ─── ROUTING ────────────────────────────────────────
  navigate(page) {
    const role = this.currentUser.role;
    this.currentPage = page;

    // Update active nav
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${page}`);
    if (activeNav) activeNav.classList.add('active');

    // Destroy existing charts
    Object.values(this.charts).forEach(c => { try { c.destroy(); } catch(e){} });
    this.charts = {};

    // Close mobile sidebar
    this.closeSidebar();

    // Render page
    const pc = document.getElementById('page-content');
    pc.classList.remove('animate-fade');
    void pc.offsetWidth; // reflow
    pc.classList.add('animate-fade');

    const pages = {
      admin: {
        'dashboard':      () => Admin.renderDashboard(),
        'students':       () => Admin.renderStudents(),
        'add-student':    () => Admin.openAddStudentModal(),
        'fee-structures': () => Admin.renderFeeStructures(),
        'payments':       () => Admin.renderPayments(),
        'reports':        () => Admin.renderReports(),
        'defaulters':     () => Admin.renderDefaulters(),
        'audit-logs':     () => Admin.renderAuditLogs(),
        'notifications':  () => renderNotifications(),
        'settings':       () => renderSettings(),
      },
      staff: {
        'dashboard':      () => Staff.renderDashboard(),
        'record-payment': () => Staff.renderRecordPayment(),
        'payments':       () => Staff.renderPayments(),
        'students':       () => Staff.renderStudents(),
        'add-student':    () => Staff.openAddStudentModal(),
        'notifications':  () => renderNotifications(),
      },
      accountant: {
        'dashboard':      () => Staff.renderDashboard(),
        'record-payment': () => Staff.renderRecordPayment(),
        'payments':       () => Staff.renderPayments(),
        'students':       () => Staff.renderStudents(),
        'add-student':    () => Staff.openAddStudentModal(),
        'notifications':  () => renderNotifications(),
      },
      student: {
        'dashboard':      () => Student.renderDashboard(),
        'my-fees':        () => Student.renderMyFees(),
        'pay-now':        () => Student.renderPayNow(),
        'history':        () => Student.renderHistory(),
        'receipts':       () => Student.renderReceipts(),
        'notifications':  () => renderNotifications(),
      },
    };

    const handler = pages[role]?.[page];
    if (handler) handler();
    else pc.innerHTML = `<div class="empty-state"><div class="empty-icon">🚧</div><h4>Page Not Found</h4><p>This page is not available.</p></div>`;
  },

  updateNotifBadge() {
    const u = this.currentUser;
    const student = u.role === 'student' ? FMS.getStudentByUserId(u.user_id) : null;
    const count = FMS.getUnreadCount(student?.student_id);
    const dot = document.getElementById('notif-dot');
    if (dot) dot.style.display = count > 0 ? 'block' : 'none';
    // update nav badge
    const navBadge = document.querySelector('#nav-notifications .nav-badge');
    if (navBadge) { navBadge.textContent = count; navBadge.style.display = count > 0 ? 'flex' : 'none'; }
  },

  // ─── MOBILE SIDEBAR ─────────────────────────────────
  toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sb.classList.toggle('open');
    overlay.classList.toggle('show');
  },
  closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebar-overlay')?.classList.remove('show');
  },
  initMobileSidebar() {/* handled via toggleSidebar */ },

  setTopbar(title, subtitle='') {
    document.getElementById('topbar-title').textContent = title;
    document.getElementById('topbar-subtitle').textContent = subtitle || new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  },
};

/* ─── SHARED PAGE RENDERERS ─────────────────────────── */
function renderNotifications() {
  App.setTopbar('Notifications', 'Your alerts and reminders');
  const u = App.currentUser;
  const student = u.role === 'student' ? FMS.getStudentByUserId(u.user_id) : null;
  let notifs = student ? FMS.getNotifByStudent(student.student_id) : FMS.getNotifications();
  notifs = [...notifs].reverse();

  FMS.markAllRead(student?.student_id);
  App.updateNotifBadge();

  const typeIcons = { confirmation:'✅', reminder:'⏰' };
  const typeColors = { confirmation:'green', reminder:'amber' };

  document.getElementById('page-content').innerHTML = `
    <div class="page-header">
      <div><h2>Notifications</h2><p>${notifs.length} notification(s)</p></div>
    </div>
    <div class="card">
      ${notifs.length === 0
        ? `<div class="empty-state"><div class="empty-icon">🔔</div><h4>No Notifications</h4><p>You're all caught up!</p></div>`
        : notifs.map(n => `
          <div class="notif-item">
            <div class="notif-icon" style="background:var(--${typeColors[n.type]}-glow);color:var(--${typeColors[n.type]})">
              ${typeIcons[n.type]||'📢'}
            </div>
            <div class="notif-content">
              <strong>${n.type === 'confirmation' ? 'Payment Confirmation' : 'Due Date Reminder'}</strong>
              <p>${n.message}</p>
              <span class="time">${formatDate(n.sent_at)}</span>
            </div>
          </div>`).join('')}
    </div>`;
}

function renderSettings() {
  App.setTopbar('Settings', 'Account & system preferences');
  document.getElementById('page-content').innerHTML = `
    <div class="page-header">
      <div><h2>Settings</h2><p>Manage your account preferences</p></div>
    </div>
    <div class="grid-2" style="gap:1.5rem">
      <div class="card">
        <h4 class="mb-4">Account Information</h4>
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input class="form-control" value="${App.currentUser.name}" id="set-name">
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="form-control" value="${App.currentUser.email}" disabled>
        </div>
        <div class="form-group">
          <label class="form-label">Role</label>
          <input class="form-control" value="${App.currentUser.role}" disabled>
        </div>
        <button class="btn btn-primary" onclick="Toast.show('Profile updated successfully!','success')">Save Changes</button>
      </div>
      <div class="card">
        <h4 class="mb-4">Change Password</h4>
        <div class="form-group">
          <label class="form-label">Current Password</label>
          <input type="password" class="form-control" placeholder="••••••••">
        </div>
        <div class="form-group">
          <label class="form-label">New Password</label>
          <input type="password" class="form-control" placeholder="••••••••">
        </div>
        <div class="form-group">
          <label class="form-label">Confirm New Password</label>
          <input type="password" class="form-control" placeholder="••••••••">
        </div>
        <button class="btn btn-primary" onclick="Toast.show('Password updated!','success')">Update Password</button>
      </div>
      ${App.currentUser.role === 'admin' ? `
      <div class="card">
        <h4 class="mb-2">Generate Login Credentials</h4>
        <p class="text-sm mb-4">Create username and temporary password access for students, staff, or accountants.</p>
        <form onsubmit="createManagedAccount(event)">
          <div class="form-group"><label class="form-label" for="managed-name">Full Name *</label><input class="form-control" id="managed-name" required></div>
          <div class="form-group"><label class="form-label" for="managed-username">Username *</label><input class="form-control" id="managed-username" autocomplete="username" required></div>
          <div class="form-group"><label class="form-label" for="managed-email">Email *</label><input type="email" class="form-control" id="managed-email" autocomplete="email" required></div>
          <div class="form-row">
            <div class="form-group"><label class="form-label" for="managed-password">Temporary Password *</label><input type="text" class="form-control" id="managed-password" autocomplete="new-password" required></div>
            <div class="form-group"><label class="form-label" for="managed-role">Role *</label><select class="form-control" id="managed-role" onchange="toggleManagedStudent()"><option value="staff">Staff</option><option value="accountant">Accountant</option><option value="student">Student</option></select></div>
          </div>
          <div class="form-group" id="managed-student-group" style="display:none"><label class="form-label" for="managed-student">Student *</label><select class="form-control" id="managed-student" onchange="toggleManagedStudent()"><option value="">Select a student</option>${FMS.getStudents().filter(student => !student.user_id).map(student => `<option value="${student.student_id}">${student.name} · ${student.roll}</option>`).join('')}</select></div>
          <div class="d-flex gap-2"><button type="button" class="btn btn-ghost" onclick="generateManagedCredentials()">Generate Username & Password</button><button type="submit" class="btn btn-primary">Create Account</button></div>
        </form>
      </div>` : ''}
      <div class="card">
        <h4 class="mb-4">Demo Data</h4>
        <p class="mb-4">Reset the demo database to its original state with all seed data.</p>
        <button class="btn btn-red" onclick="if(confirm('Reset all data to seed state?')){FMS.reset();Toast.show('Data reset!','success')}">🔄 Reset Demo Data</button>
      </div>
    </div>`;
}

function createManagedAccount(event) {
  event.preventDefault();
  if (App.currentUser?.role !== 'admin') {
    Toast.show('Only administrators can create staff accounts.', 'error');
    return;
  }

  const role = document.getElementById('managed-role').value;
  const studentId = role === 'student' ? Number(document.getElementById('managed-student').value) : null;
  if (role === 'student' && !studentId) {
    Toast.show('Select a student before creating a student login.', 'warning');
    return;
  }
  const result = role === 'student' ? FMS.createStudentLogin(
    studentId,
    document.getElementById('managed-username').value,
    document.getElementById('managed-password').value
  ) : FMS.registerUser({
    name: document.getElementById('managed-name').value,
    username: document.getElementById('managed-username').value,
    email: document.getElementById('managed-email').value,
    password: document.getElementById('managed-password').value,
    role,
  });

  if (!result.success) {
    Toast.show(result.msg, 'error');
    return;
  }

  console.info('[Admin] Managed account created:', result.user);
  event.target.reset();
  Toast.show(`${result.user.role} account created successfully.`, 'success');
}

function toggleManagedStudent() {
  const isStudent = document.getElementById('managed-role')?.value === 'student';
  const group = document.getElementById('managed-student-group');
  if (group) group.style.display = isStudent ? '' : 'none';
  if (isStudent) {
    const select = document.getElementById('managed-student');
    const student = FMS.getStudentById(select?.value);
    if (student) {
      document.getElementById('managed-name').value = student.name;
      document.getElementById('managed-email').value = student.email || `${student.roll.toLowerCase()}@fms.edu`;
    }
  }
}

function generateManagedCredentials() {
  const role = document.getElementById('managed-role')?.value;
  const student = role === 'student' ? FMS.getStudentById(document.getElementById('managed-student')?.value) : null;
  const base = student ? student.roll.toLowerCase() : (document.getElementById('managed-name')?.value || role || 'user').toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
  document.getElementById('managed-username').value = `${base || 'user'}${Math.floor(100 + Math.random() * 900)}`;
  document.getElementById('managed-password').value = `Fms@${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  Toast.show('Credentials generated. Save them securely.', 'success');
}

/* ─── TOAST ────────────────────────────────────────── */
const Toast = {
  show(msg, type='info', duration=3500) {
    const icons = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ️'}</span><span class="toast-msg">${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

/* ─── MODAL HELPERS ─────────────────────────────────── */
const Modal = {
  open(id, focusSelector = null) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('open');
      document.body.style.overflow='hidden';
      if (focusSelector) this.focus(id, focusSelector);
    }
  },
  focus(id, selector) {
    requestAnimationFrame(() => {
      const modal = document.getElementById(id);
      const field = modal?.querySelector(selector);
      if (!field) return;
      field.focus({ preventScroll: true });
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (typeof field.setSelectionRange === 'function') {
        const end = field.value.length;
        field.setSelectionRange(end, end);
      }
    });
  },
  close(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('open'); document.body.style.overflow=''; }
  },
  closeAll() {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    document.body.style.overflow='';
  }
};

/* ─── UTILITY FUNCTIONS ─────────────────────────────── */
function formatCurrency(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits:0, maximumFractionDigits:2 });
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

function getStatusBadge(status) {
  const map = {
    success: '<span class="badge badge-green">✓ Paid</span>',
    pending: '<span class="badge badge-amber">⏳ Pending</span>',
    failed:  '<span class="badge badge-red">✗ Failed</span>',
    paid:    '<span class="badge badge-green">✓ Paid</span>',
    partial: '<span class="badge badge-amber">⚡ Partial</span>',
    unpaid:  '<span class="badge badge-red">✗ Unpaid</span>',
    active:  '<span class="badge badge-green">● Active</span>',
    inactive:'<span class="badge badge-gray">● Inactive</span>',
  };
  return map[status] || `<span class="badge badge-gray">${status}</span>`;
}

function getModeIcon(mode) {
  const icons = { online:'💳', cash:'💵', cheque:'🏦', dd:'📜' };
  const labels = { online:'Online', cash:'Cash', cheque:'Cheque', dd:'D/D' };
  return `${icons[mode]||'💰'} ${labels[mode]||mode}`;
}

function getInitials(name) {
  return name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
}

function generateTxnId() {
  return 'TXN' + Date.now() + Math.floor(Math.random()*1000);
}

function debounce(fn, delay=300) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(()=>fn(...args), delay); };
}
