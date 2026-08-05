import { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Filter,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Download,
  Printer,
  RefreshCw,
  Search,
  Check,
  X,
  Layers,
  Signature,
  FileCheck,
  Send,
  Database,
  Lock
} from 'lucide-react';
import './StatutoryWorksReportsScreen.css';

// --- Types & Interfaces ---
interface DDORecord {
  code: string;
  name: string;
  type: 'Active' | 'Closed' | 'Merged';
  office: string;
  division: string;
}

interface WorkRecord {
  id: string;
  name: string;
  ddoCode: string;
  headOfAccount: string;
  balance: number;
}

interface ReportTemplate {
  code: string;
  title: string;
  description: string;
  fields: string[];
}

interface MonthlySubmission {
  id: string;
  month: string;
  ddoCode: string;
  signedDate: string;
  status: 'Submitted' | 'VLC Sync Complete';
  signedBy: string;
  vlcStatus: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  actionType: 'Report' | 'Submission' | 'System';
  details: string;
}

// --- Seed Data ---
const DDO_LIST: DDORecord[] = [
  { code: 'DDO-RES-INDORE-01', name: 'Indore Rural Engineering Service', type: 'Active', office: 'RES Div Indore', division: 'Indore' },
  { code: 'DDO-WORKS-BHOPAL-02', name: 'Bhopal Works Public Works Department', type: 'Active', office: 'PWD Bhopal Div-1', division: 'Bhopal' },
  { code: 'DDO-RES-JABAL-04', name: 'Jabalpur Rural Engineering Service', type: 'Active', office: 'RES Div Jabalpur', division: 'Jabalpur' },
  { code: 'DDO-CLOSED-UJJAIN-09', name: 'Ujjain PWD Division No 3 (Old)', type: 'Closed', office: 'PWD Ujjain', division: 'Ujjain' },
  { code: 'DDO-MERGED-GWALI-07', name: 'Gwalior Irrigation Sub-Division C', type: 'Merged', office: 'WRD Gwalior', division: 'Gwalior' }
];

const WORKS_LIST: WorkRecord[] = [
  { id: 'WRK-2026-RES-001', name: 'RES Road construction Pithampur Phase 2', ddoCode: 'DDO-RES-INDORE-01', headOfAccount: '8443-00-111-0040', balance: 4200000 },
  { id: 'WRK-2026-RES-002', name: 'District Hospital Building Annex Maintenance', ddoCode: 'DDO-RES-INDORE-01', headOfAccount: '8443-00-111-0040', balance: 1850000 },
  { id: 'WRK-2026-PWD-010', name: 'PWD Bhopal Highway Bypass Flyover', ddoCode: 'DDO-WORKS-BHOPAL-02', headOfAccount: '8443-00-108-0000', balance: 12450000 },
  { id: 'WRK-2026-PWD-011', name: 'VIP Road Retaining Wall Refortification', ddoCode: 'DDO-WORKS-BHOPAL-02', headOfAccount: '8443-00-108-0000', balance: 950000 },
  { id: 'WRK-2026-RES-050', name: 'RES Primary School building block Jabalpur', ddoCode: 'DDO-RES-JABAL-04', headOfAccount: '8443-00-111-0040', balance: 3200000 }
];

const REPORT_TEMPLATES: ReportTemplate[] = [
  { code: 'Form 80', title: 'Statement of Works Deposit Balances', description: 'Monthly statement showing the balances of security deposits, contractor cash deposits, and other works accounts.', fields: ['Work ID', 'Opening Balance', 'Receipts', 'Disbursements', 'Closing Balance'] },
  { code: 'Form 46A', title: 'Certificate of Treasury Receipt', description: 'Statutory verification certificate confirming cash receipts and challan remittances matching treasury scroll ledger entries.', fields: ['Challan No', 'Remittance Head', 'Treasury Date', 'Verified Amount', 'Status'] },
  { code: 'Form 64', title: 'Register of Works Deposits', description: 'Comprehensive registry of deposit receipts, refunds, and transfer credits mapped under specific DDOs.', fields: ['Deposit Head', 'Challan Ref', 'Receipt Date', 'Depositor Name', 'Amount'] },
  { code: 'Form 74', title: 'Schedule of Works Expenditure', description: 'Schedule comparing actual expenditure incurred against the budgeted grants for works.', fields: ['Work ID', 'Sanctioned Budget', 'Monthly Exp', 'Cumulative Exp', 'Savings'] },
  { code: 'Form 65', title: 'Detailed Statement of Works Deposits', description: 'Detailed account showing item-wise transactions and balance breakdowns for individual works contractors.', fields: ['Work ID', 'Contractor Name', 'Challan Balances', 'Total Credit', 'Total Debit'] },
  { code: 'Form 79', title: 'Statement of Suspense Balances', description: 'Balances held under various suspense accounts pending final settlement or head allocation.', fields: ['Suspense Head', 'Opening Bal', 'Debit', 'Credit', 'Closing Bal'] },
  { code: 'Form 61', title: 'Register of By-Transfer Adjustments', description: 'Registry tracking adjustments and head rectifications.', fields: ['Voucher Ref', 'Original Head', 'Corrected Head', 'Adjusted Amount', 'Reason'] },
  { code: 'Form 5', title: 'Abstract of Major Head Receipts', description: 'Summary of monthly receipts categorized by Major Head accounts.', fields: ['Major Head', 'Budget Receipts', 'Non-Budget Receipts', 'Total Receipts'] },
  { code: 'Form 77', title: 'Schedule of Remittances', description: 'Detailed schedule of remittances made to Treasury or Bank by the Works divisions.', fields: ['Remittance Date', 'Remittance Type', 'Treasury Code', 'Challan Total', 'Status'] },
  { code: 'Form 51', title: 'Register of Cheque Books Issued', description: 'Audit list of cheque books requisitioned, received, and dispatched.', fields: ['Cheque Book No', 'Leaf Count', 'Date Issued', 'Authorized Officer', 'Status'] },
  { code: 'Form 83', title: 'Consolidated Schedule of Debt Heads', description: 'Monthly consolidated list of debits/credits mapped to Debt and Remittance heads.', fields: ['Head description', 'Debit Total', 'Credit Total', 'Net Balance'] },
  { code: 'CTR', title: 'Consolidated Treasury Receipt Report', description: 'Statutory ledger compilation of all challans generated and accepted in the division.', fields: ['Treasury Scroll No', 'Scroll Date', 'Challan Count', 'Aggregate Value', 'Audit Status'] },
  { code: 'Cheque Drawn', title: 'Cheque Drawn Details Report', description: 'Register of cheques issued for expenditure, contractor payments, and PD drawings.', fields: ['Cheque No', 'Issue Date', 'Payee Name', 'Purpose', 'Amount'] },
  { code: 'CIC', title: 'Cheque Issuance Certificate', description: 'Division-level certificate verifying the total range and volume of cheques drawn vs treasury registers.', fields: ['Month', 'Cheque Range From', 'Cheque Range To', 'Total Issued Value', 'Status'] },
  { code: 'Income Tax', title: 'Income Tax (TDS) Works Report', description: 'Details of TDS deductions made from payments to contractors and consultants.', fields: ['PAN Card', 'Contractor Name', 'Gross Bill Amount', 'TDS Amount deducted', 'Challan Ref'] },
  { code: 'Work ID Balances', title: 'Work ID-wise Challan Balances', description: 'Detailed ledger showing Work IDs and their corresponding challan-wise balances, verifying primary account accuracy.', fields: ['Work ID', 'Challan No', 'Depositor Name', 'Transaction Date', 'Balance Amount'] }
];

