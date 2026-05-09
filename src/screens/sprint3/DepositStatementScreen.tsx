import { useState } from 'react';
import {
  FileText, User, Building, Eye, Download, Printer, BookOpen,
  Filter, AlertCircle, ArrowUpRight,
  ArrowDownRight, Shield
} from 'lucide-react';
import './DepositStatementScreen.css';

const MOCK_ACCOUNTS = [
  { id: 'PD-82011', name: 'Urban Administration', type: 'PD', ddo: 'DDO-1001 / District Collector Office', operator: 'OPR-1001 / Ramesh Kumar', fund: 'Consolidated Fund' },
  { id: 'PD-49320', name: 'Rural Development', type: 'PD', ddo: 'DDO-1002 / Rural Dev. Dept.', operator: 'OPR-1002 / Suresh Patel', fund: 'Consolidated Fund' },
  { id: 'CCD-10293', name: 'Civil Suit Deposits', type: 'CCD', ddo: 'DDO-2001 / Civil Court', operator: 'OPR-2001 / Court Clerk', fund: 'Court Deposits' },
  { id: 'CrCD-83921', name: 'Bail Bonds', type: 'CrCD', ddo: 'DDO-3001 / Criminal Court', operator: 'OPR-3001 / Court Registrar', fund: 'Court Deposits' },
];

const MOCK_TRANSACTIONS = [
  { id: 'TXN-001', date: '2026-04-01', narration: 'Opening Balance B/F', ref: '—', credit: 0, debit: 0, balance: 5000000, type: 'opening' },
  { id: 'TXN-002', date: '2026-04-03', narration: 'Receipt — Cyber Treasury Challan #CT-4421', ref: 'CT-4421', credit: 250000, debit: 0, balance: 5250000, type: 'credit' },
  { id: 'TXN-003', date: '2026-04-07', narration: 'Payment — Vendor Payment to M/s ABC Infra', ref: 'PA-1120', credit: 0, debit: 180000, balance: 5070000, type: 'debit' },
  { id: 'TXN-004', date: '2026-04-10', narration: 'Receipt — By-Transfer from CF (BT-8821)', ref: 'BT-8821', credit: 500000, debit: 0, balance: 5570000, type: 'credit' },
  { id: 'TXN-005', date: '2026-04-14', narration: 'Payment — Sub-PD Withdrawal (SPD-BL-201)', ref: 'SPD-BL-201', credit: 0, debit: 120000, balance: 5450000, type: 'debit' },
  { id: 'TXN-006', date: '2026-04-18', narration: 'Receipt — Physical Challan Deposit', ref: 'CH-9932', credit: 350000, debit: 0, balance: 5800000, type: 'credit' },
  { id: 'TXN-007', date: '2026-04-22', narration: 'Payment — Works Deposit Transfer', ref: 'WD-3321', credit: 0, debit: 300000, balance: 5500000, type: 'debit' },
  { id: 'TXN-008', date: '2026-04-25', narration: 'Receipt — Inter-Deposit Transfer', ref: 'IDT-442', credit: 150000, debit: 0, balance: 5650000, type: 'credit' },
  { id: 'TXN-009', date: '2026-04-28', narration: 'Payment — Beneficiary Disbursement', ref: 'BEN-7721', credit: 0, debit: 200000, balance: 5450000, type: 'debit' },
];

