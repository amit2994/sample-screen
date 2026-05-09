import { useState } from 'react';
import {
  FileText, User, Building, Eye, Download, Printer, BookOpen,
  Filter, AlertCircle
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
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedHoa, setSelectedHoa] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [outputFormat, setOutputFormat] = useState('pdf');
  const [generated, setGenerated] = useState(false);

  const account = MOCK_ACCOUNTS.find(a => a.id === selectedAccount);
  const fmt = (n: number) => '₹ ' + n.toLocaleString('en-IN');

  const filteredTxns = MOCK_TRANSACTIONS.filter(t => t.type !== 'opening');
  const openingTxn = MOCK_TRANSACTIONS.find(t => t.type === 'opening');


  const closingBalance = MOCK_TRANSACTIONS[MOCK_TRANSACTIONS.length - 1]?.balance || 0;

  const handleGenerate = () => setGenerated(true);
  const handleReset = () => { setGenerated(false); setSelectedAccount(''); setSelectedHoa(''); setFromDate(''); setToDate(''); };

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
            <div className="grid-3-col dsp-form-row">
              <div className="form-group">
                <label className="form-label">Deposit Account No. <span className="required">*</span></label>
                <select className="form-input" value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}>
                  <option value="">Select Account...</option>
                  {MOCK_ACCOUNTS.map(a => <option key={a.id} value={a.id}>{a.id} — {a.name} ({a.type})</option>)}
                </select>
                {selectedAccount && <span className="form-helper" style={{ color: 'var(--color-success)' }}>Account is Active & Accessible</span>}
              </div>
              <div className="form-group">
                <label className="form-label">HoA</label>
                <select className="form-input" value={selectedHoa} onChange={e => setSelectedHoa(e.target.value)}>
                  <option value="">Select HoA...</option>
                  <option value="8443-00-106-0001">8443-00-106-0001</option>
                  <option value="8443-00-111-0001">8443-00-111-0001</option>
                  <option value="8443-00-113-0001">8443-00-113-0001</option>
                  <option value="8443-00-114-0001">8443-00-114-0001</option>
                </select>
              </div>
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

            <div className="dsp-info-callout info" style={{ marginTop: 0 }}>
              <AlertCircle size={16} />
              <div>Statements and passbooks are <strong>read-only views</strong>. No ledger or balance changes will occur. All generation actions are audit-logged.</div>
            </div>

            <div className="dsp-action-bar" style={{ borderTop: 'none', paddingTop: 'var(--space-4)' }}>
              <div className="dsp-action-bar-left">
                <button className="btn btn-secondary" onClick={handleReset}>Reset</button>
              </div>
              <div className="dsp-action-bar-right">
                <button className="btn btn-primary" disabled={!selectedAccount || !fromDate || !toDate} onClick={handleGenerate}>
                  <FileText size={14} /> Generate Passbook
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
              <h2>Passbook — {selectedAccount}</h2>
              <div className="dsp-section-header-actions">
                <button className="btn" onClick={handleReset}>← New Query</button>
                <button className="btn"><Download size={14} /> Download ({outputFormat.toUpperCase()})</button>
                <button className="btn"><Printer size={14} /> Print</button>
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderRadius: '4px', maxWidth: '100%', overflowX: 'auto', margin: '0 auto', color: '#111', fontFamily: 'serif' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '60px', height: '60px', borderRadius: '50%', border: '2px solid #888', marginBottom: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: 'bold' }}>MP</span>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px 0' }}>FORM M.P.T.C. – 36</h2>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 20px 0' }}>(See Subsidiary Rule 346, 356 & 357)</h3>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 20px 0' }}>Deposit Account Passbook</h2>
            </div>

            <div style={{ marginBottom: '30px', fontSize: '14px', lineHeight: '2.5' }}>
              <div>Treasury Code and Name................................<span style={{ fontWeight: 'bold', paddingLeft: '8px' }}>270 - Neemuch District Treasury</span></div>
              <div>DDO Code and Name.......................................<span style={{ fontWeight: 'bold', paddingLeft: '8px' }}>{account?.ddo}</span></div>
              <div>Deposit Account Number and Operator Name................<span style={{ fontWeight: 'bold', paddingLeft: '8px' }}>{selectedAccount} / {account?.operator}</span></div>
              <div>Fund Source – Consolidated Fund/Other than Consolidated Fund/Both...............<span style={{ fontWeight: 'bold', paddingLeft: '8px' }}>{account?.fund}</span></div>
              <div>Head of Account: .......................................<span style={{ fontWeight: 'bold', paddingLeft: '8px' }}>{selectedHoa || '—'}</span></div>
              <div>Pass-book start date.................. <span style={{ fontWeight: 'bold' }}>{fromDate}</span> to date................ <span style={{ fontWeight: 'bold' }}>{toDate}</span></div>
              <div>Opening Balance ₹................ <span style={{ fontWeight: 'bold' }}>{fmt(openingTxn?.balance || 5000000)}</span> on date................ <span style={{ fontWeight: 'bold' }}>{fromDate}</span></div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'center' }}>
              <thead>
                <tr style={{ border: '1px solid #000' }}>
                  <th rowSpan={2} style={{ border: '1px solid #000', padding: '8px 4px', fontWeight: 'bold', width: '5%' }}>Sr No</th>
                  <th rowSpan={2} style={{ border: '1px solid #000', padding: '8px 4px', fontWeight: 'bold', width: '10%' }}>Date</th>
                  <th colSpan={3} style={{ border: '1px solid #000', padding: '8px 4px', fontWeight: 'bold' }}>Transaction Details</th>
                  <th rowSpan={2} style={{ border: '1px solid #000', padding: '8px 4px', fontWeight: 'bold', width: '15%' }}>Type of transaction<br/>(Credit/Debit)</th>
                  <th rowSpan={2} style={{ border: '1px solid #000', padding: '8px 4px', fontWeight: 'bold', width: '15%' }}>Balance</th>
                </tr>
                <tr style={{ border: '1px solid #000' }}>
                  <th style={{ border: '1px solid #000', padding: '8px 4px', fontWeight: 'bold', width: '20%' }}>Challan No/<br/>Voucher No.</th>
                  <th style={{ border: '1px solid #000', padding: '8px 4px', fontWeight: 'bold', width: '20%' }}>Party Name</th>
                  <th style={{ border: '1px solid #000', padding: '8px 4px', fontWeight: 'bold', width: '15%' }}>Amount</th>
                </tr>
                <tr style={{ border: '1px solid #000', fontWeight: 'bold', background: '#f5f5f5' }}>
                  <td style={{ border: '1px solid #000', padding: '4px' }}>1</td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}>2</td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}>3</td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}>4</td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}>5</td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}>6</td>
                  <td style={{ border: '1px solid #000', padding: '4px' }}>7</td>
                </tr>
              </thead>
              <tbody>
                {filteredTxns.map((t, i) => (
                  <tr key={t.id} style={{ border: '1px solid #000', height: '30px' }}>
                    <td style={{ border: '1px solid #000', padding: '6px 4px' }}>{i + 1}</td>
                    <td style={{ border: '1px solid #000', padding: '6px 4px' }}>{t.date}</td>
                    <td style={{ border: '1px solid #000', padding: '6px 4px' }}>{t.ref}</td>
                    <td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'left' }}>
                      {t.narration.split('—')[1]?.trim() || t.narration}
                    </td>
                    <td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right' }}>
                      {fmt(t.credit > 0 ? t.credit : t.debit)}
                    </td>
                    <td style={{ border: '1px solid #000', padding: '6px 4px' }}>
                      {t.credit > 0 ? 'Credit' : 'Debit'}
                    </td>
                    <td style={{ border: '1px solid #000', padding: '6px 4px', textAlign: 'right', fontWeight: 'bold' }}>
                      {fmt(t.balance)}
                    </td>
                  </tr>
                ))}
                {/* Empty rows to match the screenshot spacing */}
                {[...Array(5)].map((_, i) => (
                  <tr key={`empty-${i}`} style={{ border: '1px solid #000', height: '30px' }}>
                    <td style={{ border: '1px solid #000' }}></td>
                    <td style={{ border: '1px solid #000' }}></td>
                    <td style={{ border: '1px solid #000' }}></td>
                    <td style={{ border: '1px solid #000' }}></td>
                    <td style={{ border: '1px solid #000' }}></td>
                    <td style={{ border: '1px solid #000' }}></td>
                    <td style={{ border: '1px solid #000' }}></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: '20px', fontSize: '14px', lineHeight: '2.5' }}>
              <div>Closing Balance ₹................ <span style={{ fontWeight: 'bold' }}>{fmt(closingBalance)}</span> on date................ <span style={{ fontWeight: 'bold' }}>{toDate}</span></div>
            </div>

            <div style={{ marginTop: '40px', fontSize: '13px', fontStyle: 'italic', fontWeight: 'bold' }}>
              This pass-book is generated by software hence doesn't require signature.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
