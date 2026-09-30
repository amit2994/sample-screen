import React, { useState, useMemo } from 'react';
import {
  Building2,
  Calendar,
  Filter,
  Download,
  Printer,
  RefreshCcw,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  PieChart,
  Layers,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Wallet,
  Coins,
  Receipt,
  ChevronRight,
  Eye,
  X,
  FileSpreadsheet,
  Info,
  DollarSign
} from 'lucide-react';
import CommentLayer from '../../components/feedback/CommentLayer';
import './NidhiFundsExpenditureReportScreen.css';

// --- Interfaces & Data Types ---

export interface Scheme {
  id: string;
  code: string;
  name: string;
  allocatedBudget: number;
  expenditure: number;
  balance: number;
  activeProjects: number;
}

export interface PeriodSummary {
  period: string; // e.g. Q1, H1, FY 2026-27
  receipts: number;
  expenditure: number;
  balance: number;
}

export interface NidhiFund {
  id: string;
  code: string;
  name: string;
  shortName: string;
  category: string;
  treasuryCode: string;
  treasuryName: string;
  totalGrant: number;
  totalExpenditure: number;
  availableBalance: number;
  committedBalance: number;
  lastUpdated: string;
  schemes: Scheme[];
  quarterlySummary: {
    Q1: PeriodSummary;
    Q2: PeriodSummary;
    Q3: PeriodSummary;
    Q4: PeriodSummary;
  };
  halfYearlySummary: {
    H1: PeriodSummary;
    H2: PeriodSummary;
  };
  yearlySummary: {
    '2026-27': PeriodSummary;
    '2025-26': PeriodSummary;
    '2024-25': PeriodSummary;
  };
}

export interface ExpenditureTransaction {
  id: string;
  voucherNo: string;
  sanctionOrderNo: string;
  date: string;
  nidhiFundId: string;
  schemeId: string;
  schemeName: string;
  ddoCode: string;
  ddoName: string;
  departmentName: string;
  workDetails: string;
  sanctionAmount: number;
  expenditureAmount: number;
  postAvailableBalance: number;
  paymentMode: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  halfYear: 'H1' | 'H2';
  fy: '2026-27' | '2025-26' | '2024-25';
  status: 'Disbursed' | 'Settled' | 'Sanctioned' | 'Under Audit';
}

// --- Mock Data ---

