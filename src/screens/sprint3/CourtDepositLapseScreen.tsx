import { useState, useEffect } from 'react';
import {
  FileText, Bell, Shield, CheckCircle2, AlertCircle, Clock, XCircle,
  Calendar, Building, User, Download, ShieldAlert, Check, Loader2,
  ArrowRight, ShieldCheck, Database, RefreshCw, AlertTriangle, Play
} from 'lucide-react';
import './CourtDepositLapseScreen.css';

// ─── Mock Data for Court Challans ───
// ─── Mock Data for Court Challans ───
const MOCK_CHALLANS = [
  { id: '270/0241088/8443/05/23/00882', court: 'Civil Court Neemuch', ccd: 'CCD-COURT-2701', date: '2023-05-14', amount: 500000, remaining: 450000, ageYears: 3, refundPending: false, status: 'eligible', reason: 'Ready for lapse (no refund pending)', bsr: '0241088', hoa: '8443', treasury: '270' },
  { id: '270/0241088/8443/06/23/00904', court: 'Civil Court Neemuch', ccd: 'CCD-COURT-2701', date: '2023-06-22', amount: 300000, remaining: 150000, ageYears: 3, refundPending: false, status: 'eligible', reason: 'Ready for lapse (no refund pending)', bsr: '0241088', hoa: '8443', treasury: '270' },
  { id: '270/0241088/8443/08/23/00450', court: 'Civil Court Neemuch', ccd: 'CCD-COURT-2701', date: '2023-08-10', amount: 250000, remaining: 200000, ageYears: 3, refundPending: true, refundLevel: 'DDO Level (Verifier)', status: 'excluded', reason: 'Excluded: Refund claim pending at DDO Verifier', bsr: '0241088', hoa: '8443', treasury: '270' },
  { id: '270/0241088/8443/11/23/00112', court: 'Civil Court Neemuch', ccd: 'CCD-COURT-2701', date: '2023-11-05', amount: 150000, remaining: 120000, ageYears: 3, refundPending: true, refundLevel: 'Treasury Level (Bill Stage)', status: 'excluded', reason: 'Excluded: Refund claim pending at Treasury', bsr: '0241088', hoa: '8443', treasury: '270' },
  { id: '270/0241088/8443/12/23/00301', court: 'Civil Court Neemuch', ccd: 'CCD-COURT-2701', date: '2023-12-18', amount: 100000, remaining: 90000, ageYears: 3, refundPending: false, status: 'eligible', reason: 'Ready for lapse (no refund pending)', bsr: '0241088', hoa: '8443', treasury: '270' },
];

const AUDIT_LOG = [
  { action: 'Rule-Based Segregation Executed', detail: 'System scanned CCD-COURT-2701 and identified 3 eligible challans for auto-lapse.', user: 'System', time: '31 Mar 2026, 23:59', type: 'info' },
  { action: 'Refund-Safety Exclusions Applied', detail: '270/0241088/8443/08/23/00450 & 270/0241088/8443/11/23/00112 excluded due to pending refund claims.', user: 'System', time: '31 Mar 2026, 23:59', type: 'warning' },
  { action: 'System Notification Dispatched', detail: 'Alert sent to Court DDO Creator regarding proposed lapse claim CLM-LP-2026-041.', user: 'System', time: '01 Apr 2026, 00:05', type: 'info' }
];

type SystemDate = '31-mar' | '10-apr' | '16-apr';
type Role = 'creator' | 'verifier' | 'approver' | 'agmp';
type Tab = 'workflow' | 'safety' | 'vlc' | 'notifications' | 'audit';
type BillStatus = 'proposed' | 'bill_created' | 'submitted_to_verifier' | 'submitted_to_approver' | 'approved' | 'rejected';

