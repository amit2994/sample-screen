import { useState, useEffect } from 'react';
import {
  CheckCircle2, AlertCircle, Building, User,
  FileText, Briefcase, Receipt, ArrowRightLeft, CreditCard
} from 'lucide-react';
import './DepositFundTransferScreen.css';

const MOCK_SUB_PDS = [
  { id: 'SUB-PD-001', name: 'Jabalpur District Division', limit: 500000, parentPd: 'PD-82011' },
  { id: 'SUB-PD-002', name: 'Indore City Office', limit: 1200000, parentPd: 'PD-49320' },
  { id: 'SUB-PD-003', name: 'Bhopal Central Zone', limit: 50000, parentPd: 'PD-99999' }
];

export default function SubPDBillCreationScreen() {
  const [step, setStep] = useState(1);
  const [subPd, setSubPd] = useState('');
  const [amount, setAmount] = useState('');
  const [billNumber, setBillNumber] = useState('');
  
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [voucherNumber, setVoucherNumber] = useState('');

  const selectedSubPdObj = MOCK_SUB_PDS.find(p => p.id === subPd);
  
  // Validation
  const parsedAmount = Number(amount);
  const isAmountValid = selectedSubPdObj && parsedAmount > 0 && parsedAmount <= selectedSubPdObj.limit;
  const isAmountExceeded = selectedSubPdObj && parsedAmount > selectedSubPdObj.limit;

  // Auto-generate Bill Number on Step 1 completion
  useEffect(() => {
    if (step === 2 && !billNumber) {
      setBillNumber(`BILL-2026-${Math.floor(10000 + Math.random() * 90000)}`);
    }
  }, [step, billNumber]);

  const handleNext = () => {
    if (step === 1 && !subPd) return;
    if (step === 2 && !isAmountValid) return;
    
    setStep(prev => prev + 1);
  };

  const simulateExecution = (outcome: 'success' | 'failed') => {
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus(outcome);
      if (outcome === 'success') {
        setVoucherNumber(`VCH-DN-${Math.floor(100000 + Math.random() * 900000)}`);
      }
      setStep(4);
    }, 2000);
  };

  return (
    <div className="dft-screen animate-fade-in">
      <header>
        <h1>Sub-PD Bill Creation & Withdrawal</h1>
        <p className="header-desc">
          Initiate withdrawals within assigned drawing limits. Limits are updated only upon receipt of Debit Notification (DN).
        </p>
        <div className="dft-header-badges">
          <span className="dft-header-badge role"><User size={12} /> Sub-PD Operator</span>
          <span className="dft-header-badge origin"><Building size={12} /> IFMIS Next Gen</span>
        </div>
      </header>

      {/* Step 1: Sub-PD Selection */}
      <div className={`dft-section ${step >= 1 ? 'dft-section-enter' : ''}`}>
        <div className="dft-section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div className="dft-section-icon"><Building size={18} /></div>
            <h2>1. Sub-PD Selection & Drawing Limit</h2>
          </div>
        </div>
        {step >= 1 && (
          <div className="dft-section-body">
            <div className="grid-2-col dft-form-row">
              <div className="form-group">
                <label className="form-label">Select Sub-PD <span className="required">*</span></label>
                <select className="form-input" value={subPd} onChange={e => setSubPd(e.target.value)} disabled={step > 1}>
                  <option value="">Select Sub-PD...</option>
                  {MOCK_SUB_PDS.map(p => (
                    <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Available Drawing Limit</label>
                <div className="form-input disabled" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                  {selectedSubPdObj ? `₹ ${selectedSubPdObj.limit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                </div>
              </div>
            </div>
            {selectedSubPdObj && (
              <div className="form-helper" style={{ marginTop: 'var(--space-2)' }}>
                Mapped Parent PD: <strong>{selectedSubPdObj.parentPd}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 2: Bill Creation */}
      <div className={`dft-section ${step >= 2 ? 'dft-section-enter' : ''}`}>
        <div className="dft-section-header" style={{ opacity: step >= 2 ? 1 : 0.6 }}>
          <div className="dft-section-icon"><FileText size={18} /></div>
          <h2>2. Bill Creation</h2>
        </div>
        {step >= 2 && (
          <div className="dft-section-body">
            <div className="grid-2-col dft-form-row">
              <div className="form-group">
                <label className="form-label">Auto-generated Bill Number</label>
                <input type="text" className="form-input disabled" value={billNumber} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Withdrawal Amount (₹) <span className="required">*</span></label>
                <input 
                  type="number" 
                  className={`form-input ${isAmountExceeded ? 'error-text' : ''}`} 
                  placeholder="0.00" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  disabled={step > 2}
                />
                {isAmountExceeded && (
                  <span className="form-helper" style={{ color: 'var(--color-error)' }}>
                    Withdrawal amount cannot exceed available drawing limit.
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 3: Payment Approval & Execution */}
      <div className={`dft-section ${step >= 3 ? 'dft-section-enter' : ''}`}>
        <div className="dft-section-header" style={{ opacity: step >= 3 ? 1 : 0.6 }}>
          <div className="dft-section-icon"><CreditCard size={18} /></div>
          <h2>3. Payment Approval & Execution</h2>
        </div>
        {step >= 3 && (
          <div className="dft-section-body">
            <div className="dft-info-callout info" style={{ marginBottom: 'var(--space-6)' }}>
              <Briefcase size={16} />
              <div>
                <strong>Awaiting Bank Debit Notification (DN)</strong>
                <p>The bill is approved and sent to the bank. Drawing limits remain unchanged until DN is received.</p>
              </div>
            </div>

            {paymentStatus === 'pending' && step === 3 && (
              <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', marginTop: 'var(--space-4)' }}>
                <button className="btn btn-primary" onClick={() => simulateExecution('success')}>
                  Simulate Bank DN (Success)
                </button>
                <button className="btn btn-secondary" style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }} onClick={() => simulateExecution('failed')}>
                  Simulate Bank DN (Failure)
                </button>
              </div>
            )}

            {paymentStatus === 'processing' && (
              <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
                <div className="spinner" style={{ margin: '0 auto var(--space-3)' }}></div>
                <p>Waiting for Debit Notification from Bank...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 4: Accounting & Limits Update */}
      <div className={`dft-section ${step >= 4 ? 'dft-section-enter' : ''}`}>
        <div className="dft-section-header" style={{ opacity: step >= 4 ? 1 : 0.6 }}>
          <div className="dft-section-icon"><Receipt size={18} /></div>
          <h2>4. Voucher & Accounting</h2>
        </div>
        {step >= 4 && (
          <div className="dft-section-body">
            {paymentStatus === 'success' ? (
              <>
                <div className="dft-info-callout success" style={{ marginBottom: 'var(--space-6)' }}>
                  <CheckCircle2 size={16} />
                  <div>
                    <strong>DN Received - Payment Successful</strong>
                    <p>Voucher generated successfully. Drawing limit has been reduced accordingly.</p>
                  </div>
                </div>

                <div className="dft-summary-grid" style={{ marginBottom: 'var(--space-6)' }}>
                  <div className="dft-summary-item">
                    <span className="dft-summary-label">Voucher Number</span>
                    <span className="dft-summary-value" style={{ color: 'var(--color-primary)' }}>{voucherNumber}</span>
                  </div>
                  <div className="dft-summary-item">
                    <span className="dft-summary-label">Original Limit</span>
                    <span className="dft-summary-value">₹ {selectedSubPdObj?.limit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="dft-summary-item">
                    <span className="dft-summary-label">Updated Limit</span>
                    <span className="dft-summary-value" style={{ color: 'var(--color-warning)' }}>
                      ₹ {((selectedSubPdObj?.limit || 0) - parsedAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="dft-accounting-row">
                  <div className="dft-accounting-icon debit"><ArrowRightLeft size={16} /></div>
                  <div className="dft-accounting-details">
                    <div className="label">Debit (Limit Deduction)</div>
                    <div className="value">Sub-PD ({subPd})</div>
                  </div>
                  <div className="dft-accounting-amount debit">- ₹{parsedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
              </>
            ) : paymentStatus === 'failed' ? (
              <>
                <div className="dft-info-callout error" style={{ marginBottom: 'var(--space-6)' }}>
                  <AlertCircle size={16} />
                  <div>
                    <strong>Payment Failed</strong>
                    <p>Transaction failed at the bank end. Drawing limits have been safely restored.</p>
                  </div>
                </div>

                <div className="grid-2-col dft-form-row" style={{ marginBottom: 'var(--space-6)' }}>
                  <div className="form-group">
                    <label className="form-label">Transaction Status</label>
                    <div className="form-input disabled" style={{ color: 'var(--color-error)', fontWeight: 600 }}>Failed</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Failure Reason</label>
                    <div className="form-input disabled">Insufficient funds at clearing / Invalid Account</div>
                  </div>
                </div>

                <div className="dft-accounting-row">
                  <div className="dft-accounting-icon credit"><ArrowRightLeft size={16} /></div>
                  <div className="dft-accounting-details">
                    <div className="label">Credit (Restoration)</div>
                    <div className="value">Parent PD ({selectedSubPdObj?.parentPd})</div>
                  </div>
                  <div className="dft-accounting-amount credit">+ ₹{parsedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>

      <div className="dft-action-bar">
        <div className="dft-action-bar-left">
          {/* Action bar left intentionally left blank for this flow */}
        </div>
        <div className="dft-action-bar-right">
          {step < 4 && <button className="btn btn-secondary" disabled={paymentStatus === 'processing'} onClick={() => window.location.reload()}>Cancel</button>}
          
          {step === 1 && (
            <button className="btn btn-primary" onClick={handleNext} disabled={!subPd}>
              Proceed to Bill
            </button>
          )}
          
          {step === 2 && (
            <button className="btn btn-primary" onClick={handleNext} disabled={!isAmountValid}>
              Approve & Send to Bank
            </button>
          )}

          {step === 4 && (
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Initiate New Bill
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
        .dft-accounting-icon.debit {
          background-color: var(--color-error-light);
          color: var(--color-error);
        }
        .dft-accounting-amount.debit {
          color: var(--color-error);
        }
      `}} />
    </div>
  );
}
