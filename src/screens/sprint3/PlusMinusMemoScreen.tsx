import { useState } from 'react';
import {
  FileText, Bell, Shield, ClipboardCheck, Calendar, Building,
  User, CheckCircle2, AlertCircle, Download,
  Lock, Filter,
  Clock, ShieldAlert
} from 'lucide-react';
import './PlusMinusMemoScreen.css';

/* ── Mock Data ── */
const MOCK_MEMOS = [
  { id: 'PMM-2026-001', account: 'PD-82011', name: 'Urban Administration', hoa: '8443-00-106-0001', type: 'PD', period: 'Apr 2026', opening: 5000000, receipts: 1250000, payments: 800000, closing: 5450000, status: 'certified', certifiedBy: 'Admin-T01', certifiedAt: '2026-04-30 17:45' },
  { id: 'PMM-2026-002', account: 'PD-49320', name: 'Rural Development', hoa: '8443-00-111-0001', type: 'PD', period: 'Apr 2026', opening: 12000000, receipts: 3200000, payments: 2100000, closing: 13100000, status: 'pending', certifiedBy: '', certifiedAt: '' },
  { id: 'PMM-2026-003', account: 'CCD-10293', name: 'Civil Suit Deposits', hoa: '8443-00-113-0001', type: 'CCD', period: 'Apr 2026', opening: 800000, receipts: 150000, payments: 50000, closing: 900000, status: 'pending', certifiedBy: '', certifiedAt: '' },
  { id: 'PMM-2026-004', account: 'CrCD-83921', name: 'Bail Bonds', hoa: '8443-00-114-0001', type: 'CrCD', period: 'Mar 2026', opening: 450000, receipts: 120000, payments: 90000, closing: 480000, status: 'certified', certifiedBy: 'Admin-T01', certifiedAt: '2026-03-31 16:30' },
];

const MOCK_NOTIFICATIONS = [
  { id: 'N1', title: 'Plus–Minus Memo Generated', text: 'Monthly memo for PD-49320 (Apr 2026) is ready for certification.', time: '2 hours ago', unread: true },
  { id: 'N2', title: 'Certification Pending', text: 'CCD-10293 closing balance requires your certification before transactions can resume.', time: '3 hours ago', unread: true },
  { id: 'N3', title: 'Memo Certified', text: 'PD-82011 (Apr 2026) certified successfully. Transactions enabled.', time: '1 day ago', unread: false },
];

const MOCK_AUDIT = [
  { id: 'A1', action: 'Plus–Minus Memo Generated', detail: 'System auto-generated HoA-wise & Operator-wise memo for Apr 2026', user: 'System', time: '30 Apr 2026, 23:59', type: 'info' },
  { id: 'A2', action: 'Notification Sent', detail: 'Alert sent to Deposit Admin for PD-82011 certification', user: 'System', time: '01 May 2026, 00:01', type: 'info' },
  { id: 'A3', action: 'Closing Balance Certified', detail: 'No discrepancy confirmed for PD-82011 (Apr 2026)', user: 'Admin-T01', time: '01 May 2026, 09:45', type: 'success' },
  { id: 'A4', action: 'Transactions Enabled', detail: 'PD-82011 unblocked after certification', user: 'System', time: '01 May 2026, 09:45', type: 'success' },
  { id: 'A5', action: 'Override Applied', detail: 'Emergency override for CrCD-83921 — Reason: Court order compliance', user: 'CTA-Admin', time: '28 Apr 2026, 14:20', type: 'warning' },
];

