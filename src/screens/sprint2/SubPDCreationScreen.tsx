import { useState } from 'react';
import {
  FileText, CheckCircle2, AlertCircle, Building, User,
  IndianRupee, Layers, Receipt, ChevronRight, Save, PieChart
} from 'lucide-react';
import './SubPDCreationScreen.css';

interface BudgetLine {
  id: string;
  head: string;
  desc: string;
  available: number;
}

const MOCK_BUDGETS: BudgetLine[] = [
  { id: 'BL-1', head: '8443-00-106-0001', desc: 'Personal Deposits - General', available: 5000000 },
  { id: 'BL-2', head: '8443-00-106-0002', desc: 'Personal Deposits - Special', available: 2500000 },
];

export default function SubPDCreationScreen() {
  const [step, setStep] = useState(1);
  
  // Form State
  const [parentPd] = useState('PD-82011 - Urban Administration'); // Auto-selected from login context
  const [parentBalance] = useState(7500000);
  
  const [subPdLevel, setSubPdLevel] = useState<'L1' | 'L2'>('L1');
  const [parentSubPd, setParentSubPd] = useState('');
  const [subPdName, setSubPdName] = useState('');
  
  const [drawingLimit, setDrawingLimit] = useState('');
  const [selectedBudget, setSelectedBudget] = useState<string>('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [remarks, setRemarks] = useState('');
  
  const [createdId, setCreatedId] = useState('');

  const numLimit = parseFloat(drawingLimit) || 0;
  
  // Available balance logic based on L1 or L2
  const maxAvailable = subPdLevel === 'L1' ? parentBalance : 2000000; // Mock 20L for a selected L1 Sub-PD

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleSave = () => {
    // Generate mock ID
    const newId = subPdLevel === 'L1' ? 'SUB-L1-2026-8912' : 'SUB-L2-2026-4412';
    setCreatedId(newId);
    setStep(5); // Success step
  };

  return (
    <div className="subpd-screen animate-fade-in">
      <header>
        <h1>Sub-PD Account Creation</h1>
        <p className="header-desc">
          Create Sub-PD accounts (Level-1 and Level-2) under a Parent PD, assign drawing limits, and map specific budget lines. Limits are subject to available Parent PD balance.
        </p>
        <div className="subpd-header-badges">
          <span className="subpd-header-badge role"><User size={12}/> PD Operator Logged In</span>
          <span className="subpd-header-badge"><Building size={12}/> Parent PD: {parentPd.split(' - ')[0]}</span>
        </div>
      </header>

      {/* Stepper */}
      {step < 5 && (
        <div className="subpd-wizard-stepper">
          <div className={`subpd-step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="subpd-step-circle">{step > 1 ? <CheckCircle2 size={16}/> : '1'}</div>
            <span className="subpd-step-label">Hierarchy Setup</span>
          </div>
          <div className={`subpd-step-connector ${step > 1 ? 'completed' : ''}`} />
          
          <div className={`subpd-step-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="subpd-step-circle">{step > 2 ? <CheckCircle2 size={16}/> : '2'}</div>
            <span className="subpd-step-label">Drawing Limit</span>
          </div>
          <div className={`subpd-step-connector ${step > 2 ? 'completed' : ''}`} />
          
          <div className={`subpd-step-item ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
            <div className="subpd-step-circle">{step > 3 ? <CheckCircle2 size={16}/> : '3'}</div>
            <span className="subpd-step-label">Budget Mapping</span>
          </div>
          <div className={`subpd-step-connector ${step > 3 ? 'completed' : ''}`} />

          <div className={`subpd-step-item ${step >= 4 ? 'active' : ''} ${step > 4 ? 'completed' : ''}`}>
            <div className="subpd-step-circle">{step > 4 ? <CheckCircle2 size={16}/> : '4'}</div>
            <span className="subpd-step-label">Review</span>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="subpd-section">
          <div className="subpd-section-header">
            <div className="subpd-section-icon"><Layers size={18}/></div>
            <h2>1. Hierarchy & Account Setup</h2>
          </div>
          <div className="subpd-section-body">
            <div className="grid-2-col subpd-form-row">
              <div className="form-group">
                <label className="form-label">Parent PD</label>
                <input type="text" className="form-input" value={parentPd} disabled />
                <span className="form-helper">System derived from logged-in PD Operator</span>
              </div>
              <div className="form-group">
                <label className="form-label">Sub-PD Level <span className="required">*</span></label>
                <select className="form-input" value={subPdLevel} onChange={e => setSubPdLevel(e.target.value as 'L1' | 'L2')}>
                  <option value="L1">Level-1 Sub-PD</option>
                  <option value="L2">Level-2 Sub-PD</option>
                </select>
              </div>
            </div>

            {subPdLevel === 'L2' && (
              <div className="subpd-form-row">
                <label className="form-label">Select Parent Sub-PD (Level-1) <span className="required">*</span></label>
                <select className="form-input" value={parentSubPd} onChange={e => setParentSubPd(e.target.value)}>
                  <option value="">Select Level-1 Sub-PD...</option>
                  <option value="L1-PD-001">L1-PD-001 - North Zone Operations</option>
                  <option value="L1-PD-002">L1-PD-002 - South Zone Operations</option>
                </select>
              </div>
            )}

            <div className="grid-2-col subpd-form-row" style={{marginTop: 'var(--space-6)'}}>
              <div className="form-group">
                <label className="form-label">Sub-PD Name <span className="required">*</span></label>
                <input type="text" className="form-input" value={subPdName} onChange={e => setSubPdName(e.target.value)} placeholder="e.g. District Office Gwalior" maxLength={100} />
              </div>
              <div className="form-group">
                <label className="form-label">Sub-PD Number</label>
                <input type="text" className="form-input" value="Auto-generated on save" disabled />
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="subpd-section animate-fade-in">
          <div className="subpd-section-header">
            <div className="subpd-section-icon"><IndianRupee size={18}/></div>
            <h2>2. Drawing Limit Assignment</h2>
          </div>
          <div className="subpd-section-body">
            
            <div className="subpd-balance-card">
              <div className="subpd-balance-card-info">
                <span className="subpd-balance-card-label">
                  Available Balance ({subPdLevel === 'L1' ? 'Parent PD' : 'Parent Sub-PD L1'})
                </span>
                <span className="subpd-balance-card-value">
                  <IndianRupee size={20} strokeWidth={2.5}/>
                  {maxAvailable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="subpd-section-icon" style={{background: 'white', opacity: 0.8}}>
                <PieChart size={20}/>
              </div>
            </div>

            <div className="subpd-info-callout info" style={{marginTop: 0, marginBottom: 'var(--space-6)'}}>
              <AlertCircle size={16} />
              <div>
                <strong>Limit Rule:</strong> Total drawing limits of all Sub-PDs shall not exceed the available balance of the immediate Parent account. Limit assignment does not directly debit the Parent PD balance.
              </div>
            </div>

            <div className="grid-2-col subpd-form-row">
              <div className="form-group">
                <label className="form-label">Initial Drawing Limit (₹) <span className="required">*</span></label>
                <input 
                  type="number" 
                  className={`form-input ${numLimit > maxAvailable ? 'error' : ''}`} 
                  value={drawingLimit} 
                  onChange={e => setDrawingLimit(e.target.value)} 
                  placeholder="0.00" 
                />
                {numLimit > maxAvailable && (
                  <span className="form-helper" style={{color: 'var(--color-error)'}}>Drawing limit cannot exceed available balance.</span>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Limit Effective Date <span className="required">*</span></label>
                <input type="date" className="form-input" value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} />
              </div>
            </div>
            
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="subpd-section animate-fade-in">
          <div className="subpd-section-header">
            <div className="subpd-section-icon"><FileText size={18}/></div>
            <h2>3. Budget-Line Mapping</h2>
          </div>
          <div className="subpd-section-body">
            <p style={{marginBottom: 'var(--space-4)', color: 'var(--color-text-secondary)'}}>
              Select the budget line(s) from the Parent PD to authorize drawing against this Sub-PD limit.
            </p>

            <table className="subpd-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>Budget Head</th>
                  <th>Description</th>
                  <th>Total Budget Available</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_BUDGETS.map(bl => (
                  <tr key={bl.id} 
                      style={{ cursor: 'pointer', background: selectedBudget === bl.id ? 'var(--color-primary-10)' : 'transparent' }}
                      onClick={() => setSelectedBudget(bl.id)}>
                    <td>
                      <input type="radio" checked={selectedBudget === bl.id} readOnly/>
                    </td>
                    <td style={{fontWeight: 600}}>{bl.head}</td>
                    <td>{bl.desc}</td>
                    <td>₹ {bl.available.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="subpd-form-row" style={{marginTop: 'var(--space-6)'}}>
              <label className="form-label">Remarks (Optional)</label>
              <textarea 
                className="form-input" 
                rows={3} 
                value={remarks} 
                onChange={e => setRemarks(e.target.value)} 
                placeholder="Enter any additional remarks..."
                maxLength={250}
              />
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="subpd-section animate-fade-in">
          <div className="subpd-section-header">
            <div className="subpd-section-icon"><Receipt size={18}/></div>
            <h2>4. Review & Confirm</h2>
          </div>
          <div className="subpd-section-body">
            
            <div className="subpd-summary-box">
              <div className="subpd-summary-item">
                <span className="subpd-summary-label">Hierarchy Level</span>
                <span className="subpd-summary-value">{subPdLevel === 'L1' ? 'Level-1 Sub-PD' : 'Level-2 Sub-PD'}</span>
              </div>
              <div className="subpd-summary-item">
                <span className="subpd-summary-label">Parent Account</span>
                <span className="subpd-summary-value">{subPdLevel === 'L1' ? parentPd : parentSubPd}</span>
              </div>
              <div className="subpd-summary-item">
                <span className="subpd-summary-label">Sub-PD Name</span>
                <span className="subpd-summary-value">{subPdName}</span>
              </div>
              <div className="subpd-summary-item">
                <span className="subpd-summary-label">Drawing Limit Assigned</span>
                <span className="subpd-summary-value" style={{color: 'var(--color-primary)'}}>
                  ₹ {parseFloat(drawingLimit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="subpd-summary-item">
                <span className="subpd-summary-label">Effective Date</span>
                <span className="subpd-summary-value">{effectiveDate}</span>
              </div>
              <div className="subpd-summary-item">
                <span className="subpd-summary-label">Mapped Budget Line</span>
                <span className="subpd-summary-value">
                  {MOCK_BUDGETS.find(b => b.id === selectedBudget)?.head}
                </span>
              </div>
            </div>

            <div className="subpd-info-callout warning">
              <AlertCircle size={16} />
              <div>
                <strong>Audit Notice:</strong> This action will create a new Sub-PD account and allocate the specified drawing limit. The allocation will be logged and can only be revised by an authorized PD Operator.
              </div>
            </div>

          </div>
        </div>
      )}

      {step === 5 && (
        <div className="subpd-section animate-fade-in" style={{textAlign: 'center', padding: 'var(--space-12) var(--space-6)'}}>
          <div style={{display: 'inline-flex', padding: 'var(--space-4)', background: 'var(--color-success-10)', color: 'var(--color-success)', borderRadius: '50%', marginBottom: 'var(--space-6)'}}>
            <CheckCircle2 size={48} />
          </div>
          <h2 style={{fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-2)'}}>Sub-PD Created Successfully</h2>
          <p style={{color: 'var(--color-text-secondary)', maxWidth: '500px', margin: '0 auto var(--space-6)'}}>
            The Sub-PD account <strong>{subPdName}</strong> has been created with the assigned drawing limit and budget mappings.
          </p>
          
          <div style={{background: 'var(--color-background-alt)', display: 'inline-block', padding: 'var(--space-4) var(--space-8)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: 'var(--space-8)'}}>
            <div style={{fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)'}}>Generated Sub-PD Number</div>
            <div style={{fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-primary)'}}>{createdId}</div>
          </div>

          <div>
            <button className="btn btn-primary" onClick={() => {
              setStep(1);
              setSubPdName('');
              setDrawingLimit('');
              setSelectedBudget('');
              setEffectiveDate('');
              setRemarks('');
              setCreatedId('');
            }}>Create Another Sub-PD</button>
            <button className="btn btn-secondary" style={{marginLeft: 'var(--space-4)'}}>Go to Dashboard</button>
          </div>
        </div>
      )}

      {step < 5 && (
        <div className="subpd-action-bar">
          <div className="subpd-action-bar-left">
            {step > 1 && <button className="btn btn-secondary" onClick={() => setStep(prev => prev - 1)}>Back</button>}
          </div>
          <div className="subpd-action-bar-right">
            <button className="btn btn-secondary">Cancel</button>
            {step < 4 ? (
              <button 
                className="btn btn-primary" 
                onClick={handleNext} 
                disabled={
                  (step === 1 && (!subPdName || (subPdLevel === 'L2' && !parentSubPd))) ||
                  (step === 2 && (!drawingLimit || numLimit <= 0 || numLimit > maxAvailable || !effectiveDate)) ||
                  (step === 3 && (!selectedBudget))
                }
              >
                 Next Step <ChevronRight size={16} style={{marginLeft: 'var(--space-1)'}}/>
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleSave}>
                <Save size={16} style={{marginRight: 'var(--space-2)'}}/> Create Sub-PD
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
