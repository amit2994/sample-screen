import { useState } from 'react';
import {
  CheckCircle2, Building, User,
  FileText, Briefcase, CreditCard, Send
} from 'lucide-react';
import './DepositFundTransferScreen.css';

const MOCK_PD_ACCOUNTS = [
  { 
    id: 'PD-82011', 
    type: 'Personal Deposit (PD)',
    purposeCode: 'PC-101 - General Expenses',
    ddoCode: 'DDO-001', ddoName: 'Chief Medical Officer',
    deptCode: 'DEPT-01', deptName: 'Health Department',
    treasuryCode: 'TRY-001', treasuryName: 'Vindhyachal State Treasury',
    balance: 1500000,
    hoa: '8443-00-106-0000'
  },
  { 
    id: 'PD-49320', 
    type: 'Civil Court Deposit (CCD)',
    purposeCode: 'PC-202 - Court Fees',
    ddoCode: 'DDO-002', ddoName: 'District Judge',
    deptCode: 'DEPT-02', deptName: 'Judicial Department',
    treasuryCode: 'TRY-002', treasuryName: 'District Treasury',
    balance: 450000,
    hoa: '8443-00-104-0000'
  }
];

const MOCK_VENDORS = [
  { code: 'VND-1001', name: 'ABC Technologies Ltd.', bank: 'State Bank of India', ifsc: 'SBIN0001234' },
  { code: 'VND-1002', name: 'XYZ Supplies Co.', bank: 'HDFC Bank', ifsc: 'HDFC0005678' }
];

