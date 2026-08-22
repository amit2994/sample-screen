import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Send,
  RefreshCw,
  UserCheck,
  Zap,
  Lock,
  Unlock,
  X
} from 'lucide-react';
import CommentLayer from '../../components/feedback/CommentLayer';
import './CrossDepositTransferEnablementScreen.css';

// --- Interfaces & Enums ---
export type DepositType =
  | 'PD'
  | 'CCD'
  | 'CrCD'
  | 'WORKS'
  | 'REVENUE'
  | 'SECURITY';

export interface DepositTypeOption {
  code: DepositType;
  label: string;
  category: string;
  headOfAccount: string;
}

export interface EnablementRequest {
  id: string;
  operatorCode: string;
  operatorName: string;
  ddoCode: string;
  ddoName: string;
  treasuryOffice: string;
  sourceDepositType: DepositType;
  targetDepositType: DepositType;
  requestedTransactions: number;
  approvedTransactions: number;
  remainingTransactions: number;
  purpose: string;
  authorityRef: string;
  validityDays: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXHAUSTED';
  requestDate: string;
  reviewedDate?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  rejectionRemarks?: string;
  approvalRemarks?: string;
}

export interface ExecutedTransferLog {
  id: string;
  requestId: string;
  sourceType: DepositType;
  targetType: DepositType;
  sourceAccount: string;
  targetAccount: string;
  amount: number;
  executedBy: string;
  timestamp: string;
  remainingAfter: number;
}

// --- Data Constants ---
const DEPOSIT_TYPES: DepositTypeOption[] = [
  {
    code: 'PD',
    label: 'Personal Deposit (PD) Account',
    category: 'Treasury PD',
    headOfAccount: '8443-00-106-0001'
  },
  {
    code: 'CCD',
    label: 'Civil Court Deposit (CCD)',
    category: 'Judicial Deposit',
    headOfAccount: '8443-00-103-0001'
  },
  {
    code: 'CrCD',
    label: 'Criminal Court Deposit (CrCD)',
    category: 'Judicial Deposit',
    headOfAccount: '8443-00-104-0001'
  },
  {
    code: 'WORKS',
    label: 'Works Deposit Account',
    category: 'Public Works',
    headOfAccount: '8443-00-108-0001'
  },
  {
    code: 'REVENUE',
    label: 'Revenue Deposit Account',
    category: 'State Revenue',
    headOfAccount: '8443-00-101-0001'
  },
  {
    code: 'SECURITY',
    label: 'Security Deposit (SD) Account',
    category: 'Statutory Deposit',
    headOfAccount: '8443-00-105-0001'
  }
];

const MOCK_OPERATORS = [
  {
    code: 'OP-8443-1',
    name: 'Shri A. K. Sharma',
    designation: 'Senior Accounts Officer / Operator',
    ddoCode: '5000405001',
    ddoName: 'DISTRICT TREASURY OFFICER SINGROLI',
    treasury: '500-Singrauli Treasury',
    deptCode: '04',
    deptName: 'Finance Department'
  },
  {
    code: 'OP-8443-2',
    name: 'Smt. Rajni Verma',
    designation: 'Court Registrar / Deposit Administrator',
    ddoCode: 'DDO-JUS-BPL-02',
    ddoName: 'DISTRICT TREASURY OFFICER SINGROLI',
    treasury: 'Bhopal Treasury (01)',
    deptCode: '04',
    deptName: 'Finance Department'
  }
];

