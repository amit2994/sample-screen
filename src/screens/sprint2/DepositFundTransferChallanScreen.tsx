import { useState } from 'react';
import {
  CheckCircle2, AlertCircle, Building, User,
  CreditCard, ArrowRightLeft, Database, Receipt, FileText, Briefcase
} from 'lucide-react';
import './DepositFundTransferScreen.css';

const MOCK_ACCOUNTS = [
  { id: 'PD-82011', name: 'PD-82011 - Urban Administration', fundSource: 'Challan', status: 'Active', treasury: 'District Treasury, Central', district: 'Bhopal', opCode: 'OP-001', opName: 'Municipal Commissioner' },
  { id: 'PD-49320', name: 'PD-49320 - Rural Development', fundSource: 'Consolidated Fund', status: 'Active', treasury: 'Sub-Treasury, Rural', district: 'Indore', opCode: 'OP-002', opName: 'Zila Panchayat CEO' },
  { id: 'PD-99999', name: 'PD-99999 - Forest Dept', fundSource: 'Challan', status: 'Active', treasury: 'Vindhyachal State Cyber Treasury', district: 'Bhopal', opCode: 'OP-003', opName: 'Divisional Forest Officer' },
  { id: 'PD-11111', name: 'PD-11111 - Inactive Account', fundSource: 'Challan', status: 'Inactive', treasury: 'District Treasury, East', district: 'Jabalpur', opCode: 'OP-004', opName: 'Suspended Officer' },
  { id: 'CCD-55555', name: 'CCD-55555 - Civil Court Deposits', fundSource: 'Challan', status: 'Active', treasury: 'District Treasury, Central', district: 'Bhopal', opCode: 'OP-005', opName: 'Court Clerk' },
  { id: 'CrCD-66666', name: 'CrCD-66666 - Criminal Court Deposits', fundSource: 'Challan', status: 'Active', treasury: 'District Treasury, Central', district: 'Bhopal', opCode: 'OP-006', opName: 'Court Registrar' }
];