export default function PaymentAdviceGenerationScreen() {
  const [step, setStep] = useState(1);
  const [depositType, setDepositType] = useState('');
  const [accountNo, setAccountNo] = useState('');

  const filteredAccounts = MOCK_PD_ACCOUNTS.filter(a => !depositType || a.type === depositType);
  
  // Vendor details
  const [vendorCode, setVendorCode] = useState('');
  const [paymentMode, setPaymentMode] = useState('e-Payment');
  const [amount, setAmount] = useState('');
  const [selectedHoa, setSelectedHoa] = useState('');

  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success'>('pending');
  const [requestId, setRequestId] = useState('');

  const selectedAcct = MOCK_PD_ACCOUNTS.find(a => a.id === accountNo);
  const selectedVendor = MOCK_VENDORS.find(v => v.code === vendorCode);

  const parsedAmount = Number(amount);
  const isAmountValid = selectedAcct && parsedAmount > 0 && parsedAmount <= selectedAcct.balance;
  const isAmountExceeded = selectedAcct && parsedAmount > selectedAcct.balance;

  const handleNext = () => {
    if (step === 1 && !accountNo) return;
    if (step === 2 && (!vendorCode || !paymentMode || !amount || !selectedHoa || !isAmountValid)) return;
    
    if (step === 2) {
      setPaymentStatus('processing');
      setTimeout(() => {
        setPaymentStatus('success');
        setRequestId(`REQ-2026-${Math.floor(100000 + Math.random() * 900000)}`);
        setStep(3);
      }, 2000);
      return;
    }
    
    setStep(prev => prev + 1);
  };

  return (
    <div className="dft-screen animate-fade-in">
      <header>
        <h1>Payment Advice Generation</h1>
        <p className="header-desc">
          Generate payment advice, e-cheques, or initiate online payments to beneficiaries/vendors through the Bill Management System (BMS).
        </p>
        <div className="dft-header-badges">
          <span className="dft-header-badge role"><User size={12} /> SDDO / Creator</span>
          <span className="dft-header-badge origin"><Building size={12} /> BMS Integrated</span>
        </div>
      </header>

      {/* Step 1: PD Account Details */}
      <div className={`dft-section ${step >= 1 ? 'dft-section-enter' : ''}`}>
        <div className="dft-section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div className="dft-section-icon"><Briefcase size={18} /></div>
            <h2>1. PD Account & HoA Details</h2>
          </div>
        </div>
        {step >= 1 && (
          <div className="dft-section-body">
            <div className="grid-3-col dft-form-row">
              <div className="form-group">
                <label className="form-label">Deposit Type <span className="required">*</span></label>
                <select className="form-input" value={depositType} onChange={e => {
                  setDepositType(e.target.value);
                  setAccountNo(''); // Reset account when type changes
                }} disabled={step > 1}>
                  <option value="">Select Deposit Type...</option>
                  <option value="Personal Deposit (PD)">Personal Deposit (PD)</option>
                  <option value="Civil Court Deposit (CCD)">Civil Court Deposit (CCD)</option>
                  <option value="Criminal Court Deposit (CrCD)">Criminal Court Deposit (CrCD)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Deposit Account No. <span className="required">*</span></label>
                <select className="form-input" value={accountNo} onChange={e => setAccountNo(e.target.value)} disabled={step > 1 || !depositType}>
                  <option value="">Select Account...</option>
                  {filteredAccounts.map(a => (
                    <option key={a.id} value={a.id}>{a.id}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Purpose Code</label>
                <input type="text" className="form-input disabled" value={selectedAcct?.purposeCode || ''} disabled />
              </div>
            </div>

            {selectedAcct && (
              <>
                <div className="grid-3-col dft-form-row" style={{ marginTop: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">DDO Code & Name</label>
                    <div className="form-input disabled">{selectedAcct.ddoCode} - {selectedAcct.ddoName}</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department Code & Name</label>
                    <div className="form-input disabled">{selectedAcct.deptCode} - {selectedAcct.deptName}</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Treasury Code & Name</label>
                    <div className="form-input disabled">{selectedAcct.treasuryCode} - {selectedAcct.treasuryName}</div>
                  </div>
                </div>

                <div className="grid-2-col dft-form-row" style={{ marginTop: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Head of Account (HoA)</label>
                    <div className="form-input disabled" style={{ fontWeight: 600 }}>{selectedAcct.hoa}</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Available Balance (₹)</label>
                    <div className="form-input disabled" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                      ₹ {selectedAcct.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Step 2: Vendor Details & Amount */}
      <div className={`dft-section ${step >= 2 ? 'dft-section-enter' : ''}`}>
        <div className="dft-section-header" style={{ opacity: step >= 2 ? 1 : 0.6 }}>
          <div className="dft-section-icon"><CreditCard size={18} /></div>
          <h2>2. Vendor Details & Claim Creation</h2>
        </div>
        {step >= 2 && (
          <div className="dft-section-body">
            <div className="grid-3-col dft-form-row">
              <div className="form-group">
                <label className="form-label">Vendor Code <span className="required">*</span></label>
                <select className="form-input" value={vendorCode} onChange={e => setVendorCode(e.target.value)} disabled={step > 2}>
                  <option value="">Select Vendor...</option>
                  {MOCK_VENDORS.map(v => (
                    <option key={v.code} value={v.code}>{v.code}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Vendor Name</label>
                <input type="text" className="form-input disabled" value={selectedVendor?.name || ''} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Bank & IFSC</label>
                <div className="form-input disabled">
                  {selectedVendor ? `${selectedVendor.bank} (${selectedVendor.ifsc})` : ''}
                </div>
              </div>
            </div>

            <div className="grid-3-col dft-form-row" style={{ marginTop: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Payment Mode <span className="required">*</span></label>
                <select className="form-input" value={paymentMode} onChange={e => setPaymentMode(e.target.value)} disabled={step > 2}>
                  <option value="e-Payment">e-Payment</option>
                  <option value="Physical Cheque">Physical Cheque</option>
                  <option value="Digital Currency">Digital Currency</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">From HoA Selection <span className="required">*</span></label>
                <select className="form-input" value={selectedHoa} onChange={e => setSelectedHoa(e.target.value)} disabled={step > 2}>
                  <option value="">Select HoA...</option>
                  {selectedAcct && <option value={selectedAcct.hoa}>{selectedAcct.hoa} (Main)</option>}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (INR) <span className="required">*</span></label>
                <input 
                  type="number" 
                  className={`form-input ${isAmountExceeded ? 'error-text' : ''}`} 
                  placeholder="0.00" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  disabled={step > 2}
                  min={0.01}
                />
                {isAmountExceeded && (
                  <span className="form-helper" style={{ color: 'var(--color-error)' }}>
                    Amount exceeds Available Balance.
                  </span>
                )}
              </div>
            </div>

            {paymentStatus === 'processing' && (
              <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
                <div className="spinner" style={{ margin: '0 auto var(--space-3)' }}></div>
                <p>Generating Request ID and validating via BMS...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 3: Approval & Submission */}
      <div className={`dft-section ${step >= 3 ? 'dft-section-enter' : ''}`}>
        <div className="dft-section-header" style={{ opacity: step >= 3 ? 1 : 0.6 }}>
          <div className="dft-section-icon"><Send size={18} /></div>
          <h2>3. Submission & Workflow Routing</h2>
        </div>
        {step >= 3 && (
          <div className="dft-section-body">
            <div className="dft-info-callout success" style={{ marginBottom: 'var(--space-6)' }}>
              <CheckCircle2 size={16} />
              <div>
                <strong>Claim Created Successfully</strong>
                <p>Claim Request ID has been generated and routed to the Verifier.</p>
              </div>
            </div>

            <div className="dft-summary-grid">
              <div className="dft-summary-item">
                <span className="dft-summary-label">Request ID</span>
                <span className="dft-summary-value" style={{ color: 'var(--color-primary)' }}>{requestId}</span>
              </div>
              <div className="dft-summary-item">
                <span className="dft-summary-label">Amount Sent for Approval</span>
                <span className="dft-summary-value">₹ {parsedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="dft-summary-item">
                <span className="dft-summary-label">Current Status</span>
                <span className="dft-status-badge warning" style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>Pending Verification</span>
              </div>
            </div>

            <hr style={{ margin: 'var(--space-6) 0', border: 'none', borderTop: '1px dashed var(--color-border)' }} />

            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
              <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} /> Print Claim Request
              </button>
              <button className="btn btn-secondary" onClick={() => window.location.reload()}>
                Create Another Claim
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="dft-action-bar">
        <div className="dft-action-bar-left"></div>
        <div className="dft-action-bar-right">
          {step < 3 && <button className="btn btn-secondary" disabled={paymentStatus === 'processing'} onClick={() => window.location.reload()}>Cancel</button>}
          
          {step === 1 && (
            <button className="btn btn-primary" onClick={handleNext} disabled={!accountNo}>
              Proceed
            </button>
          )}
          
          {step === 2 && (
            <button className="btn btn-primary" onClick={handleNext} disabled={!vendorCode || !paymentMode || !amount || !selectedHoa || !isAmountValid || paymentStatus === 'processing'}>
              Submit Request (e-Sign/DSC)
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
