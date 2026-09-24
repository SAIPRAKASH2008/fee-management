/* =====================================================
   admin.js — Admin Dashboard Module
   ===================================================== */

const Admin = {

  // ─── MAIN DASHBOARD ─────────────────────────────────
  renderDashboard() {
    App.setTopbar('Admin Dashboard', 'System overview and analytics');
    const stats = FMS.getDashboardStats();
    const modes = FMS.getMonthlyBreakdown();
    const students = FMS.getStudents().filter(s=>s.status==='active');
    const courseDistrib = {};
    students.forEach(s => { courseDistrib[s.course] = (courseDistrib[s.course]||0)+1; });

    document.getElementById('page-content').innerHTML = `
      <!-- Stat Cards -->
      <div class="grid-4 mb-6 stagger">
        <div class="stat-card blue animate-fade">
          <div class="stat-icon">💰</div>
          <div class="stat-value">${formatCurrency(stats.todayCollection)}</div>
          <div class="stat-label">Today's Collection</div>
          <div class="stat-change up">▲ Live Realtime</div>
        </div>
        <div class="stat-card green animate-fade">
          <div class="stat-icon">✅</div>
          <div class="stat-value">${formatCurrency(stats.totalCollection)}</div>
          <div class="stat-label">Total Collected</div>
          <div class="stat-change up">▲ All time</div>
        </div>
        <div class="stat-card amber animate-fade">
          <div class="stat-icon">⏳</div>
          <div class="stat-value">${stats.defaulters}</div>
          <div class="stat-label">Active Defaulters</div>
          <div class="stat-change down">▼ Pending Action</div>
        </div>
        <div class="stat-card purple animate-fade">
          <div class="stat-icon">🎓</div>
          <div class="stat-value">${stats.totalStudents}</div>
          <div class="stat-label">Enrolled Students</div>
          <div class="stat-change up">▲ Across all branches</div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid-2 mb-6" style="gap:1.5rem">
        <div class="card">
          <div class="card-header">
            <div><div class="card-title">Collection vs Pending</div><div class="card-subtitle">Overall fee distribution</div></div>
          </div>
          <div class="chart-container" style="max-width:300px;margin:0 auto">
            <canvas id="admin-donut-chart" height="280"></canvas>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div><div class="card-title">Monthly Collection Trend</div><div class="card-subtitle">Last 6 months</div></div>
          </div>
          <div class="chart-container" style="height:240px">
            <canvas id="admin-monthly-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Second Charts Row -->
      <div class="grid-2 mb-6" style="gap:1.5rem">
        <div class="card">
          <div class="card-header">
            <div><div class="card-title">Payment Mode Breakdown</div><div class="card-subtitle">Online vs offline distribution</div></div>
          </div>
          <div class="chart-container" style="max-width:280px;margin:0 auto">
            <canvas id="admin-mode-chart" height="250"></canvas>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div><div class="card-title">Students by Branch / Course</div><div class="card-subtitle">Enrollment across college departments</div></div>
          </div>
          <div class="chart-container" style="height:220px">
            <canvas id="admin-course-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Quick Actions + Recent Activity -->
      <div class="grid-2" style="gap:1.5rem">
        <div class="card">
          <div class="card-title mb-4">Quick Admin Operations</div>
          <div class="d-flex flex-col gap-3">
            <button class="btn btn-primary btn-full" onclick="Admin.openAddStudentModal()">➕ Register New Student</button>
            <button class="btn btn-amber btn-full" onclick="App.navigate('fee-structures')">💰 Manage Branch Fee Structures</button>
            <button class="btn btn-green btn-full" onclick="App.navigate('defaulters')">⚠️ View Defaulters (${stats.defaulters})</button>
            <button class="btn btn-ghost btn-full" onclick="App.navigate('reports')">📈 Financial Reports & Analytics</button>
            <button class="btn btn-ghost btn-full" onclick="Admin.sendBulkReminders()">📧 Send Due Reminders</button>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">Recent Transactions</div>
            <button class="btn btn-sm btn-ghost" onclick="App.navigate('payments')">View All →</button>
          </div>
          ${stats.recentPayments.map(p => {
            const student = FMS.getStudentById(p.student_id);
            const fh = FMS.getFeeHeads().find(h=>h.fee_head_id===p.fee_head_id);
            return `<div class="activity-item">
              <div class="activity-dot" style="background:var(--green)"></div>
              <div class="activity-body">
                <strong>${student?.name||'—'} (${student?.course||'—'})</strong>
                <p>${fh?.head_name||'—'} · ${p.gateway ? `⚡ ${p.gateway}` : getModeIcon(p.payment_mode)}</p>
              </div>
              <div class="d-flex flex-col items-end gap-1">
                <span class="font-bold text-green text-sm">${formatCurrency(p.amount_paid)}</span>
                <span class="activity-time">${formatDateShort(p.payment_date)}</span>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>`;

    setTimeout(() => {
      Charts.renderCollectionDonut('admin-donut-chart', stats.totalCollection, stats.pending);
      Charts.renderMonthlyBar('admin-monthly-chart', stats.months, stats.monthlyData);
      Charts.renderPaymentModePie('admin-mode-chart', modes);
      Charts.renderCourseBar('admin-course-chart', courseDistrib);
    }, 100);
  },

  sendBulkReminders() {
    const defaulters = FMS.getDefaulters();
    defaulters.forEach(s => {
      FMS.addNotification({
        student_id: s.student_id,
        message: `Reminder: You have pending dues of ${formatCurrency(s.pending)} for ${s.course} ${s.semester}. Please clear at the earliest.`,
        type: 'reminder',
      });
    });
    Toast.show(`Reminders dispatched to ${defaulters.length} students.`, 'success');
  },

  // ─── STUDENT MANAGEMENT ─────────────────────────────
  renderStudents() {
    App.setTopbar('Students', 'Manage all college branch students');
    this._renderStudentList(FMS.getStudents());
  },

  _renderStudentList(students) {
    document.getElementById('page-content').innerHTML = `
      <div class="page-header">
        <div><h2>Student Management</h2><p>${students.length} students enrolled · All college branches</p></div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="Admin.openAddStudentModal()">➕ Add / Register Student</button>
        </div>
      </div>

      <div class="toolbar">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Search name, roll, course..." oninput="Admin.filterStudents(this.value)">
        </div>
        <select class="form-control" style="width:auto" onchange="Admin.filterByCourse(this.value)" id="course-filter">
          <option value="">All Branches / Courses</option>
          ${FMS.COURSES.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
        <select class="form-control" style="width:auto" onchange="Admin.filterByStatus(this.value)" id="status-filter">
          <option value="">All Status</option>
          <option value="active">Active</option><option value="inactive">Inactive</option>
        </select>
      </div>

      <div class="card">
        <div class="table-wrapper">
          <table>
            <thead><tr>
              <th>Student</th><th>Roll No</th><th>Branch</th><th>Semester</th>
              <th>Category</th><th>Fee Structure</th><th>Dues</th><th>Login</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody id="students-tbody">
              ${this.renderStudentRows(students)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Student Modal -->
      <div class="modal-overlay" id="student-modal">
        <form class="modal modal-lg" onsubmit="Admin.saveStudent(event)">
          <div class="modal-header">
            <h3 class="modal-title" id="student-modal-title">➕ Register Student</h3>
            <button type="button" class="modal-close" onclick="Modal.close('student-modal')">✕</button>
          </div>
          <div class="modal-body" id="student-modal-body"></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-ghost" onclick="Modal.close('student-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary">Save & Register</button>
          </div>
        </form>
      </div>`;
  },

  renderStudentRows(students) {
    if (!students.length) return '<tr><td colspan="10" class="text-center text-muted" style="padding:2rem">No students found</td></tr>';
    return students.map(s => {
      const dues = FMS.getStudentDues(s.student_id);
      const fs = FMS.getFeeStructureById(s.fee_structure_id);
      return `<tr>
        <td>
          <div class="d-flex items-center gap-2">
            <div class="avatar avatar-sm" style="background:${s.category==='scholarship'?'linear-gradient(135deg,#8b5cf6,#3b82f6)':'linear-gradient(135deg,#3b82f6,#10b981)'}">${getInitials(s.name)}</div>
            <div>
              <div class="font-semibold">${s.name}</div>
              <div class="text-xs text-muted">${s.email||'—'}</div>
            </div>
          </div>
        </td>
        <td class="td-muted font-mono font-semibold">${s.roll}</td>
        <td><span class="badge badge-blue">${s.course}</span></td>
        <td class="td-muted font-semibold">${s.semester}</td>
        <td><span class="badge ${s.category==='scholarship'?'badge-purple':'badge-gray'}">${s.category}</span></td>
        <td class="text-xs td-muted">${fs?.name || `${s.course} - ${s.semester}`}</td>
        <td>
          <div class="font-semibold ${dues.pending>0?'text-amber':'text-green'}">${formatCurrency(dues.pending)}</div>
          <div class="text-xs text-muted">of ${formatCurrency(dues.total)}</div>
        </td>
        <td>${s.user_id
          ? '<span class="badge badge-green">Created</span>'
          : `<button class="btn btn-sm btn-ghost" onclick="Admin.openCredentialsModal(${s.student_id})" title="Generate student login">🔑 Generate</button>`}</td>
        <td>${getStatusBadge(s.status)}</td>
        <td class="td-actions">
          <button class="btn btn-icon" onclick="Admin.editStudent(${s.student_id})" title="Edit">✏️</button>
          <button class="btn btn-icon" onclick="Admin.toggleStudentStatus(${s.student_id})" title="${s.status==='active'?'Deactivate':'Activate'}">${s.status==='active'?'🚫':'✅'}</button>
          <button class="btn btn-icon" onclick="Admin.viewStudentDues(${s.student_id})" title="View Dues">👁</button>
        </td>
      </tr>`;
    }).join('');
  },

  openCredentialsModal(studentId) {
    const student = FMS.getStudentById(studentId);
    if (!student || student.user_id) {
      Toast.show('This student already has a login account.', 'info');
      return;
    }

    const username = `${student.roll.toLowerCase()}${String(student.student_id).padStart(2, '0')}`;
    const password = `Fms@${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'student-credentials-modal';
    modal.innerHTML = `
      <form class="modal" onsubmit="Admin.saveStudentCredentials(event, ${student.student_id})">
        <div class="modal-header">
          <h3 class="modal-title">🔑 Generate Student Login</h3>
          <button type="button" class="modal-close" onclick="Modal.close('student-credentials-modal')">✕</button>
        </div>
        <div class="modal-body">
          <p class="text-sm text-muted mb-4">Create portal credentials for <strong>${student.name}</strong>. Share these details securely with the student.</p>
          <div class="form-group">
            <label class="form-label" for="student-login-username">Username *</label>
            <input class="form-control" id="student-login-username" value="${username}" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="student-login-password">Temporary Password *</label>
            <div class="input-group">
              <input class="form-control" id="student-login-password" value="${password}" required minlength="6">
              <button type="button" class="btn btn-ghost btn-sm" onclick="Admin.regenerateStudentPassword()">New</button>
            </div>
          </div>
          <div class="alert alert-info"><span class="alert-icon">💡</span><div>The student can use this username and password on the portal login page.</div></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-ghost" onclick="Modal.close('student-credentials-modal')">Cancel</button>
          <button type="submit" class="btn btn-primary">Create Login</button>
        </div>
      </form>`;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('open'), 10);
  },

  regenerateStudentPassword() {
    const input = document.getElementById('student-login-password');
    if (input) input.value = `Fms@${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  },

  saveStudentCredentials(event, studentId) {
    event.preventDefault();
    const username = document.getElementById('student-login-username')?.value.trim();
    const password = document.getElementById('student-login-password')?.value.trim();
    const result = FMS.createStudentLogin(studentId, username, password);
    if (!result.success) {
      Toast.show(result.msg, 'error');
      return;
    }
    const student = FMS.getStudentById(studentId);
    FMS.addAuditLog({ user_id: App.currentUser.user_id, action: `Student login created: ${student.name} (${username})`, entity: 'Auth', timestamp: new Date().toISOString() });
    Modal.close('student-credentials-modal');
    this.renderStudents();
    this.showGeneratedCredentials(student, username, password);
  },

  showGeneratedCredentials(student, username, password) {
    const existing = document.getElementById('generated-credentials-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'generated-credentials-modal';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">✅ Student Login Created</h3>
          <button type="button" class="modal-close" onclick="Modal.close('generated-credentials-modal')">✕</button>
        </div>
        <div class="modal-body">
          <p class="text-sm text-muted mb-4">Give these credentials to <strong>${student.name}</strong>.</p>
          <div class="form-group">
            <label class="form-label">Username</label>
            <input class="form-control font-mono" value="${username}" readonly>
          </div>
          <div class="form-group">
            <label class="form-label">Temporary Password</label>
            <input class="form-control font-mono" value="${password}" readonly>
          </div>
          <div class="alert alert-warning"><span class="alert-icon">⚠️</span><div>Save or share these credentials securely. The password cannot be viewed again.</div></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" onclick="Admin.continueAddingStudent()">Done</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('open'), 10);
  },

  continueAddingStudent() {
    Modal.close('generated-credentials-modal');
    this.renderStudents();
    this.openAddStudentModal();
  },

  renderStudentForm(student=null) {
    const courses = FMS.COURSES;
    const semesters = FMS.SEMESTERS;
    const selectedCourse = student?.course || courses[0];
    const selectedSem = student?.semester || semesters[0];
    const fsList = FMS.getFeeStructures();

    return `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Full Name *</label>
          <input class="form-control" id="s-name" placeholder="Enter student full name" value="${student?.name||''}">
        </div>
        <div class="form-group">
          <label class="form-label">Roll Number *</label>
          <div class="input-group">
            <input class="form-control" id="s-roll" placeholder="e.g. ECE2401" value="${student?.roll||''}">
            <button type="button" class="btn btn-ghost btn-sm" onclick="Admin.generateRollNumber()">Auto</button>
          </div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Branch / Course *</label>
          <select class="form-control" id="s-course" onchange="Admin.onBranchOrSemChange()">
            ${courses.map(c => `<option value="${c}" ${c === selectedCourse ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Exact Semester * (No random semester)</label>
          <select class="form-control" id="s-semester" onchange="Admin.onBranchOrSemChange()">
            ${semesters.map(s => `<option value="${s}" ${s === selectedSem ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Email Address *</label>
          <input type="email" class="form-control" id="s-email" placeholder="student@fms.edu" value="${student?.email||''}">
        </div>
        <div class="form-group">
          <label class="form-label">Mobile Number</label>
          <input class="form-control" id="s-contact" placeholder="10-digit mobile" maxlength="10" value="${student?.contact||''}">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Student Category</label>
          <select class="form-control" id="s-category">
            <option value="regular" ${student?.category==='regular'?'selected':''}>Regular</option>
            <option value="scholarship" ${student?.category==='scholarship'?'selected':''}>Scholarship / Concession</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Assigned Fee Structure</label>
          <select class="form-control" id="s-fee-structure">
            <option value="auto">⚡ Auto-assign tailored fee structure for this branch & sem</option>
            ${fsList.map(fs => `<option value="${fs.fee_structure_id}" ${student?.fee_structure_id===fs.fee_structure_id?'selected':''}>${fs.name} (${formatCurrency(fs.total_amount)})</option>`).join('')}
          </select>
        </div>
      </div>

      <div id="fee-preview-box" class="alert alert-info" style="margin-top:.5rem">
        <span class="alert-icon">💡</span>
        <div id="fee-preview-text">Selecting standard fee structure for <strong>${selectedCourse}</strong> (${selectedSem}).</div>
      </div>

      ${!student ? `
      <div class="form-group" style="margin-top:1rem">
        <label class="d-flex items-center gap-2" style="cursor:pointer">
          <input type="checkbox" id="s-create-login">
          <span class="form-label" style="margin:0">Create student login now</span>
        </label>
        <div class="text-xs text-muted" style="margin-top:.35rem">The student will be able to sign in and view their profile, assigned fees, dues, and payment gateway history.</div>
      </div>` : ''}`;
  },

  onBranchOrSemChange() {
    const course = document.getElementById('s-course')?.value;
    const sem = document.getElementById('s-semester')?.value;
    const preview = document.getElementById('fee-preview-text');
    if (preview) {
      preview.innerHTML = `Assigning tailored fee structure for <strong>${course}</strong> in <strong>${sem}</strong>.`;
    }
  },

  generateRollNumber() {
    const course = document.getElementById('s-course')?.value || 'B.Tech CSE';
    const sem = document.getElementById('s-semester')?.value || 'Sem 1';
    
    const prefixes = {
      'B.Tech CSE': 'BTC',
      'B.Tech ECE': 'ECE',
      'B.Tech Mechanical': 'MEC',
      'B.Tech Civil': 'CIV',
      'B.Tech EEE': 'EEE',
      'B.Tech IT': 'BIT',
      'B.Tech AI & DS': 'AID',
      'B.Sc Computer Science': 'BSC',
      'B.Sc Mathematics': 'BSM',
      'B.Sc Physics': 'BSP',
      'BCA': 'BCA',
      'MCA': 'MCA',
      'B.Com General': 'BCG',
      'B.Com Computers': 'BCC',
      'BBA': 'BBA',
      'MBA': 'MBA'
    };

    const prefix = prefixes[course] || 'STU';
    const num = Math.floor(1000 + Math.random() * 9000);
    const rollEl = document.getElementById('s-roll');
    if (rollEl) rollEl.value = `${prefix}26${num.toString().slice(0,2)}`;
  },

  _editStudentId: null,

  openAddStudentModal() {
    this._editStudentId = null;
    const modal = document.getElementById('student-modal');
    if (!modal) {
      this.renderStudents();
      setTimeout(() => this.openAddStudentModal(), 50);
      return;
    }
    document.getElementById('student-modal-title').textContent = '➕ Register New Student';
    document.getElementById('student-modal-body').innerHTML = this.renderStudentForm();
    Modal.open('student-modal', '#s-name');
  },

  editStudent(id) {
    const student = FMS.getStudentById(id);
    if (!student) return;
    this._editStudentId = id;
    document.getElementById('student-modal-title').textContent = '✏️ Edit Student Details';
    document.getElementById('student-modal-body').innerHTML = this.renderStudentForm(student);
    Modal.open('student-modal');
  },

  saveStudent(event) {
    event?.preventDefault();
    const name = document.getElementById('s-name')?.value?.trim();
    const roll = document.getElementById('s-roll')?.value?.trim();
    const course = document.getElementById('s-course')?.value;
    const sem = document.getElementById('s-semester')?.value;
    const email = document.getElementById('s-email')?.value?.trim();
    const contact = document.getElementById('s-contact')?.value?.trim();
    const category = document.getElementById('s-category')?.value;
    const fsVal = document.getElementById('s-fee-structure')?.value;
    const createLogin = !this._editStudentId && document.getElementById('s-create-login')?.checked;
    let generatedCredentials = null;

    if (!name) { Toast.show('Student name is required.','warning'); return; }
    if (!roll) { Toast.show('Roll number is required.','warning'); return; }

    let feeStructureId = (fsVal && fsVal !== 'auto') ? parseInt(fsVal) : null;
    if (!feeStructureId) {
      const match = FMS.getOrCreateFeeStructure(course, sem);
      feeStructureId = match.fee_structure_id;
    }

    const data = {
      name, roll, course, semester: sem,
      email: email || `${roll.toLowerCase()}@fms.edu`,
      contact: contact || '9876543210',
      category,
      fee_structure_id: feeStructureId
    };

    if (this._editStudentId) {
      FMS.updateStudent(this._editStudentId, data);
      FMS.addAuditLog({ user_id: App.currentUser.user_id, action:`Student updated: ${name} (${roll} - ${course} ${sem})`, entity:'Student', timestamp: new Date().toISOString() });
      Toast.show('Student record updated successfully!','success');
    } else {
      const newStudent = FMS.addStudent(data);
      console.info('[Admin] Student registered:', newStudent);
      FMS.addAuditLog({ user_id: App.currentUser.user_id, action:`New student registered: ${name} (${roll} - ${course} ${sem})`, entity:'Student', timestamp: new Date().toISOString() });
      Toast.show(`Student ${name} successfully registered in ${course} (${sem})!`, 'success');

      if (createLogin) {
        const username = `${roll.toLowerCase()}${String(newStudent.student_id).padStart(2, '0')}`;
        const password = `Fms@${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        const loginResult = FMS.createStudentLogin(newStudent.student_id, username, password);
        if (loginResult.success) {
          generatedCredentials = { student: FMS.getStudentById(newStudent.student_id), username, password };
        } else {
          Toast.show(`Student added, but login could not be created: ${loginResult.msg}`, 'warning');
        }
      }
    }

    Modal.close('student-modal');
    this.renderStudents();
    console.info('[Admin] Student table refreshed. Total students:', FMS.getStudents().length);
    if (generatedCredentials) {
      this.showGeneratedCredentials(generatedCredentials.student, generatedCredentials.username, generatedCredentials.password);
    } else {
      this.openAddStudentModal();
    }
  },

  toggleStudentStatus(id) {
    const student = FMS.getStudentById(id);
    if (!student) return;
    const newStatus = student.status === 'active' ? 'inactive' : 'active';
    FMS.updateStudent(id, { status: newStatus });
    FMS.addAuditLog({ user_id: App.currentUser.user_id, action:`Student status set to ${newStatus}: ${student.name}`, entity:'Student', timestamp: new Date().toISOString() });
    Toast.show(`Student ${newStatus === 'active' ? 'activated' : 'deactivated'}.`, 'success');
    this.renderStudents();
  },

  viewStudentDues(id) {
    const student = FMS.getStudentById(id);
    const dues = FMS.getStudentDues(id);
    const existing = document.getElementById('dues-view-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'dues-view-modal';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Fee Ledger — ${student.name}</h3>
          <button class="modal-close" onclick="Modal.close('dues-view-modal')">✕</button>
        </div>
        <div class="modal-body">
          <div class="d-flex items-center gap-3 mb-3">
            <div class="avatar">${getInitials(student.name)}</div>
            <div>
              <div class="font-semibold">${student.name}</div>
              <div class="text-xs text-muted">${student.roll} · ${student.course} · ${student.semester}</div>
            </div>
          </div>
          <div class="d-flex gap-4 mb-4">
            <div class="stat-card blue" style="flex:1;padding:.875rem">
              <div class="stat-value" style="font-size:1.15rem">${formatCurrency(dues.total)}</div>
              <div class="stat-label">Total</div>
            </div>
            <div class="stat-card green" style="flex:1;padding:.875rem">
              <div class="stat-value" style="font-size:1.15rem">${formatCurrency(dues.paid)}</div>
              <div class="stat-label">Paid</div>
            </div>
            <div class="stat-card amber" style="flex:1;padding:.875rem">
              <div class="stat-value" style="font-size:1.15rem">${formatCurrency(dues.pending)}</div>
              <div class="stat-label">Pending</div>
            </div>
          </div>
          <div class="card-title text-sm mb-2">Fee Head Breakdown</div>
          ${dues.heads.map(h=>`
            <div class="d-flex justify-between items-center py-2" style="border-bottom:1px solid var(--border)">
              <div>
                <div class="font-medium text-sm">${h.head_name}</div>
                <div class="text-xs text-muted">Due: ${formatDateShort(h.due_date)} ${h.overdue&&h.remaining>0?'<span class="text-red">· Overdue</span>':''}</div>
              </div>
              <div class="d-flex items-center gap-3">
                <span class="text-sm font-semibold">${formatCurrency(h.remaining)} rem</span>
                ${getStatusBadge(h.status)}
              </div>
            </div>`).join('')}
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="Modal.close('dues-view-modal')">Close</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('open'), 10);
  },

  filterStudents: debounce(function(query) {
    const courseFilter = document.getElementById('course-filter')?.value||'';
    const statusFilter = document.getElementById('status-filter')?.value||'';
    let students = FMS.getStudents();
    if (query) students = students.filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || s.roll.toLowerCase().includes(query.toLowerCase()) || s.course.toLowerCase().includes(query.toLowerCase()));
    if (courseFilter) students = students.filter(s => s.course === courseFilter);
    if (statusFilter) students = students.filter(s => s.status === statusFilter);
    document.getElementById('students-tbody').innerHTML = Admin.renderStudentRows(students);
  }, 250),

  filterByCourse(course) {
    let students = FMS.getStudents();
    if (course) students = students.filter(s => s.course === course);
    document.getElementById('students-tbody').innerHTML = this.renderStudentRows(students);
  },

  filterByStatus(status) {
    let students = FMS.getStudents();
    if (status) students = students.filter(s => s.status === status);
    document.getElementById('students-tbody').innerHTML = this.renderStudentRows(students);
  },

  // ─── FEE STRUCTURES ─────────────────────────────────
  renderFeeStructures() {
    App.setTopbar('Fee Structures', 'Branch-wise fee structures & fee heads');
    const structs = FMS.getFeeStructures();

    document.getElementById('page-content').innerHTML = `
      <div class="page-header">
        <div><h2>Fee Structures</h2><p>${structs.length} structures defined across college branches</p></div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="Admin.openAddFSModal()">➕ Create Fee Structure</button>
        </div>
      </div>

      <div class="grid-auto">
        ${structs.map(fs => {
          const heads = FMS.getFeeHeadsByStructure(fs.fee_structure_id);
          return `
            <div class="fee-structure-card">
              <div class="fee-structure-header">
                <div>
                  <div class="font-bold">${fs.name}</div>
                  <div class="text-xs text-muted mt-1">${fs.course} · ${fs.semester}</div>
                  <div class="text-xs mt-1"><span class="badge badge-blue">${heads.length} fee heads</span></div>
                </div>
                <div class="d-flex flex-col items-end gap-2">
                  <div class="font-extrabold text-xl text-blue">${formatCurrency(fs.total_amount)}</div>
                  <button class="btn btn-icon btn-sm" onclick="Admin.addFeeHeadTo(${fs.fee_structure_id})" title="Add fee head">➕</button>
                </div>
              </div>
              <div class="fee-structure-body">
                ${heads.map(h=>`
                  <div class="fee-head-row">
                    <div>
                      <div class="fee-head-name">${h.head_name}</div>
                      <div class="fee-head-due">Due: ${formatDateShort(h.due_date)}</div>
                    </div>
                    <div class="fee-head-amount">${formatCurrency(h.amount)}</div>
                  </div>`).join('')}
              </div>
              <div class="fee-structure-total">
                <span>Total Fee</span>
                <span class="gradient-text" style="font-size:1.125rem">${formatCurrency(fs.total_amount)}</span>
              </div>
            </div>`;
        }).join('')}
      </div>

      <!-- Add Structure Modal -->
      <div class="modal-overlay" id="fs-modal">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="fs-modal-title">➕ New Fee Structure</h3>
            <button class="modal-close" onclick="Modal.close('fs-modal')">✕</button>
          </div>
          <div class="modal-body" id="fs-modal-body"></div>
          <div class="modal-footer">
            <button class="btn btn-ghost" onclick="Modal.close('fs-modal')">Cancel</button>
            <button class="btn btn-primary" id="fs-save-btn">Save Structure</button>
          </div>
        </div>
      </div>`;
  },

  openAddFSModal() {
    this._fhRowCount = 3;
    document.getElementById('fs-modal-title').textContent = '➕ Create Branch Fee Structure';
    document.getElementById('fs-modal-body').innerHTML = `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Branch / Course *</label>
          <select class="form-control" id="fs-course" onchange="document.getElementById('fs-name').value = this.value + ' – ' + document.getElementById('fs-semester').value">
            ${FMS.COURSES.map(c=>`<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Semester *</label>
          <select class="form-control" id="fs-semester" onchange="document.getElementById('fs-name').value = document.getElementById('fs-course').value + ' – ' + this.value">
            ${FMS.SEMESTERS.map(s=>`<option value="${s}">${s}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Structure Title *</label>
        <input class="form-control" id="fs-name" value="B.Tech CSE – Sem 1">
      </div>
      <div class="divider"></div>
      <div class="d-flex justify-between items-center mb-3">
        <h5>Fee Heads Breakdown</h5>
        <button class="btn btn-sm btn-ghost" onclick="Admin.addFHRow()">➕ Add Row</button>
      </div>
      <div id="fh-rows">
        ${this.renderFHRow(0, 'Tuition Fee', 45000)}
        ${this.renderFHRow(1, 'Lab & Amenities', 12000)}
        ${this.renderFHRow(2, 'Exam & Library', 5000)}
      </div>`;
    document.getElementById('fs-save-btn').onclick = () => this.saveFeeStructure();
    Modal.open('fs-modal', '#fs-name');
  },

  _fhRowCount: 3,
  renderFHRow(i, defName='', defAmt='') {
    return `<div class="form-row grid-3 mb-2" id="fh-row-${i}" style="gap:.5rem">
      <div><input class="form-control" placeholder="Head name" id="fh-name-${i}" value="${defName}"></div>
      <div class="input-group"><span class="input-group-prefix">₹</span><input type="number" class="form-control" placeholder="Amount" id="fh-amount-${i}" value="${defAmt}" min="0"></div>
      <div><input type="date" class="form-control" id="fh-due-${i}" value="2026-07-31"></div>
    </div>`;
  },
  addFHRow() {
    const cont = document.getElementById('fh-rows');
    cont.insertAdjacentHTML('beforeend', this.renderFHRow(this._fhRowCount++));
  },

  saveFeeStructure() {
    const name = document.getElementById('fs-name')?.value?.trim();
    const course = document.getElementById('fs-course')?.value;
    const sem = document.getElementById('fs-semester')?.value;
    if (!name) { Toast.show('Please enter a structure name.','warning'); return; }
    
    const fhRows = [];
    let total = 0;
    for (let i=0; i<this._fhRowCount; i++) {
      const n = document.getElementById(`fh-name-${i}`)?.value?.trim();
      const a = parseFloat(document.getElementById(`fh-amount-${i}`)?.value||0);
      const d = document.getElementById(`fh-due-${i}`)?.value;
      if (n && a > 0) {
        fhRows.push({ head_name: n, amount: a, due_date: d || '2026-07-31' });
        total += a;
      }
    }
    if (!fhRows.length) { Toast.show('Please add at least one fee head.','warning'); return; }

    const newFS = FMS.addFeeStructure({ name, course, semester: sem, total_amount: total });
    fhRows.forEach(h => FMS.addFeeHead({ fee_structure_id: newFS.fee_structure_id, ...h }));
    FMS.addAuditLog({ user_id: App.currentUser.user_id, action:`New fee structure created: ${name}`, entity:'FeeStructure', timestamp: new Date().toISOString() });
    
    Modal.close('fs-modal');
    Toast.show(`Fee structure "${name}" created successfully!`,'success');
    this._fhRowCount = 3;
    this.renderFeeStructures();
    this.openAddFSModal();
  },

  addFeeHeadTo(fsId) {
    const fs = FMS.getFeeStructureById(fsId);
    document.getElementById('fs-modal-title').textContent = `➕ Add Fee Head — ${fs?.name}`;
    document.getElementById('fs-modal-body').innerHTML = `
      <div class="form-group">
        <label class="form-label">Fee Head Name *</label>
        <input class="form-control" id="new-fh-name" placeholder="e.g. Transportation / Lab Fine">
      </div>
      <div class="form-group">
        <label class="form-label">Amount *</label>
        <div class="input-group"><span class="input-group-prefix">₹</span>
          <input type="number" class="form-control" id="new-fh-amount" placeholder="0.00" min="1">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Due Date *</label>
        <input type="date" class="form-control" id="new-fh-due" value="2026-08-31">
      </div>`;
    document.getElementById('fs-save-btn').onclick = () => {
      const n = document.getElementById('new-fh-name')?.value?.trim();
      const a = parseFloat(document.getElementById('new-fh-amount')?.value||0);
      const d = document.getElementById('new-fh-due')?.value;
      if (!n || !a) { Toast.show('Name and amount are required.','warning'); return; }
      FMS.addFeeHead({ fee_structure_id: fsId, head_name: n, amount: a, due_date: d || '2026-08-31' });
      
      const structs = FMS.getFeeStructures();
      const idx = structs.findIndex(s=>s.fee_structure_id===fsId);
      if (idx>=0) {
        structs[idx].total_amount = (structs[idx].total_amount||0)+a;
        FMS.saveFeeStructures(structs);
      }
      Modal.close('fs-modal');
      Toast.show(`Fee head "${n}" added!`,'success');
      this.renderFeeStructures();
      this.addFeeHeadTo(fsId);
    };
    Modal.open('fs-modal', '#new-fh-name');
  },

  // ─── ALL PAYMENTS ────────────────────────────────────
  renderPayments() {
    App.setTopbar('All Payments', 'Complete payment transaction history');
    const payments = [...FMS.getPayments()].filter(p=>p.status==='success').reverse();
    const total = payments.reduce((s,p)=>s+p.amount_paid,0);

    document.getElementById('page-content').innerHTML = `
      <div class="page-header">
        <div><h2>All Payment Transactions</h2><p>${payments.length} transactions · Total: ${formatCurrency(total)}</p></div>
        <div class="page-header-actions">
          <button class="btn btn-ghost" onclick="Admin.exportPaymentsCSV()">📥 Export CSV</button>
        </div>
      </div>
      <div class="toolbar">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Search student name or roll..." oninput="Admin.filterAdminPayments(this.value)">
        </div>
        <select class="form-control" style="width:auto" onchange="Admin.filterPaymentMode(this.value)">
          <option value="">All Modes & Gateways</option>
          <option value="online">Online Gateway</option><option value="cash">Cash</option>
          <option value="cheque">Cheque</option><option value="dd">DD</option>
        </select>
        <input type="date" class="form-control" style="width:auto" onchange="Admin.filterPaymentDate(this.value)">
      </div>
      <div class="card">
        <div class="table-wrapper">
          <table>
            <thead><tr>
              <th>Student</th><th>Roll</th><th>Branch</th><th>Fee Head</th>
              <th>Amount</th><th>Gateway / Mode</th><th>Txn ID</th><th>Date</th><th>Recorded By</th><th>Receipt</th>
            </tr></thead>
            <tbody id="admin-payments-tbody">
              ${this.renderPaymentRows(payments)}
            </tbody>
          </table>
        </div>
      </div>`;
  },

  renderPaymentRows(payments) {
    if (!payments.length) return '<tr><td colspan="10" class="text-center text-muted" style="padding:2rem">No payments found</td></tr>';
    return payments.map(p => {
      const s = FMS.getStudentById(p.student_id);
      const fh = FMS.getFeeHeads().find(h=>h.fee_head_id===p.fee_head_id);
      return `<tr>
        <td><div class="d-flex items-center gap-2"><div class="avatar avatar-sm">${getInitials(s?.name||'?')}</div><span class="font-medium">${s?.name||'—'}</span></div></td>
        <td class="td-muted font-mono font-semibold">${s?.roll||'—'}</td>
        <td><span class="badge badge-blue">${s?.course||'—'}</span></td>
        <td>${fh?.head_name||'—'}</td>
        <td class="font-bold text-green">${formatCurrency(p.amount_paid)}</td>
        <td>${p.gateway ? `⚡ ${p.gateway}` : getModeIcon(p.payment_mode)}</td>
        <td class="td-muted text-xs font-mono">${p.transaction_id||'Cash'}</td>
        <td class="td-muted">${formatDateShort(p.payment_date)}</td>
        <td><span class="badge badge-${p.recorded_by==='student'?'blue':'amber'}">${p.recorded_by||'—'}</span></td>
        <td class="td-actions">
          <button class="btn btn-icon" onclick="ReceiptGen.showPreview(${p.payment_id})" title="View Receipt">🧾</button>
          <button class="btn btn-icon" onclick="ReceiptGen.generate(${p.payment_id})" title="Download PDF">⬇️</button>
        </td>
      </tr>`;
    }).join('');
  },

  filterAdminPayments: debounce(function(q){ Admin._applyPaymentFilters(); }, 300),
  filterPaymentMode(mode) { this._paymentModeFilter=mode; this._applyPaymentFilters(); },
  filterPaymentDate(date) { this._paymentDateFilter=date; this._applyPaymentFilters(); },
  _paymentModeFilter:'', _paymentDateFilter:'',
  _applyPaymentFilters() {
    const q = document.querySelector('#admin-payments-tbody')?.closest('.card')?.querySelector('[type=text]')?.value?.toLowerCase()||'';
    let payments = FMS.getPayments().filter(p=>p.status==='success');
    if (q) payments=payments.filter(p=>{const s=FMS.getStudentById(p.student_id);return s?.name.toLowerCase().includes(q)||s?.roll.toLowerCase().includes(q);});
    if (this._paymentModeFilter) payments=payments.filter(p=>p.payment_mode===this._paymentModeFilter);
    if (this._paymentDateFilter) payments=payments.filter(p=>p.payment_date.startsWith(this._paymentDateFilter));
    payments.reverse();
    document.getElementById('admin-payments-tbody').innerHTML=this.renderPaymentRows(payments);
  },

  exportPaymentsCSV() {
    const payments = FMS.getPayments().filter(p=>p.status==='success');
    const rows = [['Student','Roll','Branch','Semester','Fee Head','Amount','Mode / Gateway','Txn ID','Date','Recorded By']];
    payments.forEach(p => {
      const s = FMS.getStudentById(p.student_id);
      const fh = FMS.getFeeHeads().find(h=>h.fee_head_id===p.fee_head_id);
      rows.push([s?.name||'',s?.roll||'',s?.course||'',s?.semester||'',fh?.head_name||'',p.amount_paid,p.gateway||p.payment_mode,p.transaction_id||'',p.payment_date,p.recorded_by||'']);
    });
    const csv = rows.map(r=>r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `FMS_College_Payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    Toast.show('Payment records exported to CSV!','success');
  },

  // ─── REPORTS ────────────────────────────────────────
  renderReports() {
    App.setTopbar('Reports & Analytics', 'College fee collection insights');
    const stats = FMS.getDashboardStats();
    const allPayments = FMS.getPayments().filter(p=>p.status==='success');

    document.getElementById('page-content').innerHTML = `
      <div class="page-header">
        <div><h2>Reports & Financial Analytics</h2><p>Filter by branch, date range, or payment gateway</p></div>
        <div class="page-header-actions">
          <button class="btn btn-ghost" onclick="Admin.exportPaymentsCSV()">📥 Export CSV</button>
          <button class="btn btn-primary" onclick="Admin.printReport()">🖨 Print Report</button>
        </div>
      </div>

      <!-- Filter Panel -->
      <div class="card mb-6">
        <div class="card-title mb-3">Filter Financial Records</div>
        <div class="d-flex gap-4 flex-wrap">
          <div class="form-group mb-0" style="flex:1;min-width:160px">
            <label class="form-label">From Date</label>
            <input type="date" class="form-control" id="report-from">
          </div>
          <div class="form-group mb-0" style="flex:1;min-width:160px">
            <label class="form-label">To Date</label>
            <input type="date" class="form-control" id="report-to">
          </div>
          <div class="form-group mb-0" style="flex:1;min-width:180px">
            <label class="form-label">Branch / Course</label>
            <select class="form-control" id="report-course">
              <option value="">All Branches</option>
              ${FMS.COURSES.map(c=>`<option value="${c}">${c}</option>`).join('')}
            </select>
          </div>
          <div class="form-group mb-0" style="flex:1;min-width:140px">
            <label class="form-label">Payment Mode</label>
            <select class="form-control" id="report-mode">
              <option value="">All Modes</option>
              <option value="online">Online Gateways</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="dd">Demand Draft</option>
            </select>
          </div>
          <div class="d-flex items-end">
            <button class="btn btn-primary" onclick="Admin.applyReportFilters()">Apply Filters</button>
          </div>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="grid-4 mb-6" id="report-stats">
        <div class="stat-card blue"><div class="stat-icon">💰</div><div class="stat-value">${formatCurrency(stats.totalCollection)}</div><div class="stat-label">Total Collected</div></div>
        <div class="stat-card amber"><div class="stat-icon">⏳</div><div class="stat-value">${stats.defaulters}</div><div class="stat-label">Defaulters</div></div>
        <div class="stat-card green"><div class="stat-icon">📋</div><div class="stat-value">${allPayments.length}</div><div class="stat-label">Transactions</div></div>
        <div class="stat-card purple"><div class="stat-icon">🎓</div><div class="stat-value">${stats.totalStudents}</div><div class="stat-label">Enrolled Students</div></div>
      </div>

      <!-- Report Table -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Transaction Ledger</div>
          <span class="badge badge-blue" id="report-count">${allPayments.length} records</span>
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr>
              <th>Student</th><th>Roll</th><th>Branch</th><th>Fee Head</th>
              <th>Amount</th><th>Gateway / Mode</th><th>Date</th><th>Receipt</th>
            </tr></thead>
            <tbody id="report-tbody">
              ${this.renderReportRows(allPayments.reverse())}
            </tbody>
          </table>
        </div>
      </div>`;
  },

  renderReportRows(payments) {
    if (!payments.length) return '<tr><td colspan="8" class="text-center text-muted" style="padding:2rem">No records match the filter</td></tr>';
    return payments.map(p => {
      const s = FMS.getStudentById(p.student_id);
      const fh = FMS.getFeeHeads().find(h=>h.fee_head_id===p.fee_head_id);
      return `<tr>
        <td class="font-medium">${s?.name||'—'}</td>
        <td class="td-muted font-mono">${s?.roll||'—'}</td>
        <td><span class="badge badge-blue">${s?.course||'—'}</span></td>
        <td>${fh?.head_name||'—'}</td>
        <td class="font-bold text-green">${formatCurrency(p.amount_paid)}</td>
        <td>${p.gateway ? `⚡ ${p.gateway}` : getModeIcon(p.payment_mode)}</td>
        <td class="td-muted">${formatDateShort(p.payment_date)}</td>
        <td><button class="btn btn-icon" onclick="ReceiptGen.showPreview(${p.payment_id})">🧾</button></td>
      </tr>`;
    }).join('');
  },

  applyReportFilters() {
    const from = document.getElementById('report-from')?.value;
    const to = document.getElementById('report-to')?.value;
    const course = document.getElementById('report-course')?.value;
    const mode = document.getElementById('report-mode')?.value;
    let payments = FMS.getPayments().filter(p=>p.status==='success');
    if (from) payments = payments.filter(p => p.payment_date >= from);
    if (to) payments = payments.filter(p => p.payment_date.split('T')[0] <= to);
    if (mode) payments = payments.filter(p => p.payment_mode === mode);
    if (course) {
      payments = payments.filter(p => {
        const s = FMS.getStudentById(p.student_id);
        return s?.course === course;
      });
    }
    payments.reverse();
    document.getElementById('report-tbody').innerHTML = this.renderReportRows(payments);
    document.getElementById('report-count').textContent = `${payments.length} records`;
    Toast.show(`Filter applied: ${payments.length} records found.`, 'info');
  },

  printReport() { window.print(); },

  // ─── DEFAULTERS ─────────────────────────────────────
  renderDefaulters() {
    App.setTopbar('Defaulters', 'Students with pending dues');
    const defaulters = FMS.getDefaulters();

    document.getElementById('page-content').innerHTML = `
      <div class="page-header">
        <div><h2>Defaulters List</h2><p>${defaulters.length} students with pending dues across branches</p></div>
        <div class="page-header-actions">
          <button class="btn btn-amber" onclick="Admin.sendBulkReminders()">📧 Send Reminders to All</button>
        </div>
      </div>
      ${defaulters.length === 0
        ? `<div class="card"><div class="empty-state"><div class="empty-icon">🎉</div><h4>No defaulters!</h4><p>All student fee accounts are cleared.</p></div></div>`
        : `<div class="card">
            <div class="table-wrapper">
              <table>
                <thead><tr>
                  <th>Student</th><th>Roll</th><th>Branch</th><th>Total Fee</th>
                  <th>Paid</th><th>Pending</th><th>Overdue Status</th><th>Action</th>
                </tr></thead>
                <tbody>
                  ${defaulters.map(s => {
                    const overdueH = s.heads.filter(h=>h.overdue&&h.remaining>0);
                    return `<tr>
                      <td>
                        <div class="d-flex items-center gap-2">
                          <div class="avatar avatar-sm" style="background:linear-gradient(135deg,var(--red),#f97316)">${getInitials(s.name)}</div>
                          <div>
                            <div class="font-semibold">${s.name}</div>
                            <div class="text-xs text-muted">${s.email||'—'}</div>
                          </div>
                        </div>
                      </td>
                      <td class="td-muted font-mono font-semibold">${s.roll}</td>
                      <td><span class="badge badge-blue">${s.course}</span> <span class="text-xs td-muted">${s.semester}</span></td>
                      <td>${formatCurrency(s.total)}</td>
                      <td class="text-green">${formatCurrency(s.paid)}</td>
                      <td class="font-bold text-red">${formatCurrency(s.pending)}</td>
                      <td>${overdueH.length>0?`<span class="badge badge-red">${overdueH.length} overdue</span>`:'<span class="badge badge-amber">Pending</span>'}</td>
                      <td class="td-actions">
                        <button class="btn btn-icon" onclick="Admin.viewStudentDues(${s.student_id})" title="View dues">👁</button>
                        <button class="btn btn-icon" onclick="Admin.sendReminder(${s.student_id},'${s.name}')" title="Send reminder">📧</button>
                      </td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>`}`;
  },

  sendReminder(sid, name) {
    const dues = FMS.getStudentDues(sid);
    FMS.addNotification({ student_id:sid, message:`Reminder: You have pending dues of ${formatCurrency(dues.pending)}. Please clear at the earliest.`, type:'reminder' });
    Toast.show(`Reminder sent to ${name}.`,'success');
  },

  // ─── AUDIT LOGS ─────────────────────────────────────
  renderAuditLogs() {
    App.setTopbar('Audit Logs', 'Activity records');
    const logs = [...FMS.getAuditLogs()].reverse();
    const users = FMS.getUsers();
    document.getElementById('page-content').innerHTML = `
      <div class="page-header">
        <div><h2>Audit Logs</h2><p>${logs.length} activity records logged</p></div>
      </div>
      <div class="card">
        <div class="table-wrapper">
          <table>
            <thead><tr><th>#</th><th>User</th><th>Action</th><th>Entity</th><th>Timestamp</th></tr></thead>
            <tbody>
              ${logs.map((log,i)=>{
                const user = users.find(u=>u.user_id===log.user_id);
                return `<tr>
                  <td class="td-muted">${i+1}</td>
                  <td>
                    <div class="d-flex items-center gap-2">
                      <div class="avatar avatar-sm">${getInitials(user?.name||'System')}</div>
                      <span class="text-sm font-medium">${user?.name||'System'}</span>
                    </div>
                  </td>
                  <td class="text-sm">${log.action}</td>
                  <td><span class="badge badge-blue">${log.entity||'—'}</span></td>
                  <td class="td-muted text-xs">${formatDate(log.timestamp)}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  },
};
