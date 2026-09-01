import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Send,
  Plus,
  Trash2,
  UserCheck,
  ShieldCheck,
  History,
  Bell,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronRight,
  CheckSquare,
  Layers,
  Info
} from 'lucide-react';
import CommentLayer from '../../components/feedback/CommentLayer';
import './HoAAdditionRequestScreen.css';

// --- Interfaces ---
export type Role = 'DDO' | 'PD_OPERATOR' | 'HOAD' | 'FD';

export type RequestStatus =
  | 'PENDING_PD_OPERATOR'
  | 'PENDING_HOAD'
  | 'PENDING_FD'
  | 'APPROVED'
  | 'RETURNED_TO_DDO'
  | 'REJECTED';

export interface ExistingHoA {
  hoaCode: string;
  schemeName: string;
  mappedDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface PDAccountDetails {
  accountNo: string;
  accountName: string;
  treasuryCode: string;
  treasuryName: string;
  deptCode: string;
  deptName: string;
  ddoCode: string;
  ddoName: string;
  operatorCode: string;
  purposeCode: string;
  operatorName: string;
  expenditurePattern: string;
  fundSource: 'Consolidated Fund' | 'Both' | 'Other than Consolidated Fund';
  status: 'ACTIVE' | 'INACTIVE';
  existingHoAs: ExistingHoA[];
}

export interface ProposedHoAItem {
  id: string;
  majorHead: string;
  subMajorHead: string;
  minorHead: string;
  subHead: string;
  detailHead: string;
  ddoCode: string;
  fullHoA: string;
  schemeDescription: string;
  isValid: boolean;
  validationMsg?: string;
}

export interface MappedHoARow {
  id: string;
  fromHoA: string;
  receiptHoA: string;
}

export interface AuditTrailEntry {
  id: string;
  timestamp: string;
  userRole: string;
  userName: string;
  action: string;
  remarks: string;
}

export interface HoARequest {
  id: string;
  pdAccountNo: string;
  treasuryCode: string;
  treasuryName: string;
  deptCode: string;
  deptName: string;
  ddoCode: string;
  ddoName: string;
  operatorCode: string;
  purposeCode: string;
  operatorName: string;
  expenditurePattern: string;
  fundSource: string;
  proposedHoAs: ProposedHoAItem[];
  objective: string;
  status: RequestStatus;
  currentRole: Role;
  submittedBy: string;
  submittedDate: string;
  approvalDate?: string;
  approvingAuthority?: string;
  auditTrail: AuditTrailEntry[];
}

// --- Mock Data ---
const MOCK_TREASURIES = [
  { code: '500', name: 'Singrauli District Treasury' },
  { code: '501', name: 'Bhopal Main Treasury' },
  { code: '502', name: 'Indore District Treasury' },
  { code: '503', name: 'Gwalior District Treasury' },
  { code: '504', name: 'Jabalpur District Treasury' },
];

const MOCK_PD_ACCOUNTS: Record<string, PDAccountDetails> = {
  'PD-8443-106-5001': {
    accountNo: 'PD-8443-106-5001',
    accountName: 'District Agriculture Development PD Fund',
    treasuryCode: '500',
    treasuryName: 'Singrauli District Treasury',
    deptCode: '5000405001',
    deptName: 'Agriculture & Farmers Welfare Dept',
    ddoCode: 'DDO-500040',
    ddoName: 'District Agriculture Officer, Singrauli',
    operatorCode: 'OP-8443-1',
    purposeCode: '1001',
    operatorName: 'Shri A. K. Sharma (Senior Civil Assistant)',
    expenditurePattern: 'TOTAL_AMOUNT',
    fundSource: 'Consolidated Fund',
    status: 'ACTIVE',
    existingHoAs: [
      { hoaCode: '8443-00-106-0001', schemeName: 'National Food Security Mission', mappedDate: '15-Jan-2024', status: 'ACTIVE' },
      { hoaCode: '8443-00-106-0002', schemeName: 'Rashtriya Krishi Vikas Yojana', mappedDate: '10-Mar-2024', status: 'ACTIVE' },
    ],
  },
  'PD-8443-106-5002': {
    accountNo: 'PD-8443-106-5002',
    accountName: 'Public Works Infrastructure PD Fund',
    treasuryCode: '500',
    treasuryName: 'Singrauli District Treasury',
    deptCode: '4000302005',
    deptName: 'Public Works Department (PWD)',
    ddoCode: 'DDO-400030',
    ddoName: 'Executive Engineer, PWD Singrauli',
    operatorCode: 'OP-8443-2',
    purposeCode: '2004',
    operatorName: 'Shri R. P. Verma (Executive Assistant)',
    expenditurePattern: 'TOTAL_AMOUNT',
    fundSource: 'Both',
    status: 'ACTIVE',
    existingHoAs: [
      { hoaCode: '8443-00-106-0010', schemeName: 'State Highway Development', mappedDate: '01-Feb-2025', status: 'ACTIVE' },
    ],
  },
  'PD-8443-106-5003': {
    accountNo: 'PD-8443-106-5003',
    accountName: 'State Wildlife Conservation Deposit',
    treasuryCode: '500',
    treasuryName: 'Singrauli District Treasury',
    deptCode: '3000201002',
    deptName: 'Forest & Wildlife Department',
    ddoCode: 'DDO-300020',
    ddoName: 'Divisional Forest Officer, Wildlife Division',
    operatorCode: 'OP-8443-3',
    purposeCode: '3001',
    operatorName: 'Smt. Meena Gupta (Forest Accounts Officer)',
    expenditurePattern: 'SCHEME_WISE',
    fundSource: 'Other than Consolidated Fund',
    status: 'ACTIVE',
    existingHoAs: [
      { hoaCode: '8443-00-106-0015', schemeName: 'Tiger Protection Fund', mappedDate: '20-May-2024', status: 'ACTIVE' },
    ],
  },
  'PD-8443-106-5004': {
    accountNo: 'PD-8443-106-5004',
    accountName: 'Legacy Urban Infrastructure Fund',
    treasuryCode: '500',
    treasuryName: 'Singrauli District Treasury',
    deptCode: '6000508001',
    deptName: 'Urban Development Dept',
    ddoCode: 'DDO-600050',
    ddoName: 'Chief Municipal Officer, Singrauli',
    operatorCode: 'OP-8443-4',
    purposeCode: '4002',
    operatorName: 'Shri S. K. Tiwari (Urban Development Asst)',
    expenditurePattern: 'TOTAL_AMOUNT',
    fundSource: 'Consolidated Fund',
    status: 'INACTIVE',
    existingHoAs: [
      { hoaCode: '8443-00-106-0020', schemeName: 'Old Water Pipeline Project', mappedDate: '10-Nov-2022', status: 'INACTIVE' },
    ],
  },
};

const INITIAL_REQUESTS: HoARequest[] = [
  {
    id: 'REQ-HOA-2026-001',
    pdAccountNo: 'PD-8443-106-5001',
    treasuryCode: '500',
    treasuryName: 'Singrauli District Treasury',
    deptCode: '5000405001',
    deptName: 'Agriculture & Farmers Welfare Dept',
    ddoCode: 'DDO-500040',
    ddoName: 'District Agriculture Officer, Singrauli',
    operatorCode: 'OP-8443-1',
    purposeCode: '1001',
    operatorName: 'Shri A. K. Sharma (Senior Civil Assistant)',
    expenditurePattern: 'TOTAL_AMOUNT',
    fundSource: 'Consolidated Fund',
    proposedHoAs: [
      {
        id: 'p1',
        majorHead: '8443',
        subMajorHead: '00',
        minorHead: '106',
        subHead: '0003',
        detailHead: '01',
        ddoCode: '50004',
        fullHoA: '8443-00-106-0003-01-50004',
        schemeDescription: 'Soil Health Card & Crop Protection Scheme',
        isValid: true,
      },
    ],
    objective: 'To enable budget transfers from the new Soil Health Card Grant line item directly into the active PD Account.',
    status: 'PENDING_PD_OPERATOR',
    currentRole: 'PD_OPERATOR',
    submittedBy: 'Shri R. K. Varma (DDO Agriculture)',
    submittedDate: '01-Sep-2026 09:30 AM',
    auditTrail: [
      {
        id: 'a1',
        timestamp: '01-Sep-2026 09:30 AM',
        userRole: 'DDO',
        userName: 'Shri R. K. Varma',
        action: 'Request Created & Submitted',
        remarks: 'Initial submission of HoA addition request for Soil Health Card Grant.',
      },
    ],
  },
  {
    id: 'REQ-HOA-2026-002',
    pdAccountNo: 'PD-8443-106-5002',
    treasuryCode: '500',
    treasuryName: 'Singrauli District Treasury',
    deptCode: '4000302005',
    deptName: 'Public Works Department (PWD)',
    ddoCode: 'DDO-400030',
    ddoName: 'Executive Engineer, PWD Singrauli',
    operatorCode: 'OP-8443-2',
    purposeCode: '2004',
    operatorName: 'Shri R. P. Verma (Executive Assistant)',
    expenditurePattern: 'TOTAL_AMOUNT',
    fundSource: 'Both',
    proposedHoAs: [
      {
        id: 'p2',
        majorHead: '8443',
        subMajorHead: '00',
        minorHead: '106',
        subHead: '0012',
        detailHead: '02',
        ddoCode: '40003',
        fullHoA: '8443-00-106-0012-02-40003',
        schemeDescription: 'Central Road & Infrastructure Fund (CRIF)',
        isValid: true,
      },
    ],
    objective: 'Addition of CRIF Head to credit Central Grant allocations into PWD PD Account for Express Highways.',
    status: 'PENDING_HOAD',
    currentRole: 'HOAD',
    submittedBy: 'Shri A. K. Sharma (DDO PWD)',
    submittedDate: '31-Aug-2026 04:15 PM',
    auditTrail: [
      {
        id: 'a2_1',
        timestamp: '31-Aug-2026 04:15 PM',
        userRole: 'DDO',
        userName: 'Shri A. K. Sharma',
        action: 'Submitted Request',
        remarks: 'Proposed CRIF Head for highway expansion project.',
      },
      {
        id: 'a2_2',
        timestamp: '01-Sep-2026 10:00 AM',
        userRole: 'PD Operator',
        userName: 'Smt. Sunita Rao (PD Operator)',
        action: 'Verified & Forwarded to HoAD',
        remarks: 'PD Account active and fund source verified. Recommended for HoAD approval.',
      },
    ],
  },
];

export default function HoAAdditionRequestScreen() {
  // --- Global Active Role State ---
  const [activeRole, setActiveRole] = useState<Role>('DDO');

  // --- Requests Store State ---
  const [requestsList, setRequestsList] = useState<HoARequest[]>(INITIAL_REQUESTS);
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);

