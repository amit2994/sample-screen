import React, { useState } from 'react';
import {
  Building2,
  ChevronDown,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  RotateCcw,
  Send,
  AlertCircle,
  Layers,
  Sparkles,
  Wallet,
  ArrowDownRight,
  CreditCard,
  RefreshCw,
  X
} from 'lucide-react';
import CommentLayer from '../../components/feedback/CommentLayer';
import './SchemeMappingWithNidhiFundScreen.css';

// ============================================================
// DATA TYPES & INTERFACES
// ============================================================

export interface DeptBCOProfile {
  deptCode: string;
  deptName: string;
  bcoCode: string;
  bcoName: string;
  treasuryCode: string;
  treasuryName: string;
}

export interface NidhiFundOption {
  id: string;
  code: string;
  name: string;
  headOfAccount: string;
  category: string;
  availableBalance: number;
  committedBalance: number;
  treasuryName: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface HoAFieldState {
  demandNo: string;
  majorHead: string;
  subMajorHead: string;
  minorHead: string;
  segmentHead: string;
  schemeCode: string;
  projectCode: string;
  objectHead: string;
  detailHead: string;
}

export interface MappedHoAItem {
  id: string;
  sectionType: 'TRANSFER_IN' | 'EXPENDITURE' | 'RERECEIPT';
  demandNo: string;
  majorHead: string;
  subMajorHead: string;
  minorHead: string;
  segmentHead: string;
  schemeCode: string;
  schemeName: string;
  projectCode: string;
  objectHead: string;
  detailHead: string;
  fullHoACode: string;
  mappedAt: string;
  status: 'ACTIVE' | 'PENDING_APPROVAL';
}

// ============================================================
// MOCK REFERENCE DATA
// ============================================================

const DEPT_BCO_PROFILES: DeptBCOProfile[] = [
  {
    deptCode: '5000405001',
    deptName: 'Agriculture & Farmers Welfare Department',
    bcoCode: 'BCO-50004-AGRI',
    bcoName: 'Directorate of Agriculture & Budget Controlling Officer',
    treasuryCode: 'TR-500',
    treasuryName: 'Singrauli District Treasury'
  },
  {
    deptCode: '4000302005',
    deptName: 'Public Works Department (PWD)',
    bcoCode: 'BCO-40003-PWD',
    bcoName: 'Chief Engineer (HQ) & Budget Controlling Officer',
    treasuryCode: 'TR-500',
    treasuryName: 'Singrauli District Treasury'
  },
  {
    deptCode: '3000201002',
    deptName: 'Forest & Wildlife Department',
    bcoCode: 'BCO-30002-FOR',
    bcoName: 'Principal Chief Conservator of Forests & BCO',
    treasuryCode: 'TR-500',
    treasuryName: 'Singrauli District Treasury'
  },
  {
    deptCode: '6000508001',
    deptName: 'Urban Administration & Development Department',
    bcoCode: 'BCO-60005-UAD',
    bcoName: 'Commissioner, Urban Administration & BCO',
    treasuryCode: 'TR-500',
    treasuryName: 'Singrauli District Treasury'
  }
];

const NIDHI_FUNDS_LIST: NidhiFundOption[] = [
  {
    id: 'NF-01',
    code: '8121-122',
    name: '8121 - सामान्य तथा अन्य आरक्षित निधियाँ-122 राज्य आपदा मोचन निधि (SDRF)',
    headOfAccount: '8121-00-122-0001',
    category: 'General & Other Reserve Funds',
    availableBalance: 630000000,
    committedBalance: 32000000,
    treasuryName: 'Singrauli Treasury / State SDRF Cell',
    status: 'ACTIVE'
  },
  {
    id: 'NF-02',
    code: '8121-129',
    name: '8121 - 129 राज्य क्षतिपूर्ति वनरोपण निधि - CAMPA (1401 TO 1406)',
    headOfAccount: '8121-00-129-1401',
    category: 'Compensatory Afforestation Fund',
    availableBalance: 660000000,
    committedBalance: 34000000,
    treasuryName: 'Singrauli Treasury / Forest Division Cell',
    status: 'ACTIVE'
  },
  {
    id: 'NF-03',
    code: '8121-130',
    name: '8121 - 130 राज्य आपदा शमन निधि (SDMF)',
    headOfAccount: '8121-00-130-2018',
    category: 'Disaster Mitigation Fund',
    availableBalance: 485000000,
    committedBalance: 19000000,
    treasuryName: 'Singrauli Treasury / State SDMF Cell',
    status: 'ACTIVE'
  },
  {
    id: 'NF-04',
    code: '8229-110',
    name: '8229 - 110 खनिज क्षेत्र विकास निधि (Mineral Area Development Nidhi Fund)',
    headOfAccount: '8229-00-110-7667',
    category: 'Development & Welfare Funds',
    availableBalance: 842000000,
    committedBalance: 42000000,
    treasuryName: 'Singrauli District Mining Cell',
    status: 'ACTIVE'
  },
  {
    id: 'NF-05',
    code: '8235-200',
    name: '8235 - 200 मध्य प्रदेश राज्य अधोसंरचना विकास निधि (Infrastructure Fund)',
    headOfAccount: '8235-00-200-5504',
    category: 'Special Infrastructure Fund',
    availableBalance: 1120000000,
    committedBalance: 58000000,
    treasuryName: 'Singrauli District Treasury',
    status: 'ACTIVE'
  }
];

// Dropdown Options
const DEMAND_NO_OPTIONS = [
  { value: '15', label: 'Demand 15 - Agriculture and Farmers Welfare Department' },
  { value: '22', label: 'Demand 22 - Public Works - Roads and Bridges' },
  { value: '30', label: 'Demand 30 - Forest and Wildlife Department' },
  { value: '41', label: 'Demand 41 - Water Resources Department' },
  { value: '55', label: 'Demand 55 - Rural Development & Panchayati Raj' },
  { value: '68', label: 'Demand 68 - Urban Administration and Development' }
];

const MAJOR_HEAD_OPTIONS = [
  { value: '2245', label: '2245 - Relief on account of Natural Calamities' },
  { value: '2401', label: '2401 - Crop Husbandry' },
  { value: '2406', label: '2406 - Forestry and Wild Life' },
  { value: '2702', label: '2702 - Minor Irrigation' },
  { value: '3054', label: '3054 - Roads and Bridges' },
  { value: '4216', label: '4216 - Capital Outlay on Housing' },
  { value: '4401', label: '4401 - Capital Outlay on Crop Husbandry' },
  { value: '8121', label: '8121 - General and Other Reserve Funds' },
  { value: '8443', label: '8443 - Civil Deposits' }
];

const SUB_MAJOR_HEAD_OPTIONS = [
  { value: '00', label: '00 - Not Applicable / General' },
  { value: '01', label: '01 - Crop Husbandry' },
  { value: '02', label: '02 - Floods, Cyclones & Natural Calamities' },
  { value: '03', label: '03 - Environmental Forestry & Wildlife' },
  { value: '04', label: '04 - District & State Highway Works' },
  { value: '80', label: '80 - General Administration' }
];

const MINOR_HEAD_OPTIONS = [
  { value: '101', label: '101 - Direction & Administration' },
  { value: '102', label: '102 - Flood Control and Drainage' },
  { value: '104', label: '104 - Agricultural Farms & Extension Service' },
  { value: '106', label: '106 - Personal Deposit Accounts' },
  { value: '110', label: '110 - State Road Fund Transfers' },
  { value: '122', label: '122 - State Disaster Response Fund' },
  { value: '129', label: '129 - State Compensatory Afforestation Fund' },
  { value: '800', label: '800 - Other Expenditure / Transfers' }
];

const SEGMENT_HEAD_OPTIONS = [
  { value: '01', label: '01 - State Development Schemes (SDS)' },
  { value: '02', label: '02 - Centrally Sponsored Schemes (CSS)' },
  { value: '03', label: '03 - Central Sector Schemes (CS)' },
  { value: '04', label: '04 - External Aided Projects (EAP)' },
  { value: '05', label: '05 - Non-Scheme / Establishment' }
];

const SCHEME_CODE_OPTIONS = [
  { value: '0101', name: 'Rashtriya Krishi Vikas Yojana (RKVY)', label: '0101 - Rashtriya Krishi Vikas Yojana (RKVY)' },
  { value: '0102', name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)', label: '0102 - Pradhan Mantri Fasal Bima Yojana (PMFBY)' },
  { value: '1401', name: 'Compensatory Afforestation Catchment Treatment', label: '1401 - Compensatory Afforestation Catchment Treatment' },
  { value: '2018', name: 'State Disaster Mitigation Infrastructure', label: '2018 - State Disaster Mitigation Infrastructure' },
  { value: '5504', name: 'PMGSY Rural Connectivity Bridge Works', label: '5504 - PMGSY Rural Connectivity Bridge Works' },
  { value: '6436', name: 'Special Assistance for Capital Investment (SACI)', label: '6436 - Special Assistance for Capital Investment (SACI)' },
  { value: '7667', name: 'District Mineral Community Asset Restoration', label: '7667 - District Mineral Community Asset Restoration' },
  { value: '8012', name: 'Soil Health & Micro-Nutrient Management Mission', label: '8012 - Soil Health & Micro-Nutrient Management Mission' }
];

const PROJECT_CODE_OPTIONS = [
  { value: 'PRJ-DEFAULT', label: 'PRJ-DEFAULT - General State Project' },
  { value: 'PRJ-AGRI-2026-01', label: 'PRJ-AGRI-2026-01 - Farm Mechanization Cluster' },
  { value: 'PRJ-CAMPA-AFF-02', label: 'PRJ-CAMPA-AFF-02 - Eco-Restoration & Bio-Shielding' },
  { value: 'PRJ-DM-INFRA-03', label: 'PRJ-DM-INFRA-03 - Emergency Shelter Construction' },
  { value: 'PRJ-PWD-HWY-04', label: 'PRJ-PWD-HWY-04 - District Highway Modernization' },
  { value: 'PRJ-IRR-WAT-05', label: 'PRJ-IRR-WAT-05 - Lift Irrigation Facility Singrauli' }
];

const OBJECT_HEAD_OPTIONS = [
  { value: '10', label: '10 - Salaries & Honorarium' },
  { value: '21', label: '21 - Supplies & Materials' },
  { value: '24', label: '24 - Maintenance & Repairs' },
  { value: '31', label: '31 - Grants-in-Aid (General)' },
  { value: '32', label: '32 - Contributions & Inter-Fund Transfers' },
  { value: '42', label: '42 - Major Works & Capital Assets' },
  { value: '44', label: '44 - Minor Construction Works' },
  { value: '51', label: '51 - Machinery and Equipment' }
];

const DETAIL_HEAD_OPTIONS = [
  { value: '001', label: '001 - General / Office Administrative Expenses' },
  { value: '002', label: '002 - Wages / Operational Labor' },
  { value: '007', label: '007 - Infrastructure Construction & Civil Assets' },
  { value: '010', label: '010 - Contractual Services & Consultancy' },
  { value: '012', label: '012 - Technical Equipment & Sensor Setup' },
  { value: '015', label: '015 - Capacity Building & Field Training' }
];

const INITIAL_HOA_STATE: HoAFieldState = {
  demandNo: '',
  majorHead: '',
  subMajorHead: '',
  minorHead: '',
  segmentHead: '',
  schemeCode: '',
  projectCode: '',
  objectHead: '',
  detailHead: ''
};

// Initial Seed Mappings
const INITIAL_MAPPED_ITEMS: MappedHoAItem[] = [];

export default function SchemeMappingWithNidhiFundScreen() {
  // 1. Auto-Fetched Dept / BCO State
  const activeProfile = DEPT_BCO_PROFILES[0];

  // 2. Nidhi Fund State
  const [selectedNidhiId, setSelectedNidhiId] = useState<string>('NF-01');
  const activeNidhi = NIDHI_FUNDS_LIST.find((n) => n.id === selectedNidhiId) || NIDHI_FUNDS_LIST[0];

  // 3. Three Section Form States
  const [transferInForm, setTransferInForm] = useState<HoAFieldState>({
    ...INITIAL_HOA_STATE,
    demandNo: '15',
    majorHead: '2401',
    subMajorHead: '00',
    minorHead: '104'
  });
  const [expenditureForm, setExpenditureForm] = useState<HoAFieldState>({
    ...INITIAL_HOA_STATE,
    demandNo: '15',
    majorHead: '2245',
    subMajorHead: '02',
    minorHead: '102'
  });
  const [rereceiptForm, setRereceiptForm] = useState<HoAFieldState>({
    ...INITIAL_HOA_STATE,
    demandNo: '15',
    majorHead: '2401',
    subMajorHead: '00',
    minorHead: '800'
  });

  // Validation Errors per section
  const [transferInError, setTransferInError] = useState<string | null>(null);
  const [expenditureError, setExpenditureError] = useState<string | null>(null);
  const [rereceiptError, setRereceiptError] = useState<string | null>(null);

  // Mapped list across all 3 sections
  const [mappedItems, setMappedItems] = useState<MappedHoAItem[]>(INITIAL_MAPPED_ITEMS);

  // UI Modals & Notifications
  const [itemToView, setItemToView] = useState<MappedHoAItem | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);
  const [submissionRef, setSubmissionRef] = useState<string | null>(null);

