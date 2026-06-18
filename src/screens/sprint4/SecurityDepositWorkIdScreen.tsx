import React, { useState } from 'react';
import {
  ChevronRight,
  Check,
  AlertCircle,
  FileText,
  DollarSign,
  History,
  Activity,
  Plus,
  ArrowRight,
  ShieldAlert,
  Search,
  Lock,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import './SecurityDepositWorkIdScreen.css';

// Interfaces for our types
interface ParentWork {
  workId: string;
  hoa: string;
  projectName: string;
  ddoCode: string;
  contractor: string;
  fund: string;
  schemeCode: string;
  status: 'Draft' | 'Approved';
  sdWorkIdCreated?: string;
  createdAt: string;
}

interface SDWorkId {
  sdWorkId: string;
  parentWorkId: string;
  ddoCode: string;
  contractor: string;
  fund: string;
  schemeCode: string;
  status: 'Active';
  createdAt: string;
}

interface SDTransaction {
  id: string;
  sdWorkId: string;
  ddoCode: string;
  sourceWorkId: string;
  sourceWorkType: 'Budgeted' | 'Non-Budgeted';
  amount: number;
  billChallanRef: string;
  vendorName: string;
  mode: 'Deduction from Vendor Bill' | 'Direct Receipt from Contractor';
  createdAt: string;
}

interface AuditLog {
  id: string;
  event: string;
  details: string;
  ddoCode: string;
  user: string;
  timestamp: string;
}

export default function SecurityDepositWorkIdScreen() {
  const [activeTab, setActiveTab] = useState<'parent-work' | 'post-sd' | 'sd-ledger' | 'audit-trail'>('parent-work');

  // --- Seed Data ---
  const [parentWorks, setParentWorks] = useState<ParentWork[]>([
    {
      workId: 'WRK-2026-041920-01',
      projectName: 'Construction of New Block at District Hospital RES',
      hoa: '8443-00-111-0040', // RES
      ddoCode: 'DDO-RES-INDORE-01',
      contractor: 'Apex Infra Projects Ltd.',
      fund: 'NABARD Assistance',
      schemeCode: 'SC-40111-RES',
      status: 'Approved',
      sdWorkIdCreated: 'SD-8443-IND-01',
      createdAt: '2026-06-10 10:15:30'
    },
    {
      workId: 'WRK-2026-041920-02',
      projectName: 'Repair of Major District Highway Road-4',
      hoa: '8443-00-108-0000', // Non-RES
      ddoCode: 'DDO-WORKS-BHOPAL-02',
      contractor: 'Shree Balaji Constructions',
      fund: 'Consolidated Fund',
      schemeCode: 'SC-40108-NONRES',
      status: 'Draft',
      createdAt: '2026-06-12 11:00:00'
    },
    {
      workId: 'WRK-2026-041920-03',
      projectName: 'Afforestation Water Tank Lining works',
      hoa: '8782-00-102-0000', // Forest Remittances (Non-applicable for SD)
      ddoCode: 'DDO-FOREST-JABAL-03',
      contractor: 'R. K. Enterprises',
      fund: 'CAMPA Funds',
      schemeCode: 'SC-87820-FOREST',
      status: 'Draft',
      createdAt: '2026-06-12 14:30:00'
    }
  ]);

  const [sdWorkIds, setSdWorkIds] = useState<SDWorkId[]>([
    {
      sdWorkId: 'SD-8443-IND-01',
      parentWorkId: 'WRK-2026-041920-01',
      ddoCode: 'DDO-RES-INDORE-01',
      contractor: 'Apex Infra Projects Ltd.',
      fund: 'NABARD Assistance',
      schemeCode: 'SC-40111-RES',
      status: 'Active',
      createdAt: '2026-06-10 10:16:05'
    }
  ]);

  const [transactions, setTransactions] = useState<SDTransaction[]>([
    {
      id: 'TXN-9021',
      sdWorkId: 'SD-8443-IND-01',
      ddoCode: 'DDO-RES-INDORE-01',
      sourceWorkId: 'WRK-2026-041920-01',
      sourceWorkType: 'Non-Budgeted',
      amount: 45000,
      billChallanRef: 'BILL-RES-1024',
      vendorName: 'Apex Infra Projects Ltd.',
      mode: 'Deduction from Vendor Bill',
      createdAt: '2026-06-10 14:20:10'
    },
    {
      id: 'TXN-9022',
      sdWorkId: 'SD-8443-IND-01',
      ddoCode: 'DDO-RES-INDORE-01',
      sourceWorkId: 'BUDGET-WRK-900',
      sourceWorkType: 'Budgeted',
      amount: 150000,
      billChallanRef: 'CHLN-SD-492',
      vendorName: 'Apex Infra Projects Ltd.',
      mode: 'Direct Receipt from Contractor',
      createdAt: '2026-06-11 09:45:00'
    }
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'LOG-001',
      event: 'Parent Work ID Registered',
      details: 'Parent Work WRK-2026-041920-01 created in status Draft.',
      ddoCode: 'DDO-RES-INDORE-01',
      user: 'DDO Creator',
      timestamp: '2026-06-10 10:15:30'
    },
    {
      id: 'LOG-002',
      event: 'Parent Work Approved & SD Auto-Gen',
      details: 'Parent Work WRK-2026-041920-01 Approved under HoA 8443-00-111-0040. SD Work ID SD-8443-IND-01 automatically created.',
      ddoCode: 'DDO-RES-INDORE-01',
      user: 'DDO Approver',
      timestamp: '2026-06-10 10:16:05'
    },
    {
      id: 'LOG-003',
      event: 'SD Transaction Credit',
      details: 'Credited Rs. 45,000 from Bill BILL-RES-1024 (Source: WRK-2026-041920-01) to SD Work ID SD-8443-IND-01.',
      ddoCode: 'DDO-RES-INDORE-01',
      user: 'Works DDO',
      timestamp: '2026-06-10 14:20:10'
    },
    {
      id: 'LOG-004',
      event: 'SD Direct Receipt Credit',
      details: 'Credited Rs. 150,000 via Challan CHLN-SD-492 directly from contractor to SD Work ID SD-8443-IND-01.',
      ddoCode: 'DDO-RES-INDORE-01',
      user: 'Works DDO',
      timestamp: '2026-06-11 09:45:00'
    }
  ]);

  // --- Form States ---
  // 1. Parent Work Creation Form
  const [projectName, setProjectName] = useState('');
  const [hoa, setHoa] = useState('8443-00-108-0000');
  const [ddoCode, setDdoCode] = useState('DDO-WORKS-BHOPAL-02');
  const [contractor, setContractor] = useState('Shree Balaji Constructions');
  const [fund, setFund] = useState('Consolidated Fund');
  const [schemeCode, setSchemeCode] = useState('SC-40108-NONRES');
  
  // 2. SD Transaction Form
  const [selectedSourceWorkId, setSelectedSourceWorkId] = useState('');
  const [txnSourceWorkType, setTxnSourceWorkType] = useState<'Budgeted' | 'Non-Budgeted'>('Non-Budgeted');
  const [txnMode, setTxnMode] = useState<'Deduction from Vendor Bill' | 'Direct Receipt from Contractor'>('Deduction from Vendor Bill');
  const [txnAmount, setTxnAmount] = useState('');
  const [txnBillChallanRef, setTxnBillChallanRef] = useState('');
  const [txnVendorName, setTxnVendorName] = useState('');

  // 3. Search states
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');

  // 4. Toast notification / alerts helper
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);
  
  const showToast = (type: 'success' | 'warning' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // --- Handlers ---
  // Create Parent Work ID (Draft)
  const handleCreateParentWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      showToast('error', 'Project Name is mandatory');
      return;
    }

    const randomId = 'WRK-2026-041920-' + Math.floor(10 + Math.random() * 90);
    const newWork: ParentWork = {
      workId: randomId,
      projectName,
      hoa,
      ddoCode,
      contractor,
      fund,
      schemeCode,
      status: 'Draft',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    setParentWorks([newWork, ...parentWorks]);
    
    // Log Audit Event
    const logId = 'LOG-' + Math.floor(100 + Math.random() * 900);
    const newLog: AuditLog = {
      id: logId,
      event: 'Parent Work ID Registered',
      details: `Parent Work ${randomId} ("${projectName}") created in status Draft under HoA ${hoa}.`,
      ddoCode: ddoCode,
      user: 'DDO Creator',
      timestamp: newWork.createdAt
    };
    setAuditLogs([newLog, ...auditLogs]);

    showToast('success', `Parent Work ID ${randomId} registered successfully in DRAFT mode.`);
    setProjectName('');
  };

  // Approve Parent Work ID and simulate SD Auto-Gen Workflow
  const handleApproveParentWork = (work: ParentWork) => {
    const isApplicableHoA = work.hoa === '8443-00-108-0000' || work.hoa === '8443-00-111-0040';
    let targetSdId = '';

    // Update parent work status
    const updatedWorks = parentWorks.map(w => {
      if (w.workId === work.workId) {
        let sdId = w.sdWorkIdCreated;
        if (isApplicableHoA) {
          // Check if an SD Work ID already exists for this DDO
          const existingSD = sdWorkIds.find(sd => sd.ddoCode === work.ddoCode);
          if (existingSD) {
            sdId = existingSD.sdWorkId;
            targetSdId = sdId;
          } else {
            // Auto generate new one (AC-1)
            const prefix = work.hoa === '8443-00-111-0040' ? 'SD-RES' : 'SD-NRES';
            const randomCode = Math.floor(100 + Math.random() * 900);
            sdId = `${prefix}-${work.ddoCode.split('-')[2] || 'DDO'}-${randomCode}`;
            targetSdId = sdId;
          }
        }
        return {
          ...w,
          status: 'Approved' as const,
          sdWorkIdCreated: sdId
        };
      }
      return w;
    });

    setParentWorks(updatedWorks);

    // If applicable and no SD exists, create it
    const existingSD = sdWorkIds.find(sd => sd.ddoCode === work.ddoCode);
    const timestampStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    
    let logDetails = `Parent Work ${work.workId} Approved.`;

    if (isApplicableHoA) {
      if (existingSD) {
        logDetails += ` Reused existing SD Work ID ${existingSD.sdWorkId} mapped to DDO ${work.ddoCode} (AC-3).`;
        showToast('success', `Parent Work Approved. Reused existing SD Work ID ${existingSD.sdWorkId} for DDO.`);
      } else {
        const newSD: SDWorkId = {
          sdWorkId: targetSdId,
          parentWorkId: work.workId,
          ddoCode: work.ddoCode,
          contractor: work.contractor,
          fund: work.fund,
          schemeCode: work.schemeCode,
          status: 'Active',
          createdAt: timestampStr
        };
        setSdWorkIds([...sdWorkIds, newSD]);
        logDetails += ` Auto-generated new active SD Work ID ${targetSdId} (AC-1) inheriting details.`;
        showToast('success', `Parent Work Approved. System auto-generated new SD Work ID ${targetSdId}.`);
      }
    } else {
      logDetails += ` Selected HoA (${work.hoa}) is NOT applicable for SD. SD generation bypassed (AC-2).`;
      showToast('warning', `Parent Work Approved. No SD generated as HoA ${work.hoa} is not qualifying.`);
    }

    // Log Audit Event
    const logId = 'LOG-' + Math.floor(100 + Math.random() * 900);
    const newLog: AuditLog = {
      id: logId,
      event: isApplicableHoA ? 'Parent Work Approved & SD Created/Reused' : 'Parent Work Approved (No SD)',
      details: logDetails,
      ddoCode: work.ddoCode,
      user: 'DDO Approver',
      timestamp: timestampStr
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  // Submit SD Transaction (Deduction/Receipt)
  const handleSubmitTransaction = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSourceWorkId) {
      showToast('error', 'Please select a Source Work ID.');
      return;
    }
    if (!txnAmount || parseFloat(txnAmount) <= 0) {
      showToast('error', 'Amount must be greater than zero (AC-10).');
      return;
    }
    if (!txnBillChallanRef.trim()) {
      showToast('error', 'Bill / Challan reference is mandatory.');
      return;
    }
    if (!txnVendorName.trim()) {
      showToast('error', 'Vendor name/details are mandatory.');
      return;
    }

    // Find the source work details to find DDO and ensure SD Work ID exists
    const srcWork = parentWorks.find(w => w.workId === selectedSourceWorkId);
    if (!srcWork) {
      // Allow user to use a generic mock source work ID if not found (e.g. Budgeted)
      // We'll mock that DDO Indore-01 is used if it's BUDGET-WRK-900
      showToast('error', 'Invalid source work ID.');
      return;
    }

    // Verify DDO has an active SD Work ID
    const activeSD = sdWorkIds.find(sd => sd.ddoCode === srcWork.ddoCode);
    if (!activeSD) {
      showToast('error', `Posting Rejected: No Active SD Work ID exists for DDO (${srcWork.ddoCode}). Prohibited from direct posting (AC-10/AC-14).`);
      return;
    }

    // Create the transaction
    const txnId = 'TXN-' + Math.floor(9000 + Math.random() * 900);
    const timestampStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    
    const newTxn: SDTransaction = {
      id: txnId,
      sdWorkId: activeSD.sdWorkId,
      ddoCode: activeSD.ddoCode,
      sourceWorkId: srcWork.workId,
      sourceWorkType: txnSourceWorkType,
      amount: parseFloat(txnAmount),
      billChallanRef: txnBillChallanRef,
      vendorName: txnVendorName,
      mode: txnMode,
      createdAt: timestampStr
    };

    setTransactions([newTxn, ...transactions]);

    // Log Audit Event
    const logId = 'LOG-' + Math.floor(100 + Math.random() * 900);
    const newLog: AuditLog = {
      id: logId,
      event: 'SD Transaction Posted',
      details: `Posted SD Rs. ${parseFloat(txnAmount).toLocaleString('en-IN')} to SD Work ID ${activeSD.sdWorkId} from Source Work ${srcWork.workId} (${txnSourceWorkType}) via ${txnMode}.`,
      ddoCode: activeSD.ddoCode,
      user: 'Works DDO',
      timestamp: timestampStr
    };
    setAuditLogs([newLog, ...auditLogs]);

    showToast('success', `Transaction recorded! Rs. ${parseFloat(txnAmount).toLocaleString('en-IN')} routed directly to SD Work ID ${activeSD.sdWorkId} (AC-6).`);
    
    // Clear Form
    setTxnAmount('');
    setTxnBillChallanRef('');
    setTxnVendorName('');
    setSelectedSourceWorkId('');
  };

  // Helper: Get consolidated balance for a given SD Work ID
  const getSDBalance = (sdId: string) => {
    return transactions
      .filter(tx => tx.sdWorkId === sdId)
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  // Helper: Get active SD Work ID for the selected source work in the Transaction form
  const getActiveSDForSelectedSource = () => {
    if (!selectedSourceWorkId) return null;
    const srcWork = parentWorks.find(w => w.workId === selectedSourceWorkId);
    if (!srcWork) return null;
    return sdWorkIds.find(sd => sd.ddoCode === srcWork.ddoCode) || null;
  };

  const activeSDForTxn = getActiveSDForSelectedSource();

  // Filtered transactions for Ledger
  const filteredTransactions = transactions.filter(tx => {
    const term = ledgerSearch.toLowerCase();
    return (
      tx.sdWorkId.toLowerCase().includes(term) ||
      tx.sourceWorkId.toLowerCase().includes(term) ||
      tx.billChallanRef.toLowerCase().includes(term) ||
      tx.vendorName.toLowerCase().includes(term) ||
      tx.ddoCode.toLowerCase().includes(term)
    );
  });

  // Filtered audit logs
  const filteredAuditLogs = auditLogs.filter(log => {
    const term = auditSearch.toLowerCase();
    return (
      log.event.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term) ||
      log.ddoCode.toLowerCase().includes(term) ||
      log.user.toLowerCase().includes(term)
    );
  });

  return (
    <div className="sd-screen animate-fade-in">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`sd-toast animate-scale-in ${toastMessage.type}`}>
          <div className="sd-toast-icon">
            {toastMessage.type === 'success' && <Check size={18} />}
            {toastMessage.type === 'warning' && <AlertCircle size={18} />}
            {toastMessage.type === 'error' && <ShieldAlert size={18} />}
          </div>
          <div className="sd-toast-text">{toastMessage.text}</div>
        </div>
      )}

      {/* Header Panel */}
      <div className="sd-header">
        <div className="sd-header-title">
          <div className="sd-header-tag">
            <Sparkles size={12} />
            <span>MPTC 2020 Chapter 6 Compliance</span>
          </div>
          <h1>Security Deposit (SD) Work ID Management</h1>
          <p>
            Automatically generate a single Security Deposit Work ID per Works DDO. Route all deductions and direct contractor receipts exclusively to the system-generated SD Work ID for absolute transparency, complete vendor mapping, and statutory audit compliance.
          </p>
        </div>
        <div className="sd-header-stats">
          <div className="sd-mini-stat">
            <span className="sd-stat-lbl">Active DDO SD IDs</span>
            <span className="sd-stat-val text-primary">{sdWorkIds.length}</span>
          </div>
          <div className="sd-mini-stat">
            <span className="sd-stat-lbl">Total Consolidated SD Credits</span>
            <span className="sd-stat-val text-success">
              Rs. {transactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sd-tabs">
        <button
          className={`sd-tab ${activeTab === 'parent-work' ? 'active' : ''}`}
          onClick={() => setActiveTab('parent-work')}
        >
          <Layers size={16} />
          <span>1. Parent Work & SD Creation</span>
          <span className="sd-tab-indicator">{parentWorks.length}</span>
        </button>
        <button
          className={`sd-tab ${activeTab === 'post-sd' ? 'active' : ''}`}
          onClick={() => setActiveTab('post-sd')}
        >
          <DollarSign size={16} />
          <span>2. SD Deduction & Receipt</span>
        </button>
        <button
          className={`sd-tab ${activeTab === 'sd-ledger' ? 'active' : ''}`}
          onClick={() => setActiveTab('sd-ledger')}
        >
          <FileText size={16} />
          <span>3. Consolidated Ledger</span>
          <span className="sd-tab-indicator">{transactions.length}</span>
        </button>
        <button
          className={`sd-tab ${activeTab === 'audit-trail' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit-trail')}
        >
          <Activity size={16} />
          <span>4. System Audit Trail</span>
          <span className="sd-tab-indicator">{auditLogs.length}</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="sd-tab-content">
        
        {/* TAB 1: PARENT WORK & SD ID AUTO-GEN */}
        {activeTab === 'parent-work' && (
          <div className="sd-grid-layout config-layout animate-fade-in">
            
            {/* Left side: Creation Form */}
            <div className="sd-card">
              <div className="sd-card-header">
                <h2>Register New Parent Deposit / Works Context</h2>
                <p>Initiate Work ID under the Works DDO role to trigger automated workflow controls.</p>
              </div>
              <form onSubmit={handleCreateParentWork} className="sd-card-body sd-form-gap">
                
                <div className="form-group">
                  <label className="form-label">
                    Work / Project Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter project/work title (e.g. Renovation of State Highway-8)"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    maxLength={200}
                    required
                  />
                </div>

                <div className="sd-form-grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      Head of Account (HoA) <span className="required">*</span>
                    </label>
                    <select className="form-input" value={hoa} onChange={(e) => setHoa(e.target.value)}>
                      <option value="8443-00-108-0000">8443-00-108-0000 (Other than RES - Applicable)</option>
                      <option value="8443-00-111-0040">8443-00-111-0040 (RES - Applicable)</option>
                      <option value="8782-00-102-0000">8782-00-102-0000 (Forest Remittances - Exempt/Disabled)</option>
                      <option value="8443-00-103-0000">8443-00-103-0000 (Civil Court Deposits - Exempt/Disabled)</option>
                    </select>
                    <span className="sd-field-helper">
                      *(SD auto-generation triggers only on HoA 8443-108/111 per business rules)
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Works DDO Code <span className="required">*</span>
                    </label>
                    <select className="form-input" value={ddoCode} onChange={(e) => setDdoCode(e.target.value)}>
                      <option value="DDO-WORKS-BHOPAL-02">DDO-WORKS-BHOPAL-02 (Bhopal Div)</option>
                      <option value="DDO-RES-INDORE-01">DDO-RES-INDORE-01 (Indore Div)</option>
                      <option value="DDO-RES-JABAL-04">DDO-RES-JABAL-04 (Jabalpur Div)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Mapped Contractor <span className="required">*</span>
                  </label>
                  <select className="form-input" value={contractor} onChange={(e) => setContractor(e.target.value)}>
                    <option value="Shree Balaji Constructions">Shree Balaji Constructions</option>
                    <option value="Apex Infra Projects Ltd.">Apex Infra Projects Ltd.</option>
                    <option value="R. K. Enterprises">R. K. Enterprises</option>
                  </select>
                </div>

                <div className="sd-form-grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      Fund Source <span className="required">*</span>
                    </label>
                    <select className="form-input" value={fund} onChange={(e) => setFund(e.target.value)}>
                      <option value="Consolidated Fund">Consolidated Fund</option>
                      <option value="NABARD Assistance">NABARD Assistance</option>
                      <option value="CAMPA Funds">CAMPA Funds</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Scheme Code <span className="required">*</span>
                    </label>
                    <select className="form-input" value={schemeCode} onChange={(e) => setSchemeCode(e.target.value)}>
                      <option value="SC-40108-NONRES">SC-40108-NONRES</option>
                      <option value="SC-40111-RES">SC-40111-RES</option>
                      <option value="SC-87820-FOREST">SC-87820-FOREST</option>
                    </select>
                  </div>
                </div>

                <div className="sd-form-actions">
                  <button type="submit" className="btn btn-primary">
                    <Plus size={14} />
                    <span>Register Parent Work (Draft)</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right side: Existing Parent Works and Approval simulation */}
            <div className="sd-card">
              <div className="sd-card-header">
                <h2>Parent Works Register & SD Work ID Generator Linkage</h2>
                <p>Track registered works, verify HoA eligibility, and approve parent works to trigger SD Work ID creation.</p>
              </div>
              <div className="sd-card-body">
                <div className="sd-work-list">
                  {parentWorks.map((work) => {
                    const isApplicableHoA = work.hoa === '8443-00-108-0000' || work.hoa === '8443-00-111-0040';
                    return (
                      <div key={work.workId} className={`sd-work-item-card ${work.status.toLowerCase()}`}>
                        <div className="sd-work-item-header">
                          <div className="sd-work-title-group">
                            <span className="sd-work-id code-font">{work.workId}</span>
                            <span className={`badge ${work.status === 'Approved' ? 'badge-success' : 'badge-warning'}`}>
                              {work.status}
                            </span>
                          </div>
                          <span className="sd-work-date">{work.createdAt}</span>
                        </div>
                        
                        <div className="sd-work-details-grid">
                          <div><strong>Project:</strong> {work.projectName}</div>
                          <div><strong>DDO Code:</strong> {work.ddoCode}</div>
                          <div><strong>HoA:</strong> <span className="code-font">{work.hoa}</span></div>
                          <div><strong>Contractor:</strong> {work.contractor}</div>
                        </div>

                        <div className="sd-work-item-actions">
                          {work.status === 'Draft' ? (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleApproveParentWork(work)}
                            >
                              <span>Approve & Verify Workflow</span>
                              <ChevronRight size={12} />
                            </button>
                          ) : (
                            <div className="sd-action-result">
                              {isApplicableHoA ? (
                                <div className="sd-generation-success">
                                  <Check size={14} className="icon-green" />
                                  <span>
                                    Mapped to Active SD Work ID:{' '}
                                    <strong className="code-font text-primary">{work.sdWorkIdCreated}</strong>
                                  </span>
                                </div>
                              ) : (
                                <div className="sd-generation-disabled">
                                  <ShieldAlert size={14} className="icon-gold" />
                                  <span>SD Generation Disabled (Non-Qualifying HoA)</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Visual Mapping Details (AC-5) */}
                        {work.status === 'Approved' && isApplicableHoA && (
                          <div className="sd-inherited-mapping-box">
                            <div className="sd-mapping-header">
                              <Lock size={12} />
                              <span>INHERITED & LOCKED MASTER MAPPING (AC-5)</span>
                            </div>
                            <div className="sd-mapping-grid">
                              <div><span>DDO Code:</span> <strong>{work.ddoCode}</strong></div>
                              <div><span>Contractor:</span> <strong>{work.contractor}</strong></div>
                              <div><span>Fund Source:</span> <strong>{work.fund}</strong></div>
                              <div><span>Scheme Code:</span> <strong>{work.schemeCode}</strong></div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: SD DEDUCTION & RECEIPT */}
        {activeTab === 'post-sd' && (
          <div className="sd-grid-layout transaction-layout animate-fade-in">
            
            {/* Transaction Form */}
            <div className="sd-card">
              <div className="sd-card-header">
                <h2>Record Security Deposit Deduction or Direct Receipt</h2>
                <p>Post SD values from vendor bills or contractor challans. The system routes all credits to the DDO's SD Work ID.</p>
              </div>
              <form onSubmit={handleSubmitTransaction} className="sd-card-body sd-form-gap">
                
                <div className="form-group">
                  <label className="form-label">
                    Select Source Work ID (Budgeted or Non-Budgeted) <span className="required">*</span>
                  </label>
                  <select
                    className="form-input"
                    value={selectedSourceWorkId}
                    onChange={(e) => setSelectedSourceWorkId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Source Work --</option>
                    {parentWorks.map(w => (
                      <option key={w.workId} value={w.workId}>
                        {w.workId} - {w.projectName.substring(0, 45)}... ({w.ddoCode})
                      </option>
                    ))}
                  </select>
                  <span className="sd-field-helper">
                    *(Transactions are validated against DDO context to locate active SD Work ID)
                  </span>
                </div>

                {/* Live validation showing routing destination (AC-6, AC-14) */}
                <div className="sd-routing-watchdog">
                  <div className="sd-watchdog-title">
                    <Info size={14} />
                    <span>Transaction Router Audit (AC-14 Verification)</span>
                  </div>
                  {selectedSourceWorkId ? (
                    activeSDForTxn ? (
                      <div className="sd-watchdog-status success">
                        <Check size={14} />
                        <span>
                          <strong>VALID ROUTING DESTINATION DETECTED:</strong> All credits will route exclusively to{' '}
                          <strong className="code-font">{activeSDForTxn.sdWorkId}</strong> (Status: {activeSDForTxn.status}). Direct posting to the source Work ID is locked and blocked.
                        </span>
                      </div>
                    ) : (
                      <div className="sd-watchdog-status error">
                        <ShieldAlert size={14} />
                        <span>
                          <strong>ROUTING BLOCKED:</strong> The DDO associated with this source Work ID does not have an active SD Work ID. You must approve a parent Work ID under HoA 8443 for this DDO first.
                        </span>
                      </div>
                    )
                  ) : (
                    <div className="sd-watchdog-status pending">
                      <span>Please select a source Work ID to analyze routing pathways.</span>
                    </div>
                  )}
                </div>

                <div className="sd-form-grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      Source Work Type <span className="required">*</span>
                    </label>
                    <div className="sd-radio-toggle">
                      <label className={`radio-pill ${txnSourceWorkType === 'Budgeted' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="sourceWorkType"
                          value="Budgeted"
                          checked={txnSourceWorkType === 'Budgeted'}
                          onChange={() => setTxnSourceWorkType('Budgeted')}
                        />
                        <span>Budgeted Work</span>
                      </label>
                      <label className={`radio-pill ${txnSourceWorkType === 'Non-Budgeted' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="sourceWorkType"
                          value="Non-Budgeted"
                          checked={txnSourceWorkType === 'Non-Budgeted'}
                          onChange={() => setTxnSourceWorkType('Non-Budgeted')}
                        />
                        <span>Non-Budgeted Work</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Transaction Mode / Type <span className="required">*</span>
                    </label>
                    <select
                      className="form-input"
                      value={txnMode}
                      onChange={(e) => setTxnMode(e.target.value as any)}
                    >
                      <option value="Deduction from Vendor Bill">Deduction from Vendor Bill (AC-6)</option>
                      <option value="Direct Receipt from Contractor">Direct Receipt from Contractor (AC-7)</option>
                    </select>
                  </div>
                </div>

                <div className="sd-form-grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      Security Deposit Credit Amount (Rs.) <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-input code-font"
                      placeholder="e.g. 75000"
                      value={txnAmount}
                      onChange={(e) => setTxnAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Bill / Challan Reference <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input code-font"
                      placeholder="e.g. BILL-99201 or CHLN-582"
                      value={txnBillChallanRef}
                      onChange={(e) => setTxnBillChallanRef(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Vendor Details / Mapping <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter vendor legal name and GSTIN (e.g. Apex Projects - GSTIN24AA...)"
                    value={txnVendorName}
                    onChange={(e) => setTxnVendorName(e.target.value)}
                    required
                  />
                </div>

                <div className="sd-form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!activeSDForTxn}
                  >
                    <span>Record SD Transaction & Route Credit</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </form>
            </div>

            {/* Visualizer showing routing process (AC-6/AC-14 visual flow) */}
            <div className="sd-card">
              <div className="sd-card-header">
                <h2>Security Deposit Posting & Routing Schema</h2>
                <p>Visual verification of credit pathway redirection from parent Work ID directly to the consolidated DDO SD account.</p>
              </div>
              <div className="sd-card-body flex-center">
                
                <div className="routing-flow-diagram">
                  
                  <div className="flow-node source-node">
                    <div className="flow-node-icon"><FileText size={18} /></div>
                    <div className="flow-node-title">Source Work ID</div>
                    <div className="flow-node-sub">{selectedSourceWorkId || 'Not Selected'}</div>
                    <span className="badge-type">{txnSourceWorkType}</span>
                  </div>

                  <div className="flow-connector">
                    <div className="flow-arrow-line">
                      <div className="arrow-head"></div>
                    </div>
                    <span className="flow-connector-label error">BLOCK DIRECT POST (AC-14)</span>
                  </div>

                  <div className="flow-node blocked-node">
                    <div className="flow-node-icon"><ShieldAlert size={18} /></div>
                    <div className="flow-node-title">Direct Posting</div>
                    <div className="flow-node-sub">Denied by Rules</div>
                  </div>

                  <div className="flow-connector detour">
                    <div className="flow-arrow-line-detour"></div>
                    <span className="flow-connector-label success">ROUTE TO SD ID (AC-6)</span>
                  </div>

                  <div className="flow-node target-node">
                    <div className="flow-node-icon"><DollarSign size={18} /></div>
                    <div className="flow-node-title">SD Work ID Repository</div>
                    <div className="flow-node-sub">{activeSDForTxn ? activeSDForTxn.sdWorkId : 'No active target'}</div>
                    <span className="badge-type success">CREDIT ROUTED</span>
                  </div>

                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 3: CONSOLIDATED SD LEDGER */}
        {activeTab === 'sd-ledger' && (
          <div className="sd-card animate-fade-in">
            <div className="sd-card-header sd-flex-between">
              <div>
                <h2>Consolidated Security Deposit ledger & Breakup</h2>
                <p>Ledger maintains total SD balances, source-wise deduction breakup, vendor mappings, and challan histories (AC-8, AC-9).</p>
              </div>
              <div className="sd-search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search ledger by SD ID, Vendor, Challan..."
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="sd-card-body">

              {/* Master Balance Summary Cards */}
              <div className="sd-balance-grid">
                {sdWorkIds.map(sd => {
                  const balance = getSDBalance(sd.sdWorkId);
                  return (
                    <div key={sd.sdWorkId} className="sd-balance-card">
                      <div className="sd-balance-card-header">
                        <span className="sd-bal-id code-font">{sd.sdWorkId}</span>
                        <span className="badge badge-success">{sd.status}</span>
                      </div>
                      <div className="sd-balance-value">
                        Rs. {balance.toLocaleString('en-IN')}
                      </div>
                      <div className="sd-balance-card-footer">
                        <div><strong>DDO Code:</strong> {sd.ddoCode}</div>
                        <div><strong>Inherited Contractor:</strong> {sd.contractor}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Transaction Breakup Table */}
              <div className="sd-table-wrapper">
                <table className="sd-table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>SD Target Work ID</th>
                      <th>Source Work ID</th>
                      <th>Source Work Type</th>
                      <th>Vendor Name / Reference</th>
                      <th>Bill / Challan Ref</th>
                      <th>Posting Mode</th>
                      <th>Date / Time</th>
                      <th className="align-right">Credit Amount (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="code-font">{tx.id}</td>
                          <td className="code-font text-primary">{tx.sdWorkId}</td>
                          <td className="code-font">{tx.sourceWorkId}</td>
                          <td>
                            <span className={`badge-type ${tx.sourceWorkType.toLowerCase()}`}>
                              {tx.sourceWorkType}
                            </span>
                          </td>
                          <td>{tx.vendorName}</td>
                          <td className="code-font">{tx.billChallanRef}</td>
                          <td>{tx.mode}</td>
                          <td className="text-secondary">{tx.createdAt}</td>
                          <td className="align-right code-font text-success font-bold">
                            + {tx.amount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center text-secondary py-5">
                          No transactions match your search filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: AUDIT TRAIL */}
        {activeTab === 'audit-trail' && (
          <div className="sd-card animate-fade-in">
            <div className="sd-card-header sd-flex-between">
              <div>
                <h2>Complete System Audit Trail</h2>
                <p>Auditable log tracking auto-generation events, user action timestamps, DDO links, and approval details (AC-12).</p>
              </div>
              <div className="sd-search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search logs by Event, DDO, user..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="sd-card-body">
              
              <div className="sd-timeline">
                {filteredAuditLogs.length > 0 ? (
                  filteredAuditLogs.map((log) => (
                    <div key={log.id} className="sd-timeline-item">
                      <div className="sd-timeline-badge">
                        <History size={14} />
                      </div>
                      <div className="sd-timeline-content">
                        <div className="sd-timeline-header">
                          <span className="sd-log-event">{log.event}</span>
                          <span className="sd-log-time">{log.timestamp}</span>
                        </div>
                        <div className="sd-log-details">{log.details}</div>
                        <div className="sd-log-meta">
                          <span><strong>User Role:</strong> {log.user}</span>
                          <span className="separator">|</span>
                          <span><strong>DDO Context:</strong> <span className="code-font">{log.ddoCode}</span></span>
                          <span className="separator">|</span>
                          <span><strong>Log Ref:</strong> <span className="code-font">{log.id}</span></span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-secondary py-5">
                    No system log entries match your search query.
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
