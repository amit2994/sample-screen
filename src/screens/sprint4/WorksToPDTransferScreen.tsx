import React, { useState, useMemo } from 'react';
import {
  Check,
  AlertCircle,
  DollarSign,
  Search,
  Layers,
  Sparkles,
  Info,
  ShieldAlert,
  Send,
  RefreshCw,
  UserCheck,
  History
} from 'lucide-react';
import './WorksToPDTransferScreen.css';

// --- Types & Interfaces ---
interface WorkHoaItem {
  code: string;
  balance: number;
}

interface WorkIdItem {
  id: string;
  type: 'budgeted' | 'non-budgeted';
  projectName: string;
  bcoCode?: string;
  bcoName?: string;
  ddoCode: string;
  ddoName: string;
  hoas: WorkHoaItem[];
  treasury: string;
}

interface PDAccountItem {
  id: string;
  name: string;
  treasury: string;
  allowedHoas: string[];
  purposeCode: string;
  purposeName: string;
}

interface TransferRecord {
  id: string;
  dateTime: string;
  fromWorkId: string;
  fromWorkType: string;
  fromHoa: string;
  toTreasury: string;
  toAccountType: 'PD' | 'CCD' | 'CrCD';
  toAccountId?: string;
  toHoa: string;
  amount: number;
  status: 'Completed';
}

interface LinkageRequest {
  id: string;
  workId: string;
  ddoCode: string;
  bcoCode?: string;
  pdAccountId: string;
  pdAccountName: string;
  requestedHoa: string;
  status: 'Pending' | 'Approved';
  requestDate: string;
}

// --- Initial Mock Data ---
const INITIAL_WORKS: WorkIdItem[] = [
  {
    id: 'WRK-BUD-1092',
    type: 'budgeted',
    projectName: 'Construction of Bhopal Bypass Road Phase-II',
    bcoCode: 'BCO-045-PWD',
    bcoName: 'Public Works Department (HQ)',
    ddoCode: 'DDO-BPL-02',
    ddoName: 'Bhopal Road & Bridges Division',
    hoas: [
      { code: '8443-00-108-0000', balance: 2500000 },
      { code: '8443-00-111-0040', balance: 1200000 }
    ],
    treasury: 'Bhopal Treasury (T-101)'
  },
  {
    id: 'WRK-BUD-2015',
    type: 'budgeted',
    projectName: 'Construction of Girls School Building Indore',
    bcoCode: 'BCO-060-EDU',
    bcoName: 'Department of School Education',
    ddoCode: 'DDO-IND-01',
    ddoName: 'Indore RES Division',
    hoas: [
      { code: '8443-00-111-0040', balance: 1450000 },
      { code: '8443-00-108-0000', balance: 850000 }
    ],
    treasury: 'Indore Treasury (T-102)'
  },
  {
    id: 'WRK-NBD-5091',
    type: 'non-budgeted',
    projectName: 'Maintenance and Rehabilitation of Gwalior Canal System',
    ddoCode: 'DDO-GWL-03',
    ddoName: 'Gwalior Water Resources Division',
    hoas: [
      { code: '8443-00-108-0000', balance: 980000 }
    ],
    treasury: 'Gwalior Treasury (T-103)'
  },
  {
    id: 'WRK-NBD-7014',
    type: 'non-budgeted',
    projectName: 'Afforestation and Soil Conservation Fencing in Jabalpur Division',
    ddoCode: 'DDO-JBL-05',
    ddoName: 'Jabalpur Forest Division Office',
    hoas: [
      { code: '8782-00-102-0000', balance: 620000 }
    ],
    treasury: 'Jabalpur Treasury (T-104)'
  }
];

const INITIAL_PD_ACCOUNTS: PDAccountItem[] = [
  {
    id: 'PD-ACT-8001',
    name: 'Indore District Collectorate Development PD',
    treasury: 'Indore Treasury (T-102)',
    allowedHoas: ['8443-00-108-0000', '8443-00-111-0040'],
    purposeCode: 'PURP-302',
    purposeName: 'District Infrastructure Development'
  },
  {
    id: 'PD-ACT-8002',
    name: 'Bhopal PWD PD Account',
    treasury: 'Bhopal Treasury (T-101)',
    allowedHoas: ['8443-00-108-0000'],
    purposeCode: 'PURP-101',
    purposeName: 'State Highway Operations'
  },
  {
    id: 'PD-ACT-8003',
    name: 'Jabalpur Forest Welfare PD Account',
    treasury: 'Jabalpur Treasury (T-104)',
    allowedHoas: ['8782-00-102-0000'],
    purposeCode: 'PURP-504',
    purposeName: 'Forestry Scheme Funding'
  }
];

