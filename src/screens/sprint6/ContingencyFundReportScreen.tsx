import { useState, useMemo } from 'react';
import {
  FileText,
  Calendar,
  Building2,
  Download,
  RefreshCcw,
  Sparkles,
  Lock,
  Wallet,
  FileSpreadsheet,
  Printer,
  Search,
  Eye,
  CheckCircle2,
  AlertCircle,
  Landmark,
  X,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import CommentLayer from '../../components/feedback/CommentLayer';
import './ContingencyFundReportScreen.css';

// --- Helper Date Formatting Functions ---
const formatDateDDMMYYYY = (dateStr: string): string => {
  if (!dateStr) return '';
  if (dateStr.includes('/')) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
  }
  return dateStr;
};

const parseDDMMYYYYToISO = (dateStr: string): string => {
  if (!dateStr) return '';
  if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) return dateStr;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [d, m, y] = parts;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return dateStr;
};

const formatINR = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(val);
};

// --- Interfaces ---
export interface ExpenditureVoucher {
  voucherNo: string;
  voucherDate: string;
  workDescription: string;
  beneficiaryOrVendor: string;
  amount: number;
}

export interface RecoupmentBill {
  billNo: string;
  billDate: string;
  supplementaryHead: string;
  tokenNo: string;
  amountRecouped: number;
  status: 'Recouped' | 'In Process';
}

export interface ContingencyBCORecord {
  id: string;
  bcoCode: string;
  bcoName: string;
  deptCode: string;
  deptName: string;
  treasuryCode: string;
  treasuryName: string;
  advanceOrderNo: string;
  advanceOrderDate: string;
  advancePurpose: string;
  openingBalance: number;
  expenditure: number;
  recoupment: number;
  pendingRecoupment: number;
  currentContingencyBalance: number;
  status: 'Fully Recouped' | 'Partially Recouped' | 'Pending Recoupment';
  expenditures: ExpenditureVoucher[];
  recoupments: RecoupmentBill[];
}

// --- Mock Master Datasets ---
const CONTINGENCY_HEAD_FIXED = '8000-Contigency fund';

const DEPARTMENTS = [
  { code: 'ALL', name: 'All Departments' },
  { code: 'REV', name: 'Revenue & Disaster Management Department' },
  { code: 'PWD', name: 'Public Works Department (PWD)' },
  { code: 'HLT', name: 'Public Health & Family Welfare Department' },
  { code: 'WRD', name: 'Water Resources Department' },
  { code: 'AGRI', name: 'Agriculture & Farmers Welfare Department' },
  { code: 'FOR', name: 'Forest & Wildlife Department' },
  { code: 'UAD', name: 'Urban Administration & Development' },
  { code: 'PRD', name: 'Panchayat & Rural Development Department' },
  { code: 'HOM', name: 'Home & State Disaster Response (SDRF)' }
];

