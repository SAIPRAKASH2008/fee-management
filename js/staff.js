/* =====================================================
   staff.js — Staff/Accountant Dashboard Module
   ===================================================== */

const Staff = {

  // ─── DASHBOARD ──────────────────────────────────────
  renderDashboard() {
    App.setTopbar('Staff Dashboard', `Welcome, ${App.currentUser.name.split(' ')[0]}!`);
    const payments = FMS.getPayments().filter(p => p.status === 'success');
    const today = new Date().toDateString();
    const todayPayments = payments.filter(p => new Date(p.payment_date).toDateString() === today);
    const todayCollection = todayPayments.reduce((s,p)=>s+p.amount_paid,0);
    const weekPayments = payments.filter(p => {
      const d = new Date(p.payment_date);
      const now = new Date();
      return (now-d)/(1000*60*60*24) <= 7;
    });
    const weekCollection = weekPayments.reduce((s,p)=>s+p.amount_paid,0);
    const offlinePayments = payments.filter(p => p.payment_mode !== 'online');
    const offlineCollection = offlinePayments.reduce((s,p)=>s+p.amount_paid,0);

    document.getElementById('page-content').innerHTML = `
      <div class="d-flex items-center justify-between mb-6">
        <div>
          <h2>Staff Accounts & Admissions</h2>
          <p>${new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary" onclick="Staff.openAddStudentModal()">➕ Add / Register Student</button>
          <button class="btn btn-amber" onclick="App.navigate('record-payment')">💳 Record Payment</button>
        </div>
      </div>

      <div class="grid-4 mb-6 stagger">
        <div class="stat-card blue animate-fade">
          <div class="stat-icon">☀️</div>
          <div class="stat-value">${formatCurrency(todayCollection)}</div>
          <div class="stat-label">Today's Collection</div>
          <div class="stat-change"><span class="text-muted">${todayPayments.length} transactions</span></div>
        </div>
        <div class="stat-card green animate-fade">
          <div class="stat-icon">📅</div>
          <div class="stat-value">${formatCurrency(weekCollection)}</div>
          <div class="stat-label">This Week</div>
          <div class="stat-change"><span class="text-muted">${weekPayments.length} transactions</span></div>
        </div>
        <div class="stat-card amber animate-fade">
          <div class="stat-icon">💵</div>
          <div class="stat-value">${formatCurrency(offlineCollection)}</div>
          <div class="stat-label">Offline Collections</div>
          <div class="stat-change"><span class="text-muted">${offlinePayments.length} offline entries</span></div>
        </div>
        <div class="stat-card purple animate-fade">
          <div class="stat-icon">🎓</div>
          <div class="stat-value">${FMS.getStudents().filter(s=>s.status==='active').length}</div>
          <div class="stat-label">Active Students</div>
        </div>
      </div>

      <div class="grid-2" style="gap:1.5rem">
        <!-- Quick Admission & Actions -->
        <div class="card">
          <div class="card-title mb-3">Admission & Account Desk</div>
          <p class="text-sm mb-4">Register new joining students across any department with their exact semester and customized fee heads.</p>
          <div class="d-flex gap-3">
            <button class="btn btn-primary flex-1" onclick="Staff.openAddStudentModal()">➕ Register Student</button>
            <button class="btn btn-ghost flex-1" onclick="App.navigate('students')">🎓 Student Registry</button>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Recent Transactions</div>
            <button class="btn btn-sm btn-ghost" onclick="App.navigate('payments')">View All →</button>
          </div>
          <div class="table-wrapper">
            <table>
              <thead><tr>
                <th>Student</th><th>Branch</th><th>Amount</th><th>Mode</th><th>Receipt</th>
              </tr></thead>
              <tbody>
                ${[...payments].reverse().slice(0,6).map(p => {
                  const student = FMS.getStudentById(p.student_id);
                  return `<tr>
                    <td>
                      <div class="d-flex items-center gap-2">
                        <div class="avatar avatar-sm">${getInitials(student?.name||'?')}</div>
                        <div>
                          <div class="font-medium text-sm">${student?.name||'—'}</div>
                          <div class="text-xs text-muted font-mono">${student?.roll||'—'}</div>
                        </div>
                      </div>
                    </td>
                    <td class="text-xs td-muted">${student?.course||'—'}</td>
                    <td class="font-semibold text-green">${formatCurrency(p.amount_paid)}</td>
                    <td class="text-xs">${p.gateway ? `⚡ ${p.gateway}` : getModeIcon(p.payment_mode)}</td>
                    <td><button class="btn btn-icon" onclick="ReceiptGen.showPreview(${p.payment_id})">🧾</button></td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Add Student Modal (Accessible to Staff) -->
      <div class="modal-overlay" id="staff-student-modal">
        <form class="modal modal-lg" onsubmit="Staff.saveStudent(event)">
          <div class="modal-header">
            <h3 class="modal-title" id="staff-student-modal-title">➕ Register New Student</h3>
            <button type="button" class="modal-close" onclick="Modal.close('staff-student-modal')">✕</button>
          </div>
          <div class="modal-body" id="staff-student-modal-body"></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-ghost" onclick="Modal.close('staff-student-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary">Register Student</button>
          </div>
        </form>
      </div>`;
  },

  // ─── STUDENT REGISTRATION MODAL FOR STAFF ────────────
  _staffEditStudentId: null,

  openAddStudentModal() {
    this._staffEditStudentId = null;
    const modal = document.getElementById('staff-student-modal');
    if (!modal) {
      this.renderDashboard();
      setTimeout(() => this.openAddStudentModal(), 50);
      return;
    }
    document.getElementById('staff-student-modal-title').textContent = '➕ Register Joining Student';
    document.getElementById('staff-student-modal-body').innerHTML = this.renderStudentForm();
    Modal.open('staff-student-modal', '#staff-s-name');
  },

  editStudent(id) {
    const student = FMS.getStudentById(id);
    if (!student) return;
    this._staffEditStudentId = id;
    const modal = document.getElementById('staff-student-modal');
    if (!modal) {
      this.renderStudents();
      setTimeout(() => this.editStudent(id), 50);
      return;
    }
    document.getElementById('staff-student-modal-title').textContent = '✏️ Edit Student Profile';
    document.getElementById('staff-student-modal-body').innerHTML = this.renderStudentForm(student);
    Modal.open('staff-student-modal');
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
          <input class="form-control" id="staff-s-name" placeholder="Student Full Name" value="${student?.name||''}">
        </div>
        <div class="form-group">
          <label class="form-label">Roll Number *</label>
          <div class="input-group">
            <input class="form-control" id="staff-s-roll" placeholder="e.g. ECE2401" value="${student?.roll||''}">
            <button type="button" class="btn btn-ghost btn-sm" onclick="Staff.autoGenerateRoll()">Auto</button>
          </div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Branch / Department *</label>
          <select class="form-control" id="staff-s-course" onchange="Staff.onBranchOrSemChange()">
            ${courses.map(c => `<option value="${c}" ${c === selectedCourse ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Exact Joining Semester * (No random semester)</label>
          <select class="form-control" id="staff-s-semester" onchange="Staff.onBranchOrSemChange()">
            ${semesters.map(s => `<option value="${s}" ${s === selectedSem ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" class="form-control" id="staff-s-email" placeholder="student@fms.edu" value="${student?.email||''}">
        </div>
        <div class="form-group">
          <label class="form-label">Contact Number *</label>
          <input class="form-control" id="staff-s-contact" placeholder="10-digit mobile number" maxlength="10" value="${student?.contact||''}">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="form-control" id="staff-s-category">
            <option value="regular" ${student?.category==='regular'?'selected':''}>Regular</option>
            <option value="scholarship" ${student?.category==='scholarship'?'selected':''}>Scholarship</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Fee Structure Configuration</label>
          <select class="form-control" id="staff-s-fee-structure">
            <option value="auto">⚡ Auto-assign exact fee structure for this branch & sem</option>
            ${fsList.map(fs => `<option value="${fs.fee_structure_id}" ${student?.fee_structure_id===fs.fee_structure_id?'selected':''}>${fs.name} (${formatCurrency(fs.total_amount)})</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="alert alert-info" style="margin-top:.5rem">
        <span class="alert-icon">💡</span>
        <div id="staff-fee-preview">Assigned standard fee structure for <strong>${selectedCourse}</strong> (${selectedSem}).</div>
      </div>`;
  },

  onBranchOrSemChange() {
    const course = document.getElementById('staff-s-course')?.value;
    const sem = document.getElementById('staff-s-semester')?.value;
    const preview = document.getElementById('staff-fee-preview');
    if (preview) {
      preview.innerHTML = `Assigned standard fee structure for <strong>${course}</strong> (${sem}).`;
    }
  },

  autoGenerateRoll() {
    const course = document.getElementById('staff-s-course')?.value || 'B.Tech CSE';
    const prefixes = {
      'B.Tech CSE': 'BTC', 'B.Tech ECE': 'ECE', 'B.Tech Mechanical': 'MEC',
      'B.Tech Civil': 'CIV', 'B.Tech EEE': 'EEE', 'B.Tech IT': 'BIT',
      'B.Tech AI & DS': 'AID', 'B.Sc Computer Science': 'BSC',
      'B.Sc Mathematics': 'BSM', 'B.Sc Physics': 'BSP',
      'BCA': 'BCA', 'MCA': 'MCA', 'B.Com General': 'BCG',
      'B.Com Computers': 'BCC', 'BBA': 'BBA', 'MBA': 'MBA'
    };
    const prefix = prefixes[course] || 'STU';
    const num = Math.floor(1000 + Math.random() * 9000);
    const rollEl = document.getElementById('staff-s-roll');
    if (rollEl) rollEl.value = `${prefix}26${num.toString().slice(0,2)}`;
  },

  saveStudent(event) {
    event?.preventDefault();
    const name = document.getElementById('staff-s-name')?.value?.trim();
    const roll = document.getElementById('staff-s-roll')?.value?.trim();
    const course = document.getElementById('staff-s-course')?.value;
    const sem = document.getElementById('staff-s-semester')?.value;
    const email = document.getElementById('staff-s-email')?.value?.trim();
    const contact = document.getElementById('staff-s-contact')?.value?.trim();
    const category = document.getElementById('staff-s-category')?.value;
    const fsVal = document.getElementById('staff-s-fee-structure')?.value;

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

    if (this._staffEditStudentId) {
      FMS.updateStudent(this._staffEditStudentId, data);
      FMS.addAuditLog({ user_id: App.currentUser.user_id, action:`Staff updated student: ${name} (${roll})`, entity:'Student', timestamp: new Date().toISOString() });
      Toast.show('Student details updated successfully!','success');
    } else {
      const newStudent = FMS.addStudent(data);
      console.info('[Staff] Student registered:', newStudent);
      FMS.addAuditLog({ user_id: App.currentUser.user_id, action:`Staff registered student: ${name} (${roll} - ${course} ${sem})`, entity:'Student', timestamp: new Date().toISOString() });
      Toast.show(`Student ${name} successfully admitted into ${course} (${sem})!`, 'success');
    }

    Modal.close('staff-student-modal');
    if (App.currentPage === 'students') {
      this.renderStudents();
    } else {
      this.renderDashboard();
    }
    this.openAddStudentModal();
    console.info('[Staff] Student table/dashboard refreshed. Total students:', FMS.getStudents().length);
  },

  // ─── RECORD PAYMENT ─────────────────────────────────
  renderRecordPayment() {
    App.setTopbar('Record Payment', 'Enter offline fee payment details');
    const students = FMS.getStudents().filter(s=>s.status==='active');

    document.getElementById('page-content').innerHTML = `
      <div class="page-header">
        <div><h2>Record Offline Payment</h2><p>Enter cash, cheque, or demand draft payment details</p></div>
      </div>

      <div class="grid-2" style="gap:1.5rem">
        <div class="card">
          <h4 class="mb-4">Payment Entry Form</h4>

          <div class="form-group">
            <label class="form-label">Search Student *</label>
            <div class="search-bar" style="margin-bottom:.5rem">
              <span class="search-icon">🔍</span>
              <input type="text" placeholder="Type student name or roll number..." id="staff-student-search"
                oninput="Staff.filterStudents(this.value)">
            </div>
            <select class="form-control" id="staff-student-select" onchange="Staff.loadStudentFees(this.value)">
              <option value="">— Select a student —</option>
              ${students.map(s => `<option value="${s.student_id}">${s.name} (${s.roll}) - ${s.course} ${s.semester}</option>`).join('')}
            </select>
          </div>

          <div id="fee-head-section" style="display:none">
            <div class="form-group">
              <label class="form-label">Fee Head *</label>
              <select class="form-control" id="staff-fee-head" onchange="Staff.updateFeeAmount()">
                <option value="">— Select fee head —</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Amount *</label>
              <div class="input-group">
                <span class="input-group-prefix">₹</span>
                <input type="number" class="form-control" id="staff-amount" placeholder="0.00" min="1">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Payment Mode *</label>
              <select class="form-control" id="staff-mode" onchange="Staff.toggleTxnField()">
                <option value="cash">💵 Cash Counter</option>
                <option value="cheque">🏦 Bank Cheque</option>
                <option value="dd">📜 Demand Draft (DD)</option>
              </select>
            </div>

            <div id="txn-id-group" class="form-group" style="display:none">
              <label class="form-label" id="txn-label">Cheque / DD Number *</label>
              <input type="text" class="form-control" id="staff-txn-id" placeholder="Enter cheque/DD reference number">
            </div>

            <div class="form-group">
              <label class="form-label">Remarks (optional)</label>
              <textarea class="form-control" id="staff-remarks" rows="2" placeholder="Add any notes..."></textarea>
            </div>

            <button class="btn btn-primary btn-full btn-lg" onclick="Staff.submitPayment()">
              ✓ Record Payment & Generate Receipt
            </button>
          </div>
        </div>

        <!-- Student Dues Preview -->
        <div>
          <div class="card" id="student-dues-preview" style="display:none">
            <div class="card-header">
              <div class="card-title">Student Dues Summary</div>
              <span class="badge badge-amber" id="preview-pending-badge">—</span>
            </div>
            <div id="preview-student-info" class="mb-4"></div>
            <div id="preview-fee-list"></div>
          </div>

          <div class="card mt-4" id="payment-success-preview" style="display:none">
            <div style="text-align:center;padding:1.5rem">
              <div style="font-size:3rem;margin-bottom:1rem">✅</div>
              <h4 class="mb-2">Payment Recorded!</h4>
              <p id="success-receipt-num" class="text-blue font-semibold mb-4"></p>
              <div class="d-flex gap-2 justify-center">
                <button class="btn btn-ghost" onclick="Staff.resetForm()">New Entry</button>
                <button class="btn btn-primary" id="success-receipt-btn">🧾 Print Receipt</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  },

  filterStudents(query) {
    const students = FMS.getStudents().filter(s=>s.status==='active');
    const sel = document.getElementById('staff-student-select');
    if (!sel) return;
    const filtered = query
      ? students.filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || s.roll.toLowerCase().includes(query.toLowerCase()) || s.course.toLowerCase().includes(query.toLowerCase()))
      : students;
    sel.innerHTML = `<option value="">— Select a student —</option>` +
      filtered.map(s => `<option value="${s.student_id}">${s.name} (${s.roll}) - ${s.course} ${s.semester}</option>`).join('');
  },

  loadStudentFees(studentId) {
    const sid = parseInt(studentId);
    if (!sid) { document.getElementById('fee-head-section').style.display='none'; return; }
    const student = FMS.getStudentById(sid);
    const dues = FMS.getStudentDues(sid);
    const pendingHeads = dues.heads.filter(h => h.remaining > 0);

    document.getElementById('fee-head-section').style.display='block';
    const fhSel = document.getElementById('staff-fee-head');
    fhSel.innerHTML = `<option value="">— Select fee head —</option>` +
      pendingHeads.map(h => `<option value="${h.fee_head_id}" data-amount="${h.remaining}">${h.head_name} — Remaining: ${formatCurrency(h.remaining)}</option>`).join('') +
      (pendingHeads.length === 0 ? '<option disabled>All fees cleared!</option>' : '');

    const preview = document.getElementById('student-dues-preview');
    preview.style.display='block';
    document.getElementById('preview-pending-badge').textContent = formatCurrency(dues.pending);
    document.getElementById('preview-student-info').innerHTML = `
      <div class="d-flex items-center gap-3 mb-3">
        <div class="avatar">${getInitials(student.name)}</div>
        <div>
          <div class="font-semibold">${student.name}</div>
          <div class="text-xs text-muted">${student.roll} · ${student.course} · ${student.semester}</div>
          <div class="text-xs text-muted">📞 ${student.contact}</div>
        </div>
      </div>`;

    document.getElementById('preview-fee-list').innerHTML = dues.heads.map(h => `
      <div class="d-flex justify-between items-center py-2" style="border-bottom:1px solid var(--border)">
        <div>
          <div class="text-sm font-medium">${h.head_name}</div>
          <div class="text-xs text-muted">Due: ${formatDateShort(h.due_date)}</div>
        </div>
        <div class="text-right">
          <div class="text-sm font-semibold">${formatCurrency(h.amount)}</div>
          ${getStatusBadge(h.status)}
        </div>
      </div>`).join('');
  },

  updateFeeAmount() {
    const sel = document.getElementById('staff-fee-head');
    const opt = sel.options[sel.selectedIndex];
    const amount = opt?.dataset?.amount;
    if (amount) document.getElementById('staff-amount').value = amount;
  },

  toggleTxnField() {
    const mode = document.getElementById('staff-mode').value;
    const group = document.getElementById('txn-id-group');
    const label = document.getElementById('txn-label');
    if (mode === 'cheque') {
      group.style.display='block'; label.textContent='Cheque Number *';
    } else if (mode === 'dd') {
      group.style.display='block'; label.textContent='Demand Draft Number *';
    } else {
      group.style.display='none';
    }
  },

  submitPayment() {
    const sid = parseInt(document.getElementById('staff-student-select').value);
    const headId = parseInt(document.getElementById('staff-fee-head').value);
    const amount = parseFloat(document.getElementById('staff-amount').value);
    const mode = document.getElementById('staff-mode').value;
    const txnRaw = document.getElementById('staff-txn-id')?.value?.trim();

    if (!sid) { Toast.show('Please select a student.','warning'); return; }
    if (!headId) { Toast.show('Please select a fee head.','warning'); return; }
    if (!amount || amount <= 0) { Toast.show('Please enter a valid amount.','warning'); return; }
    if ((mode==='cheque'||mode==='dd') && !txnRaw) { Toast.show('Please enter cheque/DD number.','warning'); return; }

    const fh = FMS.getFeeHeads().find(h=>h.fee_head_id===headId);
    const result = FMS.addPayment({
      student_id: sid,
      fee_head_id: headId,
      amount_paid: amount,
      payment_mode: mode,
      gateway: mode === 'cash' ? 'Cash Counter' : mode === 'cheque' ? 'Bank Cheque' : 'Demand Draft',
      transaction_id: mode==='cash' ? null : txnRaw,
      user_id: App.currentUser.user_id,
      head_name: fh?.head_name || '',
      recorded_by: 'staff',
    });

    FMS.addNotification({
      student_id: sid,
      message: `Your ${fh?.head_name||'fee'} payment of ${formatCurrency(amount)} has been recorded. Receipt: ${result.receipt_number}`,
      type: 'confirmation',
    });

    document.getElementById('payment-success-preview').style.display='block';
    document.getElementById('success-receipt-num').textContent = `Receipt: ${result.receipt_number}`;
    document.getElementById('success-receipt-btn').onclick = () => ReceiptGen.generate(result.payment.payment_id);
    Toast.show(`Payment of ${formatCurrency(amount)} recorded. Receipt: ${result.receipt_number}`, 'success', 5000);

    this.loadStudentFees(sid);
  },

  resetForm() {
    document.getElementById('staff-student-search').value='';
    document.getElementById('staff-student-select').value='';
    document.getElementById('staff-amount').value='';
    document.getElementById('fee-head-section').style.display='none';
    document.getElementById('student-dues-preview').style.display='none';
    document.getElementById('payment-success-preview').style.display='none';
    this.filterStudents('');
  },

  // ─── PAYMENT HISTORY ────────────────────────────────
  renderPayments() {
    App.setTopbar('Payment History', 'All recorded transactions');
    const payments = [...FMS.getPayments()].filter(p=>p.status==='success').reverse();

    document.getElementById('page-content').innerHTML = `
      <div class="page-header">
        <div><h2>Payment Transactions</h2><p>${payments.length} total transactions</p></div>
        <div class="page-header-actions">
          <input type="date" class="form-control" id="filter-date" onchange="Staff.filterPaymentsUI()" style="width:auto">
          <div class="search-bar" style="min-width:220px">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="Search student..." id="filter-search" oninput="Staff.filterPaymentsUI()">
          </div>
        </div>
      </div>
      <div class="card">
        <div class="table-wrapper">
          <table>
            <thead><tr>
              <th>Student</th><th>Roll</th><th>Fee Head</th><th>Amount</th>
              <th>Gateway / Mode</th><th>Txn ID</th><th>Date</th><th>Recorded By</th><th>Receipt</th>
            </tr></thead>
            <tbody id="payments-tbody">
              ${this.renderPaymentRows(payments)}
            </tbody>
          </table>
        </div>
      </div>`;
  },

  renderPaymentRows(payments) {
    return payments.map(p => {
      const student = FMS.getStudentById(p.student_id);
      const fh = FMS.getFeeHeads().find(h=>h.fee_head_id===p.fee_head_id);
      return `<tr>
        <td>
          <div class="d-flex items-center gap-2">
            <div class="avatar avatar-sm">${getInitials(student?.name||'?')}</div>
            <span class="font-medium">${student?.name||'—'}</span>
          </div>
        </td>
        <td class="td-muted font-mono font-semibold">${student?.roll||'—'}</td>
        <td>${fh?.head_name||'—'}</td>
        <td class="font-bold text-green">${formatCurrency(p.amount_paid)}</td>
        <td>${p.gateway ? `⚡ ${p.gateway}` : getModeIcon(p.payment_mode)}</td>
        <td class="td-muted text-xs font-mono">${p.transaction_id||'Cash'}</td>
        <td class="td-muted">${formatDateShort(p.payment_date)}</td>
        <td><span class="badge badge-${p.recorded_by==='student'?'blue':'amber'}">${p.recorded_by||'—'}</span></td>
        <td class="td-actions">
          <button class="btn btn-icon" onclick="ReceiptGen.showPreview(${p.payment_id})">🧾</button>
          <button class="btn btn-icon" onclick="ReceiptGen.generate(${p.payment_id})">⬇️</button>
        </td>
      </tr>`;
    }).join('') || '<tr><td colspan="9" class="text-center text-muted" style="padding:2rem">No payments found</td></tr>';
  },

  filterPaymentsUI() {
    const query = document.getElementById('filter-search')?.value?.toLowerCase()||'';
    const date = document.getElementById('filter-date')?.value||'';
    let payments = FMS.getPayments().filter(p=>p.status==='success');
    if (query) {
      payments = payments.filter(p => {
        const s = FMS.getStudentById(p.student_id);
        return s?.name.toLowerCase().includes(query) || s?.roll.toLowerCase().includes(query);
      });
    }
    if (date) {
      payments = payments.filter(p => p.payment_date.startsWith(date));
    }
    payments.reverse();
    const tbody = document.getElementById('payments-tbody');
    if (tbody) tbody.innerHTML = this.renderPaymentRows(payments);
  },

  // ─── STUDENTS (Staff Management) ────────────────────
  renderStudents() {
    App.setTopbar('Students Registry', 'Staff student admission & records');
    const students = FMS.getStudents();

    document.getElementById('page-content').innerHTML = `
      <div class="page-header">
        <div><h2>Student Registry</h2><p>${students.length} students enrolled across all branches</p></div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="Staff.openAddStudentModal()">➕ Add / Register Student</button>
        </div>
      </div>
      <div class="toolbar">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Search name, roll, or branch..." oninput="Staff.filterStaffStudents(this.value)">
        </div>
        <select class="form-control" style="width:auto" onchange="Staff.filterByBranch(this.value)" id="staff-branch-filter">
          <option value="">All Branches</option>
          ${FMS.COURSES.map(c=>`<option value="${c}">${c}</option>`).join('')}
        </select>
      </div>
      <div class="card">
        <div class="table-wrapper">
          <table>
            <thead><tr>
              <th>Student</th><th>Roll No</th><th>Branch</th><th>Semester</th>
              <th>Category</th><th>Total Fees</th><th>Paid</th><th>Pending</th><th>Status</th><th>Action</th>
            </tr></thead>
            <tbody id="staff-students-tbody">
              ${this.renderStudentRows(students)}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Staff Student Modal -->
      <div class="modal-overlay" id="staff-student-modal">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3 class="modal-title" id="staff-student-modal-title">➕ Register Student</h3>
            <button class="modal-close" onclick="Modal.close('staff-student-modal')">✕</button>
          </div>
          <div class="modal-body" id="staff-student-modal-body"></div>
          <div class="modal-footer">
            <button class="btn btn-ghost" onclick="Modal.close('staff-student-modal')">Cancel</button>
            <button class="btn btn-primary" onclick="Staff.saveStudent()">Register Student</button>
          </div>
        </div>
      </div>`;
  },

  renderStudentRows(students) {
    return students.map(s => {
      const dues = FMS.getStudentDues(s.student_id);
      return `<tr>
        <td>
          <div class="d-flex items-center gap-2">
            <div class="avatar avatar-sm">${getInitials(s.name)}</div>
            <div>
              <div class="font-medium">${s.name}</div>
              <div class="text-xs text-muted">${s.email||'—'}</div>
            </div>
          </div>
        </td>
        <td class="td-muted font-mono font-semibold">${s.roll}</td>
        <td><span class="badge badge-blue">${s.course}</span></td>
        <td class="td-muted font-semibold">${s.semester}</td>
        <td><span class="badge ${s.category==='scholarship'?'badge-purple':'badge-gray'}">${s.category}</span></td>
        <td>${formatCurrency(dues.total)}</td>
        <td class="text-green">${formatCurrency(dues.paid)}</td>
        <td class="${dues.pending>0?'text-amber font-semibold':'text-green'}">${formatCurrency(dues.pending)}</td>
        <td>${getStatusBadge(s.status)}</td>
        <td class="td-actions">
          <button class="btn btn-icon" onclick="Staff.editStudent(${s.student_id})" title="Edit Student">✏️</button>
        </td>
      </tr>`;
    }).join('') || '<tr><td colspan="10" class="text-center text-muted" style="padding:2rem">No students found</td></tr>';
  },

  filterByBranch(branch) {
    let students = FMS.getStudents();
    if (branch) students = students.filter(s => s.course === branch);
    document.getElementById('staff-students-tbody').innerHTML = this.renderStudentRows(students);
  },

  filterStaffStudents: debounce(function(query) {
    const branch = document.getElementById('staff-branch-filter')?.value;
    let students = FMS.getStudents();
    if (branch) students = students.filter(s => s.course === branch);
    if (query) {
      students = students.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.roll.toLowerCase().includes(query.toLowerCase()) ||
        s.course.toLowerCase().includes(query.toLowerCase())
      );
    }
    const tbody = document.getElementById('staff-students-tbody');
    if (tbody) tbody.innerHTML = Staff.renderStudentRows(students);
  }, 250),
};