const INITIAL_REQUESTS: EnablementRequest[] = [
  {
    id: 'REQ-XDT-2026-0041',
    operatorCode: 'OP-8443-1',
    operatorName: 'Shri A. K. Sharma',
    ddoCode: 'DDO-PWD-BPL-01',
    ddoName: 'Executive Engineer, PWD Division-I, Bhopal',
    treasuryOffice: 'Bhopal Treasury (01)',
    sourceDepositType: 'PD',
    targetDepositType: 'WORKS',
    requestedTransactions: 5,
    approvedTransactions: 5,
    remainingTransactions: 3,
    purpose: 'Inter-departmental allocation for Smart City Bypass Road Phase-II civil works under Finance Sanction GO-PWD-2026/894.',
    authorityRef: 'GO-PWD-2026/894',
    validityDays: 30,
    status: 'APPROVED',
    requestDate: '2026-08-20 10:30 AM',
    reviewedDate: '2026-08-20 02:15 PM',
    reviewedBy: 'Treasury Officer (JDTA Bhopal)',
    approvalRemarks: 'Verified against GO-PWD-2026/894. Screen enabled for 5 transactions.'
  },
  {
    id: 'REQ-XDT-2026-0042',
    operatorCode: 'OP-8443-2',
    operatorName: 'Smt. Rajni Verma',
    ddoCode: 'DDO-JUS-BPL-02',
    ddoName: 'District & Session Court, Bhopal',
    treasuryOffice: 'Bhopal Treasury (01)',
    sourceDepositType: 'CCD',
    targetDepositType: 'CrCD',
    requestedTransactions: 3,
    approvedTransactions: 0,
    remainingTransactions: 0,
    purpose: 'Re-allocation of legal award money from Civil Court Deposit to Criminal Court Deposit per High Court Order HC-2026/104.',
    authorityRef: 'HC-2026/104',
    validityDays: 15,
    status: 'PENDING',
    requestDate: '2026-08-22 09:15 AM'
  },
  {
    id: 'REQ-XDT-2026-0038',
    operatorCode: 'OP-8443-1',
    operatorName: 'Shri A. K. Sharma',
    ddoCode: 'DDO-PWD-BPL-01',
    ddoName: 'Executive Engineer, PWD Division-I, Bhopal',
    treasuryOffice: 'Bhopal Treasury (01)',
    sourceDepositType: 'REVENUE',
    targetDepositType: 'SECURITY',
    requestedTransactions: 10,
    approvedTransactions: 0,
    remainingTransactions: 0,
    purpose: 'Direct adjustment of revenue collection into contractor security deposit account.',
    authorityRef: 'MEMO-REV-901',
    validityDays: 7,
    status: 'REJECTED',
    requestDate: '2026-08-18 11:00 AM',
    reviewedDate: '2026-08-18 04:30 PM',
    reviewedBy: 'DTA Admin Officer',
    rejectionReason: 'Incompatible Deposit Heads',
    rejectionRemarks: 'Direct transfer from Revenue Deposit to Security Deposit is prohibited under Treasury Rule 8443. Requires DTA special clearance.'
  }
];

const INITIAL_EXECUTION_LOGS: ExecutedTransferLog[] = [
  {
    id: 'TXN-XDT-9801',
    requestId: 'REQ-XDT-2026-0041',
    sourceType: 'PD',
    targetType: 'WORKS',
    sourceAccount: 'PD-8443-00-106-0001 (Bhopal PWD)',
    targetAccount: 'WRK-2026-009 (Bhopal Bypass)',
    amount: 1500000.00,
    executedBy: 'Shri A. K. Sharma',
    timestamp: '2026-08-21 11:20 AM',
    remainingAfter: 4
  },
  {
    id: 'TXN-XDT-9802',
    requestId: 'REQ-XDT-2026-0041',
    sourceType: 'PD',
    targetType: 'WORKS',
    sourceAccount: 'PD-8443-00-106-0001 (Bhopal PWD)',
    targetAccount: 'WRK-2026-015 (Bridge Rehab)',
    amount: 2200000.00,
    executedBy: 'Shri A. K. Sharma',
    timestamp: '2026-08-21 03:45 PM',
    remainingAfter: 3
  }
];