const CONTINGENCY_RECORDS: ContingencyBCORecord[] = [
  {
    id: 'CF-BCO-01',
    bcoCode: 'BCO-10001-REV',
    bcoName: 'Commissioner Relief & Land Records',
    deptCode: 'REV',
    deptName: 'Revenue & Disaster Management Department',
    treasuryCode: 'TR-101',
    treasuryName: 'Bhopal District Treasury',
    advanceOrderNo: 'FD/CF/2026/REV/089',
    advanceOrderDate: '2026-04-12',
    advancePurpose: 'Emergency relief gratuitous distribution for unseasonal hailstorm damage',
    openingBalance: 500000000,
    expenditure: 185000000,
    recoupment: 120000000,
    pendingRecoupment: 65000000,
    currentContingencyBalance: 435000000,
    status: 'Partially Recouped',
    expenditures: [
      { voucherNo: 'VCH-REV-0012', voucherDate: '2026-04-18', workDescription: 'Immediate ex-gratia relief disbursal across 14 affected tehsils', beneficiaryOrVendor: 'Direct DBT Beneficiaries', amount: 95000000 },
      { voucherNo: 'VCH-REV-0034', voucherDate: '2026-05-02', workDescription: 'Emergency food & shelter camps logistics setup', beneficiaryOrVendor: 'Civil Supplies Corporation MP', amount: 50000000 },
      { voucherNo: 'VCH-REV-0067', voucherDate: '2026-05-20', workDescription: 'Temporary fodder depot establishment & livestock medicine', beneficiaryOrVendor: 'MP State Agro Industries', amount: 40000000 }
    ],
    recoupments: [
      { billNo: 'REC-BILL-2026-01', billDate: '2026-07-15', supplementaryHead: '2245-02-101-0096 (State Calamity Fund)', tokenNo: 'TOK-99214', amountRecouped: 120000000, status: 'Recouped' }
    ]
  },
  {
    id: 'CF-BCO-02',
    bcoCode: 'BCO-40003-PWD',
    bcoName: 'Chief Engineer (Roads & Bridges) & BCO',
    deptCode: 'PWD',
    deptName: 'Public Works Department (PWD)',
    treasuryCode: 'TR-102',
    treasuryName: 'Indore District Treasury',
    advanceOrderNo: 'FD/CF/2026/PWD/104',
    advanceOrderDate: '2026-05-08',
    advancePurpose: 'Emergency bridge approach reconstruction on Chambal feeder link after flash floods',
    openingBalance: 350000000,
    expenditure: 142000000,
    recoupment: 142000000,
    pendingRecoupment: 0,
    currentContingencyBalance: 350000000,
    status: 'Fully Recouped',
    expenditures: [
      { voucherNo: 'VCH-PWD-1102', voucherDate: '2026-05-15', workDescription: 'Emergency Bailey bridge deployment & temporary causeway', beneficiaryOrVendor: 'National Highway Infra Ltd', amount: 82000000 },
      { voucherNo: 'VCH-PWD-1189', voucherDate: '2026-06-04', workDescription: 'Scour protection retaining wall emergency construction', beneficiaryOrVendor: 'M/s MP PWD Bridge Construction Unit', amount: 60000000 }
    ],
    recoupments: [
      { billNo: 'REC-BILL-2026-04', billDate: '2026-08-10', supplementaryHead: '3054-04-337-1422 (State Highways Maintenance)', tokenNo: 'TOK-88712', amountRecouped: 142000000, status: 'Recouped' }
    ]
  },
  {
    id: 'CF-BCO-03',
    bcoCode: 'BCO-24001-HLT',
    bcoName: 'Directorate of Health Services & BCO',
    deptCode: 'HLT',
    deptName: 'Public Health & Family Welfare Department',
    treasuryCode: 'TR-101',
    treasuryName: 'Bhopal District Treasury',
    advanceOrderNo: 'FD/CF/2026/HLT/042',
    advanceOrderDate: '2026-06-11',
    advancePurpose: 'Procurement of critical antidotes, emergency oxygen cylinders & diagnostic kits',
    openingBalance: 400000000,
    expenditure: 98000000,
    recoupment: 30000000,
    pendingRecoupment: 68000000,
    currentContingencyBalance: 332000000,
    status: 'Partially Recouped',
    expenditures: [
      { voucherNo: 'VCH-HLT-2045', voucherDate: '2026-06-18', workDescription: 'Emergency bulk vaccine consignment airlift & storage', beneficiaryOrVendor: 'MP Public Health Services Corp', amount: 55000000 },
      { voucherNo: 'VCH-HLT-2099', voucherDate: '2026-07-02', workDescription: 'Mobile testing laboratory deployment in tribal belts', beneficiaryOrVendor: 'HLL Lifecare India', amount: 43000000 }
    ],
    recoupments: [
      { billNo: 'REC-BILL-2026-07', billDate: '2026-08-25', supplementaryHead: '2210-06-101-2661 (Public Health Epidemic Control)', tokenNo: 'TOK-77451', amountRecouped: 30000000, status: 'Recouped' }
    ]
  },
  {
    id: 'CF-BCO-04',
    bcoCode: 'BCO-41002-WRD',
    bcoName: 'Chief Engineer Water Resources & BCO',
    deptCode: 'WRD',
    deptName: 'Water Resources Department',
    treasuryCode: 'TR-104',
    treasuryName: 'Jabalpur Treasury',
    advanceOrderNo: 'FD/CF/2026/WRD/219',
    advanceOrderDate: '2026-07-04',
    advancePurpose: 'Emergency reinforcement of earthen dam bunds and siphon gate restoration',
    openingBalance: 300000000,
    expenditure: 85000000,
    recoupment: 0,
    pendingRecoupment: 85000000,
    currentContingencyBalance: 215000000,
    status: 'Pending Recoupment',
    expenditures: [
      { voucherNo: 'VCH-WRD-0921', voucherDate: '2026-07-12', workDescription: 'Geo-synthetic reinforcement & heavy rock rip-rap dumping', beneficiaryOrVendor: 'Narmada Valley Project Works', amount: 52000000 },
      { voucherNo: 'VCH-WRD-0988', voucherDate: '2026-07-28', workDescription: 'Hydraulic automated radial gate emergency overhaul', beneficiaryOrVendor: 'BHEL Bhopal Engineering Services', amount: 33000000 }
    ],
    recoupments: []
  },
  {
    id: 'CF-BCO-05',
    bcoCode: 'BCO-50004-AGRI',
    bcoName: 'Directorate of Agriculture & BCO',
    deptCode: 'AGRI',
    deptName: 'Agriculture & Farmers Welfare Department',
    treasuryCode: 'TR-500',
    treasuryName: 'Singrauli District Treasury',
    advanceOrderNo: 'FD/CF/2026/AGRI/112',
    advanceOrderDate: '2026-05-25',
    advancePurpose: 'Emergency subsidised seed replacement distribution for flash-flood destroyed Kharif sowings',
    openingBalance: 250000000,
    expenditure: 110000000,
    recoupment: 75000000,
    pendingRecoupment: 35000000,
    currentContingencyBalance: 215000000,
    status: 'Partially Recouped',
    expenditures: [
      { voucherNo: 'VCH-AGRI-4011', voucherDate: '2026-06-05', workDescription: 'Certified certified short-duration paddy seed procurement', beneficiaryOrVendor: 'MP State Seed Certification Corp', amount: 75000000 },
      { voucherNo: 'VCH-AGRI-4054', voucherDate: '2026-06-22', workDescription: 'Distribution transportation and tehsil warehousing', beneficiaryOrVendor: 'MP State Warehousing & Logistics', amount: 35000000 }
    ],
    recoupments: [
      { billNo: 'REC-BILL-2026-11', billDate: '2026-09-02', supplementaryHead: '2401-00-103-6422 (Seed Subsidy)', tokenNo: 'TOK-66129', amountRecouped: 75000000, status: 'Recouped' }
    ]
  },
  {
    id: 'CF-BCO-06',
    bcoCode: 'BCO-30002-FOR',
    bcoName: 'Principal Chief Conservator of Forests & BCO',
    deptCode: 'FOR',
    deptName: 'Forest & Wildlife Department',
    treasuryCode: 'TR-103',
    treasuryName: 'Gwalior Treasury',
    advanceOrderNo: 'FD/CF/2026/FOR/031',
    advanceOrderDate: '2026-04-05',
    advancePurpose: 'Emergency forest fire prevention fireline creation and night patrol drone deployment',
    openingBalance: 180000000,
    expenditure: 42000000,
    recoupment: 42000000,
    pendingRecoupment: 0,
    currentContingencyBalance: 180000000,
    status: 'Fully Recouped',
    expenditures: [
      { voucherNo: 'VCH-FOR-0120', voucherDate: '2026-04-14', workDescription: 'Special forest fire extinguisher blowers & protective gear', beneficiaryOrVendor: 'State Forest Development Corp', amount: 25000000 },
      { voucherNo: 'VCH-FOR-0199', voucherDate: '2026-04-29', workDescription: 'Emergency forest watchers temporary daily wage honorarium', beneficiaryOrVendor: 'Eco Development Committees (EDC)', amount: 17000000 }
    ],
    recoupments: [
      { billNo: 'REC-BILL-2026-09', billDate: '2026-07-20', supplementaryHead: '2406-01-101-0747 (Forest Fire Management)', tokenNo: 'TOK-55821', amountRecouped: 42000000, status: 'Recouped' }
    ]
  },
  {
    id: 'CF-BCO-07',
    bcoCode: 'BCO-60005-UAD',
    bcoName: 'Commissioner Urban Administration & BCO',
    deptCode: 'UAD',
    deptName: 'Urban Administration & Development',
    treasuryCode: 'TR-101',
    treasuryName: 'Bhopal District Treasury',
    advanceOrderNo: 'FD/CF/2026/UAD/188',
    advanceOrderDate: '2026-08-01',
    advancePurpose: 'Emergency deployment of high-capacity dewatering pump sets during monsoon waterlogging',
    openingBalance: 220000000,
    expenditure: 64000000,
    recoupment: 0,
    pendingRecoupment: 64000000,
    currentContingencyBalance: 156000000,
    status: 'Pending Recoupment',
    expenditures: [
      { voucherNo: 'VCH-UAD-3312', voucherDate: '2026-08-09', workDescription: 'Rental and fuel procurement for 50 heavy submersible dewatering pumps', beneficiaryOrVendor: 'Bhopal Municipal Corporation Utility Cell', amount: 41000000 },
      { voucherNo: 'VCH-UAD-3380', voucherDate: '2026-08-22', workDescription: 'Immediate silt clearance and emergency barrier trenching', beneficiaryOrVendor: 'Urban Infrastructure Developers Bhopal', amount: 23000000 }
    ],
    recoupments: []
  },
  {
    id: 'CF-BCO-08',
    bcoCode: 'BCO-55001-PRD',
    bcoName: 'Development Commissioner Panchayat & Rural Development',
    deptCode: 'PRD',
    deptName: 'Panchayat & Rural Development Department',
    treasuryCode: 'TR-104',
    treasuryName: 'Jabalpur Treasury',
    advanceOrderNo: 'FD/CF/2026/PRD/077',
    advanceOrderDate: '2026-06-01',
    advancePurpose: 'Emergency rural drinking water tanker supply to 22 scarcity-hit gram panchayats',
    openingBalance: 150000000,
    expenditure: 49000000,
    recoupment: 25000000,
    pendingRecoupment: 24000000,
    currentContingencyBalance: 126000000,
    status: 'Partially Recouped',
    expenditures: [
      { voucherNo: 'VCH-PRD-5101', voucherDate: '2026-06-15', workDescription: 'Water tanker logistics operations and emergency pipe fittings', beneficiaryOrVendor: 'Zila Panchayat Jabalpur Scarcity Fund', amount: 32000000 },
      { voucherNo: 'VCH-PRD-5140', voucherDate: '2026-07-01', workDescription: 'Deep borewell instant flushing and chlorination drive', beneficiaryOrVendor: 'Public Health Engineering Dept Rural', amount: 17000000 }
    ],
    recoupments: [
      { billNo: 'REC-BILL-2026-15', billDate: '2026-08-30', supplementaryHead: '2515-00-102-6434 (Rural Water Supply Scarcity)', tokenNo: 'TOK-44102', amountRecouped: 25000000, status: 'Recouped' }
    ]
  },
  {
    id: 'CF-BCO-09',
    bcoCode: 'BCO-12003-HOM',
    bcoName: 'Director General Home Guards & SDRF & BCO',
    deptCode: 'HOM',
    deptName: 'Home & State Disaster Response (SDRF)',
    treasuryCode: 'TR-106',
    treasuryName: 'Ujjain Treasury',
    advanceOrderNo: 'FD/CF/2026/HOM/015',
    advanceOrderDate: '2026-07-19',
    advancePurpose: 'Emergency motorized rescue boat fuel, diver safety gear & night searchlight beacons',
    openingBalance: 150000000,
    expenditure: 32000000,
    recoupment: 32000000,
    pendingRecoupment: 0,
    currentContingencyBalance: 150000000,
    status: 'Fully Recouped',
    expenditures: [
      { voucherNo: 'VCH-HOM-0810', voucherDate: '2026-07-25', workDescription: 'Inflatable rescue boats and Yamaha outboard motor quick replacement', beneficiaryOrVendor: 'Goa Shipyard Marine Equipments', amount: 20000000 },
      { voucherNo: 'VCH-HOM-0842', voucherDate: '2026-08-04', workDescription: 'High-intensity rescue floodlights, life vests & communication radios', beneficiaryOrVendor: 'Zen Technologies Defence Supplies', amount: 12000000 }
    ],
    recoupments: [
      { billNo: 'REC-BILL-2026-18', billDate: '2026-09-18', supplementaryHead: '2070-00-106-2018 (Civil Defence & SDRF Equipment)', tokenNo: 'TOK-33980', amountRecouped: 32000000, status: 'Recouped' }
    ]
  }
];

