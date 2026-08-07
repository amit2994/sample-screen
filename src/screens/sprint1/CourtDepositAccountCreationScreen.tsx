import React, { useState } from 'react';
import { HelpCircle, Check, AlertCircle } from 'lucide-react';
import CommentLayer from '../../components/feedback/CommentLayer';
import './CourtDepositAccountCreationScreen.css';

// Interface definitions
interface CourtData {
  code: string;
  name: string;
}

const MOCK_COURTS: Record<string, CourtData> = {
  'CRT-BPL-01': { code: 'CRT-BPL-01', name: 'First Class Judicial Magistrate Court, Bhopal' },
  'CRT-BPL-02': { code: 'CRT-BPL-02', name: 'Second Class Judicial Magistrate Court, Bhopal' },
  'CRT-IND-01': { code: 'CRT-IND-01', name: 'Registrar Court House, Indore' },
  'CRT-GWL-01': { code: 'CRT-GWL-01', name: 'Chief Judicial Magistrate Court Bench, Gwalior' }
};

export default function CourtDepositAccountCreationScreen() {
  // Form State
  const [depositType, setDepositType] = useState('CCD');
  const [ddoCode] = useState('DDO-209110-CRT');
  const [ddoName] = useState('District & Sessions Judge Court, Bhopal');
  const [hooCode] = useState('HOO-409110-GEN');
  const [hooName] = useState('Head of Office, Court Affairs Directorate');
  const [courtCode, setCourtCode] = useState('');
  const [courtName, setCourtName] = useState('');
  const [purpose, setPurpose] = useState('');

  // Head Structure Details State
  const [majorHead, setMajorHead] = useState('8443');
  const [subMajorHead, setSubMajorHead] = useState('00');
  const [minorHead, setMinorHead] = useState('104');
  const [publicAccountScheme, setPublicAccountScheme] = useState('');

  // Status & Notification State
  const [toast, setToast] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (type: 'success' | 'warning' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Handlers
  const handleCourtChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setCourtCode(code);
    if (code && MOCK_COURTS[code]) {
      setCourtName(MOCK_COURTS[code].name);
    } else {
      setCourtName('');
    }
  };

  const handleReset = () => {
    setDepositType('CCD');
    setCourtCode('');
    setCourtName('');
    setPurpose('');
    setMajorHead('8443');
    setSubMajorHead('00');
    setMinorHead('104');
    setPublicAccountScheme('');
    showToast('success', 'Form values successfully reset.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!courtCode) {
      showToast('error', 'Validation failed: Court Code is required.');
      return;
    }
    if (!publicAccountScheme) {
      showToast('error', 'Validation failed: Public Account Scheme is required under Head Structure Details.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const generatedReqNo = `CCD/REQ/2026/${Math.floor(10000 + Math.random() * 90000)}`;
      showToast('success', `Request submitted successfully! Account opening request ID generated: ${generatedReqNo}`);
      setIsSubmitting(false);
    }, 1500);
  };

  const handleClose = () => {
    window.location.href = '/';
  };

  return (
    <CommentLayer screenId="sprint1-court-deposit-creation" moduleName="deposit">
      <div className="court-deposit-screen">
        {/* Navigation Breadcrumb Bar */}
        <div className="court-deposit-breadcrumb">
          <span>Deposit Processes &gt; Deposit Account Creation &gt; Creation of Court Deposit Account</span>
        </div>

        {/* Tab Title Box */}
        <div className="court-deposit-tab-container">
          <div className="court-deposit-tab-active">
            Civil Court Deposit Account Creation
          </div>
        </div>

        {/* Screen container */}
        <div className="court-deposit-content">
          {/* Toast Notification */}
          {toast && (
            <div className={`court-deposit-toast ${toast.type} animate-scale-in`}>
              <div className="court-deposit-toast-icon">
                {toast.type === 'success' && <Check size={16} />}
                {toast.type === 'warning' && <AlertCircle size={16} />}
                {toast.type === 'error' && <AlertCircle size={16} />}
              </div>
              <div className="court-deposit-toast-text">{toast.message}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Card: Court Deposit Account Details */}
            <div className="gov-card">
              <div className="gov-card-header">
                Court Deposit Account Details
              </div>
              <div className="gov-card-body">
                <div className="court-deposit-grid">
                  
                  <div className="court-form-group">
                    <label className="court-form-label">
                      Deposit Type <span className="required-star">*</span>
                    </label>
                    <select 
                      className="court-form-select" 
                      value={depositType} 
                      onChange={(e) => setDepositType(e.target.value)}
                    >
                      <option value="CCD">CCD</option>
                      <option value="SD">SD</option>
                      <option value="RD">RD</option>
                    </select>
                  </div>

                  <div className="court-form-group">
                    <label className="court-form-label">DDO Code</label>
                    <input 
                      type="text" 
                      className="court-form-input disabled-input" 
                      value={ddoCode} 
                      placeholder="Auto-resolved DDO Code" 
                      disabled 
                    />
                  </div>

                  <div className="court-form-group">
                    <label className="court-form-label">DDO Name</label>
                    <input 
                      type="text" 
                      className="court-form-input disabled-input" 
                      value={ddoName} 
                      placeholder="Auto-resolved DDO Name" 
                      disabled 
                    />
                  </div>

                  <div className="court-form-group col-start-1">
                    <label className="court-form-label">HoO Code</label>
                    <input 
                      type="text" 
                      className="court-form-input disabled-input" 
                      value={hooCode} 
                      placeholder="Auto-resolved HoO Code" 
                      disabled 
                    />
                  </div>

                  <div className="court-form-group">
                    <label className="court-form-label">HoO Name</label>
                    <input 
                      type="text" 
                      className="court-form-input disabled-input" 
                      value={hooName} 
                      placeholder="Auto-resolved HoO Name" 
                      disabled 
                    />
                  </div>

                  <div className="court-form-group">
                    <label className="court-form-label">
                      Court Code <span className="required-star">*</span>
                    </label>
                    <select 
                      className="court-form-select" 
                      value={courtCode} 
                      onChange={handleCourtChange}
                    >
                      <option value="">------ Select ------</option>
                      <option value="CRT-BPL-01">CRT-BPL-01</option>
                      <option value="CRT-BPL-02">CRT-BPL-02</option>
                      <option value="CRT-IND-01">CRT-IND-01</option>
                      <option value="CRT-GWL-01">CRT-GWL-01</option>
                    </select>
                  </div>

                  <div className="court-form-group col-start-1">
                    <label className="court-form-label">Court Name</label>
                    <input 
                      type="text" 
                      className="court-form-input disabled-input" 
                      value={courtName} 
                      placeholder="Auto-resolved Court Name" 
                      disabled 
                    />
                  </div>

                  <div className="court-form-group">
                    <label className="court-form-label">Purpose</label>
                    <div className="purpose-wrapper">
                      <textarea 
                        className="court-form-textarea" 
                        value={purpose} 
                        onChange={(e) => setPurpose(e.target.value)} 
                        placeholder="Specify the purpose of this Court Deposit Account creation..."
                        rows={2}
                      />
                      <div className="purpose-toolbar">
                        <span className="purpose-icon-help" title="Spellcheck / Help Guide">
                          <HelpCircle size={14} />
                        </span>
                        <span className="purpose-abc" title="Validation Active">ABC ✓</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Card: Head Structure Details */}
            <div className="gov-card mt-4">
              <div className="gov-card-header">
                Head Structure Details
              </div>
              <div className="gov-card-body p-0">
                {/* Yellow header and selectors table */}
                <div className="head-structure-table">
                  <div className="head-structure-thead">
                    <div className="head-col">Major Head</div>
                    <div className="head-col">Sub Major Head</div>
                    <div className="head-col">Minor Head</div>
                    <div className="head-col">Public Account Scheme</div>
                  </div>
                  <div className="head-structure-tbody">
                    <div className="head-col">
                      <label className="head-mobile-label">Major Head</label>
                      <div className="inline-select-wrapper">
                        <select 
                          className="court-form-select inline-select" 
                          value={majorHead} 
                          onChange={(e) => setMajorHead(e.target.value)}
                        >
                          <option value="8443">8443 : Civil Deposits</option>
                          <option value="8444">8444 : Defense Deposits</option>
                        </select>
                        <span className="required-star inline-star">*</span>
                      </div>
                    </div>
                    <div className="head-col">
                      <label className="head-mobile-label">Sub Major Head</label>
                      <div className="inline-select-wrapper">
                        <select 
                          className="court-form-select inline-select" 
                          value={subMajorHead} 
                          onChange={(e) => setSubMajorHead(e.target.value)}
                        >
                          <option value="00">00 : Civil Deposits</option>
                          <option value="01">01 : Other Deposits</option>
                        </select>
                        <span className="required-star inline-star">*</span>
                      </div>
                    </div>
                    <div className="head-col">
                      <label className="head-mobile-label">Minor Head</label>
                      <div className="inline-select-wrapper">
                        <select 
                          className="court-form-select inline-select" 
                          value={minorHead} 
                          onChange={(e) => setMinorHead(e.target.value)}
                        >
                          <option value="104">104 : Civil Courts Deposits</option>
                          <option value="101">101 : Security Deposits</option>
                          <option value="106">106 : Personal Deposit Accounts</option>
                        </select>
                        <span className="required-star inline-star">*</span>
                      </div>
                    </div>
                    <div className="head-col">
                      <label className="head-mobile-label">Public Account Scheme</label>
                      <div className="inline-select-wrapper">
                        <select 
                          className="court-form-select inline-select" 
                          value={publicAccountScheme} 
                          onChange={(e) => setPublicAccountScheme(e.target.value)}
                        >
                          <option value="">------ Select ------</option>
                          <option value="SCH-CCD-001">01 : Regular CCD Scheme (Bhopal)</option>
                          <option value="SCH-CCD-002">02 : CCD Registrar Scheme (Indore)</option>
                          <option value="SCH-CCD-003">03 : Judicial Magistrate Pool Scheme (Gwalior)</option>
                        </select>
                        <span className="required-star inline-star">*</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons centered */}
            <div className="court-actions-bar">
              <button 
                type="submit" 
                className="gov-btn gov-btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
              <button 
                type="button" 
                className="gov-btn gov-btn-save" 
                onClick={() => showToast('success', 'Draft saved locally.')}
              >
                Save
              </button>
              <button 
                type="button" 
                className="gov-btn gov-btn-reset" 
                onClick={handleReset}
              >
                Reset
              </button>
              <button 
                type="button" 
                className="gov-btn gov-btn-close" 
                onClick={handleClose}
              >
                Close
              </button>
            </div>

          </form>
        </div>
      </div>
    </CommentLayer>
  );
}
