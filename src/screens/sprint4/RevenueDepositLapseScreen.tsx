import React, { useState, useEffect } from 'react';
import {
  Settings, Cpu, FileText, CheckCircle, AlertTriangle, ShieldCheck,
  RefreshCw, Loader2, ArrowRight, ShieldAlert, Download, Search,
  Database, User, Calendar, Ban, FileCheck, Layers, HelpCircle
} from 'lucide-react';
import './RevenueDepositLapseScreen.css';

// ─── TYPES & INTERFACES ───
type SystemRole = 'admin' | 'creator' | 'approver';
type SystemDate = '15-mar' | '31-mar' | '05-apr';
type ActiveTab = 'workflow' | 'ledger';
type VoucherStatusType = 'Posted' | 'Failed';

interface DepositChallan {
  id: string;
  amount: number;
  balance: number;
  date: string;
  status: 'Active' | 'Lapsed';
  lapsePeriodYears?: number;
  lapseDueDate?: string;
  eligible?: boolean;
}

interface AuditLogEntry {
  action: string;
  detail: string;
  user: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

// ─── INITIAL MOCK DATA ───
const INITIAL_CHALLANS: DepositChallan[] = [
  { id: '270/0241088/8443/00-103/23/00882', amount: 500000, balance: 450000, date: '2023-05-14', status: 'Active' },
  { id: '270/0241088/8443/00-103/23/00904', amount: 300000, balance: 150000, date: '2023-06-22', status: 'Active' },
  { id: '270/0241088/8443/00-103/23/00301', amount: 100000, balance: 90000, date: '2023-12-18', status: 'Active' },
  { id: '270/0241088/8443/00-103/24/00450', amount: 250000, balance: 250000, date: '2024-08-10', status: 'Active' },
  { id: '270/0241088/8443/00-103/25/00112', amount: 5000, balance: 5000, date: '2025-11-05', status: 'Active' }
];

const INITIAL_AUDIT: AuditLogEntry[] = [
  { action: 'System Date Initialized', detail: 'Revenue Deposit module is online for FY 2025-26 under Head 8443-00-103', user: 'System', time: '15 Mar 2026, 09:00', type: 'info' },
  { action: 'Configuration Active', detail: 'Default lapse rules applied: Threshold ₹10k, Limit <= 10k: 1 Year, > 10k: 3 Years.', user: 'System-Admin', time: '15 Mar 2026, 09:05', type: 'info' }
];

export default function RevenueDepositLapseScreen() {
  // --- Simulators State ---
  const [role, setRole] = useState<SystemRole>('admin');
  const [systemDate, setSystemDate] = useState<SystemDate>('15-mar');
  const [activeTab, setActiveTab] = useState<ActiveTab>('workflow');

  // --- Configuration Constants (SR334 Rules) ---
  const amountThreshold = 10000;
  const periodUnder = 1;
  const periodOver = 3;

  // --- Challans State & Rule Derivation ---
  const [challans, setChallans] = useState<DepositChallan[]>(INITIAL_CHALLANS);

  // --- Claim & Bill Workflow States (Screen 3) ---
  const [claimGenerated, setClaimGenerated] = useState<boolean>(false);
  const [billCreated, setBillCreated] = useState<boolean>(false);
  const [creatorRemarks, setCreatorRemarks] = useState<string>('');
  const [billSubmitted, setBillSubmitted] = useState<boolean>(false);
  const [approverNotes, setApproverNotes] = useState<string>('');
  const [billApproved, setBillApproved] = useState<boolean>(false);
  const [sanctionOrderNo, setSanctionOrderNo] = useState<string>('');
  const [voucherNo, setVoucherNo] = useState<string>('');
  const [voucherStatus, setVoucherStatus] = useState<VoucherStatusType>('Posted');
  const [selectedChallanIds, setSelectedChallanIds] = useState<string[]>([]);
  const [activeWorkflowSubView, setActiveWorkflowSubView] = useState<'bill' | 'voucher'>('bill');

  // --- Audit Trail ---
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT);

  // --- Integrations / Security Watchdog states ---
  const [valChallanId, setValChallanId] = useState<string>('');
  const [validationResult, setValidationResult] = useState<{ status: 'blocked' | 'active' | 'none'; msg: string }>({ status: 'none', msg: 'Enter a challan reference ID to validate payment capability.' });
  const [isAgmpSyncing, setIsAgmpSyncing] = useState<boolean>(false);
  const [isAgmpSynced, setIsAgmpSynced] = useState<boolean>(false);

  const addAudit = (action: string, detail: string, user: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const time = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' (Simulated)';
    setAuditLogs(prev => [{ action, detail, user, time, type }, ...prev]);
  };

  // --- Calculation: Apply rules to determine lapse period, date, and eligibility ---
  const calculateLapseRules = (list: DepositChallan[], threshold: number, underYears: number, overYears: number) => {
    return list.map(ch => {
      // Determine lapse period in years
      const years = ch.amount <= threshold ? underYears : overYears;

      // Calculate lapse due date: lapses on March 31st of (Deposit Year + Lapse Years)
      const depDate = new Date(ch.date);
      const dueYear = depDate.getFullYear() + years;
      const formattedDueDate = `${dueYear}-03-31`;

      // Eligible if: Active AND Current System Date (represented by simulator date) >= Lapse Due Date
      // Simulator Date mapping:
      // '15-mar' -> 2026-03-15
      // '31-mar' -> 2026-03-31
      // '05-apr' -> 2026-04-05
      let simDateStr = '2026-03-15';
      if (systemDate === '31-mar') simDateStr = '2026-03-31';
      else if (systemDate === '05-apr') simDateStr = '2026-04-05';

      const simTime = new Date(simDateStr).getTime();
      const dueTime = new Date(formattedDueDate).getTime();
      const eligible = ch.status === 'Active' && simTime >= dueTime;

      return {
        ...ch,
        lapsePeriodYears: years,
        lapseDueDate: formattedDueDate,
        eligible: eligible
      };
    });
  };

  // Run calculation when parameters or date changes
  const computedChallans = React.useMemo(() => {
    return calculateLapseRules(challans, amountThreshold, periodUnder, periodOver);
  }, [challans, systemDate]);