export default function CrossDepositTransferEnablementScreen() {
  // Role & Active Tab State
  const [activeRole, setActiveRole] = useState<'OPERATOR' | 'TREASURY' | 'PORTAL'>('OPERATOR');
  const [requests, setRequests] = useState<EnablementRequest[]>(INITIAL_REQUESTS);
  const [executionLogs, setExecutionLogs] = useState<ExecutedTransferLog[]>(INITIAL_EXECUTION_LOGS);

  // Toast Notification State
  const [toast, setToast] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);
  const showToast = (type: 'success' | 'warning' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // --- Step 1: Deposit Operator Request Form State ---
  const [selectedOperator] = useState(MOCK_OPERATORS[0]);
  const [sourceDepositType, setSourceDepositType] = useState<DepositType>('PD');
  const [targetDepositType, setTargetDepositType] = useState<DepositType>('WORKS');
  const [requestedTransactions, setRequestedTransactions] = useState<number>(5);
  const [purposeJustification, setPurposeJustification] = useState<string>('');
  const [authorityRef, setAuthorityRef] = useState<string>('');
  const [validityDays, setValidityDays] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Quick Justification Templates
  const JUSTIFICATION_TEMPLATES = [
    'Inter-departmental allocation for civil works project execution.',
    'Transfer of court award deposit funds per High Court Judicial Direction.',
    'Adjustment of unspent Personal Deposit funds into Works Deposit Head.',
    'Special statutory deposit transfer sanctioned by State Treasury Order.'
  ];

  // Reset Operator Form
  const handleResetForm = () => {
    setSourceDepositType('PD');
    setTargetDepositType('WORKS');
    setRequestedTransactions(5);
    setPurposeJustification('');
    setAuthorityRef('');
    setValidityDays(30);
  };

  // Submit Request for Enablement
  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();

    if (sourceDepositType === targetDepositType) {
      showToast('error', 'Source Deposit Type and Target Deposit Type cannot be identical.');
      return;
    }

    if (!purposeJustification.trim() || purposeJustification.trim().length < 15) {
      showToast('warning', 'Please provide a detailed justification (minimum 15 characters).');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newReqId = `REQ-XDT-2026-00${requests.length + 43}`;
      const newRequest: EnablementRequest = {
        id: newReqId,
        operatorCode: selectedOperator.code,
        operatorName: selectedOperator.name,
        ddoCode: selectedOperator.ddoCode,
        ddoName: selectedOperator.ddoName,
        treasuryOffice: selectedOperator.treasury,
        sourceDepositType,
        targetDepositType,
        requestedTransactions: Number(requestedTransactions),
        approvedTransactions: 0,
        remainingTransactions: 0,
        purpose: purposeJustification,
        authorityRef,
        validityDays: Number(validityDays),
        status: 'PENDING',
        requestDate: new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      };

      setRequests([newRequest, ...requests]);
      setIsSubmitting(false);
      showToast(
        'success',
        `Request ${newReqId} submitted successfully to Treasury / JDTA / DTA for approval!`
      );
      handleResetForm();
    }, 600);
  };

  // --- Step 2: Treasury / JDTA / DTA Review Modal & Actions ---
  const [selectedRequestForReview, setSelectedRequestForReview] = useState<EnablementRequest | null>(null);
  const [treasuryFilterStatus, setTreasuryFilterStatus] = useState<string>('ALL');

  // Review Approval Modal State
  const [approvedCountInput, setApprovedCountInput] = useState<number>(5);
  const [approvalRemarksInput, setApprovalRemarksInput] = useState<string>('');
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('Inadequate Justification');
  const [rejectionRemarksInput, setRejectionRemarksInput] = useState<string>('');
  const [checklistValidations, setChecklistValidations] = useState({
    justificationVerified: false,
    depositTypesCompatible: false,
    transactionCountPermitted: false
  });

  const openReviewModal = (req: EnablementRequest) => {
    setSelectedRequestForReview(req);
    setApprovedCountInput(req.requestedTransactions);
    setApprovalRemarksInput('');
    setRejectionReasonInput('Inadequate Justification');
    setRejectionRemarksInput('');
    setChecklistValidations({
      justificationVerified: req.status === 'APPROVED',
      depositTypesCompatible: req.status === 'APPROVED',
      transactionCountPermitted: req.status === 'APPROVED'
    });
  };

  // Action: Approve Request
  const handleApproveRequest = () => {
    if (!selectedRequestForReview) return;

    if (!checklistValidations.justificationVerified || !checklistValidations.depositTypesCompatible || !checklistValidations.transactionCountPermitted) {
      showToast('warning', 'Please complete all validation checks before approving the request.');
      return;
    }

    const count = Number(approvedCountInput);
    if (count <= 0) {
      showToast('error', 'Approved number of transactions must be greater than 0.');
      return;
    }

    const updated = requests.map((r) => {
      if (r.id === selectedRequestForReview.id) {
        return {
          ...r,
          status: 'APPROVED' as const,
          approvedTransactions: count,
          remainingTransactions: count,
          reviewedDate: new Date().toLocaleString(),
          reviewedBy: 'Treasury Officer / JDTA (Bhopal)',
          approvalRemarks: approvalRemarksInput || 'Approved as requested. Transfer screen enabled.'
        };
      }
      return r;
    });

    setRequests(updated);
    showToast(
      'success',
      `Request ${selectedRequestForReview.id} APPROVED! Transfer screen enabled for ${count} transactions.`
    );
    setSelectedRequestForReview(null);
  };

  // Action: Reject Request
  const handleRejectRequest = () => {
    if (!selectedRequestForReview) return;

    if (!rejectionRemarksInput.trim()) {
      showToast('warning', 'Please enter rejection remarks explaining the reason to the Deposit Operator.');
      return;
    }

    const updated = requests.map((r) => {
      if (r.id === selectedRequestForReview.id) {
        return {
          ...r,
          status: 'REJECTED' as const,
          approvedTransactions: 0,
          remainingTransactions: 0,
          reviewedDate: new Date().toLocaleString(),
          reviewedBy: 'Treasury Officer / JDTA (Bhopal)',
          rejectionReason: rejectionReasonInput,
          rejectionRemarks: rejectionRemarksInput
        };
      }
      return r;
    });

    setRequests(updated);
    showToast('error', `Request ${selectedRequestForReview.id} REJECTED and closed.`);
    setSelectedRequestForReview(null);
  };

  // --- Step 3: Interactive Transfer Simulation (Consume Permitted Transaction) ---
  const activeApprovedRequest = requests.find(
    (r) => r.status === 'APPROVED' && r.remainingTransactions > 0
  );

  const [simulatedAmount, setSimulatedAmount] = useState<string>('750000');
  const [simulatedTargetAccount, setSimulatedTargetAccount] = useState<string>('WRK-2026-022 (Smart Infrastructure)');

  const handleExecuteSimulatedTransfer = () => {
    if (!activeApprovedRequest) {
      showToast('error', 'No active enabled transfer request available. Submit or approve a request first!');
      return;
    }

    const amt = parseFloat(simulatedAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('warning', 'Please enter a valid transfer amount.');
      return;
    }

    const newRemaining = activeApprovedRequest.remainingTransactions - 1;

    // Update requests state
    const updatedRequests = requests.map((r) => {
      if (r.id === activeApprovedRequest.id) {
        return {
          ...r,
          remainingTransactions: newRemaining,
          status: newRemaining === 0 ? ('EXHAUSTED' as const) : ('APPROVED' as const)
        };
      }
      return r;
    });

    // Add log
    const newLog: ExecutedTransferLog = {
      id: `TXN-XDT-${Math.floor(1000 + Math.random() * 9000)}`,
      requestId: activeApprovedRequest.id,
      sourceType: activeApprovedRequest.sourceDepositType,
      targetType: activeApprovedRequest.targetDepositType,
      sourceAccount: `${activeApprovedRequest.sourceDepositType}-8443-HEAD-001`,
      targetAccount: simulatedTargetAccount,
      amount: amt,
      executedBy: selectedOperator.name,
      timestamp: new Date().toLocaleString(),
      remainingAfter: newRemaining
    };

    setRequests(updatedRequests);
    setExecutionLogs([newLog, ...executionLogs]);

    if (newRemaining === 0) {
      showToast(
        'warning',
        `Transfer executed! Approved count is now 0 (EXHAUSTED). Screen enablement closed.`
      );
    } else {
      showToast(
        'success',
        `Transfer executed successfully! 1 permitted transaction count consumed. ${newRemaining} remaining.`
      );
    }
  };

  // Helper getters
  const getDepositLabel = (code: DepositType) => {
    return DEPOSIT_TYPES.find((d) => d.code === code)?.label || code;
  };

  const pendingRequestsCount = requests.filter((r) => r.status === 'PENDING').length;
  const approvedRequestsCount = requests.filter((r) => r.status === 'APPROVED').length;

  const filteredRequests = requests.filter((r) => {
    if (treasuryFilterStatus === 'PENDING') return r.status === 'PENDING';
    if (treasuryFilterStatus === 'APPROVED') return r.status === 'APPROVED';
    if (treasuryFilterStatus === 'REJECTED') return r.status === 'REJECTED';
    return true;
  });

  return (
    <CommentLayer screenId="sprint1-cross-deposit-enablement">
      <div className="cross-deposit-container">

        {/* Toast Notification Popup */}
        {toast && (
          <div className={`xdt-toast ${toast.type}`}>
            {toast.type === 'success' && <CheckCircle2 size={20} />}
            {toast.type === 'warning' && <AlertCircle size={20} />}
            {toast.type === 'error' && <XCircle size={20} />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Top Screen Header Banner */}
        <div className="screen-header-banner">
          <div className="header-top-row">
            <div className="header-title-area">
              <h1>Enablement for Different Deposit Type Transfer</h1>
            </div>

            {/* Role / Context Switcher */}
            <div className="role-switcher-container">
              <button
                type="button"
                className={`role-tab-btn ${activeRole === 'OPERATOR' ? 'active' : ''}`}
                onClick={() => setActiveRole('OPERATOR')}
              >
                <FileText size={15} />
                <span>Step 1: Deposit Operator</span>
              </button>
              <button
                type="button"
                className={`role-tab-btn ${activeRole === 'TREASURY' ? 'active' : ''}`}
                onClick={() => setActiveRole('TREASURY')}
              >
                <UserCheck size={15} />
                <span>Step 2: Treasury / JDTA / DTA</span>
                {pendingRequestsCount > 0 && (
                  <span className="badge-counter">{pendingRequestsCount}</span>
                )}
              </button>
              <button
                type="button"
                className={`role-tab-btn ${activeRole === 'PORTAL' ? 'active' : ''}`}
                onClick={() => setActiveRole('PORTAL')}
              >
                <Zap size={15} />
                <span>Step 3: Transfer Portal</span>
                {approvedRequestsCount > 0 && (
                  <span className="badge-counter">{approvedRequestsCount}</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Workflow Visual Bar */}
        <div className="workflow-steps-bar">
          <div className={`workflow-step-item ${activeRole === 'OPERATOR' ? 'active' : 'completed'}`}>
            <div className="step-number">1</div>
            <div className="step-info">
              <span className="step-title">Step 1: Initiation</span>
              <span className="step-desc">Operator Requests Screen Enablement</span>
            </div>
          </div>
          <div className={`workflow-step-item ${activeRole === 'TREASURY' ? 'active' : pendingRequestsCount > 0 ? '' : 'completed'}`}>
            <div className="step-number">2</div>
            <div className="step-info">
              <span className="step-title">Step 2: Treasury Approval</span>
              <span className="step-desc">JDTA / DTA Validates & Approves</span>
            </div>
          </div>
          <div className={`workflow-step-item ${activeRole === 'PORTAL' ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-info">
              <span className="step-title">Step 3: Execution</span>
              <span className="step-desc">Enabled Screen Permitted Transfers</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: DEPOSIT OPERATOR REQUEST FORM (STEP 1)                            */}
        {/* ========================================================================= */}
        {activeRole === 'OPERATOR' && (
          <div className="xdt-card">
            <div className="xdt-card-header">
              <div className="card-title-group">
                <div className="card-title-icon">
                  <Send size={20} />
                </div>
                <div>
                  <h2>Initiate Request for Enabling Cross Deposit-Type Fund Transfer Screen </h2>

                </div>
              </div>
            </div>

            <div className="xdt-card-body">
              <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

                {/* Operator Details Banner */}
                <div className="operator-info-bar">
                  <div className="info-item">
                    <span className="info-item-label">DDO Code </span>
                    <span className="info-item-value">{selectedOperator.ddoCode}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-item-label">DDO Name</span>
                    <span className="info-item-value">{selectedOperator.ddoName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-item-label">Treasury Name</span>
                    <span className="info-item-value">{selectedOperator.treasury}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-item-label">Department Code</span>
                    <span className="info-item-value">{selectedOperator.deptCode}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-item-label">Department Name</span>
                    <span className="info-item-value">{selectedOperator.deptName}</span>
                  </div>
                </div>

                {/* Single Row Form Layout */}
                <div className="single-row-form-layout">
                  {/* Deposit Type Selection Card (Visual Box) */}
                  <div className="form-group">
                    <label className="form-label">
                      Deposit Type Selection <span className="required">*</span>
                    </label>
                    <div className="deposit-transfer-visual-box compact">
                      <div className="deposit-type-select-card source">
                        <span className="deposit-card-label source-label">
                          <Lock size={13} /> From
                        </span>
                        <select
                          className="form-select"
                          value={sourceDepositType}
                          onChange={(e) => setSourceDepositType(e.target.value as DepositType)}
                          required
                        >
                          {DEPOSIT_TYPES.map((dt) => (
                            <option key={`src-${dt.code}`} value={dt.code}>
                              {dt.label} ({dt.headOfAccount})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="transfer-arrow-divider compact">
                        <ArrowRight size={16} />
                      </div>

                      <div className="deposit-type-select-card target">
                        <span className="deposit-card-label target-label">
                          <Unlock size={13} /> To
                        </span>
                        <select
                          className="form-select"
                          value={targetDepositType}
                          onChange={(e) => setTargetDepositType(e.target.value as DepositType)}
                          required
                        >
                          {DEPOSIT_TYPES.map((dt) => (
                            <option key={`tgt-${dt.code}`} value={dt.code}>
                              {dt.label} ({dt.headOfAccount})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Number of Transactions to be Permitted */}
                  <div className="form-group">
                    <label className="form-label">
                      Permitted Txns <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      min={1}
                      max={50}
                      value={requestedTransactions}
                      onChange={(e) => setRequestedTransactions(parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>

                  {/* Purpose / Justification Field */}
                  <div className="form-group">
                    <label className="form-label">
                      Purpose / Justification <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter purpose / justification..."
                      value={purposeJustification}
                      onChange={(e) => setPurposeJustification(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {sourceDepositType === targetDepositType && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-error)', fontSize: 'var(--font-size-xs)', marginTop: '-8px' }}>
                    <AlertCircle size={14} /> Source and Target Deposit Types are identical! Select different deposit heads to enable cross-type transfer.
                  </div>
                )}

                {/* Template quick select chips */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
                    Quick Template Justifications:
                  </span>
                  <div className="template-chips-row">
                    {JUSTIFICATION_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="chip-btn"
                        onClick={() => setPurposeJustification(tmpl)}
                      >
                        + {tmpl.substring(0, 45)}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="form-actions-row">
                  <button type="button" className="btn-secondary" onClick={handleResetForm}>
                    <RefreshCw size={14} /> Reset Form
                  </button>
                  <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    <Send size={14} /> {isSubmitting ? 'Submitting Request...' : 'Submit Request for Treasury Approval'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: TREASURY / JDTA / DTA APPROVAL QUEUE (STEP 2)                    */}
        {/* ========================================================================= */}
        {activeRole === 'TREASURY' && (
          <div className="xdt-card">
            <div className="xdt-card-header">
              <div className="card-title-group">
                <div className="card-title-icon">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h2>Treasury / JDTA / DTA Review & Approval Portal</h2>
                  <p>Review submitted enablement requests, validate justification & deposit types, and approve or reject screen enablement.</p>
                </div>
              </div>

              {/* Status Filter buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`btn-secondary ${treasuryFilterStatus === st ? 'active' : ''}`}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: treasuryFilterStatus === st ? 'var(--color-primary)' : 'var(--color-white)',
                      color: treasuryFilterStatus === st ? 'var(--color-white)' : 'var(--color-text-secondary)',
                      borderColor: treasuryFilterStatus === st ? 'var(--color-primary)' : 'var(--color-border)'
                    }}
                    onClick={() => setTreasuryFilterStatus(st)}
                  >
                    {st === 'ALL' ? 'All Requests' : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="xdt-card-body">
              <div className="table-responsive">
                <table className="xdt-table">
                  <thead>
                    <tr>
                      <th>Request Ref ID</th>
                      <th>Operator Details</th>
                      <th>Route (Source ➔ Target)</th>
                      <th>Permitted Txns</th>
                      <th>Authority Order</th>
                      <th>Date Submitted</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-tertiary)' }}>
                          No requests found matching status filter: <strong>{treasuryFilterStatus}</strong>.
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((req) => (
                        <tr key={req.id}>
                          <td>
                            <strong style={{ color: 'var(--color-primary)' }}>{req.id}</strong>
                          </td>
                          <td>
                            <div>
                              <div style={{ fontWeight: 600 }}>{req.operatorName}</div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{req.ddoCode}</div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className="badge" style={{ background: '#EEF2FF', color: '#4F46E5' }}>{req.sourceDepositType}</span>
                              <ArrowRight size={12} style={{ color: 'var(--color-text-tertiary)' }} />
                              <span className="badge" style={{ background: '#ECFDF5', color: '#047857' }}>{req.targetDepositType}</span>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700 }}>
                              {req.status === 'APPROVED' ? `${req.remainingTransactions} / ${req.approvedTransactions}` : req.requestedTransactions}
                            </span>
                          </td>
                          <td>
                            <code style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>
                              {req.authorityRef}
                            </code>
                          </td>
                          <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                            {req.requestDate}
                          </td>
                          <td>
                            {req.status === 'PENDING' && <span className="badge badge-pending"><Clock size={12} /> Pending</span>}
                            {req.status === 'APPROVED' && <span className="badge badge-approved"><CheckCircle2 size={12} /> Approved</span>}
                            {req.status === 'REJECTED' && <span className="badge badge-rejected"><XCircle size={12} /> Rejected</span>}
                            {req.status === 'EXHAUSTED' && <span className="badge badge-exhausted"><Lock size={12} /> Exhausted</span>}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-primary"
                              style={{ padding: '6px 14px', fontSize: '12px' }}
                              onClick={() => openReviewModal(req)}
                            >
                              {req.status === 'PENDING' ? 'Review & Decision' : 'View Details'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: TRANSFER EXECUTION PORTAL & SIMULATOR (STEP 3)                    */}
        {/* ========================================================================= */}
        {activeRole === 'PORTAL' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

            {/* Enabled Transfer Capability Banner */}
            {activeApprovedRequest ? (
              <div className="active-execution-banner">
                <div>
                  <span className="header-badge-tag" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                    <Unlock size={14} /> Transfer Screen Enabled & Active
                  </span>
                  <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, margin: '8px 0 4px 0' }}>
                    {getDepositLabel(activeApprovedRequest.sourceDepositType)} ➔ {getDepositLabel(activeApprovedRequest.targetDepositType)}
                  </h2>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: '#A7F3D0' }}>
                    Request Ref: <strong>{activeApprovedRequest.id}</strong> | Authority: <strong>{activeApprovedRequest.authorityRef}</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                  <div className="execution-stat-box">
                    <div className="execution-stat-value">{activeApprovedRequest.remainingTransactions}</div>
                    <div className="execution-stat-label">Remaining Allowed</div>
                  </div>
                  <div className="execution-stat-box">
                    <div className="execution-stat-value">{activeApprovedRequest.approvedTransactions}</div>
                    <div className="execution-stat-label">Total Approved</div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <AlertCircle size={28} style={{ color: '#D97706', flexShrink: 0 }} />
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: '#92400E' }}>
                    No Active Enabled Cross Deposit-Type Transfer Available
                  </h3>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: '#B45309', marginTop: '2px' }}>
                    Submit a new request in Step 1 (Operator Request) and approve it in Step 2 (Treasury Approval) to unlock the transfer screen for permitted transactions.
                  </p>
                </div>
              </div>
            )}

            {/* Transfer Simulation Card */}
            {activeApprovedRequest && (
              <div className="xdt-card">
                <div className="xdt-card-header">
                  <div className="card-title-group">
                    <div className="card-title-icon" style={{ background: '#ECFDF5', color: '#059669' }}>
                      <Zap size={20} />
                    </div>
                    <div>
                      <h2>Perform Cross Deposit-Type Transfer (Enabled Screen)</h2>
                      <p>Each transaction execution automatically decrements the approved remaining count.</p>
                    </div>
                  </div>
                </div>

                <div className="xdt-card-body">
                  <div className="form-grid-3">
                    <div className="form-group">
                      <label className="form-label">Source Account Head</label>
                      <input
                        type="text"
                        className="form-input"
                        value={`${activeApprovedRequest.sourceDepositType}-8443-HEAD-001 (Bhopal PWD)`}
                        disabled
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Target Work / Account</label>
                      <select
                        className="form-select"
                        value={simulatedTargetAccount}
                        onChange={(e) => setSimulatedTargetAccount(e.target.value)}
                      >
                        <option value="WRK-2026-022 (Smart Infrastructure)">WRK-2026-022 (Smart Infrastructure)</option>
                        <option value="WRK-2026-009 (Smart City Bypass Road)">WRK-2026-009 (Smart City Bypass Road)</option>
                        <option value="WRK-2026-015 (Bridge Rehabilitation)">WRK-2026-015 (Bridge Rehabilitation)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Transfer Amount (₹)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={simulatedAmount}
                        onChange={(e) => setSimulatedAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-actions-row">
                    <button
                      type="button"
                      className="btn-success"
                      onClick={handleExecuteSimulatedTransfer}
                    >
                      <Zap size={14} /> Execute Permitted Transfer (-1 Count)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Audit Execution Logs Table */}
            <div className="xdt-card">
              <div className="xdt-card-header">
                <div className="card-title-group">
                  <div className="card-title-icon">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h2>Executed Transfers Audit Log</h2>
                    <p>Audit trail of all cross deposit-type transfers performed under Treasury approved enablement.</p>
                  </div>
                </div>
              </div>

              <div className="xdt-card-body">
                <div className="table-responsive">
                  <table className="xdt-table">
                    <thead>
                      <tr>
                        <th>Txn ID</th>
                        <th>Request Ref</th>
                        <th>Source Account</th>
                        <th>Target Account</th>
                        <th>Amount (₹)</th>
                        <th>Executed By</th>
                        <th>Timestamp</th>
                        <th>Remaining After</th>
                      </tr>
                    </thead>
                    <tbody>
                      {executionLogs.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-tertiary)' }}>
                            No executed transfers logged yet.
                          </td>
                        </tr>
                      ) : (
                        executionLogs.map((log) => (
                          <tr key={log.id}>
                            <td><strong>{log.id}</strong></td>
                            <td><code style={{ fontSize: '11px', background: '#EEF2FF', color: '#4338CA', padding: '2px 6px', borderRadius: '4px' }}>{log.requestId}</code></td>
                            <td>{log.sourceAccount}</td>
                            <td>{log.targetAccount}</td>
                            <td><strong style={{ color: 'var(--color-success)' }}>₹{log.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
                            <td>{log.executedBy}</td>
                            <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{log.timestamp}</td>
                            <td>
                              <span className="badge" style={{ background: log.remainingAfter === 0 ? '#FEF2F2' : '#ECFDF5', color: log.remainingAfter === 0 ? '#B91C1C' : '#047857' }}>
                                {log.remainingAfter} Remaining
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: TREASURY APPROVAL & REJECTION DECISION MODAL                       */}
        {/* ========================================================================= */}
        {selectedRequestForReview && (
          <div className="modal-backdrop">
            <div className="modal-content-card">
              <div className="modal-header">
                <h3>
                  Review & Approve Enablement Request #{selectedRequestForReview.id}
                </h3>
                <button type="button" className="close-btn" onClick={() => setSelectedRequestForReview(null)}>
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body">
                {/* Operator Details Summary Box */}
                <div className="operator-info-bar">
                  <div className="info-item">
                    <span className="info-item-label">Operator Name</span>
                    <span className="info-item-value">{selectedRequestForReview.operatorName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-item-label">DDO Code</span>
                    <span className="info-item-value">{selectedRequestForReview.ddoCode}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-item-label">Treasury Office</span>
                    <span className="info-item-value">{selectedRequestForReview.treasuryOffice}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-item-label">Requested Txn Limit</span>
                    <span className="info-item-value" style={{ color: 'var(--color-primary)', fontWeight: 800 }}>
                      {selectedRequestForReview.requestedTransactions} Transactions
                    </span>
                  </div>
                </div>

                {/* Transfer Route Highlight */}
                <div className="deposit-transfer-visual-box">
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', color: '#4F46E5', fontWeight: 700, textTransform: 'uppercase' }}>Source Deposit</span>
                    <strong style={{ fontSize: 'var(--font-size-md)' }}>{getDepositLabel(selectedRequestForReview.sourceDepositType)}</strong>
                  </div>
                  <ArrowRight size={20} style={{ color: '#4338CA' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700, textTransform: 'uppercase' }}>Target Deposit</span>
                    <strong style={{ fontSize: 'var(--font-size-md)' }}>{getDepositLabel(selectedRequestForReview.targetDepositType)}</strong>
                  </div>
                </div>

                {/* Justification & Authority Order */}
                <div style={{ background: '#F8FAFC', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    PURPOSE / JUSTIFICATION SUBMITTED:
                  </div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                    "{selectedRequestForReview.purpose}"
                  </p>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    Authority Order Reference: <code style={{ background: '#EEF2FF', color: '#4338CA', padding: '2px 6px', borderRadius: '4px' }}>{selectedRequestForReview.authorityRef}</code>
                  </div>
                </div>

                {/* Treasury Validation Checklist */}
                {selectedRequestForReview.status === 'PENDING' && (
                  <div className="validation-checklist-box">
                    <span className="validation-checklist-title">
                      Mandatory Approver Validation Checklist
                    </span>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={checklistValidations.justificationVerified}
                        onChange={(e) => setChecklistValidations({ ...checklistValidations, justificationVerified: e.target.checked })}
                      />
                      <span>Validate Justification & Sanction Order against Treasury Rules</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={checklistValidations.depositTypesCompatible}
                        onChange={(e) => setChecklistValidations({ ...checklistValidations, depositTypesCompatible: e.target.checked })}
                      />
                      <span>Verify Source & Target Deposit Heads compatibility and account balances</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={checklistValidations.transactionCountPermitted}
                        onChange={(e) => setChecklistValidations({ ...checklistValidations, transactionCountPermitted: e.target.checked })}
                      />
                      <span>Confirm requested transaction limit ({selectedRequestForReview.requestedTransactions}) is within authorized delegation limit</span>
                    </label>
                  </div>
                )}

                {/* Decision Controls Panel (Only if Pending) */}
                {selectedRequestForReview.status === 'PENDING' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', paddingTop: 'var(--space-2)' }}>

                    {/* Approved Transaction Count Adjustment */}
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label">Approved Transactions Count</label>
                        <input
                          type="number"
                          className="form-input"
                          min={1}
                          max={50}
                          value={approvedCountInput}
                          onChange={(e) => setApprovedCountInput(parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Approval Remarks</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Verified and approved per GO #894"
                          value={approvalRemarksInput}
                          onChange={(e) => setApprovalRemarksInput(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Rejection Details */}
                    <div className="form-grid-2" style={{ background: '#FEF2F2', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid #FCA5A5' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ color: '#B91C1C' }}>Rejection Reason (If Rejecting)</label>
                        <select
                          className="form-select"
                          value={rejectionReasonInput}
                          onChange={(e) => setRejectionReasonInput(e.target.value)}
                        >
                          <option value="Inadequate Justification">Inadequate Justification</option>
                          <option value="Incompatible Deposit Heads">Incompatible Deposit Heads</option>
                          <option value="Exceeds Permissible Limit">Exceeds Permissible Limit</option>
                          <option value="Missing Government Sanction Order">Missing Government Sanction Order</option>
                          <option value="Other">Other Reason</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ color: '#B91C1C' }}>Rejection Remarks</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Enter reason for rejecting request..."
                          value={rejectionRemarksInput}
                          onChange={(e) => setRejectionRemarksInput(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Modal Decision Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
                      <button type="button" className="btn-danger" onClick={handleRejectRequest}>
                        <XCircle size={14} /> Reject & Close Request
                      </button>
                      <button type="button" className="btn-success" onClick={handleApproveRequest}>
                        <CheckCircle2 size={14} /> Approve & Enable Transfer Screen
                      </button>
                    </div>

                  </div>
                ) : (
                  /* Readonly decision details for already reviewed requests */
                  <div style={{ background: '#F8FAFC', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
                    <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>
                      Decision Details: {selectedRequestForReview.status}
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      Reviewed By: <strong>{selectedRequestForReview.reviewedBy}</strong> on {selectedRequestForReview.reviewedDate}
                    </p>
                    {selectedRequestForReview.approvalRemarks && (
                      <p style={{ fontSize: '13px', color: 'var(--color-success)', marginTop: '4px' }}>
                        Remarks: {selectedRequestForReview.approvalRemarks}
                      </p>
                    )}
                    {selectedRequestForReview.rejectionRemarks && (
                      <p style={{ fontSize: '13px', color: 'var(--color-error)', marginTop: '4px' }}>
                        Rejection Reason: <strong>{selectedRequestForReview.rejectionReason}</strong> - {selectedRequestForReview.rejectionRemarks}
                      </p>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

      </div>
    </CommentLayer>
  );
}