export default function CourtDepositLapseScreen() {
  // --- Simulators ---
  const [systemDate, setSystemDate] = useState<SystemDate>('31-mar');
  const [currentRole, setCurrentRole] = useState<Role>('creator');
  const [activeTab, setActiveTab] = useState<Tab>('workflow');

  // --- Core State ---
  const [billStatus, setBillStatus] = useState<BillStatus>('proposed');
  const [remarks, setRemarks] = useState('');
  const [verifierNotes, setVerifierNotes] = useState('');
  const [approverNotes, setApproverNotes] = useState('');
  const [approverAction, setApproverAction] = useState<'rejected' | 'returned' | ''>('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [auditTrail, setAuditTrail] = useState(AUDIT_LOG);

  // --- VLC Sync States ---
  const [isVlcSyncing, setIsVlcSyncing] = useState(false);
  const [vlcSynced, setVlcSynced] = useState(false);

  // --- Payment Block simulation Drawer ---
  const [showPaymentMockDrawer, setShowPaymentMockDrawer] = useState(false);
  const [mockPaymentAmount, setMockPaymentAmount] = useState('50000');
  const [paymentFeedback, setPaymentFeedback] = useState<{ status: 'success' | 'blocked' | '', msg: string }>({ status: '', msg: '' });

  // --- Watchdog notifications based on System Date & Bill Status ---
  const isLapsedBefore15 = billStatus === 'approved';
  const showDeadlineWarning = systemDate === '10-apr' && !isLapsedBefore15;
  const isDeadlinePassedBlocked = systemDate === '16-apr' && !isLapsedBefore15;

  // --- Checkbox selection state ---
  const [selectedChallanIds, setSelectedChallanIds] = useState<string[]>(
    MOCK_CHALLANS.filter(c => c.status === 'eligible').map(c => c.id)
  );

  const totalSelectedAmount = MOCK_CHALLANS
    .filter(c => selectedChallanIds.includes(c.id))
    .reduce((sum, c) => sum + c.remaining, 0);

  const totalEligibleAmount = MOCK_CHALLANS
    .filter(c => c.status === 'eligible')
    .reduce((sum, c) => sum + c.remaining, 0);

  const fmt = (n: number) => '₹ ' + n.toLocaleString('en-IN');

  const addAuditEntry = (action: string, detail: string, user: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const time = new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (Simulated)';
    setAuditTrail(prev => [{ action, detail, user, time, type }, ...prev]);
  };

  const renderBillPreview = () => {
    return (
      <div className="draft-bill-preview-card card" style={{
        background: '#f8fafc',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        margin: 'var(--space-4) 0',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #334155', paddingBottom: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <div>
            <h4 style={{ textTransform: 'uppercase', fontWeight: 800, fontSize: '13px', margin: 0, color: '#1e293b' }}>
              Office of the Court DDO Neemuch
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>District Court Civil Division, Neemuch, MP</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', background: '#e2e8f0', borderRadius: 'var(--radius-sm)' }}>
              Bill Reference: CCD-LP-2026-0089
            </span>
            <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>Date: 31/03/2026</div>
          </div>
        </div>

        {/* Bill Metadata Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-4)',
          fontSize: '12px',
          marginBottom: 'var(--space-5)',
          background: '#fff',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border-light)'
        }}>
          <div><strong>Bill Type:</strong> Deposit Lapse (By-Transfer)</div>
          <div><strong>DDO Code:</strong> 2701005 (Civil Court DDO)</div>
          <div><strong>Debit CCD Account:</strong> CCD-COURT-2701</div>
          <div><strong>Total Bill Amount:</strong> <strong style={{ color: 'var(--color-primary)' }}>{fmt(totalSelectedAmount)}</strong></div>
          <div><strong>Credit Head of Account:</strong> 0075-00-106-0000</div>
          <div><strong>Treasury Code:</strong> 270 (Neemuch District Treasury)</div>
        </div>

        {/* Challan Table inside Bill Preview with Target HoA column */}
        <h5 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
          Challans Included in Lapse Transfer
        </h5>
        <div className="dlmc-table-wrapper" style={{ background: '#fff' }}>
          <table className="dlmc-table" style={{ margin: 0 }}>
            <thead style={{ background: 'var(--color-bg-secondary)' }}>
              <tr>
                <th style={{ padding: '8px var(--space-3)' }}>Challan Number</th>
                <th style={{ padding: '8px var(--space-3)' }}>Challan Deposit Date</th>
                <th style={{ padding: '8px var(--space-3)' }} className="align-right">Lapse Balance</th>
                <th style={{ padding: '8px var(--space-3)' }}>Lapse HoA</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CHALLANS.filter(c => selectedChallanIds.includes(c.id)).map(c => (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.02em', color: '#0f172a', padding: '8px var(--space-3)' }}>{c.id}</td>
                  <td style={{ padding: '8px var(--space-3)' }}>{c.date}</td>
                  <td className="align-right" style={{ fontWeight: 700, color: 'var(--color-primary)', padding: '8px var(--space-3)' }}>{fmt(c.remaining)}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-success)', fontWeight: 600, padding: '8px var(--space-3)' }}>0075-00-106-0000</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- Action Handlers ---
  const handleCreateBill = () => {
    setBillStatus('bill_created');
    addAuditEntry('Lapse Bill Created', `Lapse bill created against claim CLM-LP-2026-041. Amount: ${fmt(totalSelectedAmount)}.`, 'DDO Court Creator', 'info');
  };

  const handleSubmitToVerifier = () => {
    setBillStatus('submitted_to_verifier');
    addAuditEntry('Bill Submitted to Verifier', `Bill submitted for check. Remarks: ${remarks || 'None'}`, 'DDO Court Creator', 'info');
  };

  const handleVerifierSubmit = () => {
    setBillStatus('submitted_to_approver');
    addAuditEntry('Bill Verified & Forwarded', `Bill verified and forwarded to DDO Approver. Notes: ${verifierNotes || 'None'}`, 'DDO Verifier', 'success');
  };

  const handleVerifierReturn = () => {
    setBillStatus('rejected');
    setApproverNotes(''); // Ensure only verifierNotes are present to differentiate
    addAuditEntry('Bill Returned by Verifier', `Lapse bill returned to Creator for correction. Reason: ${verifierNotes || 'Recheck balances'}`, 'DDO Verifier', 'error');
  };

  const handleApproverApprove = () => {
    setBillStatus('approved');
    addAuditEntry('Lapse Bill Approved', `Lapse bill approved. Generating Voucher by transfer in HoA 0075. Posting central accounting impact.`, 'DDO Court Approver', 'success');
    addAuditEntry('Voucher Generated & Accounting Posted', `Voucher VCH-LP-0075-8819 generated successfully. Credited to HoA 0075-00-106-0000.`, 'System', 'success');
    addAuditEntry('AGMP Tagging Completed', `Transaction tagged for AGMP VLC reporting. VLC TXT File compiled.`, 'System', 'info');
  };

  const handleApproverReject = () => {
    setBillStatus('rejected');
    setApproverAction('rejected');
    addAuditEntry('Lapse Bill Rejected', `Lapse bill rejected by DDO Approver. Reason: ${approverNotes || 'Recheck eligibility'}`, 'DDO Court Approver', 'error');
  };

  const handleApproverReturn = () => {
    setBillStatus('rejected');
    setApproverAction('returned');
    addAuditEntry('Lapse Bill Returned by Approver', `Lapse bill returned to Creator for correction. Reason: ${approverNotes || 'Recheck balances'}`, 'DDO Court Approver', 'warning');
  };

  const handleRegenerateClaim = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setBillStatus('proposed');
      setRemarks('');
      setVerifierNotes('');
      setApproverNotes('');
      setApproverAction('');
      setSelectedChallanIds(MOCK_CHALLANS.filter(c => c.status === 'eligible').map(c => c.id));
      setIsRegenerating(false);
      addAuditEntry('Claim Regenerated', 'Court DDO Creator triggered claim regeneration. Refetched eligible challan list & excluded active refunds.', 'DDO Court Creator', 'success');
    }, 1500);
  };

  const handleVlcSync = () => {
    setIsVlcSyncing(true);
    setTimeout(() => {
      setIsVlcSyncing(false);
      setVlcSynced(true);
      addAuditEntry('AGMP VLC Sync Complete', 'AGMP VLC system successfully consumed the lapse TXT file via integration module.', 'AGMP VLC System', 'success');
    }, 2000);
  };

  // Mock checking payment advices
  const handleTestPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDeadlinePassedBlocked) {
      setPaymentFeedback({
        status: 'blocked',
        msg: `🚨 PAYMENT SUSPENDED! The system has blocked payment processing from Civil Court Deposit CCD-COURT-2701 because the FY 2025-26 lapse process was not completed by the 15th April deadline.`
      });
      addAuditEntry('Payment Attempt Blocked', 'Attempted CCD payment blocked due to lapse deadline violation.', 'System', 'error');
    } else {
      setPaymentFeedback({
        status: 'success',
        msg: `✅ Payment of ₹${Number(mockPaymentAmount).toLocaleString('en-IN')} approved successfully. CCD balance is valid.`
      });
      addAuditEntry('Payment Approved', `Payment of ₹${Number(mockPaymentAmount).toLocaleString('en-IN')} processed successfully.`, 'DDO Creator', 'success');
    }
  };

  // Automatically trigger audit entries on system date change
  useEffect(() => {
    if (systemDate === '10-apr') {
      addAuditEntry('Deadline Approach Scanned', 'System scanned pending lapse bills. Warning generated: 5 days left until CCD block.', 'System', 'warning');
    } else if (systemDate === '16-apr') {
      if (!isLapsedBefore15) {
        addAuditEntry('Lapse Deadline Violation Locked', 'Lapse process not completed by 15th April! Alert sent to AGMP. Blocked all payments from CCD-COURT-2701.', 'System', 'error');
      } else {
        addAuditEntry('Post-Deadline Status Clean', 'Lapse completed on-time. CCD Account remains fully active.', 'System', 'success');
      }
    }
  }, [systemDate]);

  // VLC TXT File Content
  const vlcFileContent = `AGMP_VLC_LAPSE_CCD_EXPORT_FY2025-26
EXPORT_DATE: 2026-04-16
CCD_ACCOUNT: CCD-COURT-2701 (Civil Court Neemuch)
VOUCHER_NO: VCH-LP-0075-8819
TRANSFER_CREDIT_HOA: 0075-00-106-0000 (Miscellaneous General Services - Unclaimed Deposits)
---------------------------------------------------------------------------------------------------------
REC_TYPE | CHALLAN_NO                  | CHALLAN_DATE | ORIG_AMOUNT | LAPSE_AMOUNT | REFUND_STATUS
---------------------------------------------------------------------------------------------------------
TXN      | 270/0241088/8443/05/23/00882| 2023-05-14   | 500,000.00  | 450,000.00   | NO_REFUND_PENDING
TXN      | 270/0241088/8443/06/23/00904| 2023-06-22   | 300,000.00  | 150,000.00   | NO_REFUND_PENDING
TXN      | 270/0241088/8443/12/23/00301| 2023-12-18   | 100,000.00  | 90,000.00    | NO_REFUND_PENDING
---------------------------------------------------------------------------------------------------------
SUMMARY  | TOTAL_CHALLANS: 3 | TOTAL_LAPSED_CREDIT: 690,000.00`;

  return (
    <div className="dlmc-screen animate-fade-in">
      {/* ─── SYSTEM STATUS CONTROLLERS (SIMULATOR CONTROLS) ─── */}
      <section className="dlmc-simulator-bar">
        <div className="simulator-section">
          <div className="simulator-label">
            <Calendar size={14} /> <strong>Interactive System Date Simulator:</strong>
          </div>
          <div className="simulator-buttons">
            <button
              className={`sim-btn ${systemDate === '31-mar' ? 'active green' : ''}`}
              onClick={() => setSystemDate('31-mar')}
            >
              March 31st <span className="sim-sub">Claims Auto-Proposed</span>
            </button>
            <button
              className={`sim-btn ${systemDate === '10-apr' ? 'active yellow' : ''}`}
              onClick={() => setSystemDate('10-apr')}
            >
              April 10th <span className="sim-sub">Approaching Deadline</span>
            </button>
            <button
              className={`sim-btn ${systemDate === '16-apr' ? 'active red' : ''}`}
              onClick={() => setSystemDate('16-apr')}
            >
              April 16th <span className="sim-sub">{isLapsedBefore15 ? 'Safe (Lapsed)' : 'Deadline Passed (BLOCKED)'}</span>
            </button>
          </div>
        </div>

        <div className="simulator-section">
          <div className="simulator-label">
            <User size={14} /> <strong>Switch Simulator Role:</strong>
          </div>
          <div className="simulator-buttons">
            <button
              className={`sim-btn role-btn ${currentRole === 'creator' ? 'active-role creator' : ''}`}
              onClick={() => setCurrentRole('creator')}
            >
              Court Creator
            </button>
            <button
              className={`sim-btn role-btn ${currentRole === 'verifier' ? 'active-role verifier' : ''}`}
              onClick={() => setCurrentRole('verifier')}
            >
              DDO Verifier
            </button>
            <button
              className={`sim-btn role-btn ${currentRole === 'approver' ? 'active-role approver' : ''}`}
              onClick={() => setCurrentRole('approver')}
            >
              DDO Approver
            </button>
            <button
              className={`sim-btn role-btn ${currentRole === 'agmp' ? 'active-role agmp' : ''}`}
              onClick={() => setCurrentRole('agmp')}
            >
              AGMP VLC Sync
            </button>
          </div>
        </div>
      </section>

      {/* ─── SYSTEM CRITICAL WATCHDOG BANNERS ─── */}
      {showDeadlineWarning && (
        <div className="dlmc-watchdog-banner warning animate-fade-in-down">
          <AlertTriangle size={20} className="shake-anim" />
          <div className="banner-content">
            <h4>Lapse Deadline Approaching! (April 15th Deadline)</h4>
            <p>
              The auto-lapse process for the Civil Court Deposit (CCD-COURT-2701) must be approved by the Court Approver before <strong>15th April</strong>.
              Failure to complete this will trigger an AGMP notification and **completely block all payment operations** from this CCD account.
            </p>
          </div>
          <div className="banner-days">5 Days Left</div>
        </div>
      )}

      {isDeadlinePassedBlocked && (
        <div className="dlmc-watchdog-banner error animate-fade-in-down">
          <AlertCircle size={20} className="flash-anim" />
          <div className="banner-content">
            <h4>🚨 CCD ACCOUNT SUSPENDED — PAYMENT PROCESSING BLOCKED</h4>
            <p>
              Lapse process was not completed by the <strong>15th April</strong>. The system has automatically disabled all payment bill generation, credit advice processing, and fund transfers from <strong>CCD-COURT-2701</strong>. System notifications have been dispatched to **AGMP** and the **Court DDO Approver**.
            </p>
          </div>
          <div className="banner-actions">
            <button className="btn btn-sm btn-secondary" onClick={() => setShowPaymentMockDrawer(true)}>
              Test Payments (Blocked)
            </button>
          </div>
        </div>
      )}

      {isLapsedBefore15 && (
        <div className="dlmc-watchdog-banner success animate-fade-in-down">
          <CheckCircle2 size={20} />
          <div className="banner-content">
            <h4>Lapse Process Successfully Completed for FY 2025-26</h4>
            <p>
              All eligible challans have been auto-lapsed and credited by transfer to HoA <strong>0075</strong> via Voucher <strong>VCH-LP-0075-8819</strong>. Central accounts have been updated, AGMP has been notified, and the VLC import file has been compiled. CCD account payments remain active.
            </p>
          </div>
        </div>
      )}

      {/* ─── SCREEN HEADER ─── */}
      <header className="dlmc-header">
        <div className="title-area">
          <div className="badge-sprint">Sprint 3 Story 12</div>
          <h1>Lapse of Court Deposit Challans</h1>
          <p className="header-desc">
            Review and process system-proposed auto-lapse claims for Court DDO. Ensure refund-safety screening, complete the multi-actor verification workflow, download AGMP VLC text integrations, and monitor timeline blocks.
          </p>
        </div>
        <div className="dlmc-header-badges">
          <span className="dlmc-header-badge role">
            <User size={12} /> {currentRole === 'creator' ? 'Court DDO Creator' : currentRole === 'verifier' ? 'DDO Verifier' : currentRole === 'approver' ? 'DDO Approver' : 'AGMP VLC Administrator'}
          </span>
          <span className="dlmc-header-badge module"><Building size={12} /> Civil Court Deposits (CCD)</span>
          <span className="dlmc-header-badge fy"><Calendar size={12} /> FY 2025-26 (Closing)</span>
        </div>
      </header>

      {/* ─── SUMMARY CARDS ─── */}
      <section className="dlmc-stats-grid">
        <div className="dlmc-stat-card primary">
          <div className="dlmc-stat-icon primary"><Database size={20} /></div>
          <div className="dlmc-stat-info">
            <span className="dlmc-stat-value">₹ 10,10,000</span>
            <span className="dlmc-stat-label">Evaluated CCD Balance</span>
          </div>
        </div>
        <div className="dlmc-stat-card warning">
          <div className="dlmc-stat-icon warning"><Clock size={20} /></div>
          <div className="dlmc-stat-info">
            <span className="dlmc-stat-value">{fmt(totalSelectedAmount)}</span>
            <span className="dlmc-stat-label">System Proposed for Lapse</span>
          </div>
        </div>
        <div className="dlmc-stat-card error">
          <div className="dlmc-stat-icon error"><ShieldAlert size={20} /></div>
          <div className="dlmc-stat-info">
            <span className="dlmc-stat-value">₹ 3,20,000</span>
            <span className="dlmc-stat-label">Excluded (Refund-Safety)</span>
          </div>
        </div>
        <div className="dlmc-stat-card success">
          <div className="dlmc-stat-icon success">
            {billStatus === 'approved' ? <CheckCircle2 size={20} /> : <Loader2 className="spin-anim" size={20} />}
          </div>
          <div className="dlmc-stat-info">
            <span className="dlmc-stat-value">
              {billStatus === 'proposed' && 'Claim Proposed'}
              {billStatus === 'bill_created' && 'Bill Created (Draft)'}
              {billStatus === 'submitted_to_verifier' && 'Verifier Review'}
              {billStatus === 'submitted_to_approver' && 'Approver Review'}
              {billStatus === 'approved' && 'Lapsed & Settled'}
              {billStatus === 'rejected' && 'Rejected by DDO'}
            </span>
            <span className="dlmc-stat-label">Current Workflow Status</span>
          </div>
        </div>
      </section>

      {/* ─── TABS NAVIGATION ─── */}
      <nav className="dlmc-tabs">
        <button
          className={`dlmc-tab ${activeTab === 'workflow' ? 'active' : ''}`}
          onClick={() => setActiveTab('workflow')}
        >
          <FileText size={16} /> Challans Pending for Lapse
        </button>
        <button
          className={`dlmc-tab ${activeTab === 'safety' ? 'active' : ''}`}
          onClick={() => setActiveTab('safety')}
        >
          <ShieldCheck size={16} /> Challans Excluded from Lapse
          <span className="dlmc-tab-count red">2</span>
        </button>
        <button
          className={`dlmc-tab ${activeTab === 'vlc' ? 'active' : ''}`}
          onClick={() => setActiveTab('vlc')}
        >
          <Database size={16} /> AGMP VLC Integration
          {billStatus === 'approved' && <span className="dlmc-tab-count green">TXT</span>}
        </button>
        <button
          className={`dlmc-tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell size={16} /> Notifications
          {isDeadlinePassedBlocked && <span className="dlmc-tab-count red">2</span>}
        </button>
        <button
          className={`dlmc-tab ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <Shield size={16} /> Audit Timeline
        </button>
      </nav>

      {/* ─── TAB CONTENT: WORKFLOW PROCESS ─── */}
      {activeTab === 'workflow' && (
        <div className="dlmc-section animate-fade-in">
          <div className="dlmc-section-header">
            <div className="dlmc-section-icon"><FileText size={18} /></div>
            <h2>Lapse of Court Deposit Account Challan</h2>
            <div className="dlmc-section-header-actions">
              <span className="current-user-pill">
                Active User role: <strong>{currentRole.toUpperCase()}</strong>
              </span>
            </div>
          </div>
          <div className="dlmc-section-body">
            {/* Step Timeline Indicator */}
            <div className="dlmc-stepper">
              <div className={`step ${billStatus !== 'proposed' ? 'done' : 'active'}`}>
                <div className="circle">1</div>
                <div className="label">Auto-Claim Proposed (Mar 31)</div>
              </div>
              <div className={`step-line ${['bill_created', 'submitted_to_verifier', 'submitted_to_approver', 'approved', 'rejected'].includes(billStatus) ? 'done' : ''}`} />
              <div className={`step ${['bill_created', 'submitted_to_verifier'].includes(billStatus) ? 'active' : ['submitted_to_approver', 'approved', 'rejected'].includes(billStatus) ? 'done' : ''}`}>
                <div className="circle">2</div>
                <div className="label">Bill Created (Creator)</div>
              </div>
              <div className={`step-line ${['submitted_to_verifier', 'submitted_to_approver', 'approved', 'rejected'].includes(billStatus) ? 'done' : ''}`} />
              <div className={`step ${billStatus === 'submitted_to_verifier' ? 'active' : ['submitted_to_approver', 'approved', 'rejected'].includes(billStatus) ? 'done' : ''}`}>
                <div className="circle">3</div>
                <div className="label">Verifier Checked</div>
              </div>
              <div className={`step-line ${['submitted_to_approver', 'approved', 'rejected'].includes(billStatus) ? 'done' : ''}`} />
              <div className={`step ${billStatus === 'submitted_to_approver' ? 'active' : billStatus === 'approved' ? 'done' : billStatus === 'rejected' ? 'rejected' : ''}`}>
                <div className="circle">{billStatus === 'rejected' ? '✕' : '4'}</div>
                <div className="label">{billStatus === 'rejected' ? 'Rejected' : 'DDO Approved'}</div>
              </div>
            </div>

            {/* Workflow Card depending on the workflow status & current persona */}
            <div className="workflow-detail-card card">
              {/* Creator UI */}
              {currentRole === 'creator' && (
                <div className="workflow-persona-wrapper">
                  <div className="persona-header creator">
                    <User size={18} />
                    <h3>System Proposed Lapse Challan</h3>
                  </div>

                  {billStatus === 'proposed' && (
                    <div className="workflow-action-box animate-scale-in">
                      <div className="proposed-claim-summary" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                        <h4 style={{ marginBottom: 'var(--space-3)' }}>System Proposed Claim: CLM-LP-2026-041</h4>
                        <div className="claim-metadata" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
                          <div><strong>CCD Account:</strong> Civil Court Deposits (Neemuch)</div>
                          <div 
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '6px',
                              padding: '6px 12px',
                              background: 'var(--color-primary-lighter)',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid rgba(79, 70, 229, 0.15)'
                            }}
                          >
                            <strong>Selected Challans:</strong> 
                            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                              {selectedChallanIds.length} Selected / 3 Proposed
                            </span>
                          </div>
                          <div><strong>Total Balances:</strong> {fmt(totalSelectedAmount)}</div>
                        </div>

                        {/* Identified Challans Breakdown (Always Shown) */}
                        <div className="proposed-challans-detail-list" style={{
                          marginTop: 'var(--space-4)',
                          padding: 'var(--space-3)',
                          background: 'var(--color-white)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border-light)',
                          boxShadow: 'var(--shadow-xs)'
                        }}>
                          <h5 style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: 'var(--color-text-secondary)',
                            marginBottom: 'var(--space-2)',
                            letterSpacing: '0.04em'
                          }}>
                            Proposed Challans Breakdown (Identified for Lapse)
                          </h5>
                          <div className="dlmc-table-wrapper" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            <table className="dlmc-table" style={{ margin: 0 }}>
                              <thead style={{ background: 'var(--color-bg-secondary)', position: 'sticky', top: 0 }}>
                                <tr>
                                  <th style={{ fontSize: '10px', padding: '6px var(--space-3)' }}>Challan Number</th>
                                  <th style={{ fontSize: '10px', padding: '6px var(--space-3)' }}> Challan Deposit Date</th>
                                  <th style={{ fontSize: '10px', padding: '6px var(--space-3)' }} className="align-right">Original Amount</th>
                                  <th style={{ fontSize: '10px', padding: '6px var(--space-3)' }} className="align-right">Lapse Balance</th>
                                  <th style={{ fontSize: '10px', padding: '6px var(--space-3)', width: '70px', textAlign: 'center' }}>
                                    Include?
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {MOCK_CHALLANS.filter(c => c.status === 'eligible').map(c => (
                                  <tr key={c.id} style={{ background: selectedChallanIds.includes(c.id) ? 'transparent' : '#f8fafc', opacity: selectedChallanIds.includes(c.id) ? 1 : 0.65 }}>
                                    <td style={{ fontSize: '11px', padding: '6px var(--space-3)', fontFamily: 'monospace', fontWeight: 700 }}>{c.id}</td>
                                    <td style={{ fontSize: '11px', padding: '6px var(--space-3)' }}>{c.date}</td>
                                    <td style={{ fontSize: '11px', padding: '6px var(--space-3)' }} className="align-right">{fmt(c.amount)}</td>
                                    <td style={{ fontSize: '11px', padding: '6px var(--space-3)', fontWeight: 700, color: 'var(--color-primary)' }} className="align-right">{fmt(c.remaining)}</td>
                                    <td style={{ padding: '6px var(--space-3)', width: '70px', textAlign: 'center' }}>
                                      <input 
                                        type="checkbox" 
                                        checked={selectedChallanIds.includes(c.id)} 
                                        onChange={() => {
                                          setSelectedChallanIds(prev => 
                                            prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]
                                          );
                                        }}
                                        style={{ cursor: 'pointer' }}
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Create Lapse Bill Button at Bottom Right */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                          <button 
                            className="btn btn-primary" 
                            onClick={handleCreateBill} 
                            disabled={selectedChallanIds.length === 0}
                            style={{ 
                              padding: '10px 24px', 
                              background: selectedChallanIds.length === 0 ? 'var(--color-border)' : 'var(--color-primary)', 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '8px', 
                              fontWeight: 600,
                              cursor: selectedChallanIds.length === 0 ? 'not-allowed' : 'pointer'
                            }}
                          >
                            <FileText size={14} /> Create Lapse Bill
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {billStatus === 'bill_created' && (
                    <div className="workflow-action-box animate-scale-in">
                      <h4>Draft Lapse Bill against Claim CLM-LP-2026-041</h4>
                      <p className="helper-text">Add DDO submission remarks before sending the lapse bill to the DDO Verifier.</p>

                      <div className="alert-box info" style={{ marginTop: 'var(--space-3)', borderLeft: '4px solid var(--color-success)', color: '#065f46', background: '#ecfdf5' }}>
                        <ShieldCheck size={16} />
                        <div>
                          <strong>Settlement Account Mapping:</strong> The outstanding balances of the selected eligible challans (totaling <strong>{fmt(totalSelectedAmount)}</strong>) will be transferred by-transfer into receipt <strong>Head of Account (HoA) 0075-00-106-0000</strong> (Miscellaneous General Services - Unclaimed Deposits) upon final approval.
                        </div>
                      </div>

                      {renderBillPreview()}
                      
                      <div className="form-group" style={{ margin: 'var(--space-4) 0' }}>
                        <label className="form-label">Creator Remarks / Submission Notes <span className="required">*</span></label>
                        <textarea
                          className="form-input"
                          rows={3}
                          value={remarks}
                          onChange={e => setRemarks(e.target.value)}
                          placeholder="Enter details about this lapse bill (e.g. verified remaining balances for FY 2025-26)..."
                        />
                      </div>

                      <div className="action-buttons-group">
                        <button className="btn btn-primary" disabled={!remarks} onClick={handleSubmitToVerifier}>
                          <ArrowRight size={14} /> Submit to DDO Verifier
                        </button>
                        <button className="btn btn-secondary" onClick={() => setBillStatus('proposed')}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {billStatus === 'submitted_to_verifier' && (
                    <div className="workflow-action-box centered">
                      <Loader2 className="spin-anim text-primary" size={32} />
                      <h4>Bill Sent to DDO Verifier</h4>
                      <p>The lapse bill is currently pending review at the DDO Verifier level.</p>
                      <div className="remarks-display">
                        <strong>Your Remarks:</strong> "{remarks}"
                      </div>
                      <p className="sim-hint">💡 Use the Switch Simulator Role bar above to switch to **DDO Verifier** to advance this workflow.</p>
                    </div>
                  )}

                  {billStatus === 'submitted_to_approver' && (
                    <div className="workflow-action-box centered">
                      <Loader2 className="spin-anim text-primary" size={32} />
                      <h4>Bill Awaiting DDO Approver Action</h4>
                      <p>The lapse bill has been verified and is pending final approval by the Court DDO Approver.</p>
                      <p className="sim-hint">💡 Use the Switch Simulator Role bar above to switch to **DDO Approver** to Approve or Reject.</p>
                    </div>
                  )}

                  {billStatus === 'approved' && (
                    <div className="workflow-action-box success animate-scale-in">
                      <div className="success-icon-badge"><CheckCircle2 size={36} color="var(--color-success)" /></div>
                      <h3>Lapse Bill Approved!</h3>
                      <p>The lapse bill has been fully processed by the DDO Approver. Below are the generated system artifacts:</p>

                      <div className="success-artifacts-grid">
                        <div className="artifact-card">
                          <span className="art-label">Lapse Voucher (0075)</span>
                          <span className="art-value">VCH-LP-0075-8819</span>
                          <small>Credited by transfer in HoA 0075</small>
                        </div>
                        <div className="artifact-card">
                          <span className="art-label">Accounting Entries</span>
                          <span className="art-value">Posted Centrally</span>
                          <small>CCD Account debited, 0075 credited</small>
                        </div>
                        <div className="artifact-card">
                          <span className="art-label">AGMP Reporting Tag</span>
                          <span className="art-value">TAGGED</span>
                          <small>Marked for VLC automatic consumption</small>
                        </div>
                      </div>

                      <div className="action-buttons-group">
                        <button className="btn btn-secondary" onClick={() => setActiveTab('vlc')}>
                          <Database size={14} /> View VLC Integration File
                        </button>
                      </div>
                    </div>
                  )}

                  {billStatus === 'rejected' && (
                    <div className="workflow-action-box error animate-scale-in">
                      <div className="error-icon-badge">
                        {approverAction === 'rejected' ? (
                          <XCircle size={36} color="var(--color-error)" />
                        ) : (
                          <AlertTriangle size={36} color="var(--color-warning)" />
                        )}
                      </div>
                      <h3>
                        {approverAction === 'rejected'
                          ? 'Lapse Bill Rejected by DDO Approver'
                          : approverAction === 'returned'
                          ? 'Lapse Bill Returned by DDO Approver'
                          : 'Lapse Bill Returned by DDO Verifier'}
                      </h3>
                      <p className="rejection-reason">
                        <strong>
                          Reason for {approverAction === 'rejected' ? 'Rejection' : 'Return'}:
                        </strong>{' '}
                        "{approverNotes || verifierNotes || 'Verifier or Approver found discrepancies in proposed balances.'}"
                      </p>
                      
                      <div className="facility-box warning">
                        <h4>Facility to Regenerate Claim</h4>
                        <p>As per court deposit rules, if the lapse bill is rejected by the DDO Approver or returned by the DDO Verifier, you can regenerate/refetch the claim for lapse deposits to synchronize with current ledger balances and exclude any newly raised refund claims.</p>
                      </div>

                      <div className="action-buttons-group" style={{ marginTop: 'var(--space-4)' }}>
                        <button className="btn btn-primary" onClick={handleRegenerateClaim} disabled={isRegenerating}>
                          {isRegenerating ? (
                            <><Loader2 className="spin-anim" size={14} /> Regenerating Claims...</>
                          ) : (
                            <><RefreshCw size={14} /> Regenerate/Refetch Claim for Lapse Deposit</>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Verifier UI */}
              {currentRole === 'verifier' && (
                <div className="workflow-persona-wrapper">
                  <div className="persona-header verifier">
                    <User size={18} />
                    <h3>DDO Verifier Panel</h3>
                  </div>

                  {billStatus === 'submitted_to_verifier' ? (
                    <div className="workflow-action-box animate-scale-in">
                      <h4>Review Lapse Bill — Claim CLM-LP-2026-041</h4>
                      <p>Analyze eligible challans and creator comments before forwarding the bill to the DDO Approver.</p>
                      
                      <div className="summary-list">
                        <div className="summary-row"><strong>Proposed Lapse:</strong> {fmt(totalSelectedAmount)}</div>
                        <div className="summary-row"><strong>CCD Account:</strong> CCD-COURT-2701</div>
                        <div className="summary-row"><strong>Creator Remarks:</strong> "{remarks}"</div>
                      </div>

                      {renderBillPreview()}

                      <div className="form-group" style={{ margin: 'var(--space-4) 0' }}>
                        <label className="form-label">Verifier Remarks / Check Notes <span className="required">*</span></label>
                        <textarea
                          className="form-input"
                          rows={3}
                          value={verifierNotes}
                          onChange={e => setVerifierNotes(e.target.value)}
                          placeholder="Enter verification notes (e.g. verified ledger balances and confirm refund block)..."
                        />
                      </div>

                      <div className="action-buttons-group">
                        <button className="btn btn-primary" disabled={!verifierNotes} onClick={handleVerifierSubmit}>
                          <CheckCircle2 size={14} /> Submit & Forward to Approver
                        </button>
                        <button 
                          className="btn" 
                          disabled={!verifierNotes} 
                          onClick={handleVerifierReturn} 
                          style={verifierNotes ? { 
                            background: 'var(--color-warning)', 
                            color: '#fff', 
                            borderColor: 'var(--color-warning)' 
                          } : undefined}
                        >
                          <XCircle size={14} /> Return to Creator
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="workflow-action-box centered">
                      <Shield size={32} className="text-secondary" />
                      <h4>No Bill Pending in Verifier Queue</h4>
                      <p>
                        Current Bill Status: <strong>{billStatus.toUpperCase()}</strong>.
                        {billStatus === 'proposed' && ' The Court Creator needs to generate and submit a lapse bill first.'}
                        {billStatus === 'bill_created' && ' The Court Creator has created a draft bill but has not yet submitted it.'}
                        {billStatus === 'submitted_to_approver' && ' The bill has already been verified and is with the DDO Approver.'}
                        {billStatus === 'approved' && ' The bill is already approved.'}
                        {billStatus === 'rejected' && ' The bill is currently rejected or returned.'}
                      </p>
                      <p className="sim-hint">💡 Switch to **Court Creator** role if you need to create/submit a bill first.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Approver UI */}
              {currentRole === 'approver' && (
                <div className="workflow-persona-wrapper">
                  <div className="persona-header approver">
                    <User size={18} />
                    <h3>DDO Approver Panel</h3>
                  </div>

                  {billStatus === 'submitted_to_approver' ? (
                    <div className="workflow-action-box animate-scale-in">
                      <h4>Final Approval: Lapse Bill CLM-LP-2026-041</h4>
                      <p>Carefully review creator remarks, verification notes, and the list of eligible/excluded challans. The final approval will auto-generate the lapse voucher into Receipt <strong>HoA 0075</strong>.</p>

                      <div className="summary-list">
                        <div className="summary-row"><strong>Lapse Amount:</strong> <strong style={{ color: 'var(--color-primary)' }}>{fmt(totalSelectedAmount)}</strong></div>
                        <div className="summary-row"><strong>CCD Account:</strong> CCD-COURT-2701 (Civil Court Neemuch)</div>
                        <div className="summary-row"><strong>Creator Notes:</strong> "{remarks}"</div>
                        <div className="summary-row"><strong>Verifier Notes:</strong> "{verifierNotes}"</div>
                      </div>

                      {renderBillPreview()}

                      <div className="form-group" style={{ margin: 'var(--space-4) 0' }}>
                        <label className="form-label">Approver Remarks / Approving Notes <span className="required">*</span></label>
                        <textarea
                          className="form-input"
                          rows={3}
                          value={approverNotes}
                          onChange={e => setApproverNotes(e.target.value)}
                          placeholder="Enter final remarks (e.g., approved for central lapse transfer to HoA 0075)..."
                        />
                      </div>

                      <div className="action-buttons-group">
                        <button className="btn btn-primary" disabled={!approverNotes} onClick={handleApproverApprove}>
                          <CheckCircle2 size={14} /> Approve Lapse & Generate Voucher
                        </button>
                        <button className="btn btn-danger" disabled={!approverNotes} onClick={handleApproverReject}>
                          <XCircle size={14} /> Reject Lapse Bill
                        </button>
                        <button 
                          className="btn" 
                          disabled={!approverNotes} 
                          onClick={handleApproverReturn} 
                          style={approverNotes ? { 
                            background: 'var(--color-warning)', 
                            color: '#fff', 
                            borderColor: 'var(--color-warning)' 
                          } : undefined}
                        >
                          <RefreshCw size={14} /> Return to Creator
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="workflow-action-box centered">
                      <ShieldCheck size={32} className="text-secondary" />
                      <h4>No Bill Pending in Approver Queue</h4>
                      <p>
                        Current Bill Status: <strong>{billStatus.toUpperCase()}</strong>.
                        {['proposed', 'bill_created', 'submitted_to_verifier'].includes(billStatus) && ' The bill is still in preparation or verification stage.'}
                        {billStatus === 'approved' && ' The bill has already been approved and processed.'}
                        {billStatus === 'rejected' && ' The bill is currently rejected or returned.'}
                      </p>
                      <p className="sim-hint">💡 Switch to **DDO Verifier** if you need to submit a checked bill, or **Court Creator** to start the process.</p>
                    </div>
                  )}
                </div>
              )}

              {/* AGMP UI */}
              {currentRole === 'agmp' && (
                <div className="workflow-persona-wrapper">
                  <div className="persona-header agmp">
                    <Database size={18} />
                    <h3>AGMP VLC Integration Console</h3>
                  </div>

                  <div className="workflow-action-box">
                    <h4>Voucher Level Computerization (VLC) Sync Panel</h4>
                    <p>This panel simulates how the Accountant General Madhya Pradesh (AGMP) consumes the central court lapse files to eliminate manual intervention in VLC system accounting records.</p>
                    
                    {billStatus === 'approved' ? (
                      <div className="ag-integration-box animate-scale-in">
                        <div className="alert-box success">
                          <CheckCircle2 size={16} />
                          <div>Lapse is approved. Text file is ready for consumption in VLC.</div>
                        </div>

                        <div className="vlc-status-container">
                          <div><strong>VLC Sync Status:</strong> {vlcSynced ? <span className="badge badge-success">Synced & Consumed</span> : <span className="badge badge-warning">Awaiting Sync</span>}</div>
                          <div><strong>Integration Method:</strong> SFTP/API Auto-trigger</div>
                        </div>

                        {!vlcSynced ? (
                          <div className="action-buttons-group" style={{ marginTop: 'var(--space-4)' }}>
                            <button className="btn btn-primary" onClick={handleVlcSync} disabled={isVlcSyncing}>
                              {isVlcSyncing ? (
                                <><Loader2 className="spin-anim" size={14} /> Consuming Text file in VLC...</>
                              ) : (
                                <><Play size={14} /> Run Mock AG VLC Consumption</>
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="vlc-synced-message">
                            <h4>🎉 VLC System Successfully Synced</h4>
                            <p>The AGMP VLC database has successfully consumed the TXT file. Manual verification is waived. Remaining balances are zeroed out in AG ledger cards.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="alert-box error">
                        <AlertCircle size={16} />
                        <div><strong>No Approved Claims:</strong> AGMP VLC cannot consume lapse files until the DDO Approver has officially approved the Court Lapse Bill. Current status is '{billStatus}'.</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB CONTENT: REFUND-SAFETY EXCLUSIONS ─── */}
      {activeTab === 'safety' && (
        <div className="dlmc-section animate-fade-in">
          <div className="dlmc-section-header">
            <div className="dlmc-section-icon"><ShieldCheck size={18} /></div>
            <h2>Refund-Safety Evaluation Grid (CCD-COURT-2701)</h2>
          </div>
          <div className="dlmc-section-body" style={{ padding: 0 }}>


            <div className="dlmc-table-wrapper" style={{ border: 'none' }}>
              <table className="dlmc-table">
                <thead>
                  <tr>
                    <th>Challan Number</th>
                    <th>Challan Deposit Date</th>
                    <th className="align-right">Original Amount</th>
                    <th className="align-right">Remaining Balance</th>
                    <th>Refund Pending Status</th>
                    <th>Lapse Eligibility</th>
                    <th>Audit Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_CHALLANS.map(c => (
                    <tr key={c.id} className={c.status === 'excluded' ? 'row-excluded' : 'row-eligible'}>
                      <td>
                        <div style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.02em', color: '#0f172a' }}>{c.id}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: '2px' }}>{c.court}</div>
                      </td>
                      <td>{c.date}</td>
                      <td className="align-right">{fmt(c.amount)}</td>
                      <td className="align-right" style={{ fontWeight: 600, color: c.status === 'eligible' ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                        {fmt(c.remaining)}
                      </td>
                      <td>
                        {c.refundPending ? (
                          <span className="badge badge-error">
                            <AlertCircle size={10} /> Pending at {c.refundLevel}
                          </span>
                        ) : (
                          <span className="badge badge-success">No Refund Pending</span>
                        )}
                      </td>
                      <td>
                        {c.status === 'eligible' ? (
                          <span className="dlmc-status-badge eligible"><Check size={12} /> Proposed for Lapse</span>
                        ) : (
                          <span className="dlmc-status-badge excluded"><XCircle size={12} /> Excluded from Lapse</span>
                        )}
                      </td>
                      <td style={{ fontSize: '12px', color: c.status === 'excluded' ? 'var(--color-error)' : 'var(--color-text-secondary)' }}>
                        {c.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="exclusions-summary-footer">
              <div className="summary-left">
                <strong>Refund Safety Engine Status:</strong> <span className="badge badge-success">ACTIVE & SECURED</span>
              </div>
              <div className="summary-right">
                Total Excluded Citizen Funds Secured: <strong>{fmt(320000)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB CONTENT: AGMP VLC INTEGRATION ─── */}
      {activeTab === 'vlc' && (
        <div className="dlmc-section animate-fade-in">
          <div className="dlmc-section-header">
            <div className="dlmc-section-icon"><Database size={18} /></div>
            <h2>AGMP VLC Integration File Compiler</h2>
            <div className="dlmc-section-header-actions">
              {billStatus === 'approved' && (
                <button className="btn btn-secondary">
                  <Download size={14} /> Download TXT File
                </button>
              )}
            </div>
          </div>
          <div className="dlmc-section-body">
            <p>
              Once a court lapse bill is approved by the DDO, the system automatically tags the transaction and creates a structured integration **TXT file** mapped to Accountant General Madhya Pradesh (AGMP) specifications. AGMP VLC consumes this to automatically close matching entries.
            </p>

            {billStatus === 'approved' ? (
              <div className="vlc-file-viewer animate-scale-in">
                <div className="vlc-file-header">
                  <div className="header-filename">
                    <FileText size={16} /> <strong>AGMP_LAPSE_CCD_EXPORT_FY2025-26.txt</strong>
                  </div>
                  <div className="header-status">
                    File Status: {vlcSynced ? <span className="badge badge-success">Sync Confirmed</span> : <span className="badge badge-warning">Awaiting VLC Sync</span>}
                  </div>
                </div>
                <pre className="vlc-file-content">{vlcFileContent}</pre>
                
                <div className="vlc-sync-console-callout">
                  <Database size={18} />
                  <div className="callout-inner">
                    <h4>VLC Automation Benefit</h4>
                    <p>This file is pushed via automated WebService integrations directly to the VLC intake engine. AG Madhya Pradesh can consume it to instantly update the ledger without manual clerk processing.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="vlc-locked-state centered">
                <ShieldAlert size={48} className="text-secondary" />
                <h3>AGMP VLC Export File Locked</h3>
                <p>The VLC integration file will be automatically generated and compiled only after the DDO Approver has **approved** the Court Lapse Bill.</p>
                <p className="sim-hint">💡 Complete the workflow steps in the first tab to unlock this integration file.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB CONTENT: NOTIFICATIONS ─── */}
      {activeTab === 'notifications' && (
        <div className="dlmc-section animate-fade-in">
          <div className="dlmc-section-header">
            <div className="dlmc-section-icon"><Bell size={18} /></div>
            <h2>System Alerts & Notifications Logs</h2>
          </div>
          <div className="dlmc-section-body">
            <div className="dlmc-notification-list">
              {/* Notification 1: Mar 31 */}
              <div className="dlmc-notification-item unread">
                <div className="notif-icon"><Bell size={16} /></div>
                <div className="notif-content">
                  <div className="notif-header">
                    <h4>Auto-Lapse Claim Proposed</h4>
                    <span className="notif-time">31 March (System)</span>
                  </div>
                  <p>A new claim CLM-LP-2026-041 for auto-lapse of eligible court challan balances has been presented for CCD-COURT-2701. Total proposed: {fmt(totalEligibleAmount)}. Please process before 15th April.</p>
                </div>
              </div>

              {/* Notification 2: April 10 Warning */}
              {(systemDate === '10-apr' || systemDate === '16-apr') && !isLapsedBefore15 && (
                <div className="dlmc-notification-item unread warning">
                  <div className="notif-icon"><AlertTriangle size={16} /></div>
                  <div className="notif-content">
                    <div className="notif-header">
                      <h4>Lapse Deadline Approaching - CCD Suspension Warning</h4>
                      <span className="notif-time">10 April (System)</span>
                    </div>
                    <p>WARNING: Lapse process for CCD-COURT-2701 is pending. If not approved by 15th April, payment bills from this account will be automatically blocked by the system.</p>
                  </div>
                </div>
              )}

              {/* Notification 3: April 16 Blockage */}
              {systemDate === '16-apr' && !isLapsedBefore15 && (
                <div className="dlmc-notification-item unread error">
                  <div className="notif-icon"><AlertCircle size={16} /></div>
                  <div className="notif-content">
                    <div className="notif-header">
                      <h4>🚨 CCD Account Suspended - Payments Disabled</h4>
                      <span className="notif-time">16 April (System)</span>
                    </div>
                    <p>CRITICAL: Lapse deadline has passed. CCD-COURT-2701 has been locked and suspended. Notification dispatched to AGMP regarding pending lapse process.</p>
                  </div>
                </div>
              )}

              {/* Notification 4: Approved */}
              {billStatus === 'approved' && (
                <div className="dlmc-notification-item success">
                  <div className="notif-icon"><CheckCircle2 size={16} /></div>
                  <div className="notif-content">
                    <div className="notif-header">
                      <h4>Lapse Process Settled - Voucher Generated</h4>
                      <span className="notif-time">Date of Approval</span>
                    </div>
                    <p>SUCCESS: Lapse bill approved for CCD-COURT-2701. Voucher VCH-LP-0075-8819 generated successfully. Credit posted to HoA 0075. CCD account active.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB CONTENT: AUDIT TRAIL ─── */}
      {activeTab === 'audit' && (
        <div className="dlmc-section animate-fade-in">
          <div className="dlmc-section-header">
            <div className="dlmc-section-icon"><Shield size={18} /></div>
            <h2>System Audit Trail & Logging (VLC + CCD)</h2>
          </div>
          <div className="dlmc-section-body">
            <div className="dlmc-audit-timeline">
              {auditTrail.map((log, index) => (
                <div key={index} className={`dlmc-audit-item ${log.type}`}>
                  <div className="dlmc-audit-dot" />
                  <div className="dlmc-audit-title">{log.action}</div>
                  <div className="dlmc-audit-meta">By {log.user} • {log.time}</div>
                  <div className="dlmc-audit-detail">{log.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── SIMULATOR DEADLINE SUSPENSION DRAWER ─── */}
      {showPaymentMockDrawer && (
        <div className="payment-demo-drawer-overlay animate-fade-in" onClick={() => setShowPaymentMockDrawer(false)}>
          <div className="payment-demo-drawer animate-slide-right" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <Building size={20} />
              <h3>CCD Account Payment Operation Tester</h3>
              <button className="close-btn" onClick={() => setShowPaymentMockDrawer(false)}>✕</button>
            </div>
            
            <div className="drawer-body">
              <p className="drawer-desc">
                Simulate generating a payment bill or advice from CCD-COURT-2701 to verify if system blockades are enforced when the lapse deadline passes.
              </p>

              <form onSubmit={handleTestPayment} className="drawer-form">
                <div className="form-group">
                  <label className="form-label">Debit Account Number</label>
                  <input type="text" className="form-input" value="CCD-COURT-2701 (Civil Court Neemuch)" disabled />
                </div>
                
                <div className="form-group" style={{ marginTop: 'var(--space-3)' }}>
                  <label className="form-label">Payment Amount (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={mockPaymentAmount}
                    onChange={e => setMockPaymentAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginTop: 'var(--space-3)' }}>
                  <label className="form-label">Beneficiary Name</label>
                  <input type="text" className="form-input" value="Shri Ram Prasad Sharma" disabled />
                </div>

                <button type="submit" className="btn btn-primary w-full" style={{ marginTop: 'var(--space-5)', width: '100%' }}>
                  Process Payment Advice
                </button>
              </form>

              {paymentFeedback.status && (
                <div className={`payment-feedback-box ${paymentFeedback.status} animate-scale-in`}>
                  {paymentFeedback.status === 'blocked' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                  <p>{paymentFeedback.msg}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