  const eligibleChallans = React.useMemo(() => {
    return computedChallans.filter(ch => ch.eligible);
  }, [computedChallans]);

  const totalEligibleAmount = React.useMemo(() => {
    return eligibleChallans.reduce((sum, ch) => sum + ch.balance, 0);
  }, [eligibleChallans]);

  const selectedChallans = React.useMemo(() => {
    return computedChallans.filter(ch => selectedChallanIds.includes(ch.id));
  }, [computedChallans, selectedChallanIds]);

  const totalSelectedAmount = React.useMemo(() => {
    return selectedChallans.reduce((sum, ch) => sum + (ch.status === 'Lapsed' ? ch.amount : ch.balance), 0);
  }, [selectedChallans]);

  // Auto-select eligible challans when they change
  useEffect(() => {
    if (eligibleChallans.length > 0 && !billCreated && !billSubmitted && !billApproved) {
      setSelectedChallanIds(eligibleChallans.map(ch => ch.id));
    }
  }, [eligibleChallans, billCreated, billSubmitted, billApproved]);

  const getAgmpExportText = () => {
    const listText = selectedChallans.map(c => `${c.id.padEnd(35, ' ')} | ${fmt(c.status === 'Lapsed' ? c.amount : c.balance)}`).join('\n');
    return `AGMP_VLC_LAPSE_REVENUE_EXPORT_FY2025-26
------------------------------------------------------
EXPORT_DATE: 2026-03-31
MAJOR_HEAD: 8443-00-103-0000
VOUCHER_NO: ${voucherNo || 'VCH-LP-0075-PENDING'}
CREDIT_HOA: 0075-00-106-0000
------------------------------------------------------
CHALLAN_ID                          | LAPSED_AMOUNT
${listText || 'No challans selected'}
------------------------------------------------------
TOTAL_LAPSED: ₹${billApproved ? totalSelectedAmount.toLocaleString('en-IN') : '0.00'}`;
  };

  // --- Action Handlers ---

  // System Date Change Simulator logic
  useEffect(() => {
    if (systemDate === '15-mar') {
      // Reset processing states
      setClaimGenerated(false);
      setBillCreated(false);
      setBillSubmitted(false);
      setBillApproved(false);
      setIsAgmpSynced(false);
      setSelectedChallanIds([]);
      setChallans(INITIAL_CHALLANS);
      setActiveWorkflowSubView('bill');
    } else {
      // 31-mar or 05-apr
      setClaimGenerated(true);
      if (systemDate === '31-mar') {
        addAudit('System Date Shifted', 'System calendar set to 31st March (FY Closing). Lapse claims automatically generated.', 'System', 'warning');
      } else if (systemDate === '05-apr') {
        addAudit('System Date Shifted', 'System calendar set to 05th April (Post-Closing Verification).', 'System', 'info');
      }
    }
  }, [systemDate]);

  // Creator Generate Bill
  const handleGenerateBill = () => {
    setBillCreated(true);
    addAudit(
      'Lapse Bill Created',
      `Treasury Creator drafted bill against claim CLM-LP-2026-041. By-transfer to HoA 0075 mapped.`,
      'Treasury-Creator',
      'info'
    );
  };

  // Creator Submit Bill
  const handleSubmitBill = () => {
    setBillSubmitted(true);
    addAudit(
      'Bill Forwarded to Approver',
      `Lapse bill submitted for authorization. Remarks: "${creatorRemarks || 'Lapsed unclaimed deposits under SR334.'}"`,
      'Treasury-Creator',
      'info'
    );
  };

