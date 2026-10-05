import { useState, useMemo } from 'react';
import {
  Building2,
  Calendar,
  Download,
  RefreshCcw,
  Sparkles,
  Wallet,
  Coins,
  Receipt,
  X,
  FileSpreadsheet
} from 'lucide-react';
import CommentLayer from '../../components/feedback/CommentLayer';
import './NidhiFundsExpenditureReportScreen.css';

// --- Helper Functions ---
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

const TREASURY_SCHEMES_DATA = [
  { code: '2245-01-101-(0096)-42-007', dept: 'राजस्व', revExp: 1450.00, capExp: 350.00 },
  { code: '2245-01-101-(6422)-42-007', dept: '', revExp: 820.00, capExp: 180.00 },
  { code: '2245-01-102-(2661)-42-007', dept: '', revExp: 1250.00, capExp: 250.00 },
  { code: '2245-01-102-(6434)-42-007', dept: '', revExp: 910.00, capExp: 140.00 },
  { code: '2245-02-101-(0747)-42-007', dept: '', revExp: 640.00, capExp: 80.00 },
  { code: '2245-02-101-(2018)-42-007', dept: '', revExp: 470.00, capExp: 30.00 },
  { code: '2245-80-102-(6436)-51-000', dept: '', revExp: 1120.00, capExp: 210.00 },
  { code: '2245-80-102-(7667)-24-002', dept: '', revExp: 530.00, capExp: 90.00 },
  { code: '2245-80-102-(7667)-42-007', dept: '', revExp: 780.00, capExp: 120.00 },
  { code: '2245-80-800-(5504)-51-000', dept: '', revExp: 390.00, capExp: 60.00 },
  { code: '2245-80-800-(6097)-44-001', dept: '', revExp: 610.00, capExp: 110.00 },
  { code: '2245-80-800-(7021)-42-007', dept: '', revExp: 840.00, capExp: 160.00 },
  { code: '2245-80-800-(7249)-42-007', dept: '', revExp: 950.00, capExp: 200.00 },
];