const NIDHI_FUNDS_DATA: NidhiFund[] = [
  {
    id: 'SDRF-01',
    code: '8121-00-122-001',
    name: 'State Disaster Response Nidhi Fund (SDRF)',
    shortName: 'SDRF Nidhi Fund',
    category: 'Statutory Reserve Nidhi Fund',
    treasuryCode: 'TR-101',
    treasuryName: 'District Treasury Bhopal / State Nidhi Cell',
    totalGrant: 1500000000, // ₹ 150 Cr
    totalExpenditure: 654000000, // ₹ 65.4 Cr
    availableBalance: 786000000, // ₹ 78.6 Cr
    committedBalance: 60000000, // ₹ 6 Cr
    lastUpdated: '2026-09-29 16:45',
    schemes: [
      {
        id: 'SCH-SDRF-01',
        code: 'SDRF-FLD-01',
        name: 'Flood Control, Embankment & River Protection Works',
        allocatedBudget: 500000000,
        expenditure: 245000000,
        balance: 255000000,
        activeProjects: 14
      },
      {
        id: 'SCH-SDRF-02',
        code: 'SDRF-SHL-02',
        name: 'Disaster Resilient Multipurpose Cyclone/Flood Shelter Construction',
        allocatedBudget: 450000000,
        expenditure: 198000000,
        balance: 252000000,
        activeProjects: 9
      },
      {
        id: 'SCH-SDRF-03',
        code: 'SDRF-MED-03',
        name: 'Emergency Medical Supply, Equipment & Relief Material Procurement',
        allocatedBudget: 300000000,
        expenditure: 141000000,
        balance: 159000000,
        activeProjects: 22
      },
      {
        id: 'SCH-SDRF-04',
        code: 'SDRF-DRG-04',
        name: 'Drought Mitigation & Rural Emergency Water Supply Infrastructure',
        allocatedBudget: 250000000,
        expenditure: 70000000,
        balance: 180000000,
        activeProjects: 7
      }
    ],
    quarterlySummary: {
      Q1: { period: 'Q1 (Apr-Jun)', receipts: 500000000, expenditure: 180000000, balance: 320000000 },
      Q2: { period: 'Q2 (Jul-Sep)', receipts: 400000000, expenditure: 214000000, balance: 186000000 },
      Q3: { period: 'Q3 (Oct-Dec)', receipts: 350000000, expenditure: 160000000, balance: 190000000 },
      Q4: { period: 'Q4 (Jan-Mar)', receipts: 250000000, expenditure: 100000000, balance: 150000000 }
    },
    halfYearlySummary: {
      H1: { period: 'H1 (Apr-Sep)', receipts: 900000000, expenditure: 394000000, balance: 506000000 },
      H2: { period: 'H2 (Oct-Mar)', receipts: 600000000, expenditure: 260000000, balance: 340000000 }
    },
    yearlySummary: {
      '2026-27': { period: 'FY 2026-27', receipts: 1500000000, expenditure: 654000000, balance: 786000000 },
      '2025-26': { period: 'FY 2025-26', receipts: 1350000000, expenditure: 1120000000, balance: 230000000 },
      '2024-25': { period: 'FY 2024-25', receipts: 1200000000, expenditure: 1050000000, balance: 150000000 }
    }
  },
  {
    id: 'DMDF-02',
    code: '8121-00-125-002',
    name: 'District Mineral Development Nidhi Fund (DMDF)',
    shortName: 'Mineral Development Nidhi',
    category: 'Local Infrastructure Development Nidhi',
    treasuryCode: 'TR-104',
    treasuryName: 'District Treasury Mining Cell Indore',
    totalGrant: 850000000, // ₹ 85 Cr
    totalExpenditure: 320000000, // ₹ 32 Cr
    availableBalance: 495000000, // ₹ 49.5 Cr
    committedBalance: 35000000, // ₹ 3.5 Cr
    lastUpdated: '2026-09-30 11:15',
    schemes: [
      {
        id: 'SCH-DMDF-01',
        code: 'DMDF-RD-01',
        name: 'Mining Belt Connectivity Roads & Bridge Infrastructure',
        allocatedBudget: 350000000,
        expenditure: 145000000,
        balance: 205000000,
        activeProjects: 8
      },
      {
        id: 'SCH-DMDF-02',
        code: 'DMDF-HLT-02',
        name: 'Mining Affected Village Healthcare Centers & Clean Water Systems',
        allocatedBudget: 280000000,
        expenditure: 105000000,
        balance: 175000000,
        activeProjects: 12
      },
      {
        id: 'SCH-DMDF-03',
        code: 'DMDF-EDU-03',
        name: 'Tribal Area Skill Development & School Upgradation',
        allocatedBudget: 220000000,
        expenditure: 70000000,
        balance: 150000000,
        activeProjects: 6
      }
    ],
    quarterlySummary: {
      Q1: { period: 'Q1 (Apr-Jun)', receipts: 300000000, expenditure: 95000000, balance: 205000000 },
      Q2: { period: 'Q2 (Jul-Sep)', receipts: 250000000, expenditure: 115000000, balance: 135000000 },
      Q3: { period: 'Q3 (Oct-Dec)', receipts: 180000000, expenditure: 70000000, balance: 110000000 },
      Q4: { period: 'Q4 (Jan-Mar)', receipts: 120000000, expenditure: 40000000, balance: 80000000 }
    },
    halfYearlySummary: {
      H1: { period: 'H1 (Apr-Sep)', receipts: 550000000, expenditure: 210000000, balance: 340000000 },
      H2: { period: 'H2 (Oct-Mar)', receipts: 300000000, expenditure: 110000000, balance: 190000000 }
    },
    yearlySummary: {
      '2026-27': { period: 'FY 2026-27', receipts: 850000000, expenditure: 320000000, balance: 495000000 },
      '2025-26': { period: 'FY 2025-26', receipts: 750000000, expenditure: 620000000, balance: 130000000 },
      '2024-25': { period: 'FY 2024-25', receipts: 600000000, expenditure: 540000000, balance: 60000000 }
    }
  },
  {
    id: 'IDRF-03',
    code: '8121-00-130-003',
    name: 'Infrastructure Development & Regeneration Nidhi Fund (IDRF)',
    shortName: 'Urban Infra Nidhi',
    category: 'Capital Creation Nidhi Fund',
    treasuryCode: 'TR-102',
    treasuryName: 'State Central Treasury Urban Development Division',
    totalGrant: 2200000000, // ₹ 220 Cr
    totalExpenditure: 1100000000, // ₹ 110 Cr
    availableBalance: 1020000000, // ₹ 102 Cr
    committedBalance: 80000000, // ₹ 8 Cr
    lastUpdated: '2026-09-28 09:30',
    schemes: [
      {
        id: 'SCH-IDRF-01',
        code: 'IDRF-URB-01',
        name: 'Smart City Smart Mobility & Drainage Corridor Development',
        allocatedBudget: 1200000000,
        expenditure: 640000000,
        balance: 560000000,
        activeProjects: 18
      },
      {
        id: 'SCH-IDRF-02',
        code: 'IDRF-WTR-02',
        name: 'Urban Bulk Water Supply & Treatment Plant Modernization',
        allocatedBudget: 1000000000,
        expenditure: 460000000,
        balance: 540000000,
        activeProjects: 11
      }
    ],
    quarterlySummary: {
      Q1: { period: 'Q1 (Apr-Jun)', receipts: 700000000, expenditure: 320000000, balance: 380000000 },
      Q2: { period: 'Q2 (Jul-Sep)', receipts: 600000000, expenditure: 380000000, balance: 220000000 },
      Q3: { period: 'Q3 (Oct-Dec)', receipts: 500000000, expenditure: 250000000, balance: 250000000 },
      Q4: { period: 'Q4 (Jan-Mar)', receipts: 400000000, expenditure: 150000000, balance: 250000000 }
    },
    halfYearlySummary: {
      H1: { period: 'H1 (Apr-Sep)', receipts: 1300000000, expenditure: 700000000, balance: 600000000 },
      H2: { period: 'H2 (Oct-Mar)', receipts: 900000000, expenditure: 400000000, balance: 500000000 }
    },
    yearlySummary: {
      '2026-27': { period: 'FY 2026-27', receipts: 2200000000, expenditure: 1100000000, balance: 1020000000 },
      '2025-26': { period: 'FY 2025-26', receipts: 1900000000, expenditure: 1650000000, balance: 250000000 },
      '2024-25': { period: 'FY 2024-25', receipts: 1600000000, expenditure: 1480000000, balance: 120000000 }
    }
  },
  {
    id: 'GPDF-04',
    code: '8121-00-135-004',
    name: 'Gram Panchayat Rural Development Nidhi Fund (GPDF)',
    shortName: 'Gram Panchayat Nidhi',
    category: 'Panchayati Raj Welfare Nidhi',
    treasuryCode: 'TR-108',
    treasuryName: 'Panchayati Raj Treasury Jabalpur',
    totalGrant: 620000000,
    totalExpenditure: 215000000,
    availableBalance: 380000000,
    committedBalance: 25000000,
    lastUpdated: '2026-09-30 08:20',
    schemes: [
      {
        id: 'SCH-GPDF-01',
        code: 'GPDF-PRI-01',
        name: 'Gram Bhavan Solarization & Digital Connectivity',
        allocatedBudget: 320000000,
        expenditure: 125000000,
        balance: 195000000,
        activeProjects: 34
      },
      {
        id: 'SCH-GPDF-02',
        code: 'GPDF-SAN-02',
        name: 'Village Waste Management & Liquid Sanitation Infrastructure',
        allocatedBudget: 300000000,
        expenditure: 90000000,
        balance: 210000000,
        activeProjects: 26
      }
    ],
    quarterlySummary: {
      Q1: { period: 'Q1 (Apr-Jun)', receipts: 200000000, expenditure: 65000000, balance: 135000000 },
      Q2: { period: 'Q2 (Jul-Sep)', receipts: 180000000, expenditure: 80000000, balance: 100000000 },
      Q3: { period: 'Q3 (Oct-Dec)', receipts: 140000000, expenditure: 40000000, balance: 100000000 },
      Q4: { period: 'Q4 (Jan-Mar)', receipts: 100000000, expenditure: 30000000, balance: 70000000 }
    },
    halfYearlySummary: {
      H1: { period: 'H1 (Apr-Sep)', receipts: 380000000, expenditure: 145000000, balance: 235000000 },
      H2: { period: 'H2 (Oct-Mar)', receipts: 240000000, expenditure: 70000000, balance: 170000000 }
    },
    yearlySummary: {
      '2026-27': { period: 'FY 2026-27', receipts: 620000000, expenditure: 215000000, balance: 380000000 },
      '2025-26': { period: 'FY 2025-26', receipts: 550000000, expenditure: 480000000, balance: 70000000 },
      '2024-25': { period: 'FY 2024-25', receipts: 480000000, expenditure: 430000000, balance: 50000000 }
    }
  }
];