const TREASURIES = [
  'Bhopal Treasury (T-101)',
  'Indore Treasury (T-102)',
  'Gwalior Treasury (T-103)',
  'Jabalpur Treasury (T-104)'
];

const COURT_HOAS = [
  { code: '8443-00-103-0000', label: 'Civil Court Deposits' },
  { code: '8443-00-104-0000', label: 'Criminal Court Deposits' }
];

export default function WorksToPDTransferScreen() {
  const [activeTab, setActiveTab] = useState<'transfer' | 'admin' | 'ledger'>('transfer');

  // --- Core States ---
  const [works, setWorks] = useState<WorkIdItem[]>(INITIAL_WORKS);
  const [pdAccounts, setPdAccounts] = useState<PDAccountItem[]>(INITIAL_PD_ACCOUNTS);
  const [linkageRequests, setLinkageRequests] = useState<LinkageRequest[]>([]);
  const [transfers, setTransfers] = useState<TransferRecord[]>([
    {
      id: 'TXN-W2PD-9021',
      dateTime: '2026-06-15 11:20:45',
      fromWorkId: 'WRK-BUD-1092',
      fromWorkType: 'Budgeted',
      fromHoa: '8443-00-108-0000',
      toTreasury: 'Bhopal Treasury (T-101)',
      toAccountType: 'PD',
      toAccountId: 'PD-ACT-8002',
      toHoa: '8443-00-108-0000',
      amount: 450000,
      status: 'Completed'
    }
  ]);

  // --- Form States ---
  const [fromTreasury, setFromTreasury] = useState('');
  const [workIdType, setWorkIdType] = useState<'budgeted' | 'non-budgeted' | ''>('');
  const [selectedWorkId, setSelectedWorkId] = useState('');
  const [selectedHoa, setSelectedHoa] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  const [toTreasury, setToTreasury] = useState('');
  const [accountType, setAccountType] = useState<'PD' | 'CCD' | 'CrCD'>('PD');
  const [selectedPdAccount, setSelectedPdAccount] = useState('');

  // Custom non-PD inputs
  const [selectedCourtHoa, setSelectedCourtHoa] = useState('8443-00-103-0000');
  const [courtPurposeCode, setCourtPurposeCode] = useState('PURP-CRT-01');

  // Filter States
  const [ledgerSearch, setLedgerSearch] = useState('');

  // Toast / Status Alerts helper
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'warning' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // --- Derived Calculations ---
  const selectedWork = useMemo(() => {
    return works.find(w => w.id === selectedWorkId) || null;
  }, [selectedWorkId, works]);

  // Filter PD Accounts by To-Treasury
  const filteredPdAccounts = useMemo(() => {
    if (!toTreasury) return [];
    return pdAccounts.filter(acc => acc.treasury === toTreasury);
  }, [toTreasury, pdAccounts]);

  const selectedPdAcc = useMemo(() => {
    return pdAccounts.find(acc => acc.id === selectedPdAccount) || null;
  }, [selectedPdAccount, pdAccounts]);

  // Check if HoA matches
  const hoaMismatch = useMemo(() => {
    if (accountType !== 'PD' || !selectedWork || !selectedPdAcc || !selectedHoa) return false;
    // Mismatch if the selected PD account doesn't include the selected HoA
    return !selectedPdAcc.allowedHoas.includes(selectedHoa);
  }, [accountType, selectedWork, selectedPdAcc, selectedHoa]);

  // Check if a linkage request is already pending for this mismatch
  const existingPendingRequest = useMemo(() => {
    if (!selectedWork || !selectedPdAcc || !selectedHoa) return null;
    return linkageRequests.find(
      req => req.workId === selectedWork.id &&
        req.pdAccountId === selectedPdAcc.id &&
        req.requestedHoa === selectedHoa &&
        req.status === 'Pending'
    ) || null;
  }, [selectedWork, selectedPdAcc, selectedHoa, linkageRequests]);

  // Total balance summary
  const totalRemainingWorksBalance = useMemo(() => {
    return works.reduce((sum, w) => sum + w.hoas.reduce((hSum, h) => hSum + h.balance, 0), 0);
  }, [works]);

  const totalTransferred = useMemo(() => {
    return transfers.reduce((sum, t) => sum + t.amount, 0);
  }, [transfers]);

  // --- Actions ---

  // Request Linkage
  const handleRequestLinkage = () => {
    if (!selectedWork || !selectedPdAcc || !selectedHoa) return;

    if (existingPendingRequest) {
      showToast('warning', 'A linkage request for this HoA is already pending approval.');
      return;
    }

    const newRequest: LinkageRequest = {
      id: 'REQ-' + Math.floor(1000 + Math.random() * 9000),
      workId: selectedWork.id,
      ddoCode: selectedWork.ddoCode,
      bcoCode: selectedWork.bcoCode,
      pdAccountId: selectedPdAcc.id,
      pdAccountName: selectedPdAcc.name,
      requestedHoa: selectedHoa,
      status: 'Pending',
      requestDate: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    setLinkageRequests([newRequest, ...linkageRequests]);
    showToast('success', `HoA linkage request generated. Please notify the Deposit Admin to authorize.`);
  };

  // Submit Transfer
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedWorkId) {
      showToast('error', 'Please select a Source Work ID.');
      return;
    }
    if (!selectedHoa) {
      showToast('error', 'Please select a Head of Account.');
      return;
    }
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      showToast('error', 'Transfer amount must be greater than zero.');
      return;
    }

    const activeHoaItem = selectedWork?.hoas.find(h => h.code === selectedHoa);
    if (!activeHoaItem) {
      showToast('error', 'Selected Head of Account not found.');
      return;
    }

    if (parseFloat(transferAmount) > activeHoaItem.balance) {
      showToast('error', 'Transfer amount cannot exceed the HoA balance.');
      return;
    }

    if (accountType === 'PD') {
      if (!selectedPdAccount) {
        showToast('error', 'Please select a destination PD Account.');
        return;
      }
      if (hoaMismatch) {
        showToast('error', 'Transfer Blocked: HoA is not registered in the destination PD Account.');
        return;
      }
    }

    const amountNum = parseFloat(transferAmount);

    // Deduct balance from source Work ID's specific HoA
    setWorks(prevWorks =>
      prevWorks.map(w => {
        if (w.id === selectedWorkId) {
          return {
            ...w,
            hoas: w.hoas.map(h => {
              if (h.code === selectedHoa) {
                return { ...h, balance: h.balance - amountNum };
              }
              return h;
            })
          };
        }
        return w;
      })
    );

    // Record transaction
    const newTxn: TransferRecord = {
      id: 'TXN-W2PD-' + Math.floor(1000 + Math.random() * 9000),
      dateTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      fromWorkId: selectedWorkId,
      fromWorkType: selectedWork?.type === 'budgeted' ? 'Budgeted' : 'Non-Budgeted',
      fromHoa: selectedHoa,
      toTreasury: toTreasury || fromTreasury || 'General Treasury',
      toAccountType: accountType,
      toAccountId: accountType === 'PD' ? selectedPdAccount : undefined,
      toHoa: accountType === 'PD' ? selectedHoa : selectedCourtHoa,
      amount: amountNum,
      status: 'Completed'
    };

    setTransfers([newTxn, ...transfers]);
    showToast('success', `Transfer of ₹ ${amountNum.toLocaleString('en-IN')} completed successfully!`);

    // Reset Form
    setTransferAmount('');
  };

  // Admin Approve Linkage Request
  const handleAdminApprove = (req: LinkageRequest) => {
    // 1. Add HoA to the specific PD account allowedHoas list
    setPdAccounts(prevAccounts =>
      prevAccounts.map(acc => {
        if (acc.id === req.pdAccountId) {
          // Add if not already present
          const hasHoa = acc.allowedHoas.includes(req.requestedHoa);
          return {
            ...acc,
            allowedHoas: hasHoa ? acc.allowedHoas : [...acc.allowedHoas, req.requestedHoa]
          };
        }
        return acc;
      })
    );

    // 2. Mark request as Approved
    setLinkageRequests(prevRequests =>
      prevRequests.map(r => {
        if (r.id === req.id) {
          return { ...r, status: 'Approved' };
        }
        return r;
      })
    );

    showToast('success', `Request approved. HoA ${req.requestedHoa} successfully linked to PD Account ${req.pdAccountId}.`);
  };

  // Filter transfers for Ledger search
  const filteredTransfers = useMemo(() => {
    const term = ledgerSearch.toLowerCase();
    return transfers.filter(t =>
      t.id.toLowerCase().includes(term) ||
      t.fromWorkId.toLowerCase().includes(term) ||
      t.fromHoa.toLowerCase().includes(term) ||
      t.toTreasury.toLowerCase().includes(term) ||
      (t.toAccountId && t.toAccountId.toLowerCase().includes(term))
    );
  }, [transfers, ledgerSearch]);

  const pendingRequestsCount = useMemo(() => {
    return linkageRequests.filter(r => r.status === 'Pending').length;
  }, [linkageRequests]);

  return (
    <div className="w2pd-screen">

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`w2pd-toast ${toastMessage.type}`}>
          <div className="w2pd-toast-icon">
            {toastMessage.type === 'success' && <Check size={18} />}
            {toastMessage.type === 'warning' && <AlertCircle size={18} />}
            {toastMessage.type === 'error' && <AlertCircle size={18} />}
          </div>
          <div className="w2pd-toast-text">{toastMessage.text}</div>
        </div>
      )}

      {/* Header Panel */}
      <div className="w2pd-header">
        <div className="w2pd-header-title">
          <div className="w2pd-header-tag">
            <Sparkles size={12} />
            <span>IFMIS-NG Treasury Module</span>
          </div>
          <h1>Works Deposit to PD / Court Deposit Account Transfer</h1>
          <p>
            Initiate and validate fund transfers from Works Deposit/ID accounts to Personal Deposit (PD), Civil Court Deposits (CCD), and Criminal Court Deposits (CrCD). Automatically verifies Treasury boundaries, Head of Account mappings, and provides direct workflow routing for missing Head links.
          </p>
        </div>
        <div className="w2pd-header-stats">
          <div className="w2pd-mini-stat">
            <span className="w2pd-stat-lbl">Remaining Works Balance</span>
            <span className="w2pd-stat-val text-primary">₹ {totalRemainingWorksBalance.toLocaleString('en-IN')}</span>
          </div>
          <div className="w2pd-mini-stat">
            <span className="w2pd-stat-lbl">Total Transferred</span>
            <span className="w2pd-stat-val text-success">₹ {totalTransferred.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="w2pd-tabs">
        <button
          className={`w2pd-tab ${activeTab === 'transfer' ? 'active' : ''}`}
          onClick={() => setActiveTab('transfer')}
        >
          <DollarSign size={16} />
          <span>1. Fund Transfer Form</span>
        </button>
        <button
          className={`w2pd-tab ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          <UserCheck size={16} />
          <span>2. Deposit Admin Desk</span>
          {pendingRequestsCount > 0 ? (
            <span className="w2pd-tab-indicator badge-pulse">{pendingRequestsCount}</span>
          ) : (
            <span className="w2pd-tab-indicator">{linkageRequests.length}</span>
          )}
        </button>
        <button
          className={`w2pd-tab ${activeTab === 'ledger' ? 'active' : ''}`}
          onClick={() => setActiveTab('ledger')}
        >
          <History size={16} />
          <span>3. Transfer History Ledger</span>
          <span className="w2pd-tab-indicator">{transfers.length}</span>
        </button>
      </div>

      {/* Tab Content 1: Transfer Form */}
      {activeTab === 'transfer' && (
        <form onSubmit={handleTransferSubmit} className="w2pd-grid animate-scale-in">

          {/* Column 1: Source Context (From) */}
          <div className="w2pd-card">
            <div className="w2pd-card-header">
              <div className="w2pd-card-header-title">
                <h2>FROM</h2>
                <p>Select originating Treasury and Work Context to fetch balance details.</p>
              </div>
            </div>
            <div className="w2pd-card-body">
              <div className="w2pd-form-section-title">
                <Layers size={14} /> Origin Details
              </div>

              {/* Work ID Selection */}
              <div className="form-group">
                <label className="form-label">
                  Work ID <span className="required">*</span>
                </label>
                <select
                  className="form-input"
                  value={selectedWorkId}
                  onChange={(e) => {
                    const workId = e.target.value;
                    setSelectedWorkId(workId);
                    if (workId) {
                      const match = works.find(w => w.id === workId);
                      if (match) {
                        setFromTreasury(match.treasury);
                        setWorkIdType(match.type);
                        setSelectedHoa('');
                        setTransferAmount('');
                      }
                    } else {
                      setFromTreasury('');
                      setWorkIdType('');
                      setSelectedHoa('');
                      setTransferAmount('');
                    }
                  }}
                  required
                >
                  <option value="">-- Select Work Context --</option>
                  {works.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.id} - {w.projectName.substring(0, 50)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto-Fetched Fields from Work Context */}
              {selectedWork ? (
                <div className="w2pd-fetched-group animate-fade-in" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  <div className="w2pd-fetched-field">
                    <span className="w2pd-fetched-lbl">Treasury (Auto-Fetched)</span>
                    <span className="w2pd-fetched-val" style={{ fontWeight: 700 }}>{fromTreasury}</span>
                  </div>

                  <div className="w2pd-fetched-field">
                    <span className="w2pd-fetched-lbl">Work ID Type (Auto-Fetched)</span>
                    <span className="w2pd-fetched-val code-font text-primary" style={{ textTransform: 'uppercase' }}>
                      {workIdType}
                    </span>
                  </div>

                  {selectedWork.type === 'budgeted' ? (
                    <>
                      <div className="w2pd-fetched-field">
                        <span className="w2pd-fetched-lbl">BCO Code (Auto-Fetched)</span>
                        <span className="w2pd-fetched-val w2pd-code-font">{selectedWork.bcoCode}</span>
                      </div>
                      <div className="w2pd-fetched-field" style={{ gridColumn: 'span 2' }}>
                        <span className="w2pd-fetched-lbl">BCO Name (Auto-Fetched)</span>
                        <span className="w2pd-fetched-val">{selectedWork.bcoName}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w2pd-fetched-field">
                        <span className="w2pd-fetched-lbl">DDO Code (Auto-Fetched)</span>
                        <span className="w2pd-fetched-val w2pd-code-font">{selectedWork.ddoCode}</span>
                      </div>
                      <div className="w2pd-fetched-field" style={{ gridColumn: 'span 2' }}>
                        <span className="w2pd-fetched-lbl">DDO Name (Auto-Fetched)</span>
                        <span className="w2pd-fetched-val">{selectedWork.ddoName}</span>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="w2pd-alert info animate-scale-in">
                  <div className="w2pd-alert-icon">
                    <Info size={18} />
                  </div>
                  <div className="w2pd-alert-content">
                    <span className="w2pd-alert-title">No Work Context Selected</span>
                    <span>Please select a Work ID to automatically fetch originating Treasury, Work ID Type, and BCO/DDO metadata.</span>
                  </div>
                </div>
              )}

              {/* Head of Account, HoA Balance & Transfer Amount Group */}
              {selectedWork && (
                <div className={selectedHoa ? "w2pd-form-grid-3 animate-fade-in" : "animate-fade-in"}>
                  <div className="form-group">
                    <label className="form-label">
                      Head of Account (HoA) <span className="required">*</span>
                    </label>
                    <select
                      className="form-input"
                      value={selectedHoa}
                      onChange={(e) => {
                        setSelectedHoa(e.target.value);
                        setTransferAmount('');
                      }}
                      required
                    >
                      <option value="">-- Select Head of Account --</option>
                      {selectedWork.hoas.map(hoa => (
                        <option key={hoa.code} value={hoa.code}>
                          {hoa.code}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedHoa && (
                    <>
                      <div className="form-group animate-fade-in">
                        <label className="form-label">HoA Total Balance (Auto-Fetched)</label>
                        <div 
                          className="w2pd-fetched-group" 
                          style={{ 
                            padding: '0 var(--space-3)', 
                            height: '38px', 
                            display: 'flex', 
                            alignItems: 'center',
                            background: 'var(--color-bg)',
                            border: '1px solid var(--color-border-light)',
                            borderRadius: 'var(--radius-md)',
                            boxSizing: 'border-box'
                          }}
                        >
                          <div className="w2pd-fetched-field" style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="w2pd-fetched-lbl" style={{ margin: 0, fontSize: '9px' }}>Available Balance</span>
                            <span className="w2pd-fetched-val balance-val" style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>
                              ₹ {(selectedWork.hoas.find(h => h.code === selectedHoa)?.balance || 0).toLocaleString('en-IN')}.00
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="form-group animate-fade-in">
                        <label className="form-label">
                          Transfer Amount (₹) <span className="required">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="Enter amount to transfer"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          max={selectedWork.hoas.find(h => h.code === selectedHoa)?.balance || undefined}
                          min="1"
                          required
                        />
                      </div>
                    </>
                  )}
                </div>
              )}


            </div>
          </div>

          {/* Column 2: Destination Context (To) */}
          <div className="w2pd-card">
            <div className="w2pd-card-header">
              <div className="w2pd-card-header-title">
                <h2>Destination Context (TO)</h2>
                <p>Select target Treasury boundary and deposit accounts details.</p>
              </div>
            </div>
            <div className="w2pd-card-body">
              <div className="w2pd-form-section-title">
                <Layers size={14} /> Deposit Destination Details
              </div>

              {/* Target Treasury Selection */}
              <div className="form-group">
                <label className="form-label">
                  Target Treasury <span className="required">*</span>
                </label>
                <select
                  className="form-input"
                  value={toTreasury}
                  onChange={(e) => {
                    setToTreasury(e.target.value);
                    setSelectedPdAccount(''); // Clear PD account on treasury change
                  }}
                  required
                >
                  <option value="">-- Select Target Treasury --</option>
                  {TREASURIES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Account Type Selection */}
              <div className="form-group">
                <label className="form-label">
                  Account Type <span className="required">*</span>
                </label>
                <div className="w2pd-radio-group">
                  <div
                    className={`w2pd-radio-btn ${accountType === 'PD' ? 'active' : ''}`}
                    onClick={() => setAccountType('PD')}
                  >
                    <input
                      type="radio"
                      name="accountType"
                      checked={accountType === 'PD'}
                      onChange={() => { }}
                    />
                    <span>Personal Deposit (PD)</span>
                  </div>
                  <div
                    className={`w2pd-radio-btn ${accountType === 'CCD' ? 'active' : ''}`}
                    onClick={() => setAccountType('CCD')}
                  >
                    <input
                      type="radio"
                      name="accountType"
                      checked={accountType === 'CCD'}
                      onChange={() => { }}
                    />
                    <span>Civil Court (CCD)</span>
                  </div>
                  <div
                    className={`w2pd-radio-btn ${accountType === 'CrCD' ? 'active' : ''}`}
                    onClick={() => setAccountType('CrCD')}
                  >
                    <input
                      type="radio"
                      name="accountType"
                      checked={accountType === 'CrCD'}
                      onChange={() => { }}
                    />
                    <span>Crim Court (CrCD)</span>
                  </div>
                </div>
              </div>

              {/* Conditional Block: PD Account Fields */}
              {accountType === 'PD' && (
                <div className="w2pd-form-grid-2 animate-fade-in" style={{ gridTemplateColumns: '1fr', gap: 'var(--space-4)' }}>

                  {/* Select Account */}
                  <div className="form-group">
                    <label className="form-label">
                      Select PD Account <span className="required">*</span>
                    </label>
                    <select
                      className="form-input"
                      value={selectedPdAccount}
                      onChange={(e) => setSelectedPdAccount(e.target.value)}
                      required={accountType === 'PD'}
                      disabled={!toTreasury}
                    >
                      <option value="">-- Select PD Account --</option>
                      {filteredPdAccounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.id} - {acc.name}
                        </option>
                      ))}
                    </select>
                    {!toTreasury && (
                      <span className="w2pd-field-helper">
                        * Please select a target Treasury first to view related PD accounts.
                      </span>
                    )}
                  </div>

                  {/* Auto-Fetched Purpose Code & HoA */}
                  {selectedPdAcc && (
                    <div className="w2pd-fetched-group animate-fade-in">
                      <div className="w2pd-fetched-field">
                        <span className="w2pd-fetched-lbl">Purpose Code</span>
                        <span className="w2pd-fetched-val w2pd-code-font">{selectedPdAcc.purposeCode}</span>
                      </div>

                      <div className="w2pd-fetched-field">
                        <span className="w2pd-fetched-lbl">Purpose Name</span>
                        <span className="w2pd-fetched-val">{selectedPdAcc.purposeName}</span>
                      </div>

                      <div className="w2pd-fetched-field" style={{ gridColumn: 'span 2' }}>
                        <span className="w2pd-fetched-lbl">Registered Allowed HoAs</span>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                          {selectedPdAcc.allowedHoas.map(hoa => (
                            <span
                              key={hoa}
                              className={`badge ${selectedHoa === hoa ? 'badge-success' : 'badge-primary'}`}
                              style={{ fontFamily: 'monospace' }}
                            >
                              {hoa}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* HoA Mismatch Notification & Admin Request Flow */}
                  {hoaMismatch && selectedWork && selectedPdAcc && (
                    <div className="w2pd-alert danger animate-scale-in">
                      <div className="w2pd-alert-icon">
                        <ShieldAlert size={18} />
                      </div>
                      <div className="w2pd-alert-content">
                        <span className="w2pd-alert-title">Head of Account Mismatch</span>
                        <span>
                          The Head of Account <strong>{selectedHoa}</strong> associated with this Work ID is not listed in the allowed heads for the selected PD Account <strong>{selectedPdAcc.name}</strong>.
                        </span>

                        <div className="w2pd-action-box" style={{ marginTop: 'var(--space-2)' }}>
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                            To bypass this validation block, submit a request to link the HoA to this PD Account:
                          </span>

                          {existingPendingRequest ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-warning)', fontWeight: 600, fontSize: '12px', marginTop: '4px' }}>
                              <RefreshCw size={14} className="spin-anim" />
                              <span>Linkage Request Pending Approval ({existingPendingRequest.id})</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={handleRequestLinkage}
                              style={{ marginTop: '4px' }}
                            >
                              <Send size={12} />
                              <span>Request Deposit Admin to Add HoA</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Conditional Block: CCD & CrCD Fields */}
              {accountType !== 'PD' && (
                <div className="w2pd-form-grid-2 animate-fade-in" style={{ gridTemplateColumns: '1fr', gap: 'var(--space-4)' }}>

                  {/* Select Court HoA */}
                  <div className="form-group">
                    <label className="form-label">
                      Select Court HoA <span className="required">*</span>
                    </label>
                    <select
                      className="form-input"
                      value={selectedCourtHoa}
                      onChange={(e) => setSelectedCourtHoa(e.target.value)}
                      required
                    >
                      {COURT_HOAS.map(hoa => (
                        <option key={hoa.code} value={hoa.code}>
                          {hoa.code} - {hoa.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Purpose Code Input */}
                  <div className="form-group">
                    <label className="form-label">
                      Select / Enter Purpose Code <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={courtPurposeCode}
                      onChange={(e) => setCourtPurposeCode(e.target.value)}
                      required
                    />
                  </div>

                </div>
              )}

              {/* CTA Action Bar */}
              <div className="w2pd-submit-tray">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setWorkIdType('');
                    setSelectedWorkId('');
                    setSelectedPdAccount('');
                    setTransferAmount('');
                    setSelectedHoa('');
                  }}
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={hoaMismatch || !selectedWorkId || !transferAmount || (accountType === 'PD' && !selectedPdAccount)}
                >
                  <Check size={16} />
                  <span>Execute Fund Transfer</span>
                </button>
              </div>

            </div>
          </div>

        </form>
      )}

      {/* Tab Content 2: Deposit Admin Panel */}
      {activeTab === 'admin' && (
        <div className="w2pd-card animate-scale-in">
          <div className="w2pd-card-header">
            <div className="w2pd-card-header-title">
              <h2>Deposit Admin Approval Console</h2>
              <p>Review and authorize Head of Account linkages to Personal Deposit (PD) accounts.</p>
            </div>
            <div>
              <span className="badge badge-primary">Admin Access Only</span>
            </div>
          </div>
          <div className="w2pd-card-body">

            {linkageRequests.length === 0 ? (
              <div className="w2pd-action-box" style={{ padding: 'var(--space-8)' }}>
                <Info size={32} style={{ color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-3)' }} />
                <h3>No Pending Linkage Requests</h3>
                <p style={{ maxWidth: '450px', margin: '0 auto', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  If a DDO/BCO encounters a missing Head of Account block during Works to PD transfers, their requests will appear here for linkage authorization.
                </p>
              </div>
            ) : (
              <div className="w2pd-request-list">
                {linkageRequests.map(req => (
                  <div key={req.id} className="w2pd-request-item animate-fade-in">

                    <div className="w2pd-request-item-header">
                      <div className="w2pd-req-title">
                        Request ID: <span className="w2pd-code-font">{req.id}</span>
                      </div>
                      <span className="w2pd-date-info" style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                        Date: {req.requestDate}
                      </span>
                    </div>

                    <div className="w2pd-request-item-body">
                      <div>
                        <strong>Work ID:</strong> <span className="w2pd-code-font">{req.workId}</span>
                      </div>
                      <div>
                        <strong>DDO Code:</strong> <span className="w2pd-code-font">{req.ddoCode}</span>
                      </div>
                      <div>
                        <strong>Requested HoA:</strong> <span className="w2pd-code-font" style={{ color: 'var(--color-warning)' }}>{req.requestedHoa}</span>
                      </div>
                      <div style={{ gridColumn: 'span 3' }}>
                        <strong>Target PD Account:</strong> <span className="text-primary">{req.pdAccountId}</span> - {req.pdAccountName}
                      </div>
                    </div>

                    <div className="w2pd-request-item-footer">
                      <div>
                        <span className={`w2pd-status-pill ${req.status.toLowerCase()}`}>
                          {req.status === 'Pending' ? (
                            <>
                              <RefreshCw size={10} className="spin-anim" />
                              <span>Awaiting Authorization</span>
                            </>
                          ) : (
                            <>
                              <Check size={10} />
                              <span>Linked & Active</span>
                            </>
                          )}
                        </span>
                      </div>
                      <div>
                        {req.status === 'Pending' ? (
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleAdminApprove(req)}
                          >
                            <span>Approve & Link HoA</span>
                          </button>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-success)', fontWeight: 600 }}>
                            <Check size={14} />
                            <span>Approved by Admin</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Tab Content 3: Ledger */}
      {activeTab === 'ledger' && (
        <div className="w2pd-card animate-scale-in">
          <div className="w2pd-card-header">
            <div className="w2pd-card-header-title">
              <h2>Consolidated Works-to-PD Fund Transfer Ledger</h2>
              <p>Audit trail log of all successfully processed transactions for FY 2026-27.</p>
            </div>
          </div>
          <div className="w2pd-card-body">

            {/* Search Bar */}
            <div className="w2pd-search-bar">
              <div className="w2pd-search-input">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search by Txn Ref, Work ID, HoA or PD Account..."
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            <div className="w2pd-table-container">
              <table className="w2pd-table">
                <thead>
                  <tr>
                    <th>TXN REFERENCE</th>
                    <th>DATE & TIME</th>
                    <th>FROM WORK ID</th>
                    <th>FROM HOA</th>
                    <th>TO TREASURY</th>
                    <th>ACC TYPE</th>
                    <th>TO TARGET DETAILS</th>
                    <th style={{ textAlign: 'right' }}>AMOUNT</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransfers.map(txn => (
                    <tr key={txn.id}>
                      <td className="w2pd-code-font">{txn.id}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{txn.dateTime}</td>
                      <td>
                        <span className="w2pd-code-font">{txn.fromWorkId}</span><br />
                        <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>{txn.fromWorkType}</span>
                      </td>
                      <td className="w2pd-code-font">{txn.fromHoa}</td>
                      <td>{txn.toTreasury}</td>
                      <td>
                        <span className="badge badge-primary">{txn.toAccountType}</span>
                      </td>
                      <td>
                        {txn.toAccountId ? (
                          <>
                            <span className="w2pd-code-font">{txn.toAccountId}</span><br />
                            <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>HoA: {txn.toHoa}</span>
                          </>
                        ) : (
                          <>
                            <span>Court Remittance</span><br />
                            <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>HoA: {txn.toHoa}</span>
                          </>
                        )}
                      </td>
                      <td className="w2pd-amount-cell">
                        ₹ {txn.amount.toLocaleString('en-IN')}.00
                      </td>
                      <td>
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={10} />
                          <span>{txn.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredTransfers.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-tertiary)' }}>
                        No records match the filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