const NIDHI_FUNDS_DATA: NidhiFund[] = [
  {
    id: 'NF-01',
    code: '8121-HEAD-01',
    name: '8121 - सामान्य तथा अन्य आरक्षित निधियाँ (General and Other Reserve Funds)-122 राज्य आपदा मोचन निधि (SDRF) (State Disaster Response Fund)',
    shortName: '122 राज्य आपदा मोचन निधि (SDRF) (State Disaster Response Fund)',
    category: 'General and Other Reserve Funds',
    treasuryCode: 'TR-101',
    treasuryName: 'District Treasury / State Nidhi Cell',
    totalGrant: 1050000000,
    totalExpenditure: 420000000,
    availableBalance: 630000000,
    committedBalance: 32000000,
    lastUpdated: '2026-10-05 10:00',
    schemes: [
      {
        id: 'SCH-01-01',
        code: 'SCH-CODE-01',
        name: '122 राज्य आपदा मोचन निधि (SDRF) (State Disaster Response Fund) Development Scheme',
        allocatedBudget: 525000000,
        expenditure: 210000000,
        balance: 315000000,
        activeProjects: 6
      }
    ],
    quarterlySummary: {
      Q1: { period: 'Q1 (Apr-Jun)', receipts: 350000000, expenditure: 140000000, balance: 210000000 },
      Q2: { period: 'Q2 (Jul-Sep)', receipts: 262500000, expenditure: 105000000, balance: 157500000 },
      Q3: { period: 'Q3 (Oct-Dec)', receipts: 262500000, expenditure: 105000000, balance: 157500000 },
      Q4: { period: 'Q4 (Jan-Mar)', receipts: 175000000, expenditure: 70000000, balance: 105000000 }
    },
    halfYearlySummary: {
      H1: { period: 'H1 (Apr-Sep)', receipts: 612500000, expenditure: 245000000, balance: 367500000 },
      H2: { period: 'H2 (Oct-Mar)', receipts: 437500000, expenditure: 175000000, balance: 262500000 }
    },
    yearlySummary: {
      '2026-27': { period: 'FY 2026-27', receipts: 1050000000, expenditure: 420000000, balance: 630000000 },
      '2025-26': { period: 'FY 2025-26', receipts: 945000000, expenditure: 399000000, balance: 504000000 },
      '2024-25': { period: 'FY 2024-25', receipts: 840000000, expenditure: 357000000, balance: 441000000 }
    }
  },
  {
    id: 'NF-02',
    code: '8121-HEAD-02',
    name: '8121 - सामान्य तथा अन्य आरक्षित निधियाँ (General and Other Reserve Funds)-129 राज्य क्षतिपूर्ति वनरोपण निधि - CAMPA (1401 TO 1406)',
    shortName: 'CAMPA (1401 TO 1406)',
    category: 'General and Other Reserve Funds',
    treasuryCode: 'TR-102',
    treasuryName: 'District Treasury / State Nidhi Cell',
    totalGrant: 1100000000,
    totalExpenditure: 440000000,
    availableBalance: 660000000,
    committedBalance: 34000000,
    lastUpdated: '2026-10-05 10:00',
    schemes: [
      {
        id: 'SCH-02-01',
        code: 'SCH-CODE-02',
        name: 'CAMPA (1401 TO 1406) Development Scheme',
        allocatedBudget: 550000000,
        expenditure: 220000000,
        balance: 330000000,
        activeProjects: 7
      }
    ],
    quarterlySummary: {
      Q1: { period: 'Q1 (Apr-Jun)', receipts: 366666666, expenditure: 146666666, balance: 220000000 },
      Q2: { period: 'Q2 (Jul-Sep)', receipts: 275000000, expenditure: 110000000, balance: 165000000 },
      Q3: { period: 'Q3 (Oct-Dec)', receipts: 275000000, expenditure: 110000000, balance: 165000000 },
      Q4: { period: 'Q4 (Jan-Mar)', receipts: 183333333, expenditure: 73333333, balance: 110000000 }
    },
    halfYearlySummary: {
      H1: { period: 'H1 (Apr-Sep)', receipts: 641666666, expenditure: 256666666, balance: 385000000 },
      H2: { period: 'H2 (Oct-Mar)', receipts: 458333333, expenditure: 183333333, balance: 275000000 }
    },
    yearlySummary: {
      '2026-27': { period: 'FY 2026-27', receipts: 1100000000, expenditure: 440000000, balance: 660000000 },
      '2025-26': { period: 'FY 2025-26', receipts: 990000000, expenditure: 418000000, balance: 528000000 },
      '2024-25': { period: 'FY 2024-25', receipts: 880000000, expenditure: 374000000, balance: 462000000 }
    }
  },
  {
    id: 'NF-03',
    code: '8121-HEAD-03',
    name: '8121 - सामान्य तथा अन्य आरक्षित निधियाँ (General and Other Reserve Funds)-129 राज्य क्षतिपूर्ति वनरोपण निधि - 130 राज्य आपदा शमन निधि (SDMF)',
    shortName: '130 राज्य आपदा शमन निधि (SDMF)',
    category: 'General and Other Reserve Funds',
    treasuryCode: 'TR-103',
    treasuryName: 'District Treasury / State Nidhi Cell',
    totalGrant: 1150000000,
    totalExpenditure: 460000000,
    availableBalance: 690000000,
    committedBalance: 36000000,
    lastUpdated: '2026-10-05 10:00',
    schemes: [
      {
        id: 'SCH-03-01',
        code: 'SCH-CODE-03',
        name: '130 राज्य आपदा शमन निधि (SDMF) Development Scheme',
        allocatedBudget: 575000000,
        expenditure: 230000000,
        balance: 345000000,
        activeProjects: 8
      }
    ],
    quarterlySummary: {
      Q1: { period: 'Q1 (Apr-Jun)', receipts: 383333333, expenditure: 153333333, balance: 230000000 },
      Q2: { period: 'Q2 (Jul-Sep)', receipts: 287500000, expenditure: 115000000, balance: 172500000 },
      Q3: { period: 'Q3 (Oct-Dec)', receipts: 287500000, expenditure: 115000000, balance: 172500000 },
      Q4: { period: 'Q4 (Jan-Mar)', receipts: 191666666, expenditure: 76666666, balance: 115000000 }
    },
    halfYearlySummary: {
      H1: { period: 'H1 (Apr-Sep)', receipts: 670833333, expenditure: 268333333, balance: 402500000 },
      H2: { period: 'H2 (Oct-Mar)', receipts: 479166666, expenditure: 191666666, balance: 287500000 }
    },
    yearlySummary: {
      '2026-27': { period: 'FY 2026-27', receipts: 1150000000, expenditure: 460000000, balance: 690000000 },
      '2025-26': { period: 'FY 2025-26', receipts: 1035000000, expenditure: 437000000, balance: 552000000 },
      '2024-25': { period: 'FY 2024-25', receipts: 920000000, expenditure: 391000000, balance: 482999999 }
    }
  },
  {
    id: 'NF-04',
    code: '8229-HEAD-04',
    name: '8229 - विकास तथा कल्याण निधियाँ (Development and Welfare Funds)-110 विद्युत विकास निधि-(0410)',
    shortName: '(0410)',
    category: 'Development and Welfare Funds',
    treasuryCode: 'TR-104',
    treasuryName: 'District Treasury / State Nidhi Cell',
    totalGrant: 1200000000,
    totalExpenditure: 480000000,
    availableBalance: 720000000,
    committedBalance: 38000000,
    lastUpdated: '2026-10-05 10:00',
    schemes: [
      {
        id: 'SCH-04-01',
        code: 'SCH-CODE-04',
        name: '(0410) Development Scheme',
        allocatedBudget: 600000000,
        expenditure: 240000000,
        balance: 360000000,
        activeProjects: 9
      }
    ],
    quarterlySummary: {
      Q1: { period: 'Q1 (Apr-Jun)', receipts: 400000000, expenditure: 160000000, balance: 240000000 },
      Q2: { period: 'Q2 (Jul-Sep)', receipts: 300000000, expenditure: 120000000, balance: 180000000 },
      Q3: { period: 'Q3 (Oct-Dec)', receipts: 300000000, expenditure: 120000000, balance: 180000000 },
      Q4: { period: 'Q4 (Jan-Mar)', receipts: 200000000, expenditure: 80000000, balance: 120000000 }
    },
    halfYearlySummary: {
      H1: { period: 'H1 (Apr-Sep)', receipts: 700000000, expenditure: 280000000, balance: 420000000 },
      H2: { period: 'H2 (Oct-Mar)', receipts: 500000000, expenditure: 200000000, balance: 300000000 }
    },
    yearlySummary: {
      '2026-27': { period: 'FY 2026-27', receipts: 1200000000, expenditure: 480000000, balance: 720000000 },
      '2025-26': { period: 'FY 2025-26', receipts: 1080000000, expenditure: 456000000, balance: 576000000 },
      '2024-25': { period: 'FY 2024-25', receipts: 960000000, expenditure: 408000000, balance: 503999999 }
    }
  },
  {
    id: 'NF-05',
    code: '8229-HEAD-05',
    name: '8229 - विकास तथा कल्याण निधियाँ (Development and Welfare Funds)-114 खदान कल्याण निधि-(0420)',
    shortName: '(0420)',
    category: 'Development and Welfare Funds',
    treasuryCode: 'TR-105',
    treasuryName: 'District Treasury / State Nidhi Cell',
    totalGrant: 1250000000,
    totalExpenditure: 500000000,
    availableBalance: 750000000,
    committedBalance: 40000000,
    lastUpdated: '2026-10-05 10:00',
    schemes: [
      {
        id: 'SCH-05-01',
        code: 'SCH-CODE-05',
        name: '(0420) Development Scheme',
        allocatedBudget: 625000000,
        expenditure: 250000000,
        balance: 375000000,
        activeProjects: 10
      }
    ],
    quarterlySummary: {
      Q1: { period: 'Q1 (Apr-Jun)', receipts: 416666666, expenditure: 166666666, balance: 250000000 },
      Q2: { period: 'Q2 (Jul-Sep)', receipts: 312500000, expenditure: 125000000, balance: 187500000 },
      Q3: { period: 'Q3 (Oct-Dec)', receipts: 312500000, expenditure: 125000000, balance: 187500000 },
      Q4: { period: 'Q4 (Jan-Mar)', receipts: 208333333, expenditure: 83333333, balance: 125000000 }
    },
    halfYearlySummary: {
      H1: { period: 'H1 (Apr-Sep)', receipts: 729166666, expenditure: 291666666, balance: 437500000 },
      H2: { period: 'H2 (Oct-Mar)', receipts: 520833333, expenditure: 208333333, balance: 312500000 }
    },
    yearlySummary: {
      '2026-27': { period: 'FY 2026-27', receipts: 1250000000, expenditure: 500000000, balance: 750000000 },
      '2025-26': { period: 'FY 2025-26', receipts: 1125000000, expenditure: 475000000, balance: 600000000 },
      '2024-25': { period: 'FY 2024-25', receipts: 1000000000, expenditure: 425000000, balance: 524999999 }
    }
  },
  {
    id: 'NF-06',
    code: '8229-HEAD-06',
    name: '8229 - विकास तथा कल्याण निधियाँ (Development and Welfare Funds)-123 उपभोक्ता कल्याण निधि',
    shortName: '123 उपभोक्ता कल्याण निधि',
    category: 'Development and Welfare Funds',
    treasuryCode: 'TR-106',
    treasuryName: 'District Treasury / State Nidhi Cell',
    totalGrant: 1300000000,
    totalExpenditure: 520000000,
    availableBalance: 780000000,
    committedBalance: 42000000,
    lastUpdated: '2026-10-05 10:00',
    schemes: [
      {
        id: 'SCH-06-01',
        code: 'SCH-CODE-06',
        name: '123 उपभोक्ता कल्याण निधि Development Scheme',
        allocatedBudget: 650000000,
        expenditure: 260000000,
        balance: 390000000,
        activeProjects: 11
      }
    ],
    quarterlySummary: {
      Q1: { period: 'Q1 (Apr-Jun)', receipts: 433333333, expenditure: 173333333, balance: 260000000 },
      Q2: { period: 'Q2 (Jul-Sep)', receipts: 325000000, expenditure: 130000000, balance: 195000000 },
      Q3: { period: 'Q3 (Oct-Dec)', receipts: 325000000, expenditure: 130000000, balance: 195000000 },
      Q4: { period: 'Q4 (Jan-Mar)', receipts: 216666666, expenditure: 86666666, balance: 130000000 }
    },
    halfYearlySummary: {
      H1: { period: 'H1 (Apr-Sep)', receipts: 758333333, expenditure: 303333333, balance: 455000000 },
      H2: { period: 'H2 (Oct-Mar)', receipts: 541666666, expenditure: 216666666, balance: 325000000 }
    },
    yearlySummary: {
      '2026-27': { period: 'FY 2026-27', receipts: 1300000000, expenditure: 520000000, balance: 780000000 },
      '2025-26': { period: 'FY 2025-26', receipts: 1170000000, expenditure: 494000000, balance: 624000000 },
      '2024-25': { period: 'FY 2024-25', receipts: 1040000000, expenditure: 442000000, balance: 546000000 }
    }
  },
  {
    id: 'NF-07',
    code: '8229-HEAD-07',
    name: '8229 - विकास तथा कल्याण निधियाँ (Development and Welfare Funds)-200 अन्य विकास तथा कल्याण निधियां —पंचायत भूमि राजस्व उपकर तथा स्टाम्प शुल्क निधि (0480)',
    shortName: '200 अन्य विकास तथा कल्याण निधियां —पंचायत भूमि राजस्व उपकर तथा स्टाम्प शुल्क निधि (0480)',
    category: 'Development and Welfare Funds',
    treasuryCode: 'TR-107',
    treasuryName: 'District Treasury / State Nidhi Cell',
    totalGrant: 1350000000,
    totalExpenditure: 540000000,
    availableBalance: 810000000,
    committedBalance: 44000000,
    lastUpdated: '2026-10-05 10:00',
    schemes: [
      {
        id: 'SCH-07-01',
        code: 'SCH-CODE-07',
        name: '200 अन्य विकास तथा कल्याण निधियां —पंचायत भूमि राजस्व उपकर तथा स्टाम्प शुल्क निधि (0480) Development Scheme',
        allocatedBudget: 675000000,
        expenditure: 270000000,
        balance: 405000000,
        activeProjects: 12
      }
    ],
    quarterlySummary: {
      Q1: { period: 'Q1 (Apr-Jun)', receipts: 450000000, expenditure: 180000000, balance: 270000000 },
      Q2: { period: 'Q2 (Jul-Sep)', receipts: 337500000, expenditure: 135000000, balance: 202500000 },
      Q3: { period: 'Q3 (Oct-Dec)', receipts: 337500000, expenditure: 135000000, balance: 202500000 },
      Q4: { period: 'Q4 (Jan-Mar)', receipts: 225000000, expenditure: 90000000, balance: 135000000 }
    },
    halfYearlySummary: {
      H1: { period: 'H1 (Apr-Sep)', receipts: 787500000, expenditure: 315000000, balance: 472500000 },
      H2: { period: 'H2 (Oct-Mar)', receipts: 562500000, expenditure: 225000000, balance: 337500000 }
    },
    yearlySummary: {
      '2026-27': { period: 'FY 2026-27', receipts: 1350000000, expenditure: 540000000, balance: 810000000 },
      '2025-26': { period: 'FY 2025-26', receipts: 1215000000, expenditure: 513000000, balance: 648000000 },
      '2024-25': { period: 'FY 2024-25', receipts: 1080000000, expenditure: 459000000, balance: 567000000 }
    }
  },
  {
    id: 'NF-08',
    code: '8229-HEAD-08',
    name: '8229 - विकास तथा कल्याण निधियाँ (Development and Welfare Funds)-200 अन्य विकास तथा कल्याण निधियां —वन विकास निधि (0430)',
    shortName: '200 अन्य विकास तथा कल्याण निधियां —वन विकास निधि (0430)',
    category: 'Development and Welfare Funds',
    treasuryCode: 'TR-108',
    treasuryName: 'District Treasury / State Nidhi Cell',
    totalGrant: 1400000000,
    totalExpenditure: 560000000,
    availableBalance: 840000000,
    committedBalance: 46000000,
    lastUpdated: '2026-10-05 10:00',
    schemes: [
      {
        id: 'SCH-08-01',
        code: 'SCH-CODE-08',
        name: '200 अन्य विकास तथा कल्याण निधियां —वन विकास निधि (0430) Development Scheme',
        allocatedBudget: 700000000,
        expenditure: 280000000,
        balance: 420000000,
        activeProjects: 13
      }
    ],
    quarterlySummary: {
      Q1: { period: 'Q1 (Apr-Jun)', receipts: 466666666, expenditure: 186666666, balance: 280000000 },
      Q2: { period: 'Q2 (Jul-Sep)', receipts: 350000000, expenditure: 140000000, balance: 210000000 },
      Q3: { period: 'Q3 (Oct-Dec)', receipts: 350000000, expenditure: 140000000, balance: 210000000 },
      Q4: { period: 'Q4 (Jan-Mar)', receipts: 233333333, expenditure: 93333333, balance: 140000000 }
    },
    halfYearlySummary: {
      H1: { period: 'H1 (Apr-Sep)', receipts: 816666666, expenditure: 326666666, balance: 490000000 },
      H2: { period: 'H2 (Oct-Mar)', receipts: 583333333, expenditure: 233333333, balance: 350000000 }
    },
    yearlySummary: {
      '2026-27': { period: 'FY 2026-27', receipts: 1400000000, expenditure: 560000000, balance: 840000000 },
      '2025-26': { period: 'FY 2025-26', receipts: 1260000000, expenditure: 532000000, balance: 672000000 },
      '2024-25': { period: 'FY 2024-25', receipts: 1120000000, expenditure: 476000000, balance: 588000000 }
    }
  },
  {
    id: 'NF-09',
    code: '8229-HEAD-09',
    name: '8229 - विकास तथा कल्याण निधियाँ (Development and Welfare Funds)-200 अन्य विकास तथा कल्याण निधियां —मध्य प्रदेश ग्रामीण विकास निधि (0440)',
    shortName: '200 अन्य विकास तथा कल्याण निधियां —मध्य प्रदेश ग्रामीण विकास निधि (0440)',
    category: 'Development and Welfare Funds',
    treasuryCode: 'TR-109',
    treasuryName: 'District Treasury / State Nidhi Cell',
    totalGrant: 1450000000,
    totalExpenditure: 580000000,
    availableBalance: 870000000,
    committedBalance: 48000000,
    lastUpdated: '2026-10-05 10:00',
    schemes: [
      {
        id: 'SCH-09-01',
        code: 'SCH-CODE-09',
        name: '200 अन्य विकास तथा कल्याण निधियां —मध्य प्रदेश ग्रामीण विकास निधि (0440) Development Scheme',
        allocatedBudget: 725000000,
        expenditure: 290000000,
        balance: 435000000,
        activeProjects: 14
      }
    ],
    quarterlySummary: {
      Q1: { period: 'Q1 (Apr-Jun)', receipts: 483333333, expenditure: 193333333, balance: 290000000 },
      Q2: { period: 'Q2 (Jul-Sep)', receipts: 362500000, expenditure: 145000000, balance: 217500000 },
      Q3: { period: 'Q3 (Oct-Dec)', receipts: 362500000, expenditure: 145000000, balance: 217500000 },
      Q4: { period: 'Q4 (Jan-Mar)', receipts: 241666666, expenditure: 96666666, balance: 145000000 }
    },
    halfYearlySummary: {
      H1: { period: 'H1 (Apr-Sep)', receipts: 845833333, expenditure: 338333333, balance: 507500000 },
      H2: { period: 'H2 (Oct-Mar)', receipts: 604166666, expenditure: 241666666, balance: 362500000 }
    },
    yearlySummary: {
      '2026-27': { period: 'FY 2026-27', receipts: 1450000000, expenditure: 580000000, balance: 870000000 },
      '2025-26': { period: 'FY 2025-26', receipts: 1305000000, expenditure: 551000000, balance: 696000000 },
      '2024-25': { period: 'FY 2024-25', receipts: 1160000000, expenditure: 493000000, balance: 609000000 }
    }
  },
  {
    id: 'NF-10',
    code: '8229-HEAD-10',
    name: '8229 - विकास तथा कल्याण निधियाँ (Development and Welfare Funds)-200 अन्य विकास तथा कल्याण निधियां —क्षतिपूर्ति वनरोपण निधि',
    shortName: '200 अन्य विकास तथा कल्याण निधियां —क्षतिपूर्ति वनरोपण निधि',
    category: 'Development and Welfare Funds',
    treasuryCode: 'TR-110',
    treasuryName: 'District Treasury / State Nidhi Cell',
    totalGrant: 1500000000,
    totalExpenditure: 600000000,
    availableBalance: 900000000,
    committedBalance: 50000000,
    lastUpdated: '2026-10-05 10:00',
    schemes: [
      {
        id: 'SCH-10-01',
        code: 'SCH-CODE-10',
        name: '200 अन्य विकास तथा कल्याण निधियां —क्षतिपूर्ति वनरोपण निधि Development Scheme',
        allocatedBudget: 750000000,
        expenditure: 300000000,
        balance: 450000000,
        activeProjects: 15
      }
    ],
    quarterlySummary: {
      Q1: { period: 'Q1 (Apr-Jun)', receipts: 500000000, expenditure: 200000000, balance: 300000000 },
      Q2: { period: 'Q2 (Jul-Sep)', receipts: 375000000, expenditure: 150000000, balance: 225000000 },
      Q3: { period: 'Q3 (Oct-Dec)', receipts: 375000000, expenditure: 150000000, balance: 225000000 },
      Q4: { period: 'Q4 (Jan-Mar)', receipts: 250000000, expenditure: 100000000, balance: 150000000 }
    },
    halfYearlySummary: {
      H1: { period: 'H1 (Apr-Sep)', receipts: 875000000, expenditure: 350000000, balance: 525000000 },
      H2: { period: 'H2 (Oct-Mar)', receipts: 625000000, expenditure: 250000000, balance: 375000000 }
    },
    yearlySummary: {
      '2026-27': { period: 'FY 2026-27', receipts: 1500000000, expenditure: 600000000, balance: 900000000 },
      '2025-26': { period: 'FY 2025-26', receipts: 1350000000, expenditure: 570000000, balance: 720000000 },
      '2024-25': { period: 'FY 2024-25', receipts: 1200000000, expenditure: 510000000, balance: 630000000 }
    }
  },
  {
    id: 'NF-11',
    code: '8229-HEAD-11',
    name: '8229 - विकास तथा कल्याण निधियाँ (Development and Welfare Funds)-200 अन्य विकास तथा कल्याण निधियां —म.प्र. शहरी परिवहन अधोसंरचना विकास निधि (0530)',
    shortName: '200 अन्य विकास तथा कल्याण निधियां —म.प्र. शहरी परिवहन अधोसंरचना विकास निधि (0530)',
    category: 'Development and Welfare Funds',
    treasuryCode: 'TR-111',
    treasuryName: 'District Treasury / State Nidhi Cell',
    totalGrant: 1550000000,
    totalExpenditure: 620000000,
    availableBalance: 930000000,
    committedBalance: 52000000,
    lastUpdated: '2026-10-05 10:00',
    schemes: [
      {
        id: 'SCH-11-01',
        code: 'SCH-CODE-11',
        name: '200 अन्य विकास तथा कल्याण निधियां —म.प्र. शहरी परिवहन अधोसंरचना विकास निधि (0530) Development Scheme',
        allocatedBudget: 775000000,
        expenditure: 310000000,
        balance: 465000000,
        activeProjects: 16
      }
    ],
    quarterlySummary: {
      Q1: { period: 'Q1 (Apr-Jun)', receipts: 516666666, expenditure: 206666666, balance: 310000000 },
      Q2: { period: 'Q2 (Jul-Sep)', receipts: 387500000, expenditure: 155000000, balance: 232500000 },
      Q3: { period: 'Q3 (Oct-Dec)', receipts: 387500000, expenditure: 155000000, balance: 232500000 },
      Q4: { period: 'Q4 (Jan-Mar)', receipts: 258333333, expenditure: 103333333, balance: 155000000 }
    },
    halfYearlySummary: {
      H1: { period: 'H1 (Apr-Sep)', receipts: 904166666, expenditure: 361666666, balance: 542500000 },
      H2: { period: 'H2 (Oct-Mar)', receipts: 645833333, expenditure: 258333333, balance: 387500000 }
    },
    yearlySummary: {
      '2026-27': { period: 'FY 2026-27', receipts: 1550000000, expenditure: 620000000, balance: 930000000 },
      '2025-26': { period: 'FY 2025-26', receipts: 1395000000, expenditure: 589000000, balance: 744000000 },
      '2024-25': { period: 'FY 2024-25', receipts: 1240000000, expenditure: 527000000, balance: 651000000 }
    }
  },
  {
    id: 'NF-12',
    code: '8229-HEAD-12',
    name: '8229 - विकास तथा कल्याण निधियाँ (Development and Welfare Funds)-200 अन्य विकास तथा कल्याण निधियां —म.प्र. परिवहन अधोसंरचना विकास निधि (0550)',
    shortName: '200 अन्य विकास तथा कल्याण निधियां —म.प्र. परिवहन अधोसंरचना विकास निधि (0550)',
    category: 'Development and Welfare Funds',
    treasuryCode: 'TR-112',
    treasuryName: 'District Treasury / State Nidhi Cell',
    totalGrant: 1600000000,
    totalExpenditure: 640000000,
    availableBalance: 960000000,
    committedBalance: 54000000,
    lastUpdated: '2026-10-05 10:00',
    schemes: [
      {
        id: 'SCH-12-01',
        code: 'SCH-CODE-12',
        name: '200 अन्य विकास तथा कल्याण निधियां —म.प्र. परिवहन अधोसंरचना विकास निधि (0550) Development Scheme',
        allocatedBudget: 800000000,
        expenditure: 320000000,
        balance: 480000000,
        activeProjects: 17
      }
    ],
    quarterlySummary: {
      Q1: { period: 'Q1 (Apr-Jun)', receipts: 533333333, expenditure: 213333333, balance: 320000000 },
      Q2: { period: 'Q2 (Jul-Sep)', receipts: 400000000, expenditure: 160000000, balance: 240000000 },
      Q3: { period: 'Q3 (Oct-Dec)', receipts: 400000000, expenditure: 160000000, balance: 240000000 },
      Q4: { period: 'Q4 (Jan-Mar)', receipts: 266666666, expenditure: 106666666, balance: 160000000 }
    },
    halfYearlySummary: {
      H1: { period: 'H1 (Apr-Sep)', receipts: 933333333, expenditure: 373333333, balance: 560000000 },
      H2: { period: 'H2 (Oct-Mar)', receipts: 666666666, expenditure: 266666666, balance: 400000000 }
    },
    yearlySummary: {
      '2026-27': { period: 'FY 2026-27', receipts: 1600000000, expenditure: 640000000, balance: 960000000 },
      '2025-26': { period: 'FY 2025-26', receipts: 1440000000, expenditure: 608000000, balance: 768000000 },
      '2024-25': { period: 'FY 2024-25', receipts: 1280000000, expenditure: 544000000, balance: 672000000 }
    }
  },
  {
    id: 'NF-13',
    code: '8229-HEAD-13',
    name: '8229 - विकास तथा कल्याण निधियाँ (Development and Welfare Funds)-200 अन्य विकास तथा कल्याण निधियां —म.प्र. स्टाम्प शुल्क प्रभार निधि (0570)',
    shortName: '200 अन्य विकास तथा कल्याण निधियां —म.प्र. स्टाम्प शुल्क प्रभार निधि (0570)',
    category: 'Development and Welfare Funds',
    treasuryCode: 'TR-113',
    treasuryName: 'District Treasury / State Nidhi Cell',
    totalGrant: 1650000000,
    totalExpenditure: 660000000,
    availableBalance: 990000000,
    committedBalance: 56000000,
    lastUpdated: '2026-10-05 10:00',
    schemes: [
      {
        id: 'SCH-13-01',
        code: 'SCH-CODE-13',
        name: '200 अन्य विकास तथा कल्याण निधियां —म.प्र. स्टाम्प शुल्क प्रभार निधि (0570) Development Scheme',
        allocatedBudget: 825000000,
        expenditure: 330000000,
        balance: 495000000,
        activeProjects: 18
      }
    ],
    quarterlySummary: {
      Q1: { period: 'Q1 (Apr-Jun)', receipts: 550000000, expenditure: 220000000, balance: 330000000 },
      Q2: { period: 'Q2 (Jul-Sep)', receipts: 412500000, expenditure: 165000000, balance: 247500000 },
      Q3: { period: 'Q3 (Oct-Dec)', receipts: 412500000, expenditure: 165000000, balance: 247500000 },
      Q4: { period: 'Q4 (Jan-Mar)', receipts: 275000000, expenditure: 110000000, balance: 165000000 }
    },
    halfYearlySummary: {
      H1: { period: 'H1 (Apr-Sep)', receipts: 962500000, expenditure: 385000000, balance: 577500000 },
      H2: { period: 'H2 (Oct-Mar)', receipts: 687500000, expenditure: 275000000, balance: 412500000 }
    },
    yearlySummary: {
      '2026-27': { period: 'FY 2026-27', receipts: 1650000000, expenditure: 660000000, balance: 990000000 },
      '2025-26': { period: 'FY 2025-26', receipts: 1485000000, expenditure: 627000000, balance: 792000000 },
      '2024-25': { period: 'FY 2024-25', receipts: 1320000000, expenditure: 561000000, balance: 693000000 }
    }
  },
  {
    id: 'NF-14',
    code: '8235-HEAD-14',
    name: '8235 - सामान्य तथा अन्य आरक्षित निधिया (General and Other Reserve Funds)-200 - अन्य निधियां (Other Funds)-म.प्र. विपदा राहत निधि (M.P. Disaster Relief Fund)',
    shortName: 'म.प्र. विपदा राहत निधि (M.P. Disaster Relief Fund)',
    category: 'General and Other Reserve Funds',
    treasuryCode: 'TR-114',
    treasuryName: 'District Treasury / State Nidhi Cell',
    totalGrant: 1700000000,
    totalExpenditure: 680000000,
    availableBalance: 1020000000,
    committedBalance: 58000000,
    lastUpdated: '2026-10-05 10:00',
    schemes: [
      {
        id: 'SCH-14-01',
        code: 'SCH-CODE-14',
        name: 'म.प्र. विपदा राहत निधि (M.P. Disaster Relief Fund) Development Scheme',
        allocatedBudget: 850000000,
        expenditure: 340000000,
        balance: 510000000,
        activeProjects: 19
      }
    ],
    quarterlySummary: {
      Q1: { period: 'Q1 (Apr-Jun)', receipts: 566666666, expenditure: 226666666, balance: 340000000 },
      Q2: { period: 'Q2 (Jul-Sep)', receipts: 425000000, expenditure: 170000000, balance: 255000000 },
      Q3: { period: 'Q3 (Oct-Dec)', receipts: 425000000, expenditure: 170000000, balance: 255000000 },
      Q4: { period: 'Q4 (Jan-Mar)', receipts: 283333333, expenditure: 113333333, balance: 170000000 }
    },
    halfYearlySummary: {
      H1: { period: 'H1 (Apr-Sep)', receipts: 991666666, expenditure: 396666666, balance: 595000000 },
      H2: { period: 'H2 (Oct-Mar)', receipts: 708333333, expenditure: 283333333, balance: 425000000 }
    },
    yearlySummary: {
      '2026-27': { period: 'FY 2026-27', receipts: 1700000000, expenditure: 680000000, balance: 1020000000 },
      '2025-26': { period: 'FY 2025-26', receipts: 1530000000, expenditure: 646000000, balance: 816000000 },
      '2024-25': { period: 'FY 2024-25', receipts: 1360000000, expenditure: 578000000, balance: 714000000 }
    }
  },
  {
    id: 'NF-15',
    code: '8235-HEAD-15',
    name: '8235 - सामान्य तथा अन्य आरक्षित निधिया (General and Other Reserve Funds)-200 - अन्य निधियां (Other Funds)-सड़क सुरक्षा निधि (Road Safety Fund) (0562)',
    shortName: 'सड़क सुरक्षा निधि (Road Safety Fund) (0562)',
    category: 'General and Other Reserve Funds',
    treasuryCode: 'TR-115',
    treasuryName: 'District Treasury / State Nidhi Cell',
    totalGrant: 1750000000,
    totalExpenditure: 700000000,
    availableBalance: 1050000000,
    committedBalance: 60000000,
    lastUpdated: '2026-10-05 10:00',
    schemes: [
      {
        id: 'SCH-15-01',
        code: 'SCH-CODE-15',
        name: 'सड़क सुरक्षा निधि (Road Safety Fund) (0562) Development Scheme',
        allocatedBudget: 875000000,
        expenditure: 350000000,
        balance: 525000000,
        activeProjects: 20
      }
    ],
    quarterlySummary: {
      Q1: { period: 'Q1 (Apr-Jun)', receipts: 583333333, expenditure: 233333333, balance: 350000000 },
      Q2: { period: 'Q2 (Jul-Sep)', receipts: 437500000, expenditure: 175000000, balance: 262500000 },
      Q3: { period: 'Q3 (Oct-Dec)', receipts: 437500000, expenditure: 175000000, balance: 262500000 },
      Q4: { period: 'Q4 (Jan-Mar)', receipts: 291666666, expenditure: 116666666, balance: 175000000 }
    },
    halfYearlySummary: {
      H1: { period: 'H1 (Apr-Sep)', receipts: 1020833333, expenditure: 408333333, balance: 612500000 },
      H2: { period: 'H2 (Oct-Mar)', receipts: 729166666, expenditure: 291666666, balance: 437500000 }
    },
    yearlySummary: {
      '2026-27': { period: 'FY 2026-27', receipts: 1750000000, expenditure: 700000000, balance: 1050000000 },
      '2025-26': { period: 'FY 2025-26', receipts: 1575000000, expenditure: 665000000, balance: 840000000 },
      '2024-25': { period: 'FY 2024-25', receipts: 1400000000, expenditure: 595000000, balance: 735000000 }
    }
  }
];

