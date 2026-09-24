/* =====================================================
   student.js — Student Dashboard Module
   ===================================================== */

const Student = {

  getStudent() {
    return FMS.getStudentByUserId(App.currentUser.user_id);
  },

  // ─── DASHBOARD ──────────────────────────────────────
  renderDashboard() {
    const student = this.getStudent();
    if (!student) {
      document.getElementById('page-content').innerHTML = `<div class="alert alert-error"><span class="alert-icon">❌</span><div>Student profile not found. Please contact admin.</div></div>`;
      return;
    }
    App.setTopbar('Student Dashboard', `Welcome back, ${student.name.split(' ')[0]}!`);
    const dues = FMS.getStudentDues(student.student_id);
    const payments = FMS.getPaymentsByStudent(student.student_id).filter(p=>p.status==='success');
    const paidPct = dues.total > 0 ? Math.round((dues.paid/dues.total)*100) : 0;
    const overdueFees = dues.heads.filter(h => h.overdue && h.remaining > 0);
    const notifs = FMS.getNotifByStudent(student.student_id).filter(n=>!n.read);

    document.getElementById('page-content').innerHTML = `
      <!-- Welcome Banner -->
      <div class="card mb-6" style="background:linear-gradient(135deg,rgba(59,130,246,0.15),rgba(139,92,246,0.1));border-color:rgba(59,130,246,0.25)">
        <div class="d-flex items-center justify-between">
          <div class="d-flex items-center gap-4">
            <div class="avatar" style="width:56px;height:56px;font-size:1.25rem;background:linear-gradient(135deg,#3b82f6,#8b5cf6)">${student.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
            <div>
              <h2 class="mb-1">Welcome back, ${student.name.split(' ')[0]}! 👋</h2>
              <p class="mb-0">${student.roll} · ${student.course} · ${student.semester}</p>
            </div>
          </div>
          <div class="d-flex gap-3">
            <button class="btn btn-primary" onclick="App.navigate('pay-now')">💳 Pay Now</button>
            <button class="btn btn-ghost" onclick="App.navigate('history')">📋 History</button>
          </div>
        </div>
      </div>

      ${overdueFees.length > 0 ? `
      <div class="alert alert-warning mb-6">
        <span class="alert-icon">⚠️</span>
        <div><strong>${overdueFees.length} overdue fee(s):</strong> ${overdueFees.map(h=>h.head_name).join(', ')}. Please clear immediately to avoid late charges.</div>
      </div>` : ''}

      ${notifs.length > 0 ? `
      <div class="alert alert-info mb-6" style="cursor:pointer" onclick="App.navigate('notifications')">
        <span class="alert-icon">🔔</span>
        <div>You have <strong>${notifs.length} unread notification(s)</strong>. Click to view.</div>
      </div>` : ''}

      <!-- Stats -->
      <div class="grid-3 mb-6 stagger">
        <div class="stat-card blue animate-fade">
          <div class="stat-icon">💰</div>
          <div class="stat-value">${formatCurrency(dues.total)}</div>
          <div class="stat-label">Total Fee</div>
          <div class="stat-change">
            <span style="color:var(--text-muted)">${student.course} · ${student.semester}</span>
          </div>
        </div>
        <div class="stat-card green animate-fade">
          <div class="stat-icon">✅</div>
          <div class="stat-value">${formatCurrency(dues.paid)}</div>
          <div class="stat-label">Amount Paid</div>
          <div class="progress"><div class="progress-bar green" style="width:${paidPct}%"></div></div>
        </div>
        <div class="stat-card ${dues.pending > 0 ? 'amber' : 'green'} animate-fade">
          <div class="stat-icon">${dues.pending > 0 ? '⏳' : '🎉'}</div>
          <div class="stat-value">${formatCurrency(dues.pending)}</div>
          <div class="stat-label">${dues.pending > 0 ? 'Pending Dues' : 'All Clear!'}</div>
          <div class="stat-change ${dues.pending > 0 ? 'down' : 'up'}">
            ${dues.pending > 0 ? `▼ ${paidPct}% paid so far` : '▲ 100% dues cleared!'}
          </div>
        </div>
      </div>

      <div class="grid-2" style="gap:1.5rem">
        <!-- Fee Breakdown Chart -->
        <div class="card">
          <div class="card-header">
            <div><div class="card-title">Fee Breakdown</div><div class="card-subtitle">Paid vs Remaining per head</div></div>
          </div>
          <div class="chart-container" style="height:220px">
            <canvas id="student-dues-chart"></canvas>
          </div>
        </div>

        <!-- Quick Status -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Fee Status Overview</div>
            <button class="btn btn-sm btn-ghost" onclick="App.navigate('my-fees')">View All →</button>
          </div>
          ${dues.heads.slice(0,4).map(h => `
            <div class="d-flex items-center justify-between" style="padding:.75rem 0;border-bottom:1px solid var(--border)">
              <div>
                <div class="font-medium text-sm">${h.head_name}</div>
                <div class="text-xs text-muted">Due: ${formatDateShort(h.due_date)}</div>
              </div>
              <div class="d-flex items-center gap-3">
                <span class="text-sm font-semibold">${formatCurrency(h.amount)}</span>
                ${getStatusBadge(h.status)}
              </div>
            </div>`).join('')}
          ${dues.heads.length > 4 ? `<div class="text-center mt-3"><button class="btn btn-ghost btn-sm" onclick="App.navigate('my-fees')">+${dues.heads.length-4} more fees</button></div>` : ''}
        </div>

        <!-- Recent Payments -->
        <div class="card" style="grid-column:1/-1">
          <div class="card-header">
            <div class="card-title">Recent Payments</div>
            <button class="btn btn-sm btn-ghost" onclick="App.navigate('history')">View All →</button>
          </div>
          ${payments.length === 0
            ? `<div class="empty-state" style="padding:2rem"><div class="empty-icon">💳</div><h4>No payments yet</h4><p>Your payment history will appear here.</p></div>`
            : `<div class="table-wrapper"><table>
                <thead><tr>
                  <th>Fee Head</th><th>Amount</th><th>Gateway / Mode</th><th>Date</th><th>Status</th><th>Receipt</th>
                </tr></thead>
                <tbody>
                  ${payments.slice(-5).reverse().map(p => {
                    const fh = FMS.getFeeHeads().find(h=>h.fee_head_id===p.fee_head_id);
                    return `<tr>
                      <td class="font-medium">${fh?.head_name||'—'}</td>
                      <td class="font-semibold text-green">${formatCurrency(p.amount_paid)}</td>
                      <td>${p.gateway ? `⚡ ${p.gateway}` : getModeIcon(p.payment_mode)}</td>
                      <td class="td-muted">${formatDateShort(p.payment_date)}</td>
                      <td>${getStatusBadge(p.status)}</td>
                      <td><button class="btn btn-icon" onclick="ReceiptGen.showPreview(${p.payment_id})" title="View Receipt">🧾</button></td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table></div>`}
        </div>
      </div>`;

    // Render chart
    setTimeout(() => {
      if (dues.heads.length > 0) {
        Charts.renderDuesBreakdown('student-dues-chart', dues.heads);
      }
    }, 100);
  },

  // ─── MY FEES ────────────────────────────────────────
  renderMyFees() {
    const student = this.getStudent();
    if (!student) return;
    App.setTopbar('My Fees', 'View your complete fee structure and dues');
    const dues = FMS.getStudentDues(student.student_id);
    const fs = FMS.getFeeStructureById(student.fee_structure_id);

    document.getElementById('page-content').innerHTML = `
      <div class="page-header">
        <div>
          <h2>My Fee Structure</h2>
          <p>${fs?.name || `${student.course} – ${student.semester}`} · Total: ${formatCurrency(dues.total)}</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="App.navigate('pay-now')">💳 Pay Dues</button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid-3 mb-6">
        <div class="stat-card blue">
          <div class="stat-icon">💰</div>
          <div class="stat-value">${formatCurrency(dues.total)}</div>
          <div class="stat-label">Total Fees</div>
        </div>
        <div class="stat-card green">
          <div class="stat-icon">✅</div>
          <div class="stat-value">${formatCurrency(dues.paid)}</div>
          <div class="stat-label">Paid</div>
          <div class="progress"><div class="progress-bar green" style="width:${dues.total>0?Math.round(dues.paid/dues.total*100):0}%"></div></div>
        </div>
        <div class="stat-card ${dues.pending>0?'amber':'green'}">
          <div class="stat-icon">${dues.pending>0?'⏳':'🎉'}</div>
          <div class="stat-value">${formatCurrency(dues.pending)}</div>
          <div class="stat-label">Remaining</div>
        </div>
      </div>

      <!-- Fee Heads Table -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Fee Head Details</div>
          <span class="badge badge-blue">${dues.heads.length} items</span>
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr>
              <th>Fee Head</th>
              <th>Total Amount</th>
              <th>Paid</th>
              <th>Remaining</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr></thead>
            <tbody>
              ${dues.heads.map(h => `
                <tr>
                  <td>
                    <div class="font-semibold">${h.head_name}</div>
                    ${h.overdue && h.remaining > 0 ? '<div class="text-xs text-red">⚠ Overdue</div>' : ''}
                  </td>
                  <td class="font-medium">${formatCurrency(h.amount)}</td>
                  <td class="text-green font-medium">${formatCurrency(h.paid)}</td>
                  <td class="${h.remaining>0?'text-amber':'text-green'} font-medium">${formatCurrency(h.remaining)}</td>
                  <td class="td-muted">${formatDateShort(h.due_date)}</td>
                  <td>${getStatusBadge(h.status)}</td>
                  <td>
                    ${h.remaining > 0
                      ? `<button class="btn btn-sm btn-primary" onclick="Student.paySpecific(${h.fee_head_id})">Pay ${formatCurrency(h.remaining)}</button>`
                      : `<span class="badge badge-green">Cleared</span>`}
                  </td>
                </tr>`).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td><strong>Total</strong></td>
                <td><strong>${formatCurrency(dues.total)}</strong></td>
                <td style="color:var(--green)"><strong>${formatCurrency(dues.paid)}</strong></td>
                <td style="color:var(--amber)"><strong>${formatCurrency(dues.pending)}</strong></td>
                <td colspan="3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`;
  },

  // ─── PAY NOW ────────────────────────────────────────
  _selectedGateway: 'razorpay',
  _selectedBank: 'SBI',
  _selectedWallet: 'Paytm Wallet',

  renderPayNow(preselectedHeadId=null) {
    const student = this.getStudent();
    if (!student) return;
    App.setTopbar('Pay Now', 'Complete your fee payment online');
    const dues = FMS.getStudentDues(student.student_id);
    const pendingHeads = dues.heads.filter(h => h.remaining > 0);

    document.getElementById('page-content').innerHTML = `
      <div class="page-header">
        <div><h2>Pay Fees Online</h2><p>Select fees and checkout through your preferred secure payment gateway</p></div>
      </div>

      ${pendingHeads.length === 0
        ? `<div class="card" style="text-align:center;padding:3rem">
            <div style="font-size:3rem;margin-bottom:1rem">🎉</div>
            <h3 class="mb-2">All fees cleared!</h3>
            <p class="mb-4">You have no pending dues. Great job staying on top of payments!</p>
            <button class="btn btn-primary" onclick="App.navigate('receipts')">🧾 View Receipts</button>
          </div>`
        : `<div class="grid-2" style="gap:1.5rem">
            <!-- Fee Selection -->
            <div class="card">
              <div class="card-header">
                <div class="card-title">Select Fees to Pay</div>
                <button class="btn btn-sm btn-ghost" onclick="Student.selectAllFees()">Select All</button>
              </div>
              <div id="fee-selection-list">
                ${pendingHeads.map(h => `
                  <label class="d-flex items-center gap-3" style="padding:.875rem 0;border-bottom:1px solid var(--border);cursor:pointer">
                    <input type="checkbox" class="fee-checkbox" value="${h.fee_head_id}" data-amount="${h.remaining}" data-name="${h.head_name}"
                      ${preselectedHeadId == h.fee_head_id ? 'checked' : ''}
                      onchange="Student.updatePaymentTotal()" style="width:18px;height:18px;accent-color:var(--blue);cursor:pointer">
                    <div class="flex-1">
                      <div class="font-semibold">${h.head_name}</div>
                      <div class="text-xs text-muted">Due: ${formatDateShort(h.due_date)} ${h.overdue?'<span class="text-red">· Overdue</span>':''}</div>
                    </div>
                    <div class="text-right">
                      <div class="font-bold text-amber">${formatCurrency(h.remaining)}</div>
                      ${h.paid > 0 ? `<div class="text-xs text-muted">Partial: ${formatCurrency(h.paid)} paid</div>` : ''}
                    </div>
                  </label>`).join('')}
              </div>
            </div>

            <!-- Payment Panel & Gateway Selection -->
            <div>
              <div class="card mb-4">
                <div class="card-title mb-3">Choose Payment Gateway</div>
                
                <div class="gateway-selector-grid">
                  <div class="gateway-tab active" id="gw-razorpay" onclick="Student.selectGateway('razorpay')">
                    <span class="gateway-tab-icon">⚡</span>
                    <span>Razorpay</span>
                  </div>
                  <div class="gateway-tab" id="gw-upi" onclick="Student.selectGateway('upi')">
                    <span class="gateway-tab-icon">📱</span>
                    <span>UPI / QR</span>
                  </div>
                  <div class="gateway-tab" id="gw-stripe" onclick="Student.selectGateway('stripe')">
                    <span class="gateway-tab-icon">🌐</span>
                    <span>Stripe</span>
                  </div>
                  <div class="gateway-tab" id="gw-netbanking" onclick="Student.selectGateway('netbanking')">
                    <span class="gateway-tab-icon">🏦</span>
                    <span>Net Banking</span>
                  </div>
                </div>

                <div class="divider"></div>

                <div class="card-title mb-2 text-sm">Payment Summary</div>
                <div id="selected-fees-list" style="min-height:50px;margin-bottom:.5rem">
                  <p class="text-muted text-sm">Select fees above to see summary</p>
                </div>
                
                <div class="d-flex justify-between items-center mb-4">
                  <span class="font-semibold">Total Payable</span>
                  <span class="text-2xl font-extrabold gradient-text" id="payment-total">₹0</span>
                </div>

                <button class="btn btn-primary btn-full btn-lg" id="pay-btn" onclick="Student.initiatePayment()" disabled>
                  🔒 Proceed to Pay via <span id="gateway-label-btn" style="margin-left:4px">Razorpay</span>
                </button>
                <p class="text-xs text-muted text-center mt-2">🔐 256-Bit SSL Encrypted Sandbox Gateway</p>
              </div>

              <!-- Student Profile mini card -->
              <div class="card">
                <div class="d-flex items-center gap-3">
                  <div class="avatar">${getInitials(student.name)}</div>
                  <div>
                    <div class="font-semibold">${student.name}</div>
                    <div class="text-xs text-muted">${student.roll} · ${student.course} · ${student.semester}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>`}

      <!-- Dynamic Payment Gateway Modal -->
      <div class="modal-overlay" id="payment-modal">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="modal-gateway-title">🔒 Checkout</h3>
            <button class="modal-close" onclick="Modal.close('payment-modal')">✕</button>
          </div>
          <div class="modal-body">
            <div class="payment-gateway">
              <div class="payment-amount-display">
                <div class="text-muted text-sm mb-1">Total Payable Amount</div>
                <div class="amount" id="gateway-amount">₹0</div>
                <div class="text-xs text-muted mt-1" id="gateway-desc">Fee payment</div>
              </div>

              <div id="gateway-view-container">
                <!-- Injected dynamically based on selected gateway -->
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" onclick="Modal.close('payment-modal')">Cancel</button>
            <button class="btn btn-green btn-lg" id="confirm-pay-btn" onclick="Student.confirmPayment()">
              ✓ Complete Payment
            </button>
          </div>
        </div>
      </div>`;

    if (preselectedHeadId) {
      setTimeout(() => this.updatePaymentTotal(), 50);
    }
  },

  selectGateway(gw) {
    this._selectedGateway = gw;
    document.querySelectorAll('.gateway-tab').forEach(el => el.classList.remove('active'));
    document.getElementById(`gw-${gw}`)?.classList.add('active');

    const names = {
      razorpay: 'Razorpay',
      upi: 'UPI / QR Code',
      stripe: 'Stripe Global',
      netbanking: 'Net Banking'
    };
    const labelBtn = document.getElementById('gateway-label-btn');
    if (labelBtn) labelBtn.textContent = names[gw] || 'Gateway';
  },

  selectAllFees() {
    document.querySelectorAll('.fee-checkbox').forEach(cb => cb.checked = true);
    this.updatePaymentTotal();
  },

  updatePaymentTotal() {
    const checked = [...document.querySelectorAll('.fee-checkbox:checked')];
    const total = checked.reduce((s,cb) => s + parseFloat(cb.dataset.amount||0), 0);
    const totalEl = document.getElementById('payment-total');
    if (totalEl) totalEl.textContent = formatCurrency(total);

    const listEl = document.getElementById('selected-fees-list');
    if (listEl) {
      if (checked.length === 0) {
        listEl.innerHTML = `<p class="text-muted text-sm">Select fees above to see summary</p>`;
      } else {
        listEl.innerHTML = checked.map(cb => `
          <div class="d-flex justify-between text-sm py-1">
            <span class="text-secondary">${cb.dataset.name}</span>
            <span class="font-semibold">${formatCurrency(cb.dataset.amount)}</span>
          </div>`).join('') + `<div class="divider" style="margin:.5rem 0"></div>`;
      }
    }

    const payBtn = document.getElementById('pay-btn');
    if (payBtn) payBtn.disabled = total === 0;
  },

  initiatePayment() {
    const checked = [...document.querySelectorAll('.fee-checkbox:checked')];
    if (checked.length === 0) { Toast.show('Please select at least one fee to pay.', 'warning'); return; }
    const total = checked.reduce((s,cb) => s + parseFloat(cb.dataset.amount||0), 0);
    const names = checked.map(cb => cb.dataset.name).join(', ');

    document.getElementById('gateway-amount').textContent = formatCurrency(total);
    document.getElementById('gateway-desc').textContent = names;

    const student = this.getStudent();
    const container = document.getElementById('gateway-view-container');
    const modalTitle = document.getElementById('modal-gateway-title');

    if (this._selectedGateway === 'razorpay') {
      modalTitle.innerHTML = '⚡ Razorpay Checkout';
      container.innerHTML = `
        <div class="card-input-display">
          <div style="font-size:.75rem;color:#38bdf8;font-weight:700;letter-spacing:.05em">RAZORPAY SECURE GATEWAY</div>
          <div class="card-number-display" id="card-display">•••• •••• •••• ••••</div>
          <div class="d-flex justify-between">
            <div><div class="text-xs" style="color:#64748b">CARD HOLDER</div><div class="text-sm font-semibold">${student.name.toUpperCase()}</div></div>
            <div><div class="text-xs" style="color:#64748b">EXPIRES</div><div class="text-sm font-semibold" id="exp-display">MM/YY</div></div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Card Number</label>
          <input class="form-control" placeholder="4111 2222 3333 4444" maxlength="19" id="card-number-input"
            oninput="let v=this.value.replace(/\\D/g,'').slice(0,16); this.value=v.replace(/(\\d{4})/g,'$1 ').trim(); document.getElementById('card-display').textContent=v.padEnd(16,'•').replace(/(\\d{4}|•{4})/g,'$1 ').trim()">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Expiry Date</label>
            <input class="form-control" placeholder="MM/YY" maxlength="5" id="card-expiry"
              oninput="let v=this.value.replace(/\\D/g,''); if(v.length>2)v=v.slice(0,2)+'/'+v.slice(2,4); this.value=v; document.getElementById('exp-display').textContent=this.value||'MM/YY'">
          </div>
          <div class="form-group">
            <label class="form-label">CVV</label>
            <input class="form-control" placeholder="•••" maxlength="3" type="password" id="card-cvv">
          </div>
        </div>`;
    } else if (this._selectedGateway === 'upi') {
      modalTitle.innerHTML = '📱 Scan UPI QR or Enter VPA';
      container.innerHTML = `
        <div class="upi-qr-box">
          <div class="text-xs font-semibold mb-2" style="color:#0284c7">SCAN TO PAY WITH ANY UPI APP</div>
          <div class="qr-code-graphic">
            <div class="qr-code-pattern">
              <span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span><span></span>
            </div>
            <div style="font-size:.65rem;color:#0f172a;font-weight:700;margin-top:4px">PhonePe • GPay • Paytm</div>
          </div>
          <div class="text-sm font-bold" style="color:#0f172a">globaltech.fees@icici</div>
          <div class="text-xs" style="color:#64748b">Amount: ${formatCurrency(total)}</div>
        </div>
        <div class="form-group text-left" style="margin-top:.5rem">
          <label class="form-label">Or enter UPI ID (VPA)</label>
          <div class="input-group">
            <input type="text" class="form-control" id="upi-vpa-input" placeholder="e.g. 9876543210@paytm" value="${student.contact}@upi">
            <button class="btn btn-ghost btn-sm" type="button" onclick="Toast.show('UPI ID Verified!','success')">Verify</button>
          </div>
        </div>`;
    } else if (this._selectedGateway === 'stripe') {
      modalTitle.innerHTML = '🌐 Stripe Global Checkout';
      container.innerHTML = `
        <div style="background:#635bff;color:#fff;border-radius:var(--r-md);padding:1rem;margin-bottom:1rem;text-align:left">
          <div style="font-size:1.1rem;font-weight:800;letter-spacing:-.02em">stripe</div>
          <div style="font-size:.8rem;opacity:.9">International & Multi-currency Payment</div>
        </div>
        <div class="form-group text-left">
          <label class="form-label">Cardholder Name</label>
          <input class="form-control" id="stripe-name" value="${student.name}">
        </div>
        <div class="form-group text-left">
          <label class="form-label">Card Number (Visa / Mastercard / Amex)</label>
          <input class="form-control" id="card-number-input" placeholder="4000 0012 3456 7890" maxlength="19">
        </div>
        <div class="form-row">
          <div class="form-group text-left">
            <label class="form-label">Expiration</label>
            <input class="form-control" id="card-expiry" placeholder="MM/YY" maxlength="5">
          </div>
          <div class="form-group text-left">
            <label class="form-label">CVC / CVV</label>
            <input class="form-control" id="card-cvv" placeholder="CVC" maxlength="4" type="password">
          </div>
        </div>`;
    } else if (this._selectedGateway === 'netbanking') {
      modalTitle.innerHTML = '🏦 Direct Net Banking Portal';
      container.innerHTML = `
        <div class="text-left text-sm text-muted mb-2">Select Your Bank:</div>
        <div class="bank-grid">
          <div class="bank-option selected" id="bank-SBI" onclick="Student.selectBank('SBI')">🏛️ SBI</div>
          <div class="bank-option" id="bank-HDFC" onclick="Student.selectBank('HDFC Bank')">🏢 HDFC</div>
          <div class="bank-option" id="bank-ICICI" onclick="Student.selectBank('ICICI Bank')">🏛️ ICICI</div>
          <div class="bank-option" id="bank-AXIS" onclick="Student.selectBank('Axis Bank')">🏦 AXIS</div>
          <div class="bank-option" id="bank-KOTAK" onclick="Student.selectBank('Kotak Mahindra')">🏛️ Kotak</div>
          <div class="bank-option" id="bank-PNB" onclick="Student.selectBank('PNB')">🏦 PNB</div>
        </div>
        <div class="form-group text-left mt-3">
          <label class="form-label">Net Banking Customer / User ID</label>
          <input class="form-control" id="nb-userid" placeholder="Enter Netbanking User ID" value="NETB_${student.roll}">
        </div>`;
    }

    Modal.open('payment-modal');
  },

  selectBank(bankName) {
    this._selectedBank = bankName;
    document.querySelectorAll('.bank-option').forEach(el => el.classList.remove('selected'));
    const shortCode = bankName.split(' ')[0];
    document.getElementById(`bank-${shortCode}`)?.classList.add('selected');
  },

  confirmPayment() {
    const btn = document.getElementById('confirm-pay-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Processing with ' + (this._selectedGateway.toUpperCase()) + '...';

    // Simulate payment processing
    setTimeout(() => {
      const student = this.getStudent();
      const checked = [...document.querySelectorAll('.fee-checkbox:checked')];
      const txnBase = generateTxnId();

      const gatewayLabels = {
        razorpay: 'Razorpay',
        upi: 'PhonePe/Google Pay UPI',
        stripe: 'Stripe Global',
        netbanking: `Net Banking (${this._selectedBank})`
      };
      const activeGateway = gatewayLabels[this._selectedGateway] || 'Online Gateway';

      checked.forEach((cb, i) => {
        const headId = parseInt(cb.value);
        const amount = parseFloat(cb.dataset.amount);
        const head = FMS.getFeeHeads().find(h => h.fee_head_id === headId);
        FMS.addPayment({
          student_id: student.student_id,
          fee_head_id: headId,
          amount_paid: amount,
          payment_mode: 'online',
          gateway: activeGateway,
          transaction_id: txnBase + i,
          user_id: App.currentUser.user_id,
          head_name: head?.head_name || '',
          recorded_by: 'student',
        });
        FMS.addNotification({
          student_id: student.student_id,
          message: `Payment of ${formatCurrency(amount)} for ${head?.head_name} received successfully via ${activeGateway}.`,
          type: 'confirmation',
        });
      });

      Modal.close('payment-modal');
      App.updateNotifBadge();
      const totalAmount = checked.reduce((s,cb)=>s+parseFloat(cb.dataset.amount),0);
      Toast.show(`Payment of ${formatCurrency(totalAmount)} via ${activeGateway} successful! Receipt generated.`, 'success', 5000);
      setTimeout(() => this.renderDashboard(), 400);
    }, 2000);
  },

  paySpecific(headId) {
    App.navigate('pay-now');
    setTimeout(() => {
      const cb = document.querySelector(`.fee-checkbox[value="${headId}"]`);
      if (cb) { cb.checked = true; this.updatePaymentTotal(); }
    }, 100);
  },

  // ─── PAYMENT HISTORY ────────────────────────────────
  renderHistory() {
    const student = this.getStudent();
    if (!student) return;
    App.setTopbar('Payment History', 'All your fee payments');
    const payments = FMS.getPaymentsByStudent(student.student_id).filter(p=>p.status==='success');

    document.getElementById('page-content').innerHTML = `
      <div class="page-header">
        <div><h2>Payment History</h2><p>${payments.length} payment(s) recorded</p></div>
      </div>
      ${payments.length === 0
        ? `<div class="card"><div class="empty-state"><div class="empty-icon">💳</div><h4>No payments yet</h4><p>Your payment history will appear here.</p></div></div>`
        : `<div class="card">
            <div class="table-wrapper">
              <table>
                <thead><tr>
                  <th>#</th><th>Fee Head</th><th>Amount</th><th>Gateway / Mode</th>
                  <th>Transaction ID</th><th>Date</th><th>Status</th><th>Receipt</th>
                </tr></thead>
                <tbody>
                  ${[...payments].reverse().map((p,i) => {
                    const fh = FMS.getFeeHeads().find(h=>h.fee_head_id===p.fee_head_id);
                    return `<tr>
                      <td class="td-muted">${i+1}</td>
                      <td class="font-semibold">${fh?.head_name||'—'}</td>
                      <td class="font-bold text-green">${formatCurrency(p.amount_paid)}</td>
                      <td>${p.gateway ? `⚡ ${p.gateway}` : getModeIcon(p.payment_mode)}</td>
                      <td class="td-muted text-xs font-mono">${p.transaction_id||'—'}</td>
                      <td class="td-muted">${formatDateShort(p.payment_date)}</td>
                      <td>${getStatusBadge(p.status)}</td>
                      <td class="td-actions">
                        <button class="btn btn-icon" onclick="ReceiptGen.showPreview(${p.payment_id})" title="View">🧾</button>
                        <button class="btn btn-icon" onclick="ReceiptGen.generate(${p.payment_id})" title="Download">⬇️</button>
                      </td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>`}`;
  },

  // ─── MY RECEIPTS ────────────────────────────────────
  renderReceipts() {
    const student = this.getStudent();
    if (!student) return;
    App.setTopbar('My Receipts', 'Download your payment receipts');
    const payments = FMS.getPaymentsByStudent(student.student_id).filter(p=>p.status==='success');

    document.getElementById('page-content').innerHTML = `
      <div class="page-header">
        <div><h2>My Receipts</h2><p>${payments.length} receipt(s) available</p></div>
      </div>
      ${payments.length === 0
        ? `<div class="card"><div class="empty-state"><div class="empty-icon">🧾</div><h4>No receipts yet</h4><p>Receipts appear after successful payments.</p></div></div>`
        : `<div class="grid-auto">
            ${[...payments].reverse().map(p => {
              const receipt = FMS.getReceiptByPayment(p.payment_id);
              const fh = FMS.getFeeHeads().find(h=>h.fee_head_id===p.fee_head_id);
              return `
                <div class="card" style="cursor:default">
                  <div class="d-flex justify-between items-start mb-3">
                    <div style="font-size:2rem">🧾</div>
                    ${getStatusBadge('success')}
                  </div>
                  <div class="font-bold mb-1">${receipt?.receipt_number||'RCP-—'}</div>
                  <div class="font-semibold text-blue text-lg mb-1">${formatCurrency(p.amount_paid)}</div>
                  <div class="text-sm text-secondary mb-1">${fh?.head_name||'—'}</div>
                  <div class="text-xs text-muted mb-4">${formatDateShort(p.payment_date)} · ${p.gateway||p.payment_mode}</div>
                  <div class="d-flex gap-2">
                    <button class="btn btn-ghost btn-sm flex-1" onclick="ReceiptGen.showPreview(${p.payment_id})">👁 View</button>
                    <button class="btn btn-primary btn-sm flex-1" onclick="ReceiptGen.generate(${p.payment_id})">⬇ PDF</button>
                  </div>
                </div>`;
            }).join('')}
          </div>`}`;
  },
};
