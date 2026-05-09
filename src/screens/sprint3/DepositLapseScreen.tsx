import { useState } from 'react';
import { FileText, Search, Shield, CheckCircle2, AlertCircle, Clock, XCircle, Calendar, Building, User, Download, Eye, Filter, BarChart3, ShieldAlert } from 'lucide-react';
import './DepositLapseScreen.css';

const LAPSE_ACCOUNTS = [
  { id: 'PD-82011', name: 'Urban Administration', type: 'PD', fund: 'Consolidated Fund', dept: 'Urban Dev.', lastTxn: '2021-02-15', years: 5, balance: 5000000, status: 'review', exception: 'None' },
  { id: 'PD-49320', name: 'Rural Development', type: 'PD', fund: 'Consolidated Fund', dept: 'Rural Dev.', lastTxn: '2020-11-30', years: 5, balance: 13100000, status: 'review', exception: 'None' },
  { id: 'PD-55100', name: 'Land Acquisition Fund', type: 'PD', fund: 'Consolidated Fund', dept: 'Revenue', lastTxn: '2019-06-10', years: 7, balance: 8500000, status: 'exception', exception: 'Land Acquisition' },
  { id: 'PD-61200', name: 'Jail Welfare Fund', type: 'PD', fund: 'Challan', dept: 'Home/Jail', lastTxn: '2020-03-25', years: 6, balance: 2300000, status: 'excluded', exception: 'Jail' },
  { id: 'CCD-10293', name: 'Civil Suit Deposits', type: 'CCD', fund: 'Challan', dept: 'Civil Court', lastTxn: '2023-01-10', years: 3, balance: 900000, status: 'eligible', exception: 'None' },
  { id: 'CrCD-83921', name: 'Bail Bonds', type: 'CrCD', fund: 'Challan', dept: 'Criminal Court', lastTxn: '2022-09-20', years: 3, balance: 480000, status: 'eligible', exception: 'None' },
  { id: 'PD-72300', name: 'FD Validity Account', type: 'PD', fund: 'Consolidated Fund', dept: 'Finance', lastTxn: '2021-08-01', years: 5, balance: 4200000, status: 'exception', exception: 'Validity' },
];

const AUDIT_LOG = [
  { action: 'Lapse Identification Executed', detail: 'System identified 7 accounts for FY 2025-26 review', user: 'System', time: '31 Mar 2026, 23:59', type: 'info' as const },
  { action: 'Exception Accounts Excluded', detail: '3 accounts excluded (Land Acquisition, Jail, Validity)', user: 'System', time: '31 Mar 2026, 23:59', type: 'warning' as const },
  { action: 'FD Review Initiated', detail: 'PD-82011 & PD-49320 sent to FD Review Queue', user: 'System', time: '01 Apr 2026, 00:01', type: 'info' as const },
  { action: 'FD Decision — Lapse Approved', detail: 'PD-82011 approved for lapse by FD. Voucher VCH-LP-2026-001 generated.', user: 'FD-Admin', time: '05 Apr 2026, 11:30', type: 'error' as const },
  { action: 'Auto-Lapse Executed — CCD/CrCD', detail: 'CCD-10293, CrCD-83921 auto-lapsed. Vouchers generated. AG notified.', user: 'System', time: '31 Mar 2026, 23:59', type: 'success' as const },
];

type Tab = 'identify' | 'fdreview' | 'exception' | 'audit';

