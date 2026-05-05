import { useState } from 'react';
import {
  CheckCircle2, AlertCircle, Building, User,
  CreditCard, ArrowRightLeft, Database, Receipt, ChevronDown
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

const MOCK_ACCOUNT_BUDGETS = [
  { id: 'M-1', head: '8443-00-106-0001', available: 5000000, accountId: 'PD-82011' },
  { id: 'M-2', head: '8443-00-106-0002', available: 2500000, accountId: 'PD-82011' },
  { id: 'M-3', head: '8443-00-111-0001', available: 12000000, accountId: 'PD-49320' }
];
const ACCOUNT_DETAILS: Record<string, { treasury: string; purpose: string }> = {
  'PD-82011': { treasury: 'District Treasury, Central', purpose: 'General Administration Fund' },
  'PD-49320': { treasury: 'Sub-Treasury, Rural', purpose: 'Rural Development Schemes' }
};

export default function DepositFundTransferScreen() {
  const [step, setStep] = useState(1);
  const [depositType] = useState('PD');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [selectedBudget, setSelectedBudget] = useState<string>('');
  const [isBudgetDropdownOpen, setIsBudgetDropdownOpen] = useState(false);

  // PD-CF specific states
  const [mappingRequested, setMappingRequested] = useState(false);
  const [, setHoadApproved] = useState(false);
  const [fdDecision, setFdDecision] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [showMappingForm, setShowMappingForm] = useState(false);
  const [mapFormAccount, setMapFormAccount] = useState('');
  const [mapFormBudgets, setMapFormBudgets] = useState<string[]>([]);
  const [isMapBudgetDropdownOpen, setIsMapBudgetDropdownOpen] = useState(false);

  const isPD = depositType === 'PD';
  const filteredBudgets = MOCK_ACCOUNT_BUDGETS.filter(bl => bl.accountId === selectedAccount);
  const isBudgetMappedToAccount = selectedBudget ? filteredBudgets.some(bl => bl.head === MOCK_BUDGETS.find(b => b.id === selectedBudget)?.head) : true;
  const requiresMapping = isPD && selectedBudget !== '' && !isBudgetMappedToAccount;
  const showBudgetLines = isPD;

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleSimulateFD = (decision: 'approved' | 'rejected') => {
    setFdDecision(decision);
    if (decision === 'approved') setStep(4);
  };

  if (showMappingForm) {
    const unmappedBudgets = MOCK_BUDGETS.filter(b => {
      if (!mapFormAccount) return true;
      const acctBudgets = MOCK_ACCOUNT_BUDGETS.filter(ab => ab.accountId === mapFormAccount);
      return !acctBudgets.some(ab => ab.head === b.head);
    });

    return (
      <div className="dft-screen animate-fade-in">
        <header>
          <h1>Initiate Mapping Request</h1>
          <p className="header-desc">
            Request HoAD and FD approval to map a new budget line to a deposit account.
          </p>
        </header>

        <div className="dft-section">
          <div className="dft-section-header">
            <div className="dft-section-icon"><AlertCircle size={18} /></div>
            <h2>Mapping Request Details</h2>
          </div>
          <div className="dft-section-body">
            <div className="grid-2-col dft-form-row">
              <div className="form-group">
                <label className="form-label">Select Deposit Account <span className="required">*</span></label>
                <select className="form-input" value={mapFormAccount} onChange={e => {
                  setMapFormAccount(e.target.value);
                  setMapFormBudgets([]);
                  setIsMapBudgetDropdownOpen(false);
                }}>
                  <option value="">Select Account...</option>
                  <option value="PD-82011">PD-82011 - Urban Administration</option>
                  <option value="PD-49320">PD-49320 - Rural Development</option>
                </select>
              </div>
              <div className="form-group"></div>
            </div>

            {mapFormAccount && (
              <>
                <div className="grid-2-col dft-form-row" style={{ marginTop: 'var(--space-6)' }}>
                  <div className="form-group">
                    <label className="form-label">Treasury</label>
                    <input type="text" className="form-input" value={ACCOUNT_DETAILS[mapFormAccount]?.treasury || ''} disabled />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Purpose Code</label>
                    <input type="text" className="form-input" value={ACCOUNT_DETAILS[mapFormAccount]?.purpose || ''} disabled />
                  </div>
                </div>

                <div className="grid-2-col dft-form-row" style={{ marginTop: 'var(--space-6)', paddingBottom: isMapBudgetDropdownOpen ? '220px' : '0', transition: 'padding-bottom 0.2s ease' }}>
                  <div className="form-group" style={{ position: 'relative' }}>
                    <label className="form-label">Select Budget Line(s) <span className="required">*</span></label>
                    <div 
                      className={`form-input ${!mapFormAccount ? 'disabled' : ''}`}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: mapFormAccount ? 'pointer' : 'not-allowed', backgroundColor: mapFormAccount ? 'var(--color-background)' : 'var(--color-background-alt)' }}
                      onClick={() => {
                        if (mapFormAccount) setIsMapBudgetDropdownOpen(!isMapBudgetDropdownOpen);
                      }}
                    >
                      <span>
                        {mapFormBudgets.length === 0 
                          ? 'Select Unmapped Budget Line...' 
                          : `${mapFormBudgets.length} Budget Line(s) Selected`}
                      </span>
                      <ChevronDown size={16} />
                    </div>
                    
                    {isMapBudgetDropdownOpen && mapFormAccount && (
                      <div className="custom-dropdown-panel" style={{
                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999,
                        backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)', marginTop: 'var(--space-1)',
                        maxHeight: '200px', overflowY: 'auto', boxShadow: 'var(--shadow-lg)'
                      }}>
                        {unmappedBudgets.length > 0 ? unmappedBudgets.map(b => (
                          <label key={b.id} style={{
                            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                            padding: 'var(--space-3)', cursor: 'pointer', borderBottom: '1px solid var(--color-border-light)'
                          }}>
                            <input 
                              type="checkbox" 
                              checked={mapFormBudgets.includes(b.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setMapFormBudgets([...mapFormBudgets, b.id]);
                                } else {
                                  setMapFormBudgets(mapFormBudgets.filter(id => id !== b.id));
                                }
                              }}
                              style={{ cursor: 'pointer', accentColor: 'var(--color-primary)', width: '16px', height: '16px' }}
                            />
                            <span>{b.head} - {b.desc}</span>
                          </label>
                        )) : (
                          <div style={{ padding: 'var(--space-3)', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
                            No unmapped budget lines available.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Remarks <span className="required">*</span></label>
                    <input type="text" className="form-input" placeholder="Enter remarks for mapping request" disabled={!mapFormAccount} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="dft-action-bar">
          <div className="dft-action-bar-left">
            <button className="btn btn-secondary" onClick={() => setShowMappingForm(false)}>Back to Transfer</button>
          </div>
          <div className="dft-action-bar-right">
            <button 
              className="btn btn-primary" 
              disabled={!mapFormAccount || mapFormBudgets.length === 0}
              onClick={() => {
                setSelectedAccount(mapFormAccount);
                setSelectedBudget(mapFormBudgets[0]);
                setMappingRequested(true);
                setShowMappingForm(false);
              }}
            >
              Submit Mapping Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dft-screen animate-fade-in">
      <header>
        <h1>Deposit Fund Transfer – CF Mode</h1>
        <p className="header-desc">
          Transfer funds from Consolidated Fund to eligible Deposit Accounts.
          PD-CF transfers require FD-approved budget line mapping.
        </p>
        <div className="dft-header-badges">
          <span className="dft-header-badge role"><User size={12} /> DDO Logged In</span>
          <span className="dft-header-badge origin"><Building size={12} /> BMS Originated</span>
          <span className="dft-header-badge fund"><Database size={12} /> CF Mode</span>
        </div>
      </header>

      {/* Stepper */}
      <div className="dft-wizard-stepper">
        <div className={`dft-step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="dft-step-circle">{step > 1 ? <CheckCircle2 size={16} /> : '1'}</div>
          <span className="dft-step-label">Initiation</span>
        </div>
        <div className={`dft-step-connector ${step > 1 ? 'completed' : ''}`} />

        {isPD && (
          <>
            <div className={`dft-step-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <div className="dft-step-circle">{step > 2 ? <CheckCircle2 size={16} /> : '2'}</div>
              <span className="dft-step-label">HoAD Review</span>
            </div>
            <div className={`dft-step-connector ${step > 2 ? 'completed' : ''}`} />

            <div className={`dft-step-item ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
              <div className="dft-step-circle">{step > 3 ? <CheckCircle2 size={16} /> : '3'}</div>
              <span className="dft-step-label">FD Approval</span>
            </div>
            <div className={`dft-step-connector ${step > 3 ? 'completed' : ''}`} />
          </>
        )}

        <div className={`dft-step-item ${step >= 4 ? 'active' : ''} ${step > 4 ? 'completed' : ''}`}>
          <div className="dft-step-circle">{step > 4 ? <CheckCircle2 size={16} /> : (isPD ? '4' : '2')}</div>
          <span className="dft-step-label">Accounting</span>
        </div>
      </div>

      {step === 1 && (
        <div className="dft-section">
          <div className="dft-section-header">
            <div className="dft-section-icon"><CreditCard size={18} /></div>
            <h2>1. Transfer Details</h2>
          </div>
          <div className="dft-section-body">
            <div className="grid-2-col dft-form-row">
              <div className="form-group">
                <label className="form-label">Deposit Type <span className="required">*</span></label>
                <input type="text" className="form-input" value="Personal Deposit (PD)" disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Deposit Account <span className="required">*</span></label>
                <select className="form-input" value={selectedAccount} onChange={e => {
                  setSelectedAccount(e.target.value);
                  setSelectedBudget('');
                  setMappingRequested(false);
                }}>
                  <option value="">Select Account...</option>
                  <option value="PD-82011">PD-82011 - Urban Administration</option>
                  <option value="PD-49320">PD-49320 - Rural Development</option>
                </select>
                <span className="form-helper" style={{ color: 'var(--color-success)' }}>Account is Active & CF Eligible</span>
              </div>
            </div>

            {selectedAccount && (
              <div className="grid-2-col dft-form-row" style={{ marginTop: 'var(--space-6)' }}>
                <div className="form-group">
                  <label className="form-label">Treasury</label>
                  <input type="text" className="form-input" value={ACCOUNT_DETAILS[selectedAccount]?.treasury || ''} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">Purpose Code</label>
                  <input type="text" className="form-input" value={ACCOUNT_DETAILS[selectedAccount]?.purpose || ''} disabled />
                </div>
              </div>
            )}

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
              <div className="dft-form-row" style={{ marginTop: 'var(--space-6)' }}>
                {selectedAccount && (
                  <div style={{ marginBottom: 'var(--space-6)' }}>
                    <label className="form-label">Mapped Budget Lines for Selected Account</label>
                    <div className="dft-budget-table-wrapper">
                      <table className="dft-budget-table">
                        <thead>
                          <tr>
                            <th>Budget Head</th>
                            <th>Available Budget</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBudgets.length > 0 ? filteredBudgets.map(bl => (
                            <tr key={bl.id}>
                              <td style={{ fontWeight: 600 }}>{bl.head}</td>
                              <td>₹ {bl.available.toLocaleString('en-IN')}</td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={2} style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--color-text-tertiary)' }}>
                                No budget lines found for this account.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <label className="form-label">Select Originating Budget Line <span className="required">*</span></label>
                <div
                  className="form-input"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'var(--color-background)' }}
                  onClick={() => setIsBudgetDropdownOpen(!isBudgetDropdownOpen)}
                >
                  {!selectedBudget ? (
                    <span>Select Budget Line...</span>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)', alignItems: 'center', flex: 1 }}>
                      {(() => {
                        const bl = MOCK_BUDGETS.find(b => b.id === selectedBudget)!;
                        return (
                          <>
                            <span style={{ fontWeight: 600 }}>{bl.head}</span>
                            <span>₹ {bl.available.toLocaleString('en-IN')}</span>
                            <span>
                              <span className={`dft-status-badge ${bl.status}`} style={{ margin: 0 }}>
                                {bl.status === 'approved' ? 'FD Approved' : 'Not Mapped'}
                              </span>
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  )}
                  <ChevronDown size={16} style={{ marginLeft: 'var(--space-4)' }} />
                </div>

                {isBudgetDropdownOpen && (
                  <div className="dft-budget-table-wrapper" style={{ marginTop: 'var(--space-2)' }}>
                    <table className="dft-budget-table">
                      <thead>
                        <tr>
                          <th>Select</th>
                          <th>Budget Head</th>
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
                              setIsBudgetDropdownOpen(false);
                            }}>
                            <td>
                              <input type="radio" className="dft-budget-radio"
                                checked={selectedBudget === bl.id} readOnly />
                            </td>
                            <td style={{ fontWeight: 600 }}>{bl.head}</td>
                            <td>₹ {bl.available.toLocaleString('en-IN')}</td>
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
                )}
              </div>
            )}

            <div className="grid-2-col dft-form-row" style={{ marginTop: 'var(--space-6)' }}>
              <div className="form-group">
                <label className="form-label">Transfer Amount (₹) <span className="required">*</span></label>
                <input type="number" className="form-input" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Purpose / Remarks <span className="required">*</span></label>
                <input type="text" className="form-input" placeholder="Enter transfer purpose" />
              </div>
            </div>

            {requiresMapping && mappingRequested && (
              <div className="dft-info-callout warning" style={{ marginTop: 'var(--space-6)' }}>
                <CheckCircle2 size={16} />
                <div>
                  <strong>Mapping Request Initiated</strong>
                  <p>Pending HoAD & FD Approval.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 2 && isPD && (
        <div className="dft-section dft-section-enter">
          <div className="dft-section-header">
            <div className="dft-section-icon"><User size={18} /></div>
            <h2>2. HoAD Review</h2>
          </div>
          <div className="dft-section-body">
            <div className="dft-info-callout info" style={{ marginTop: 0, marginBottom: 'var(--space-4)' }}>
              <AlertCircle size={16} />
              <div>By-Transfer is pending. System automatically routed Mapping Request ID: <strong>MAP-2026-901</strong> to HoAD.</div>
            </div>

            <div className="dft-approval-form">
              <h4>HoAD Action</h4>
              <div className="form-group">
                <label className="form-label">HoAD Remarks</label>
                <input type="text" className="form-input" placeholder="Approved for mapping. Forwarded to FD." />
              </div>
              <div style={{ marginTop: 'var(--space-3)' }}>
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
            <div className="dft-section-icon"><Building size={18} /></div>
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
                  <span style={{ fontWeight: 600 }}>Approve Mapping</span>
                </label>
                <label className="dft-radio-card selected-reject" onClick={() => handleSimulateFD('rejected')}>
                  <input type="radio" checked={fdDecision === 'rejected'} readOnly />
                  <span style={{ fontWeight: 600 }}>Reject Mapping</span>
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
            <div className="dft-section-icon"><Receipt size={18} /></div>
            <h2>{isPD ? '4' : '2'}. Accounting & Confirmation</h2>
          </div>
          <div className="dft-section-body">
            <div className="dft-summary-grid">
              <div className="dft-summary-item">
                <span className="dft-summary-label">Transaction Reference ID</span>
                <span className="dft-summary-value" style={{ color: 'var(--color-primary)' }}>TRX-BT-2026-88192</span>
              </div>
              <div className="dft-summary-item">
                <span className="dft-summary-label">Posting Status</span>
                <span className="dft-status-badge approved">Success</span>
              </div>
            </div>

            <hr className="dft-summary-divider" />

            <div className="dft-accounting-row">
              <div className="dft-accounting-icon debit"><ArrowRightLeft size={16} /></div>
              <div className="dft-accounting-details">
                <div className="label">Debit</div>
                <div className="value">Consolidated Fund {isPD ? '(Budget: 8443-00-108-0001)' : ''}</div>
              </div>
              <div className="dft-accounting-amount debit">- ₹{amount || '0'}</div>
            </div>

            <div className="dft-accounting-row">
              <div className="dft-accounting-icon credit"><CheckCircle2 size={16} /></div>
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
            <button
              className="btn btn-primary"
              onClick={handleNext}
              disabled={!amount || (isPD && !selectedBudget) || (requiresMapping && !mappingRequested)}
            >
              Proceed
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Start New Transfer
            </button>
          )}
        </div>
      </div>

      {/* Modal Popup for Mapping Request */}
      {requiresMapping && !mappingRequested && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: '#ffffff', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)',
            width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', color: 'var(--color-warning)' }}>
              <AlertCircle size={24} />
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text)' }}>Mapping Required</h3>
            </div>

            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 'var(--space-6)' }}>
              The selected budget line is not linked to this deposit account. Your request will be sent for approval through the HoAD and FD departments.</p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedBudget('')}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setMapFormAccount(selectedAccount);
                  setMapFormBudgets(selectedBudget ? [selectedBudget] : []);
                  setShowMappingForm(true);
                }}
              >
                Initiate Request to Map Budget Line
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
