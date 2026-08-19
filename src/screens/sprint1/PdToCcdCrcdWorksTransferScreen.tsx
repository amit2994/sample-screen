import React, { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
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



interface WorkData {
  id: string;
  title: string;
  treasury: string;
  workIdType: string;
  ddoCode: string;
  ddoName: string;
  hoa: string;
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



const MOCK_WORKS: Record<string, WorkData> = {
  'WRK-2026-009': {
    id: 'WRK-2026-009',
    title: 'Construction of Smart City Bypass Road, Bhopal',
    treasury: 'Bhopal Treasury (01)',
    workIdType: 'PWD Contract',
    ddoCode: 'DDO-PWD-BPL-01',
    ddoName: 'Executive Engineer, PWD Division-I, Bhopal',
    hoa: '8443-00-108-0001'
  },
  'WRK-2026-015': {
    id: 'WRK-2026-015',
    title: 'Rehabilitation of Bridge over Narmada, Hoshangabad',
    treasury: 'Hoshangabad Treasury (15)',
    workIdType: 'PWD Contract',
    ddoCode: 'DDO-PWD-HOS-02',
    ddoName: 'Executive Engineer, PWD Division-II, Hoshangabad',
    hoa: '8443-00-108-0002'
  }
};

const MOCK_TO_TREASURIES: Record<string, string> = {
  'TR-01': 'Bhopal Treasury (01)',
  'TR-15': 'Hoshangabad Treasury (15)',
  'TR-02': 'Indore Treasury (02)',
  'TR-03': 'Gwalior Treasury (03)'
};

const MOCK_TO_DDOS: Record<string, { name: string; deptCode: string; deptName: string }> = {
  'DDO-BPL-001': {
    name: 'District Court, Bhopal',
    deptCode: 'DEP-JUS-01',
    deptName: 'Department of Justice & Law'
  },
  'DDO-BPL-002': {
    name: 'Session Court, Bhopal',
    deptCode: 'DEP-JUS-01',
    deptName: 'Department of Justice & Law'
  },
  'DDO-IND-001': {
    name: 'Civil Court, Indore',
    deptCode: 'DEP-JUS-01',
    deptName: 'Department of Justice & Law'
  },
  'DDO-IND-002': {
    name: 'Family Court, Indore',
    deptCode: 'DEP-JUS-01',
    deptName: 'Department of Justice & Law'
  }
};

const MOCK_CCD_ACCOUNTS = ['CCD-BPL-101', 'CCD-IND-201', 'CCD-REG-001'];
const MOCK_CRCD_ACCOUNTS = ['CRCD-BPL-501', 'CRCD-IND-601', 'CRCD-BAIL-002'];

const MOCK_HOAS = {
  CCD: '8443-00-103-0001',
  CrCD: '8443-00-104-0001'
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

  // Destination Specific fields state for CCD/CrCD
  const [toTreasuryCode, setToTreasuryCode] = useState('');
  const [toTreasuryName, setToTreasuryName] = useState('');
  const [toDdoCode, setToDdoCode] = useState('');
  const [toDdoName, setToDdoName] = useState('');
  const [toDeptCode, setToDeptCode] = useState('');
  const [toDeptName, setToDeptName] = useState('');
  const [toCcdAccountNo, setToCcdAccountNo] = useState('');
  const [toCrcdAccountNo, setToCrcdAccountNo] = useState('');
  const [toHoa, setToHoa] = useState('8443-00-103-0001');

  // Destination Specific fields state for Works
  const [workId, setWorkId] = useState('');
  const [treasury, setTreasury] = useState('');
  const [workIdType, setWorkIdType] = useState('');
  const [ddoCode, setDdoCode] = useState('');
  const [ddoName, setDdoName] = useState('');
  const [hoa, setHoa] = useState('');

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

  const handleToTreasuryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setToTreasuryCode(code);
    if (code && MOCK_TO_TREASURIES[code]) {
      setToTreasuryName(MOCK_TO_TREASURIES[code]);
    } else {
      setToTreasuryName('');
    }
  };

  const handleToDdoCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setToDdoCode(code);
    if (code && MOCK_TO_DDOS[code]) {
      setToDdoName(MOCK_TO_DDOS[code].name);
      setToDeptCode(MOCK_TO_DDOS[code].deptCode);
      setToDeptName(MOCK_TO_DDOS[code].deptName);
    } else {
      setToDdoName('');
      setToDeptCode('');
      setToDeptName('');
    }
  };

  const handleWorkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setWorkId(id);
    if (id && MOCK_WORKS[id]) {
      const work = MOCK_WORKS[id];
      setTreasury(work.treasury);
      setWorkIdType(work.workIdType);
      setDdoCode(work.ddoCode);
      setDdoName(work.ddoName);
      setHoa(work.hoa);
    } else {
      setTreasury('');
      setWorkIdType('');
      setDdoCode('');
      setDdoName('');
      setHoa('');
    }
  };

  const handleToTypeChange = (type: string) => {
    setToAccountType(type);
    // Reset TO specific inputs
    setToTreasuryCode('');
    setToTreasuryName('');
    setToDdoCode('');
    setToDdoName('');
    setToDeptCode('');
    setToDeptName('');
    setToCcdAccountNo('');
    setToCrcdAccountNo('');
    
    if (type === 'CCD') {
      setToHoa(MOCK_HOAS.CCD);
    } else if (type === 'CrCD') {
      setToHoa(MOCK_HOAS.CrCD);
    } else {
      setToHoa('');
    }

    setWorkId('');
    setTreasury('');
    setWorkIdType('');
    setDdoCode('');
    setDdoName('');
    setHoa('');
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
      if (!toTreasuryCode) {
        showToast('error', 'Validation failed: Treasury Code is required for CCD.');
        return;
      }
      if (!toDdoCode) {
        showToast('error', 'Validation failed: DDO Code is required.');
        return;
      }
      if (!toCcdAccountNo) {
        showToast('error', 'Validation failed: CCD Account No is required.');
        return;
      }
    } else if (toAccountType === 'CrCD') {
      if (!toTreasuryCode) {
        showToast('error', 'Validation failed: Treasury Code is required for CrCD.');
        return;
      }
      if (!toDdoCode) {
        showToast('error', 'Validation failed: DDO Code is required.');
        return;
      }
      if (!toCrcdAccountNo) {
        showToast('error', 'Validation failed: CrCD Account No is required.');
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
            PD to {toAccountType} transfer
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
            <div className="transfer-cards-container">

              {/* Card 1: From Deposit Account */}
              <div className="gov-card to-section-card">
                <div className="gov-card-header to-section-header">
                  FROM
                </div>
                <div className="gov-card-body">
                  <div className="two-col-grid">

                    {/* Deposit Type */}
                    <div className="court-form-group">
                      <label className="court-form-label purple-label">Deposit Type</label>
                      <input
                        type="text"
                        className="fetched-data-input"
                        value="PD"
                        disabled
                      />
                    </div>

                    {/* Operator Code */}
                    <div className="court-form-group">
                      <label className="court-form-label purple-label">
                        Operator Code <span className="required-star">*</span>
                      </label>
                      <div className="select-wrapper">
                        <select
                          className="purple-select-input"
                          value={operatorCode}
                          onChange={handleOperatorChange}
                        >
                          {Object.keys(MOCK_OPERATORS).map(code => (
                            <option key={code} value={code}>{code}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Purpose Code */}
                    <div className="court-form-group">
                      <label className="court-form-label purple-label">Purpose Code</label>
                      <input
                        type="text"
                        className="fetched-data-input"
                        value={currentOperator ? currentOperator.purposeCode : ''}
                        disabled
                      />
                    </div>

                    {/* Operator Name */}
                    <div className="court-form-group">
                      <label className="court-form-label purple-label">Operator Name</label>
                      <input
                        type="text"
                        className="fetched-data-input"
                        value={operatorName}
                        placeholder="Operator Name"
                        disabled
                      />
                    </div>

                    {/* Expenditure Pattern */}
                    <div className="court-form-group">
                      <label className="court-form-label purple-label">Expenditure Pattern</label>
                      <input
                        type="text"
                        className="fetched-data-input"
                        value={currentOperator ? currentOperator.expenditurePattern : ''}
                        disabled
                      />
                    </div>

                    {/* HOA */}
                    <div className="court-form-group">
                      <label className="court-form-label purple-label">
                        HOA <span className="required-star">*</span>
                      </label>
                      <div className="select-wrapper">
                        <select
                          className="purple-select-input"
                          value={selectedHoa}
                          onChange={(e) => setSelectedHoa(e.target.value)}
                        >
                          <option value="">Select HOA</option>
                          {hoaOptions.map(h => (
                            <option key={h.head} value={h.head}>{h.head}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* HOA Balance */}
                    <div className="court-form-group">
                      <label className="court-form-label purple-label">HOA Balance</label>
                      <input
                        type="text"
                        className="fetched-data-input"
                        value={selectedHoa ? `₹ ${hoaBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Auto-filled'}
                        disabled
                      />
                    </div>

                    {/* Challan (Conditional) */}
                    {currentOperator && currentOperator.expenditurePattern === 'CHALLAN_WISE' ? (
                      <div className="court-form-group">
                        <label className="court-form-label purple-label">
                          Challan <span className="required-star">*</span>
                        </label>
                        <div className="select-wrapper">
                          <select
                            className="purple-select-input"
                            value={selectedChallan}
                            onChange={(e) => setSelectedChallan(e.target.value)}
                          >
                            <option value="">Select Challan</option>
                            {challanOptions.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : null}

                    {/* Transfer Amount */}
                    <div className="court-form-group">
                      <label className="court-form-label purple-label">
                        Transfer Amount <span className="required-star">*</span>
                      </label>
                      <input
                        type="text"
                        className="active-text-input"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder="Enter transfer amount"
                      />
                    </div>

                    {/* Purpose of Transfer (Full Width) */}
                    <div className="court-form-group col-span-2">
                      <label className="court-form-label purple-label">
                        Purpose of Transfer <span className="required-star">*</span>
                      </label>
                      <input
                        type="text"
                        className="active-text-input"
                        value={transferPurpose}
                        onChange={(e) => setTransferPurpose(e.target.value)}
                        placeholder="Write the purpose of transfer"
                      />
                    </div>

                  </div>
                </div>
              </div>

              {/* Card 2: To Account / Scheme */}
              <div className="gov-card to-section-card">
                <div className="gov-card-header to-section-header">
                  TO
                </div>
                <div className="gov-card-body">
                  <div className="two-col-grid">
                    {/* Deposit Type Select Dropdown */}
                    <div className="court-form-group">
                      <label className="court-form-label purple-label">
                        To Deposit Type <span className="required-star">*</span>
                      </label>
                      <div className="select-wrapper">
                        <select
                          className="purple-select-input"
                          value={toAccountType}
                          onChange={(e) => handleToTypeChange(e.target.value)}
                        >
                          <option value="CCD">Civil Court Deposit (CCD)</option>
                          <option value="CrCD">Criminal Court Deposit (CrCD)</option>
                          <option value="Works">Public Works Deposit (Works)</option>
                        </select>
                      </div>
                    </div>

                    {/* HoA Field (Beside Deposit Type) */}
                    <div className="court-form-group">
                      <label className="court-form-label purple-label">Head of Account (HoA)</label>
                      <input
                        type="text"
                        className="fetched-data-input"
                        value={toAccountType === 'Works' ? (workId ? hoa : 'Fetched Data') : toHoa}
                        disabled
                      />
                    </div>

                    {toAccountType === 'CCD' && (
                      <>
                        {/* Treasury Code */}
                        <div className="court-form-group">
                          <label className="court-form-label purple-label">
                            Treasury Code <span className="required-star">*</span>
                          </label>
                          <div className="select-wrapper">
                            <select
                              className="purple-select-input"
                              value={toTreasuryCode}
                              onChange={handleToTreasuryCodeChange}
                            >
                              <option value="">Select</option>
                              {Object.keys(MOCK_TO_TREASURIES).map(code => (
                                <option key={code} value={code}>{code}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Treasury Name */}
                        <div className="court-form-group">
                          <label className="court-form-label purple-label">Treasury Name</label>
                          <input
                            type="text"
                            className="fetched-data-input"
                            value={toTreasuryName || 'Fetched Data'}
                            disabled
                          />
                        </div>

                        {/* DDO Code */}
                        <div className="court-form-group">
                          <label className="court-form-label purple-label">
                            DDO Code <span className="required-star">*</span>
                          </label>
                          <div className="select-wrapper">
                            <select
                              className="purple-select-input"
                              value={toDdoCode}
                              onChange={handleToDdoCodeChange}
                            >
                              <option value="">Select</option>
                              {Object.keys(MOCK_TO_DDOS).map(code => (
                                <option key={code} value={code}>{code}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* DDO Name */}
                        <div className="court-form-group">
                          <label className="court-form-label purple-label">DDO Name</label>
                          <input
                            type="text"
                            className="fetched-data-input"
                            value={toDdoName || 'Fetched Data'}
                            disabled
                          />
                        </div>

                        {/* Department Code */}
                        <div className="court-form-group">
                          <label className="court-form-label purple-label">Department Code</label>
                          <input
                            type="text"
                            className="fetched-data-input"
                            value={toDeptCode || 'Fetched Data'}
                            disabled
                          />
                        </div>

                        {/* Department Name */}
                        <div className="court-form-group">
                          <label className="court-form-label purple-label">Department Name</label>
                          <input
                            type="text"
                            className="fetched-data-input"
                            value={toDeptName || 'Fetched Data'}
                            disabled
                          />
                        </div>

                        {/* CCD Account No */}
                        <div className="court-form-group">
                          <label className="court-form-label purple-label">
                            CCD Account No <span className="required-star">*</span>
                          </label>
                          <div className="select-wrapper">
                            <select
                              className="purple-select-input"
                              value={toCcdAccountNo}
                              onChange={(e) => setToCcdAccountNo(e.target.value)}
                            >
                              <option value="">Select</option>
                              {MOCK_CCD_ACCOUNTS.map(acc => (
                                <option key={acc} value={acc}>{acc}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    {toAccountType === 'CrCD' && (
                      <>
                        {/* Treasury Code */}
                        <div className="court-form-group">
                          <label className="court-form-label purple-label">
                            Treasury Code <span className="required-star">*</span>
                          </label>
                          <div className="select-wrapper">
                            <select
                              className="purple-select-input"
                              value={toTreasuryCode}
                              onChange={handleToTreasuryCodeChange}
                            >
                              <option value="">Select</option>
                              {Object.keys(MOCK_TO_TREASURIES).map(code => (
                                <option key={code} value={code}>{code}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Treasury Name */}
                        <div className="court-form-group">
                          <label className="court-form-label purple-label">Treasury Name</label>
                          <input
                            type="text"
                            className="fetched-data-input"
                            value={toTreasuryName || 'Fetched Data'}
                            disabled
                          />
                        </div>

                        {/* DDO Code */}
                        <div className="court-form-group">
                          <label className="court-form-label purple-label">
                            DDO Code <span className="required-star">*</span>
                          </label>
                          <div className="select-wrapper">
                            <select
                              className="purple-select-input"
                              value={toDdoCode}
                              onChange={handleToDdoCodeChange}
                            >
                              <option value="">Select</option>
                              {Object.keys(MOCK_TO_DDOS).map(code => (
                                <option key={code} value={code}>{code}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* DDO Name */}
                        <div className="court-form-group">
                          <label className="court-form-label purple-label">DDO Name</label>
                          <input
                            type="text"
                            className="fetched-data-input"
                            value={toDdoName || 'Fetched Data'}
                            disabled
                          />
                        </div>

                        {/* Department Code */}
                        <div className="court-form-group">
                          <label className="court-form-label purple-label">Department Code</label>
                          <input
                            type="text"
                            className="fetched-data-input"
                            value={toDeptCode || 'Fetched Data'}
                            disabled
                          />
                        </div>

                        {/* Department Name */}
                        <div className="court-form-group">
                          <label className="court-form-label purple-label">Department Name</label>
                          <input
                            type="text"
                            className="fetched-data-input"
                            value={toDeptName || 'Fetched Data'}
                            disabled
                          />
                        </div>

                        {/* CrCD Account No */}
                        <div className="court-form-group">
                          <label className="court-form-label purple-label">
                            CrCD Account No <span className="required-star">*</span>
                          </label>
                          <div className="select-wrapper">
                            <select
                              className="purple-select-input"
                              value={toCrcdAccountNo}
                              onChange={(e) => setToCrcdAccountNo(e.target.value)}
                            >
                              <option value="">Select</option>
                              {MOCK_CRCD_ACCOUNTS.map(acc => (
                                <option key={acc} value={acc}>{acc}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    {toAccountType === 'Works' && (
                      <>
                        {/* Work ID (Full Width) */}
                        <div className="court-form-group col-span-2">
                          <label className="court-form-label purple-label">
                            Work ID <span className="required-star">*</span>
                          </label>
                          <div className="select-wrapper">
                            <select
                              className="purple-select-input"
                              value={workId}
                              onChange={handleWorkChange}
                            >
                              <option value="">Select</option>
                              {Object.keys(MOCK_WORKS).map(id => (
                                <option key={id} value={id}>{id} - {MOCK_WORKS[id].title}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Treasury */}
                        <div className="court-form-group">
                          <label className="court-form-label purple-label">Treasury</label>
                          <input
                            type="text"
                            className="fetched-data-input"
                            value={workId ? treasury : 'Fetched Data'}
                            disabled
                          />
                        </div>

                        {/* Work ID Type */}
                        <div className="court-form-group">
                          <label className="court-form-label purple-label">Work ID Type</label>
                          <input
                            type="text"
                            className="fetched-data-input"
                            value={workId ? workIdType : 'Fetched Data'}
                            disabled
                          />
                        </div>

                        {/* DDO Code */}
                        <div className="court-form-group">
                          <label className="court-form-label purple-label">DDO Code</label>
                          <input
                            type="text"
                            className="fetched-data-input"
                            value={workId ? ddoCode : 'Fetched Data'}
                            disabled
                          />
                        </div>

                        {/* DDO Name */}
                        <div className="court-form-group">
                          <label className="court-form-label purple-label">DDO Name</label>
                          <input
                            type="text"
                            className="fetched-data-input"
                            value={workId ? ddoName : 'Fetched Data'}
                            disabled
                          />
                        </div>
                      </>
                    )}

                    {/* Action buttons inside TO card at bottom right (Full Width row) */}
                    <div className="to-works-buttons-container col-span-2">
                      <button
                        type="button"
                        className="purple-btn-reset-new"
                        onClick={handleReset}
                      >
                        Reset Form
                      </button>
                      <button
                        type="submit"
                        className="purple-btn-submit-new"
                        disabled={isSubmitting}
                      >
                        <span className="btn-icon-wrapper">
                          <Check size={14} strokeWidth={4} />
                        </span>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </form>
        </div>
      </div>
    </CommentLayer>
  );
}