export default function ContingencyFundReportScreen() {
  // --- Filter States ---
  // Contingency Head is fixed: 8000-Contigency fund
  const contingencyHead = CONTINGENCY_HEAD_FIXED;

  const [financialYear, setFinancialYear] = useState<string>('2026-27');
  const [fromDate, setFromDate] = useState<string>('01/04/2026');
  const [toDate, setToDate] = useState<string>('30/09/2026');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedBco, setSelectedBco] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // UI Interactive States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeModalRecord, setActiveModalRecord] = useState<ContingencyBCORecord | null>(null);
  const [reportGeneratedAt, setReportGeneratedAt] = useState<string>('14/11/2026 14:22');

  // Trigger Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFinancialYear('2026-27');
    setFromDate('01/04/2026');
    setToDate('30/09/2026');
    setSelectedDept('ALL');
    setSelectedBco('ALL');
    setSearchTerm('');
    showToast('Filters reset to default.');
  };

  // Generate Report Action
  const handleGenerateReport = () => {
    setIsGenerating(true);
    showToast('Generating Contingency Fund Report for Head 8000...');
    setTimeout(() => {
      setIsGenerating(false);
      setReportGeneratedAt(new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }));
      showToast('Report generated successfully with verified Treasury ledger figures!');
    }, 700);
  };

  // Export Actions
  const handleExport = (type: 'PDF' | 'EXCEL' | 'PRINT') => {
    if (type === 'PRINT') {
      window.print();
      return;
    }
    showToast(`Exporting Contingency Fund Report as ${type}...`);
  };

  // Filtered List of BCOs based on Department selection
  const availableBcos = useMemo(() => {
    if (selectedDept === 'ALL') {
      return CONTINGENCY_RECORDS;
    }
    return CONTINGENCY_RECORDS.filter((rec) => rec.deptCode === selectedDept);
  }, [selectedDept]);

  // Main Filtered Dataset
  const filteredRecords = useMemo(() => {
    return CONTINGENCY_RECORDS.filter((rec) => {
      // Department filter
      if (selectedDept !== 'ALL' && rec.deptCode !== selectedDept) return false;

      // BCO filter
      if (selectedBco !== 'ALL' && rec.bcoCode !== selectedBco) return false;

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matches =
          rec.bcoCode.toLowerCase().includes(term) ||
          rec.bcoName.toLowerCase().includes(term) ||
          rec.deptName.toLowerCase().includes(term) ||
          rec.advanceOrderNo.toLowerCase().includes(term);
        if (!matches) return false;
      }

      return true;
    });
  }, [selectedDept, selectedBco, searchTerm]);

  // Totals Calculation across filtered records
  const totals = useMemo(() => {
    return filteredRecords.reduce(
      (acc, curr) => {
        acc.openingBalance += curr.openingBalance;
        acc.expenditure += curr.expenditure;
        acc.recoupment += curr.recoupment;
        acc.pendingRecoupment += curr.pendingRecoupment;
        acc.currentContingencyBalance += curr.currentContingencyBalance;
        return acc;
      },
      {
        openingBalance: 0,
        expenditure: 0,
        recoupment: 0,
        pendingRecoupment: 0,
        currentContingencyBalance: 0
      }
    );
  }, [filteredRecords]);

  return (
    <div className="contingency-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="contingency-toast">
          <Sparkles className="spin-icon" size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* --- Top Header & Action Controls --- */}
      <div className="contingency-header">
        <div className="contingency-header-left">
          <div className="contingency-header-tag">
            <Landmark size={14} />
            <span>State Contingency Fund Management (Major Head 8000)</span>
          </div>
          <h1>Contingency Fund Report</h1>

        </div>

        <div className="contingency-header-actions">
          <button className="contingency-btn contingency-btn-secondary" onClick={() => handleExport('PRINT')}>
            <Printer size={15} />
            <span>Print</span>
          </button>
          <button className="contingency-btn contingency-btn-secondary" onClick={() => handleExport('EXCEL')}>
            <FileSpreadsheet size={15} />
            <span>Excel</span>
          </button>
          <button className="contingency-btn contingency-btn-secondary" onClick={() => handleExport('PDF')}>
            <Download size={15} />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* --- KPI Summary Metric Cards (Top Section) --- */}
      <div className="contingency-kpi-grid">
        {/* KPI 1: Total Opening Balance */}
        <div className="kpi-card kpi-blue">
          <div className="kpi-card-header">
            <span className="kpi-label">Contingency Balance</span>
            <div className="kpi-icon-wrapper">
              <Wallet size={16} />
            </div>
          </div>
          <h2 className="kpi-value">{formatINR(totals.openingBalance)}</h2>

        </div>

        {/* KPI 2: Total Expenditure */}
        <div className="kpi-card kpi-red">
          <div className="kpi-card-header">
            <span className="kpi-label">Total Expenditure</span>
            <div className="kpi-icon-wrapper">
              <TrendingDown size={16} />
            </div>
          </div>
          <h2 className="kpi-value">{formatINR(totals.expenditure)}</h2>

        </div>

        {/* KPI 3: Total Recoupment */}
        <div className="kpi-card kpi-green">
          <div className="kpi-card-header">
            <span className="kpi-label">Recoupment Done</span>
            <div className="kpi-icon-wrapper">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <h2 className="kpi-value">{formatINR(totals.recoupment)}</h2>

        </div>

        {/* KPI 4: Pending Recoupment */}
        <div className="kpi-card kpi-amber">
          <div className="kpi-card-header">
            <span className="kpi-label">Pending Recoupment</span>
            <div className="kpi-icon-wrapper">
              <AlertCircle size={16} />
            </div>
          </div>
          <h2 className="kpi-value">{formatINR(totals.pendingRecoupment)}</h2>

        </div>

        {/* KPI 5: Current Contingency Balance */}
        <div className="kpi-card kpi-purple">
          <div className="kpi-card-header">
            <span className="kpi-label">Current Balance</span>
            <div className="kpi-icon-wrapper">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <h2 className="kpi-value">{formatINR(totals.currentContingencyBalance)}</h2>

        </div>
      </div>

      {/* --- Master Section: Search & Filter Card --- */}
      <div className="contingency-card">
        <div className="contingency-card-header">
          <div className="contingency-card-title">
            <Building2 size={18} className="contingency-icon-blue" />
            <h3>Report Criteria & Advance Filters</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span className="contingency-badge-info">Head: 8000-Contigency fund</span>
            <button className="contingency-btn-link" onClick={handleResetFilters}>
              <RefreshCcw size={14} />
              <span>Reset All Filters</span>
            </button>
          </div>
        </div>

        {/* Filter Form Grid */}
        <div className="contingency-filter-grid-container">
          {/* Row 1: Fixed Contingency Head, Financial Year, From Date, To Date */}
          <div className="contingency-filter-row contingency-filter-row-4">
            {/* Field 1: Contingency Head (FIXED) */}
            <div className="filter-group">
              <label className="contingency-field-label">
                <span className="label-title">
                  <Wallet size={14} />
                  <span>Contingency Head <span className="contingency-required">*</span></span>
                </span>
                <span className="fixed-pill">
                  <Lock size={10} /> Fixed
                </span>
              </label>
              <input
                type="text"
                className="contingency-input contingency-input-readonly"
                value={contingencyHead}
                readOnly
                title="Fixed Head of Account: 8000-Contigency fund"
              />
            </div>

            {/* Field 2: Financial Year */}
            <div className="filter-group">
              <label className="contingency-field-label">
                <span className="label-title">
                  <Calendar size={14} />
                  <span>Financial Year <span className="contingency-required">*</span></span>
                </span>
              </label>
              <select
                className="contingency-select"
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
              >
                <option value="2026-27">2026-27 (Current Fiscal)</option>
                <option value="2025-26">2025-26 (Previous Year)</option>
                <option value="2024-25">2024-25 (Audited Year)</option>
              </select>
            </div>

            {/* Field 3: From Date */}
            <div className="filter-group">
              <label className="contingency-field-label">
                <span className="label-title">
                  <Calendar size={14} />
                  <span>From Date</span>
                </span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  className="contingency-input"
                  placeholder="DD/MM/YYYY"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={{ width: '100%', paddingRight: '36px' }}
                />
                <input
                  type="date"
                  style={{
                    position: 'absolute',
                    right: '8px',
                    width: '24px',
                    height: '24px',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                  value={parseDDMMYYYYToISO(fromDate)}
                  onChange={(e) => {
                    if (e.target.value) {
                      setFromDate(formatDateDDMMYYYY(e.target.value));
                    }
                  }}
                />
                <Calendar size={16} style={{ position: 'absolute', right: '12px', pointerEvents: 'none', color: '#0284C7' }} />
              </div>
            </div>

            {/* Field 4: To Date */}
            <div className="filter-group">
              <label className="contingency-field-label">
                <span className="label-title">
                  <Calendar size={14} />
                  <span>To Date</span>
                </span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  className="contingency-input"
                  placeholder="DD/MM/YYYY"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  style={{ width: '100%', paddingRight: '36px' }}
                />
                <input
                  type="date"
                  style={{
                    position: 'absolute',
                    right: '8px',
                    width: '24px',
                    height: '24px',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                  value={parseDDMMYYYYToISO(toDate)}
                  onChange={(e) => {
                    if (e.target.value) {
                      setToDate(formatDateDDMMYYYY(e.target.value));
                    }
                  }}
                />
                <Calendar size={16} style={{ position: 'absolute', right: '12px', pointerEvents: 'none', color: '#0284C7' }} />
              </div>
            </div>
          </div>

          {/* Row 2: Department & BCO Filters */}
          <div className="contingency-filter-row contingency-filter-row-2">
            {/* Field 5: Administrative Department */}
            <div className="filter-group">
              <label className="contingency-field-label">
                <span className="label-title">
                  <Building2 size={14} />
                  <span>Administrative Department</span>
                </span>
              </label>
              <select
                className="contingency-select"
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setSelectedBco('ALL');
                }}
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.code} value={dept.code}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 6: BCO (Budget Controlling Officer) */}
            <div className="filter-group">
              <label className="contingency-field-label">
                <span className="label-title">
                  <FileText size={14} />
                  <span>BCO (Budget Controlling Officer)</span>
                </span>
              </label>
              <select
                className="contingency-select"
                value={selectedBco}
                onChange={(e) => setSelectedBco(e.target.value)}
              >
                <option value="ALL">All BCOs ({availableBcos.length} BCO Units)</option>
                {availableBcos.map((bco) => (
                  <option key={bco.bcoCode} value={bco.bcoCode}>
                    {bco.bcoCode} - {bco.bcoName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Generate Button Row */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
          <button
            className="contingency-btn contingency-btn-primary"
            onClick={handleGenerateReport}
            disabled={isGenerating}
            style={{ padding: '12px 28px', fontSize: '14px', fontWeight: 700 }}
          >
            <Sparkles size={16} className={isGenerating ? 'spin-icon' : ''} />
            <span>{isGenerating ? 'Generating Report...' : 'Generate Report'}</span>
          </button>
        </div>
      </div>

      {/* --- Main Report Table Section --- */}
      <div className="contingency-card contingency-table-card">
        {/* Table Card Header with Search and Summary */}
        <div className="contingency-table-header">
          <div className="table-header-info">
            <h3>Statement of Contingency Fund Advances & Recoupments (8000-Contigency fund)</h3>
            <p>
              Showing {filteredRecords.length} BCO Record{filteredRecords.length === 1 ? '' : 's'} • As of {reportGeneratedAt}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '13px', color: '#94A3B8' }} />
              <input
                type="text"
                className="contingency-input"
                placeholder="Search BCO code or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '32px', height: '38px', fontSize: '12px' }}
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="contingency-table-wrapper">
          <table className="contingency-table">
            <thead>
              <tr>
                <th style={{ width: '45px', textAlign: 'center' }}>S.No.</th>
                <th style={{ width: '160px' }}>BCO Code</th>
                <th>BCO Description / Department</th>
                <th style={{ width: '130px', textAlign: 'right' }}>Opening Balance</th>
                <th style={{ width: '130px', textAlign: 'right' }}>Expenditure</th>
                <th style={{ width: '130px', textAlign: 'right' }}>Recoupment</th>
                <th style={{ width: '140px', textAlign: 'right' }}>Pending Recoupment</th>
                <th style={{ width: '160px', textAlign: 'right' }}>Current Contingency Balance</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="contingency-empty-state">
                      <div className="contingency-empty-icon">
                        <FileText size={26} />
                      </div>
                      <h4 style={{ margin: 0, color: '#334155' }}>No Contingency Fund Records Found</h4>
                      <p style={{ margin: 0, fontSize: '13px' }}>
                        Try adjusting your department, BCO, or date range filters to view records.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec, index) => {
                  return (
                    <tr key={rec.id}>
                      <td style={{ textAlign: 'center', color: '#64748B', fontWeight: 600 }}>{index + 1}</td>
                      <td>
                        <span className="bco-code-cell">{rec.bcoCode}</span>
                      </td>
                      <td>
                        <strong style={{ color: '#0F172A' }}>{rec.bcoName}</strong>
                        <span className="bco-name-subtext">{rec.deptName} • {rec.treasuryName}</span>
                      </td>
                      <td className="amount-cell amount-opening">{formatINR(rec.openingBalance)}</td>
                      <td className="amount-cell amount-expenditure">{formatINR(rec.expenditure)}</td>
                      <td className="amount-cell amount-recoupment">{formatINR(rec.recoupment)}</td>
                      <td className="amount-cell amount-pending">{formatINR(rec.pendingRecoupment)}</td>
                      <td className="amount-cell">
                        <span className="amount-current">{formatINR(rec.currentContingencyBalance)}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="contingency-btn-link"
                          onClick={() => setActiveModalRecord(rec)}
                          title="View Voucher & Recoupment Details"
                          style={{ padding: '4px 8px' }}
                        >
                          <Eye size={15} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredRecords.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={3} style={{ textAlign: 'right', fontWeight: 800 }}>
                    Total (₹):
                  </td>
                  <td className="amount-cell amount-opening" style={{ fontWeight: 800 }}>
                    {formatINR(totals.openingBalance)}
                  </td>
                  <td className="amount-cell amount-expenditure" style={{ fontWeight: 800 }}>
                    {formatINR(totals.expenditure)}
                  </td>
                  <td className="amount-cell amount-recoupment" style={{ fontWeight: 800 }}>
                    {formatINR(totals.recoupment)}
                  </td>
                  <td className="amount-cell amount-pending" style={{ fontWeight: 800 }}>
                    {formatINR(totals.pendingRecoupment)}
                  </td>
                  <td className="amount-cell" style={{ fontWeight: 800 }}>
                    <span className="amount-current">{formatINR(totals.currentContingencyBalance)}</span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* --- Detail Modal for Selected BCO --- */}
      {activeModalRecord && (
        <div className="contingency-modal-overlay" onClick={() => setActiveModalRecord(null)}>
          <div className="contingency-modal" onClick={(e) => e.stopPropagation()}>
            <div className="contingency-modal-header">
              <div className="contingency-modal-title">
                <FileText size={18} className="contingency-icon-blue" />
                <h3>BCO Contingency Advance & Recoupment Breakdown</h3>
              </div>
              <button className="contingency-modal-close" onClick={() => setActiveModalRecord(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="contingency-modal-body">
              {/* Summary Profile Grid */}
              <div className="modal-info-grid">
                <div className="modal-info-item">
                  <span className="modal-info-label">Contingency Head</span>
                  <span className="modal-info-value" style={{ color: '#0369A1' }}>{contingencyHead}</span>
                </div>
                <div className="modal-info-item">
                  <span className="modal-info-label">BCO Code & Name</span>
                  <span className="modal-info-value">{activeModalRecord.bcoCode} - {activeModalRecord.bcoName}</span>
                </div>
                <div className="modal-info-item">
                  <span className="modal-info-label">Administrative Department</span>
                  <span className="modal-info-value">{activeModalRecord.deptName}</span>
                </div>
                <div className="modal-info-item">
                  <span className="modal-info-label">Sanction Order Reference</span>
                  <span className="modal-info-value">{activeModalRecord.advanceOrderNo} ({formatDateDDMMYYYY(activeModalRecord.advanceOrderDate)})</span>
                </div>
                <div className="modal-info-item">
                  <span className="modal-info-label">Treasury Location</span>
                  <span className="modal-info-value">{activeModalRecord.treasuryName}</span>
                </div>
                <div className="modal-info-item">
                  <span className="modal-info-label">Recoupment Status</span>
                  <span className="modal-info-value">{activeModalRecord.status}</span>
                </div>
              </div>

              {/* Justification / Purpose */}
              <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '12px 16px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0369A1', textTransform: 'uppercase' }}>
                  Unforeseen Emergency Justification:
                </span>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#0C4A6E' }}>
                  {activeModalRecord.advancePurpose}
                </p>
              </div>

              {/* Section 1: Itemized Expenditure Vouchers */}
              <div>
                <h4 className="modal-subtable-title">
                  <TrendingDown size={16} style={{ color: '#DC2626' }} />
                  <span>Itemized Emergency Expenditure Vouchers</span>
                </h4>
                <table className="modal-subtable">
                  <thead>
                    <tr>
                      <th style={{ width: '130px' }}>Voucher No.</th>
                      <th style={{ width: '100px' }}>Date</th>
                      <th>Work / Supply Description</th>
                      <th>Beneficiary / Vendor</th>
                      <th style={{ width: '120px', textAlign: 'right' }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeModalRecord.expenditures.map((vch, idx) => (
                      <tr key={idx}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{vch.voucherNo}</td>
                        <td>{formatDateDDMMYYYY(vch.voucherDate)}</td>
                        <td>{vch.workDescription}</td>
                        <td>{vch.beneficiaryOrVendor}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#DC2626' }}>{formatINR(vch.amount)}</td>
                      </tr>
                    ))}
                    <tr style={{ background: '#FEF2F2', fontWeight: 700 }}>
                      <td colSpan={4} style={{ textAlign: 'right' }}>Total Expenditure Incurred:</td>
                      <td style={{ textAlign: 'right', color: '#DC2626' }}>{formatINR(activeModalRecord.expenditure)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section 2: Recoupment Bills from Consolidated Fund */}
              <div>
                <h4 className="modal-subtable-title">
                  <ArrowUpRight size={16} style={{ color: '#059669' }} />
                  <span>Recoupment Transactions from Consolidated Fund</span>
                </h4>
                {activeModalRecord.recoupments.length === 0 ? (
                  <div style={{ padding: '16px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', fontSize: '13px', color: '#92400E' }}>
                    No recoupment bills processed yet. Full advance amount of {formatINR(activeModalRecord.pendingRecoupment)} remains pending for supplementary budget provision.
                  </div>
                ) : (
                  <table className="modal-subtable">
                    <thead>
                      <tr>
                        <th style={{ width: '130px' }}>Recoupment Bill</th>
                        <th style={{ width: '100px' }}>Date</th>
                        <th>Supplementary Budget Head of Account</th>
                        <th style={{ width: '100px' }}>Token No.</th>
                        <th style={{ width: '120px', textAlign: 'right' }}>Recouped (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeModalRecord.recoupments.map((rec, idx) => (
                        <tr key={idx}>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{rec.billNo}</td>
                          <td>{formatDateDDMMYYYY(rec.billDate)}</td>
                          <td>{rec.supplementaryHead}</td>
                          <td style={{ fontFamily: 'monospace' }}>{rec.tokenNo}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: '#059669' }}>{formatINR(rec.amountRecouped)}</td>
                        </tr>
                      ))}
                      <tr style={{ background: '#ECFDF5', fontWeight: 700 }}>
                        <td colSpan={4} style={{ textAlign: 'right' }}>Total Recouped to Contingency Fund:</td>
                        <td style={{ textAlign: 'right', color: '#059669' }}>{formatINR(activeModalRecord.recoupment)}</td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="contingency-modal-footer">
              <button className="contingency-btn contingency-btn-secondary" onClick={() => setActiveModalRecord(null)}>
                Close
              </button>
              <button
                className="contingency-btn contingency-btn-primary"
                onClick={() => {
                  showToast(`Downloading Ledger Statement for ${activeModalRecord.bcoCode}...`);
                  setActiveModalRecord(null);
                }}
              >
                <Download size={14} />
                <span>Export Ledger Copy</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Comment & Stakeholder Feedback Layer --- */}
      <div className="contingency-comments-section">
        <CommentLayer screenId="sprint6-story4-contingency-fund-report" />
      </div>
    </div>
  );
}
