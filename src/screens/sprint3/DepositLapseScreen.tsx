import { useState, useEffect } from 'react';
import { FileText, Search, Shield, CheckCircle2, AlertCircle, Clock, XCircle, Calendar, Building, User, Download, ShieldAlert, Check, Loader2, ArrowRight } from 'lucide-react';
import './DepositLapseScreen.css';

const LAPSE_ACCOUNTS = [
  { id: 'PD-500-022021-8201-1001', name: 'Urban Administration', type: 'PD', fund: 'Consolidated Fund', dept: 'Urban Dev.', lastTxn: '2021-02-15', years: 5, balance: 5000000, status: 'review', exception: 'None' },
  { id: 'PD-400-112020-4932-1002', name: 'Rural Development', type: 'PD', fund: 'Consolidated Fund', dept: 'Rural Dev.', lastTxn: '2020-11-30', years: 5, balance: 13100000, status: 'review', exception: 'None' },
  { id: 'PD-300-062019-5510-1003', name: 'Land Acquisition Fund', type: 'PD', fund: 'Consolidated Fund', dept: 'Revenue', lastTxn: '2019-06-10', years: 7, balance: 8500000, status: 'exception', exception: 'Land Acquisition' },
  { id: 'PD-200-032020-6120-1004', name: 'Jail Welfare Fund', type: 'PD', fund: 'Challan', dept: 'Home/Jail', lastTxn: '2020-03-25', years: 6, balance: 2300000, status: 'excluded', exception: 'Jail' },
  { id: 'CCD-10293', name: 'Civil Suit Deposits', type: 'CCD', fund: 'Challan', dept: 'Civil Court', lastTxn: '2023-01-10', years: 3, balance: 900000, status: 'eligible', exception: 'None' },
  { id: 'CrCD-83921', name: 'Bail Bonds', type: 'CrCD', fund: 'Challan', dept: 'Criminal Court', lastTxn: '2022-09-20', years: 3, balance: 480000, status: 'eligible', exception: 'None' },
  { id: 'PD-600-082021-7230-1005', name: 'FD Validity Account', type: 'PD', fund: 'Consolidated Fund', dept: 'Finance', lastTxn: '2021-08-01', years: 5, balance: 4200000, status: 'exception', exception: 'Validity' },
];

const AUDIT_LOG = [
  { action: 'Rule-Based Segregation Executed', detail: 'System identified 7 accounts for FY 2025-26 review', user: 'System', time: '31 Mar 2026, 23:59', type: 'info' as const },
  { action: 'Non-CF Accounts Excluded', detail: 'Accounts with fund source other than consolidated fund excluded from auto-lapse', user: 'System', time: '31 Mar 2026, 23:59', type: 'warning' as const },
  { action: 'FD Review Initiated', detail: 'PD-500-022021-8201-1001 & PD-400-112020-4932-1002 sent to FD Review Queue (≥ 5 years no txn)', user: 'System', time: '01 Apr 2026, 00:01', type: 'info' as const },
  { action: 'FD Decision — Account Closed', detail: 'PD-500-022021-8201-1001 approved for closure by FD. Voucher VCH-LP-2026-001 generated.', user: 'FD-Admin', time: '05 Apr 2026, 11:30', type: 'error' as const },
  { action: 'FD Decision — Account Continued', detail: 'PD-400-112020-4932-1002 marked to continue. Active for another year.', user: 'FD-Admin', time: '05 Apr 2026, 11:45', type: 'success' as const },
];

const CLOSURE_STEPS = [
  { id: 'head', label: 'Identifying Expenditure Head & Receipt HoA', detail: 'Identified Exp Head & Receipt HoA (0070) with FD Scheme applied.' },
  { id: 'claim', label: 'Generating Claim for By-Transfer', detail: 'Claim generated for all available budget lines in respective receipt heads.' },
  { id: 'notify', label: 'Notifying Treasury Officer & Deposit Admin', detail: 'Notification sent regarding generation of claim for account closure.' },
  { id: 'bill', label: 'Updating Treasury Creator Workflow', detail: 'Claim reflects as approved at Treasury Creator for bill generation.' },
  { id: 'challan', label: 'Auto-creating Challan', detail: 'System auto-creates challan (marked as Used/Consumed after TO approval).' },
  { id: 'final', label: 'Finalizing Account Closure', detail: 'Refund functionality blocked, Lapse voucher generated, accounting impact posted.' }
];

