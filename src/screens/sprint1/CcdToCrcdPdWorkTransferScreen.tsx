import React, { useState } from 'react';
import {
  Check,
  AlertCircle,
  Printer,
  X,
  FileText,
  CheckCircle
} from 'lucide-react';
import CommentLayer from '../../components/feedback/CommentLayer';
import './CcdToCrcdPdWorkTransferScreen.css';

// --- Interfaces ---
interface ChallanItem {
  code: string;
  amount: number;
}

interface CcdAccount {
  accountNo: string;
  operatorName: string;
  ddoCode: string;
  ddoName: string;
  deptCode: string;
  deptName: string;
  expenditurePattern: 'TOTAL_AMOUNT' | 'CHALLAN_WISE';
  challans?: ChallanItem[];
  balance: number;
}

interface DdoDetail {
  code: string;
  name: string;
  deptCode: string;
  deptName: string;
}

interface TransferRecord {
  id: string;
  dateTime: string;
  fromDepositType: string;
  fromAccountNo: string;
  challanNo?: string;
  toDepositType: string;
  toAccountOrWork: string;
  amount: number;
  hoa: string;
  status: 'Approved' | 'Submitted';
  purpose: string;
}

// --- Mock Data ---
const MOCK_CCD_ACCOUNTS: Record<string, CcdAccount> = {
  'CCD/320/1103/21001': {
    accountNo: 'CCD/320/1103/21001',
    operatorName: 'Shri A. K. Sharma (Senior Civil Assistant)',
    ddoCode: 'DDO-JUS-209110',
    ddoName: 'District & Sessions Court Bhopal',
    deptCode: 'DEP-JUS-01',
    deptName: 'Department of Law & Justice',
    expenditurePattern: 'TOTAL_AMOUNT',
    balance: 15430579.00
  },
  'CCD/320/1103/21002': {
    accountNo: 'CCD/320/1103/21002',
    operatorName: 'Smt. Rajni Verma (Registrar Clerk)',
    ddoCode: 'DDO-JUS-209115',
    ddoName: 'High Court Bench Indore',
    deptCode: 'DEP-JUS-01',
    deptName: 'Department of Law & Justice',
    expenditurePattern: 'CHALLAN_WISE',
    challans: [
      { code: 'CHL-2026-001', amount: 5000000.00 },
      { code: 'CHL-2026-002', amount: 3750000.00 }
    ],
    balance: 8750000.00
  },
  'CCD/320/1103/21003': {
    accountNo: 'CCD/320/1103/21003',
    operatorName: 'Shri M. P. Singh (Additional District Judge)',
    ddoCode: 'DDO-JUS-209120',
    ddoName: 'Additional Sessions Court Gwalior',
    deptCode: 'DEP-JUS-01',
    deptName: 'Department of Law & Justice',
    expenditurePattern: 'TOTAL_AMOUNT',
    balance: 12400000.00
  }
};

const MOCK_TREASURIES: Record<string, string> = {
  'TR-01': 'District Treasury Bhopal (01)',
  'TR-02': 'District Treasury Indore (02)',
  'TR-03': 'District Treasury Gwalior (03)'
};

const MOCK_DDOS: Record<string, DdoDetail> = {
  'DDO-JUS-001': {
    code: 'DDO-JUS-001',
    name: 'Chief Judicial Magistrate Court, Bhopal',
    deptCode: 'DEP-JUS-01',
    deptName: 'Department of Law & Justice'
  },
  'DDO-JUS-002': {
    code: 'DDO-JUS-002',
    name: 'District Family Court, Indore',
    deptCode: 'DEP-JUS-01',
    deptName: 'Department of Law & Justice'
  },
  'DDO-ADM-001': {
    code: 'DDO-ADM-001',
    name: 'District Collectorate Office, Bhopal',
    deptCode: 'DEP-REV-02',
    deptName: 'Revenue Department'
  },
  'DDO-PWD-001': {
    code: 'DDO-PWD-001',
    name: 'Executive Engineer, PWD Division-I, Bhopal',
    deptCode: 'DEP-PWD-03',
    deptName: 'Public Works Department'
  }
};

