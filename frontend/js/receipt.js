/* =====================================================
   receipt.js — PDF Receipt Generation (jsPDF)
   ===================================================== */

const ReceiptGen = {
  generate(paymentId) {
    const payment = FMS.getPayments().find(p => p.payment_id === paymentId);
    if (!payment) { Toast.show('Payment not found.', 'error'); return; }
    const receipt = FMS.getReceiptByPayment(paymentId);
    const student = FMS.getStudentById(payment.student_id);
    const feeHead = FMS.getFeeHeads().find(h => h.fee_head_id === payment.fee_head_id);
    if (!student || !feeHead) { Toast.show('Data incomplete.', 'error'); return; }
    const fs = FMS.getFeeStructureById(feeHead.fee_structure_id);

    // Check if jsPDF is available
    if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
      Toast.show('PDF library loading... Please try again.', 'warning');
      return;
    }
    const { jsPDF } = window.jspdf || window;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    // Colors
    const navyBg = [30, 64, 175];
    const purple = [109, 40, 217];
    const dark = [15, 23, 42];
    const gray = [100, 116, 139];
    const lightGray = [241, 245, 249];
    const green = [16, 185, 129];
    const white = [255, 255, 255];

    // ── Header bar
    doc.setFillColor(...navyBg);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setFillColor(...purple);
    doc.rect(0, 38, 210, 7, 'F');

    // Institution logo area
    doc.setFillColor(255, 255, 255, 0.15);
    doc.roundedRect(10, 7, 30, 30, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('🏛', 25, 26, { align: 'center' });

    // Institution name
    doc.setTextColor(...white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Global Institute of Technology', 50, 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Sector 62, Noida, Uttar Pradesh — 201309', 50, 25);
    doc.text('📞 +91-120-4567890  |  ✉ fees@globaltech.edu', 50, 31);

    // Receipt title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('FEE PAYMENT RECEIPT', 210 / 2, 43, { align: 'center' });

    // ── Receipt info box
    doc.setFillColor(...lightGray);
    doc.roundedRect(10, 50, 190, 25, 3, 3, 'F');
    doc.setTextColor(...dark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Receipt No:', 15, 60);
    doc.text('Date:', 75, 60);
    doc.text('Transaction ID:', 130, 60);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 64, 175);
    doc.text(receipt?.receipt_number || 'RCP-2026-N/A', 15, 68);
    doc.setTextColor(...dark);
    doc.text(formatDateShort(payment.payment_date), 75, 68);
    doc.text(payment.transaction_id || 'CASH/CHEQUE', 130, 68);

    // ── Student Details section
    doc.setFillColor(...dark);
    doc.rect(10, 82, 190, 8, 'F');
    doc.setTextColor(...white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('STUDENT INFORMATION', 15, 88);

    const sData = [
      ['Student Name', student.name],
      ['Roll Number', student.roll],
      ['Course', student.course],
      ['Semester / Year', student.semester],
      ['Contact', student.contact || '—'],
    ];
    let y = 98;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    sData.forEach(([label, value], i) => {
      if (i % 2 === 0) doc.setFillColor(...lightGray);
      else doc.setFillColor(255, 255, 255);
      doc.rect(10, y - 5, 190, 9, 'F');
      doc.setTextColor(...gray);
      doc.text(label, 15, y);
      doc.setTextColor(...dark);
      doc.setFont('helvetica', 'bold');
      doc.text(String(value), 80, y);
      doc.setFont('helvetica', 'normal');
      y += 9;
    });

    // ── Fee Payment Details
    y += 5;
    doc.setFillColor(...navyBg);
    doc.rect(10, y, 190, 8, 'F');
    doc.setTextColor(...white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('PAYMENT DETAILS', 15, y + 6);
    y += 13;

    // Table header
    doc.setFillColor(248, 250, 252);
    doc.rect(10, y - 5, 190, 8, 'F');
    doc.setTextColor(...gray);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Fee Head', 15, y);
    doc.text('Fee Structure', 70, y);
    doc.text('Payment Mode', 120, y);
    doc.text('Amount Paid', 165, y, { align: 'right' });
    y += 6;
    doc.setDrawColor(220, 220, 230);
    doc.line(10, y, 200, y);
    y += 6;

    // Payment row
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...dark);
    doc.setFontSize(10);
    doc.text(feeHead.head_name, 15, y);
    doc.text(fs?.name || '—', 70, y);
    const modeLabels = { online: 'Online Gateway', cash: 'Cash', cheque: 'Cheque', dd: 'Demand Draft' };
    doc.text(modeLabels[payment.payment_mode] || payment.payment_mode, 120, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...navyBg);
    doc.text(formatCurrency(payment.amount_paid), 165, y, { align: 'right' });
    y += 12;

    // Total box
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(...navyBg);
    doc.setLineWidth(0.5);
    doc.roundedRect(120, y, 80, 20, 3, 3, 'FD');
    doc.setTextColor(...gray);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('TOTAL AMOUNT PAID', 160, y + 8, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...navyBg);
    doc.text(formatCurrency(payment.amount_paid), 160, y + 17, { align: 'center' });
    y += 26;

    // ── Payment status stamp
    doc.setFillColor(...green);
    doc.roundedRect(10, y, 80, 18, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('✓ PAYMENT SUCCESSFUL', 50, y + 11, { align: 'center' });
    y += 28;

    // ── Footer
    doc.setDrawColor(220, 220, 230);
    doc.line(10, y, 200, y);
    y += 8;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...gray);
    doc.text('This is a computer-generated receipt and does not require a physical signature.', 105, y, { align: 'center' });
    doc.text('For queries, contact: fees@globaltech.edu | Helpline: +91-120-4567890', 105, y + 6, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN')} | FMS v1.0`, 105, y + 12, { align: 'center' });

    // ── Watermark
    doc.setGState(new doc.GState({ opacity: 0.04 }));
    doc.setTextColor(...navyBg);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(60);
    doc.text('PAID', 105, 160, { align: 'center', angle: 45 });

    doc.save(`Receipt_${receipt?.receipt_number || 'FMS'}_${student.roll}.pdf`);
    Toast.show(`Receipt downloaded: ${receipt?.receipt_number}`, 'success');
  },

  // Show receipt preview in modal
  showPreview(paymentId) {
    const payment = FMS.getPayments().find(p => p.payment_id === paymentId);
    if (!payment) return;
    const receipt = FMS.getReceiptByPayment(paymentId);
    const student = FMS.getStudentById(payment.student_id);
    const feeHead = FMS.getFeeHeads().find(h => h.fee_head_id === payment.fee_head_id);
    if (!student || !feeHead) return;
    const fs = FMS.getFeeStructureById(feeHead.fee_structure_id);
    const modeLabels = { online: 'Online Gateway', cash: 'Cash', cheque: 'Cheque', dd: 'Demand Draft' };

    const existing = document.getElementById('receipt-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'receipt-modal';
    modal.innerHTML = `
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">🧾 Receipt Preview</h3>
          <button class="modal-close" onclick="Modal.close('receipt-modal')">✕</button>
        </div>
        <div class="modal-body">
          <div class="receipt-preview">
            <div class="receipt-header-bar">
              <div style="font-size:2rem;margin-bottom:.5rem">🏛️</div>
              <h3>Global Institute of Technology</h3>
              <p>Sector 62, Noida, Uttar Pradesh — 201309</p>
              <p>fees@globaltech.edu | +91-120-4567890</p>
              <div style="margin-top:1rem;background:rgba(255,255,255,0.15);display:inline-block;padding:.5rem 1.5rem;border-radius:8px;font-size:1.1rem;font-weight:700">
                FEE PAYMENT RECEIPT
              </div>
            </div>
            <div class="receipt-body" style="background:#f8fafc">
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;background:#eff6ff;border-radius:8px;padding:1rem;margin-bottom:1rem;font-size:.85rem">
                <div><div style="color:#64748b;font-size:.75rem;font-weight:600;text-transform:uppercase">Receipt No</div><div style="font-weight:700;color:#1e40af">${receipt?.receipt_number || 'N/A'}</div></div>
                <div><div style="color:#64748b;font-size:.75rem;font-weight:600;text-transform:uppercase">Date</div><div style="font-weight:600">${formatDateShort(payment.payment_date)}</div></div>
                <div><div style="color:#64748b;font-size:.75rem;font-weight:600;text-transform:uppercase">Txn ID</div><div style="font-weight:600;font-size:.78rem">${payment.transaction_id || '—'}</div></div>
              </div>
              <div style="background:#1e293b;color:#f1f5f9;border-radius:6px;padding:.625rem 1rem;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.5rem">Student Information</div>
              <div class="receipt-row"><span class="label">Student Name</span><span class="value">${student.name}</span></div>
              <div class="receipt-row"><span class="label">Roll Number</span><span class="value">${student.roll}</span></div>
              <div class="receipt-row"><span class="label">Course</span><span class="value">${student.course}</span></div>
              <div class="receipt-row"><span class="label">Semester</span><span class="value">${student.semester}</span></div>
              <div style="background:#1e293b;color:#f1f5f9;border-radius:6px;padding:.625rem 1rem;font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin:.75rem 0 .5rem">Payment Details</div>
              <div class="receipt-row"><span class="label">Fee Head</span><span class="value">${feeHead.head_name}</span></div>
              <div class="receipt-row"><span class="label">Fee Structure</span><span class="value">${fs?.name || '—'}</span></div>
              <div class="receipt-row"><span class="label">Payment Mode</span><span class="value">${modeLabels[payment.payment_mode] || payment.payment_mode}</span></div>
              <div class="receipt-row"><span class="label">Payment Date</span><span class="value">${formatDate(payment.payment_date)}</span></div>
            </div>
            <div class="receipt-total-bar">
              <div>
                <div style="font-size:.75rem;color:#64748b;font-weight:600;text-transform:uppercase">Total Amount Paid</div>
                <div style="font-size:1.75rem;font-weight:800;color:#1e40af">${formatCurrency(payment.amount_paid)}</div>
              </div>
              <div style="background:#dcfce7;color:#16a34a;padding:.75rem 1.5rem;border-radius:8px;font-weight:800;font-size:1rem">
                ✓ PAID
              </div>
            </div>
            <div class="receipt-stamp">
              <p style="font-size:.75rem;color:#94a3b8">This is a computer-generated receipt. For queries: fees@globaltech.edu</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="Modal.close('receipt-modal')">Close</button>
          <button class="btn btn-primary" onclick="ReceiptGen.generate(${paymentId})">
            ⬇️ Download PDF
          </button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('open'), 10);
  }
};
