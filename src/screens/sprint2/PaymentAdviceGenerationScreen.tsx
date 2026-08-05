import React, { useState } from 'react';
import {
  Building, User, FileText, CreditCard,
  AlertCircle, Trash2, Eye, UploadCloud, ShieldCheck,
  RefreshCw, File, ChevronDown, ChevronUp, Check
} from 'lucide-react';
import './PaymentAdviceGenerationScreen.css';

// --- Interfaces & Types ---
interface SubPDAccount {
  id: string;
  parent: string;
  admin: string;
  hoa: string;
  balance: number;
}

interface Vendor {
  code: string;
  name: string;
  bankName: string;
  accountNo: string;
  branchName: string;
  ifscCode: string;
}

interface ClaimRecord {
  id: string;
  subPdId: string;
  vendorCode: string;
  amount: number;
  paymentMode: string;
  status: string;
  date: string;
}

// --- Mock Data ---
const MOCK_SUB_PDS: SubPDAccount[] = [
  {
    id: 'SUB-PD-82011-01',
    parent: 'PD-82011 - Urban Administration',
    admin: 'Municipal Commissioner, Bhopal',
    hoa: '8443-00-106-0000',
    balance: 4500000
  },
  {
    id: 'SUB-PD-82011-02',
    parent: 'PD-82011 - Urban Administration',
    admin: 'Deputy Director Finance, Indore',
    hoa: '8443-00-106-0000',
    balance: 1500000
  },
  {
    id: 'SUB-PD-49320-01',
    parent: 'PD-49320 - Rural Development',
    admin: 'Zila Panchayat CEO, Gwalior',
    hoa: '8443-00-111-0000',
    balance: 250000
  }
];

const MOCK_VENDORS: Vendor[] = [
  {
    code: 'VND-1001',
    name: 'Apex Infra Projects Ltd.',
    bankName: 'State Bank of India',
    accountNo: '12345678901',
    branchName: 'Bhopal Main Branch',
    ifscCode: 'SBIN0000001'
  },
  {
    code: 'VND-1002',
    name: 'Shree Balaji Constructions',
    bankName: 'HDFC Bank',
    accountNo: '98765432109',
    branchName: 'Indore Vijay Nagar',
    ifscCode: 'HDFC0000123'
  },
  {
    code: 'VND-1003',
    name: 'R. K. Enterprises',
    bankName: 'Punjab National Bank',
    accountNo: '55555666667',
    branchName: 'Jabalpur Civil Lines',
    ifscCode: 'PUNB0123400'
  }
];

const INITIAL_CLAIMS: ClaimRecord[] = [
  {
    id: 'CLM-2026-08129',
    subPdId: 'SUB-PD-82011-01',
    vendorCode: 'VND-1001',
    amount: 1250000,
    paymentMode: 'e-Payment',
    status: 'Pending Verification',
    date: '2026-06-20'
  },
  {
    id: 'CLM-2026-08110',
    subPdId: 'SUB-PD-82011-02',
    vendorCode: 'VND-1002',
    amount: 450000,
    paymentMode: 'Physical Cheque',
    status: 'Approved',
    date: '2026-06-18'
  }
];