const MOCK_DEST_ACCOUNTS: Record<string, Record<string, string>> = {
  'CrCD': {
    'CRCD/320/1104/50001': 'CRCD/320/1104/50001 - CJM Court Criminal Deposit',
    'CRCD/320/1104/50002': 'CRCD/320/1104/50002 - Sessions Court Fine & Bail Deposit'
  },
  'PD': {
    'PD-8443-1001': 'PD-8443-1001 - Senior Civil Assistant Personal Deposit Account',
    'PD-8443-1002': 'PD-8443-1002 - District Collector Revenue PD Account'
  },
  'CCD': {
    'CCD/320/1103/99001': 'CCD/320/1103/99001 - High Court Bench Civil Deposit'
  },
  'Work ID': {
    'WRK-2026-009': 'WRK-2026-009 - Construction of Court Extension Annex',
    'WRK-2026-015': 'WRK-2026-015 - Renovation of Sessions Court Complex'
  }
};

const INITIAL_RECORDS: TransferRecord[] = [
  {
    id: 'TRF-CCD-2026-001',
    dateTime: '2026-09-24 14:30',
    fromDepositType: 'CCD',
    fromAccountNo: 'CCD/320/1103/21001',
    toDepositType: 'Criminal Court Deposit (CrCD)',
    toAccountOrWork: 'CRCD/320/1104/50001',
    amount: 250000.00,
    hoa: '8443-00-104-0001',
    status: 'Approved',
    purpose: 'Inter-court bail deposit transfer order #402/2026'
  },
  {
    id: 'TRF-CCD-2026-002',
    dateTime: '2026-09-22 11:15',
    fromDepositType: 'CCD',
    fromAccountNo: 'CCD/320/1103/21001',
    toDepositType: 'Work ID (Works Account)',
    toAccountOrWork: 'WRK-2026-009',
    amount: 1500000.00,
    hoa: '8443-00-108-0001',
    status: 'Submitted',
    purpose: 'Court annex infrastructure maintenance transfer'
  }
];