const OPERATOR_WISE_DATA = [
  { operatorNo: 'ED/270/0204/9', operatorName: 'PRI GOVT GIRLS COLLEGE NEEMUCH', schemeCode: '105', opening: '43,81,265', receipt: '0', receiptOther: '0', total: '43,81,265', payment: '57,561', givenOther: '0', closing: '43,23,704' },
  { operatorNo: 'ED/270/0822/017', operatorName: 'PRINCIPAL GOVT PG COLLEGE RAMPURA', schemeCode: '105', opening: '17,05,224', receipt: '0', receiptOther: '1,74,117', total: '18,79,341', payment: '0', givenOther: '0', closing: '18,79,341' },
  { operatorNo: 'PD/270/0204/6', operatorName: 'SUPDT SUB JAIL NEEMUCH', schemeCode: '104', opening: '38,41,228', receipt: '1,02,304', receiptOther: '0', total: '39,43,532', payment: '0', givenOther: '0', closing: '39,43,532' },
  { operatorNo: 'PD/270/0822/2064', operatorName: 'PRINCIPAL GOVT POLYTECHNIC JAWAD', schemeCode: '104', opening: '8,39,392', receipt: '0', receiptOther: '0', total: '8,39,392', payment: '62,092', givenOther: '0', closing: '7,77,300' },
  { operatorNo: 'PD/270/1103/2', operatorName: 'RENT CONTROL OFFICER NEEMUCH', schemeCode: '104', opening: '4,34,296', receipt: '0', receiptOther: '30', total: '4,34,326', payment: '0', givenOther: '0', closing: '4,34,326' }
];

const HOA_WISE_DATA = [
  { sNo: 1, accountNo: 'PD-82011', purposeCode: '105', opening: '50,00,000', receiptChallan: '10,00,000', receiptWorks: '2,50,000', receiptOther: '0', total: '62,50,000', transferWorks: '1,00,000', transferOther: '0', payments: '7,00,000', totalPayments: '8,00,000', closing: '54,50,000', remarks: '' },
  { sNo: 2, accountNo: 'PD-49320', purposeCode: '104', opening: '1,20,00,000', receiptChallan: '30,00,000', receiptWorks: '2,00,000', receiptOther: '0', total: '1,52,00,000', transferWorks: '5,00,000', transferOther: '0', payments: '16,00,000', totalPayments: '21,00,000', closing: '1,31,00,000', remarks: '' }
];

type TabId = 'memo' | 'notifications' | 'audit';