export default function StatutoryWorksReportsScreen() {
  // --- States ---
  const [userRole, setUserRole] = useState<'DDO' | 'BCO' | 'AG'>('DDO');
  const [activeTab, setActiveTab] = useState<'generator' | 'submissions' | 'audit'>('generator');
  
  // Filter States
  const [ddoStatus, setDdoStatus] = useState<'Active' | 'Closed' | 'Merged'>('Active');
  const [selectedDdo, setSelectedDdo] = useState<string>('DDO-RES-INDORE-01');
  const [fromDate, setFromDate] = useState<string>('2026-06-01');
  const [toDate, setToDate] = useState<string>('2026-06-30');
  const [financialYear, setFinancialYear] = useState<string>('2026-27');
  const [selectedWorkId, setSelectedWorkId] = useState<string>('ALL');
  const [headOfAccount, setHeadOfAccount] = useState<string>('ALL');
  
  // Selection of active report template
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(REPORT_TEMPLATES[0]);
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);
  
  // Monthly Submissions State
  const [submissions, setSubmissions] = useState<MonthlySubmission[]>([
    { id: 'SUB-2026-04', month: 'April 2026', ddoCode: 'DDO-RES-INDORE-01', signedDate: '2026-05-02 11:30:15', status: 'VLC Sync Complete', signedBy: 'DDO Officer Indore', vlcStatus: 'Accepted' },
    { id: 'SUB-2026-05', month: 'May 2026', ddoCode: 'DDO-RES-INDORE-01', signedDate: '2026-06-02 15:45:00', status: 'VLC Sync Complete', signedBy: 'DDO Officer Indore', vlcStatus: 'Accepted' }
  ]);
  
  // Digital signing popup animation state
  const [isSigning, setIsSigning] = useState(false);
  const [signingProgress, setSigningProgress] = useState(0);
  const [signingStep, setSigningStep] = useState<'verify' | 'pin' | 'complete'>('verify');
  const [signingDscPin, setSigningDscPin] = useState('');
  const [signingMonth, setSigningMonth] = useState('June 2026');
  
  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 'AUD-9021', timestamp: '2026-06-16 09:15:30', user: 'Indore DDO User', role: 'DDO', actionType: 'Report', details: 'Form 80 (Statement of Works Deposit Balances) generated for DDO-RES-INDORE-01.' },
    { id: 'AUD-9023', timestamp: '2026-06-02 15:45:00', user: 'Indore DDO User', role: 'DDO', actionType: 'Submission', details: 'May 2026 accounts signed digitally and submitted to AGMP Bhopal.' }
  ]);
  
  // Search state for filters
  const [auditSearch, setAuditSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);
  
  const filteredDDOs = useMemo(() => {
    return DDO_LIST.filter(d => d.type === ddoStatus);
  }, [ddoStatus]);

  const selectedDdoDetails = useMemo(() => {
    return DDO_LIST.find(d => d.code === selectedDdo) || null;
  }, [selectedDdo]);

  // Sync selected DDO when DDO Status changes for AG/BCO
  useEffect(() => {
    if (userRole === 'BCO' || userRole === 'AG') {
      if (filteredDDOs.length > 0) {
        setSelectedDdo(filteredDDOs[0].code);
      } else {
        setSelectedDdo('');
      }
    }
  }, [ddoStatus, userRole, filteredDDOs]);

  // Adjust filters when user changes role
  useEffect(() => {
    if (userRole === 'DDO') {
      setSelectedDdo('DDO-RES-INDORE-01');
    }
  }, [userRole]);

  // Toast notifier
  const showToast = (type: 'success' | 'warning' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // --- Report Generator logic ---
  const handleGenerateReport = () => {
    if (!selectedDdo) {
      showToast('error', 'Please select a DDO to generate the report.');
      return;
    }

    const ddoDetails = DDO_LIST.find(d => d.code === selectedDdo);
    
    // Calculate values representing the reports
    let reportDataRows: any[] = [];
    let grandTotals: any = {};

    if (selectedTemplate.code === 'Form 80') {
      const filteredWorks = WORKS_LIST.filter(w => selectedWorkId === 'ALL' || w.id === selectedWorkId);
      
      let totalOpen = 0;
      let totalReceipts = 0;
      let totalDisb = 0;
      let totalClose = 0;

      reportDataRows = filteredWorks.map((w) => {
        // Base amounts
        let openingBal = w.balance * 0.9;
        let receipts = w.balance * 0.15;
        let disbursements = w.balance * 0.05;
        let closingBal = openingBal + receipts - disbursements;

        totalOpen += openingBal;
        totalReceipts += receipts;
        totalDisb += disbursements;
        totalClose += closingBal;

        return {
          workId: w.id,
          workName: w.name,
          openingBal,
          receipts,
          disbursements,
          closingBal
        };
      });

      grandTotals = {
        openingBal: totalOpen,
        receipts: totalReceipts,
        disbursements: totalDisb,
        closingBal: totalClose
      };
    } else if (selectedTemplate.code === 'Form 64') {
      reportDataRows = [
        { depHead: '8443-00-111-0040 (Security Deposits)', challanRef: 'CHLN-2026-902', date: '2026-06-05', depositor: 'Apex Infra Projects Ltd.', amount: 150000 },
        { depHead: '8443-00-111-0040 (Security Deposits)', challanRef: 'CHLN-2026-908', date: '2026-06-12', depositor: 'Shree Balaji Constructions', amount: 80000 },
        { depHead: '8443-00-108-0000 (Civil Deposits)', challanRef: 'CHLN-2026-915', date: '2026-06-14', depositor: 'R. K. Enterprises', amount: 120000 }
      ];
      grandTotals = { amount: 350000 };
    } else if (selectedTemplate.code === 'Form 65') {
      reportDataRows = [
        { workId: 'WRK-2026-RES-001', contractor: 'Apex Infra Projects Ltd.', challanCount: 3, credit: 550000, debit: 120000 },
        { workId: 'WRK-2026-RES-002', contractor: 'Shree Balaji Constructions', challanCount: 2, credit: 320000, debit: 50000 }
      ];
      grandTotals = { credit: 870000, debit: 170000 };
    } else if (selectedTemplate.code === 'Form 46A') {
      reportDataRows = [
        { challanNo: 'CHLN-2026-902', head: '8443-00-111-0040', treasuryDate: '2026-06-06', amount: 150000, status: 'Treasury Verified' },
        { challanNo: 'CHLN-2026-908', head: '8443-00-111-0040', treasuryDate: '2026-06-13', amount: 80000, status: 'Treasury Verified' },
        { challanNo: 'CHLN-2026-915', head: '8443-00-108-0000', treasuryDate: '2026-06-15', amount: 120000, status: 'Reconciliation Pending' }
      ];
      grandTotals = { amount: 350000 };
    } else if (selectedTemplate.code === 'CTR') {
      reportDataRows = [
        { scrollNo: 'TS-2026-06-004', scrollDate: '2026-06-05', challans: 5, totalValue: 420000, status: 'Audited & Reconciled' },
        { scrollNo: 'TS-2026-06-011', scrollDate: '2026-06-12', challans: 3, totalValue: 280000, status: 'Audited & Reconciled' }
      ];
      grandTotals = { totalValue: 700000 };
    } else if (selectedTemplate.code === 'CIC') {
      reportDataRows = [
        { month: 'June 2026', rangeFrom: 'CQ-802100', rangeTo: 'CQ-802145', totalValue: 1850000, status: 'Active & Certified' }
      ];
      grandTotals = { totalValue: 1850000 };
    } else if (selectedTemplate.code === 'Work ID Balances') {
      reportDataRows = [
        { workId: 'WRK-2026-RES-001', challanNo: 'CHLN-SD-201', depositor: 'Apex Infra Projects Ltd.', date: '2026-04-10', balance: 1500000 },
        { workId: 'WRK-2026-RES-001', challanNo: 'CHLN-SD-205', depositor: 'Apex Infra Projects Ltd.', date: '2026-05-18', balance: 2700000 },
        { workId: 'WRK-2026-RES-002', challanNo: 'CHLN-SD-304', depositor: 'District Building Corp', date: '2026-05-12', balance: 1850000 },
        { workId: 'WRK-2026-PWD-010', challanNo: 'CHLN-WD-441', depositor: 'VIP Infra Limited', date: '2026-05-22', balance: 12450000 }
      ].filter(r => selectedWorkId === 'ALL' || r.workId === selectedWorkId);
      
      grandTotals = { balance: reportDataRows.reduce((sum, r) => sum + r.balance, 0) };
    } else if (selectedTemplate.code === 'Form 61') {
      const mockData = [
        { ref: 'VCH-2026-6101', origHead: '8443-00-111-0040', corrHead: '8443-00-108-0000', amount: 150000, reason: 'Correction of wrong head posting' },
        { ref: 'VCH-2026-6102', origHead: '8443-00-108-0000', corrHead: '8782-00-102-0000', amount: 95000, reason: 'Transfer debit adjustment' },
        { ref: 'VCH-2026-6103', origHead: '8782-00-102-0000', corrHead: '8443-00-111-0040', amount: 280000, reason: 'Remittance head rectification' },
        { ref: 'VCH-2026-6104', origHead: '8443-00-111-0040', corrHead: '8782-00-102-0000', amount: 62000, reason: 'By-transfer ledger rectification' }
      ];
      reportDataRows = mockData.filter(
        r => headOfAccount === 'ALL' || r.origHead === headOfAccount || r.corrHead === headOfAccount
      );
      grandTotals = { amount: reportDataRows.reduce((sum, r) => sum + r.amount, 0) };
    } else {
      reportDataRows = [
        { col1: 'Account Group A', col2: 'Rs. 2,400,000', col3: 'Rs. 400,000', col4: 'Rs. 2,000,000', col5: 'Active' },
        { col1: 'Account Group B', col2: 'Rs. 1,200,000', col3: 'Rs. 300,000', col4: 'Rs. 900,000', col5: 'Active' }
      ];
      grandTotals = { col2: 3600000, col3: 700000, col4: 2900000 };
    }

    setGeneratedReport({
      templateCode: selectedTemplate.code,
      templateTitle: selectedTemplate.title,
      ddoCode: selectedDdo,
      ddoName: ddoDetails ? ddoDetails.name : 'Unknown DDO',
      ddoDivision: ddoDetails ? ddoDetails.division : '',
      fy: financialYear,
      dates: `${fromDate} to ${toDate}`,
      rows: reportDataRows,
      totals: grandTotals,
      timestamp: new Date().toLocaleString()
    });

    const newAuditLog: AuditLog = {
      id: 'AUD-' + Math.floor(9000 + Math.random() * 1000),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: `${userRole === 'DDO' ? 'Indore DDO User' : userRole === 'BCO' ? 'BCO Officer' : 'AG Reviewer'}`,
      role: userRole,
      actionType: 'Report',
      details: `${selectedTemplate.code} generated successfully for DDO ${selectedDdo}.`
    };
    setAuditLogs([newAuditLog, ...auditLogs]);
    showToast('success', `${selectedTemplate.code} generated successfully.`);
  };

  // Mock export reports
  const handleExport = (format: 'PDF' | 'EXCEL') => {
    if (!generatedReport) return;
    showToast('success', `Exported ${generatedReport.templateCode} report to ${format} successfully.`);
  };

  const handlePrint = () => {
    if (!generatedReport) return;
    showToast('success', `Triggered system printer queue for ${generatedReport.templateCode}.`);
  };

  // --- Monthly Submission / Digital Signing Handler ---
  const handleStartDigitalSigning = () => {
    setSigningStep('verify');
    setIsSigning(true);
    setSigningProgress(0);
  };

  const executeSigningProcess = () => {
    if (signingDscPin !== '123456') {
      showToast('error', 'Invalid DSC Certificate PIN. Please use mock PIN "123456".');
      return;
    }

    setSigningStep('complete');
    
    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      setSigningProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        
        const newSub: MonthlySubmission = {
          id: 'SUB-2026-' + Math.floor(10 + Math.random()*90),
          month: signingMonth,
          ddoCode: 'DDO-RES-INDORE-01',
          signedDate: new Date().toISOString().replace('T', ' ').slice(0, 19),
          status: 'Submitted',
          signedBy: 'DDO Officer Indore (DSC-Class-3)',
          vlcStatus: 'VLC Sync Pending'
        };
        
        setSubmissions(prev => [newSub, ...prev]);

        setTimeout(() => {
          setSubmissions(prev => prev.map(s => {
            if (s.id === newSub.id) {
              return { ...s, status: 'VLC Sync Complete', vlcStatus: 'Accepted' };
            }
            return s;
          }));
          
          const vlcAuditLog: AuditLog = {
            id: 'AUD-' + Math.floor(9000 + Math.random() * 1000),
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            user: 'System Link (VLC)',
            role: 'System',
            actionType: 'System',
            details: `Submission ${newSub.id} for Month ${newSub.month} successfully synchronized with Gwalior VLC ledger database.`
          };
          setAuditLogs(prev => [vlcAuditLog, ...prev]);
        }, 3000);

        const newAuditLog: AuditLog = {
          id: 'AUD-' + Math.floor(9000 + Math.random() * 1000),
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          user: 'DDO Officer Indore',
          role: 'DDO',
          actionType: 'Submission',
          details: `Works Accounts for ${signingMonth} signed digitally using Class-3 certificate. Submitted to AGMP Bhopal.`
        };
        setAuditLogs(prev => [newAuditLog, ...prev]);
        
        showToast('success', `Works Account for ${signingMonth} submitted and signed digitally. Reconciling VLC sync in background.`);
        
        setTimeout(() => {
          setIsSigning(false);
          setSigningDscPin('');
        }, 1500);
      }
    }, 250);
  };

  const filteredAuditLogs = auditLogs.filter(log => {
    const term = auditSearch.toLowerCase();
    return (
      log.details.toLowerCase().includes(term) ||
      log.user.toLowerCase().includes(term) ||
      log.role.toLowerCase().includes(term) ||
      log.actionType.toLowerCase().includes(term)
    );
  });

  return (
    <div className="reports-screen animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`sd-toast animate-scale-in ${toastMessage.type}`}>
          <div className="sd-toast-icon">
            {toastMessage.type === 'success' && <Check size={18} />}
            {toastMessage.type === 'warning' && <AlertTriangle size={18} />}
            {toastMessage.type === 'error' && <X size={18} />}
          </div>
          <div className="sd-toast-text">{toastMessage.text}</div>
        </div>
      )}

      {/* Role Switcher & Header Panel */}
      <div className="reports-header-container">
        <div className="reports-header-top">
          <div className="reports-header-title">
            <div className="reports-header-tag">
              <span>MP Treasury Code 2020 Compliance</span>
            </div>
            <h1>Statutory & Works Accounts Reports Generator</h1>
            <p>
              Automatically construct and query statutory works financial records (Forms 64, 65, 80, 46A, CTR, and CIC) alongside challan balance details. Access is restricted and configured dynamically by role mapping.
            </p>
          </div>

          {/* Role Switcher */}
          <div className="role-selector-wrapper">
            <span className="role-selector-label">Verify Role Mappings & Access Control</span>
            <div className="role-selector-pills">
              <button
                className={`role-pill ddo ${userRole === 'DDO' ? 'active' : ''}`}
                onClick={() => setUserRole('DDO')}
              >
                <UserCheck size={14} />
                <span>DDO View</span>
              </button>
              <button
                className={`role-pill bco ${userRole === 'BCO' ? 'active' : ''}`}
                onClick={() => setUserRole('BCO')}
              >
                <UserCheck size={14} />
                <span>BCO View</span>
              </button>
              <button
                className={`role-pill ag ${userRole === 'AG' ? 'active' : ''}`}
                onClick={() => setUserRole('AG')}
              >
                <UserCheck size={14} />
                <span>AG View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic header summary stats */}
        <div className="reports-header-stats">
          <div className="stat-item">
            <div className="stat-icon-box primary">
              <FileText size={18} />
            </div>
            <div className="stat-content">
              <span className="stat-lbl">Configured Forms</span>
              <span className="stat-val">{REPORT_TEMPLATES.length} Form Types</span>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon-box warning">
              <RefreshCw size={18} />
            </div>
            <div className="stat-content">
              <span className="stat-lbl">Verified Projects</span>
              <span className="stat-val">5 Active Projects</span>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon-box success">
              <FileCheck size={18} />
            </div>
            <div className="stat-content">
              <span className="stat-lbl">Signed Account Status</span>
              <span className="stat-val">Month of May Submitted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="reports-tabs">
        <button
          className={`reports-tab ${activeTab === 'generator' ? 'active' : ''}`}
          onClick={() => setActiveTab('generator')}
        >
          <Database size={16} />
          <span>1. Reports Generator</span>
        </button>
        <button
          className={`reports-tab ${activeTab === 'submissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('submissions')}
        >
          <Signature size={16} />
          <span>2. Monthly submission & Digital Sign</span>
          <span className="tab-indicator">{submissions.length}</span>
        </button>
        <button
          className={`reports-tab ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <Layers size={16} />
          <span>3. Audit Trail</span>
          <span className="tab-indicator">{auditLogs.length}</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="reports-tab-content">
        
        {/* --- TAB 1: REPORTS GENERATOR --- */}
        {activeTab === 'generator' && (
          <div className="reports-layout-grid animate-fade-in">
            {/* Left side filters panel */}
            <div className="sidebar-filters-box">
              <div className="filter-card">
                <span className="filter-card-title">
                  <Filter size={16} />
                  <span>Report Selector & Parameters</span>
                </span>
                
                <div className="filter-form-gap">

                  {(userRole === 'BCO' || userRole === 'AG') && (
                    <>
                      <div className="form-group animate-fade-in">
                        <label className="form-label">DDO State Status</label>
                        <div className="ddo-status-toggle">
                          <button
                            type="button"
                            className={`ddo-status-btn ${ddoStatus === 'Active' ? 'active' : ''}`}
                            onClick={() => setDdoStatus('Active')}
                          >
                            Active
                          </button>
                          <button
                            type="button"
                            className={`ddo-status-btn ${ddoStatus === 'Closed' ? 'active' : ''}`}
                            onClick={() => setDdoStatus('Closed')}
                          >
                            Closed
                          </button>
                          <button
                            type="button"
                            className={`ddo-status-btn ${ddoStatus === 'Merged' ? 'active' : ''}`}
                            onClick={() => setDdoStatus('Merged')}
                          >
                            Merged
                          </button>
                        </div>
                      </div>

                      <div className="form-group animate-fade-in">
                        <label className="form-label">Select DDO Office <span className="required">*</span></label>
                        <select
                          className="form-input"
                          value={selectedDdo}
                          onChange={(e) => setSelectedDdo(e.target.value)}
                          required
                        >
                          <option value="">-- Select DDO Office --</option>
                          {filteredDDOs.map(ddo => (
                            <option key={ddo.code} value={ddo.code}>
                              {ddo.office} ({ddo.code})
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {selectedDdo && selectedDdoDetails && (
                    <div className="w2pd-fetched-group animate-fade-in" style={{
                      background: 'var(--color-bg)',
                      border: '1px solid var(--color-border-light)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-3) var(--space-4)',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1.5fr',
                      gap: 'var(--space-3)',
                      marginBottom: 'var(--space-3)'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', fontWeight: 700 }}>
                          {userRole === 'DDO' ? 'DDO Code (Auto-Fetched from User Login)' : 'DDO Code (Auto-Fetched)'}
                        </span>
                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', fontWeight: 600, fontFamily: 'monospace' }}>{selectedDdoDetails.code}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', fontWeight: 700 }}>
                          {userRole === 'DDO' ? 'DDO Name (Auto-Fetched from User Login)' : 'DDO Name (Auto-Fetched)'}
                        </span>
                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{selectedDdoDetails.name}</span>
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Report Type <span className="required">*</span></label>
                    <select
                      className="form-input"
                      value={selectedTemplate.code}
                      onChange={(e) => {
                        const template = REPORT_TEMPLATES.find(t => t.code === e.target.value);
                        if (template) {
                          setSelectedTemplate(template);
                        }
                      }}
                      required
                    >
                      {REPORT_TEMPLATES.map(t => (
                        <option key={t.code} value={t.code}>
                          {t.code} - {t.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Scope selection */}
                  <div className="sd-form-grid-2">
                    <div className="form-group">
                      <label className="form-label">From Date Scope</label>
                      <input type="date" className="form-input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">To Date Scope</label>
                      <input type="date" className="form-input" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                    </div>
                  </div>

                  <div className="sd-form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Financial Year</label>
                      <select className="form-input" value={financialYear} onChange={(e) => setFinancialYear(e.target.value)}>
                        <option value="2026-27">2026-27</option>
                        <option value="2025-26">2025-26</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Filter Work ID</label>
                      <select className="form-input" value={selectedWorkId} onChange={(e) => setSelectedWorkId(e.target.value)}>
                        <option value="ALL">ALL Projects</option>
                        {WORKS_LIST.filter(w => w.ddoCode === selectedDdo).map(w => (
                          <option key={w.id} value={w.id}>{w.id}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Form 61 specific Head filter */}
                  {selectedTemplate.code === 'Form 61' && (
                    <div className="form-group animate-scale-in">
                      <label className="form-label">Head of Account (Form 61 filter) <span className="required">*</span></label>
                      <select className="form-input" value={headOfAccount} onChange={(e) => setHeadOfAccount(e.target.value)}>
                        <option value="ALL">ALL Heads</option>
                        <option value="8443-00-111-0040">8443-00-111-0040 (Security Deposits)</option>
                        <option value="8443-00-108-0000">8443-00-108-0000 (Civil Deposits)</option>
                        <option value="8782-00-102-0000">8782-00-102-0000 (Forest Remittance)</option>
                      </select>
                    </div>
                  )}

                  <button
                    className="btn btn-primary"
                    style={{ marginTop: 'var(--space-2)' }}
                    onClick={handleGenerateReport}
                  >
                    <RefreshCw size={14} />
                    <span>Compile & Generate Report</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right side report preview sheet */}
            <div className="report-view-container">
              {generatedReport ? (
                <div className="reports-card animate-scale-in">
                  <div className="reports-card-header">
                    <div className="preview-actions-left">
                      <h3>Generated Preview</h3>
                      <p>Data compiled on {generatedReport.timestamp}</p>
                    </div>
                    
                    <div className="preview-actions-right">
                      <button className="btn btn-sm btn-secondary" onClick={() => handleExport('EXCEL')}>
                        <Download size={12} />
                        <span>Excel</span>
                      </button>
                      <button className="btn btn-sm btn-secondary" onClick={() => handleExport('PDF')}>
                        <Download size={12} />
                        <span>PDF</span>
                      </button>
                      <button className="btn btn-sm btn-secondary" onClick={handlePrint}>
                        <Printer size={12} />
                        <span>Print</span>
                      </button>
                    </div>
                  </div>

                  <div className="reports-card-body" style={{ background: 'var(--color-bg)' }}>
                    <div className="document-sheet-container">
                      <div className="document-watermark">{generatedReport.templateCode}</div>
                      
                      <div className="document-sheet-header">
                        <div className="govt-logo-mock">IFMIS MP</div>
                        <h2>Government of Madhya Pradesh</h2>
                        <h3>{generatedReport.templateTitle} ({generatedReport.templateCode})</h3>
                        
                        <div className="document-meta-grid">
                          <div className="meta-field">
                            <span>DDO Division</span>
                            <strong>{generatedReport.ddoDivision || 'General Division'}</strong>
                          </div>
                          <div className="meta-field">
                            <span>DDO Code</span>
                            <strong className="code-font">{generatedReport.ddoCode}</strong>
                          </div>
                          <div className="meta-field">
                            <span>Financial Scope</span>
                            <strong>FY {generatedReport.fy} ({generatedReport.dates})</strong>
                          </div>
                        </div>
                      </div>

                      <div className="document-sheet-body">
                        {generatedReport.templateCode === 'Form 80' && (
                          <table className="document-table">
                            <thead>
                              <tr>
                                <th>Work ID</th>
                                <th>Project Name</th>
                                <th style={{ textAlign: 'right' }}>Opening Balance (Rs.)</th>
                                <th style={{ textAlign: 'right' }}>Receipts Credits (Rs.)</th>
                                <th style={{ textAlign: 'right' }}>Refunds Debits (Rs.)</th>
                                <th style={{ textAlign: 'right' }}>Closing Balance (Rs.)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {generatedReport.rows.map((row: any) => (
                                <tr key={row.workId}>
                                  <td className="code-font">{row.workId}</td>
                                  <td>{row.workName}</td>
                                  <td style={{ textAlign: 'right' }}>{row.openingBal.toLocaleString('en-IN')}</td>
                                  <td style={{ textAlign: 'right' }}>{row.receipts.toLocaleString('en-IN')}</td>
                                  <td style={{ textAlign: 'right' }}>{row.disbursements.toLocaleString('en-IN')}</td>
                                  <td style={{ textAlign: 'right' }} className="code-font"><strong>{row.closingBal.toLocaleString('en-IN')}</strong></td>
                                </tr>
                              ))}
                              <tr className="table-total">
                                <td colSpan={2}>GRAND TOTAL (CONSOLIDATED)</td>
                                <td style={{ textAlign: 'right' }}>{generatedReport.totals.openingBal.toLocaleString('en-IN')}</td>
                                <td style={{ textAlign: 'right' }}>{generatedReport.totals.receipts.toLocaleString('en-IN')}</td>
                                <td style={{ textAlign: 'right' }}>{generatedReport.totals.disbursements.toLocaleString('en-IN')}</td>
                                <td style={{ textAlign: 'right' }} className="code-font">{generatedReport.totals.closingBal.toLocaleString('en-IN')}</td>
                              </tr>
                            </tbody>
                          </table>
                        )}

                        {generatedReport.templateCode === 'Form 64' && (
                          <table className="document-table">
                            <thead>
                              <tr>
                                <th>Major/Sub-deposit Head</th>
                                <th>Challan Reference</th>
                                <th>Receipt Date</th>
                                <th>Depositor Details</th>
                                <th style={{ textAlign: 'right' }}>Amount Posted (Rs.)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {generatedReport.rows.map((row: any, i: number) => (
                                <tr key={i}>
                                  <td className="code-font">{row.depHead}</td>
                                  <td className="code-font">{row.challanRef}</td>
                                  <td>{row.date}</td>
                                  <td>{row.depositor}</td>
                                  <td style={{ textAlign: 'right' }}>{row.amount.toLocaleString('en-IN')}</td>
                                </tr>
                              ))}
                              <tr className="table-total">
                                <td colSpan={4}>TOTAL REGISTER CREDITS</td>
                                <td style={{ textAlign: 'right' }}>{generatedReport.totals.amount.toLocaleString('en-IN')}</td>
                              </tr>
                            </tbody>
                          </table>
                        )}

                        {generatedReport.templateCode === 'Form 65' && (
                          <table className="document-table">
                            <thead>
                              <tr>
                                <th>Contractor Associated Work ID</th>
                                <th>Contractor Firm Name</th>
                                <th style={{ textAlign: 'center' }}>Total Challans Linked</th>
                                <th style={{ textAlign: 'right' }}>Aggregate Credit (Rs.)</th>
                                <th style={{ textAlign: 'right' }}>Aggregate Debit (Rs.)</th>
                                <th style={{ textAlign: 'right' }}>Net Balance (Rs.)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {generatedReport.rows.map((row: any, i: number) => (
                                <tr key={i}>
                                  <td className="code-font">{row.workId}</td>
                                  <td>{row.contractor}</td>
                                  <td style={{ textAlign: 'center' }}>{row.challanCount}</td>
                                  <td style={{ textAlign: 'right' }}>{row.credit.toLocaleString('en-IN')}</td>
                                  <td style={{ textAlign: 'right' }}>{row.debit.toLocaleString('en-IN')}</td>
                                  <td style={{ textAlign: 'right' }} className="code-font">{(row.credit - row.debit).toLocaleString('en-IN')}</td>
                                </tr>
                              ))}
                              <tr className="table-total">
                                <td colSpan={3}>GRAND TOTALS</td>
                                <td style={{ textAlign: 'right' }}>{generatedReport.totals.credit.toLocaleString('en-IN')}</td>
                                <td style={{ textAlign: 'right' }}>{generatedReport.totals.debit.toLocaleString('en-IN')}</td>
                                <td style={{ textAlign: 'right' }} className="code-font">{(generatedReport.totals.credit - generatedReport.totals.debit).toLocaleString('en-IN')}</td>
                              </tr>
                            </tbody>
                          </table>
                        )}

                        {generatedReport.templateCode === 'Form 46A' && (
                          <table className="document-table">
                            <thead>
                              <tr>
                                <th>Challan Identification</th>
                                <th>Head of Account</th>
                                <th>Treasury Date</th>
                                <th style={{ textAlign: 'right' }}>Challan Amount (Rs.)</th>
                                <th>Treasury Scroll Reconciliation Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {generatedReport.rows.map((row: any, i: number) => (
                                <tr key={i}>
                                  <td className="code-font">{row.challanNo}</td>
                                  <td className="code-font">{row.head}</td>
                                  <td>{row.treasuryDate}</td>
                                  <td style={{ textAlign: 'right' }}>{row.amount.toLocaleString('en-IN')}</td>
                                  <td>
                                    <span className={`badge ${row.status.includes('Verified') ? 'badge-success' : 'badge-warning'}`}>
                                      {row.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              <tr className="table-total">
                                <td colSpan={3}>TOTAL REMITTED FUNDS CERTIFIED</td>
                                <td style={{ textAlign: 'right' }}>{generatedReport.totals.amount.toLocaleString('en-IN')}</td>
                                <td>Fully Accounted</td>
                              </tr>
                            </tbody>
                          </table>
                        )}

                        {generatedReport.templateCode === 'CTR' && (
                          <table className="document-table">
                            <thead>
                              <tr>
                                <th>Treasury Scroll Identifier</th>
                                <th>Scroll Date</th>
                                <th style={{ textAlign: 'center' }}>Total Challans Included</th>
                                <th style={{ textAlign: 'right' }}>Aggregate Scroll Value (Rs.)</th>
                                <th>Audit Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {generatedReport.rows.map((row: any, i: number) => (
                                <tr key={i}>
                                  <td className="code-font">{row.scrollNo}</td>
                                  <td>{row.scrollDate}</td>
                                  <td style={{ textAlign: 'center' }}>{row.challans}</td>
                                  <td style={{ textAlign: 'right' }}>{row.totalValue.toLocaleString('en-IN')}</td>
                                  <td><span className="badge badge-success">{row.status}</span></td>
                                </tr>
                              ))}
                              <tr className="table-total">
                                <td colSpan={3}>TOTAL TREASURY REMITTANCE SCROLL AGGREGATE</td>
                                <td style={{ textAlign: 'right' }}>{generatedReport.totals.totalValue.toLocaleString('en-IN')}</td>
                                <td>Reconciled</td>
                              </tr>
                            </tbody>
                          </table>
                        )}

                        {generatedReport.templateCode === 'Work ID Balances' && (
                          <table className="document-table">
                            <thead>
                              <tr>
                                <th>Work ID</th>
                                <th>Challan No</th>
                                <th>Contractor/Depositor Details</th>
                                <th>Challan Date</th>
                                <th style={{ textAlign: 'right' }}>Challan Balance (Rs.)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {generatedReport.rows.map((row: any, i: number) => (
                                <tr key={i}>
                                  <td className="code-font">{row.workId}</td>
                                  <td className="code-font">{row.challanNo}</td>
                                  <td>{row.depositor}</td>
                                  <td>{row.date}</td>
                                  <td style={{ textAlign: 'right' }}>{row.balance.toLocaleString('en-IN')}</td>
                                </tr>
                              ))}
                              <tr className="table-total">
                                <td colSpan={4}>TOTAL ACTIVE CHALLAN BALANCES</td>
                                <td style={{ textAlign: 'right' }} className="code-font">{generatedReport.totals.balance.toLocaleString('en-IN')}</td>
                              </tr>
                            </tbody>
                          </table>
                        )}

                        {generatedReport.templateCode === 'Form 61' && (
                          <table className="document-table animate-scale-in">
                            <thead>
                              <tr>
                                <th>Voucher Reference</th>
                                <th>Original Head (HoA)</th>
                                <th>Corrected Head (HoA)</th>
                                <th style={{ textAlign: 'right' }}>Adjusted Amount (Rs.)</th>
                                <th>Reason / Remarks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {generatedReport.rows.map((row: any, i: number) => (
                                <tr key={i}>
                                  <td className="code-font">{row.ref}</td>
                                  <td className="code-font">{row.origHead}</td>
                                  <td className="code-font">{row.corrHead}</td>
                                  <td style={{ textAlign: 'right' }}>{row.amount.toLocaleString('en-IN')}</td>
                                  <td>{row.reason}</td>
                                </tr>
                              ))}
                              <tr className="table-total">
                                <td colSpan={3}>TOTAL BY-TRANSFER ADJUSTMENTS</td>
                                <td style={{ textAlign: 'right' }} className="code-font">{generatedReport.totals.amount.toLocaleString('en-IN')}</td>
                                <td>Reconciled</td>
                              </tr>
                            </tbody>
                          </table>
                        )}

                        {!['Form 80', 'Form 64', 'Form 65', 'Form 46A', 'CTR', 'Work ID Balances', 'Form 61'].includes(generatedReport.templateCode) && (
                          <table className="document-table">
                            <thead>
                              <tr>
                                <th>Classification Head</th>
                                <th>Receipt Value (Rs.)</th>
                                <th>Disbursement Value (Rs.)</th>
                                <th>Net Position (Rs.)</th>
                                <th>Audit Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {generatedReport.rows.map((row: any, i: number) => (
                                <tr key={i}>
                                  <td>{row.col1}</td>
                                  <td>{row.col2}</td>
                                  <td>{row.col3}</td>
                                  <td>{row.col4}</td>
                                  <td><span className="badge badge-success">{row.col5}</span></td>
                                </tr>
                              ))}
                              <tr className="table-total">
                                <td>CONSOLIDATED TOTALS</td>
                                <td>{generatedReport.totals.col2.toLocaleString('en-IN')}</td>
                                <td>{generatedReport.totals.col3.toLocaleString('en-IN')}</td>
                                <td>{generatedReport.totals.col4.toLocaleString('en-IN')}</td>
                                <td>Audited</td>
                              </tr>
                            </tbody>
                          </table>
                        )}
                      </div>

                      <div className="document-sheet-footer">
                        <div className="document-footer-left">
                          <span>Generated from IFMIS Central Server</span>
                          <span>Audit Hash: SHA-256/90A81D2...</span>
                        </div>
                        {submissions.some(s => s.month === 'June 2026' && s.ddoCode === selectedDdo) ? (
                          <div className="digital-signature-seal">
                            <span className="signature-seal-header">
                              <CheckCircle size={10} />
                              <span>Digitally Signed</span>
                            </span>
                            <span className="signature-seal-text">
                              Signed by: DDO Officer Indore<br />
                              Authority: e-Mudhra Class 3 DSC<br />
                              Timestamp: {new Date().toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <div style={{ fontStyle: 'italic', color: 'var(--color-text-tertiary)' }}>
                            *Not Digitally Signed (Draft Submission)*
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-view-state">
                  <Database size={48} />
                  <h3>No Active Report Compiled</h3>
                  <p>
                    Select the report type and configure appropriate date range and DDO parameters in the filters panel, then click "Compile & Generate Report" to retrieve accounts values.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 2: MONTHLY SUBMISSIONS --- */}
        {activeTab === 'submissions' && (
          <div className="submission-grid animate-fade-in">
            {/* Left Column: Digital signature panel */}
            <div className="submission-control-card">
              <div className="reports-card">
                <div className="reports-card-header">
                  <div>
                    <h2>Digital Submission Controls</h2>
                    <p>DDO compiles division accounts monthly. On the 2nd of every month, sign accounts and submit to AGMP Bhopal/Gwalior.</p>
                  </div>
                </div>
                <div className="reports-card-body">
                  {userRole === 'DDO' ? (
                    submissions.some(s => s.month === signingMonth && s.ddoCode === 'DDO-RES-INDORE-01') ? (
                      <div className="empty-view-state" style={{ borderColor: 'var(--color-success)', background: 'var(--color-success-bg)' }}>
                        <CheckCircle size={48} style={{ color: 'var(--color-success)' }} />
                        <h3 style={{ color: 'var(--color-success)' }}>Accounts Submission Confirmed</h3>
                        <p style={{ color: '#065f46' }}>
                          Indore Rural Service (DDO-RES-INDORE-01) has signed and submitted the works accounts for {signingMonth} to AGMP Gwalior / Bhopal. VLC Ledger Synchronization is complete.
                        </p>
                      </div>
                    ) : isSigning ? (
                      <div className="signing-overlay-container">
                        {signingStep === 'verify' && (
                          <>
                            <FileCheck size={36} style={{ color: 'var(--color-primary)' }} />
                            <h3>Reconciliation Audit Complete</h3>
                            <p>All Form reports have been pre-compiled. No unapproved ledger discrepancies found for {signingMonth}.</p>
                            <button className="btn btn-primary" onClick={() => setSigningStep('pin')}>
                              <span>Verify & Proceed to Sign</span>
                              <Signature size={14} />
                            </button>
                          </>
                        )}

                        {signingStep === 'pin' && (
                          <div className="filter-form-gap" style={{ width: '100%' }}>
                            <Lock size={36} style={{ color: 'var(--color-warning)', margin: '0 auto' }} />
                            <h3>Verify DSC Certificate PIN</h3>
                            <p>Insert your Class-3 e-Mudhra USB Token. Enter security PIN to authorize digital signature seal.</p>
                            <div className="form-group">
                              <input
                                type="password"
                                className="form-input"
                                placeholder="Mock Pin: 123456"
                                value={signingDscPin}
                                onChange={(e) => setSigningDscPin(e.target.value)}
                                style={{ textAlign: 'center', letterSpacing: '8px' }}
                              />
                            </div>
                            <div className="preview-actions-right" style={{ justifyContent: 'center' }}>
                              <button className="btn btn-secondary" onClick={() => setIsSigning(false)}>Cancel</button>
                              <button className="btn btn-primary" onClick={executeSigningProcess}>
                                <span>Sign Document</span>
                                <Send size={14} />
                              </button>
                            </div>
                          </div>
                        )}

                        {signingStep === 'complete' && (
                          <>
                            <div className="signing-spinner"></div>
                            <h3>Affixing Digital Signature</h3>
                            <p>Signing ledger files. Uploading encrypted XML package to VLC servers...</p>
                            <div className="signing-progress-bar">
                              <div className="signing-progress-fill" style={{ width: `${signingProgress}%` }}></div>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="filter-form-gap">
                        <div className="dsc-certificate-container">
                          <div className="dsc-watermark-bg"></div>
                          <div className="dsc-cert-header">
                            <span className="dsc-cert-title">
                              <Signature size={14} />
                              <span>Active DSC Token Detected</span>
                            </span>
                            <span className="dsc-cert-status-tag">Ready</span>
                          </div>
                          
                          <div className="dsc-cert-body">
                            <div className="dsc-cert-field">
                              <span>Certificate Holder</span>
                              <strong>DDO Officer Indore (Works Dev RES)</strong>
                            </div>
                            <div className="dsc-cert-field">
                              <span>Issuer Authority</span>
                              <strong>e-Mudhra Sub-CA Class 3</strong>
                            </div>
                            <div className="dsc-cert-field">
                              <span>Validity Scope</span>
                              <strong>Valid until Dec 2028 | Status: Active</strong>
                            </div>
                          </div>

                          <div className="dsc-cert-footer">
                            <span>Token ID: USB-DSC-98218-MP</span>
                            <span>Standards: FIPS-140-2</span>
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Submission Target Month</label>
                          <select className="form-input" value={signingMonth} onChange={(e) => setSigningMonth(e.target.value)}>
                            <option value="June 2026">June 2026 (Due Date: July 2nd, 2026)</option>
                            <option value="July 2026">July 2026 (Due Date: August 2nd, 2026)</option>
                          </select>
                        </div>

                        <button className="btn btn-primary" onClick={handleStartDigitalSigning}>
                          <Signature size={14} />
                          <span>Digitally Sign & Submit June Accounts</span>
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="empty-view-state">
                      <Lock size={36} />
                      <h3>Access Restricted</h3>
                      <p>Only Drawing & Disbursing Officers (DDO) can sign and submit accounts to the AG offices. Switch to DDO View to test submission.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Historical logs */}
            <div className="submission-history-box">
              <div className="reports-card">
                <div className="reports-card-header">
                  <div>
                    <h2>Division Account Submission Logs</h2>
                    <p>Track history of submitted accounts and their synchronization status with VLC systems.</p>
                  </div>
                </div>
                <div className="reports-card-body" style={{ background: 'var(--color-bg)' }}>
                  <div className="submission-history-list">
                    {submissions.map((sub) => (
                      <div key={sub.id} className="sub-history-item animate-scale-in">
                        <div className="sub-history-left">
                          <span className="sub-history-month">{sub.month}</span>
                          <span className="sub-history-details">
                            DDO: <strong>{sub.ddoCode}</strong> | Mapped to AGMP Gwalior & Bhopal
                          </span>
                          <span className="sub-history-details">
                            Digital Cert: <em>{sub.signedBy}</em>
                          </span>
                          
                          <div className="sub-history-vlc">
                            <Database size={10} />
                            <span>VLC System: Synchronized (Status: {sub.vlcStatus})</span>
                          </div>
                        </div>

                        <div className="sub-history-right">
                          <span className="badge badge-success">
                            {sub.status}
                          </span>
                          <span className="req-date-stamp" style={{ fontSize: '10px' }}>
                            Signed: {sub.signedDate.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: SYSTEM AUDIT TRAIL --- */}
        {activeTab === 'audit' && (
          <div className="reports-card animate-fade-in">
            <div className="reports-card-header">
              <div className="preview-actions-left">
                <h2>Compliance Audit Log</h2>
                <p>Immutable registry of system events, report compilations, signature submissions, and sync logs.</p>
              </div>

              <div className="sd-search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Filter logs by action, user, or details..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="reports-card-body" style={{ padding: 0 }}>
              <div className="audit-table-wrapper">
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Event ID</th>
                      <th>Timestamp</th>
                      <th>Authorized User</th>
                      <th>Role Mapped</th>
                      <th>Event Type</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="code-font">{log.id}</td>
                        <td className="code-font" style={{ whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                        <td><strong>{log.user}</strong></td>
                        <td>
                          <span className={`badge ${
                            log.role === 'DDO' ? 'badge-primary' :
                            log.role === 'BCO' ? 'badge-warning' :
                            log.role === 'AG' ? 'badge-success' : 'badge-info'
                          }`}>
                            {log.role}
                          </span>
                        </td>
                        <td>
                          <span className={`audit-tag ${
                            log.actionType === 'Report' ? 'generation' :
                            log.actionType === 'Submission' ? 'submission' : 'system'
                          }`}>
                            {log.actionType}
                          </span>
                        </td>
                        <td>{log.details}</td>
                      </tr>
                    ))}
                    {filteredAuditLogs.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', padding: 'var(--space-6)' }}>
                          No audit trail events match your filter criteria.
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
    </div>
  );
}