export default function CcdToCrcdPdWorkTransferScreen() {
  // Toast notification state
  const [toast, setToast] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'warning' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // --- FROM Section State ---
  const [fromDepositType] = useState<string>('CCD'); // Source Fixed as CCD
  const [fromAccountNo, setFromAccountNo] = useState<string>('CCD/320/1103/21001');
  const [selectedChallanNo, setSelectedChallanNo] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [purposeOfTransfer, setPurposeOfTransfer] = useState<string>('');

  // Derived FROM Account Details
  const currentAccount = MOCK_CCD_ACCOUNTS[fromAccountNo] || MOCK_CCD_ACCOUNTS['CCD/320/1103/21001'];
  const isChallanWise = currentAccount.expenditurePattern === 'CHALLAN_WISE';

  // Derived Account Balance (or Challan Balance if challan-wise)
  const selectedChallanObj = isChallanWise && currentAccount.challans 
    ? currentAccount.challans.find(c => c.code === selectedChallanNo) 
    : null;
  
  const displayAccountBalance = selectedChallanObj ? selectedChallanObj.amount : currentAccount.balance;

  // --- TO Section State ---
  const [toDepositType, setToDepositType] = useState<string>('Civil Court Deposit (CCD)');
  const [treasuryCode, setTreasuryCode] = useState<string>('');
  const [ddoCode, setDdoCode] = useState<string>('');
  const [targetAccountNo, setTargetAccountNo] = useState<string>('');

  // Derived TO details
  const selectedTreasuryName = treasuryCode && MOCK_TREASURIES[treasuryCode] ? MOCK_TREASURIES[treasuryCode] : 'Fetched Data';
  const selectedDdo = ddoCode && MOCK_DDOS[ddoCode] ? MOCK_DDOS[ddoCode] : { deptCode: 'Fetched Data', deptName: 'Fetched Data', name: 'Fetched Data' };

  // Determine Target Deposit Key (CrCD, PD, CCD, Work ID)
  const getTargetDepositKey = () => {
    if (toDepositType.includes('CrCD') || toDepositType.includes('Criminal')) return 'CrCD';
    if (toDepositType.includes('PD') || toDepositType.includes('Personal')) return 'PD';
    if (toDepositType.includes('Work')) return 'Work ID';
    return 'CCD';
  };

  const targetHoa = getTargetDepositKey() === 'CrCD' ? '8443-00-104-0001' :
                    getTargetDepositKey() === 'PD' ? '8443-00-106-0001' :
                    getTargetDepositKey() === 'Work ID' ? '8443-00-108-0001' : '8443-00-103-0001';

  // --- History & Voucher State ---
  const [records, setRecords] = useState<TransferRecord[]>(INITIAL_RECORDS);
  const [selectedVoucher, setSelectedVoucher] = useState<TransferRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(val);
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const accNo = e.target.value;
    setFromAccountNo(accNo);
    setSelectedChallanNo('');
  };

  const handleToDepositTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setToDepositType(e.target.value);
    setTargetAccountNo('');
  };

  const handleReset = () => {
    setFromAccountNo('CCD/320/1103/21001');
    setSelectedChallanNo('');
    setTransferAmount('');
    setPurposeOfTransfer('');
    setToDepositType('Civil Court Deposit (CCD)');
    setTreasuryCode('');
    setDdoCode('');
    setTargetAccountNo('');
    showToast('warning', 'Form reset to initial default state.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(transferAmount);

    if (!transferAmount || isNaN(amountNum) || amountNum <= 0) {
      showToast('error', 'Please enter a valid transfer amount.');
      return;
    }
    if (isChallanWise && !selectedChallanNo) {
      showToast('warning', 'Please select a Challan Number for Challan-wise expenditure transfer.');
      return;
    }
    if (amountNum > displayAccountBalance) {
      showToast('error', 'Transfer amount exceeds available balance!');
      return;
    }
    if (!purposeOfTransfer.trim()) {
      showToast('warning', 'Please enter the purpose of transfer.');
      return;
    }
    if (!treasuryCode) {
      showToast('warning', 'Please select a Treasury Code.');
      return;
    }
    if (!ddoCode) {
      showToast('warning', 'Please select a DDO Code.');
      return;
    }
    if (!targetAccountNo) {
      showToast('warning', 'Please select the destination account / Work ID.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newRec: TransferRecord = {
        id: `TRF-CCD-2026-${Math.floor(100 + Math.random() * 900)}`,
        dateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
        fromDepositType: 'CCD',
        fromAccountNo: currentAccount.accountNo,
        challanNo: isChallanWise ? selectedChallanNo : undefined,
        toDepositType,
        toAccountOrWork: targetAccountNo,
        amount: amountNum,
        hoa: targetHoa,
        status: 'Submitted',
        purpose: purposeOfTransfer
      };

      setRecords([newRec, ...records]);
      setIsSubmitting(false);
      showToast('success', `Transfer request ${newRec.id} submitted successfully!`);
      setTransferAmount('');
      setPurposeOfTransfer('');
      setSelectedChallanNo('');
    }, 600);
  };

  return (
    <div className="ccd-transfer-screen">
      {/* Toast Notification */}
      {toast && (
        <div className={`purple-toast ${toast.type}`}>
          {toast.type === 'success' && <Check size={18} />}
          {toast.type === 'warning' && <AlertCircle size={18} />}
          {toast.type === 'error' && <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Breadcrumb */}
      <div className="ccd-transfer-breadcrumb">
        <div>DEPOSIT MANAGEMENT &gt; CROSS DEPOSIT TRANSFER &gt; CCD TRANSFER SCREEN</div>
        <span className="badge-pill">Source Fixed: CCD (Civil Court Deposit)</span>
      </div>

      {/* Tab Header Strip */}
      <div className="ccd-transfer-tab-container">
        <div className="ccd-transfer-tab-active">
          CCD to CrCD / PD / Work ID Transfer Management
        </div>
      </div>

      {/* Main Content */}
      <div className="ccd-transfer-content">
        <form onSubmit={handleSubmit}>
          
          {/* Side-by-Side Cards (FROM & TO) */}
          <div className="purple-cards-grid">

            {/* FROM CARD */}
            <div className="purple-card">
              <div className="purple-card-header">
                <span className="purple-card-title">FROM</span>
              </div>

              <div className="purple-card-body">
                <div className="purple-form-grid">
                  
                  {/* 1. Deposit Type */}
                  <div className="purple-form-group">
                    <label className="purple-label">Deposit Type</label>
                    <div className="purple-fetched-box">
                      {fromDepositType}
                    </div>
                  </div>

                  {/* 2. Account No * (Replaced Operator Code) */}
                  <div className="purple-form-group">
                    <label className="purple-label">
                      Account No <span className="star-red">*</span>
                    </label>
                    <select
                      className="purple-select"
                      value={fromAccountNo}
                      onChange={handleAccountChange}
                    >
                      {Object.keys(MOCK_CCD_ACCOUNTS).map(accKey => (
                        <option key={accKey} value={accKey}>
                          {accKey}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Operator Name */}
                  <div className="purple-form-group">
                    <label className="purple-label">Operator Name</label>
                    <div className="purple-fetched-box">
                      {currentAccount.operatorName}
                    </div>
                  </div>

                  {/* 4. DDO Code */}
                  <div className="purple-form-group">
                    <label className="purple-label">DDO Code</label>
                    <div className="purple-fetched-box">
                      {currentAccount.ddoCode}
                    </div>
                  </div>

                  {/* 5. DDO Name */}
                  <div className="purple-form-group">
                    <label className="purple-label">DDO Name</label>
                    <div className="purple-fetched-box">
                      {currentAccount.ddoName}
                    </div>
                  </div>

                  {/* 6. Department Code */}
                  <div className="purple-form-group">
                    <label className="purple-label">Department Code</label>
                    <div className="purple-fetched-box">
                      {currentAccount.deptCode}
                    </div>
                  </div>

                  {/* 7. Department Name */}
                  <div className="purple-form-group">
                    <label className="purple-label">Department Name</label>
                    <div className="purple-fetched-box">
                      {currentAccount.deptName}
                    </div>
                  </div>

                  {/* 8. Expenditure Pattern */}
                  <div className="purple-form-group">
                    <label className="purple-label">Expenditure Pattern</label>
                    <div className="purple-fetched-box">
                      {currentAccount.expenditurePattern}
                    </div>
                  </div>

                  {/* 9. Conditional Challan Number Dropdown (Only if Expenditure Pattern === CHALLAN_WISE) */}
                  {isChallanWise && (
                    <div className="purple-form-group">
                      <label className="purple-label">
                        Challan Number <span className="star-red">*</span>
                      </label>
                      <select
                        className="purple-select"
                        value={selectedChallanNo}
                        onChange={(e) => setSelectedChallanNo(e.target.value)}
                      >
                        <option value="">-- Select Challan No --</option>
                        {currentAccount.challans?.map(ch => (
                          <option key={ch.code} value={ch.code}>
                            {ch.code} (₹ {formatINR(ch.amount)})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* 10. Account Balance (Replaced HOA Balance) */}
                  <div className="purple-form-group">
                    <label className="purple-label">Account Balance</label>
                    <div className="purple-fetched-box">
                      ₹ {formatINR(displayAccountBalance)}
                    </div>
                  </div>

                  {/* 11. Transfer Amount * */}
                  <div className="purple-form-group">
                    <label className="purple-label">
                      Transfer Amount <span className="star-red">*</span>
                    </label>
                    <input
                      type="number"
                      className="purple-input"
                      placeholder="Enter transfer amount"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      min="1"
                    />
                  </div>

                  {/* 12. Purpose of Transfer * (Full Width) */}
                  <div className="purple-form-group full-width">
                    <label className="purple-label">
                      Purpose of Transfer <span className="star-red">*</span>
                    </label>
                    <input
                      type="text"
                      className="purple-input"
                      placeholder="Write the purpose of transfer"
                      value={purposeOfTransfer}
                      onChange={(e) => setPurposeOfTransfer(e.target.value)}
                    />
                  </div>

                </div>
              </div>
            </div>

            {/* TO CARD */}
            <div className="purple-card">
              <div className="purple-card-header">
                <span className="purple-card-title">TO</span>
              </div>

              <div className="purple-card-body">
                <div className="purple-form-grid">

                  {/* To Deposit Type * */}
                  <div className="purple-form-group">
                    <label className="purple-label">
                      To Deposit Type <span className="star-red">*</span>
                    </label>
                    <select
                      className="purple-select"
                      value={toDepositType}
                      onChange={handleToDepositTypeChange}
                    >
                      <option value="Civil Court Deposit (CCD)">Civil Court Deposit (CCD)</option>
                      <option value="Criminal Court Deposit (CrCD)">Criminal Court Deposit (CrCD)</option>
                      <option value="Personal Deposit (PD)">Personal Deposit (PD)</option>
                      <option value="Work ID (Works Account)">Work ID (Works Account)</option>
                    </select>
                  </div>

                  {/* Head of Account (HoA) */}
                  <div className="purple-form-group">
                    <label className="purple-label">Head of Account (HoA)</label>
                    <div className="purple-fetched-box">
                      {targetHoa}
                    </div>
                  </div>

                  {/* Treasury Code * */}
                  <div className="purple-form-group">
                    <label className="purple-label">
                      Treasury Code <span className="star-red">*</span>
                    </label>
                    <select
                      className="purple-select"
                      value={treasuryCode}
                      onChange={(e) => setTreasuryCode(e.target.value)}
                    >
                      <option value="">Select</option>
                      {Object.entries(MOCK_TREASURIES).map(([code, name]) => (
                        <option key={code} value={code}>{code} - {name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Treasury Name */}
                  <div className="purple-form-group">
                    <label className="purple-label">Treasury Name</label>
                    <div className="purple-fetched-box muted">
                      {selectedTreasuryName}
                    </div>
                  </div>

                  {/* DDO Code * */}
                  <div className="purple-form-group">
                    <label className="purple-label">
                      DDO Code <span className="star-red">*</span>
                    </label>
                    <select
                      className="purple-select"
                      value={ddoCode}
                      onChange={(e) => setDdoCode(e.target.value)}
                    >
                      <option value="">Select</option>
                      {Object.keys(MOCK_DDOS).map(code => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                  </div>

                  {/* DDO Name */}
                  <div className="purple-form-group">
                    <label className="purple-label">DDO Name</label>
                    <div className="purple-fetched-box muted">
                      {selectedDdo.name}
                    </div>
                  </div>

                  {/* Department Code */}
                  <div className="purple-form-group">
                    <label className="purple-label">Department Code</label>
                    <div className="purple-fetched-box muted">
                      {selectedDdo.deptCode}
                    </div>
                  </div>

                  {/* Department Name */}
                  <div className="purple-form-group">
                    <label className="purple-label">Department Name</label>
                    <div className="purple-fetched-box muted">
                      {selectedDdo.deptName}
                    </div>
                  </div>

                  {/* Destination Account No / Work ID * (Full Width) */}
                  <div className="purple-form-group full-width">
                    <label className="purple-label">
                      {getTargetDepositKey()} Account No <span className="star-red">*</span>
                    </label>
                    <select
                      className="purple-select"
                      value={targetAccountNo}
                      onChange={(e) => setTargetAccountNo(e.target.value)}
                    >
                      <option value="">Select</option>
                      {Object.entries(MOCK_DEST_ACCOUNTS[getTargetDepositKey()] || {}).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>

                </div>

                {/* Actions Row (Bottom Right under TO card) */}
                <div className="purple-actions-row">
                  <button
                    type="button"
                    className="btn-purple-outline"
                    onClick={handleReset}
                  >
                    Reset Form
                  </button>

                  <button
                    type="submit"
                    className="btn-purple-solid"
                    disabled={isSubmitting}
                  >
                    <CheckCircle size={16} />
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>

              </div>
            </div>

          </div>
        </form>

        {/* Live Balance Summary Bar */}
        <div className="purple-summary-bar">
          <div className="summary-item">
            <span className="summary-title">Source Available Balance</span>
            <span className="summary-num">₹ {formatINR(displayAccountBalance)}</span>
          </div>

          <div className="summary-divider-line" />

          <div className="summary-item">
            <span className="summary-title">Transfer Amount</span>
            <span className="summary-num" style={{ color: '#fef08a' }}>
              ₹ {formatINR(parseFloat(transferAmount) || 0)}
            </span>
          </div>

          <div className="summary-divider-line" />

          <div className="summary-item">
            <span className="summary-title">Remaining Balance</span>
            <span className="summary-num" style={{ color: '#86efac' }}>
              ₹ {formatINR(displayAccountBalance - (parseFloat(transferAmount) || 0))}
            </span>
          </div>
        </div>

        {/* History Table */}
        <div className="purple-table-card">
          <div className="purple-table-header">
            <div className="purple-table-title">
              <FileText size={18} />
              Recent CCD Transfer Log
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="purple-table">
              <thead>
                <tr>
                  <th>Ref ID</th>
                  <th>Date & Time</th>
                  <th>From CCD Account</th>
                  <th>Challan No</th>
                  <th>To Deposit Type</th>
                  <th>To Account / Work ID</th>
                  <th>Amount (₹)</th>
                  <th>Status</th>
                  <th>Voucher</th>
                </tr>
              </thead>
              <tbody>
                {records.map(rec => (
                  <tr key={rec.id}>
                    <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#5b21b6' }}>{rec.id}</td>
                    <td>{rec.dateTime}</td>
                    <td>{rec.fromAccountNo}</td>
                    <td>{rec.challanNo ? rec.challanNo : 'N/A (Total Amount)'}</td>
                    <td>{rec.toDepositType}</td>
                    <td style={{ fontWeight: 600 }}>{rec.toAccountOrWork}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                      ₹ {formatINR(rec.amount)}
                    </td>
                    <td>
                      <span className={`badge-purple ${rec.status.toLowerCase()}`}>
                        {rec.status === 'Approved' ? '✓ Approved' : '⏳ Submitted'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-purple-outline"
                        style={{ padding: '4px 10px', fontSize: '11px', border: '1px solid #7000B8' }}
                        onClick={() => setSelectedVoucher(rec)}
                      >
                        <Printer size={12} />
                        Advice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comment Layer */}
        <CommentLayer screenId="sprint1-ccd-transfer" />

      </div>

      {/* Voucher Modal */}
      {selectedVoucher && (
        <div className="modal-overlay" onClick={() => setSelectedVoucher(null)}>
          <div className="voucher-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="voucher-modal-header">
              <div style={{ fontWeight: 700, fontSize: '16px' }}>
                Transfer Advice Voucher #{selectedVoucher.id}
              </div>
              <button
                type="button"
                onClick={() => setSelectedVoucher(null)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="voucher-modal-body">
              <div style={{ border: '2px dashed #c084fc', padding: '20px', borderRadius: '8px', backgroundColor: '#faf5ff' }}>
                <div style={{ textAlign: 'center', borderBottom: '2px solid #7000B8', paddingBottom: '10px', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: '#7000B8', textTransform: 'uppercase' }}>TREASURY INTER-DEPOSIT TRANSFER VOUCHER</h3>
                  <span style={{ fontSize: '12px', color: '#4b5563' }}>CIVIL COURT DEPOSIT (CCD) TRANSFER ADVICE</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                  <div><strong>Voucher Ref:</strong> {selectedVoucher.id}</div>
                  <div><strong>Date:</strong> {selectedVoucher.dateTime}</div>
                  <div><strong>From Deposit Type:</strong> CCD</div>
                  <div><strong>From Account No:</strong> {selectedVoucher.fromAccountNo}</div>
                  {selectedVoucher.challanNo && <div><strong>Challan No:</strong> {selectedVoucher.challanNo}</div>}
                  <div><strong>To Deposit Type:</strong> {selectedVoucher.toDepositType}</div>
                  <div><strong>To Account / Work ID:</strong> {selectedVoucher.toAccountOrWork}</div>
                  <div><strong>Head of Account:</strong> {selectedVoucher.hoa}</div>
                  <div><strong style={{ color: '#7000B8' }}>Amount:</strong> ₹ {formatINR(selectedVoucher.amount)}</div>
                  <div style={{ gridColumn: 'span 2' }}><strong>Purpose:</strong> {selectedVoucher.purpose}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn-purple-outline"
                  onClick={() => setSelectedVoucher(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn-purple-solid"
                  onClick={() => window.print()}
                >
                  <Printer size={14} />
                  Print Advice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