  // --- Form State (DDO View) ---
  const [selectedPDAccNo] = useState<string>('PD-8443-106-5001');
  const [selectedTreasuryCode, setSelectedTreasuryCode] = useState<string>('500');

  const [proposedHoAs] = useState<ProposedHoAItem[]>([
    {
      id: 'p-init-1',
      majorHead: '8443',
      subMajorHead: '00',
      minorHead: '106',
      subHead: '0005',
      detailHead: '01',
      ddoCode: '50004',
      fullHoA: '8443-00-106-0005-01-50004',
      schemeDescription: 'Organic Farming Promotion Scheme',
      isValid: true,
    },
  ]);
  const [objective, setObjective] = useState<string>(
    'Required for receiving state budgetary grants for organic farming initiative.'
  );

  // --- Select HoA Form State (Expenditure & Receipt) ---
  const [classOfExpenditure, setClassOfExpenditure] = useState<string>('Voted');
  const [demandNo, setDemandNo] = useState<string>('Demand 15');
  const [majorHeadExp, setMajorHeadExp] = useState<string>('8443');
  const [subMajorHeadExp, setSubMajorHeadExp] = useState<string>('00');
  const [minorHeadExp, setMinorHeadExp] = useState<string>('106');
  const [schemeCodeExp, setSchemeCodeExp] = useState<string>('0101');
  const [segmentHead, setSegmentHead] = useState<string>('01');
  const [projectCode, setProjectCode] = useState<string>('PRJ-AGRI-2026');
  const [objectHead, setObjectHead] = useState<string>('31');
  const [detailHeadExp, setDetailHeadExp] = useState<string>('01');

  // Receipt HoA State
  const [majorHeadRec, setMajorHeadRec] = useState<string>('0075');
  const [subMajorHeadRec, setSubMajorHeadRec] = useState<string>('00');
  const [minorHeadRec, setMinorHeadRec] = useState<string>('102');
  const [schemeCodeRec, setSchemeCodeRec] = useState<string>('SC002');