const TRANSACTIONS_DATA: ExpenditureTransaction[] = [
  {
    id: 'TXN-SDRF-001',
    voucherNo: 'VCH/2026/SDRF/1042',
    sanctionOrderNo: 'ORD-SDRF-2026-881',
    date: '2026-08-14',
    nidhiFundId: 'SDRF-01',
    schemeId: 'SCH-SDRF-01',
    schemeName: 'Flood Control, Embankment & River Protection Works',
    ddoCode: 'DDO-WRD-BHOPAL-01',
    ddoName: 'Executive Engineer Water Resources Div 1',
    departmentName: 'Water Resources Department',
    workDetails: 'Construction of 2.4km Reinforced Concrete Embankment along Narmada Basin Package II',
    sanctionAmount: 45000000,
    expenditureAmount: 42500000,
    postAvailableBalance: 824100000,
    paymentMode: 'E-Treasury PFMS / Direct Transfer',
    quarter: 'Q2',
    halfYear: 'H1',
    fy: '2026-27',
    status: 'Settled'
  },
  {
    id: 'TXN-SDRF-002',
    voucherNo: 'VCH/2026/SDRF/1098',
    sanctionOrderNo: 'ORD-SDRF-2026-904',
    date: '2026-07-22',
    nidhiFundId: 'SDRF-01',
    schemeId: 'SCH-SDRF-03',
    schemeName: 'Emergency Medical Supply, Equipment & Relief Material Procurement',
    ddoCode: 'DDO-HEALTH-IND-04',
    ddoName: 'Chief Medical & Health Officer (CMHO)',
    departmentName: 'Public Health & Family Welfare',
    workDetails: 'Procurement of High-capacity De-watering Pumps, Boats & Rapid Medical Kits for Monsoon Preparedness',
    sanctionAmount: 28000000,
    expenditureAmount: 27500000,
    postAvailableBalance: 866600000,
    paymentMode: 'E-Treasury PFMS / Direct Transfer',
    quarter: 'Q2',
    halfYear: 'H1',
    fy: '2026-27',
    status: 'Disbursed'
  },
  {
    id: 'TXN-SDRF-003',
    voucherNo: 'VCH/2026/SDRF/0788',
    sanctionOrderNo: 'ORD-SDRF-2026-720',
    date: '2026-05-18',
    nidhiFundId: 'SDRF-01',
    schemeId: 'SCH-SDRF-02',
    schemeName: 'Disaster Resilient Multipurpose Cyclone/Flood Shelter Construction',
    ddoCode: 'DDO-PWD-UJJAIN-02',
    ddoName: 'Superintending Engineer PWD Building Circle',
    departmentName: 'Public Works Department',
    workDetails: 'Construction of 500-person Multipurpose Cyclone Shelter with Solar Back-up in Flood Prone Zone A',
    sanctionAmount: 35000000,
    expenditureAmount: 35000000,
    postAvailableBalance: 894100000,
    paymentMode: 'Challan Adjustment',
    quarter: 'Q1',
    halfYear: 'H1',
    fy: '2026-27',
    status: 'Settled'
  },
  {
    id: 'TXN-SDRF-004',
    voucherNo: 'VCH/2026/SDRF/0540',
    sanctionOrderNo: 'ORD-SDRF-2026-412',
    date: '2026-04-10',
    nidhiFundId: 'SDRF-01',
    schemeId: 'SCH-SDRF-04',
    schemeName: 'Drought Mitigation & Rural Emergency Water Supply Infrastructure',
    ddoCode: 'DDO-PHED-GWAL-05',
    ddoName: 'Executive Engineer PHE Division 2',
    departmentName: 'Public Health Engineering Department',
    workDetails: 'Deep Borewell Augmentation & Solar Pump Installation across 18 Vulnerable Gram Panchayats',
    sanctionAmount: 22000000,
    expenditureAmount: 21000000,
    postAvailableBalance: 929100000,
    paymentMode: 'E-Treasury PFMS / Direct Transfer',
    quarter: 'Q1',
    halfYear: 'H1',
    fy: '2026-27',
    status: 'Disbursed'
  },
  {
    id: 'TXN-DMDF-001',
    voucherNo: 'VCH/2026/DMDF/0411',
    sanctionOrderNo: 'ORD-DMDF-2026-302',
    date: '2026-08-05',
    nidhiFundId: 'DMDF-02',
    schemeId: 'SCH-DMDF-01',
    schemeName: 'Mining Belt Connectivity Roads & Bridge Infrastructure',
    ddoCode: 'DDO-RES-INDORE-01',
    ddoName: 'Executive Engineer Rural Engineering Services',
    departmentName: 'Panchayat & Rural Development',
    workDetails: 'Heavy Duty Rigid Pavement Road Construction from Quarry Zone 4 to State Highway 12',
    sanctionAmount: 55000000,
    expenditureAmount: 52000000,
    postAvailableBalance: 512000000,
    paymentMode: 'E-Treasury PFMS / Direct Transfer',
    quarter: 'Q2',
    halfYear: 'H1',
    fy: '2026-27',
    status: 'Settled'
  },
  {
    id: 'TXN-DMDF-002',
    voucherNo: 'VCH/2026/DMDF/0289',
    sanctionOrderNo: 'ORD-DMDF-2026-190',
    date: '2026-06-12',
    nidhiFundId: 'DMDF-02',
    schemeId: 'SCH-DMDF-02',
    schemeName: 'Mining Affected Village Healthcare Centers & Clean Water Systems',
    ddoCode: 'DDO-HEALTH-IND-04',
    ddoName: 'CMHO Mining District Cell',
    departmentName: 'Public Health & Family Welfare',
    workDetails: 'Mobile Medical Care Unit Van Operating Expenses & Respiratory Health Screening Camps',
    sanctionAmount: 18000000,
    expenditureAmount: 16500000,
    postAvailableBalance: 564000000,
    paymentMode: 'Reserve Account Credit',
    quarter: 'Q1',
    halfYear: 'H1',
    fy: '2026-27',
    status: 'Disbursed'
  },
  {
    id: 'TXN-IDRF-001',
    voucherNo: 'VCH/2026/IDRF/2104',
    sanctionOrderNo: 'ORD-IDRF-2026-990',
    date: '2026-07-15',
    nidhiFundId: 'IDRF-03',
    schemeId: 'SCH-IDRF-01',
    schemeName: 'Smart City Smart Mobility & Drainage Corridor Development',
    ddoCode: 'DDO-BMC-BHOPAL-01',
    ddoName: 'Commissioner Municipal Corporation Bhopal',
    departmentName: 'Urban Development & Housing',
    workDetails: 'Underground Stormwater Drain Corridor Construction Phase III with Automated Sensors',
    sanctionAmount: 120000000,
    expenditureAmount: 115000000,
    postAvailableBalance: 1045000000,
    paymentMode: 'E-Treasury PFMS / Direct Transfer',
    quarter: 'Q2',
    halfYear: 'H1',
    fy: '2026-27',
    status: 'Settled'
  },
  {
    id: 'TXN-GPDF-001',
    voucherNo: 'VCH/2026/GPDF/0912',
    sanctionOrderNo: 'ORD-GPDF-2026-221',
    date: '2026-08-28',
    nidhiFundId: 'GPDF-04',
    schemeId: 'SCH-GPDF-01',
    schemeName: 'Gram Bhavan Solarization & Digital Connectivity',
    ddoCode: 'DDO-PRD-JABAL-03',
    ddoName: 'District Panchayat Officer Jabalpur',
    departmentName: 'Panchayati Raj Department',
    workDetails: 'Installation of 5kW Off-grid Solar Systems across 24 Gram Panchayat Buildings',
    sanctionAmount: 24000000,
    expenditureAmount: 22500000,
    postAvailableBalance: 391500000,
    paymentMode: 'E-Treasury PFMS / Direct Transfer',
    quarter: 'Q2',
    halfYear: 'H1',
    fy: '2026-27',
    status: 'Disbursed'
  }
];

