import React, { useState } from 'react';
import { HelpCircle, Check, AlertCircle, ArrowRightLeft, Database, Building, FileText } from 'lucide-react';
import CommentLayer from '../../components/feedback/CommentLayer';
import './PdToCcdCrcdWorksTransferScreen.css';

// Interfaces
interface OperatorData {
  code: string;
  name: string;
  purposeCode: string;
  expenditurePattern: string;
  availableBalance: number;
  hoas: { head: string; balance: number }[];
  challans: string[];
}

interface CourtData {
  code: string;
  name: string;
}

interface WorkData {
  id: string;
  title: string;
  divisionCode: string;
  divisionName: string;
  contractorName: string;
}

// Mock Data
const MOCK_OPERATORS: Record<string, OperatorData> = {
  'OP-8443-1': {
    code: 'OP-8443-1',
    name: 'Shri A. K. Sharma (Senior Civil Assistant)',
    purposeCode: '1001',
    expenditurePattern: 'TOTAL_AMOUNT',
    availableBalance: 5000000.00,
    hoas: [
      { head: '8443-00-106-0001', balance: 3500000.00 },
      { head: '8443-00-106-0002', balance: 1500000.00 }
    ],
    challans: ['CHL-2024-001', 'CHL-2024-002']
  },
  'OP-8443-2': {
    code: 'OP-8443-2',
    name: 'Smt. Rajni Verma (Registrar Clerk)',
    purposeCode: '2001',
    expenditurePattern: 'CHALLAN_WISE',
    availableBalance: 12000000.00,
    hoas: [
      { head: '8443-00-101-0015', balance: 8000000.00 },
      { head: '8443-00-111-0099', balance: 4000000.00 }
    ],
    challans: ['CHL-2024-003', 'CHL-2024-004']
  }
};

const MOCK_COURTS: Record<string, CourtData> = {
  'CRT-BPL-01': { code: 'CRT-BPL-01', name: 'First Class Judicial Magistrate Court, Bhopal' },
  'CRT-BPL-02': { code: 'CRT-BPL-02', name: 'Second Class Judicial Magistrate Court, Bhopal' },
  'CRT-IND-01': { code: 'CRT-IND-01', name: 'Registrar Court House, Indore' },
  'CRT-GWL-01': { code: 'CRT-GWL-01', name: 'Chief Judicial Magistrate Court Bench, Gwalior' }
};

const MOCK_WORKS: Record<string, WorkData> = {
  'WRK-2026-009': {
    id: 'WRK-2026-009',
    title: 'Construction of Smart City Bypass Road, Bhopal',
    divisionCode: 'DIV-PWD-BPL-01',
    divisionName: 'Bhopal PWD Division-I',
    contractorName: 'Apex Infrastructure Ltd.'
  },
  'WRK-2026-015': {
    id: 'WRK-2026-015',
    title: 'Rehabilitation of Bridge over Narmada, Hoshangabad',
    divisionCode: 'DIV-PWD-HOS-02',
    divisionName: 'Hoshangabad PWD Division-II',
    contractorName: 'M/S Gwalior Electrical & Civil Works'
  }
};