export default function DepositStatementScreen() {
  const [statementType, setStatementType] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [txnType, setTxnType] = useState('all');
  const [outputFormat, setOutputFormat] = useState('pdf');
  const [generated, setGenerated] = useState(false);

  const account = MOCK_ACCOUNTS.find(a => a.id === selectedAccount);
  const fmt = (n: number) => '₹ ' + n.toLocaleString('en-IN');

  const filteredTxns = MOCK_TRANSACTIONS.filter(t => {
    if (txnType === 'receipt') return t.type === 'credit' || t.type === 'opening';
    if (txnType === 'payment') return t.type === 'debit' || t.type === 'opening';
    return true;
  });

  const totalCredit = MOCK_TRANSACTIONS.reduce((s, t) => s + t.credit, 0);
  const totalDebit = MOCK_TRANSACTIONS.reduce((s, t) => s + t.debit, 0);
  const closingBalance = MOCK_TRANSACTIONS[MOCK_TRANSACTIONS.length - 1]?.balance || 0;

  const handleGenerate = () => setGenerated(true);
  const handleReset = () => { setGenerated(false); setStatementType(''); setSelectedAccount(''); setFromDate(''); setToDate(''); setTxnType('all'); };

  return (
    <div className="dsp-screen animate-fade-in">
      <header>
        <h1>Deposit Account Statement / Passbook</h1>
        <p className="header-desc">Generate custom account statements and passbooks for Deposit Accounts with accurate reconciled balances.</p>
        <div className="dsp-header-badges">
          <span className="dsp-header-badge role"><User size={12} /> PD Operator / Treasury User</span>
          <span className="dsp-header-badge module"><Building size={12} /> Deposit Module → Reports</span>
          <span className="dsp-header-badge readonly"><Eye size={12} /> Read-Only View</span>
        </div>
      </header>

      {!generated ? (
        /* ─── Selection Form ─── */
        <div className="dsp-section">
          <div className="dsp-section-header">
            <div className="dsp-section-icon"><Filter size={18} /></div>
            <h2>Statement / Passbook Generation</h2>
          </div>
          <div className="dsp-section-body">
            <div className="grid-2-col dsp-form-row">
              <div className="form-group">
                <label className="form-label">Statement Type <span className="required">*</span></label>
                <select className="form-input" value={statementType} onChange={e => { setStatementType(e.target.value); }}>
                  <option value="">Select Type...</option>
                  <option value="custom">Custom Statement</option>
                  <option value="passbook">Passbook</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Deposit Account No. <span className="required">*</span></label>
                <select className="form-input" value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}>
                  <option value="">Select Account...</option>
                  {MOCK_ACCOUNTS.map(a => <option key={a.id} value={a.id}>{a.id} — {a.name} ({a.type})</option>)}
                </select>
                {selectedAccount && <span className="form-helper" style={{ color: 'var(--color-success)' }}>Account is Active & Accessible</span>}
              </div>
            </div>

            {statementType === 'custom' && (
              <>
                <div className="grid-2-col dsp-form-row">
                  <div className="form-group">
                    <label className="form-label">From Date <span className="required">*</span></label>
                    <input type="date" className="form-input" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">To Date <span className="required">*</span></label>
                    <input type="date" className="form-input" value={toDate} onChange={e => setToDate(e.target.value)} />
                  </div>
                </div>
                <div className="grid-2-col dsp-form-row">
                  <div className="form-group">
                    <label className="form-label">Transaction Type</label>
                    <select className="form-input" value={txnType} onChange={e => setTxnType(e.target.value)}>
                      <option value="all">All (Credit & Debit)</option>
                      <option value="receipt">Receipt (Credit only)</option>
                      <option value="payment">Payment (Debit only)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Purpose Code</label>
                    <select className="form-input"><option value="">All Purpose Codes</option><option>General Administration</option><option>Works Deposit</option></select>
                  </div>
                </div>
              </>
            )}

            <div className="grid-2-col dsp-form-row">
              <div className="form-group">
                <label className="form-label">Output Format <span className="required">*</span></label>
                <select className="form-input" value={outputFormat} onChange={e => setOutputFormat(e.target.value)}>
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                  <option value="doc">DOC</option>
                </select>
              </div>
            </div>

            <div className="dsp-info-callout info" style={{ marginTop: 0 }}>
              <AlertCircle size={16} />
              <div>Statements and passbooks are <strong>read-only views</strong>. No ledger or balance changes will occur. All generation actions are audit-logged.</div>
            </div>

            <div className="dsp-action-bar" style={{ borderTop: 'none', paddingTop: 'var(--space-4)' }}>
              <div className="dsp-action-bar-left">
                <button className="btn btn-secondary" onClick={handleReset}>Reset</button>
              </div>
              <div className="dsp-action-bar-right">
                <button className="btn btn-primary" disabled={!statementType || !selectedAccount || (statementType === 'custom' && (!fromDate || !toDate))} onClick={handleGenerate}>
                  <FileText size={14} /> Generate {statementType === 'passbook' ? 'Passbook' : 'Statement'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ─── Generated Passbook / Statement View ─── */
        <>
          <div className="dsp-section" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="dsp-section-header">
              <div className="dsp-section-icon"><BookOpen size={18} /></div>
              <h2>{statementType === 'passbook' ? 'Passbook' : 'Custom Statement'} — {selectedAccount}</h2>
              <div className="dsp-section-header-actions">
                <button className="btn" onClick={handleReset}>← New Query</button>
                <button className="btn"><Download size={14} /> Download ({outputFormat.toUpperCase()})</button>
                <button className="btn"><Printer size={14} /> Print</button>
              </div>
            </div>
          </div>

          <div className="dsp-passbook">
            <div className="dsp-passbook-header">
              <div className="dsp-passbook-title">IFMIS Next Gen — Deposit Account {statementType === 'passbook' ? 'Passbook' : 'Statement'}</div>
              <div className="dsp-passbook-subtitle">
                Period: {statementType === 'custom' ? `${fromDate} to ${toDate}` : 'Complete Transaction History'} &nbsp;|&nbsp; Generated by: Admin-T01 (Deposit Administrator)
              </div>
            </div>

            <div className="dsp-passbook-meta">
              <div className="dsp-meta-item"><span className="dsp-meta-label">Account Number</span><span className="dsp-meta-value">{selectedAccount}</span></div>
              <div className="dsp-meta-item"><span className="dsp-meta-label">Account Type</span><span className="dsp-meta-value">{account?.type} — {account?.name}</span></div>
              <div className="dsp-meta-item"><span className="dsp-meta-label">Fund Source</span><span className="dsp-meta-value">{account?.fund}</span></div>
              <div className="dsp-meta-item"><span className="dsp-meta-label">DDO Code / Name</span><span className="dsp-meta-value">{account?.ddo}</span></div>
              <div className="dsp-meta-item"><span className="dsp-meta-label">Operator Code / Name</span><span className="dsp-meta-value">{account?.operator}</span></div>
              <div className="dsp-meta-item"><span className="dsp-meta-label">Opening Balance</span><span className="dsp-meta-value" style={{ color: 'var(--color-primary)' }}>{fmt(5000000)}</span></div>
            </div>

            <div className="dsp-table-wrapper">
              <table className="dsp-table">
                <thead>
                  <tr>
                    <th>Date</th><th>Narration</th><th>Reference</th>
                    <th className="align-right">Credit (₹)</th>
                    <th className="align-right">Debit (₹)</th>
                    <th className="align-right">Balance (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTxns.map(t => (
                    <tr key={t.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{t.date}</td>
                      <td>{t.narration}</td>
                      <td style={{ fontWeight: 500 }}>{t.ref}</td>
                      <td className="align-right">{t.credit > 0 ? <span className="credit-cell"><ArrowDownRight size={12} style={{ verticalAlign: 'middle' }} /> {fmt(t.credit)}</span> : '—'}</td>
                      <td className="align-right">{t.debit > 0 ? <span className="debit-cell"><ArrowUpRight size={12} style={{ verticalAlign: 'middle' }} /> {fmt(t.debit)}</span> : '—'}</td>
                      <td className="align-right balance-cell">{fmt(t.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="dsp-passbook-footer">
              <div className="dsp-closing-balance">
                <span className="dsp-closing-label">Closing Balance</span>
                <span className="dsp-closing-value">{fmt(closingBalance)}</span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>Total Credits</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-success)' }}>{fmt(totalCredit)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>Total Debits</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-error)' }}>{fmt(totalDebit)}</div>
                </div>
              </div>
            </div>

            <div className="dsp-generated-stamp">
              Generated on {new Date().toLocaleDateString('en-IN')} at {new Date().toLocaleTimeString('en-IN')} by Admin-T01 (Deposit Administrator) &nbsp;|&nbsp; <Shield size={10} style={{ verticalAlign: 'middle' }} /> Audit Logged
            </div>
          </div>
        </>
      )}
    </div>
  );
}