  // Helper to compute HoA string preview
  const generateHoACode = (form: HoAFieldState): string => {
    const parts = [
      form.demandNo || 'XX',
      form.majorHead || 'XXXX',
      form.subMajorHead || 'XX',
      form.minorHead || 'XXX',
      form.schemeCode || 'XXXX',
      form.segmentHead || 'XX',
      form.objectHead || 'XX',
      form.detailHead || 'XXX'
    ];
    return parts.join('-');
  };

  // Add Handler for each section
  const handleAddHoA = (
    sectionType: 'TRANSFER_IN' | 'EXPENDITURE' | 'RERECEIPT',
    formState: HoAFieldState,
    setError: (msg: string | null) => void,
    setForm: React.Dispatch<React.SetStateAction<HoAFieldState>>
  ) => {
    // Required fields check (all except projectCode as seen in screenshot)
    const requiredKeys: (keyof HoAFieldState)[] = [
      'demandNo',
      'majorHead',
      'subMajorHead',
      'minorHead',
      'segmentHead',
      'schemeCode',
      'objectHead',
      'detailHead'
    ];

    const missing = requiredKeys.filter((k) => !formState[k]);
    if (missing.length > 0) {
      setError(`Please select all mandatory (*) fields before adding to ${
        sectionType === 'TRANSFER_IN'
          ? 'Transfer-in'
          : sectionType === 'EXPENDITURE'
          ? 'Expenditure'
          : 'Re-receipt'
      } mapping.`);
      return;
    }

    const fullCode = generateHoACode(formState);

    // Check duplicate in same section
    const isDuplicate = mappedItems.some(
      (item) => item.sectionType === sectionType && item.fullHoACode === fullCode
    );
    if (isDuplicate) {
      setError(`This Head of Account (${fullCode}) is already mapped in this section.`);
      return;
    }

    setError(null);

    const schemeObj = SCHEME_CODE_OPTIONS.find((s) => s.value === formState.schemeCode);
    const schemeName = schemeObj ? schemeObj.name : `Scheme ${formState.schemeCode}`;

    const newItem: MappedHoAItem = {
      id: `MAP-${Date.now().toString().slice(-6)}`,
      sectionType,
      demandNo: formState.demandNo,
      majorHead: formState.majorHead,
      subMajorHead: formState.subMajorHead,
      minorHead: formState.minorHead,
      segmentHead: formState.segmentHead,
      schemeCode: formState.schemeCode,
      schemeName,
      projectCode: formState.projectCode || 'PRJ-DEFAULT',
      objectHead: formState.objectHead,
      detailHead: formState.detailHead,
      fullHoACode: fullCode,
      mappedAt: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'ACTIVE'
    };

    setMappedItems((prev) => [newItem, ...prev]);

    // Show temporary toast
    setShowSuccessToast(`Successfully added Head of Account (${fullCode}) to mapping.`);
    setTimeout(() => setShowSuccessToast(null), 4000);

    // Retain demand & major for faster repeated input, reset specific leaves
    setForm((prev) => ({
      ...prev,
      schemeCode: '',
      segmentHead: '',
      objectHead: '',
      detailHead: '',
      projectCode: ''
    }));
  };