const TRANSACTIONS_DATA: ExpenditureTransaction[] = [
  {
    id: 'TXN-SDRF-001',
    voucherNo: 'VCH/2026/SDRF/1042',
    sanctionOrderNo: 'ORD-SDRF-2026-881',
    date: '2026-08-14',
    nidhiFundId: 'NF-01',
    schemeId: 'SCH-01-01',
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
    nidhiFundId: 'NF-01',
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
    nidhiFundId: 'NF-01',
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
    nidhiFundId: 'NF-01',
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
  const [selectedFundId, setSelectedFundId] = useState<string>('NF-01');

  // 2. Date Range Filters
  const [fromDate, setFromDate] = useState<string>('01/04/2026');
  const [toDate, setToDate] = useState<string>('30/09/2026');

  // 3. Periodicity Filter: All, Quarterly, Half Yearly, Yearly
  const [periodicity, setPeriodicity] = useState<'ALL' | 'QUARTERLY' | 'HALF_YEARLY' | 'YEARLY'>('ALL');
  const [selectedQuarter, setSelectedQuarter] = useState<'ALL' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('ALL');
  const [selectedHalfYear, setSelectedHalfYear] = useState<'ALL' | 'H1' | 'H2'>('ALL');
  const [selectedFY, setSelectedFY] = useState<'ALL' | '2026-27' | '2025-26' | '2024-25'>('2026-27');

  // 4. Scheme Filter
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('ALL');

  // 5. UI Modals / Active Items
  const [viewTransaction, setViewTransaction] = useState<ExpenditureTransaction | null>(null);
  const [showExportToast, setShowExportToast] = useState<string | null>(null);

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

      // Filter by Date Range
      const fromIso = parseDDMMYYYYToISO(fromDate);
      const toIso = parseDDMMYYYYToISO(toDate);
      const txIso = parseDDMMYYYYToISO(tx.date);
      if (fromIso && txIso < fromIso) return false;
      if (toIso && txIso > toIso) return false;

      return true;
    });
  }, [
    selectedFundId,
    selectedSchemeId,
    periodicity,
    selectedQuarter,
    selectedHalfYear,
    selectedFY,
    fromDate,
    toDate
  ]);



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



  const handleResetFilters = () => {
    setFromDate('01/04/2026');
    setToDate('30/09/2026');
    setPeriodicity('ALL');
    setSelectedQuarter('ALL');
    setSelectedHalfYear('ALL');
    setSelectedFY('2026-27');
    setSelectedSchemeId('ALL');
  };

  const handleGenerateReport = () => {
    setShowExportToast(`Generating Expenditure Report for ${activeFund.name} (${filteredTransactions.length} records)...`);
    setTimeout(() => {
      setShowExportToast(null);
    }, 2500);
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
            <span>Nidhi Fund Expenditure Report</span>
          </div>
          <h1>Nidhi Funds Expenditure Report</h1>
        </div>
      </div>

      {/* --- Master Section: Single Consolidated Card --- */}
      <div className="nidhi-card nidhi-single-master-card">
        {/* Card Header */}
        <div className="nidhi-card-header flex-between">
          <div className="nidhi-card-title">
            <Wallet size={18} className="nidhi-icon-purple" />
            <h3>Select Nidhi Fund</h3>
          </div>
          <div className="header-right-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="nidhi-badge nidhi-badge-info">{NIDHI_FUNDS_DATA.length} Available Funds</span>
            <button className="nidhi-btn-link" onClick={handleResetFilters}>
              <RefreshCcw size={14} />
              <span>Reset All Filters</span>
            </button>
          </div>
        </div>

        {/* TWO-ROW FILTER GRID LAYOUT */}
        <div className="nidhi-filter-grid-container">
          {/* ROW 1: Choose Nidhi Fund Account, From Date, To Date */}
          <div className="nidhi-top-filter-row">
            {/* FIELD 1: Choose Nidhi Fund Account */}
            <div className="filter-group">
              <label className="nidhi-field-label">
                <Wallet size={14} />
                <span>Choose Nidhi Fund Account <span className="nidhi-required">*</span></span>
              </label>
              <select
                className="nidhi-select"
                value={selectedFundId}
                onChange={(e) => handleFundChange(e.target.value)}
              >
                {NIDHI_FUNDS_DATA.map((fund) => (
                  <option key={fund.id} value={fund.id}>
                    {fund.name}
                  </option>
                ))}
              </select>
            </div>

            {/* FIELD 2: From Date */}
            <div className="filter-group">
              <label className="nidhi-field-label">
                <Calendar size={14} />
                <span>From Date</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  className="nidhi-input"
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
                <Calendar size={16} style={{ position: 'absolute', right: '12px', pointerEvents: 'none', color: '#7C3AED' }} />
              </div>
            </div>

            {/* FIELD 3: To Date */}
            <div className="filter-group">
              <label className="nidhi-field-label">
                <Calendar size={14} />
                <span>To Date</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  className="nidhi-input"
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
                <Calendar size={16} style={{ position: 'absolute', right: '12px', pointerEvents: 'none', color: '#7C3AED' }} />
              </div>
            </div>
          </div>

          {/* ROW 2: Select Scheme */}
          <div className="nidhi-bottom-filter-row">
            {/* FIELD 4: Select Scheme */}
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
            </div>
          </div>
        </div>

        {/* NET AVAILABLE BALANCE DISPLAY */}
        <div className="nidhi-balance-display-inner">
          <span className="balance-label-tag">Net Available Balance</span>
          <h2 className="nidhi-balance-amount">{formatCurrency(activeFund.availableBalance)}</h2>
        </div>

        {/* GENERATE REPORT BUTTON BELOW BALANCE */}
        <div className="nidhi-generate-report-row" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
          <button className="nidhi-btn nidhi-btn-primary" onClick={handleGenerateReport} style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '700' }}>
            <Sparkles size={16} />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* --- OFFICIAL TREASURY STATEMENT REPORT FORMAT (विवरण संख्या 21 - आरक्षित निधियां) --- */}
      <div className="nidhi-card nidhi-official-report-card">
        <div className="nidhi-official-report-header">
          <div>
            <h3 className="nidhi-official-title-hi">विवरण संख्या 21 - आरक्षित निधियां (₹ लाख में)</h3>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="nidhi-btn nidhi-btn-secondary" onClick={() => handleTriggerExport('PDF')}>
              <Download size={14} />
              <span>Export PDF</span>
            </button>
            <button className="nidhi-btn nidhi-btn-secondary" onClick={() => handleTriggerExport('EXCEL')}>
              <FileSpreadsheet size={14} />
              <span>Export Excel</span>
            </button>

          </div>
        </div>

        <div className="nidhi-official-table-wrapper">
          <table className="nidhi-official-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>लेखा का शीर्ष</th>
                <th style={{ width: '9%' }}>31 मार्च 2025 को अंत शेष (लाख में)</th>
                <th style={{ width: '9%' }}>वित्तीय वर्ष 2025-26 में प्राप्ति / निधि में अंतरण</th>
                <th style={{ width: '9%' }}>वर्तमान में कुल अंत शेष</th>
                <th style={{ width: '10%' }}>संवितरण / निधि के विरुद्ध व्यय करने वाले विभाग का नाम</th>
                <th style={{ width: '16%' }}>योजना का क्रमांक</th>
                <th style={{ width: '7%' }}>वित्तीय वर्ष में राजस्व व्यय</th>
                <th style={{ width: '7%' }}>वित्तीय वर्ष में पूंजीगत व्यय</th>
                <th style={{ width: '8%' }}>कुल व्यय (लाख में )</th>
              </tr>
            </thead>
            <tbody>
              {/* Major Group Row */}
              <tr className="tr-group-header">
                <td>(ज) आरक्षित निधि—</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>

              {/* Sub Group Row */}
              <tr className="tr-subgroup-header">
                <td>(क) ब्याज वाली आरक्षित निधियां—</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>

              {/* Major Head Row + First Scheme Row */}
              <tr>
                <td rowSpan={TREASURY_SCHEMES_DATA.length} style={{ verticalAlign: 'top', fontWeight: 700, lineHeight: '1.5' }}>
                  {activeFund.code === '8121-00-122-001' ? (
                    <>
                      <span className="font-bold">8121 - सामान्य तथा अन्य आरक्षित निधियाँ-122 राज्य आपदा मोचन निधि (SDRF)</span> (General and Other Reserve Funds)
                    </>
                  ) : (
                    <>
                      <span className="font-bold">{activeFund.code} {activeFund.name}</span> ({activeFund.category})
                    </>
                  )}
                </td>
                <td rowSpan={TREASURY_SCHEMES_DATA.length} className="text-right" style={{ verticalAlign: 'top', fontWeight: 700 }}>
                  2,300.00
                </td>
                <td rowSpan={TREASURY_SCHEMES_DATA.length} className="text-right" style={{ verticalAlign: 'top', fontWeight: 700 }}>
                  15,000.00
                </td>
                <td rowSpan={TREASURY_SCHEMES_DATA.length} className="text-right" style={{ verticalAlign: 'top', fontWeight: 700 }}>
                  7,860.00
                </td>
                <td rowSpan={TREASURY_SCHEMES_DATA.length} className="text-center" style={{ verticalAlign: 'top', fontWeight: 700 }}>
                  राजस्व
                </td>
                <td className="code-font">{TREASURY_SCHEMES_DATA[0].code}</td>
                <td className="text-right"></td>
                <td className="text-right"></td>
                <td className="text-right"></td>
              </tr>

              {/* Remaining Scheme Rows */}
              {TREASURY_SCHEMES_DATA.slice(1).map((scm, idx) => (
                <tr key={idx}>
                  <td className="code-font">{scm.code}</td>
                  <td className="text-right"></td>
                  <td className="text-right"></td>
                  <td className="text-right"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


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
                  <span className="detail-val">{formatDateDDMMYYYY(viewTransaction.date)}</span>
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