export default function PaymentAdviceGenerationScreen() {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');

  // Accordion Expand/Collapse States
  const [accordions, setAccordions] = useState({
    step1: true,
    step2: false,
    step3: false,
    step4: false,
    step5: false
  });

  // Toast Notification State
  const [toast, setToast] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'warning' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 5000);
  };

  // --- Form States ---

  // Step 1: Deposit Account & Purpose Selection
  const [selectedSubPdId, setSelectedSubPdId] = useState('');
  const [challanNo, setChallanNo] = useState('');

  // Step 2: Vendor Details
  const [selectedVendorCode, setSelectedVendorCode] = useState('');
  const [selectedClaimNo, setSelectedClaimNo] = useState('');

  // Step 3: Mode of Payment
  const [paymentMode, setPaymentMode] = useState('e-Payment');
  const [byTransferDeduction, setByTransferDeduction] = useState(false);
  const [claimAmount, setClaimAmount] = useState('');

  // Step 4: Remarks and Attachment
  const [remarks, setRemarks] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([
    { id: 'file-1', name: 'File-Sanction-1 (10mb)' },
    { id: 'file-2', name: 'File-Sanction-2 (10mb)' },
    { id: 'file-3', name: 'File-Sanction-3 (10mb)' },
    { id: 'file-4', name: 'File-Sanction-4 (10mb)' }
  ]);

  // Step 5: E-Sign
  const [ackChecked, setAckChecked] = useState(false);
  const [esignStatus, setEsignStatus] = useState<'not_signed' | 'signing' | 'signed'>('not_signed');

  // --- Dynamic Resolutions ---
  const activeSubPd = MOCK_SUB_PDS.find(p => p.id === selectedSubPdId);
  const activeVendor = MOCK_VENDORS.find(v => v.code === selectedVendorCode);

  // Claims List State
  const [claims, setClaims] = useState<ClaimRecord[]>(INITIAL_CLAIMS);

  // --- Form Reset ---
  const handleReset = () => {
    setSelectedSubPdId('');
    setChallanNo('');
    setSelectedVendorCode('');
    setSelectedClaimNo('');
    setPaymentMode('e-Payment');
    setByTransferDeduction(false);
    setClaimAmount('');
    setRemarks('');
    setAckChecked(false);
    setEsignStatus('not_signed');
    setAccordions({
      step1: true,
      step2: false,
      step3: false,
      step4: false,
      step5: false
    });
    showToast('success', 'Form values successfully reset.');
  };

  // --- Save as Draft ---
  const handleSaveDraft = () => {
    showToast('success', 'Claim details saved successfully in local drafts.');
  };

  // --- Submit Claim ---
  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!selectedSubPdId) {
      showToast('error', 'Validation failed: Please select a Sub-PD Account in Step 1.');
      setAccordions(prev => ({ ...prev, step1: true }));
      return;
    }
    if (!selectedVendorCode) {
      showToast('error', 'Validation failed: Please select a Vendor in Step 2.');
      setAccordions(prev => ({ ...prev, step2: true }));
      return;
    }
    if (!claimAmount || parseFloat(claimAmount) <= 0) {
      showToast('error', 'Validation failed: Please enter a valid claim amount in Step 3.');
      setAccordions(prev => ({ ...prev, step3: true }));
      return;
    }
    if (activeSubPd && parseFloat(claimAmount) > activeSubPd.balance) {
      showToast('error', `Validation failed: Claim amount exceeds available HOA Balance of ₹${activeSubPd.balance.toLocaleString('en-IN')}.`);
      setAccordions(prev => ({ ...prev, step3: true }));
      return;
    }
    if (!remarks.trim()) {
      showToast('error', 'Validation failed: Remarks are mandatory in Step 4.');
      setAccordions(prev => ({ ...prev, step4: true }));
      return;
    }
    if (esignStatus !== 'signed') {
      showToast('error', 'Validation failed: Digital signature is required. Please execute E-Sign in Step 5.');
      setAccordions(prev => ({ ...prev, step5: true }));
      return;
    }

    // Add to list
    const newClaim: ClaimRecord = {
      id: `CLM-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      subPdId: selectedSubPdId,
      vendorCode: selectedVendorCode,
      amount: parseFloat(claimAmount),
      paymentMode,
      status: 'Pending Verification',
      date: new Date().toISOString().split('T')[0]
    };

    setClaims([newClaim, ...claims]);
    showToast('success', `Claim ${newClaim.id} submitted successfully to treasury scroll.`);

    // Reset form and go to list
    handleReset();
    setActiveTab('list');
  };

  // --- E-Sign Simulation ---
  const handlePerformEsign = () => {
    if (!ackChecked) {
      showToast('warning', 'Please check the acknowledgement checkbox first.');
      return;
    }
    setEsignStatus('signing');
    setTimeout(() => {
      setEsignStatus('signed');
      showToast('success', 'Digital signature attached successfully using DSC Class-3 Certificate.');
    }, 2000);
  };

  // --- Accordion Toggles ---
  const toggleAccordion = (step: 'step1' | 'step2' | 'step3' | 'step4' | 'step5') => {
    setAccordions(prev => ({
      ...prev,
      [step]: !prev[step]
    }));
  };

  const handleNextStep = (currentStep: 'step1' | 'step2' | 'step3' | 'step4', nextStep: 'step2' | 'step3' | 'step4' | 'step5') => {
    setAccordions(prev => ({
      ...prev,
      [currentStep]: false,
      [nextStep]: true
    }));
  };

  const handleExpandAll = () => {
    setAccordions({
      step1: true,
      step2: true,
      step3: true,
      step4: true,
      step5: true
    });
  };

  const handleCollapseAll = () => {
    setAccordions({
      step1: false,
      step2: false,
      step3: false,
      step4: false,
      step5: false
    });
  };

  // --- Delete File ---
  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    showToast('success', 'Sanction attachment removed.');
  };

  return (
    <div className="dpp-screen animate-fade-in">

      {/* Toast Alert */}
      {toast && (
        <div className={`dpp-toast ${toast.type} animate-scale-in`}>
          <div className="dpp-toast-icon">
            {toast.type === 'success' && <Check size={18} />}
            {toast.type === 'warning' && <AlertCircle size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
          </div>
          <div className="dpp-toast-text">{toast.text}</div>
        </div>
      )}

      {/* Top Header Panel */}
      <div className="dpp-header">
        <div className="dpp-header-title">
          <div className="badge badge-primary" style={{ marginBottom: '6px' }}>
            IFMIS Next Gen
          </div>
          <h1>Deposit Payment Processing</h1>
          <p>
            Generate payment advice, e-cheques, or initiate online payments to beneficiaries/vendors.
          </p>
        </div>
        <div className="dpp-header-user">
          <div className="dpp-header-user-top">
            <User size={14} />
            <span>Mukesh Kumar</span>
          </div>
          <span className="dpp-header-user-role">Verifier (Internal Audit Officer)</span>
          <span className="dpp-header-user-login">Last Login: 19 Jun 2026, 09:00</span>
        </div>
      </div>

      {/* Stepper Card */}
      <div className="dpp-status-card">
        <div className="dpp-status-header">
          <span>Deposit Account Opening Request Status</span>
          <span className="dpp-status-badge">Under Verification</span>
        </div>
        <div className="dpp-status-stepper">

          <div className="dpp-step completed">
            <div className="dpp-step-circle"><Check size={14} /></div>
            <span className="dpp-step-title">HoO</span>
            <span className="dpp-step-status">Completed</span>
            <a href="#" className="dpp-step-link">Details</a>
          </div>

          <div className="dpp-stepper-line completed"></div>

          <div className="dpp-step completed">
            <div className="dpp-step-circle"><Check size={14} /></div>
            <span className="dpp-step-title">HoD</span>
            <span className="dpp-step-status">Completed</span>
            <a href="#" className="dpp-step-link">Details</a>
          </div>

          <div className="dpp-stepper-line completed"></div>

          <div className="dpp-step completed">
            <div className="dpp-step-circle"><Check size={14} /></div>
            <span className="dpp-step-title">HoAD</span>
            <span className="dpp-step-status">Completed</span>
            <a href="#" className="dpp-step-link">Details</a>
          </div>

          <div className="dpp-stepper-line completed"></div>

          <div className="dpp-step completed">
            <div className="dpp-step-circle"><Check size={14} /></div>
            <span className="dpp-step-title">FD</span>
            <span className="dpp-step-status">Completed</span>
            <a href="#" className="dpp-step-link">Details</a>
          </div>

          <div className="dpp-stepper-line dotted"></div>

          <div className="dpp-step active">
            <div className="dpp-step-circle">5</div>
            <span className="dpp-step-title">Verifier</span>
            <span className="dpp-step-status">Under Verification</span>
            <a href="#" className="dpp-step-link">Details</a>
          </div>

        </div>
      </div>

      {/* Return Remark Warnings */}
      <div className="dpp-remark-box animate-scale-in">
        <div className="dpp-remark-header">
          <AlertCircle size={16} />
          <span>Return Remark By Verifier (HoD):</span>
        </div>
        <div className="dpp-remark-content">
          Lorem ipsum dolor sit amet consectetur. Enim vel nisi proin tellus. Nisl nulla est egestas ligula etiam pharetra ut pretium. Tristique lacus quisque dui consequat sollicitudin at elementum iaculis. Et mus eros commodo dolor nam ut tortor dis.
        </div>
      </div>

      {/* Processing Form Header & Tabs */}
      <div className="dpp-processing-header">
        <div className="dpp-processing-title">
          <h2>Deposit Payment Processing</h2>
          <p>Configure payments and attach authorization records</p>
        </div>
        <div className="dpp-tab-buttons">
          <button
            className={`dpp-tab-btn ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <CreditCard size={14} />
            <span>Create Claim</span>
          </button>
          <button
            className={`dpp-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <FileText size={14} />
            <span>Claims & Bills</span>
            <span className="badge badge-success" style={{ marginLeft: '4px', background: 'rgba(255,255,255,0.25)', color: 'white' }}>
              {claims.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab: Create Claim Form */}
      {activeTab === 'create' && (
        <form onSubmit={handleSubmitClaim} className="animate-scale-in">

          {/* Controls */}
          <div className="dpp-accordion-controls">
            <button type="button" className="dpp-control-btn" onClick={handleCollapseAll}>
              <ChevronUp size={14} /> Collapse All
            </button>
            <button type="button" className="dpp-control-btn" onClick={handleExpandAll}>
              <ChevronDown size={14} /> Expand All
            </button>
          </div>

          {/* Accordion 1: Deposit Account & Purpose Selection */}
          <div className="ifmis-accordion">
            <button
              type="button"
              className="ifmis-accordion__header"
              onClick={() => toggleAccordion('step1')}
            >
              <div className="ifmis-accordion__header-left">
                <div className="ifmis-accordion__number">1</div>
                <span className="ifmis-accordion__title">Step 1: Deposit Account & Purpose Selection</span>
              </div>
              <div className="ifmis-accordion__header-right">
                {selectedSubPdId && (
                  <span className="ifmis-accordion__badge ifmis-accordion__badge--completed">
                    ✓ Configured
                  </span>
                )}
                <div className={`ifmis-accordion__toggle ${accordions.step1 ? 'ifmis-accordion__toggle--open' : ''}`}>
                  <ChevronDown size={16} />
                </div>
              </div>
            </button>

            {accordions.step1 && (
              <div className="ifmis-accordion__body animate-fade-in">
                <div className="form-grid-3">

                  {/* Sub-PD Number Selection */}
                  <div className="form-group">
                    <label className="form-label">Sub-PD Number <span className="required">*</span></label>
                    <select
                      className="form-input"
                      value={selectedSubPdId}
                      onChange={e => setSelectedSubPdId(e.target.value)}
                      required
                    >
                      <option value="">Select Sub-PD number...</option>
                      {MOCK_SUB_PDS.map(p => (
                        <option key={p.id} value={p.id}>{p.id}</option>
                      ))}
                    </select>
                  </div>

                  {/* Parent Field */}
                  <div className="form-group">
                    <label className="form-label">Parent</label>
                    <input
                      type="text"
                      className="form-input disabled"
                      value={activeSubPd?.parent || ''}
                      placeholder="Auto-resolved parent account"
                      disabled
                    />
                  </div>

                  {/* Sub-PD admin */}
                  <div className="form-group">
                    <label className="form-label">Sub-PD admin</label>
                    <input
                      type="text"
                      className="form-input disabled"
                      value={activeSubPd?.admin || ''}
                      placeholder="Auto-resolved Sub-PD admin"
                      disabled
                    />
                  </div>

                </div>

                <div className="form-grid-3" style={{ marginTop: 'var(--space-4)' }}>

                  {/* HOA Field */}
                  <div className="form-group">
                    <label className="form-label">HOA <span className="required">*</span></label>
                    <select
                      className="form-input"
                      value={activeSubPd ? activeSubPd.hoa : ''}
                      onChange={() => { }} // Read-only resolved from Sub-PD
                      disabled
                    >
                      <option value="">—</option>
                      <option value="8443-00-106-0000">8443-00-106-0000 (PD)</option>
                      <option value="8443-00-111-0000">8443-00-111-0000 (CCD)</option>
                    </select>
                  </div>

                  {/* Challan number */}
                  <div className="form-group">
                    <label className="form-label">Challan number (if challan specific) <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter challan specific number"
                      value={challanNo}
                      onChange={e => setChallanNo(e.target.value)}
                      required
                    />
                  </div>

                  {/* HOA Available Balance */}
                  <div className="form-group">
                    <label className="form-label">HOA Available Balance (₹) <span className="required">*</span></label>
                    <div className="form-input disabled" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                      {activeSubPd ? `₹ ${activeSubPd.balance.toLocaleString('en-IN')}` : '₹ 0'}
                    </div>
                  </div>

                </div>

                <div className="ifmis-accordion__footer" style={{ marginTop: 'var(--space-5)' }}>
                  <button
                    type="button"
                    className="ifmis-btn-next"
                    onClick={() => handleNextStep('step1', 'step2')}
                    disabled={!selectedSubPdId || !challanNo}
                  >
                    Next <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Accordion 2: Vendor Details */}
          <div className="ifmis-accordion">
            <button
              type="button"
              className="ifmis-accordion__header"
              onClick={() => toggleAccordion('step2')}
            >
              <div className="ifmis-accordion__header-left">
                <div className="ifmis-accordion__number">2</div>
                <span className="ifmis-accordion__title">Vendor Details</span>
              </div>
              <div className="ifmis-accordion__header-right">
                {selectedVendorCode && (
                  <span className="ifmis-accordion__badge ifmis-accordion__badge--completed">
                    ✓ Mapped
                  </span>
                )}
                <div className={`ifmis-accordion__toggle ${accordions.step2 ? 'ifmis-accordion__toggle--open' : ''}`}>
                  <ChevronDown size={16} />
                </div>
              </div>
            </button>

            {accordions.step2 && (
              <div className="ifmis-accordion__body animate-fade-in">
                <div className="form-grid-2">

                  {/* Vendor / Beneficiary */}
                  <div className="form-group">
                    <label className="form-label">Vendor / Beneficiary <span className="required">*</span></label>
                    <select
                      className="form-input"
                      value={selectedVendorCode}
                      onChange={e => setSelectedVendorCode(e.target.value)}
                      required
                    >
                      <option value="">Select Vendor / Beneficiary...</option>
                      {MOCK_VENDORS.map(v => (
                        <option key={v.code} value={v.code}>{v.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Vendor Code */}
                  <div className="form-group">
                    <label className="form-label">Vendor Code</label>
                    <input
                      type="text"
                      className="form-input disabled"
                      value={selectedVendorCode}
                      placeholder="Auto-resolved vendor code"
                      disabled
                    />
                  </div>

                </div>

                {/* Bank Details Frame */}
                <div className="dpp-bank-details animate-fade-in">
                  <div className="dpp-bank-details-title">
                    <Building size={16} />
                    <span>Bank Details:</span>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Account Holder Name</label>
                      <input
                        type="text"
                        className="form-input disabled"
                        value={activeVendor?.name || ''}
                        disabled
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Account Number</label>
                      <input
                        type="text"
                        className="form-input disabled"
                        value={activeVendor?.accountNo || ''}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="form-grid-2" style={{ marginTop: 'var(--space-3)' }}>
                    <div className="form-group">
                      <label className="form-label">Branch Name</label>
                      <input
                        type="text"
                        className="form-input disabled"
                        value={activeVendor?.branchName || ''}
                        disabled
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">IFSC Code</label>
                      <input
                        type="text"
                        className="form-input disabled"
                        value={activeVendor?.ifscCode || ''}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                {/* Claim Number Selection */}
                <div className="form-group" style={{ maxWidth: '50%' }}>
                  <label className="form-label">Claim Number <span className="required">*</span></label>
                  <select
                    className="form-input"
                    value={selectedClaimNo}
                    onChange={e => setSelectedClaimNo(e.target.value)}
                    required
                  >
                    <option value="">Select Claim...</option>
                    <option value="CLM-901">CLM-901 - Medical Settlement</option>
                    <option value="CLM-902">CLM-902 - Leave Encashment</option>
                    <option value="CLM-903">CLM-903 - Hospitalization Reimbursement</option>
                  </select>
                </div>

                <div className="ifmis-accordion__footer" style={{ marginTop: 'var(--space-5)' }}>
                  <button
                    type="button"
                    className="ifmis-btn-next"
                    onClick={() => handleNextStep('step2', 'step3')}
                    disabled={!selectedVendorCode || !selectedClaimNo}
                  >
                    Next <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Accordion 3: Mode Of Payment */}
          <div className="ifmis-accordion">
            <button
              type="button"
              className="ifmis-accordion__header"
              onClick={() => toggleAccordion('step3')}
            >
              <div className="ifmis-accordion__header-left">
                <div className="ifmis-accordion__number">3</div>
                <span className="ifmis-accordion__title">Mode Of Payment</span>
              </div>
              <div className="ifmis-accordion__header-right">
                {claimAmount && (
                  <span className="ifmis-accordion__badge ifmis-accordion__badge--completed">
                    ₹ {parseFloat(claimAmount).toLocaleString('en-IN')} ({paymentMode})
                  </span>
                )}
                <div className={`ifmis-accordion__toggle ${accordions.step3 ? 'ifmis-accordion__toggle--open' : ''}`}>
                  <ChevronDown size={16} />
                </div>
              </div>
            </button>

            {accordions.step3 && (
              <div className="ifmis-accordion__body animate-fade-in">

                <label className="form-label" style={{ marginBottom: 'var(--space-2)' }}>Mode of Payment <span className="required">*</span></label>
                <div className="dpp-payment-modes">
                  {['e-Payment', 'Physical Cheque', 'Digital Currency', 'AePS'].map(mode => (
                    <div
                      key={mode}
                      className={`dpp-mode-card ${paymentMode === mode ? 'active' : ''}`}
                      onClick={() => setPaymentMode(mode)}
                    >
                      <input
                        type="radio"
                        name="paymentMode"
                        checked={paymentMode === mode}
                        onChange={() => { }}
                      />
                      <span>{mode}</span>
                    </div>
                  ))}
                </div>

                {/* By Transfer Deduction */}
                <div className="dpp-checkbox-group">
                  <input
                    type="checkbox"
                    id="byTransferDeduction"
                    checked={byTransferDeduction}
                    onChange={e => setByTransferDeduction(e.target.checked)}
                  />
                  <label htmlFor="byTransferDeduction">By Transfer Deduction</label>
                </div>

                {/* Claim Amount */}
                <div className="form-group" style={{ maxWidth: '50%', marginTop: 'var(--space-4)' }}>
                  <label className="form-label">Claim Amount (₹) <span className="required">*</span></label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Enter claim amount"
                    value={claimAmount}
                    onChange={e => setClaimAmount(e.target.value)}
                    required
                  />
                  {activeSubPd && claimAmount && parseFloat(claimAmount) > activeSubPd.balance && (
                    <span className="form-error" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <AlertCircle size={12} /> Exceeds available balance of ₹{activeSubPd.balance.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <div className="ifmis-accordion__footer" style={{ marginTop: 'var(--space-5)' }}>
                  <button
                    type="button"
                    className="ifmis-btn-next"
                    onClick={() => handleNextStep('step3', 'step4')}
                    disabled={!claimAmount || parseFloat(claimAmount) <= 0 || (activeSubPd && parseFloat(claimAmount) > activeSubPd.balance)}
                  >
                    Next <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Accordion 4: Remarks and Attachment */}
          <div className="ifmis-accordion">
            <button
              type="button"
              className="ifmis-accordion__header"
              onClick={() => toggleAccordion('step4')}
            >
              <div className="ifmis-accordion__header-left">
                <div className="ifmis-accordion__number">4</div>
                <span className="ifmis-accordion__title">Remarks and Attachment</span>
              </div>
              <div className="ifmis-accordion__header-right">
                {remarks.trim() && (
                  <span className="ifmis-accordion__badge ifmis-accordion__badge--completed">
                    ✓ Enclosed
                  </span>
                )}
                <div className={`ifmis-accordion__toggle ${accordions.step4 ? 'ifmis-accordion__toggle--open' : ''}`}>
                  <ChevronDown size={16} />
                </div>
              </div>
            </button>

            {accordions.step4 && (
              <div className="ifmis-accordion__body animate-fade-in">

                <div className="form-group">
                  <label className="form-label">Remarks <span className="required">*</span></label>
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder="Enter official remarks for sanctioning this claim..."
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    required
                  />
                </div>

                <div style={{ marginTop: 'var(--space-5)' }}>
                  <label className="form-label" style={{ marginBottom: 'var(--space-2)' }}>Attachments</label>

                  {/* Upload box */}
                  <div className="dpp-upload-area" onClick={() => showToast('warning', 'File attachment selector triggered in sandboxed mode.')}>
                    <UploadCloud size={32} className="dpp-upload-icon" />
                    <span className="dpp-upload-text">Drag and Drop files here to upload</span>
                    <button type="button" className="btn btn-secondary btn-sm dpp-upload-btn">
                      Upload File
                    </button>
                  </div>

                  {/* Uploaded files grid */}
                  <div className="dpp-files-grid">
                    {uploadedFiles.map(file => (
                      <div key={file.id} className="dpp-file-item">
                        <div className="dpp-file-info">
                          <File size={14} className="dpp-file-icon" />
                          <span>{file.name}</span>
                        </div>
                        <div className="dpp-file-actions">
                          <button
                            type="button"
                            className="dpp-file-btn"
                            onClick={() => showToast('success', `Viewing file content: ${file.name}`)}
                          >
                            <Eye size={12} />
                          </button>
                          <button
                            type="button"
                            className="dpp-file-btn delete"
                            onClick={() => handleDeleteFile(file.id)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                <div className="ifmis-accordion__footer" style={{ marginTop: 'var(--space-5)' }}>
                  <button
                    type="button"
                    className="ifmis-btn-next"
                    onClick={() => handleNextStep('step4', 'step5')}
                    disabled={!remarks.trim()}
                  >
                    Next <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Accordion 5: E-Sign */}
          <div className="ifmis-accordion">
            <button
              type="button"
              className="ifmis-accordion__header"
              onClick={() => toggleAccordion('step5')}
            >
              <div className="ifmis-accordion__header-left">
                <div className="ifmis-accordion__number">5</div>
                <span className="ifmis-accordion__title">E-Sign</span>
              </div>
              <div className="ifmis-accordion__header-right">
                {esignStatus === 'signed' ? (
                  <span className="ifmis-accordion__badge ifmis-accordion__badge--completed">
                    ✓ Signed
                  </span>
                ) : (
                  <span className="ifmis-accordion__badge ifmis-accordion__badge--pending">
                    Pending Sign
                  </span>
                )}
                <div className={`ifmis-accordion__toggle ${accordions.step5 ? 'ifmis-accordion__toggle--open' : ''}`}>
                  <ChevronDown size={16} />
                </div>
              </div>
            </button>

            {accordions.step5 && (
              <div className="ifmis-accordion__body animate-fade-in">

                <div className="dpp-esign-card">
                  <div className="dpp-checkbox-group" style={{ width: '100%', border: 'none', background: 'transparent', margin: 0, padding: 0 }}>
                    <input
                      type="checkbox"
                      id="esignAck"
                      checked={ackChecked}
                      onChange={e => setAckChecked(e.target.checked)}
                    />
                    <label htmlFor="esignAck" style={{ textAlign: 'left', fontWeight: 500 }}>
                      I acknowledge my full responsibility for approving this payment request.
                    </label>
                  </div>

                  <div style={{ marginTop: 'var(--space-2)' }}>
                    {esignStatus === 'not_signed' && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handlePerformEsign}
                        disabled={!ackChecked}
                      >
                        Perform e-Sign
                      </button>
                    )}

                    {esignStatus === 'signing' && (
                      <button type="button" className="btn btn-primary" disabled>
                        <RefreshCw size={14} className="spin-anim" style={{ marginRight: '8px' }} />
                        Signing via DSC...
                      </button>
                    )}

                    {esignStatus === 'signed' && (
                      <div className="dpp-esign-status success animate-scale-in">
                        <ShieldCheck size={16} />
                        <span>Digitally Signed Successfully</span>
                      </div>
                    )}
                  </div>

                  <div className="dpp-esign-status pending" style={{ marginTop: 'var(--space-1)' }}>
                    <span>Status: {esignStatus === 'signed' ? 'Signed' : 'Not Signed'}</span>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Bottom Actions Tray */}
          <div className="dpp-footer-actions">
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Reset
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleSaveDraft}>
              Save
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={esignStatus !== 'signed'}
            >
              Submit
            </button>
          </div>

        </form>
      )}

      {/* Tab: Claims & Bills List */}
      {activeTab === 'list' && (
        <div className="card animate-scale-in" style={{ marginTop: 'var(--space-4)' }}>
          <div className="card-header">
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>Submitted Claims Ledger</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="dft-budget-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Claim Reference</th>
                    <th>Sub-PD ID</th>
                    <th>Vendor Code</th>
                    <th>Payment Mode</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map(claim => (
                    <tr key={claim.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {claim.id}
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>{claim.subPdId}</td>
                      <td style={{ fontFamily: 'monospace' }}>{claim.vendorCode}</td>
                      <td>{claim.paymentMode}</td>
                      <td>{claim.date}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        ₹ {claim.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <span className={`badge ${claim.status === 'Approved' ? 'badge-success' : 'badge-warning'}`}>
                          {claim.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