export default function DepositLapseScreen() {
  const [tab, setTab] = useState<Tab>('identify');
  const [fy, setFy] = useState('2025-26');
  const [depType, setDepType] = useState('');
  const [fundSrc, setFundSrc] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedId, setSelectedId] = useState<string|null>(null);
  const [fdDecision, setFdDecision] = useState<'lapse'|'continue'|''>('');
  const [showVoucher, setShowVoucher] = useState(false);

  const reviewCount = LAPSE_ACCOUNTS.filter(a => a.status === 'review').length;
  const exceptionCount = LAPSE_ACCOUNTS.filter(a => a.status === 'exception' || a.status === 'excluded').length;
  const eligibleCount = LAPSE_ACCOUNTS.filter(a => a.status === 'eligible').length;
  const fmt = (n: number) => '₹ ' + n.toLocaleString('en-IN');
  const selected = LAPSE_ACCOUNTS.find(a => a.id === selectedId);

  const tabs: {id: Tab; label: string; icon: any; count?: number}[] = [
    { id: 'identify', label: 'Lapse Identification', icon: Search, count: LAPSE_ACCOUNTS.length },
    { id: 'fdreview', label: 'FD Review & Decision', icon: FileText, count: reviewCount },
    { id: 'exception', label: 'Exception Accounts', icon: ShieldAlert, count: exceptionCount },
    { id: 'audit', label: 'Audit Trail', icon: Shield },
  ];

  const statusLabel = (s: string) => {
    const map: Record<string,string> = { review: 'FD Review', eligible: 'Auto-Lapse Eligible', exception: 'Exception', excluded: 'Excluded', lapsed: 'Lapsed', continued: 'Continued' };
    return map[s] || s;
  };

  return (
    <div className="dlm-screen animate-fade-in">
      <header>
        <h1>Deposit Lapse Management</h1>
        <p className="header-desc">Identify deposit accounts due for lapse, process FD reviews, manage exceptions, and generate lapse vouchers as per MPTC rules.</p>
        <div className="dlm-header-badges">
          <span className="dlm-header-badge role"><User size={12} /> Treasury / Deposit Authority</span>
          <span className="dlm-header-badge module"><Building size={12} /> Deposit Module</span>
          <span className="dlm-header-badge fy"><Calendar size={12} /> FY {fy}</span>
        </div>
      </header>

      {/* Stats */}
      <div className="dlm-stats-grid">
        <div className="dlm-stat-card primary"><div className="dlm-stat-icon primary"><Search size={20}/></div><div className="dlm-stat-info"><span className="dlm-stat-value">{LAPSE_ACCOUNTS.length}</span><span className="dlm-stat-label">Identified Accounts</span></div></div>
        <div className="dlm-stat-card warning"><div className="dlm-stat-icon warning"><Clock size={20}/></div><div className="dlm-stat-info"><span className="dlm-stat-value">{reviewCount}</span><span className="dlm-stat-label">Pending FD Review</span></div></div>
        <div className="dlm-stat-card error"><div className="dlm-stat-icon error"><XCircle size={20}/></div><div className="dlm-stat-info"><span className="dlm-stat-value">{eligibleCount}</span><span className="dlm-stat-label">Auto-Lapse Eligible</span></div></div>
        <div className="dlm-stat-card success"><div className="dlm-stat-icon success"><ShieldAlert size={20}/></div><div className="dlm-stat-info"><span className="dlm-stat-value">{exceptionCount}</span><span className="dlm-stat-label">Exception Accounts</span></div></div>
      </div>

      {/* Tabs */}
      <div className="dlm-tabs">
        {tabs.map(t => (
          <button key={t.id} className={`dlm-tab ${tab === t.id ? 'active' : ''}`} onClick={() => { setTab(t.id); setSelectedId(null); }}>
            <t.icon size={16}/> {t.label}
            {t.count != null && t.count > 0 && <span className="dlm-tab-count">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* ── Lapse Identification ── */}
      {tab === 'identify' && !showResults && (
        <div className="dlm-section">
          <div className="dlm-section-header"><div className="dlm-section-icon"><Filter size={18}/></div><h2>Lapse Identification Parameters</h2></div>
          <div className="dlm-section-body">
            <div className="dlm-info-callout info" style={{marginTop:0,marginBottom:'var(--space-5)'}}>
              <AlertCircle size={16}/><div><strong>Rule Engine:</strong> PD-CF accounts with no transaction ≥ 5 years → FD Review. CCD/CrCD challans unclaimed ≥ 3 years → Auto-Lapse Eligible. Exception accounts are automatically excluded.</div>
            </div>
            <div className="grid-2-col dlm-form-row">
              <div className="form-group"><label className="form-label">Financial Year <span className="required">*</span></label>
                <select className="form-input" value={fy} onChange={e=>setFy(e.target.value)}><option>2025-26</option><option>2024-25</option></select></div>
              <div className="form-group"><label className="form-label">Deposit Type</label>
                <select className="form-input" value={depType} onChange={e=>setDepType(e.target.value)}><option value="">All Types</option><option>PD</option><option>CCD</option><option>CrCD</option></select></div>
            </div>
            <div className="grid-2-col dlm-form-row">
              <div className="form-group"><label className="form-label">Fund Source</label>
                <select className="form-input" value={fundSrc} onChange={e=>setFundSrc(e.target.value)}><option value="">All</option><option>Consolidated Fund</option><option>Challan</option></select></div>
              <div className="form-group"><label className="form-label">As on Date <span className="required">*</span></label>
                <input type="date" className="form-input" defaultValue="2026-03-31"/></div>
            </div>
            <div className="grid-2-col dlm-form-row">
              <div className="form-group"><label className="form-label">Run Mode</label>
                <div style={{display:'flex',gap:'var(--space-4)',marginTop:'var(--space-2)'}}>
                  <label style={{display:'flex',alignItems:'center',gap:'var(--space-2)',cursor:'pointer'}}><input type="radio" name="mode" defaultChecked style={{accentColor:'var(--color-primary)'}}/> Manual</label>
                  <label style={{display:'flex',alignItems:'center',gap:'var(--space-2)',cursor:'pointer'}}><input type="radio" name="mode" style={{accentColor:'var(--color-primary)'}}/> Scheduled</label>
                </div></div>
              <div className="form-group"><label className="form-label">Include Exceptions</label>
                <label style={{display:'flex',alignItems:'center',gap:'var(--space-2)',marginTop:'var(--space-2)',cursor:'pointer'}}><input type="checkbox" style={{accentColor:'var(--color-primary)',width:16,height:16}}/> Show exception accounts in results</label></div>
            </div>
            <div className="dlm-action-bar" style={{borderTop:'none',paddingTop:0}}>
              <div className="dlm-action-bar-left"><button className="btn btn-secondary">Reset</button></div>
              <div className="dlm-action-bar-right"><button className="btn btn-primary" onClick={()=>setShowResults(true)}><Search size={14}/> Generate Lapse List</button></div>
            </div>
          </div>
        </div>
      )}

      {tab === 'identify' && showResults && !selectedId && (
        <div className="dlm-section">
          <div className="dlm-section-header"><div className="dlm-section-icon"><BarChart3 size={18}/></div><h2>Lapse Identification Results — FY {fy}</h2>
            <div className="dlm-section-header-actions"><button className="btn" onClick={()=>setShowResults(false)}>← Modify Criteria</button><button className="btn"><Download size={14}/> Export</button></div>
          </div>
          <div className="dlm-section-body" style={{padding:0}}>
            <div className="dlm-table-wrapper" style={{border:'none'}}>
              <table className="dlm-table">
                <thead><tr><th>Account</th><th>Type</th><th>Fund Source</th><th>Department</th><th>Last Txn</th><th>Years</th><th className="align-right">Balance</th><th>Exception</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {LAPSE_ACCOUNTS.map(a => (
                    <tr key={a.id} className="row-clickable" onClick={()=>setSelectedId(a.id)}>
                      <td><div style={{fontWeight:600}}>{a.id}</div><div style={{fontSize:11,color:'var(--color-text-tertiary)'}}>{a.name}</div></td>
                      <td>{a.type}</td><td style={{fontSize:'var(--font-size-xs)'}}>{a.fund}</td><td>{a.dept}</td>
                      <td>{a.lastTxn}</td><td style={{fontWeight:600}}>{a.years}</td>
                      <td className="align-right" style={{fontWeight:600}}>{fmt(a.balance)}</td>
                      <td>{a.exception !== 'None' ? <span className="dlm-exception-tag"><ShieldAlert size={10}/>{a.exception}</span> : '—'}</td>
                      <td><span className={`dlm-status-badge ${a.status}`}>{statusLabel(a.status)}</span></td>
                      <td><button className="btn btn-sm btn-secondary" onClick={e=>{e.stopPropagation();setSelectedId(a.id)}}><Eye size={12}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── FD Review ── */}
      {tab === 'fdreview' && !selectedId && (
        <div className="dlm-section">
          <div className="dlm-section-header"><div className="dlm-section-icon"><FileText size={18}/></div><h2>FD Review Queue — PD-CF Accounts</h2></div>
          <div className="dlm-section-body" style={{padding:0}}>
            <div className="dlm-table-wrapper" style={{border:'none'}}>
              <table className="dlm-table">
                <thead><tr><th>Account</th><th>Fund Source</th><th>Last Txn</th><th>Non-Op Years</th><th className="align-right">Balance</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {LAPSE_ACCOUNTS.filter(a=>a.status==='review').map(a => (
                    <tr key={a.id} className="row-clickable" onClick={()=>setSelectedId(a.id)}>
                      <td><div style={{fontWeight:600}}>{a.id}</div><div style={{fontSize:11,color:'var(--color-text-tertiary)'}}>{a.name}</div></td>
                      <td>{a.fund}</td><td>{a.lastTxn}</td><td style={{fontWeight:600,color:'var(--color-error)'}}>{a.years} years</td>
                      <td className="align-right" style={{fontWeight:600}}>{fmt(a.balance)}</td>
                      <td><span className="dlm-status-badge review"><Clock size={12}/> Pending FD Decision</span></td>
                      <td><button className="btn btn-sm btn-primary" onClick={e=>{e.stopPropagation();setSelectedId(a.id);setFdDecision('')}}>Review</button></td>
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
          <div className="dlm-section-header"><div className="dlm-section-icon"><FileText size={18}/></div><h2>FD Decision — {selected.id}</h2>
            <div className="dlm-section-header-actions"><button className="btn" onClick={()=>setSelectedId(null)}>← Back</button></div>
          </div>
          <div className="dlm-section-body">
            <div className="dlm-voucher-grid">
              <div className="dlm-voucher-item"><span className="dlm-voucher-label">Account</span><span className="dlm-voucher-value">{selected.id} — {selected.name}</span></div>
              <div className="dlm-voucher-item"><span className="dlm-voucher-label">Fund Source</span><span className="dlm-voucher-value">{selected.fund}</span></div>
              <div className="dlm-voucher-item"><span className="dlm-voucher-label">Last Transaction</span><span className="dlm-voucher-value">{selected.lastTxn}</span></div>
              <div className="dlm-voucher-item"><span className="dlm-voucher-label">Current Balance</span><span className="dlm-voucher-value" style={{color:'var(--color-primary)'}}>{fmt(selected.balance)}</span></div>
            </div>
            <div className="dlm-decision-panel">
              <div className="dlm-decision-title"><FileText size={18}/> FD Decision</div>
              <div className="dlm-radio-group">
                <label className={`dlm-radio-card ${fdDecision==='lapse'?'selected-lapse':''}`} onClick={()=>setFdDecision('lapse')}><input type="radio" checked={fdDecision==='lapse'} readOnly/><span style={{fontWeight:600}}>Approve Lapse</span></label>
                <label className={`dlm-radio-card ${fdDecision==='continue'?'selected-continue':''}`} onClick={()=>setFdDecision('continue')}><input type="radio" checked={fdDecision==='continue'} readOnly/><span style={{fontWeight:600}}>Continue Account</span></label>
              </div>
              <div className="grid-2-col">
                <div className="form-group"><label className="form-label">Decision Remarks <span className="required">*</span></label><input type="text" className="form-input" placeholder="Enter FD remarks..."/></div>
                {fdDecision==='continue' && <div className="form-group"><label className="form-label">Re-evaluation Year <span className="required">*</span></label><input type="number" className="form-input" placeholder="2027" min={2026}/></div>}
              </div>
              {fdDecision==='lapse' && (<>
                <hr className="dlm-divider"/>
                <div className="grid-2-col" style={{marginBottom:'var(--space-4)'}}>
                  <div className="form-group"><label className="form-label">Original Expenditure HoA <span className="required">*</span></label>
                    <select className="form-input"><option value="">Select HoA...</option><option>2202-01-101-0001</option><option>2215-02-800-0002</option></select></div>
                  <div className="form-group"><label className="form-label">Receipt HoA</label>
                    <select className="form-input"><option>0070-60-800 (Default)</option><option>0070-60-801</option></select></div>
                </div>
                <div className="grid-2-col">
                  <div className="form-group"><label className="form-label">FD-Approved Scheme <span className="required">*</span></label>
                    <select className="form-input"><option value="">Select Scheme...</option><option>SCH-LPS-2026-01</option></select></div>
                  <div className="form-group"><label className="form-label">Lapse Amount</label>
                    <input type="text" className="form-input" value={fmt(selected.balance)} disabled/></div>
                </div>
              </>)}
              <div style={{marginTop:'var(--space-4)',display:'flex',gap:'var(--space-3)'}}>
                <button className="btn btn-primary" disabled={!fdDecision} onClick={()=>{if(fdDecision==='lapse')setShowVoucher(true)}}><CheckCircle2 size={14}/> Submit FD Decision</button>
                <button className="btn btn-secondary" onClick={()=>setSelectedId(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Exception Accounts ── */}
      {tab === 'exception' && (
        <div className="dlm-section">
          <div className="dlm-section-header"><div className="dlm-section-icon"><ShieldAlert size={18}/></div><h2>Exception Accounts — Lapse Not Applicable</h2></div>
          <div className="dlm-section-body" style={{padding:0}}>
            <div className="dlm-table-wrapper" style={{border:'none'}}>
              <table className="dlm-table">
                <thead><tr><th>Account</th><th>Type</th><th>Department</th><th>Exception Category</th><th className="align-right">Balance</th><th>Status</th></tr></thead>
                <tbody>
                  {LAPSE_ACCOUNTS.filter(a=>a.status==='exception'||a.status==='excluded').map(a => (
                    <tr key={a.id}>
                      <td><div style={{fontWeight:600}}>{a.id}</div><div style={{fontSize:11,color:'var(--color-text-tertiary)'}}>{a.name}</div></td>
                      <td>{a.type}</td><td>{a.dept}</td>
                      <td><span className="dlm-exception-tag"><ShieldAlert size={10}/>{a.exception}</span></td>
                      <td className="align-right" style={{fontWeight:600}}>{fmt(a.balance)}</td>
                      <td><span className="dlm-status-badge exception">Lapse Not Applicable</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{padding:'var(--space-5)'}}>
            <div className="dlm-info-callout warning" style={{marginTop:0}}>
              <AlertCircle size={16}/><div>Exception accounts are <strong>permanently excluded</strong> from lapse processing. Land Acquisition & Jail PDs remain active indefinitely. Validity-based accounts are deferred until FD-defined end date.</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Audit Trail ── */}
      {tab === 'audit' && (
        <div className="dlm-section">
          <div className="dlm-section-header"><div className="dlm-section-icon"><Shield size={18}/></div><h2>Lapse Processing Audit Trail</h2></div>
          <div className="dlm-section-body">
            <div className="dlm-audit-timeline">
              {AUDIT_LOG.map((a,i) => (
                <div key={i} className={`dlm-audit-item ${a.type}`}>
                  <div className="dlm-audit-dot"/><div className="dlm-audit-title">{a.action}</div>
                  <div className="dlm-audit-meta">By {a.user} • {a.time}</div>
                  <div className="dlm-audit-detail">{a.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Voucher Modal */}
      {showVoucher && (
        <div className="dlm-modal-overlay" onClick={()=>setShowVoucher(false)}>
          <div className="dlm-modal-content" onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',alignItems:'center',gap:'var(--space-3)',marginBottom:'var(--space-4)'}}>
              <CheckCircle2 size={24} color="var(--color-success)"/><h3 style={{margin:0}}>Lapse Voucher Generated</h3>
            </div>
            <div className="dlm-voucher-grid">
              <div className="dlm-voucher-item"><span className="dlm-voucher-label">Voucher No.</span><span className="dlm-voucher-value">VCH-LP-2026-001</span></div>
              <div className="dlm-voucher-item"><span className="dlm-voucher-label">By-Transfer Challan</span><span className="dlm-voucher-value">BT-CH-2026-4421</span></div>
              <div className="dlm-voucher-item"><span className="dlm-voucher-label">Receipt HoA</span><span className="dlm-voucher-value">0070-60-800</span></div>
              <div className="dlm-voucher-item"><span className="dlm-voucher-label">Amount</span><span className="dlm-voucher-value" style={{color:'var(--color-success)'}}>{fmt(selected?.balance||0)}</span></div>
            </div>
            <div className="dlm-info-callout success" style={{marginBottom:'var(--space-4)'}}>
              <CheckCircle2 size={16}/><div>Challan auto-marked as <strong>Used/Consumed</strong>. Refund disabled. Account marked as <strong>Lapsed</strong>. AG intimation queued.</div>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:'var(--space-3)'}}>
              <button className="btn btn-secondary"><Download size={14}/> Download Voucher</button>
              <button className="btn btn-primary" onClick={()=>{setShowVoucher(false);setSelectedId(null)}}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