type Tab = 'fdreview' | 'exception' | 'audit';

export default function DepositLapseScreen() {
  const [tab, setTab] = useState<Tab>('fdreview');
  const [fy] = useState('2025-26');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fdDecision, setFdDecision] = useState<'close' | 'continue' | ''>('');

  // Processing Modal State
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processStep, setProcessStep] = useState(0);
  const [processComplete, setProcessComplete] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (showProcessModal && !processComplete) {
      if (processStep < CLOSURE_STEPS.length) {
        timer = setTimeout(() => {
          setProcessStep(prev => prev + 1);
        }, 1200); // 1.2s per step
      } else {
        setTimeout(() => setProcessComplete(true), 500);
      }
    }
    return () => clearTimeout(timer);
  }, [showProcessModal, processStep, processComplete]);

  const handleProcessDecision = () => {
    if (fdDecision === 'close') {
      setProcessStep(0);
      setProcessComplete(false);
      setShowProcessModal(true);
    } else {
      // Direct continue logic
      alert('Account marked to continue for another year. Audit trail updated.');
      setSelectedId(null);
    }
  };

  const reviewCount = LAPSE_ACCOUNTS.filter(a => a.status === 'review').length;
  const exceptionCount = LAPSE_ACCOUNTS.filter(a => a.status === 'exception' || a.status === 'excluded').length;
  const eligibleCount = LAPSE_ACCOUNTS.filter(a => a.status === 'eligible').length;
  const fmt = (n: number) => '₹ ' + n.toLocaleString('en-IN');
  const selected = LAPSE_ACCOUNTS.find(a => a.id === selectedId);

  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
    { id: 'fdreview', label: 'FD Review & Decision', icon: FileText, count: reviewCount },
    { id: 'exception', label: 'Exclusions & Exceptions', icon: ShieldAlert, count: exceptionCount },
    { id: 'audit', label: 'Audit Trail', icon: Shield },
  ];


  return (
    <div className="dlm-screen animate-fade-in">
      <header>
        <h1>Account Segregation & Lapse Processing</h1>
        <p className="header-desc">Identify inactive deposit accounts based on fund source, process FD reviews (Close / Continue), and execute automated closure workflows.</p>
        <div className="dlm-header-badges">
          <span className="dlm-header-badge role"><User size={12} /> Finance Department</span>
          <span className="dlm-header-badge module"><Building size={12} /> Deposit Module</span>
          <span className="dlm-header-badge fy"><Calendar size={12} /> FY {fy}</span>
        </div>
      </header>

      {/* Stats */}
      <div className="dlm-stats-grid">
        <div className="dlm-stat-card primary"><div className="dlm-stat-icon primary"><Search size={20} /></div><div className="dlm-stat-info"><span className="dlm-stat-value">{LAPSE_ACCOUNTS.length}</span><span className="dlm-stat-label">Total Evaluated</span></div></div>
        <div className="dlm-stat-card warning"><div className="dlm-stat-icon warning"><Clock size={20} /></div><div className="dlm-stat-info"><span className="dlm-stat-value">{reviewCount}</span><span className="dlm-stat-label">Pending FD Review</span></div></div>
        <div className="dlm-stat-card error"><div className="dlm-stat-icon error"><XCircle size={20} /></div><div className="dlm-stat-info"><span className="dlm-stat-value">{eligibleCount}</span><span className="dlm-stat-label">Other Auto-Lapse</span></div></div>
        <div className="dlm-stat-card success"><div className="dlm-stat-icon success"><ShieldAlert size={20} /></div><div className="dlm-stat-info"><span className="dlm-stat-value">{exceptionCount}</span><span className="dlm-stat-label">Excluded / Exceptions</span></div></div>
      </div>

      {/* Tabs */}
      <div className="dlm-tabs">
        {tabs.map(t => (
          <button key={t.id} className={`dlm-tab ${tab === t.id ? 'active' : ''}`} onClick={() => { setTab(t.id); setSelectedId(null); }}>
            <t.icon size={16} /> {t.label}
            {t.count != null && t.count > 0 && <span className="dlm-tab-count">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* ── FD Review ── */}
      {tab === 'fdreview' && !selectedId && (
        <div className="dlm-section">
          <div className="dlm-section-header"><div className="dlm-section-icon"><FileText size={18} /></div><h2>Step 3: FD Review list — PD with fund source Consolidated Fund Accounts</h2></div>
          <div className="dlm-section-body" style={{ padding: 0 }}>
            <div className="dlm-info-callout info" style={{ margin: 'var(--space-4)' }}>
              <AlertCircle size={16} /><div>System-generated list of non-operational PD-CF accounts (≥ 5 years). FD must choose to <strong>Close account</strong> or <strong>Continue</strong>.</div>
            </div>
            <div className="dlm-info-callout warning" style={{ margin: '0 var(--space-4) var(--space-4) var(--space-4)' }}>
              <ShieldAlert size={16} /><div><strong>Note:</strong> PD accounts with fund source other than Consolidated Fund are excluded from closure and will remain active forever.</div>
            </div>
            <div className="dlm-table-wrapper" style={{ border: 'none' }}>
              <table className="dlm-table">
                <thead><tr><th>Account</th><th>Fund Source</th><th>Last Txn</th><th className="align-right">Balance</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {LAPSE_ACCOUNTS.filter(a => a.status === 'review').map(a => (
                    <tr key={a.id} className="row-clickable" onClick={() => setSelectedId(a.id)}>
                      <td><div style={{ fontWeight: 600 }}>{a.id}</div><div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{a.name}</div></td>
                      <td>{a.fund}</td><td>{a.lastTxn}</td>
                      <td className="align-right" style={{ fontWeight: 600 }}>{fmt(a.balance)}</td>
                      <td><span className="dlm-status-badge review"><Clock size={12} /> Pending FD Decision</span></td>
                      <td><button className="btn btn-sm btn-primary" onClick={e => { e.stopPropagation(); setSelectedId(a.id); setFdDecision('') }}>Review</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FD Decision Detail */}
      {tab === 'fdreview' && selectedId && selected && (
        <div className="dlm-section">
          <div className="dlm-section-header"><div className="dlm-section-icon"><FileText size={18} /></div><h2>FD Decision — {selected.id}</h2>
            <div className="dlm-section-header-actions"><button className="btn" onClick={() => setSelectedId(null)}>← Back to List</button></div>
          </div>
          <div className="dlm-section-body">
            <div className="dlm-voucher-grid">
              <div className="dlm-voucher-item"><span className="dlm-voucher-label">Account</span><span className="dlm-voucher-value">{selected.id} — {selected.name}</span></div>
              <div className="dlm-voucher-item"><span className="dlm-voucher-label">Fund Source</span><span className="dlm-voucher-value">{selected.fund}</span></div>
              <div className="dlm-voucher-item"><span className="dlm-voucher-label">Last Transaction</span><span className="dlm-voucher-value">{selected.lastTxn}</span></div>
              <div className="dlm-voucher-item"><span className="dlm-voucher-label">Current Balance</span><span className="dlm-voucher-value" style={{ color: 'var(--color-primary)' }}>{fmt(selected.balance)}</span></div>
            </div>

            <div className="dlm-decision-panel">
              <div className="dlm-decision-title"><FileText size={18} /> Provide FD Decision</div>
              <div className="dlm-radio-group">
                <label className={`dlm-radio-card ${fdDecision === 'close' ? 'selected-lapse' : ''}`} onClick={() => setFdDecision('close')}>
                  <input type="radio" checked={fdDecision === 'close'} readOnly />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>Close Account</span>
                    <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Initiate auto-lapse workflow & generate voucher</span>
                  </div>
                </label>
                <label className={`dlm-radio-card ${fdDecision === 'continue' ? 'selected-continue' : ''}`} onClick={() => setFdDecision('continue')}>
                  <input type="radio" checked={fdDecision === 'continue'} readOnly />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>Continue</span>
                    <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Active for another year. Re-evaluate if no txn.</span>
                  </div>
                </label>
              </div>

              <div className="grid-2-col">
                <div className="form-group"><label className="form-label">FD Remarks <span className="required">*</span></label><input type="text" className="form-input" placeholder="Enter remarks for audit trail..." /></div>
                {fdDecision === 'continue' && <div className="form-group"><label className="form-label">Next Review Year</label><input type="text" className="form-input" value="2027" disabled /></div>}
              </div>

              {fdDecision === 'close' && (<>
                <hr className="dlm-divider" />
                <div className="dlm-info-callout error" style={{ marginBottom: 'var(--space-4)', marginTop: 0 }}>
                  <AlertCircle size={16} /><div>Approving closure will map each Expenditure Head to a Receipt HoA, create claims for by-transfer, generate lapse vouchers, and block refunds.</div>
                </div>

                <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label className="form-label">Head of Account Mappings <span className="required">*</span></label>
                  <div className="dlm-table-wrapper" style={{ border: '1px solid var(--color-border)' }}>
                    <table className="dlm-table" style={{ margin: 0 }}>
                      <thead style={{ background: 'var(--color-bg-secondary)' }}>
                        <tr>
                          <th>Original Expenditure HoA</th>
                          <th className="align-right">Remaining Amount</th>
                          <th>Receipt HoA</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '13px' }}>2202-01-101-0001</td>
                          <td className="align-right">{fmt(Math.floor(selected.balance * 0.6))}</td>
                          <td><input type="text" className="form-input" placeholder="e.g. 0070-60-800" defaultValue="0070-60-800" style={{ height: '30px', fontSize: '13px' }} /></td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '13px' }}>2215-02-800-0002</td>
                          <td className="align-right">{fmt(selected.balance - Math.floor(selected.balance * 0.6))}</td>
                          <td><input type="text" className="form-input" placeholder="Leave blank for 0070" style={{ height: '30px', fontSize: '13px' }} /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <small style={{ color: 'var(--color-text-tertiary)', marginTop: '6px', display: 'block' }}>* For any expenditure with no Receipt HoA specified, the system will default to Receipt HoA <strong>0070</strong>.</small>
                </div>

                <div className="grid-2-col">
                  <div className="form-group"><label className="form-label">FD-Approved Scheme <span className="required">*</span></label>
                    <select className="form-input"><option value="">Select Scheme...</option><option>SCH-LPS-2026-01</option></select></div>
                  <div className="form-group"><label className="form-label">Total Claim / By-Transfer</label>
                    <input type="text" className="form-input" value={fmt(selected.balance)} disabled /></div>
                </div>
              </>)}

              <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)' }}>
                <button className="btn btn-primary" disabled={!fdDecision} onClick={handleProcessDecision}>
                  {fdDecision === 'close' ? <><ArrowRight size={14} /> Execute Closure Processing</> : <><CheckCircle2 size={14} /> Submit Decision</>}
                </button>
                <button className="btn btn-secondary" onClick={() => setSelectedId(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Exception Accounts ── */}
      {tab === 'exception' && (
        <div className="dlm-section">
          <div className="dlm-section-header"><div className="dlm-section-icon"><ShieldAlert size={18} /></div><h2>Excluded & Exception Accounts</h2></div>
          <div className="dlm-section-body" style={{ padding: 0 }}>
            <div className="dlm-info-callout warning" style={{ margin: 'var(--space-4)' }}>
              <AlertCircle size={16} /><div>PDs with fund sources <strong>other than Consolidated Fund</strong> are excluded from auto-lapse. Special cases (Land Acquisition, Jail) are exception accounts.</div>
            </div>
            <div className="dlm-table-wrapper" style={{ border: 'none', borderTop: '1px solid var(--color-border-light)' }}>
              <table className="dlm-table">
                <thead><tr><th>Account</th><th>Type</th><th>Fund Source</th><th>Department</th><th>Exception Category</th><th className="align-right">Balance</th><th>Status</th></tr></thead>
                <tbody>
                  {LAPSE_ACCOUNTS.filter(a => a.status === 'exception' || a.status === 'excluded').map(a => (
                    <tr key={a.id}>
                      <td><div style={{ fontWeight: 600 }}>{a.id}</div><div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{a.name}</div></td>
                      <td>{a.type}</td>
                      <td>{a.fund}</td>
                      <td>{a.dept}</td>
                      <td><span className="dlm-exception-tag"><ShieldAlert size={10} />{a.exception}</span></td>
                      <td className="align-right" style={{ fontWeight: 600 }}>{fmt(a.balance)}</td>
                      <td><span className="dlm-status-badge exception">Lapse Not Applicable</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Audit Trail ── */}
      {tab === 'audit' && (
        <div className="dlm-section">
          <div className="dlm-section-header"><div className="dlm-section-icon"><Shield size={18} /></div><h2>System Audit Trail</h2></div>
          <div className="dlm-section-body">
            <div className="dlm-audit-timeline">
              {AUDIT_LOG.map((a, i) => (
                <div key={i} className={`dlm-audit-item ${a.type}`}>
                  <div className="dlm-audit-dot" /><div className="dlm-audit-title">{a.action}</div>
                  <div className="dlm-audit-meta">By {a.user} • {a.time}</div>
                  <div className="dlm-audit-detail">{a.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Closure Processing Modal */}
      {showProcessModal && (
        <div className="dlm-modal-overlay">
          <div className="dlm-modal-content process-modal">
            <div className="process-header">
              {processComplete ? (
                <div className="process-icon-wrap success"><CheckCircle2 size={32} /></div>
              ) : (
                <div className="process-icon-wrap processing"><Loader2 size={32} className="spin-anim" /></div>
              )}
              <h3>{processComplete ? 'Account Closure Successful' : 'Step 4A: Closure Processing – PD-CF'}</h3>
              <p>{processComplete ? `Account ${selected?.id} successfully closed and lapse voucher generated.` : `Executing system workflows for ${selected?.id}...`}</p>
            </div>

            <div className="process-steps">
              {CLOSURE_STEPS.map((step, idx) => {
                const isActive = idx === processStep;
                const isCompleted = idx < processStep;

                return (
                  <div key={step.id} className={`process-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                    <div className="step-indicator">
                      {isCompleted ? <Check size={14} /> : (isActive ? <Loader2 size={14} className="spin-anim" /> : <span>{idx + 1}</span>)}
                    </div>
                    <div className="step-content">
                      <div className="step-label">{step.label}</div>
                      <div className="step-detail">{step.detail}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {processComplete && (
              <div className="process-results fade-in-up">
                <div className="dlm-voucher-grid" style={{ marginBottom: 0, marginTop: 'var(--space-4)' }}>
                  <div className="dlm-voucher-item"><span className="dlm-voucher-label">Claim ID</span><span className="dlm-voucher-value">CLM-2026-9912</span></div>
                  <div className="dlm-voucher-item"><span className="dlm-voucher-label">By-Transfer Challan</span><span className="dlm-voucher-value">BT-CH-2026-4421</span></div>
                  <div className="dlm-voucher-item"><span className="dlm-voucher-label">Lapse Voucher No.</span><span className="dlm-voucher-value">VCH-LP-2026-001</span></div>
                  <div className="dlm-voucher-item"><span className="dlm-voucher-label">Accounting Impact</span><span className="dlm-voucher-value" style={{ color: 'var(--color-success)' }}>Posted Centrally</span></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
                  <button className="btn btn-secondary"><Download size={14} /> Download Voucher</button>
                  <button className="btn btn-primary" onClick={() => { setShowProcessModal(false); setSelectedId(null) }}>Done</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
