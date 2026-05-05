import React, { useState } from 'react';
import {
  FileText, CheckCircle2, AlertCircle, Building, User,
  IndianRupee, CreditCard, Send, Settings, ArrowRightLeft, Database, Receipt
} from 'lucide-react';
import './DepositFundTransferScreen.css';

interface BudgetLine {
  id: string;
  head: string;
  desc: string;
  available: number;
  mapped: boolean;
  status: 'approved' | 'unmapped' | 'pending';
}

const MOCK_BUDGETS: BudgetLine[] = [
  { id: 'BL-1', head: '8443-00-106-0001', desc: 'Personal Deposits - General', available: 5000000, mapped: true, status: 'approved' },
  { id: 'BL-2', head: '8443-00-106-0002', desc: 'Personal Deposits - Special', available: 2500000, mapped: true, status: 'approved' },
  { id: 'BL-3', head: '8443-00-108-0001', desc: 'Public Works Deposits', available: 10000000, mapped: false, status: 'unmapped' }
];

export default function DepositFundTransferScreen() {
  const [step, setStep] = useState(1);
  const [depositType, setDepositType] = useState('PD');
  const [amount, setAmount] = useState('');
  const [selectedBudget, setSelectedBudget] = useState<string>('');
  
  // PD-CF specific states
  const [mappingRequested, setMappingRequested] = useState(false);
  const [hoadApproved, setHoadApproved] = useState(false);
  const [fdDecision, setFdDecision] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const isPD = depositType === 'PD';
  const requiresMapping = isPD && selectedBudget === 'BL-3';
  const showBudgetLines = isPD;

  const handleNext = () => {
    if (step === 1 && requiresMapping && !mappingRequested) {
      setMappingRequested(true);
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleSimulateFD = (decision: 'approved' | 'rejected') => {
    setFdDecision(decision);
    if (decision === 'approved') setStep(4);
  };

  return (
    <div className="dft-screen animate-fade-in">
      <header>
        <h1>Deposit Fund Transfer – CF Mode</h1>
        <p className="header-desc">
          Transfer funds from Consolidated Fund to eligible Deposit Accounts. 
          PD-CF transfers require FD-approved budget line mapping.
        </p>
        <div className="dft-header-badges">
          <span className="dft-header-badge role"><User size={12}/> DDO Logged In</span>
          <span className="dft-header-badge origin"><Building size={12}/> BMS Originated</span>
          <span className="dft-header-badge fund"><Database size={12}/> CF Mode</span>
        </div>
      </header>

      {/* Stepper */}
      <div className="dft-wizard-stepper">
        <div className={`dft-step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="dft-step-circle">{step > 1 ? <CheckCircle2 size={16}/> : '1'}</div>
          <span className="dft-step-label">Initiation</span>
        </div>
        <div className={`dft-step-connector ${step > 1 ? 'completed' : ''}`} />
        
        {isPD && (
          <>
            <div className={`dft-step-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <div className="dft-step-circle">{step > 2 ? <CheckCircle2 size={16}/> : '2'}</div>
              <span className="dft-step-label">HoAD Review</span>
            </div>
            <div className={`dft-step-connector ${step > 2 ? 'completed' : ''}`} />
            
            <div className={`dft-step-item ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
              <div className="dft-step-circle">{step > 3 ? <CheckCircle2 size={16}/> : '3'}</div>
              <span className="dft-step-label">FD Approval</span>
            </div>
            <div className={`dft-step-connector ${step > 3 ? 'completed' : ''}`} />
          </>
        )}

        <div className={`dft-step-item ${step >= 4 ? 'active' : ''} ${step > 4 ? 'completed' : ''}`}>
          <div className="dft-step-circle">{step > 4 ? <CheckCircle2 size={16}/> : (isPD ? '4' : '2')}</div>
          <span className="dft-step-label">Accounting</span>
        </div>
      </div>

      {step === 1 && (
        <div className="dft-section">
          <div className="dft-section-header">
            <div className="dft-section-icon"><CreditCard size={18}/></div>
            <h2>1. Transfer Details</h2>
          </div>
          <div className="dft-section-body">
            <div className="grid-2-col dft-form-row">
              <div className="form-group">
                <label className="form-label">Deposit Type <span className="required">*</span></label>
                <select className="form-input" value={depositType} onChange={e => {
                  setDepositType(e.target.value);
                  setSelectedBudget('');
                  setMappingRequested(false);
                }}>
                  <option value="PD">Personal Deposit (PD)</option>
                  <option value="CCD">Civil Court Deposit (CCD)</option>
                  <option value="CrCD">Criminal Court Deposit (CrCD)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Deposit Account <span className="required">*</span></label>
                <select className="form-input">
                  <option>Select Account...</option>
                  <option>PD-82011 - Urban Administration</option>
                  <option>PD-49320 - Rural Development</option>
                </select>
                <span className="form-helper" style={{color: 'var(--color-success)'}}>Account is Active & CF Eligible</span>
              </div>
            </div>

            {!isPD && (
              <div className="dft-info-callout info">
                <AlertCircle size={16} />
                <div>
                  <strong>Challan-like Receipt Mode</strong>
                  <p>For {depositType} accounts, budget line mapping is NOT required. Funds will be accounted as receipt directly.</p>
                </div>
              </div>
            )}

            {showBudgetLines && (
              <div className="dft-form-row" style={{marginTop: 'var(--space-6)'}}>
                <label className="form-label">Select Originating Budget Line <span className="required">*</span></label>
                <div className="dft-budget-table-wrapper">
                  <table className="dft-budget-table">
                    <thead>
                      <tr>
                        <th>Select</th>
                        <th>Budget Head</th>
                        <th>Description</th>
                        <th>Available Budget</th>
                        <th>Mapping Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_BUDGETS.map(bl => (
                        <tr key={bl.id} 
                            className={selectedBudget === bl.id ? 'selected' : ''}
                            onClick={() => {
                              setSelectedBudget(bl.id);
                              setMappingRequested(false);
                            }}>
                          <td>
                            <input type="radio" className="dft-budget-radio" 
                                   checked={selectedBudget === bl.id} readOnly/>
                          </td>
                          <td style={{fontWeight: 600}}>{bl.head}</td>
                          <td>{bl.desc}</td>
                          <td>₹ {bl.available.toLocaleString()}</td>
                          <td>
                            <span className={`dft-status-badge ${bl.status}`}>
                              {bl.status === 'approved' ? 'FD Approved' : 'Not Mapped'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="grid-2-col dft-form-row" style={{marginTop: 'var(--space-6)'}}>
              <div className="form-group">
                <label className="form-label">Transfer Amount (₹) <span className="required">*</span></label>
                <input type="number" className="form-input" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Purpose / Remarks <span className="required">*</span></label>
                <input type="text" className="form-input" placeholder="Enter transfer purpose" />
              </div>
            </div>

            {mappingRequested && requiresMapping && (
              <div className="dft-info-callout warning">
                <AlertCircle size={16} />
                <div>
                  <strong>Mapping Required</strong>
                  <p>This budget line is not mapped to the selected PD account. Submitting will auto-generate a Mapping Request to HoAD & FD.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 2 && isPD && (
        <div className="dft-section dft-section-enter">
          <div className="dft-section-header">
            <div className="dft-section-icon"><User size={18}/></div>
            <h2>2. HoAD Review</h2>
          </div>
          <div className="dft-section-body">
            <div className="dft-info-callout info" style={{marginTop: 0, marginBottom: 'var(--space-4)'}}>
              <AlertCircle size={16} />
              <div>By-Transfer is pending. System automatically routed Mapping Request ID: <strong>MAP-2026-901</strong> to HoAD.</div>
            </div>
            
            <div className="dft-approval-form">
              <h4>HoAD Action</h4>
              <div className="form-group">
                <label className="form-label">HoAD Remarks</label>
                <input type="text" className="form-input" placeholder="Approved for mapping. Forwarded to FD." />
              </div>
              <div style={{marginTop: 'var(--space-3)'}}>
                <button className="btn btn-primary" onClick={() => { setHoadApproved(true); setStep(3); }}>
                  Forward to Finance Department
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && isPD && (
        <div className="dft-section dft-section-enter">
          <div className="dft-section-header">
            <div className="dft-section-icon"><Building size={18}/></div>
            <h2>3. Finance Department Approval</h2>
          </div>
          <div className="dft-section-body">
            <div className="dft-approval-timeline">
              <div className="dft-timeline-item done">
                <div className="dft-timeline-dot"></div>
                <div className="dft-timeline-title">Request Generated by System</div>
                <div className="dft-timeline-meta">DDO attempted transfer with unmapped budget line</div>
              </div>
              <div className="dft-timeline-item done">
                <div className="dft-timeline-dot"></div>
                <div className="dft-timeline-title">Forwarded by HoAD</div>
                <div className="dft-timeline-remark">Approved for mapping. Forwarded to FD.</div>
              </div>
              <div className="dft-timeline-item active">
                <div className="dft-timeline-dot"></div>
                <div className="dft-timeline-title">Pending FD Decision</div>
                <div className="dft-timeline-meta">Awaiting review from Finance Department</div>
              </div>
            </div>

            <div className="dft-approval-form">
              <h4>FD Action</h4>
              <div className="dft-radio-card-group">
                <label className="dft-radio-card selected-approve" onClick={() => handleSimulateFD('approved')}>
                  <input type="radio" checked={fdDecision === 'approved'} readOnly />
                  <span style={{fontWeight: 600}}>Approve Mapping</span>
                </label>
                <label className="dft-radio-card selected-reject" onClick={() => handleSimulateFD('rejected')}>
                  <input type="radio" checked={fdDecision === 'rejected'} readOnly />
                  <span style={{fontWeight: 600}}>Reject Mapping</span>
                </label>
              </div>
              
              {fdDecision === 'rejected' && (
                <div className="dft-info-callout error">
                  <AlertCircle size={16} />
                  <div>By-Transfer will be cancelled. DDO will be notified.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {step === (isPD ? 4 : 2) && (
        <div className="dft-section dft-section-enter">
          <div className="dft-section-header">
            <div className="dft-section-icon"><Receipt size={18}/></div>
            <h2>{isPD ? '4' : '2'}. Accounting & Confirmation</h2>
          </div>
          <div className="dft-section-body">
            <div className="dft-summary-grid">
              <div className="dft-summary-item">
                <span className="dft-summary-label">Transaction Reference ID</span>
                <span className="dft-summary-value" style={{color: 'var(--color-primary)'}}>TRX-BT-2026-88192</span>
              </div>
              <div className="dft-summary-item">
                <span className="dft-summary-label">Posting Status</span>
                <span className="dft-status-badge approved">Success</span>
              </div>
            </div>

            <hr className="dft-summary-divider" />

            <div className="dft-accounting-row">
              <div className="dft-accounting-icon debit"><ArrowRightLeft size={16}/></div>
              <div className="dft-accounting-details">
                <div className="label">Debit</div>
                <div className="value">Consolidated Fund {isPD ? '(Budget: 8443-00-108-0001)' : ''}</div>
              </div>
              <div className="dft-accounting-amount debit">- ₹{amount || '0'}</div>
            </div>

            <div className="dft-accounting-row">
              <div className="dft-accounting-icon credit"><CheckCircle2 size={16}/></div>
              <div className="dft-accounting-details">
                <div className="label">Credit {isPD ? '(Deposit)' : '(Challan Receipt)'}</div>
                <div className="value">Deposit Account (PD-82011)</div>
              </div>
              <div className="dft-accounting-amount credit">+ ₹{amount || '0'}</div>
            </div>

            {isPD && fdDecision === 'approved' && (
              <div className="dft-info-callout success">
                <CheckCircle2 size={16} />
                <div>
                  <strong>Post-Approval Auto-Execution</strong>
                  <p>Budget line mapping was approved by FD. Pending By-Transfer executed automatically.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="dft-action-bar">
        <div className="dft-action-bar-left">
          {step > 1 && <button className="btn btn-secondary" onClick={() => setStep(prev => prev - 1)}>Back</button>}
        </div>
        <div className="dft-action-bar-right">
          <button className="btn btn-secondary">Cancel</button>
          {step < (isPD ? 4 : 2) ? (
            <button className="btn btn-primary" onClick={handleNext} disabled={!amount || (isPD && !selectedBudget)}>
               {step === 1 && requiresMapping && !mappingRequested ? 'Initiate Transfer & Request Mapping' : 'Proceed'}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Start New Transfer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