  // --- Mapped HoA Items List (Table State) ---
  const [mappedHoARows, setMappedHoARows] = useState<MappedHoARow[]>([
    {
      id: 'm1',
      fromHoA: '001-2013-00-102-9999-1922-00000000-17-018',
      receiptHoA: '0070-00-800-0000',
    },
  ]);

  const handleAddMappedRow = () => {
    const constructedFromHoA = `001-2013-${subMajorHeadExp || '00'}-${minorHeadExp || '102'}-9999-${schemeCodeExp || '1922'}-00000000-${objectHead || '17'}-${detailHeadExp || '018'}`;
    const constructedReceiptHoA = `${majorHeadRec || '0070'}-${subMajorHeadRec || '00'}-${minorHeadRec || '800'}-0000`;
    
    const newRow: MappedHoARow = {
      id: 'm-' + Date.now(),
      fromHoA: constructedFromHoA,
      receiptHoA: constructedReceiptHoA,
    };
    setMappedHoARows((prev) => [...prev, newRow]);
  };

  const handleRemoveMappedRow = (id: string) => {
    setMappedHoARows((prev) => prev.filter((r) => r.id !== id));
  };

  // --- Review Modal / Remarks State ---
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg] = useState<string | null>(null);

  // --- Selected Account Auto-Fetched Data ---
  const activePDDetails = MOCK_PD_ACCOUNTS[selectedPDAccNo] || null;

  // Selected Treasury Name based on Treasury Code dropdown selection
  const currentTreasuryObj = MOCK_TREASURIES.find((t) => t.code === selectedTreasuryCode);
  const currentTreasuryName = currentTreasuryObj ? currentTreasuryObj.name : activePDDetails?.treasuryName || '';

  // --- Pre-Condition Checks ---
  const isAccountActive = activePDDetails?.status === 'ACTIVE';
  const isFundSourceValid =
    activePDDetails?.fundSource === 'Consolidated Fund' || activePDDetails?.fundSource === 'Both';
  const canDDOSubmit = isAccountActive && isFundSourceValid && mappedHoARows.length > 0 && objective.trim().length > 10;

  const handleDDOSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canDDOSubmit) return;

    const newReqId = `REQ-HOA-2026-00${requestsList.length + 1}`;
    const newReq: HoARequest = {
      id: newReqId,
      pdAccountNo: activePDDetails.accountNo,
      treasuryCode: selectedTreasuryCode,
      treasuryName: currentTreasuryName,
      deptCode: activePDDetails.deptCode,
      deptName: activePDDetails.deptName,
      ddoCode: activePDDetails.ddoCode,
      ddoName: activePDDetails.ddoName,
      operatorCode: activePDDetails.operatorCode,
      purposeCode: activePDDetails.purposeCode,
      operatorName: activePDDetails.operatorName,
      expenditurePattern: activePDDetails.expenditurePattern,
      fundSource: activePDDetails.fundSource,
      proposedHoAs: [...proposedHoAs],
      objective: objective,
      status: 'PENDING_PD_OPERATOR',
      currentRole: 'PD_OPERATOR',
      submittedBy: 'Shri R. K. Varma (DDO Agriculture)',
      submittedDate: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
          userRole: 'DDO',
          userName: 'Shri R. K. Varma (DDO)',
          action: 'Request Created & Submitted',
          remarks: objective,
        },
      ],
    };

    setRequestsList([newReq, ...requestsList]);
    setActionSuccessMsg(`Request ${newReqId} created successfully! Routed to PD Operator.`);
    setMappedHoARows([]);
    setObjective('');
    setTimeout(() => setActionSuccessMsg(null), 6000);
  };

  // --- Handlers for Workflow Actions (PD Operator, HoAD, FD) ---
  const handleWorkflowAction = (
    reqId: string,
    actionType: 'FORWARD' | 'RETURN' | 'REJECT' | 'APPROVE'
  ) => {
    if ((actionType === 'RETURN' || actionType === 'REJECT') && !reviewRemarks.trim()) {
      alert('Please enter mandatory remarks before Returning or Rejecting a request.');
      return;
    }

    const updated = requestsList.map((req) => {
      if (req.id !== reqId) return req;

      let nextStatus: RequestStatus = req.status;
      let nextRole: Role = req.currentRole;
      let actionText = '';
      const nowStr = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

      if (activeRole === 'PD_OPERATOR') {
        if (actionType === 'FORWARD') {
          nextStatus = 'PENDING_HOAD';
          nextRole = 'HOAD';
          actionText = 'Forwarded to HoAD';
        } else if (actionType === 'RETURN') {
          nextStatus = 'RETURNED_TO_DDO';
          nextRole = 'DDO';
          actionText = 'Returned to DDO';
        } else if (actionType === 'REJECT') {
          nextStatus = 'REJECTED';
          actionText = 'Rejected by PD Operator';
        }
      } else if (activeRole === 'HOAD') {
        if (actionType === 'FORWARD') {
          nextStatus = 'PENDING_FD';
          nextRole = 'FD';
          actionText = 'Forwarded to FD for Approval';
        } else if (actionType === 'RETURN') {
          nextStatus = 'RETURNED_TO_DDO';
          nextRole = 'DDO';
          actionText = 'Returned to DDO';
        } else if (actionType === 'REJECT') {
          nextStatus = 'REJECTED';
          actionText = 'Rejected by HoAD';
        }
      } else if (activeRole === 'FD') {
        if (actionType === 'APPROVE') {
          nextStatus = 'APPROVED';
          actionText = 'Approved & HoA Mapped';
          // System maps approved HoAs to PD Account
          const pdAcc = MOCK_PD_ACCOUNTS[req.pdAccountNo];
          if (pdAcc) {
            req.proposedHoAs.forEach((pho) => {
              const exists = pdAcc.existingHoAs.some((e) => e.hoaCode === pho.fullHoA);
              if (!exists) {
                pdAcc.existingHoAs.push({
                  hoaCode: pho.fullHoA,
                  schemeName: pho.schemeDescription,
                  mappedDate: nowStr.split(' ')[0],
                  status: 'ACTIVE',
                });
              }
            });
          }
        } else if (actionType === 'RETURN') {
          nextStatus = 'RETURNED_TO_DDO';
          nextRole = 'DDO';
          actionText = 'Returned to DDO by FD';
        } else if (actionType === 'REJECT') {
          nextStatus = 'REJECTED';
          actionText = 'Rejected by Finance Dept (FD)';
        }
      }

      const newAudit: AuditTrailEntry = {
        id: `aud-${Date.now()}`,
        timestamp: nowStr,
        userRole: activeRole,
        userName:
          activeRole === 'PD_OPERATOR'
            ? 'Smt. Sunita Rao (PD Operator)'
            : activeRole === 'HOAD'
              ? 'Shri V. K. Mehta (HoAD)'
              : activeRole === 'FD'
                ? 'Shri P. N. Saxena (Joint Secy, FD)'
                : 'DDO',
        action: actionText,
        remarks: reviewRemarks || 'Action processed as per rule guidelines.',
      };

      return {
        ...req,
        status: nextStatus,
        currentRole: nextRole,
        approvalDate: actionType === 'APPROVE' ? nowStr : req.approvalDate,
        approvingAuthority: actionType === 'APPROVE' ? 'Finance Department (FD)' : req.approvingAuthority,
        auditTrail: [newAudit, ...req.auditTrail],
      };
    });

    setRequestsList(updated);
    setReviewRemarks('');
    setSelectedReqId(null);
    setActionSuccessMsg(`Request ${reqId} successfully updated! Status changed.`);
    setTimeout(() => setActionSuccessMsg(null), 5000);
  };

  // Filter requests pending for the active role
  const pendingForRole = requestsList.filter((r) => {
    if (activeRole === 'DDO') return r.status === 'RETURNED_TO_DDO' || r.status === 'APPROVED';
    if (activeRole === 'PD_OPERATOR') return r.status === 'PENDING_PD_OPERATOR';
    if (activeRole === 'HOAD') return r.status === 'PENDING_HOAD';
    if (activeRole === 'FD') return r.status === 'PENDING_FD';
    return false;
  });

  const selectedRequest = requestsList.find((r) => r.id === selectedReqId) || null;

  return (
    <CommentLayer screenId="sprint6-story1-hoa-addition" moduleName="deposit">
      <div className="hoa-screen">
        {/* --- Header Section --- */}
        <div className="hoa-header">
          <div className="hoa-header-title">
            <div className="hoa-header-tag">
              <Sparkles size={13} />
              <span>Sprint 6 • User Story 1</span>
            </div>
            <h1>Request Addition of Head of Account (HoA) to PD Account</h1>
          </div>

          <div className="hoa-role-switcher-card">
            <span className="hoa-role-label">Active Workflow Role:</span>
            <div className="hoa-role-pills">
              <button
                className={`hoa-role-btn ${activeRole === 'DDO' ? 'active' : ''}`}
                onClick={() => {
                  setActiveRole('DDO');
                  setSelectedReqId(null);
                }}
              >
                <UserCheck size={14} /> DDO (Initiator)
              </button>
              <button
                className={`hoa-role-btn ${activeRole === 'PD_OPERATOR' ? 'active' : ''}`}
                onClick={() => {
                  setActiveRole('PD_OPERATOR');
                  setSelectedReqId(null);
                }}
              >
                <ShieldCheck size={14} /> PD Operator
                {requestsList.filter((r) => r.status === 'PENDING_PD_OPERATOR').length > 0 && (
                  <span className="hoa-badge-count">
                    {requestsList.filter((r) => r.status === 'PENDING_PD_OPERATOR').length}
                  </span>
                )}
              </button>
              <button
                className={`hoa-role-btn ${activeRole === 'HOAD' ? 'active' : ''}`}
                onClick={() => {
                  setActiveRole('HOAD');
                  setSelectedReqId(null);
                }}
              >
                <Building2 size={14} /> HoAD
                {requestsList.filter((r) => r.status === 'PENDING_HOAD').length > 0 && (
                  <span className="hoa-badge-count">
                    {requestsList.filter((r) => r.status === 'PENDING_HOAD').length}
                  </span>
                )}
              </button>
              <button
                className={`hoa-role-btn ${activeRole === 'FD' ? 'active' : ''}`}
                onClick={() => {
                  setActiveRole('FD');
                  setSelectedReqId(null);
                }}
              >
                <CheckSquare size={14} /> FD (Approver)
                {requestsList.filter((r) => r.status === 'PENDING_FD').length > 0 && (
                  <span className="hoa-badge-count font-alert">
                    {requestsList.filter((r) => r.status === 'PENDING_FD').length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* --- Process Flow Stepper Diagram --- */}
        <div className="hoa-stepper-card card">
          <div className="hoa-stepper-title">
            <Layers size={16} /> Process Flow Architecture
          </div>
          <div className="hoa-stepper-track">
            <div className={`hoa-step ${activeRole === 'DDO' ? 'active-step' : 'completed-step'}`}>
              <div className="hoa-step-num">1</div>
              <div className="hoa-step-info">
                <strong>DDO Step</strong>
                <span>Raise Request</span>
              </div>
            </div>
            <ChevronRight className="hoa-step-arrow" size={16} />
            <div className={`hoa-step ${activeRole === 'PD_OPERATOR' ? 'active-step' : ''}`}>
              <div className="hoa-step-num">2</div>
              <div className="hoa-step-info">
                <strong>PD Operator</strong>
                <span>Verification</span>
              </div>
            </div>
            <ChevronRight className="hoa-step-arrow" size={16} />
            <div className={`hoa-step ${activeRole === 'HOAD' ? 'active-step' : ''}`}>
              <div className="hoa-step-num">3</div>
              <div className="hoa-step-info">
                <strong>HoAD Level</strong>
                <span>Department Review</span>
              </div>
            </div>
            <ChevronRight className="hoa-step-arrow" size={16} />
            <div className={`hoa-step ${activeRole === 'FD' ? 'active-step' : ''}`}>
              <div className="hoa-step-num">4</div>
              <div className="hoa-step-info">
                <strong>Finance Dept (FD)</strong>
                <span>Approval & Mapping</span>
              </div>
            </div>
          </div>
        </div>

        {/* Banners / Toast Notifications */}
        {actionSuccessMsg && (
          <div className="hoa-toast success-toast">
            <CheckCircle2 size={18} />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {actionErrorMsg && (
          <div className="hoa-toast error-toast">
            <XCircle size={18} />
            <span>{actionErrorMsg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: DDO ROLE — RAISE REQUEST FORM & AUTO-FETCH DETAILS               */}
        {/* ========================================================================= */}
        {activeRole === 'DDO' && (
          <div className="hoa-main-layout">
            <form onSubmit={handleDDOSubmitRequest} className="hoa-form-container">
              {/* --- SECTION 1: TARGET PD ACCOUNT & AUTO-FETCHED DETAILS --- */}
              <div className="hoa-card">
                <div className="hoa-card-header">
                  <span>Select PD Account </span>

                </div>

                <div className="hoa-card-body">
                  {/* Specified Field Order:
                      1. Treasury Code (Drop Down)
                      2. Treasury Name
                      3. Department Code
                      4. Department Name
                      5. DDO Code
                      6. DDO Name
                      7. Operator Code
                      8. Purpose Code
                      9. Operator Name
                      10. Expenditure Pattern
                  */}
                  <div className="hoa-grid-3">
                    {/* 1. Treasury Code (Drop Down) */}
                    <div className="hoa-field">
                      <label className="hoa-label">
                        Treasury Code <span className="req">*</span>
                      </label>
                      <select
                        className="hoa-select"
                        value={selectedTreasuryCode}
                        onChange={(e) => setSelectedTreasuryCode(e.target.value)}
                      >
                        {MOCK_TREASURIES.map((t) => (
                          <option key={t.code} value={t.code}>
                            {t.code} - {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Treasury Name */}
                    <div className="hoa-field">
                      <label className="hoa-label">Treasury Name</label>
                      <input
                        type="text"
                        className="hoa-input read-only"
                        value={currentTreasuryName}
                        readOnly
                        placeholder="Fetched Data"
                      />
                    </div>

                    {/* 3. Department Code */}
                    <div className="hoa-field">
                      <label className="hoa-label">Department Code</label>
                      <input
                        type="text"
                        className="hoa-input read-only"
                        value={activePDDetails?.deptCode || ''}
                        readOnly
                        placeholder="Fetched Data"
                      />
                    </div>

                    {/* 4. Department Name */}
                    <div className="hoa-field">
                      <label className="hoa-label">Department Name</label>
                      <input
                        type="text"
                        className="hoa-input read-only"
                        value={activePDDetails?.deptName || ''}
                        readOnly
                        placeholder="Fetched Data"
                      />
                    </div>

                    {/* 5. DDO Code */}
                    <div className="hoa-field">
                      <label className="hoa-label">DDO Code</label>
                      <input
                        type="text"
                        className="hoa-input read-only"
                        value={activePDDetails?.ddoCode || ''}
                        readOnly
                        placeholder="Fetched Data"
                      />
                    </div>

                    {/* 6. DDO Name */}
                    <div className="hoa-field">
                      <label className="hoa-label">DDO Name</label>
                      <input
                        type="text"
                        className="hoa-input read-only"
                        value={activePDDetails?.ddoName || ''}
                        readOnly
                        placeholder="Fetched Data"
                      />
                    </div>

                    {/* 7. Operator Code */}
                    <div className="hoa-field">
                      <label className="hoa-label">Operator Code</label>
                      <input
                        type="text"
                        className="hoa-input read-only"
                        value={activePDDetails?.operatorCode || ''}
                        readOnly
                        placeholder="Fetched Data"
                      />
                    </div>

                    {/* 8. Purpose Code */}
                    <div className="hoa-field">
                      <label className="hoa-label">Purpose Code</label>
                      <input
                        type="text"
                        className="hoa-input read-only"
                        value={activePDDetails?.purposeCode || ''}
                        readOnly
                        placeholder="Fetched Data"
                      />
                    </div>

                    {/* 9. Operator Name */}
                    <div className="hoa-field">
                      <label className="hoa-label">Operator Name</label>
                      <input
                        type="text"
                        className="hoa-input read-only"
                        value={activePDDetails?.operatorName || ''}
                        readOnly
                        placeholder="Fetched Data"
                      />
                    </div>

                    {/* 10. Expenditure Pattern */}
                    <div className="hoa-field">
                      <label className="hoa-label">Expenditure Pattern</label>
                      <input
                        type="text"
                        className="hoa-input read-only"
                        value={activePDDetails?.expenditurePattern || ''}
                        readOnly
                        placeholder="Fetched Data"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* --- SECTION 2: SELECT HoA --- */}
              <div className="hoa-card">
                <div className="hoa-card-header">
                  <span>Expenditure and Receipt HoA Mapping</span>
                </div>

                <div className="hoa-card-body">
                  {/* Expenditure HoA Fields (3-column grid) */}
                  <div className="hoa-grid-3">
                    {/* 1. Class of Expenditure */}
                    <div className="hoa-field">
                      <label className="hoa-label">
                        Class of Expenditure <span className="req">*</span>
                      </label>
                      <select
                        className="hoa-select"
                        value={classOfExpenditure}
                        onChange={(e) => setClassOfExpenditure(e.target.value)}
                      >
                        <option value="">Select Class</option>
                        <option value="Voted">Voted</option>
                        <option value="Charged">Charged</option>
                      </select>
                    </div>

                    {/* 2. Demand No */}
                    <div className="hoa-field">
                      <label className="hoa-label">
                        Demand No <span className="req">*</span>
                      </label>
                      <select
                        className="hoa-select"
                        value={demandNo}
                        onChange={(e) => setDemandNo(e.target.value)}
                      >
                        <option value="">Select Demand No</option>
                        <option value="Demand 15">Demand 15 - Agriculture Department</option>
                        <option value="Demand 22">Demand 22 - Public Works</option>
                        <option value="Demand 30">Demand 30 - Forest & Environment</option>
                      </select>
                    </div>

                    {/* 3. Major Head (Expenditure) */}
                    <div className="hoa-field">
                      <label className="hoa-label">
                        Major Head (Expenditure) <span className="req">*</span>
                      </label>
                      <select
                        className="hoa-select"
                        value={majorHeadExp}
                        onChange={(e) => setMajorHeadExp(e.target.value)}
                      >
                        <option value="">Select Major Head</option>
                        <option value="8443">8443 - Civil Deposits</option>
                        <option value="2070">2070 - Other Administrative Services</option>
                        <option value="2401">2401 - Crop Husbandry</option>
                      </select>
                    </div>

                    {/* 4. Sub Major Head (Expenditure) */}
                    <div className="hoa-field">
                      <label className="hoa-label">
                        Sub Major Head (Expenditure) <span className="req">*</span>
                      </label>
                      <select
                        className="hoa-select"
                        value={subMajorHeadExp}
                        onChange={(e) => setSubMajorHeadExp(e.target.value)}
                      >
                        <option value="">Select Sub Major Head</option>
                        <option value="00">00 - General</option>
                        <option value="01">01 - Crop Husbandry</option>
                      </select>
                    </div>

                    {/* 5. Minor Head (Expenditure) */}
                    <div className="hoa-field">
                      <label className="hoa-label">
                        Minor Head (Expenditure) <span className="req">*</span>
                      </label>
                      <select
                        className="hoa-select"
                        value={minorHeadExp}
                        onChange={(e) => setMinorHeadExp(e.target.value)}
                      >
                        <option value="">Select Minor Head</option>
                        <option value="106">106 - Personal Deposit Accounts</option>
                        <option value="104">104 - Agricultural Farms</option>
                      </select>
                    </div>

                    {/* 6. Scheme Code (Expenditure) */}
                    <div className="hoa-field">
                      <label className="hoa-label">
                        Scheme Code (Expenditure) <span className="req">*</span>
                      </label>
                      <select
                        className="hoa-select"
                        value={schemeCodeExp}
                        onChange={(e) => setSchemeCodeExp(e.target.value)}
                      >
                        <option value="">Select Scheme Code</option>
                        <option value="0101">0101 - State Crop Production Scheme</option>
                        <option value="0102">0102 - Soil Health Card Scheme</option>
                      </select>
                    </div>

                    {/* 7. Segment Head */}
                    <div className="hoa-field">
                      <label className="hoa-label">
                        Segment Head <span className="req">*</span>
                      </label>
                      <select
                        className="hoa-select"
                        value={segmentHead}
                        onChange={(e) => setSegmentHead(e.target.value)}
                      >
                        <option value="">Select Segment Head</option>
                        <option value="01">01 - State Development</option>
                        <option value="02">02 - Centrally Sponsored Scheme</option>
                      </select>
                    </div>

                    {/* 8. Project Code */}
                    <div className="hoa-field">
                      <label className="hoa-label">Project Code</label>
                      <select
                        className="hoa-select"
                        value={projectCode}
                        onChange={(e) => setProjectCode(e.target.value)}
                      >
                        <option value="">Select Project Code</option>
                        <option value="PRJ-AGRI-2026">PRJ-AGRI-2026</option>
                        <option value="PRJ-IRR-2026">PRJ-IRR-2026</option>
                      </select>
                    </div>

                    {/* 9. Object Head */}
                    <div className="hoa-field">
                      <label className="hoa-label">
                        Object Head <span className="req">*</span>
                      </label>
                      <select
                        className="hoa-select"
                        value={objectHead}
                        onChange={(e) => setObjectHead(e.target.value)}
                      >
                        <option value="">Select Object Head</option>
                        <option value="31">31 - Grants-in-Aid</option>
                        <option value="32">32 - Contributions</option>
                      </select>
                    </div>

                    {/* 10. Detail Head */}
                    <div className="hoa-field">
                      <label className="hoa-label">
                        Detail Head <span className="req">*</span>
                      </label>
                      <select
                        className="hoa-select"
                        value={detailHeadExp}
                        onChange={(e) => setDetailHeadExp(e.target.value)}
                      >
                        <option value="">Select Detail Head</option>
                        <option value="01">01 - Office Expenses</option>
                        <option value="02">02 - Wages</option>
                      </select>
                    </div>
                  </div>

                  {/* Receipt HoA Sub-Banner */}
                  <div className="receipt-hoa-banner">
                    <span>Receipt HoA</span>
                    <Info size={16} className="info-icon" />
                  </div>

                  {/* Receipt HoA Fields (3-column grid) */}
                  <div className="hoa-grid-3">
                    {/* Major Head (Receipt) */}
                    <div className="hoa-field">
                      <label className="hoa-label">
                        Major Head (Receipt) <span className="req">*</span>
                      </label>
                      <select
                        className="hoa-select"
                        value={majorHeadRec}
                        onChange={(e) => setMajorHeadRec(e.target.value)}
                      >
                        <option value="0075">0075</option>
                        <option value="0070">0070</option>
                        <option value="0059">0059</option>
                      </select>
                    </div>

                    {/* Sub Major Head (Receipt) */}
                    <div className="hoa-field">
                      <label className="hoa-label">
                        Sub Major Head (Receipt) <span className="req">*</span>
                      </label>
                      <select
                        className="hoa-select"
                        value={subMajorHeadRec}
                        onChange={(e) => setSubMajorHeadRec(e.target.value)}
                      >
                        <option value="00">00</option>
                        <option value="01">01</option>
                      </select>
                    </div>

                    {/* Minor Head (Receipt) */}
                    <div className="hoa-field">
                      <label className="hoa-label">
                        Minor Head (Receipt) <span className="req">*</span>
                      </label>
                      <select
                        className="hoa-select"
                        value={minorHeadRec}
                        onChange={(e) => setMinorHeadRec(e.target.value)}
                      >
                        <option value="102">102</option>
                        <option value="101">101</option>
                      </select>
                    </div>

                    {/* Scheme Code (Receipt) */}
                    <div className="hoa-field">
                      <label className="hoa-label">
                        Scheme Code (Receipt) <span className="req">*</span>
                      </label>
                      <select
                        className="hoa-select"
                        value={schemeCodeRec}
                        onChange={(e) => setSchemeCodeRec(e.target.value)}
                      >
                        <option value="SC002">SC002</option>
                        <option value="SC001">SC001</option>
                      </select>
                    </div>
                  </div>

                  {/* + Add Button */}
                  <div>
                    <button
                      type="button"
                      className="hoa-btn-add-outline"
                      onClick={handleAddMappedRow}
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>

                  {/* Mapped HoAs Table */}
                  <div className="hoa-mapping-table-wrapper">
                    <table className="hoa-mapping-table">
                      <thead>
                        <tr>
                          <th style={{ width: '80px' }}>Sr.No.</th>
                          <th>From HoA</th>
                          <th>Receipt HoA</th>
                          <th style={{ width: '120px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mappedHoARows.length > 0 ? (
                          mappedHoARows.map((row, index) => (
                            <tr key={row.id}>
                              <td>{index + 1}</td>
                              <td>{row.fromHoA}</td>
                              <td>{row.receiptHoA}</td>
                              <td>
                                <button
                                  type="button"
                                  className="hoa-action-delete-btn"
                                  onClick={() => handleRemoveMappedRow(row.id)}
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} style={{ padding: '20px', color: '#6B7280' }}>
                              No HoAs mapped yet. Click "+ Add" above to map selected HoAs.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Objective Textarea */}
                  <div className="hoa-field" style={{ marginTop: '20px' }}>
                    <label className="hoa-label">
                      Objective of adding the new HoA to PD Account <span className="req">*</span>
                    </label>
                    <textarea
                      className="hoa-textarea"
                      rows={3}
                      placeholder="Write the detailed objective, scheme justification, and fund transfer necessity for adding this HoA..."
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Action Container */}
              {!isFundSourceValid && (
                <div className="hoa-error-banner">
                  <AlertCircle size={18} />
                  <div>
                    <strong>Rule Constraint Violation:</strong> HoA addition requests are ONLY permitted for PD Accounts with Consolidated Fund or Both fund sources. Selected account fund source is "{activePDDetails?.fundSource}".
                  </div>
                </div>
              )}

              {!isAccountActive && (
                <div className="hoa-error-banner">
                  <AlertCircle size={18} />
                  <div>
                    <strong>Account Status Violation:</strong> Selected PD Account is INACTIVE. Requests can only be submitted for ACTIVE PD Accounts.
                  </div>
                </div>
              )}

              <div className="hoa-form-actions">
                <button
                  type="submit"
                  className="hoa-btn hoa-btn-primary"
                  disabled={!canDDOSubmit}
                >
                  <Send size={16} /> Submit HoA Addition Request
                </button>
              </div>
            </form>

            {/* Bottom Requests Panel: Submitted or Returned Requests for DDO */}
            <div className="hoa-card">
              <div className="hoa-card-header">
                <span>MY REQUESTS</span>
                <div className="hoa-card-header-sub">
                  <History size={15} /> Submitted & Returned Requests
                </div>
              </div>
              <div className="hoa-card-body">
                {requestsList.length === 0 ? (
                  <div className="hoa-empty-msg">No requests submitted yet.</div>
                ) : (
                  <div className="hoa-bottom-requests-grid">
                    {requestsList.map((req) => (
                      <div
                        key={req.id}
                        className={`hoa-side-item ${req.status === 'RETURNED_TO_DDO' ? 'item-returned' : ''}`}
                      >
                        <div className="hoa-side-item-head">
                          <strong>{req.id}</strong>
                          <span
                            className={`hoa-status-tag ${
                              req.status === 'APPROVED'
                                ? 'st-approved'
                                : req.status === 'RETURNED_TO_DDO'
                                  ? 'st-returned'
                                  : req.status === 'REJECTED'
                                    ? 'st-rejected'
                                    : 'st-pending'
                            }`}
                          >
                            {req.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="hoa-side-item-body">
                          <div>Acc: {req.pdAccountNo}</div>
                          <div>HoA: {req.proposedHoAs.map((p) => p.fullHoA).join(', ')}</div>
                          <div className="side-date">{req.submittedDate}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: VERIFICATION & APPROVAL ROLES (PD OPERATOR, HOAD, FD)             */}
        {/* ========================================================================= */}
        {activeRole !== 'DDO' && (
          <div className="hoa-workflow-container">
            <div className="hoa-role-banner">
              <div className="hoa-role-banner-info">
                <ShieldCheck size={20} />
                <div>
                  <h3>
                    {activeRole === 'PD_OPERATOR'
                      ? 'PD Operator Verification Dashboard'
                      : activeRole === 'HOAD'
                        ? 'HoAD (Head of Account Dept) Approval Dashboard'
                        : 'Finance Department (FD) Final Approval Dashboard'}
                  </h3>
                  <p>
                    Review incoming HoA addition requests, verify pre-conditions, and perform action (Forward, Return to DDO, Approve, or Reject).
                  </p>
                </div>
              </div>
            </div>

            <div className="hoa-workflow-grid">
              {/* Left Column: Pending List */}
              <div className="hoa-card">
                <div className="hoa-card-header">
                  <span>PENDING QUEUE</span>
                  <div className="hoa-card-header-sub">
                    <Bell size={15} /> Requests Pending Action ({pendingForRole.length})
                  </div>
                </div>

                <div className="hoa-card-body" style={{ padding: '12px' }}>
                  {pendingForRole.length === 0 ? (
                    <div className="hoa-empty-msg">
                      No pending requests currently awaiting action at {activeRole.replace('_', ' ')} level.
                    </div>
                  ) : (
                    pendingForRole.map((req) => (
                      <div
                        key={req.id}
                        className={`hoa-request-card ${selectedReqId === req.id ? 'selected' : ''}`}
                        onClick={() => setSelectedReqId(req.id)}
                      >
                        <div className="hoa-req-card-top">
                          <span className="req-id">{req.id}</span>
                          <span className="hoa-status-tag st-pending">{req.status}</span>
                        </div>
                        <div className="hoa-req-card-middle">
                          <div>
                            <strong>PD Acc:</strong> {req.pdAccountNo}
                          </div>
                          <div>
                            <strong>Dept:</strong> {req.deptName}
                          </div>
                          <div>
                            <strong>Proposed HoAs:</strong>{' '}
                            {req.proposedHoAs.map((p) => p.fullHoA).join(', ')}
                          </div>
                        </div>
                        <div className="hoa-req-card-bottom">
                          <span>By: {req.submittedBy}</span>
                          <span>{req.submittedDate}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Detailed Review & Action */}
              <div className="hoa-card">
                <div className="hoa-card-header">
                  <span>REVIEW & ACTION</span>
                  <div className="hoa-card-header-sub">
                    <FileText size={15} /> Detailed Inspection Panel
                  </div>
                </div>

                <div className="hoa-card-body">
                  {selectedRequest ? (
                    <div className="hoa-detail-view">
                      <div className="hoa-detail-header-bar">
                        <div>
                          <h2>Request Reference: {selectedRequest.id}</h2>
                          <span className="hoa-chip chip-pending">
                            Current Status: {selectedRequest.status}
                          </span>
                        </div>
                        <div className="sub-meta">
                          Submitted by {selectedRequest.submittedBy} on {selectedRequest.submittedDate}
                        </div>
                      </div>

                      {/* Detail Section 1: Account Info */}
                      <div className="hoa-review-section">
                        <h4>1. PD Account & Treasury Details</h4>
                        <div className="hoa-grid-3">
                          <div className="hoa-rev-field">
                            <label>Treasury Code:</label>
                            <span>{selectedRequest.treasuryCode}</span>
                          </div>
                          <div className="hoa-rev-field">
                            <label>Treasury Name:</label>
                            <span>{selectedRequest.treasuryName}</span>
                          </div>
                          <div className="hoa-rev-field">
                            <label>Department Code:</label>
                            <span>{selectedRequest.deptCode}</span>
                          </div>
                          <div className="hoa-rev-field">
                            <label>Department Name:</label>
                            <span>{selectedRequest.deptName}</span>
                          </div>
                          <div className="hoa-rev-field">
                            <label>DDO Code:</label>
                            <span>{selectedRequest.ddoCode}</span>
                          </div>
                          <div className="hoa-rev-field">
                            <label>DDO Name:</label>
                            <span>{selectedRequest.ddoName}</span>
                          </div>
                          <div className="hoa-rev-field">
                            <label>Operator Code:</label>
                            <span>{selectedRequest.operatorCode}</span>
                          </div>
                          <div className="hoa-rev-field">
                            <label>Purpose Code:</label>
                            <span>{selectedRequest.purposeCode}</span>
                          </div>
                          <div className="hoa-rev-field">
                            <label>Operator Name:</label>
                            <span>{selectedRequest.operatorName}</span>
                          </div>
                          <div className="hoa-rev-field">
                            <label>Expenditure Pattern:</label>
                            <span>{selectedRequest.expenditurePattern}</span>
                          </div>
                        </div>
                      </div>

                      {/* Detail Section 2: Proposed HoAs */}
                      <div className="hoa-review-section">
                        <h4>2. Proposed Head of Account (HoA) Details</h4>
                        <div className="hoa-table-wrapper">
                          <table className="hoa-table">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Proposed HoA Code</th>
                                <th>Scheme Description</th>
                                <th>Validation Result</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedRequest.proposedHoAs.map((p, idx) => (
                                <tr key={p.id}>
                                  <td>{idx + 1}</td>
                                  <td>
                                    <span className="hoa-code-tag purple-tag">{p.fullHoA}</span>
                                  </td>
                                  <td>{p.schemeDescription}</td>
                                  <td>
                                    <span className="hoa-chip chip-success">
                                      <CheckCircle2 size={12} /> Valid & Unmapped
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Detail Section 3: Objective */}
                      <div className="hoa-review-section">
                        <h4>3. Objective & Budget Justification</h4>
                        <div className="hoa-obj-box">{selectedRequest.objective}</div>
                      </div>

                      {/* Detail Section 4: Audit Trail History */}
                      <div className="hoa-review-section">
                        <h4>4. Workflow Audit Trail & Action Log</h4>
                        <div className="hoa-audit-timeline">
                          {selectedRequest.auditTrail.map((aud) => (
                            <div key={aud.id} className="hoa-audit-item">
                              <div className="hoa-audit-dot" />
                              <div className="hoa-audit-content">
                                <div className="hoa-audit-head">
                                  <strong>
                                    {aud.userRole} ({aud.userName})
                                  </strong>
                                  <span className="aud-time">{aud.timestamp}</span>
                                </div>
                                <div className="hoa-audit-act">{aud.action}</div>
                                <div className="hoa-audit-rem">"{aud.remarks}"</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Decision Form */}
                      <div className="hoa-action-box">
                        <h4>Take Decision as {activeRole.replace('_', ' ')}</h4>
                        <div className="hoa-field">
                          <label className="hoa-label">
                            Officer Remarks / Recommendation <span className="req">*</span>
                          </label>
                          <textarea
                            className="hoa-textarea"
                            rows={2}
                            placeholder="Enter remarks for approval, return, or rejection..."
                            value={reviewRemarks}
                            onChange={(e) => setReviewRemarks(e.target.value)}
                          />
                        </div>

                        <div className="hoa-action-buttons">
                          {activeRole === 'PD_OPERATOR' && (
                            <>
                              <button
                                type="button"
                                className="hoa-btn hoa-btn-success"
                                onClick={() => handleWorkflowAction(selectedRequest.id, 'FORWARD')}
                              >
                                <ArrowRight size={15} /> Forward to HoAD
                              </button>
                              <button
                                type="button"
                                className="hoa-btn hoa-btn-warning"
                                onClick={() => handleWorkflowAction(selectedRequest.id, 'RETURN')}
                              >
                                <RotateCcw size={15} /> Return Back to DDO
                              </button>
                              <button
                                type="button"
                                className="hoa-btn hoa-btn-danger"
                                onClick={() => handleWorkflowAction(selectedRequest.id, 'REJECT')}
                              >
                                <XCircle size={15} /> Reject Request
                              </button>
                            </>
                          )}

                          {activeRole === 'HOAD' && (
                            <>
                              <button
                                type="button"
                                className="hoa-btn hoa-btn-success"
                                onClick={() => handleWorkflowAction(selectedRequest.id, 'FORWARD')}
                              >
                                <ArrowRight size={15} /> Forward to FD for Approval
                              </button>
                              <button
                                type="button"
                                className="hoa-btn hoa-btn-warning"
                                onClick={() => handleWorkflowAction(selectedRequest.id, 'RETURN')}
                              >
                                <RotateCcw size={15} /> Return Back to DDO
                              </button>
                              <button
                                type="button"
                                className="hoa-btn hoa-btn-danger"
                                onClick={() => handleWorkflowAction(selectedRequest.id, 'REJECT')}
                              >
                                <XCircle size={15} /> Reject Request
                              </button>
                            </>
                          )}

                          {activeRole === 'FD' && (
                            <>
                              <button
                                type="button"
                                className="hoa-btn hoa-btn-success"
                                onClick={() => handleWorkflowAction(selectedRequest.id, 'APPROVE')}
                              >
                                <CheckCircle2 size={15} /> Approve & Auto-Map HoA
                              </button>
                              <button
                                type="button"
                                className="hoa-btn hoa-btn-warning"
                                onClick={() => handleWorkflowAction(selectedRequest.id, 'RETURN')}
                              >
                                <RotateCcw size={15} /> Return Back to DDO
                              </button>
                              <button
                                type="button"
                                className="hoa-btn hoa-btn-danger"
                                onClick={() => handleWorkflowAction(selectedRequest.id, 'REJECT')}
                              >
                                <XCircle size={15} /> Reject Request
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="hoa-empty-msg large">
                      Select a pending request from the left queue to inspect details and take decision.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CommentLayer>
  );
}