export default function PdToCcdCrcdWorksTransferScreen() {
  // Toast notifications state
  const [toast, setToast] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (type: 'success' | 'warning' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // FROM Section State
  const [operatorCode, setOperatorCode] = useState('OP-8443-1');
  const [operatorName, setOperatorName] = useState('Shri A. K. Sharma (Senior Civil Assistant)');
  const [selectedHoa, setSelectedHoa] = useState('');
  const [selectedChallan, setSelectedChallan] = useState('');
  const [transferPurpose, setTransferPurpose] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  // TO Section State
  const [toAccountType, setToAccountType] = useState('CCD'); // CCD, CrCD, Works

  // Destination Specific fields state
  const [courtCode, setCourtCode] = useState('');
  const [courtName, setCourtName] = useState('');
  const [caseNo, setCaseNo] = useState('');
  const [caseTitle, setCaseTitle] = useState('');

  const [accusedName, setAccusedName] = useState('');
  const [bondAmount, setBondAmount] = useState('');

  const [workId, setWorkId] = useState('');
  const [divisionCode, setDivisionCode] = useState('');
  const [divisionName, setDivisionName] = useState('');
  const [contractorName, setContractorName] = useState('');

  // Derived Values
  const currentOperator = MOCK_OPERATORS[operatorCode];
  const hoaOptions = currentOperator ? currentOperator.hoas : [];
  const challanOptions = currentOperator ? currentOperator.challans : [];
  const selectedHoaDetail = hoaOptions.find(h => h.head === selectedHoa);
  const hoaBalance = selectedHoaDetail ? selectedHoaDetail.balance : 0;

  // Handlers
  const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setOperatorCode(val);
    setSelectedHoa('');

    const op = MOCK_OPERATORS[val];
    if (op) {
      setOperatorName(op.name);
      if (op.expenditurePattern === 'CHALLAN_WISE' && op.challans.length > 0) {
        setSelectedChallan(op.challans[0]);
      } else {
        setSelectedChallan('');
      }
    } else {
      setOperatorName('');
      setSelectedChallan('');
    }
  };

  const handleCourtChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setCourtCode(code);
    if (code && MOCK_COURTS[code]) {
      setCourtName(MOCK_COURTS[code].name);
    } else {
      setCourtName('');
    }
  };

  const handleWorkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setWorkId(id);
    if (id && MOCK_WORKS[id]) {
      const work = MOCK_WORKS[id];
      setDivisionCode(work.divisionCode);
      setDivisionName(work.divisionName);
      setContractorName(work.contractorName);
    } else {
      setDivisionCode('');
      setDivisionName('');
      setContractorName('');
    }
  };

  const handleToTypeChange = (type: string) => {
    setToAccountType(type);
    // Reset TO specific inputs
    setCourtCode('');
    setCourtName('');
    setCaseNo('');
    setCaseTitle('');
    setAccusedName('');
    setBondAmount('');
    setWorkId('');
    setDivisionCode('');
    setDivisionName('');
    setContractorName('');
  };

  const handleReset = () => {
    setOperatorCode('OP-8443-1');
    setOperatorName('Shri A. K. Sharma (Senior Civil Assistant)');
    setSelectedHoa('');
    setSelectedChallan('');
    setTransferPurpose('');
    setTransferAmount('');
    handleToTypeChange('CCD');
    showToast('success', 'Form values successfully reset.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!operatorCode) {
      showToast('error', 'Validation failed: Operator Code is required.');
      return;
    }
    if (!selectedHoa) {
      showToast('error', 'Validation failed: HOA selection is required.');
      return;
    }
    if (currentOperator && currentOperator.expenditurePattern === 'CHALLAN_WISE' && !selectedChallan) {
      showToast('error', 'Validation failed: Challan selection is required.');
      return;
    }
    if (!transferPurpose.trim()) {
      showToast('error', 'Validation failed: Purpose of Transfer is required.');
      return;
    }
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('error', 'Validation failed: Transfer Amount must be greater than 0.00.');
      return;
    }
    if (amt > hoaBalance) {
      showToast('error', `Validation failed: Transfer Amount exceeds HOA Available Balance (₹ ${hoaBalance.toLocaleString('en-IN')}).`);
      return;
    }

    // TO section specific validations
    if (toAccountType === 'CCD') {
      if (!courtCode) {
        showToast('error', 'Validation failed: Court Code is required for Civil Court Deposit.');
        return;
      }
      if (!caseNo.trim()) {
        showToast('error', 'Validation failed: Civil Case Number is required.');
        return;
      }
      if (!caseTitle.trim()) {
        showToast('error', 'Validation failed: Case Title is required.');
        return;
      }
    } else if (toAccountType === 'CrCD') {
      if (!courtCode) {
        showToast('error', 'Validation failed: Court Code is required for Criminal Court Deposit.');
        return;
      }
      if (!caseNo.trim()) {
        showToast('error', 'Validation failed: Police Case / FIR No is required.');
        return;
      }
      if (!accusedName.trim()) {
        showToast('error', 'Validation failed: Accused Name is required.');
        return;
      }
    } else if (toAccountType === 'Works') {
      if (!workId) {
        showToast('error', 'Validation failed: Work ID selection is required.');
        return;
      }
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const generatedTrxId = `TRX-PD-TF-${Math.floor(100000 + Math.random() * 900000)}`;
      showToast('success', `Transfer submitted successfully! Reference Transaction ID: ${generatedTrxId}`);
      setIsSubmitting(false);
    }, 1500);
  };

  const handleClose = () => {
    window.location.href = '/';
  };

  return (
    <CommentLayer screenId="sprint1-pd-transfer" moduleName="deposit">
      <div className="pd-transfer-screen">
        {/* Navigation Breadcrumb */}
        <div className="pd-transfer-breadcrumb">
          <span>Deposit Processes &gt; Deposit Fund Transfer &gt; Transfer of Fund From PD Account</span>
        </div>

        {/* Tab Header Box */}
        <div className="pd-transfer-tab-container">
          <div className="pd-transfer-tab-active">
            By-Transfer from PD Account
          </div>
        </div>

        {/* Content Section */}
        <div className="pd-transfer-content">
          {/* Toast Alert */}
          {toast && (
            <div className={`pd-transfer-toast ${toast.type} animate-scale-in`}>
              <div className="pd-transfer-toast-icon">
                {toast.type === 'success' && <Check size={16} />}
                {toast.type === 'warning' && <AlertCircle size={16} />}
                {toast.type === 'error' && <AlertCircle size={16} />}
              </div>
              <div className="pd-transfer-toast-text">{toast.message}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Card 1: From Deposit Account */}
            <div className="gov-card">
              <div className="gov-card-header">
                1. From Deposit Account
              </div>
              <div className="gov-card-body">
                <div className="pd-transfer-grid">

                  {/* Row 1 */}
                  <div className="court-form-group">
                    <label className="court-form-label">Deposit Type</label>
                    <input
                      type="text"
                      className="court-form-input disabled-input"
                      value="PD"
                      disabled
                    />
                  </div>

                  <div className="court-form-group">
                    <label className="court-form-label">
                      Operator Code <span className="required-star">*</span>
                    </label>
                    <select
                      className="court-form-select"
                      value={operatorCode}
                      onChange={handleOperatorChange}
                    >
                      {Object.keys(MOCK_OPERATORS).map(code => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                  </div>

                  <div className="court-form-group">
                    <label className="court-form-label">Purpose Code</label>
                    <input
                      type="text"
                      className="court-form-input disabled-input"
                      value={currentOperator ? currentOperator.purposeCode : ''}
                      disabled
                    />
                  </div>

                  {/* Row 2 */}
                  <div className="court-form-group">
                    <label className="court-form-label">Operator Name</label>
                    <input
                      type="text"
                      className="court-form-input disabled-input"
                      value={operatorName}
                      placeholder="Operator Name"
                      disabled
                    />
                  </div>

                  <div className="court-form-group">
                    <label className="court-form-label">Expenditure Pattern</label>
                    <input
                      type="text"
                      className="court-form-input disabled-input"
                      value={currentOperator ? currentOperator.expenditurePattern : ''}
                      disabled
                    />
                  </div>

                  <div className="court-form-group">
                    <label className="court-form-label">
                      HOA <span className="required-star">*</span>
                    </label>
                    <select
                      className="court-form-select"
                      value={selectedHoa}
                      onChange={(e) => setSelectedHoa(e.target.value)}
                    >
                      <option value="">Select HOA</option>
                      {hoaOptions.map(h => (
                        <option key={h.head} value={h.head}>{h.head}</option>
                      ))}
                    </select>
                  </div>

                  {/* Row 3 */}
                  <div className="court-form-group">
                    <label className="court-form-label">HOA Balance</label>
                    <input
                      type="text"
                      className="court-form-input disabled-input amount-output"
                      value={selectedHoa ? `₹ ${hoaBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Auto-filled'}
                      disabled
                    />
                  </div>

                  {currentOperator && currentOperator.expenditurePattern === 'CHALLAN_WISE' && (
                    <div className="court-form-group">
                      <label className="court-form-label">
                        Challan <span className="required-star">*</span>
                      </label>
                      <select
                        className="court-form-select"
                        value={selectedChallan}
                        onChange={(e) => setSelectedChallan(e.target.value)}
                      >
                        <option value="">Select Challan</option>
                        {challanOptions.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="court-form-group">
                    <label className="court-form-label">
                      Transfer Amount <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className="court-form-input amount-input"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="Enter transfer amount"
                    />
                  </div>

                  {/* Row 4 */}
                  <div className="court-form-group">
                    <label className="court-form-label">
                      Purpose of Transfer <span className="required-star">*</span>
                    </label>
                    <textarea
                      className="court-form-input purpose-textarea"
                      value={transferPurpose}
                      onChange={(e) => setTransferPurpose(e.target.value)}
                      placeholder="Write the purpose of transfer"
                      rows={2}
                    />
                  </div>

                </div>
              </div>
            </div>

            {/* Card 2: To Account / Scheme */}
            <div className="gov-card mt-4">
              <div className="gov-card-header">
                2. To Destination Account / Scheme
              </div>
              <div className="gov-card-body">

                {/* Visual Option Selector Cards */}
                <div className="to-options-cards-group">
                  <div
                    className={`to-option-card ${toAccountType === 'CCD' ? 'selected' : ''}`}
                    onClick={() => handleToTypeChange('CCD')}
                  >
                    <div className="to-option-icon"><Building size={20} /></div>
                    <div className="to-option-details">
                      <span className="title">Civil Court Deposit</span>
                      <span className="desc">CCD accounts, registry cases</span>
                    </div>
                  </div>

                  <div
                    className={`to-option-card ${toAccountType === 'CrCD' ? 'selected' : ''}`}
                    onClick={() => handleToTypeChange('CrCD')}
                  >
                    <div className="to-option-icon"><FileText size={20} /></div>
                    <div className="to-option-details">
                      <span className="title">Criminal Court Deposit</span>
                      <span className="desc">CrCD bail bonds, security deposits</span>
                    </div>
                  </div>

                  <div
                    className={`to-option-card ${toAccountType === 'Works' ? 'selected' : ''}`}
                    onClick={() => handleToTypeChange('Works')}
                  >
                    <div className="to-option-icon"><Database size={20} /></div>
                    <div className="to-option-details">
                      <span className="title">Public Works Deposit</span>
                      <span className="desc">Division contracts & contractors</span>
                    </div>
                  </div>
                </div>

                {/* Form Inputs based on selection */}
                <div className="pd-transfer-grid mt-6">

                  {toAccountType === 'CCD' && (
                    <>
                      <div className="court-form-group col-start-1">
                        <label className="court-form-label">
                          Court Code <span className="required-star">*</span>
                        </label>
                        <select
                          className="court-form-select"
                          value={courtCode}
                          onChange={handleCourtChange}
                        >
                          <option value="">------ Select ------</option>
                          {Object.keys(MOCK_COURTS).map(code => (
                            <option key={code} value={code}>{code}</option>
                          ))}
                        </select>
                      </div>

                      <div className="court-form-group">
                        <label className="court-form-label">Court Name</label>
                        <input
                          type="text"
                          className="court-form-input disabled-input"
                          value={courtName}
                          placeholder="Auto-resolved Court Name"
                          disabled
                        />
                      </div>

                      <div className="court-form-group col-start-1">
                        <label className="court-form-label">
                          Civil Suit / Case No <span className="required-star">*</span>
                        </label>
                        <input
                          type="text"
                          className="court-form-input"
                          value={caseNo}
                          onChange={(e) => setCaseNo(e.target.value)}
                          placeholder="E.g. CS/2026/8902"
                        />
                      </div>

                      <div className="court-form-group">
                        <label className="court-form-label">
                          Case Title / Party Name <span className="required-star">*</span>
                        </label>
                        <input
                          type="text"
                          className="court-form-input"
                          value={caseTitle}
                          onChange={(e) => setCaseTitle(e.target.value)}
                          placeholder="E.g. Ram Prasad vs. State of MP"
                        />
                      </div>

                      <div className="court-form-group col-start-1">
                        <label className="court-form-label">CCD Account Scheme</label>
                        <input
                          type="text"
                          className="court-form-input disabled-input"
                          value="01 : Regular CCD Scheme (Bhopal)"
                          disabled
                        />
                      </div>
                    </>
                  )}

                  {toAccountType === 'CrCD' && (
                    <>
                      <div className="court-form-group col-start-1">
                        <label className="court-form-label">
                          Court Code <span className="required-star">*</span>
                        </label>
                        <select
                          className="court-form-select"
                          value={courtCode}
                          onChange={handleCourtChange}
                        >
                          <option value="">------ Select ------</option>
                          {Object.keys(MOCK_COURTS).map(code => (
                            <option key={code} value={code}>{code}</option>
                          ))}
                        </select>
                      </div>

                      <div className="court-form-group">
                        <label className="court-form-label">Court Name</label>
                        <input
                          type="text"
                          className="court-form-input disabled-input"
                          value={courtName}
                          placeholder="Auto-resolved Court Name"
                          disabled
                        />
                      </div>

                      <div className="court-form-group col-start-1">
                        <label className="court-form-label">
                          FIR / Police Case Number <span className="required-star">*</span>
                        </label>
                        <input
                          type="text"
                          className="court-form-input"
                          value={caseNo}
                          onChange={(e) => setCaseNo(e.target.value)}
                          placeholder="E.g. FIR/401/2026"
                        />
                      </div>

                      <div className="court-form-group">
                        <label className="court-form-label">
                          Accused Name <span className="required-star">*</span>
                        </label>
                        <input
                          type="text"
                          className="court-form-input"
                          value={accusedName}
                          onChange={(e) => setAccusedName(e.target.value)}
                          placeholder="E.g. Shyam Lal Yadav"
                        />
                      </div>

                      <div className="court-form-group col-start-1">
                        <label className="court-form-label">Bail Bond / Security Amount</label>
                        <input
                          type="text"
                          className="court-form-input"
                          value={bondAmount}
                          onChange={(e) => setBondAmount(e.target.value)}
                          placeholder="E.g. 50,000.00"
                        />
                      </div>
                    </>
                  )}

                  {toAccountType === 'Works' && (
                    <>
                      <div className="court-form-group col-start-1">
                        <label className="court-form-label">
                          Work ID / Project Code <span className="required-star">*</span>
                        </label>
                        <select
                          className="court-form-select"
                          value={workId}
                          onChange={handleWorkChange}
                        >
                          <option value="">------ Select ------</option>
                          {Object.keys(MOCK_WORKS).map(id => (
                            <option key={id} value={id}>{id} - {MOCK_WORKS[id].title}</option>
                          ))}
                        </select>
                      </div>

                      <div className="court-form-group">
                        <label className="court-form-label">Division Code</label>
                        <input
                          type="text"
                          className="court-form-input disabled-input"
                          value={divisionCode}
                          placeholder="Auto-resolved Division Code"
                          disabled
                        />
                      </div>

                      <div className="court-form-group col-start-1">
                        <label className="court-form-label">Division Name</label>
                        <input
                          type="text"
                          className="court-form-input disabled-input"
                          value={divisionName}
                          placeholder="Auto-resolved Division Name"
                          disabled
                        />
                      </div>

                      <div className="court-form-group">
                        <label className="court-form-label">Contractor Name</label>
                        <input
                          type="text"
                          className="court-form-input disabled-input"
                          value={contractorName}
                          placeholder="Auto-resolved Contractor Name"
                          disabled
                        />
                      </div>
                    </>
                  )}

                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pd-transfer-actions-bar">
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
                onClick={() => showToast('success', 'Draft transfer request saved locally.')}
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