export default function NidhiFundsExpenditureReportScreen() {
  // --- States ---

  // 1. Primary Nidhi Fund Selection
  const [selectedFundId, setSelectedFundId] = useState<string>('SDRF-01');

  // 2. Date Range Filters
  const [fromDate, setFromDate] = useState<string>('2026-04-01');
  const [toDate, setToDate] = useState<string>('2026-09-30');

  // 3. Periodicity Filter: All, Quarterly, Half Yearly, Yearly
  const [periodicity, setPeriodicity] = useState<'ALL' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY'>('ALL');
  const [selectedQuarter, setSelectedQuarter] = useState<'ALL' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('ALL');
  const [selectedHalfYear, setSelectedHalfYear] = useState<'ALL' | 'H1' | 'H2'>('ALL');
  const [selectedFY, setSelectedFY] = useState<'ALL' | '2026-27' | '2025-26' | '2024-25'>('2026-27');

  // 4. Scheme Filter
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('ALL');

  // 5. Additional Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 6. UI Modals / Active Items
  const [viewTransaction, setViewTransaction] = useState<ExpenditureTransaction | null>(null);
  const [showExportToast, setShowExportToast] = useState<string | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<'TRANSACTIONS' | 'SCHEME_BREAKDOWN' | 'PERIOD_COMPARISON'>('TRANSACTIONS');

  // --- Derived Calculations ---

  // Get currently selected Nidhi Fund details
  const activeFund = useMemo(() => {
    return NIDHI_FUNDS_DATA.find((f) => f.id === selectedFundId) || NIDHI_FUNDS_DATA[0];
  }, [selectedFundId]);

  // Available Schemes for selected Nidhi Fund
  const availableSchemes = useMemo(() => {
    return activeFund ? activeFund.schemes : [];
  }, [activeFund]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return TRANSACTIONS_DATA.filter((tx) => {
      // Must match selected Nidhi Fund
      if (tx.nidhiFundId !== selectedFundId) return false;

      // Filter by scheme
      if (selectedSchemeId !== 'ALL' && tx.schemeId !== selectedSchemeId) return false;

      // Filter by Periodicity
      if (periodicity === 'QUARTERLY' && selectedQuarter !== 'ALL' && tx.quarter !== selectedQuarter) return false;
      if (periodicity === 'HALF_YEARLY' && selectedHalfYear !== 'ALL' && tx.halfYear !== selectedHalfYear) return false;
      if (periodicity === 'YEARLY' && selectedFY !== 'ALL' && tx.fy !== selectedFY) return false;

      // Filter by status
      if (statusFilter !== 'ALL' && tx.status !== statusFilter) return false;

      // Filter by Date Range
      if (fromDate && tx.date < fromDate) return false;
      if (toDate && tx.date > toDate) return false;

      // Search term
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesVoucher = tx.voucherNo.toLowerCase().includes(query);
        const matchesOrder = tx.sanctionOrderNo.toLowerCase().includes(query);
        const matchesWork = tx.workDetails.toLowerCase().includes(query);
        const matchesDDO = tx.ddoName.toLowerCase().includes(query) || tx.ddoCode.toLowerCase().includes(query);
        if (!matchesVoucher && !matchesOrder && !matchesWork && !matchesDDO) return false;
      }

      return true;
    });
  }, [
    selectedFundId,
    selectedSchemeId,
    periodicity,
    selectedQuarter,
    selectedHalfYear,
    selectedFY,
    statusFilter,
    fromDate,
    toDate,
    searchTerm
  ]);

  // Expenditure summary statistics
  const metrics = useMemo(() => {
    const totalTxCount = filteredTransactions.length;
    const totalExpInPeriod = filteredTransactions.reduce((acc, curr) => acc + curr.expenditureAmount, 0);
    const totalSanctionInPeriod = filteredTransactions.reduce((acc, curr) => acc + curr.sanctionAmount, 0);
    const utilizationRate = activeFund.totalGrant > 0 
      ? ((activeFund.totalExpenditure / activeFund.totalGrant) * 100).toFixed(1) 
      : '0.0';

    return {
      totalTxCount,
      totalExpInPeriod,
      totalSanctionInPeriod,
      utilizationRate
    };
  }, [filteredTransactions, activeFund]);

  // Helper formatting function for Indian Currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  // Preset Handlers
  const handleFundChange = (fundId: string) => {
    setSelectedFundId(fundId);
    setSelectedSchemeId('ALL'); // reset scheme selection when fund changes
  };

  const handleApplyPresetDate = (type: 'FY' | 'Q1' | 'H1' | 'LAST_30') => {
    if (type === 'FY') {
      setFromDate('2026-04-01');
      setToDate('2027-03-31');
    } else if (type === 'Q1') {
      setFromDate('2026-04-01');
      setToDate('2026-06-30');
      setPeriodicity('QUARTERLY');
      setSelectedQuarter('Q1');
    } else if (type === 'H1') {
      setFromDate('2026-04-01');
      setToDate('2026-09-30');
      setPeriodicity('HALF_YEARLY');
      setSelectedHalfYear('H1');
    } else if (type === 'LAST_30') {
      setFromDate('2026-09-01');
      setToDate('2026-09-30');
    }
  };

  const handleResetFilters = () => {
    setFromDate('2026-04-01');
    setToDate('2026-09-30');
    setPeriodicity('ALL');
    setSelectedQuarter('ALL');
    setSelectedHalfYear('ALL');
    setSelectedFY('2026-27');
    setSelectedSchemeId('ALL');
    setStatusFilter('ALL');
    setSearchTerm('');
  };

  const handleTriggerExport = (type: 'PDF' | 'EXCEL' | 'PRINT') => {
    setShowExportToast(`Generating ${type} Nidhi Funds Expenditure Report for ${activeFund.shortName}...`);
    setTimeout(() => {
      setShowExportToast(null);
      if (type === 'PRINT') window.print();
    }, 2500);
  };

  return (
    <div className="nidhi-screen">
      {/* Toast Notification */}
      {showExportToast && (
        <div className="nidhi-toast">
          <Sparkles className="spin-icon" size={18} />
          <span>{showExportToast}</span>
        </div>
      )}

      {/* --- Top Header & Action Controls --- */}
      <div className="nidhi-header">
        <div className="nidhi-header-left">
          <div className="nidhi-header-tag">
            <Coins size={14} />
            <span>Nidhi Fund Management & Expenditure Audit</span>
          </div>
          <h1>Nidhi Funds Expenditure Report</h1>
          <p>
            Real-time balance monitoring, scheme-wise fund allocation, and multi-period expenditure statements for State Nidhi Reserves.
          </p>
        </div>

        <div className="nidhi-header-actions">
          <button className="nidhi-btn nidhi-btn-secondary" onClick={() => handleTriggerExport('PDF')}>
            <Download size={15} />
            <span>Export PDF</span>
          </button>
          <button className="nidhi-btn nidhi-btn-secondary" onClick={() => handleTriggerExport('EXCEL')}>
            <FileSpreadsheet size={15} />
            <span>Export Excel</span>
          </button>
          <button className="nidhi-btn nidhi-btn-primary" onClick={() => handleTriggerExport('PRINT')}>
            <Printer size={15} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* --- Section 1: Primary Nidhi Fund Selector & Available Balance Banner --- */}
      <div className="nidhi-selection-grid">
        {/* Nidhi Fund Selection Card */}
        <div className="nidhi-card nidhi-fund-selector-card">
          <div className="nidhi-card-header">
            <div className="nidhi-card-title">
              <Wallet size={18} className="nidhi-icon-purple" />
              <h3>Select Nidhi Fund</h3>
            </div>
            <span className="nidhi-badge nidhi-badge-info">{NIDHI_FUNDS_DATA.length} Available Funds</span>
          </div>

          <div className="nidhi-card-body">
            <label className="nidhi-field-label">
              Choose Nidhi Fund Account <span className="nidhi-required">*</span>
            </label>
            <select
              className="nidhi-select nidhi-select-large"
              value={selectedFundId}
              onChange={(e) => handleFundChange(e.target.value)}
            >
              {NIDHI_FUNDS_DATA.map((fund) => (
                <option key={fund.id} value={fund.id}>
                  {fund.name} [{fund.code}]
                </option>
              ))}
            </select>

            <div className="nidhi-fund-meta-strip">
              <div className="meta-item">
                <span className="meta-label">Category:</span>
                <span className="meta-val">{activeFund.category}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Treasury Mapped:</span>
                <span className="meta-val">{activeFund.treasuryName}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Head of Account:</span>
                <span className="meta-val code-font">{activeFund.code}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PROMINENT AVAILABLE BALANCE DISPLAY CARD */}
        <div className="nidhi-card nidhi-balance-display-card">
          <div className="nidhi-balance-header">
            <div>
              <span className="balance-label-tag">Net Available Balance</span>
              <h2 className="nidhi-balance-amount">{formatCurrency(activeFund.availableBalance)}</h2>
            </div>
            <div className="nidhi-utilization-badge">
              <TrendingUp size={16} />
              <span>{metrics.utilizationRate}% Utilized</span>
            </div>
          </div>

          <div className="nidhi-progress-container">
            <div className="nidhi-progress-bar">
              <div
                className="nidhi-progress-fill"
                style={{ width: `${Math.min(100, Number(metrics.utilizationRate))}%` }}
              />
            </div>
            <div className="nidhi-progress-labels">
              <span>Spent: {formatCurrency(activeFund.totalExpenditure)}</span>
              <span>Total Sanctioned: {formatCurrency(activeFund.totalGrant)}</span>
            </div>
          </div>

          <div className="nidhi-balance-footer-grid">
            <div className="balance-sub-stat">
              <span className="sub-stat-label">Committed / Encumbered</span>
              <span className="sub-stat-value">{formatCurrency(activeFund.committedBalance)}</span>
            </div>
            <div className="balance-sub-stat">
              <span className="sub-stat-label">Total Active Schemes</span>
              <span className="sub-stat-value">{activeFund.schemes.length} Schemes</span>
            </div>
              <div className="balance-sub-stat">
              <span className="sub-stat-label">Last Audit Sync</span>
              <span className="sub-stat-value">{activeFund.lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Section 2: Comprehensive Filters Panel --- */}
      <div className="nidhi-card nidhi-filter-card">
        <div className="nidhi-card-header flex-between">
          <div className="nidhi-card-title">
            <Filter size={18} className="nidhi-icon-purple" />
            <h3>Report Filter Controls</h3>
          </div>
          <button className="nidhi-btn-link" onClick={handleResetFilters}>
            <RefreshCcw size={14} />
            <span>Reset All Filters</span>
          </button>
        </div>

        <div className="nidhi-filter-grid">
          {/* FILTER 1: Date Range Filter (From Date to To Date) */}
          <div className="filter-group">
            <label className="nidhi-field-label">
              <Calendar size={14} />
              <span>Period (From Date - To Date)</span>
            </label>
            <div className="nidhi-date-inputs">
              <input
                type="date"
                className="nidhi-input"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
              <span className="date-to-sep">to</span>
              <input
                type="date"
                className="nidhi-input"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            {/* Quick Date Presets */}
            <div className="nidhi-preset-chips">
              <button className="preset-chip" onClick={() => handleApplyPresetDate('FY')}>Current FY</button>
              <button className="preset-chip" onClick={() => handleApplyPresetDate('H1')}>H1 (Apr-Sep)</button>
              <button className="preset-chip" onClick={() => handleApplyPresetDate('Q1')}>Q1 (Apr-Jun)</button>
              <button className="preset-chip" onClick={() => handleApplyPresetDate('LAST_30')}>Last 30 Days</button>
            </div>
          </div>

          {/* FILTER 2: Periodicity Filter (Quarterly, Half Yearly, Yearly) */}
          <div className="filter-group">
            <label className="nidhi-field-label">
              <Layers size={14} />
              <span>Periodicity Filter</span>
            </label>
            <div className="nidhi-toggle-group">
              <button
                className={`toggle-btn ${periodicity === 'ALL' ? 'active' : ''}`}
                onClick={() => setPeriodicity('ALL')}
              >
                All
              </button>
              <button
                className={`toggle-btn ${periodicity === 'QUARTERLY' ? 'active' : ''}`}
                onClick={() => setPeriodicity('QUARTERLY')}
              >
                Quarterly
              </button>
              <button
                className={`toggle-btn ${periodicity === 'HALF_YEARLY' ? 'active' : ''}`}
                onClick={() => setPeriodicity('HALF_YEARLY')}
              >
                Half Yearly
              </button>
              <button
                className={`toggle-btn ${periodicity === 'YEARLY' ? 'active' : ''}`}
                onClick={() => setPeriodicity('YEARLY')}
              >
                Yearly
              </button>
            </div>

            {/* Sub-selector depending on selected periodicity */}
            {periodicity === 'QUARTERLY' && (
              <select
                className="nidhi-select nidhi-select-sub"
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value as any)}
              >
                <option value="ALL">All Quarters (Q1 - Q4)</option>
                <option value="Q1">Quarter 1 (Apr - Jun)</option>
                <option value="Q2">Quarter 2 (Jul - Sep)</option>
                <option value="Q3">Quarter 3 (Oct - Dec)</option>
                <option value="Q4">Quarter 4 (Jan - Mar)</option>
              </select>
            )}

            {periodicity === 'HALF_YEARLY' && (
              <select
                className="nidhi-select nidhi-select-sub"
                value={selectedHalfYear}
                onChange={(e) => setSelectedHalfYear(e.target.value as any)}
              >
                <option value="ALL">Both Half Years (H1 & H2)</option>
                <option value="H1">H1 (First Half: Apr - Sep)</option>
                <option value="H2">H2 (Second Half: Oct - Mar)</option>
              </select>
            )}

            {periodicity === 'YEARLY' && (
              <select
                className="nidhi-select nidhi-select-sub"
                value={selectedFY}
                onChange={(e) => setSelectedFY(e.target.value as any)}
              >
                <option value="ALL">All Financial Years</option>
                <option value="2026-27">Financial Year 2026-27</option>
                <option value="2025-26">Financial Year 2025-26</option>
                <option value="2024-25">Financial Year 2024-25</option>
              </select>
            )}
          </div>

          {/* FILTER 3: Scheme Filter Dropdown */}
          <div className="filter-group">
            <label className="nidhi-field-label">
              <Building2 size={14} />
              <span>Select Scheme</span>
            </label>
            <select
              className="nidhi-select"
              value={selectedSchemeId}
              onChange={(e) => setSelectedSchemeId(e.target.value)}
            >
              <option value="ALL">All Schemes ({availableSchemes.length} Mapped Schemes)</option>
              {availableSchemes.map((scm) => (
                <option key={scm.id} value={scm.id}>
                  {scm.code} - {scm.name}
                </option>
              ))}
            </select>

            <div className="scheme-filter-info">
              {selectedSchemeId !== 'ALL' ? (
                (() => {
                  const scm = availableSchemes.find((s) => s.id === selectedSchemeId);
                  return scm ? (
                    <span>Allocated: {formatCurrency(scm.allocatedBudget)} | Exp: {formatCurrency(scm.expenditure)}</span>
                  ) : null;
                })()
              ) : (
                <span>Filtering across all {availableSchemes.length} schemes under {activeFund.shortName}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EXPENDITURE VOUCHERS TABLE */}
      <div className="nidhi-card nidhi-table-card">
          <div className="nidhi-table-wrapper">
            <table className="nidhi-table">
              <thead>
                <tr>
                  <th>Voucher Date / No.</th>
                  <th>Sanction Order</th>
                  <th>Scheme & Head of Account</th>
                  <th>DDO & Department</th>
                  <th>Work / Project Description</th>
                  <th className="text-right">Sanctioned (₹)</th>
                  <th className="text-right">Expenditure (₹)</th>
                  <th className="text-right">Post Available Bal (₹)</th>
                  <th>Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="empty-table-cell">
                      <AlertCircle size={32} className="empty-icon" />
                      <p className="empty-title">No expenditure transactions match your filters</p>
                      <p className="empty-sub">Try adjusting date range, scheme, or search keywords.</p>
                      <button className="nidhi-btn nidhi-btn-secondary margin-top-sm" onClick={handleResetFilters}>
                        Reset Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="table-row-hover">
                      <td>
                        <div className="font-semibold text-dark">{tx.voucherNo}</div>
                        <div className="text-xs text-muted flex-align-gap">
                          <Calendar size={12} />
                          <span>{tx.date}</span>
                        </div>
                      </td>
                      <td>
                        <span className="code-badge">{tx.sanctionOrderNo}</span>
                        <div className="text-xs text-muted mt-1">{tx.paymentMode}</div>
                      </td>
                      <td>
                        <div className="font-medium text-purple">{tx.schemeName}</div>
                        <div className="text-xs code-font text-muted">{tx.nidhiFundId}</div>
                      </td>
                      <td>
                        <div className="font-medium text-dark">{tx.ddoName}</div>
                        <div className="text-xs text-muted">{tx.departmentName}</div>
                      </td>
                      <td>
                        <div className="work-desc-clamp" title={tx.workDetails}>
                          {tx.workDetails}
                        </div>
                      </td>
                      <td className="text-right font-medium">
                        {formatCurrency(tx.sanctionAmount)}
                      </td>
                      <td className="text-right font-bold text-expenditure">
                        {formatCurrency(tx.expenditureAmount)}
                      </td>
                      <td className="text-right font-medium text-balance">
                        {formatCurrency(tx.postAvailableBalance)}
                      </td>
                      <td>
                        <span
                          className={`status-pill ${
                            tx.status === 'Settled'
                              ? 'status-settled'
                              : tx.status === 'Disbursed'
                              ? 'status-disbursed'
                              : 'status-pending'
                          }`}
                        >
                          {tx.status === 'Settled' && <CheckCircle2 size={12} />}
                          {tx.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          className="nidhi-action-icon-btn"
                          title="View Voucher Details"
                          onClick={() => setViewTransaction(tx)}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SCHEME-WISE BREAKDOWN */}
      {activeViewTab === 'SCHEME_BREAKDOWN' && (
        <div className="nidhi-card nidhi-scheme-card">
          <div className="nidhi-card-header">
            <div className="nidhi-card-title">
              <PieChart size={18} className="nidhi-icon-purple" />
              <h3>Scheme-wise Allocation & Expenditure Breakdown for {activeFund.shortName}</h3>
            </div>
          </div>

          <div className="scheme-grid">
            {activeFund.schemes.map((scm) => {
              const expPercent = scm.allocatedBudget > 0 
                ? ((scm.expenditure / scm.allocatedBudget) * 100).toFixed(1) 
                : '0';

              return (
                <div key={scm.id} className="scheme-item-card">
                  <div className="scheme-item-header">
                    <div>
                      <span className="code-badge">{scm.code}</span>
                      <h4 className="scheme-item-title">{scm.name}</h4>
                    </div>
                    <span className="scheme-project-tag">{scm.activeProjects} Active Works</span>
                  </div>

                  <div className="scheme-metrics-grid">
                    <div className="scm-metric">
                      <span className="scm-lbl">Allocated Budget</span>
                      <span className="scm-val">{formatCurrency(scm.allocatedBudget)}</span>
                    </div>
                    <div className="scm-metric">
                      <span className="scm-lbl">Expenditure Incurred</span>
                      <span className="scm-val text-expenditure">{formatCurrency(scm.expenditure)}</span>
                    </div>
                    <div className="scm-metric">
                      <span className="scm-lbl">Available Balance</span>
                      <span className="scm-val text-balance">{formatCurrency(scm.balance)}</span>
                    </div>
                  </div>

                  <div className="scheme-progress-bar-wrapper">
                    <div className="flex-between text-xs mb-1">
                      <span>Fund Utilization</span>
                      <span className="font-bold">{expPercent}%</span>
                    </div>
                    <div className="nidhi-progress-bar">
                      <div className="nidhi-progress-fill" style={{ width: `${expPercent}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PERIOD COMPARISON (QUARTERLY / HALF YEARLY / YEARLY) */}
      {activeViewTab === 'PERIOD_COMPARISON' && (
        <div className="nidhi-card nidhi-period-card">
          <div className="nidhi-card-header">
            <div className="nidhi-card-title">
              <TrendingUp size={18} className="nidhi-icon-purple" />
              <h3>Periodic Expenditure & Receipt Statement ({activeFund.shortName})</h3>
            </div>
          </div>

          <div className="period-section">
            <h4 className="period-section-title">1. Quarterly Breakdown (FY 2026-27)</h4>
            <div className="period-table-wrapper">
              <table className="nidhi-table">
                <thead>
                  <tr>
                    <th>Quarter</th>
                    <th className="text-right">Receipts / Allocations (₹)</th>
                    <th className="text-right">Expenditure (₹)</th>
                    <th className="text-right">Quarter-End Net Balance (₹)</th>
                    <th>Utilization Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(activeFund.quarterlySummary).map(([qKey, qData]) => {
                    const pct = qData.receipts > 0 ? ((qData.expenditure / qData.receipts) * 100).toFixed(1) : '0';
                    return (
                      <tr key={qKey}>
                        <td className="font-bold text-purple">{qData.period}</td>
                        <td className="text-right">{formatCurrency(qData.receipts)}</td>
                        <td className="text-right font-bold text-expenditure">{formatCurrency(qData.expenditure)}</td>
                        <td className="text-right font-medium text-balance">{formatCurrency(qData.balance)}</td>
                        <td>
                          <div className="flex-align-gap">
                            <div className="nidhi-progress-bar width-100">
                              <div className="nidhi-progress-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs font-semibold">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="period-section mt-6">
            <h4 className="period-section-title">2. Half-Yearly Breakdown (FY 2026-27)</h4>
            <div className="period-table-wrapper">
              <table className="nidhi-table">
                <thead>
                  <tr>
                    <th>Half Year</th>
                    <th className="text-right">Total Grant Received (₹)</th>
                    <th className="text-right">Cumulative Expenditure (₹)</th>
                    <th className="text-right">Closing Balance (₹)</th>
                    <th>Half-Yearly Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(activeFund.halfYearlySummary).map(([hKey, hData]) => {
                    const pct = hData.receipts > 0 ? ((hData.expenditure / hData.receipts) * 100).toFixed(1) : '0';
                    return (
                      <tr key={hKey}>
                        <td className="font-bold text-purple">{hData.period}</td>
                        <td className="text-right">{formatCurrency(hData.receipts)}</td>
                        <td className="text-right font-bold text-expenditure">{formatCurrency(hData.expenditure)}</td>
                        <td className="text-right font-medium text-balance">{formatCurrency(hData.balance)}</td>
                        <td>
                          <span className="status-pill status-settled">{pct}% Utilized</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="period-section mt-6">
            <h4 className="period-section-title">3. Multi-Year Comparative Trend</h4>
            <div className="period-table-wrapper">
              <table className="nidhi-table">
                <thead>
                  <tr>
                    <th>Financial Year</th>
                    <th className="text-right">Sanctioned Grant (₹)</th>
                    <th className="text-right">Total Expenditure (₹)</th>
                    <th className="text-right">Surplus / Available Balance (₹)</th>
                    <th>Annual Execution Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(activeFund.yearlySummary).map(([yKey, yData]) => {
                    const pct = yData.receipts > 0 ? ((yData.expenditure / yData.receipts) * 100).toFixed(1) : '0';
                    return (
                      <tr key={yKey}>
                        <td className="font-bold text-dark">{yData.period}</td>
                        <td className="text-right">{formatCurrency(yData.receipts)}</td>
                        <td className="text-right font-bold text-expenditure">{formatCurrency(yData.expenditure)}</td>
                        <td className="text-right font-medium text-balance">{formatCurrency(yData.balance)}</td>
                        <td>
                          <span className="status-pill status-disbursed">{pct}% Executed</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TRANSACTION DETAIL MODAL --- */}
      {viewTransaction && (
        <div className="nidhi-modal-overlay">
          <div className="nidhi-modal">
            <div className="nidhi-modal-header">
              <div className="flex-align-gap">
                <Receipt className="text-purple" size={20} />
                <h3>Voucher & Expenditure Detail</h3>
              </div>
              <button className="nidhi-modal-close" onClick={() => setViewTransaction(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="nidhi-modal-body">
              <div className="modal-banner">
                <div>
                  <span className="text-xs text-muted">Sanctioned Expenditure Amount</span>
                  <h2 className="modal-amount">{formatCurrency(viewTransaction.expenditureAmount)}</h2>
                </div>
                <span className="status-pill status-settled">{viewTransaction.status}</span>
              </div>

              <div className="modal-detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Voucher Number</span>
                  <span className="detail-val font-semibold">{viewTransaction.voucherNo}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Sanction Order Ref</span>
                  <span className="detail-val code-badge">{viewTransaction.sanctionOrderNo}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Transaction Date</span>
                  <span className="detail-val">{viewTransaction.date}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Payment Mode</span>
                  <span className="detail-val">{viewTransaction.paymentMode}</span>
                </div>
                <div className="detail-item span-2">
                  <span className="detail-label">Nidhi Fund Mapped</span>
                  <span className="detail-val font-medium text-purple">{activeFund.name}</span>
                </div>
                <div className="detail-item span-2">
                  <span className="detail-label">Scheme Name</span>
                  <span className="detail-val font-medium">{viewTransaction.schemeName}</span>
                </div>
                <div className="detail-item span-2">
                  <span className="detail-label">DDO & Office</span>
                  <span className="detail-val">{viewTransaction.ddoName} ({viewTransaction.ddoCode})</span>
                </div>
                <div className="detail-item span-2">
                  <span className="detail-label">Work / Sanction Description</span>
                  <span className="detail-val bg-light p-2 rounded">{viewTransaction.workDetails}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Sanction Budget</span>
                  <span className="detail-val">{formatCurrency(viewTransaction.sanctionAmount)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Post Balance Remaining</span>
                  <span className="detail-val text-balance font-bold">{formatCurrency(viewTransaction.postAvailableBalance)}</span>
                </div>
              </div>
            </div>

            <div className="nidhi-modal-footer">
              <button className="nidhi-btn nidhi-btn-secondary" onClick={() => setViewTransaction(null)}>
                Close
              </button>
              <button
                className="nidhi-btn nidhi-btn-primary"
                onClick={() => {
                  alert(`Downloading Voucher Advice PDF for ${viewTransaction.voucherNo}`);
                  setViewTransaction(null);
                }}
              >
                <Download size={15} />
                <span>Download Voucher Copy</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Comment & Feedback System Integration --- */}
      <div className="nidhi-comments-section">
        <CommentLayer screenId="sprint6-story2-nidhi-funds-expenditure-report" />
      </div>
    </div>
  );
}