export default function PlusMinusMemoScreen() {
  const [activeTab, setActiveTab] = useState<TabId>('memo');
  const [reportType, setReportType] = useState('');
  const [accountType, setAccountType] = useState('');
  const [depositAccountNo, setDepositAccountNo] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  const [certHoa, setCertHoa] = useState(false);
  const [certOp, setCertOp] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideAccount, setOverrideAccount] = useState('');

  const pendingCount = MOCK_MEMOS.filter(m => m.status === 'pending').length;
  const certifiedCount = MOCK_MEMOS.filter(m => m.status === 'certified').length;
  const unreadNotifs = MOCK_NOTIFICATIONS.filter(n => n.unread).length;


  const tabs: { id: TabId; label: string; icon: any; count?: number }[] = [
    { id: 'memo', label: 'Plus–Minus Memo', icon: FileText, count: pendingCount },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadNotifs },
    { id: 'audit', label: 'Audit Trail', icon: Shield },
  ];



  const handleReset = () => {
    setReportType('');
    setAccountType('');
    setDepositAccountNo('');
    setFromDate('');
    setToDate('');
    setHasGenerated(false);
  };

  return (
    <div className="pmm-screen animate-fade-in">
      <header>
        <h1>Plus–Minus Memo & Certification</h1>
        <p className="header-desc">
          Generate Plus–Minus Memo reports, certify closing balances, and manage transaction controls for Deposit Accounts.
        </p>
        <div className="pmm-header-badges">
          <span className="pmm-header-badge role"><User size={12} /> Deposit Administrator</span>
          <span className="pmm-header-badge module"><Building size={12} /> Deposit Module</span>
          <span className="pmm-header-badge period"><Calendar size={12} /> FY 2026-27</span>
        </div>
      </header>

      {/* Stats */}
      <div className="pmm-stats-grid">
        <div className="pmm-stat-card primary">
          <div className="pmm-stat-icon primary"><FileText size={20} /></div>
          <div className="pmm-stat-info"><span className="pmm-stat-value">{MOCK_MEMOS.length}</span><span className="pmm-stat-label">Total Memos</span></div>
        </div>
        <div className="pmm-stat-card success">
          <div className="pmm-stat-icon success"><CheckCircle2 size={20} /></div>
          <div className="pmm-stat-info"><span className="pmm-stat-value">{certifiedCount}</span><span className="pmm-stat-label">Certified</span></div>
        </div>
        <div className="pmm-stat-card warning">
          <div className="pmm-stat-icon warning"><Clock size={20} /></div>
          <div className="pmm-stat-info"><span className="pmm-stat-value">{pendingCount}</span><span className="pmm-stat-label">Pending Certification</span></div>
        </div>
        <div className="pmm-stat-card error">
          <div className="pmm-stat-icon error"><Lock size={20} /></div>
          <div className="pmm-stat-info"><span className="pmm-stat-value">{pendingCount}</span><span className="pmm-stat-label">Accounts Blocked</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="pmm-tabs">
        {tabs.map(t => (
          <button key={t.id} className={`pmm-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            <t.icon size={16} />
            {t.label}
            {t.count != null && t.count > 0 && <span className="pmm-tab-count">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* ─── TAB: Plus-Minus Memo Flow ─── */}
      {activeTab === 'memo' && (
        <>
          <div className="pmm-section">
            <div className="pmm-section-header">
              <div className="pmm-section-icon"><Filter size={18} /></div>
              <h2>Generate Plus–Minus Memo (On-Demand)</h2>
            </div>
            <div className="pmm-section-body" style={{ paddingBottom: 'var(--space-4)' }}>
              <div className="pmm-info-callout info" style={{ marginTop: 0, marginBottom: 'var(--space-4)' }}>
                <AlertCircle size={16} />
                <div><strong>Auto-Generation:</strong> The system automatically generates HoA-wise and Operator-wise Plus–Minus Memos on the last date of every month for all active Deposit Accounts.</div>
              </div>
              <div className="grid-4-col pmm-form-row">
                <div className="form-group">
                  <label className="form-label">Report Type <span className="required">*</span></label>
                  <select className="form-input" value={reportType} onChange={e => setReportType(e.target.value)}>
                    <option value="">Select...</option>
                    <option value="hoa">HoA-wise</option>
                    <option value="operator">Operator-wise</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Account Type <span className="required">*</span></label>
                  <select className="form-input" value={accountType} onChange={e => setAccountType(e.target.value)}>
                    <option value="">Select...</option>
                    <option value="PD">PD</option>
                    <option value="CCD">CCD</option>
                    <option value="CrCD">CrCD</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Deposit Account Number <span className="required">*</span></label>
                  <select className="form-input" value={depositAccountNo} onChange={e => setDepositAccountNo(e.target.value)}>
                    <option value="">Select...</option>
                    <option value="PD-82011">PD-82011</option>
                    <option value="PD-49320">PD-49320</option>
                    <option value="CCD-10293">CCD-10293</option>
                    <option value="CrCD-83921">CrCD-83921</option>
                  </select>
                </div>
                {reportType === 'hoa' ? (
                  <div className="form-group">
                    <label className="form-label">HoA <span className="required">*</span></label>
                    <select className="form-input"><option value="">Select...</option><option>8443-00-106-0001</option><option>8443-00-111-0001</option><option>8443-00-113-0001</option></select>
                  </div>
                ) : reportType === 'operator' ? (
                  <div className="form-group">
                    <label className="form-label">Operator ID <span className="required">*</span></label>
                    <select className="form-input"><option value="">Select...</option><option>OPR-1001</option><option>OPR-1002</option></select>
                  </div>
                ) : <div className="form-group"></div>}
              </div>
              
              <div className="grid-4-col pmm-form-row">
                <div className="form-group">
                  <label className="form-label">From Date <span className="required">*</span></label>
                  <input type="date" className="form-input" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">To Date <span className="required">*</span></label>
                  <input type="date" className="form-input" value={toDate} onChange={e => setToDate(e.target.value)} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                  <button className="btn btn-secondary" onClick={handleReset}>Reset</button>
                  <button className="btn btn-primary" disabled={!reportType || !accountType || !depositAccountNo || !fromDate || !toDate} onClick={() => setHasGenerated(true)}>
                    <FileText size={14} /> Generate Memo
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ─── HoA-wise Memo Report Format (MPTC-33) ─── */}
          {hasGenerated && reportType !== 'operator' && (
            <div className="pmm-section" style={{ marginTop: 'var(--space-6)' }}>
              <div className="pmm-section-header">
                <div className="pmm-section-icon"><FileText size={18} /></div>
                <h2>HoA-wise Plus–Minus Memo (MPTC- 33)</h2>
                <div className="pmm-section-header-actions">
                  <button className="btn"><Download size={14} /> Download PDF</button>
                </div>
              </div>
              <div className="pmm-section-body" style={{ background: '#f8fafc', padding: 'var(--space-6)' }}>
                <div style={{ background: '#fff', padding: '40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderRadius: '4px', maxWidth: '100%', overflowX: 'auto', margin: '0 auto', color: '#111', fontFamily: 'serif' }}>
                  
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '60px', height: '60px', borderRadius: '50%', border: '2px solid #888', marginBottom: '10px' }}>
                      {/* Placeholder for MP Emblem */}
                      <span style={{ fontSize: '10px', fontWeight: 'bold' }}>MP</span>
                    </div>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px 0' }}>FROM MPTC- 33</h2>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', fontStyle: 'italic', margin: '0 0 20px 0' }}>[See Subsidiary Rule 331, 347, 353, 357, 358, 375, 386 and 388]</h3>
                  </div>

                  <div style={{ marginBottom: '30px', fontSize: '14px', fontWeight: 'bold', lineHeight: '1.8' }}>
                    <div>Plus-Minus Memorandum of (Type of Deposit: <span style={{ borderBottom: '1px dotted #000' }}>{accountType || '........'}</span>) for the month of <span style={{ borderBottom: '1px dotted #000' }}>{fromDate ? new Date(fromDate).toLocaleString('default', { month: 'long', year: 'numeric' }) : '................'}</span></div>
                    <div>Treasury Code and Name: <span style={{ borderBottom: '1px dotted #000' }}>270 - Neemuch District Treasury</span></div>
                    <div>Head of Accounts: <span style={{ borderBottom: '1px dotted #000' }}>8443-00-106-0001</span></div>
                  </div>

                  <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '12px', marginBottom: '8px' }}>
                    All the amounts in (₹)
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center' }}>
                    <thead>
                      <tr style={{ border: '1px solid #000' }}>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', fontWeight: 'bold' }}>S.N.</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', fontWeight: 'bold' }}>Deposit Account Number</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', fontWeight: 'bold' }}>Deposit Purpose Code</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', fontWeight: 'bold' }}>Opening balance</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', fontWeight: 'bold' }}>Receipts in the month through Challan/<br/>By transfer</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', fontWeight: 'bold' }}>Transfer received from Works Deposit Account</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', fontWeight: 'bold' }}>Transfer received from other Deposit Account</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', fontWeight: 'bold' }}>Total<br/>(4+5+6+7)</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', fontWeight: 'bold' }}>Transfer to Works Deposit Account</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', fontWeight: 'bold' }}>Transfer to other Deposit Account</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', fontWeight: 'bold' }}>Payments</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', fontWeight: 'bold' }}>Total Payments<br/>(9+10+11)</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', fontWeight: 'bold' }}>Closing balances<br/>(8-12)</th>
                        <th style={{ border: '1px solid #000', padding: '6px 4px', fontWeight: 'bold' }}>Remarks</th>
                      </tr>
                      <tr style={{ border: '1px solid #000', fontWeight: 'bold', background: '#f5f5f5' }}>
                        <td style={{ border: '1px solid #000', padding: '4px' }}>1</td>
                        <td style={{ border: '1px solid #000', padding: '4px' }}>2</td>
                        <td style={{ border: '1px solid #000', padding: '4px' }}>3</td>
                        <td style={{ border: '1px solid #000', padding: '4px' }}>4</td>
                        <td style={{ border: '1px solid #000', padding: '4px' }}>5</td>
                        <td style={{ border: '1px solid #000', padding: '4px' }}>6</td>
                        <td style={{ border: '1px solid #000', padding: '4px' }}>7</td>
                        <td style={{ border: '1px solid #000', padding: '4px' }}>8</td>
                        <td style={{ border: '1px solid #000', padding: '4px' }}>9</td>
                        <td style={{ border: '1px solid #000', padding: '4px' }}>10</td>
                        <td style={{ border: '1px solid #000', padding: '4px' }}>11</td>
                        <td style={{ border: '1px solid #000', padding: '4px' }}>12</td>
                        <td style={{ border: '1px solid #000', padding: '4px' }}>13</td>
                        <td style={{ border: '1px solid #000', padding: '4px' }}>14</td>
                      </tr>
                    </thead>
                    <tbody>
                      {HOA_WISE_DATA.map((r, i) => (
                        <tr key={i} style={{ border: '1px solid #000' }}>
                          <td style={{ border: '1px solid #000', padding: '6px 4px' }}>{r.sNo}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'left', fontWeight: 'bold' }}>{r.accountNo}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px' }}>{r.purposeCode}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right' }}>{r.opening}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right' }}>{r.receiptChallan}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right' }}>{r.receiptWorks}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right' }}>{r.receiptOther}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right', fontWeight: 'bold' }}>{r.total}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right' }}>{r.transferWorks}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right' }}>{r.transferOther}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right' }}>{r.payments}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right', fontWeight: 'bold' }}>{r.totalPayments}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right', fontWeight: 'bold' }}>{r.closing}</td>
                          <td style={{ border: '1px solid #000', padding: '6px 4px' }}>{r.remarks}</td>
                        </tr>
                      ))}
                      {/* Empty rows to match the screenshot spacing */}
                      {[...Array(2)].map((_, i) => (
                        <tr key={`empty-${i}`} style={{ border: '1px solid #000', height: '40px' }}>
                          <td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td>
                          <td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td>
                          <td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td>
                          <td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td>
                          <td style={{ border: '1px solid #000' }}></td><td style={{ border: '1px solid #000' }}></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ marginTop: '80px', textAlign: 'right', fontWeight: 'bold', fontSize: '16px', paddingRight: '40px' }}>
                    Treasury Officer
                  </div>
                </div>

                {/* HoA-wise Certification Panel added below the report */}
                <div className="pmm-certification-panel" style={{ marginTop: 'var(--space-6)' }}>
                  <div className="pmm-certification-title"><ClipboardCheck size={18} /> HoA-wise Closing Balance Certification</div>
                  <div className="pmm-checkbox-group">
                    <label className={`pmm-checkbox-item ${certHoa ? 'checked' : ''}`}>
                      <input type="checkbox" checked={certHoa} onChange={e => setCertHoa(e.target.checked)} />
                      <span>I confirm there is <strong>no discrepancy</strong> in the HoA-wise Plus–Minus Memo closing balance.</span>
                    </label>
                  </div>
                  <div className="grid-2-col">
                    <div className="form-group"><label className="form-label">Remarks</label><input type="text" className="form-input" placeholder="Enter certification remarks (optional)" /></div>
                  </div>
                  <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)' }}>
                    <button className="btn btn-primary" disabled={!certHoa}><CheckCircle2 size={14} /> Certify Closing Balance</button>
                    <button className="btn btn-secondary" onClick={() => setShowOverride(true)}><ShieldAlert size={14} /> Request Override</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Operator-wise Memo Report Format ─── */}
          {hasGenerated && reportType === 'operator' && (
            <div className="pmm-section" style={{ marginTop: 'var(--space-6)' }}>
              <div className="pmm-section-header">
                <div className="pmm-section-icon"><FileText size={18} /></div>
                <h2>Operator-wise Plus–Minus Memo</h2>
                <div className="pmm-section-header-actions">
                  <button className="btn"><Download size={14} /> Download PDF</button>
                </div>
              </div>
              <div className="pmm-section-body" style={{ background: '#f8fafc', padding: 'var(--space-6)' }}>
                <div style={{ background: '#fff', padding: '40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderRadius: '4px', maxWidth: '1000px', margin: '0 auto', color: '#111', fontFamily: 'serif' }}>
                  
                  <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Govt. Of Madhya Pradesh</h2>
                    <h3 style={{ fontSize: '16px', fontWeight: 'normal', margin: 0 }}>Neemuch District Treasury</h3>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderTop: '2px solid #000', borderBottom: '1px solid #000' }}>
                        <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 'bold', width: '14%' }}>आरंभिक राशि<br/>(A)</th>
                        <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 'bold', width: '14%' }}>प्राप्त राशि<br/>(B)</th>
                        <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 'bold', width: '16%' }}>कार्यों एवं अन्य पीडी<br/>से प्राप्ति (C)</th>
                        <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 'bold', width: '14%' }}>कुल<br/>(Total)</th>
                        <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 'bold', width: '14%' }}>भुगतान राशि<br/>(E)</th>
                        <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 'bold', width: '14%' }}>अन्य पीडी को दिया<br/>(F)</th>
                        <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 'bold', width: '14%' }}>अंतिम शेष<br/>(Closing)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {OPERATOR_WISE_DATA.map((row, idx) => (
                        <div style={{ display: 'contents' }} key={idx}>
                          <tr style={{ borderTop: idx > 0 ? '1px dashed #ccc' : 'none' }}>
                            <td colSpan={3} style={{ padding: '12px 4px 4px 4px' }}>
                              <span style={{ color: '#555' }}>ऑपरेटर संख्या:</span> <span style={{ fontWeight: 'bold' }}>{row.operatorNo}</span>
                            </td>
                            <td colSpan={4} style={{ padding: '12px 4px 4px 4px' }}>
                              <span style={{ color: '#555' }}>ऑपरेटर का नाम:</span> <span style={{ fontWeight: 'bold' }}>{row.operatorName}</span>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={7} style={{ padding: '0 4px 8px 4px' }}>
                              <span style={{ color: '#555' }}>स्कीम कोड:</span> <span style={{ fontWeight: 'bold' }}>{row.schemeCode}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '4px', textAlign: 'right' }}>{row.opening}</td>
                            <td style={{ padding: '4px', textAlign: 'right' }}>{row.receipt}</td>
                            <td style={{ padding: '4px', textAlign: 'right' }}>{row.receiptOther}</td>
                            <td style={{ padding: '4px', textAlign: 'right' }}>{row.total}</td>
                            <td style={{ padding: '4px', textAlign: 'right' }}>{row.payment}</td>
                            <td style={{ padding: '4px', textAlign: 'right' }}>{row.givenOther}</td>
                            <td style={{ padding: '4px', textAlign: 'right' }}>{row.closing}</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #000' }}>
                            <td colSpan={3} style={{ padding: '4px 4px 12px 4px', textAlign: 'right' }}>
                              <span style={{ color: '#555' }}>ऑपरेटर संख्या:</span> <span style={{ fontWeight: 'bold' }}>{row.operatorNo}</span>
                            </td>
                            <td colSpan={4} style={{ padding: '4px 4px 12px 4px', textAlign: 'left', paddingLeft: '20px' }}>
                              <span style={{ color: '#555' }}>के लिये कुल अंतिम शेष ::</span> <span style={{ fontWeight: 'bold', marginLeft: '8px' }}>{row.closing}</span>
                            </td>
                          </tr>
                        </div>
                      ))}
                    </tbody>
                  </table>
                  
                  <div style={{ marginTop: '40px', fontSize: '11px', color: '#555', display: 'flex', justifyContent: 'space-between' }}>
                    <div>उपयोगकर्ता : {overrideAccount || 'Treasury Officer'} | समय : 10/01/2026 04:36 PM</div>
                    <div>पृष्ठ 1 / 1</div>
                  </div>
                </div>
                
                {/* Operator-wise Certification Panel added below the report */}
                <div className="pmm-certification-panel" style={{ marginTop: 'var(--space-6)' }}>
                  <div className="pmm-certification-title"><ClipboardCheck size={18} /> Operator-wise Closing Balance Certification</div>
                  <div className="pmm-checkbox-group">
                    <label className={`pmm-checkbox-item ${certOp ? 'checked' : ''}`}>
                      <input type="checkbox" checked={certOp} onChange={e => setCertOp(e.target.checked)} />
                      <span>I confirm there is <strong>no discrepancy</strong> in the Operator-wise Plus–Minus Memo closing balance.</span>
                    </label>
                  </div>
                  <div className="grid-2-col">
                    <div className="form-group"><label className="form-label">Remarks</label><input type="text" className="form-input" placeholder="Enter certification remarks (optional)" /></div>
                  </div>
                  <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)' }}>
                    <button className="btn btn-primary" disabled={!certOp}><CheckCircle2 size={14} /> Certify Closing Balance</button>
                    <button className="btn btn-secondary" onClick={() => setShowOverride(true)}><ShieldAlert size={14} /> Request Override</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── TAB: Notifications ─── */}
      {activeTab === 'notifications' && (
        <div className="pmm-section">
          <div className="pmm-section-header">
            <div className="pmm-section-icon"><Bell size={18} /></div>
            <h2>Certification Notifications</h2>
          </div>
          <div className="pmm-section-body">
            <div className="pmm-notification-list">
              {MOCK_NOTIFICATIONS.map(n => (
                <div key={n.id} className={`pmm-notification-item ${n.unread ? 'unread' : ''}`}>
                  <div className="pmm-notification-icon"><Bell size={16} /></div>
                  <div className="pmm-notification-content">
                    <div className="pmm-notification-title">{n.title}</div>
                    <div className="pmm-notification-text">{n.text}</div>
                  </div>
                  <div className="pmm-notification-time">{n.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: Audit Trail ─── */}
      {activeTab === 'audit' && (
        <div className="pmm-section">
          <div className="pmm-section-header">
            <div className="pmm-section-icon"><Shield size={18} /></div>
            <h2>Audit Trail & Logging</h2>
          </div>
          <div className="pmm-section-body">
            <div className="pmm-audit-timeline">
              {MOCK_AUDIT.map(a => (
                <div key={a.id} className={`pmm-audit-item ${a.type}`}>
                  <div className="pmm-audit-dot" />
                  <div className="pmm-audit-title">{a.action}</div>
                  <div className="pmm-audit-meta">By {a.user} • {a.time}</div>
                  <div className="pmm-audit-detail">{a.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Override Modal */}
      {showOverride && (
        <div className="pmm-modal-overlay" onClick={() => setShowOverride(false)}>
          <div className="pmm-modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <ShieldAlert size={24} color="var(--color-accent)" />
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Authorized Override</h3>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6, marginBottom: 'var(--space-5)' }}>
              Apply an override to enable transactions on an uncertified Deposit Account. This action requires authorization and will be fully logged.
            </p>
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">Account <span className="required">*</span></label>
              <select className="form-input" value={overrideAccount} onChange={e => setOverrideAccount(e.target.value)}>
                <option value="">Select Account...</option>
                {MOCK_MEMOS.filter(m => m.status === 'pending').map(m => <option key={m.id} value={m.account}>{m.account} — {m.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
              <label className="form-label">Override Reason <span className="required">*</span></label>
              <input type="text" className="form-input" value={overrideReason} onChange={e => setOverrideReason(e.target.value)} placeholder="Enter reason for override..." />
            </div>
            <div className="pmm-info-callout warning" style={{ marginTop: 0, marginBottom: 'var(--space-4)' }}>
              <AlertCircle size={16} />
              <div>Override details (user, reason, timestamp) will be recorded in the audit trail.</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button className="btn btn-secondary" onClick={() => setShowOverride(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={!overrideAccount || !overrideReason} onClick={() => setShowOverride(false)}>Apply Override</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