  // Delete Handler
  const handleDeleteItem = (id: string) => {
    setMappedItems((prev) => prev.filter((item) => item.id !== id));
    setShowSuccessToast('HoA Mapping record removed.');
    setTimeout(() => setShowSuccessToast(null), 3000);
  };

  // Submit All Mappings
  const handleSubmitAll = () => {
    if (mappedItems.length === 0) {
      alert('Please add at least one Scheme / HoA mapping across the sections before submitting.');
      return;
    }
    const refId = `MAP-NIDHI-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmissionRef(refId);
    setShowSubmitModal(true);
  };

  // Reset All Mappings
  const handleResetAll = () => {
    if (window.confirm('Are you sure you want to reset all mappings and start fresh?')) {
      setMappedItems([]);
      setTransferInForm(INITIAL_HOA_STATE);
      setExpenditureForm(INITIAL_HOA_STATE);
      setRereceiptForm(INITIAL_HOA_STATE);
      setTransferInError(null);
      setExpenditureError(null);
      setRereceiptError(null);
      setShowSuccessToast('All mappings have been reset.');
      setTimeout(() => setShowSuccessToast(null), 3000);
    }
  };

  // Filter mapped items per section
  const transferInItems = mappedItems.filter((i) => i.sectionType === 'TRANSFER_IN');
  const expenditureItems = mappedItems.filter((i) => i.sectionType === 'EXPENDITURE');
  const rereceiptItems = mappedItems.filter((i) => i.sectionType === 'RERECEIPT');

  // Reusable 10-field component rendering exactly as the screenshot
  const renderHoAFields = (
    form: HoAFieldState,
    setForm: React.Dispatch<React.SetStateAction<HoAFieldState>>,
    sectionClass: string,
    onAdd: () => void,
    validationError: string | null
  ) => {
    return (
      <div className={`sn-fields-container ${sectionClass}`}>
        {/* Validation Alert */}
        {validationError && (
          <div className="sn-validation-alert">
            <AlertCircle size={16} />
            <span>{validationError}</span>
          </div>
        )}

        {/* 3-COLUMN GRID */}
        <div className="sn-fields-grid-3">
          {/* Field 1: Demand No * */}
          <div className="sn-field-group">
            <label className="sn-label">
              Demand No <span className="sn-req">*</span>
            </label>
            <div className="sn-select-wrapper">
              <select
                className={`sn-select ${!form.demandNo ? 'has-placeholder' : ''}`}
                value={form.demandNo}
                onChange={(e) => setForm((prev) => ({ ...prev, demandNo: e.target.value }))}
              >
                <option value="">Select Demand No</option>
                {DEMAND_NO_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="sn-select-arrow" />
            </div>
          </div>

          {/* ROW 1 - Field 3: Major Head * */}
          <div className="sn-field-group">
            <label className="sn-label">
              Major Head <span className="sn-req">*</span>
            </label>
            <div className="sn-select-wrapper">
              <select
                className={`sn-select ${!form.majorHead ? 'has-placeholder' : ''}`}
                value={form.majorHead}
                onChange={(e) => setForm((prev) => ({ ...prev, majorHead: e.target.value }))}
              >
                <option value="">Select Major Head</option>
                {MAJOR_HEAD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="sn-select-arrow" />
            </div>
          </div>

          {/* ROW 2 - Field 4: Sub Major Head * */}
          <div className="sn-field-group">
            <label className="sn-label">
              Sub Major Head <span className="sn-req">*</span>
            </label>
            <div className="sn-select-wrapper">
              <select
                className={`sn-select ${!form.subMajorHead ? 'has-placeholder' : ''}`}
                value={form.subMajorHead}
                onChange={(e) => setForm((prev) => ({ ...prev, subMajorHead: e.target.value }))}
              >
                <option value="">Select Sub Major Head</option>
                {SUB_MAJOR_HEAD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="sn-select-arrow" />
            </div>
          </div>

          {/* ROW 2 - Field 5: Minor Head * */}
          <div className="sn-field-group">
            <label className="sn-label">
              Minor Head <span className="sn-req">*</span>
            </label>
            <div className="sn-select-wrapper">
              <select
                className={`sn-select ${!form.minorHead ? 'has-placeholder' : ''}`}
                value={form.minorHead}
                onChange={(e) => setForm((prev) => ({ ...prev, minorHead: e.target.value }))}
              >
                <option value="">Select Minor Head</option>
                {MINOR_HEAD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="sn-select-arrow" />
            </div>
          </div>

          {/* ROW 2 - Field 6: Segment Head * */}
          <div className="sn-field-group">
            <label className="sn-label">
              Segment Head <span className="sn-req">*</span>
            </label>
            <div className="sn-select-wrapper">
              <select
                className={`sn-select ${!form.segmentHead ? 'has-placeholder' : ''}`}
                value={form.segmentHead}
                onChange={(e) => setForm((prev) => ({ ...prev, segmentHead: e.target.value }))}
              >
                <option value="">Select Segment Head</option>
                {SEGMENT_HEAD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="sn-select-arrow" />
            </div>
          </div>

          {/* ROW 3 - Field 7: Scheme Code * */}
          <div className="sn-field-group">
            <label className="sn-label">
              Scheme Code <span className="sn-req">*</span>
            </label>
            <div className="sn-select-wrapper">
              <select
                className={`sn-select ${!form.schemeCode ? 'has-placeholder' : ''}`}
                value={form.schemeCode}
                onChange={(e) => setForm((prev) => ({ ...prev, schemeCode: e.target.value }))}
              >
                <option value="">Select Scheme Code</option>
                {SCHEME_CODE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="sn-select-arrow" />
            </div>
          </div>

          {/* ROW 3 - Field 8: Project Code */}
          <div className="sn-field-group">
            <label className="sn-label">Project Code</label>
            <div className="sn-select-wrapper">
              <select
                className={`sn-select ${!form.projectCode ? 'has-placeholder' : ''}`}
                value={form.projectCode}
                onChange={(e) => setForm((prev) => ({ ...prev, projectCode: e.target.value }))}
              >
                <option value="">Select Project Code</option>
                {PROJECT_CODE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="sn-select-arrow" />
            </div>
          </div>

          {/* ROW 3 - Field 9: Object Head * */}
          <div className="sn-field-group">
            <label className="sn-label">
              Object Head <span className="sn-req">*</span>
            </label>
            <div className="sn-select-wrapper">
              <select
                className={`sn-select ${!form.objectHead ? 'has-placeholder' : ''}`}
                value={form.objectHead}
                onChange={(e) => setForm((prev) => ({ ...prev, objectHead: e.target.value }))}
              >
                <option value="">Select Object Head</option>
                {OBJECT_HEAD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="sn-select-arrow" />
            </div>
          </div>

          {/* ROW 4 - Field 10: Detail Head * */}
          <div className="sn-field-group">
            <label className="sn-label">
              Detail Head <span className="sn-req">*</span>
            </label>
            <div className="sn-select-wrapper">
              <select
                className={`sn-select ${!form.detailHead ? 'has-placeholder' : ''}`}
                value={form.detailHead}
                onChange={(e) => setForm((prev) => ({ ...prev, detailHead: e.target.value }))}
              >
                <option value="">Select Detail Head</option>
                {DETAIL_HEAD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="sn-select-arrow" />
            </div>
          </div>
        </div>

        {/* Live HoA Preview & Add Button Row */}
        <div className="sn-action-row">
          <div className="sn-live-preview">
            <span className="sn-live-preview-label">
              <Sparkles size={14} /> HoA Preview:
            </span>
            <span className="sn-live-preview-code">
              {generateHoACode(form)}
            </span>
          </div>

          <button
            type="button"
            className="sn-btn-add"
            onClick={onAdd}
          >
            <Plus size={16} />
            <span>Add Selected Head</span>
          </button>
        </div>
      </div>
    );
  };

  // Reusable Table for Mapped Items per Section
  const renderMappedTable = (items: MappedHoAItem[], sectionLabel: string) => {
    return (
      <div className="sn-table-card">
        <div className="sn-table-header-bar">
          <span>Mapped HoA Entries for {sectionLabel}</span>
          <span className="sn-count-badge">{items.length} Record{items.length !== 1 ? 's' : ''}</span>
        </div>

        {items.length === 0 ? (
          <div className="sn-empty-table-state">
            <AlertCircle size={28} />
            <p>
              No Head of Account mapped yet for this section. Select the fields above and click <strong>"Add Selected Head"</strong>.
            </p>
          </div>
        ) : (
          <div className="sn-table-wrapper">
            <table className="sn-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>Head of Account (HoA)</th>
                  <th style={{ textAlign: 'center', width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td>
                      <span className="sn-table-code-badge" style={{ fontSize: '13px', padding: '4px 10px' }}>
                        {item.fullHoACode}
                      </span>
                    </td>
                    <td>
                      <div className="sn-table-actions" style={{ justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="sn-icon-btn"
                          title="View Full HoA Metadata"
                          onClick={() => setItemToView(item)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          className="sn-icon-btn delete"
                          title="Remove from Mapping"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="scheme-nidhi-screen">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#065F46',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <CheckCircle2 size={18} />
          <span style={{ fontSize: '13.5px', fontWeight: 600 }}>{showSuccessToast}</span>
        </div>
      )}

      {/* --- TOP HEADER --- */}
      <div className="sn-header-card">
        <div className="sn-header-left">
          <div className="sn-badge-pill">
            <Layers size={13} />
            <span>Sprint 6 • IFMIS Scheme Mapping</span>
          </div>
          <h1 className="sn-title">
            <Building2 size={26} color="#7C3AED" />
            <span>Scheme Mapping with Nidhi Fund</span>
          </h1>
        </div>
      </div>

      {/* --- 1. AUTO-FETCHED DEPT & BCO CARD --- */}
      <div className="sn-autofetch-card">
        <div className="sn-card-header-row">
          <div className="sn-card-title-group">
            <div className="sn-card-icon-circle">
              <Building2 size={18} />
            </div>
            <div>
              <h2 className="sn-card-title">Department & BCO Information</h2>
            </div>
          </div>
        </div>

        {/* 4 Auto-Fetched Fields in Grid */}
        <div className="sn-autofetch-grid">
          <div className="sn-autofetch-item">
            <span className="sn-autofetch-label">Department Code</span>
            <span className="sn-autofetch-val sn-code-font">{activeProfile.deptCode}</span>
          </div>

          <div className="sn-autofetch-item">
            <span className="sn-autofetch-label">Department Name</span>
            <span className="sn-autofetch-val">{activeProfile.deptName}</span>
          </div>

          <div className="sn-autofetch-item">
            <span className="sn-autofetch-label">BCO Code</span>
            <span className="sn-autofetch-val sn-code-font">{activeProfile.bcoCode}</span>
          </div>

          <div className="sn-autofetch-item">
            <span className="sn-autofetch-label">BCO Name</span>
            <span className="sn-autofetch-val">{activeProfile.bcoName}</span>
          </div>
        </div>
      </div>

      {/* --- 2. SELECT NIDHI DROPDOWN CARD --- */}
      <div className="sn-nidhi-selector-card">
        <div className="sn-card-header-row">
          <div className="sn-card-title-group">
            <div className="sn-card-icon-circle" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
              <Wallet size={18} />
            </div>
            <div>
              <h2 className="sn-card-title">Select Nidhi</h2>
            </div>
          </div>
        </div>

        <div className="sn-nidhi-select-row">
          <div className="sn-field-group" style={{ width: '100%', maxWidth: '640px' }}>
            <label className="sn-label">
              Select Nidhi <span className="sn-req">*</span>
            </label>
            <div className="sn-select-wrapper">
              <select
                className="sn-select"
                value={selectedNidhiId}
                onChange={(e) => setSelectedNidhiId(e.target.value)}
              >
                {NIDHI_FUNDS_LIST.map((fund) => (
                  <option key={fund.id} value={fund.id}>
                    {fund.code} — {fund.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="sn-select-arrow" />
            </div>
          </div>
        </div>
      </div>

      {/* --- 3. THE THREE SECTIONS / CARDS --- */}
      <div className="sn-sections-container">
        {/* ========================================================
            SECTION 1: Select HoA / Scheme to Transfer Fund into Nidhi
            ======================================================== */}
        <div className="sn-section-card section-transfer-in">
          <div className="sn-section-header">
            <div className="sn-section-header-left">
              <div className="sn-section-icon">
                <ArrowDownRight size={20} />
              </div>
              <div className="sn-section-title-wrap">
                <h3 className="sn-section-title">
                  Select HoA / Scheme to Transfer Fund into Nidhi
                </h3>
              </div>
            </div>

            <div className="sn-section-header-right">
              <span className="sn-count-badge">
                {transferInItems.length} Mapped Head{transferInItems.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="sn-section-body">
            {/* The 10 Form Fields */}
            {renderHoAFields(
              transferInForm,
              setTransferInForm,
              'section-transfer-in',
              () =>
                handleAddHoA(
                  'TRANSFER_IN',
                  transferInForm,
                  setTransferInError,
                  setTransferInForm
                ),
              transferInError
            )}

            {/* Mapped Items Table for Section 1 */}
            {renderMappedTable(transferInItems, 'Fund Transfer into Nidhi')}
          </div>
        </div>

        {/* ========================================================
            SECTION 2: Select Expenditure HoA / Scheme to be Charged at Nidhi
            ======================================================== */}
        <div className="sn-section-card section-expenditure">
          <div className="sn-section-header">
            <div className="sn-section-header-left">
              <div className="sn-section-icon">
                <CreditCard size={20} />
              </div>
              <div className="sn-section-title-wrap">
                <h3 className="sn-section-title">
                  Select Expenditure HoA / Scheme to be Charged at Nidhi
                </h3>
              </div>
            </div>

            <div className="sn-section-header-right">
              <span className="sn-count-badge">
                {expenditureItems.length} Mapped Head{expenditureItems.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="sn-section-body">
            {/* The 10 Form Fields */}
            {renderHoAFields(
              expenditureForm,
              setExpenditureForm,
              'section-expenditure',
              () =>
                handleAddHoA(
                  'EXPENDITURE',
                  expenditureForm,
                  setExpenditureError,
                  setExpenditureForm
                ),
              expenditureError
            )}

            {/* Mapped Items Table for Section 2 */}
            {renderMappedTable(expenditureItems, 'Expenditure Charged at Nidhi')}
          </div>
        </div>

        {/* ========================================================
            SECTION 3: Re-receipt from Nidhi into Scheme / HoA
            ======================================================== */}
        <div className="sn-section-card section-rereceipt">
          <div className="sn-section-header">
            <div className="sn-section-header-left">
              <div className="sn-section-icon">
                <RefreshCw size={20} />
              </div>
              <div className="sn-section-title-wrap">
                <h3 className="sn-section-title">
                  Re-receipt from Nidhi into Scheme / HoA
                </h3>
              </div>
            </div>

            <div className="sn-section-header-right">
              <span className="sn-count-badge">
                {rereceiptItems.length} Mapped Head{rereceiptItems.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="sn-section-body">
            {/* The 10 Form Fields */}
            {renderHoAFields(
              rereceiptForm,
              setRereceiptForm,
              'section-rereceipt',
              () =>
                handleAddHoA(
                  'RERECEIPT',
                  rereceiptForm,
                  setRereceiptError,
                  setRereceiptForm
                ),
              rereceiptError
            )}

            {/* Mapped Items Table for Section 3 */}
            {renderMappedTable(rereceiptItems, 'Re-receipt from Nidhi')}
          </div>
        </div>
      </div>

      {/* --- MASTER BOTTOM ACTION BAR --- */}
      <div className="sn-master-bar" style={{ justifyContent: 'flex-end' }}>

        <div className="sn-master-actions">
          <button
            type="button"
            className="sn-btn sn-btn-secondary"
            onClick={handleResetAll}
          >
            <RotateCcw size={15} />
            <span>Clear All</span>
          </button>
          <button
            type="button"
            className="sn-btn sn-btn-primary"
            onClick={handleSubmitAll}
          >
            <Send size={15} />
            <span>Submit Scheme Mapping</span>
          </button>
        </div>
      </div>

      {/* --- MODAL: VIEW FULL HOA DETAILS --- */}
      {itemToView && (
        <div className="sn-modal-overlay" onClick={() => setItemToView(null)}>
          <div className="sn-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="sn-modal-header">
              <h3 className="sn-modal-title">Head of Account Metadata Details</h3>
              <button
                type="button"
                className="sn-icon-btn"
                onClick={() => setItemToView(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="sn-modal-body">
              <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  Full HoA String
                </span>
                <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'monospace', color: '#1E293B', marginTop: '4px' }}>
                  {itemToView.fullHoACode}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div className="sn-autofetch-item">
                  <span className="sn-autofetch-label">Mapping Section</span>
                  <span className="sn-autofetch-val">
                    {itemToView.sectionType === 'TRANSFER_IN'
                      ? 'Transfer Fund into Nidhi'
                      : itemToView.sectionType === 'EXPENDITURE'
                      ? 'Expenditure Charged at Nidhi'
                      : 'Re-receipt from Nidhi'}
                  </span>
                </div>

                <div className="sn-autofetch-item">
                  <span className="sn-autofetch-label">Demand No</span>
                  <span className="sn-autofetch-val">Demand {itemToView.demandNo}</span>
                </div>

                <div className="sn-autofetch-item">
                  <span className="sn-autofetch-label">Major Head</span>
                  <span className="sn-autofetch-val">{itemToView.majorHead}</span>
                </div>

                <div className="sn-autofetch-item">
                  <span className="sn-autofetch-label">Sub Major Head</span>
                  <span className="sn-autofetch-val">{itemToView.subMajorHead}</span>
                </div>

                <div className="sn-autofetch-item">
                  <span className="sn-autofetch-label">Minor Head</span>
                  <span className="sn-autofetch-val">{itemToView.minorHead}</span>
                </div>

                <div className="sn-autofetch-item">
                  <span className="sn-autofetch-label">Scheme Code & Name</span>
                  <span className="sn-autofetch-val">{itemToView.schemeCode} - {itemToView.schemeName}</span>
                </div>

                <div className="sn-autofetch-item">
                  <span className="sn-autofetch-label">Segment Head</span>
                  <span className="sn-autofetch-val">{itemToView.segmentHead}</span>
                </div>

                <div className="sn-autofetch-item">
                  <span className="sn-autofetch-label">Project Code</span>
                  <span className="sn-autofetch-val">{itemToView.projectCode}</span>
                </div>

                <div className="sn-autofetch-item">
                  <span className="sn-autofetch-label">Object / Detail Head</span>
                  <span className="sn-autofetch-val">Obj: {itemToView.objectHead} | Det: {itemToView.detailHead}</span>
                </div>
              </div>
            </div>

            <div className="sn-modal-footer">
              <button
                type="button"
                className="sn-btn sn-btn-secondary"
                onClick={() => setItemToView(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: SUBMISSION CONFIRMATION --- */}
      {showSubmitModal && (
        <div className="sn-modal-overlay" onClick={() => setShowSubmitModal(false)}>
          <div className="sn-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="sn-modal-body">
              <div className="sn-success-card">
                <div className="sn-success-icon-wrap">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="sn-success-title">Scheme Mapping Submitted!</h3>
                <p className="sn-success-desc">
                  The Heads of Account scheme mappings for <strong>{activeNidhi.name}</strong> have been successfully registered and forwarded to Treasury / Finance Department for authorization.
                </p>

                <div className="sn-success-ref-box">
                  <span className="sn-success-ref-lbl">Mapping Reference Acknowledgement ID</span>
                  <span className="sn-success-ref-val">{submissionRef}</span>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '13px', color: '#475569' }}>
                  <span>✓ {transferInItems.length} Transfer-in Heads</span>
                  <span>✓ {expenditureItems.length} Expenditure Heads</span>
                  <span>✓ {rereceiptItems.length} Re-receipt Heads</span>
                </div>
              </div>
            </div>

            <div className="sn-modal-footer" style={{ justifyContent: 'center' }}>
              <button
                type="button"
                className="sn-btn sn-btn-primary"
                onClick={() => setShowSubmitModal(false)}
              >
                Done / Back to Screen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- COMMENT & FEEDBACK SYSTEM INTEGRATION --- */}
      <div className="sn-comments-section">
        <CommentLayer screenId="sprint6-story3-scheme-mapping-nidhi" />
      </div>
    </div>
  );
}