  // Approver authorize
  const handleApproveBill = () => {
    setBillApproved(true);
    setActiveWorkflowSubView('voucher');
    const generatedSO = `SO-RD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedVCH = `VCH-LP-0075-${Math.floor(10000 + Math.random() * 90000)}`;
    setSanctionOrderNo(generatedSO);
    setVoucherNo(generatedVCH);
    setVoucherStatus('Posted');

    // Reduce selected challan balances to zero and mark as Lapsed in state
    setChallans(prev =>
      prev.map(ch => {
        if (selectedChallanIds.includes(ch.id)) {
          return {
            ...ch,
            status: 'Lapsed',
            balance: 0
          };
        }
        return ch;
      })
    );

    addAudit(
      'Lapse Bill Approved',
      `Treasury Approver signed Sanction Order ${generatedSO}. Voucher ${generatedVCH} posted.`,
      'Treasury-Approver',
      'success'
    );
    addAudit(
      'Balances Reduced to Zero',
      `Lapsed challan balances updated to ₹0.00. Payment block codes activated.`,
      'System-Ledger',
      'success'
    );
  };

  // AGMP VLC Sync
  const handleAgmpSync = () => {
    setIsAgmpSyncing(true);
    setTimeout(() => {
      setIsAgmpSyncing(false);
      setIsAgmpSynced(true);
      addAudit(
        'AGMP Sync Complete',
        `Transmitted Lapsed Deposit records to AGMP VLC Server. Plus-Minus Memo adjusted in expenditure ledger.`,
        'AGMP-Integration',
        'success'
      );
    }, 1200);
  };

  // Validation Test Tool
  const handleValidateChallan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valChallanId) {
      setValidationResult({ status: 'none', msg: 'Enter a challan reference ID to validate payment capability.' });
      return;
    }

    // Find in current state
    const match = challans.find(c => c.id === valChallanId);
    if (!match) {
      setValidationResult({ status: 'none', msg: 'Challan ID not found in database registry. Please check reference formatting.' });
      return;
    }

    if (match.status === 'Lapsed') {
      setValidationResult({
        status: 'blocked',
        msg: `🚨 PAYMENT BLOCKED! Challan has been LAPSED on 31st March 2026 in accordance with SR334. Voucher Ref: ${voucherNo || 'VCH-LP-0075-8109'}. Balance is ₹0.00. Payment is strictly disabled in treasury.`
      });
    } else {
      setValidationResult({
        status: 'active',
        msg: `✅ CHALLAN ACTIVE. Balance of ₹${match.balance.toLocaleString('en-IN')} is fully operational. Payment advises can be cleared.`
      });
    }
  };

  // Format Currencies
  const fmt = (val: number) => '₹ ' + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="rdlm-screen">

      {/* ─── SYSTEM SIMULATOR BAR ─── */}
      <section className="rdlm-simulator-bar">

        {/* Simulator Date Selection */}
        <div className="rdlm-sim-section">
          <div className="rdlm-sim-label">
            <Calendar size={14} /> <span>Interactive System Date Simulator:</span>
          </div>
          <div className="rdlm-sim-buttons">
            <button
              className={`rdlm-sim-btn ${systemDate === '15-mar' ? 'active green' : ''}`}
              onClick={() => { setSystemDate('15-mar'); setActiveTab('workflow'); }}
            >
              15th March 2026
              <span className="sim-sub">Pre-Lapse Day</span>
            </button>
            <button
              className={`rdlm-sim-btn ${systemDate === '31-mar' ? 'active red' : ''}`}
              onClick={() => { setSystemDate('31-mar'); setActiveTab('workflow'); }}
            >
              31st March 2026
              <span className="sim-sub">Lapse Day (Auto-Claims)</span>
            </button>
            <button
              className={`rdlm-sim-btn ${systemDate === '05-apr' ? 'active red' : ''}`}
              onClick={() => { setSystemDate('05-apr'); }}
              disabled={!billApproved && systemDate === '15-mar'}
            >
              05th April 2026
              <span className="sim-sub">Post-Closing Verification</span>
            </button>
          </div>
        </div>

        {/* Simulator Role Selection */}
        <div className="rdlm-sim-section">
          <div className="rdlm-sim-label">
            <User size={14} /> <span>Simulate Security Role / Persona:</span>
          </div>
          <div className="rdlm-sim-buttons">
            <button
              className={`rdlm-sim-btn ${role === 'admin' ? 'active-role admin' : ''}`}
              onClick={() => setRole('admin')}
            >
              System Admin
              <span className="sim-sub">Rule Config Access</span>
            </button>
            <button
              className={`rdlm-sim-btn ${role === 'creator' ? 'active-role creator' : ''}`}
              onClick={() => setRole('creator')}
            >
              Treasury Creator
              <span className="sim-sub">Bill Generation</span>
            </button>
            <button
              className={`rdlm-sim-btn ${role === 'approver' ? 'active-role approver' : ''}`}
              onClick={() => setRole('approver')}
            >
              Treasury Approver
              <span className="sim-sub">Sanction & Posting</span>
            </button>
          </div>
        </div>

      </section>

      {/* ─── SYSTEM STATUS/WARNING BANNERS ─── */}
      {systemDate === '15-mar' && (
        <div className="rdlm-watchdog-banner warning animate-fade-in-down">
          <AlertTriangle size={20} className="shake-anim" />
          <div className="banner-content">
            <h4>Lapse Claims Auto-generated on 31st March</h4>
            <p>
              The system is currently running pre-closing checks. Unclaimed Revenue Deposits in HoA <strong>8443-00-103</strong> will be automatically presented as lapse claims on 31st March.
            </p>
          </div>
          <span className="banner-days" style={{ background: '#FFF9E6', color: '#B25E00' }}>16 Days Remaining</span>
        </div>
      )}

      {systemDate === '31-mar' && !billApproved && (
        <div className="rdlm-watchdog-banner warning animate-fade-in-down" style={{ borderColor: 'var(--color-primary)' }}>
          <Cpu size={20} className="shake-anim" style={{ color: 'var(--color-primary)' }} />
          <div className="banner-content" style={{ color: 'var(--color-primary-dark)' }}>
            <h4>Lapse Claims Auto-Generated</h4>
            <p>
              It is 31st March (FY Closing). The system has automatically identified eligible unclaimed deposits for lapse under SR334. Draft the lapse bill below.
            </p>
          </div>
          <span className="banner-days" style={{ background: 'var(--color-primary-lighter)', color: 'var(--color-primary)' }}>Batch Day</span>
        </div>
      )}

      {billApproved && (
        <div className="rdlm-watchdog-banner success animate-fade-in-down">
          <CheckCircle size={20} />
          <div className="banner-content">
            <h4>Lapse Process Completed Successfully (FY 2025-26)</h4>
            <p>
              Unclaimed Revenue Deposits totalling <strong>{fmt(totalSelectedAmount)}</strong> have been debited from 8443-00-103 and credited by-transfer to <strong>HoA 0075</strong> via Voucher <strong>{voucherNo}</strong>. Balances reduced to zero.
            </p>
          </div>
          <span className="banner-days" style={{ background: '#E6FAF0', color: '#047857' }}>Completed</span>
        </div>
      )}

      {/* ─── HEADER AREA ─── */}
      <header className="rdlm-header">
        <div className="rdlm-header-title">
          <span className="badge-sprint">Sprint 4 Story 1</span>
          <h1>Revenue Deposit Lapse Management</h1>
          <p>
            Automated scanning and by-transfer processing of lapse balances in <strong>HoA 8443-00-103</strong> (Revenue Deposits) to <strong>HoA 0075</strong> (Miscellaneous Revenue) on 31st March under SR334 of MPTC 2020.
          </p>
        </div>
        <div className="rdlm-header-badges">
          <span className="rdlm-header-badge"><Layers size={12} /> Revenue Deposits (8443-00-103)</span>
          <span className="rdlm-header-badge"><FileCheck size={12} /> SR334 of MPTC 2020</span>
          <span className="rdlm-header-badge"><Calendar size={12} /> FY 2025-26</span>
        </div>
      </header>

      {/* ─── STATS GRID ─── */}
      <section className="rdlm-stats-grid">
        <div className="rdlm-stat-card primary">
          <div className="rdlm-stat-icon primary"><Database size={20} /></div>
          <div className="rdlm-stat-info">
            <span className="rdlm-stat-value">{fmt(challans.reduce((sum, ch) => sum + (ch.status === 'Lapsed' ? 0 : ch.balance), 0))}</span>
            <span className="rdlm-stat-label">Active Revenue Deposits</span>
          </div>
        </div>
        <div className="rdlm-stat-card warning">
          <div className="rdlm-stat-icon warning"><AlertTriangle size={20} /></div>
          <div className="rdlm-stat-info">
            <span className="rdlm-stat-value">{fmt(totalEligibleAmount)}</span>
            <span className="rdlm-stat-label">Eligible for Lapse</span>
          </div>
        </div>
        <div className="rdlm-stat-card success">
          <div className="rdlm-stat-icon success"><FileCheck size={20} /></div>
          <div className="rdlm-stat-info">
            <span className="rdlm-stat-value">
              {systemDate === '15-mar' ? 'Awaiting Lapse Day' : billApproved ? 'Lapsed' : 'Claim Generated'}
            </span>
            <span className="rdlm-stat-label">Current Stage Status</span>
          </div>
        </div>
        <div className="rdlm-stat-card accent">
          <div className="rdlm-stat-icon accent"><Settings size={20} /></div>
          <div className="rdlm-stat-info">
            <span className="rdlm-stat-value">₹ {amountThreshold.toLocaleString('en-IN')}</span>
            <span className="rdlm-stat-label">Amount Threshold Rule</span>
          </div>
        </div>
      </section>

      {/* ─── TABS NAVIGATION ─── */}
      <nav className="rdlm-tabs">
        <button
          className={`rdlm-tab ${activeTab === 'workflow' ? 'active' : ''}`}
          onClick={() => setActiveTab('workflow')}
        >
          <FileCheck size={16} /> Screen 1: Claim & Voucher Generation
          {claimGenerated && !billApproved && (
            <span className="rdlm-tab-count" style={{ background: '#4F46E5', color: '#FFF' }}>!</span>
          )}
        </button>
        <button
          className={`rdlm-tab ${activeTab === 'ledger' ? 'active' : ''}`}
          onClick={() => setActiveTab('ledger')}
        >
          <Database size={16} /> Screen 2: Deposit Status & Audit
        </button>
      </nav>

      {/* ─── TAB 1: CLAIM & VOUCHER GENERATION (WORKFLOW) ─── */}
      {activeTab === 'workflow' && (
        <div className="rdlm-section animate-scale-in">
          <div className="rdlm-section-header">
            <div className="rdlm-section-icon"><FileCheck size={18} /></div>
            <h2>Lapse of Revenue Deposit Challan </h2>
            <div style={{ marginLeft: 'auto' }}>
              <span className="current-user-pill">Actor Role: <strong>{role.toUpperCase()}</strong></span>
            </div>
          </div>
          <div className="rdlm-section-body">

            {/* Workflow Timeline Stepper */}
            <div className="rdlm-stepper">
              <div className={`rdlm-step-node ${claimGenerated ? 'done' : 'active'}`}>
                <div className="rdlm-step-circle">1</div>
                <span>Scheduler Claim Proposed</span>
              </div>
              <div className={`rdlm-step-line ${billCreated ? 'done' : ''}`} />

              <div className={`rdlm-step-node ${billCreated ? (billSubmitted ? 'done' : 'active') : ''}`}>
                <div className="rdlm-step-circle">2</div>
                <span>Bill Drafted (Creator)</span>
              </div>
              <div className={`rdlm-step-line ${billSubmitted ? 'done' : ''}`} />

              <div className={`rdlm-step-node ${billSubmitted ? (billApproved ? 'done' : 'active') : ''}`}>
                <div className="rdlm-step-circle">3</div>
                <span>Verifier check / Approval</span>
              </div>
              <div className={`rdlm-step-line ${billApproved ? 'done' : ''}`} />

              <div className={`rdlm-step-node ${billApproved ? 'done' : ''}`}>
                <div className="rdlm-step-circle">4</div>
                <span>0075 Voucher Posted</span>
              </div>
            </div>

            {/* Workflow processing states */}
            {!claimGenerated ? (
              <div className="workflow-action-box centered">
                <Ban size={40} style={{ color: 'var(--color-text-tertiary)' }} />
                <h4>No Lapsed Claims Available</h4>
                <p>Lapse claims are automatically generated by the system on 31st March (Lapse Day).</p>
              </div>
            ) : (
              <div>
                {(!billApproved || activeWorkflowSubView === 'bill') ? (
                  <>
                    {role === 'admin' && (
                      <div className="alert-box info" style={{ margin: 0 }}>
                        <HelpCircle size={16} />
                        <span>
                          Claim proposed by system. Switch role to <strong>Treasury Creator</strong> or <strong>Treasury Approver</strong> to proceed with workflow.
                        </span>
                      </div>
                    )}

                    {role === 'creator' && (
                      <>
                        {!billCreated ? (
                          <div className="proposed-claim-view animate-fade-in">
                            <div className="claim-meta-header">
                              <div className="claim-title-group">
                                <h3>System Proposed Claim: <span className="text-highlight">CLM-LP-2026-041</span></h3>
                                <div className="claim-sub-info">
                                  <strong>Revenue Deposit HoA:</strong> 8443-00-103
                                </div>
                              </div>
                              <div className="claim-summary-badges">
                                <span className="badge-selected-challans">
                                  Selected Challans: {selectedChallanIds.length} Selected / {eligibleChallans.length} Proposed
                                </span>
                                <span className="total-balances-indicator">
                                  Total Balances: <strong>{fmt(totalSelectedAmount)}</strong>
                                </span>
                              </div>
                            </div>

                            <div className="breakdown-card">
                              <div className="breakdown-card-header">
                                PROPOSED CHALLANS BREAKDOWN (IDENTIFIED FOR LAPSE)
                              </div>
                              <div className="breakdown-table-wrapper">
                                <table className="breakdown-table">
                                  <thead>
                                    <tr>
                                      <th>CHALLAN NUMBER</th>
                                      <th>CHALLAN DEPOSIT DATE</th>
                                      <th className="align-right">CHALLAN AMOUNT</th>
                                      <th className="align-right">CHALLAN LAPSE AMOUNT</th>
                                      <th>STATUS</th>
                                      <th>LAPSE PERIOD</th>
                                      <th>LAPSE DUE DATE</th>
                                      <th className="align-center">INCLUDE?</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {eligibleChallans.map((ch) => {
                                      const isChecked = selectedChallanIds.includes(ch.id);
                                      return (
                                        <tr key={ch.id} className={isChecked ? 'row-selected' : ''}>
                                          <td className="code-font">{ch.id}</td>
                                          <td>{ch.date}</td>
                                          <td className="align-right">{fmt(ch.amount)}</td>
                                          <td className="align-right lapse-balance-cell">{fmt(ch.balance)}</td>
                                          <td>
                                            <span className={`badge ${ch.status === 'Active' ? 'badge-primary' : 'badge-success'}`}>
                                              {ch.status}
                                            </span>
                                          </td>
                                          <td className="align-center">{ch.lapsePeriodYears} Yr{ch.lapsePeriodYears! > 1 ? 's' : ''}</td>
                                          <td className="code-font">{ch.lapseDueDate}</td>
                                          <td className="align-center">
                                            <input
                                              type="checkbox"
                                              className="claim-checkbox"
                                              checked={isChecked}
                                              onChange={() => {
                                                if (isChecked) {
                                                  setSelectedChallanIds(prev => prev.filter(id => id !== ch.id));
                                                } else {
                                                  setSelectedChallanIds(prev => [...prev, ch.id]);
                                                }
                                              }}
                                            />
                                          </td>
                                        </tr>
                                      );
                                    })}
                                    {eligibleChallans.length === 0 && (
                                      <tr>
                                        <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--color-text-tertiary)' }}>
                                          No eligible challans found for lapse processing.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            <div className="action-row-right">
                              <button
                                className="btn-create-lapse-bill"
                                onClick={handleGenerateBill}
                                disabled={selectedChallanIds.length === 0}
                              >
                                <FileText size={16} />
                                <span>Create Lapse Bill</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {billSubmitted ? (
                              <div className="document-frame animate-scale-in">
                                <div className="document-header">
                                  <div className="document-title">
                                    <strong>BILL of lapse revenue deposit challan</strong>
                                  </div>
                                  <div className="document-ref">
                                    <span className="document-ref-badge" style={{ background: billApproved ? '#D1FAE5' : '#CFE2FF', color: billApproved ? '#065F46' : '#084298' }}>
                                      {billApproved ? 'Status: Approved & Posted' : 'Status: Submitted'}
                                    </span><br />
                                    Ref: DRAFT-LP-2026-041
                                  </div>
                                </div>

                                <div className="document-grid">
                                  <div className="document-grid-item">
                                    <span>Debit HoA</span>
                                    <strong>8443-00-103</strong>
                                  </div>
                                  <div className="document-grid-item">
                                    <span>Credit HoA</span>
                                    <strong style={{ color: 'var(--color-primary)' }}>0075-00-106-0000</strong>
                                  </div>
                                  <div className="document-grid-item">
                                    <span>Total Lapse Amount of Identified challans </span>
                                    <strong style={{ color: 'var(--color-error)', fontSize: '14px' }}>{fmt(totalSelectedAmount)}</strong>
                                  </div>
                                </div>

                                <div style={{ marginTop: 'var(--space-4)', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-md)', overflow: 'hidden', width: '100%' }}>
                                  <div style={{ background: '#F1F5F9', padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#334155', borderBottom: '1px solid #CBD5E1' }}>
                                    DETAILS OF LAPSED CHALLANS ENCLOSED ({selectedChallanIds.length} ITEMS)
                                  </div>
                                  <div className="rdlm-table-wrapper" style={{ border: 'none', borderRadius: 0, maxHeight: '200px', overflowY: 'auto' }}>
                                    <table className="rdlm-table" style={{ fontSize: '11px' }}>
                                      <thead>
                                        <tr>
                                          <th>CHALLAN NUMBER</th>
                                          <th>CHALLAN DEPOSIT DATE</th>
                                          <th className="align-right">CHALLAN AMOUNT</th>
                                          <th className="align-right">CHALLAN LAPSE AMOUNT</th>
                                          <th>STATUS</th>
                                          <th>LAPSE PERIOD</th>
                                          <th>LAPSE DUE DATE</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {selectedChallans.map(c => (
                                          <tr key={c.id}>
                                            <td className="code-font">{c.id}</td>
                                            <td>{c.date}</td>
                                            <td className="align-right">{fmt(c.amount)}</td>
                                            <td className="align-right" style={{ color: 'var(--color-error)', fontWeight: 600 }}>{fmt(c.balance)}</td>
                                            <td>
                                              <span className={`badge ${c.status === 'Active' ? 'badge-primary' : 'badge-success'}`}>
                                                {c.status}
                                              </span>
                                            </td>
                                            <td className="align-center">{c.lapsePeriodYears} Yr{c.lapsePeriodYears! > 1 ? 's' : ''}</td>
                                            <td className="code-font">{c.lapseDueDate}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                                <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                                  <label className="form-label">Treasury Creator Remarks</label>
                                  <div className="read-only-remarks" style={{ background: '#F8FAFC', padding: '10px', borderRadius: '4px', border: '1px solid #E2E8F0', fontSize: '12px', fontWeight: 600 }}>
                                    {creatorRemarks || 'Lapsed unclaimed deposits under SR334.'}
                                  </div>
                                </div>

                                {billApproved ? (
                                  <div className="alert-box success" style={{ marginTop: 'var(--space-4)', marginInline: 0 }}>
                                    <CheckCircle size={16} />
                                    <span>
                                      This bill has been approved and Voucher <strong>{voucherNo}</strong> has been generated.
                                      <button 
                                        className="btn btn-secondary btn-sm" 
                                        onClick={() => setActiveWorkflowSubView('voucher')} 
                                        style={{ marginLeft: '12px', padding: '2px 8px', fontSize: '11px', background: 'white', border: '1px solid var(--color-success)' }}
                                      >
                                        View Voucher
                                      </button>
                                    </span>
                                  </div>
                                ) : (
                                  <div className="alert-box info" style={{ margin: 0, marginTop: 'var(--space-4)' }}>
                                    <HelpCircle size={16} />
                                    <span>
                                      Lapse bill submitted and awaiting Approver authorization. Switch role to <strong>Treasury Approver</strong> to authorize.
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="document-frame animate-scale-in">
                                <div className="document-header">
                                  <div className="document-title">

                                    <strong>BILL of lapse revenue deposit challan</strong>
                                  </div>
                                  <div className="document-ref">
                                    <span className="document-ref-badge">Status: Draft Bill</span><br />
                                    Ref: DRAFT-LP-2026-041
                                  </div>
                                </div>

                                <div className="document-grid">
                                  <div className="document-grid-item">
                                    <span>Debit HoA</span>
                                    <strong>8443-00-103</strong>
                                  </div>
                                  <div className="document-grid-item">
                                    <span>Credit HoA</span>
                                    <strong style={{ color: 'var(--color-primary)' }}>0075-00-106-0000</strong>
                                  </div>
                                  <div className="document-grid-item">
                                    <span>Total Lapse Amount of Identified challans </span>
                                    <strong style={{ color: 'var(--color-error)', fontSize: '14px' }}>{fmt(totalSelectedAmount)}</strong>
                                  </div>
                                </div>

                                <div style={{ marginTop: 'var(--space-4)', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-md)', overflow: 'hidden', width: '100%' }}>
                                  <div style={{ background: '#F1F5F9', padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#334155', borderBottom: '1px solid #CBD5E1' }}>
                                    DETAILS OF LAPSED CHALLANS ENCLOSED ({selectedChallanIds.length} ITEMS)
                                  </div>
                                  <div className="rdlm-table-wrapper" style={{ border: 'none', borderRadius: 0, maxHeight: '200px', overflowY: 'auto' }}>
                                    <table className="rdlm-table" style={{ fontSize: '11px' }}>
                                      <thead>
                                        <tr>
                                          <th>CHALLAN NUMBER</th>
                                          <th>CHALLAN DEPOSIT DATE</th>
                                          <th className="align-right">CHALLAN AMOUNT</th>
                                          <th className="align-right">CHALLAN LAPSE AMOUNT</th>
                                          <th>STATUS</th>
                                          <th>LAPSE PERIOD</th>
                                          <th>LAPSE DUE DATE</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {selectedChallans.map(c => (
                                          <tr key={c.id}>
                                            <td className="code-font">{c.id}</td>
                                            <td>{c.date}</td>
                                            <td className="align-right">{fmt(c.amount)}</td>
                                            <td className="align-right" style={{ color: 'var(--color-error)', fontWeight: 600 }}>{fmt(c.balance)}</td>
                                            <td>
                                              <span className={`badge ${c.status === 'Active' ? 'badge-primary' : 'badge-success'}`}>
                                                {c.status}
                                              </span>
                                            </td>
                                            <td className="align-center">{c.lapsePeriodYears} Yr{c.lapsePeriodYears! > 1 ? 's' : ''}</td>
                                            <td className="code-font">{c.lapseDueDate}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                                <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                                  <label className="form-label">Treasury Creator Remarks <span className="required">*</span></label>
                                  <textarea
                                    className="form-input"
                                    rows={3}
                                    placeholder="Enter comments, e.g., Lapsed unclaimed revenue deposits for FY 2025-26 under MPTC 2020 SR334."
                                    value={creatorRemarks}
                                    onChange={(e) => setCreatorRemarks(e.target.value)}
                                  />
                                </div>

                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: 'var(--space-5)' }}>
                                  <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                      setBillCreated(false);
                                    }}
                                  >
                                    Modify Selection
                                  </button>
                                  <button
                                    className="btn btn-primary"
                                    onClick={handleSubmitBill}
                                    disabled={!creatorRemarks.trim()}
                                  >
                                    Submit Bill to Verifier <ArrowRight size={14} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}

                    {role === 'approver' && (
                      <>
                        {(!billCreated || !billSubmitted) ? (
                          <div className="workflow-action-box centered" style={{ background: '#FAF8F5', border: '1px dashed #E2D9C8', padding: '30px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                            <Ban size={32} style={{ color: 'var(--color-warning)', marginBottom: '10px' }} />
                            <h4>Awaiting Creator Action</h4>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                              {!billCreated
                                ? 'The lapse bill has not been drafted yet. Switch role to Treasury Creator to draft the bill.'
                                : 'The lapse bill is in draft. Switch role to Treasury Creator to submit the bill.'}
                            </p>
                          </div>
                        ) : (
                          <div className="document-frame animate-scale-in" style={{ borderTopColor: '#0e7490' }}>
                            <div className="document-header">
                              <div className="document-title">

                                <strong>BILL of Lapse Revenue Deposit Challan</strong>
                              </div>
                              <div className="document-ref">
                                <span className="document-ref-badge" style={{ background: billApproved ? '#D1FAE5' : '#CFE2FF', color: billApproved ? '#065F46' : '#084298' }}>
                                  {billApproved ? 'Status: Approved & Posted' : 'Status: Pending Approval'}
                                </span><br />
                                Ref: SUBM-LP-2026-041
                              </div>
                            </div>

                            <div className="document-grid">
                              <div className="document-grid-item">
                                <span>Debit HoA</span>
                                <strong>8443-00-103</strong>
                              </div>
                              <div className="document-grid-item">
                                <span>Credit HoA</span>
                                <strong style={{ color: 'var(--color-primary)' }}>0075-00-106-0000</strong>
                              </div>
                              <div className="document-grid-item">
                                <span>Total Lapse Amount of Identified challans </span>
                                <strong style={{ color: 'var(--color-error)', fontSize: '14px' }}>{fmt(totalSelectedAmount)}</strong>
                              </div>
                            </div>

                            <div style={{ marginTop: 'var(--space-4)', border: '1px solid #CBD5E1', borderRadius: 'var(--radius-md)', overflow: 'hidden', width: '100%' }}>
                              <div style={{ background: '#F1F5F9', padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: '#334155', borderBottom: '1px solid #CBD5E1' }}>
                                DETAILS OF LAPSED CHALLANS ENCLOSED ({selectedChallanIds.length} ITEMS)
                              </div>
                              <div className="rdlm-table-wrapper" style={{ border: 'none', borderRadius: 0, maxHeight: '200px', overflowY: 'auto' }}>
                                <table className="rdlm-table" style={{ fontSize: '11px' }}>
                                  <thead>
                                    <tr>
                                      <th>CHALLAN NUMBER</th>
                                      <th>CHALLAN DEPOSIT DATE</th>
                                      <th className="align-right">CHALLAN AMOUNT</th>
                                      <th className="align-right">CHALLAN LAPSE AMOUNT</th>
                                      <th>STATUS</th>
                                      <th>LAPSE PERIOD</th>
                                      <th>LAPSE DUE DATE</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {selectedChallans.map(c => (
                                      <tr key={c.id}>
                                        <td className="code-font">{c.id}</td>
                                        <td>{c.date}</td>
                                        <td className="align-right">{fmt(c.amount)}</td>
                                        <td className="align-right" style={{ color: 'var(--color-error)', fontWeight: 600 }}>{fmt(c.balance)}</td>
                                        <td>
                                          <span className={`badge ${c.status === 'Active' ? 'badge-primary' : 'badge-success'}`}>
                                            {c.status}
                                          </span>
                                        </td>
                                        <td className="align-center">{c.lapsePeriodYears} Yr{c.lapsePeriodYears! > 1 ? 's' : ''}</td>
                                        <td className="code-font">{c.lapseDueDate}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            <div className="alert-box info" style={{ marginTop: 'var(--space-3)', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                              <User size={16} />
                              <div>
                                <strong style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Creator Remarks:</strong>
                                <p style={{ margin: '2px 0 0 0', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{creatorRemarks}</p>
                              </div>
                            </div>

                            {!billApproved ? (
                              <>
                                <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                                  <label className="form-label">Treasury Approver Notes / Decisions</label>
                                  <textarea
                                    className="form-input"
                                    rows={3}
                                    placeholder="Enter authorization notes..."
                                    value={approverNotes}
                                    onChange={(e) => setApproverNotes(e.target.value)}
                                  />
                                </div>

                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: 'var(--space-5)' }}>
                                  <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                      setBillSubmitted(false);
                                      addAudit('Approver Sent Back Bill', 'Bill sent back to Creator for modifications.', 'Treasury-Approver', 'warning');
                                    }}
                                  >
                                    Send Back
                                  </button>
                                  <button
                                    className="btn btn-success"
                                    onClick={handleApproveBill}
                                    style={{ background: '#10B981', color: '#fff', border: 'none' }}
                                  >
                                    <ShieldCheck size={14} /> Approve
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                                  <label className="form-label">Treasury Approver Notes / Decisions</label>
                                  <div className="read-only-remarks" style={{ background: '#F8FAFC', padding: '10px', borderRadius: '4px', border: '1px solid #E2E8F0', fontSize: '12px', fontWeight: 600 }}>
                                    {approverNotes || 'Approved.'}
                                  </div>
                                </div>
                                <div className="alert-box success" style={{ marginTop: 'var(--space-4)', marginInline: 0 }}>
                                  <CheckCircle size={16} />
                                  <span>
                                    Approved successfully. Voucher <strong>{voucherNo}</strong> has been generated and posted.
                                    <button 
                                      className="btn btn-secondary btn-sm" 
                                      onClick={() => setActiveWorkflowSubView('voucher')} 
                                      style={{ marginLeft: '12px', padding: '2px 8px', fontSize: '11px', background: 'white', border: '1px solid var(--color-success)' }}
                                    >
                                      View Voucher
                                    </button>
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </>
                ) : null}

            {/* Render sub-view toggle header and actual views */}
            {billApproved && activeWorkflowSubView === 'voucher' && (
              <div className="voucher-card animate-scale-in">
                <div className="voucher-title-row">
                  <h4>
                    <ShieldCheck size={22} color="var(--color-success)" />
                    <span>AUTOMATIC BY-TRANSFER VOUCHER GENERATED</span>
                  </h4>
                  <span className="voucher-badge">Status: {voucherStatus}</span>
                </div>

                <div className="voucher-grid" style={{ marginBottom: 'var(--space-4)' }}>
                  <div className="document-grid-item">
                    <span>Voucher Reference No.</span>
                    <strong style={{ fontSize: '13px', color: 'var(--color-success)' }}>{voucherNo}</strong>
                  </div>
                  <div className="document-grid-item">
                    <span>Voucher Date</span>
                    <strong>31-Mar-2026</strong>
                  </div>
                  <div className="document-grid-item">
                    <span>Voucher Type</span>
                    <strong>Revenue Deposit Lapse</strong>
                  </div>
                  <div className="document-grid-item">
                    <span>Rule Authority</span>
                    <strong>SR334 of MPTC 2020</strong>
                  </div>
                </div>

                <div className="voucher-grid" style={{ borderTop: '1px dashed rgba(16, 185, 129, 0.3)', paddingTop: 'var(--space-3)' }}>
                  <div className="document-grid-item">
                    <span>Debit Head of Account</span>
                    <strong className="code-font" style={{ color: 'var(--color-primary)' }}>8443-00-103 (Rev Deposit)</strong>
                  </div>
                  <div className="document-grid-item">
                    <span>Credit Head of Account</span>
                    <strong className="code-font" style={{ color: 'var(--color-success)' }}>0075-00-106-0000</strong>
                  </div>
                  <div className="document-grid-item">
                    <span>Lapsed Sum Posted</span>
                    <strong style={{ fontSize: '14px', color: 'var(--color-error)' }}>{fmt(totalSelectedAmount)}</strong>
                  </div>
                  <div className="document-grid-item">
                    <span>Sanction Order Ref.</span>
                    <strong>{sanctionOrderNo}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: 'var(--space-5)', justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary"><Download size={14} /> Download PDF Receipt</button>
                  <button className="btn btn-primary" onClick={() => setActiveTab('ledger')}>
                    View Deposit Registry <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* If approved, show sub-view toggles at the top of the workflow card */}
            {billApproved && (
              <div className="subview-toggle-bar" style={{ display: 'flex', gap: '10px', marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-border-light)', paddingTop: '15px' }}>
                <button
                  className={`btn ${activeWorkflowSubView === 'bill' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveWorkflowSubView('bill')}
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  <FileText size={14} /> View Approved Bill Document
                </button>
                <button
                  className={`btn ${activeWorkflowSubView === 'voucher' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveWorkflowSubView('voucher')}
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  <ShieldCheck size={14} /> View Generated Voucher
                </button>
              </div>
            )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ─── TAB 4: DEPOSIT STATUS & AUDIT (SCREEN 4) ─── */}
      {activeTab === 'ledger' && (
        <div className="rdlm-section animate-scale-in">
          <div className="rdlm-section-header">
            <div className="rdlm-section-icon"><Database size={18} /></div>
            <h2>Deposit Status Registry & Integrations (Screen 4)</h2>
            <div style={{ marginLeft: 'auto' }}>
              <span className="current-user-pill">FY 2025-26 closing</span>
            </div>
          </div>
          <div className="rdlm-section-body">

            {/* Deposit Status Update Table */}
            <h4 style={{ fontSize: '13px', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>Updated Ledger Registry</h4>
            <div className="rdlm-table-wrapper" style={{ marginBottom: 'var(--space-6)' }}>
              <table className="rdlm-table">
                <thead>
                  <tr>
                    <th>Challan Number</th>
                    <th>Challan Deposit Date</th>
                    <th className="align-right">Challan Amount</th>
                    <th>Current Status</th>
                    <th className="align-right">Challan Lapse Amount</th>
                    <th className="align-right">Current Balance</th>
                    <th>Lapse Date</th>
                    <th>Linked Voucher Ref</th>
                  </tr>
                </thead>
                <tbody>
                  {challans.map(ch => {
                    const isLapsed = ch.status === 'Lapsed';

                    return (
                      <tr key={ch.id} style={isLapsed ? { background: '#FAFDFB' } : undefined}>
                        <td className="code-font">{ch.id}</td>
                        <td>{ch.date}</td>
                        <td className="align-right" style={{ color: 'var(--color-text-secondary)' }}>{fmt(ch.amount)}</td>
                        <td>
                          <span className={`badge ${isLapsed ? 'badge-success' : 'badge-primary'}`}>
                            {ch.status}
                          </span>
                        </td>
                        <td className="align-right font-weight-bold" style={{ color: isLapsed ? 'var(--color-error)' : 'inherit' }}>
                          {isLapsed ? fmt(ch.amount) : '₹ 0.00'}
                        </td>
                        <td className="align-right" style={{ fontWeight: 600, color: isLapsed ? 'var(--color-success)' : 'inherit' }}>
                          {fmt(ch.balance)}
                        </td>
                        <td className="code-font">{isLapsed ? '31-Mar-2026' : '—'}</td>
                        <td className="code-font" style={{ fontWeight: 600 }}>{isLapsed ? (voucherNo || 'VCH-LP-0075-8109') : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* External Modules Integration grid */}
            <div className="integration-grid">

              {/* e-Account Integration */}
              <div className="integration-card">
                <div className="integration-card-header">
                  <span>e-Account Expenditure Control</span>
                  <span className="badge badge-success" style={{ background: '#D1FAE5', color: '#065F46' }}>Online</span>
                </div>
                <div className="integration-card-body">
                  <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                    Minus entry in expenditure Major Head has been posted to record by-transfer from 8443-00-103.
                  </p>
                  <textarea
                    className="terminal-textarea"
                    rows={6}
                    readOnly
                    value={`[e-Account API Feed - ${systemDate === '05-apr' ? '05-Apr-2026' : '31-Mar-2026'}]
POST /api/e-account/minus-entry HTTP/1.1
Content-Type: application/json
{
  "majorHead": "8443",
  "minorHead": "103",
  "type": "MINUS_EXPENDITURE",
  "amount": ${billApproved ? totalSelectedAmount : 0},
  "voucherRef": "${voucherNo || 'PENDING'}",
  "creditedHoa": "0075-00-106-0000",
  "auditToken": "MPTC-SR334-2026-VAL"
}
Response: 200 OK. Expenditure adjusted in central ledger successfully.`}
                  />
                </div>
              </div>

              {/* AGMP VLC Integration */}
              <div className="integration-card">
                <div className="integration-card-header">
                  <span>AGMP VLC Integration Panel</span>
                  <span className={`badge ${isAgmpSynced ? 'badge-success' : 'badge-warning'}`}>
                    {isAgmpSynced ? 'Synced' : 'Ready to Sync'}
                  </span>
                </div>
                <div className="integration-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    Export lapse balances for AGMP Plus-Minus Memo reconciliation.
                  </p>
                  <textarea
                    className="terminal-textarea"
                    rows={10}
                    readOnly
                    value={getAgmpExportText()}
                  />
                  {billApproved ? (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleAgmpSync}
                      disabled={isAgmpSyncing || isAgmpSynced}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      {isAgmpSyncing ? (
                        <><Loader2 className="spin-anim" size={12} /> Syncing records...</>
                      ) : isAgmpSynced ? (
                        '✓ Synced to AGMP'
                      ) : (
                        <><RefreshCw size={12} /> Transmit & Sync to AGMP Software</>
                      )}
                    </button>
                  ) : (
                    <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} disabled>
                      Post Voucher First to Sync
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Verification Security Watchdog (Payment capability blocker tool) */}
            <div style={{ marginTop: 'var(--space-6)', borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-5)' }}>
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={16} color="var(--color-primary)" />
                <span>Treasury Security Watchdog: Challan Payment Validator</span>
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                Test validator tool to confirm that lapsed challans (having balance reduced to zero) will completely block any manual attempts to generate payment advice or bills.
              </p>

              <form onSubmit={handleValidateChallan} className="validator-form">
                <input
                  type="text"
                  className="validator-input"
                  placeholder="e.g. 270/0241088/8443/00-103/23/00882"
                  value={valChallanId}
                  onChange={e => setValChallanId(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  <Search size={14} /> Verify Challan Payment Status
                </button>
              </form>

              <div className={`validator-result ${validationResult.status}`}>
                {validationResult.status === 'blocked' ? (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <Ban size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{validationResult.msg}</span>
                  </div>
                ) : validationResult.status === 'active' ? (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <CheckCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{validationResult.msg}</span>
                  </div>
                ) : (
                  <span>{validationResult.msg}</span>
                )}
              </div>
            </div>

            {/* Audit Trail System Log */}
            <div style={{ marginTop: 'var(--space-6)', borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-5)' }}>
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>System Audit Trail Log</h4>
              <div className="rdlm-audit-timeline">
                {auditLogs.map((log, i) => (
                  <div key={i} className={`rdlm-audit-item ${log.type}`}>
                    <div className="rdlm-audit-dot" />
                    <div className="rdlm-audit-title">{log.action}</div>
                    <div className="rdlm-audit-meta">User: {log.user} • Time: {log.time}</div>
                    <div className="rdlm-audit-detail">{log.detail}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