export default function DepositFundTransferChallanScreen() {
  const [step, setStep] = useState(1);
  const [district, setDistrict] = useState('');
  const [treasury, setTreasury] = useState('');
  const [depositType, setDepositType] = useState('PD');

  const [selectedAccount, setSelectedAccount] = useState('');

  const [challanNumber, setChallanNumber] = useState('');
  const [challanDate, setChallanDate] = useState('');
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');

  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success'>('pending');

  const selectedAcctObj = MOCK_ACCOUNTS.find(a => a.id === selectedAccount);
  const isInvalidAccount = selectedAcctObj && (selectedAcctObj.fundSource === 'Consolidated Fund' || selectedAcctObj.status !== 'Active');

  const filteredAccounts = MOCK_ACCOUNTS.filter(a => a.id.startsWith(depositType + '-'));

  const handleNext = () => {
    if (step === 1 && isInvalidAccount) return;
    if (step === 3) {
      setPaymentStatus('processing');
      setTimeout(() => {
        setPaymentStatus('success');
        setStep(4);
      }, 1500);
      return;
    }
    setStep(prev => prev + 1);
  };

  const autoFillLocation = () => {
    setDistrict('Bhopal');
    setTreasury('Vindhyachal State Cyber Treasury');
    setSelectedAccount('PD-99999');
  };

  return (
    <div className="dft-screen animate-fade-in">
      <header>
        <h1>Deposit Fund Transfer – Challan Mode</h1>
        <p className="header-desc">
          Transfer funds to eligible Deposit Accounts through Challan mode using Cyber Treasury.
        </p>
        <div className="dft-header-badges">
          <span className="dft-header-badge role"><User size={12} /> Cyber User</span>
          <span className="dft-header-badge origin"><Building size={12} /> Cyber Treasury</span>
          <span className="dft-header-badge fund"><Database size={12} /> Non-CF (Challan)</span>
        </div>
      </header>


      <div className={`dft-section ${step >= 1 ? 'dft-section-enter' : ''}`}>
        <div className="dft-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div className="dft-section-icon"><Building size={18} /></div>
            <h2>1. Initiation & Account Selection</h2>
          </div>
          <button className="btn btn-secondary" style={{ padding: 'var(--space-1) var(--space-3)', fontSize: '0.85rem' }} onClick={autoFillLocation}>
            Auto-Fill Test Data
          </button>
        </div>
        {step >= 1 && (
          <div className="dft-section-body">
            <h3 style={{ marginBottom: 'var(--space-4)', fontSize: '1rem', color: 'var(--color-text-secondary)' }}>Location & Operator Details</h3>
            <div className="grid-2-col dft-form-row">
              <div className="form-group">
                <label className="form-label">District <span className="required">*</span></label>
                <select className="form-input" value={district} onChange={e => setDistrict(e.target.value)}>
                  <option value="">Select District...</option>
                  <option value="Bhopal">Bhopal</option>
                  <option value="Indore">Indore</option>
                  <option value="Jabalpur">Jabalpur</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Treasury <span className="required">*</span></label>
                <select className="form-input" value={treasury} onChange={e => setTreasury(e.target.value)}>
                  <option value="">Select Treasury...</option>
                  <option value="Vindhyachal State Cyber Treasury">Vindhyachal State Cyber Treasury</option>
                  <option value="District Treasury, Central">District Treasury, Central</option>
                  <option value="Sub-Treasury, Rural">Sub-Treasury, Rural</option>
                </select>
              </div>
            </div>

            <div className="grid-2-col dft-form-row" style={{ marginTop: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Deposit Type <span className="required">*</span></label>
                <select className="form-input" value={depositType} onChange={e => {
                  setDepositType(e.target.value);
                  setSelectedAccount('');
                }}>
                  <option value="PD">Personal Deposit (PD)</option>
                  <option value="CCD">Civil Court Deposit (CCD)</option>
                  <option value="CrCD">Criminal Court Deposit (CrCD)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Deposit Account Number <span className="required">*</span></label>
                <select className="form-input" value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}>
                  <option value="">Select Account...</option>
                  {filteredAccounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>            {isInvalidAccount && (
              <div className="dft-info-callout error" style={{ marginTop: 'var(--space-4)' }}>
                <AlertCircle size={16} />
                <div>
                  <strong>Transfer Blocked</strong>
                  <p>
                    {selectedAcctObj?.fundSource === 'Consolidated Fund'
                      ? 'This account is mapped to Consolidated Fund. Challan transfers are not allowed.'
                      : 'This account is inactive. Only active and approved accounts can receive funds via Challan.'}
                  </p>
                </div>
              </div>
            )}

            {selectedAcctObj && !isInvalidAccount && (
              <div className="dft-info-callout success" style={{ marginTop: 'var(--space-4)' }}>
                <CheckCircle2 size={16} />
                <div>
                  <strong>Eligible Account</strong>
                  <p>Account is active and mapped with Non-CF (Challan) fund source.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`dft-section ${step >= 2 ? 'dft-section-enter' : ''}`}>
        <div className="dft-section-header" style={{ opacity: step >= 2 ? 1 : 0.6 }}>
          <div className="dft-section-icon"><FileText size={18} /></div>
          <h2>2. Challan Details Entry</h2>
        </div>
        {step >= 2 && (
          <div className="dft-section-body">
            <div className="grid-2-col dft-form-row">
              <div className="form-group">
                <label className="form-label">Challan Number <span className="required">*</span></label>
                <input type="text" className="form-input" placeholder="e.g., CHLN20268812" value={challanNumber} onChange={e => setChallanNumber(e.target.value)} maxLength={20} />
              </div>
              <div className="form-group">
                <label className="form-label">Challan Date <span className="required">*</span></label>
                <input type="date" className="form-input" value={challanDate} onChange={e => setChallanDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
              </div>
            </div>

            <div className="grid-2-col dft-form-row" style={{ marginTop: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Challan Amount (₹) <span className="required">*</span></label>
                <input type="number" className="form-input" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} min={0.01} step={0.01} />
              </div>
              <div className="form-group">
                <label className="form-label">Bank Name <span className="required">*</span></label>
                <input type="text" className="form-input" placeholder="Enter Bank Name" value={bankName} onChange={e => setBankName(e.target.value)} maxLength={100} />
              </div>
            </div>

            <div className="dft-form-row" style={{ marginTop: 'var(--space-4)' }}>
              <div className="form-group" style={{ width: 'calc(50% - var(--space-2))' }}>
                <label className="form-label">Branch Name <span className="required">*</span></label>
                <input type="text" className="form-input" placeholder="Enter Branch Name" value={branchName} onChange={e => setBranchName(e.target.value)} maxLength={100} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`dft-section ${step >= 3 ? 'dft-section-enter' : ''}`}>
        <div className="dft-section-header" style={{ opacity: step >= 3 ? 1 : 0.6 }}>
          <div className="dft-section-icon"><CreditCard size={18} /></div>
          <h2>3. Payment & Submission</h2>
        </div>
        {step >= 3 && (
          <div className="dft-section-body">
            <div className="dft-info-callout info" style={{ marginBottom: 'var(--space-6)' }}>
              <Briefcase size={16} />
              <div>
                <strong>Cyber Treasury Payment Gateway</strong>
                <p>You are about to submit the challan and process the payment. Once successful, URN and CRN will be generated.</p>
              </div>
            </div>

            <div className="dft-summary-grid">
              <div className="dft-summary-item">
                <span className="dft-summary-label">Deposit Account</span>
                <span className="dft-summary-value">{selectedAcctObj?.name}</span>
              </div>
              <div className="dft-summary-item">
                <span className="dft-summary-label">Amount</span>
                <span className="dft-summary-value" style={{ color: 'var(--color-primary)', fontSize: '1.2rem' }}>₹ {Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="dft-summary-item">
                <span className="dft-summary-label">Bank & Branch</span>
                <span className="dft-summary-value">{bankName}, {branchName}</span>
              </div>
            </div>

            {paymentStatus === 'processing' && (
              <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
                <div className="spinner" style={{ margin: '0 auto var(--space-3)' }}></div>
                <p>Processing payment securely via Cyber Treasury...</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`dft-section ${step >= 4 ? 'dft-section-enter' : ''}`}>
        <div className="dft-section-header" style={{ opacity: step >= 4 ? 1 : 0.6 }}>
          <div className="dft-section-icon"><Receipt size={18} /></div>
          <h2>4. Accounting & Confirmation</h2>
        </div>
        {step >= 4 && (
          <div className="dft-section-body">
            <div className="dft-summary-grid">
              <div className="dft-summary-item">
                <span className="dft-summary-label">Challan Reference (CRN)</span>
                <span className="dft-summary-value" style={{ color: 'var(--color-primary)' }}>CRN-2026-CHLN-{challanNumber}</span>
              </div>
              <div className="dft-summary-item">
                <span className="dft-summary-label">Unique Ref Number (URN)</span>
                <span className="dft-summary-value">URN-90821-MP</span>
              </div>
              <div className="dft-summary-item">
                <span className="dft-summary-label">Posting Status</span>
                <span className="dft-status-badge approved">Success</span>
              </div>
            </div>

            <hr className="dft-summary-divider" />

            <div className="dft-info-callout success" style={{ marginBottom: 'var(--space-6)' }}>
              <CheckCircle2 size={16} />
              <div>
                <strong>Payment Successful</strong>
                <p>Amount posted to selected Deposit Account.</p>
              </div>
            </div>

            <div className="dft-accounting-row">
              <div className="dft-accounting-icon credit"><ArrowRightLeft size={16} /></div>
              <div className="dft-accounting-details">
                <div className="label">Credit (Challan Receipt)</div>
                <div className="value">Deposit Account ({selectedAccount})</div>
              </div>
              <div className="dft-accounting-amount credit">+ ₹{Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>


          </div>
        )}
      </div>

      <div className="dft-action-bar">
        <div className="dft-action-bar-left">
          {step > 1 && step < 4 && <button className="btn btn-secondary" onClick={() => setStep(prev => prev - 1)} disabled={paymentStatus === 'processing'}>Back</button>}
        </div>
        <div className="dft-action-bar-right">
          {step < 4 && <button className="btn btn-secondary" disabled={paymentStatus === 'processing'} onClick={() => window.location.reload()}>Cancel</button>}
          {step < 4 ? (
            <button
              className="btn btn-primary"
              onClick={handleNext}
              disabled={
                (!district || !treasury || !depositType || !selectedAccount || isInvalidAccount) ||
                (step >= 2 && (!challanNumber || !challanDate || !amount || !bankName || !branchName)) ||
                paymentStatus === 'processing'
              }
            >
              {step === 3 ? 'Confirm & Pay' : 'Proceed'}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Initiate Another Transfer
            </button>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid var(--color-border);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .error-text {
          color: var(--color-error);
          background-color: var(--color-error-light);
          border-color: var(--color-error-border, rgba(220, 38, 38, 0.2));
        }
      `}} />
    </div>
  );
}
