import { useState } from 'react';
import {
  Shield,
  Lock,
  Calendar,
  Clock,
  RotateCcw,
  ArrowRight,
  ChevronsDown,
  ChevronsUp,
} from 'lucide-react';
import { IFMISAccordion, IFMISField } from '../../components/ifmis/IFMISAccordion';
import CommentLayer from '../../components/feedback/CommentLayer';
import '../../components/ifmis/ifmis-components.css';

export default function DepositAccountNumberScreen() {
  const [allOpen, setAllOpen] = useState(true);

  // Simulated data — would come from API after Treasury approval
  const accountData = {
    depositType: 'PD',
    depositTypeFull: 'Personal Deposit',
    department: 'Finance Department',
    ddo: 'District Treasury Officer, Bhopal',
    hoo: 'Head of Office — Treasury Directorate',
    hod: 'Director, Treasuries & Accounts',
    hoad: 'Principal Secretary, Finance',
    treasuryCode: 'TR-MP-BPL-001',
    treasuryName: 'District Treasury, Bhopal',
    sanctionOrderNo: 'SO/FD/2026/00145',
    sanctionDate: '15-Apr-2026',
    approvedBy: 'Shri R.K. Sharma, HoAD',
    requestStatus: 'Sanctioned',
    generatedAccountNo: 'PD-TR001-042026-4589-FIN',
    generationDate: '15-Apr-2026',
    generationTime: '13:05:42',
    accountStatus: 'Account Created',
    purposeCode: 'FIN-DEP-GEN',
    sequenceNo: '4589',
    financialYear: '2026-27',
    formatRule: 'TYPE-TREASURY-MMYYYY-SEQ-PURPOSE',
  };

  return (
    <CommentLayer screenId="sprint2-story1-deposit-account-number" moduleName="deposit">
      <div className="screen" style={{ maxWidth: '1100px' }}>

        {/* Page Breadcrumb Bar */}
        <div className="ifmis-page-breadcrumb">
          <div className="ifmis-page-breadcrumb__left">
            <a href="/">Deposit</a>
            <span>›</span>
            <a href="/">Account Management</a>
            <span>›</span>
            <strong>Account Number Generation</strong>
          </div>
          <div className="ifmis-page-breadcrumb__right">
            <button
              className="ifmis-btn-collapse-all"
              onClick={() => setAllOpen(!allOpen)}
            >
              {allOpen ? <ChevronsUp size={14} /> : <ChevronsDown size={14} />}
              {allOpen ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
        </div>

        {/* Status Card */}
        <div className="ifmis-status-card">
          <div className="ifmis-status-card__icon">
            <Shield size={28} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
            <span className="ifmis-status-card__icon-label">Account</span>
            <span className="ifmis-status-card__icon-badge ifmis-status-card__icon-badge--created">
              Created
            </span>
          </div>
          <div className="ifmis-status-card__details">
            <div className="ifmis-status-card__item">
              <span className="ifmis-status-card__item-label">Account Number</span>
              <span className="ifmis-status-card__item-value ifmis-status-card__item-value--primary ifmis-status-card__item-value--large">
                {accountData.generatedAccountNo}
              </span>
            </div>
            <div className="ifmis-status-card__item">
              <span className="ifmis-status-card__item-label">Sanction Order No.</span>
              <span className="ifmis-status-card__item-value">
                {accountData.sanctionOrderNo}
              </span>
            </div>
            <div className="ifmis-status-card__item">
              <span className="ifmis-status-card__item-label">Account Status</span>
              <span className="ifmis-status-card__item-value ifmis-status-card__item-value--success">
                ✓ {accountData.accountStatus}
              </span>
            </div>
            <div className="ifmis-status-card__item">
              <span className="ifmis-status-card__item-label">Date</span>
              <span className="ifmis-status-card__item-value">{accountData.generationDate}</span>
            </div>
            <div className="ifmis-status-card__item">
              <span className="ifmis-status-card__item-label">Time</span>
              <span className="ifmis-status-card__item-value" style={{ color: 'var(--color-error)' }}>
                {accountData.generationTime}
              </span>
            </div>
            <div className="ifmis-status-card__item">
              <span className="ifmis-status-card__item-label">Financial Year</span>
              <span className="ifmis-status-card__item-value">{accountData.financialYear}</span>
            </div>
          </div>
        </div>

        {/* Section 1: Deposit Account Details */}
        <IFMISAccordion
          number={1}
          title="Deposit Account Details"
          badges={[{ label: 'Completed', type: 'completed' }]}
          defaultOpen={allOpen}
          showNext
        >
          <div className="ifmis-field-grid ifmis-field-grid--cols-5">
            <IFMISField label="Deposit Type" value={accountData.depositType} variant="highlight" />
            <IFMISField label="Deposit Type (Full)" value={accountData.depositTypeFull} />
            <IFMISField label="Department" value={accountData.department} />
            <IFMISField label="DDO" value={accountData.ddo} />
            <IFMISField label="Treasury Code" value={accountData.treasuryCode} />
          </div>

          <div className="ifmis-field-grid ifmis-field-grid--cols-5" style={{ marginTop: 'var(--space-4)' }}>
            <IFMISField label="Treasury Name" value={accountData.treasuryName} />
            <IFMISField label="HoO" value={accountData.hoo} />
            <IFMISField label="HoD" value={accountData.hod} />
            <IFMISField label="HoAD" value={accountData.hoad} />
            <IFMISField label="Financial Year" value={accountData.financialYear} />
          </div>
        </IFMISAccordion>

        {/* Section 2: Sanction & Approval Details */}
        <IFMISAccordion
          number={2}
          title="Sanction & Approval Details"
          badges={[{ label: 'Completed', type: 'completed' }]}
          defaultOpen={allOpen}
          showNext
        >
          <div className="ifmis-field-grid ifmis-field-grid--cols-4">
            <IFMISField label="Sanction Order No." value={accountData.sanctionOrderNo} variant="highlight" />
            <IFMISField label="Sanction Date" value={accountData.sanctionDate} />
            <IFMISField label="Approved By" value={accountData.approvedBy} />
            <IFMISField label="Request Status" value={accountData.requestStatus} variant="success" />
          </div>
        </IFMISAccordion>

        {/* Section 3: Account Number Generation */}
        <IFMISAccordion
          number={3}
          title="Generated Account Number"
          badges={[{ label: 'Completed', type: 'completed' }]}
          defaultOpen={allOpen}
        >
          {/* Hero display */}
          <div className="ifmis-account-number-display">
            <span className="ifmis-account-number-display__label">
              Auto-Generated Deposit Account Number
            </span>
            <span className="ifmis-account-number-display__value">
              {accountData.generatedAccountNo}
            </span>
            <div className="ifmis-account-number-display__meta">
              <span className="ifmis-account-number-display__meta-item">
                <Calendar size={13} /> {accountData.generationDate}
              </span>
              <span className="ifmis-account-number-display__meta-item">
                <Clock size={13} /> {accountData.generationTime}
              </span>
              <span className="ifmis-account-number-display__meta-item">
                <Shield size={13} /> Uniqueness Verified
              </span>
            </div>
            <span className="ifmis-account-number-display__lock">
              <Lock size={12} /> Locked — Non-editable
            </span>
          </div>

          {/* Breakdown */}
          <div className="ifmis-field-grid ifmis-field-grid--cols-5" style={{ marginTop: 'var(--space-5)' }}>
            <IFMISField label="Deposit Type Code" value={accountData.depositType} />
            <IFMISField label="Treasury Code" value="TR001" />
            <IFMISField label="Month & Year" value="042026" />
            <IFMISField label="Sequence Number" value={accountData.sequenceNo} variant="highlight" />
            <IFMISField label="Purpose Code" value={accountData.purposeCode} />
          </div>

          <div className="ifmis-field-grid ifmis-field-grid--cols-3" style={{ marginTop: 'var(--space-4)' }}>
            <IFMISField label="Format Rule" value={accountData.formatRule} />
            <IFMISField label="Account Status" value={accountData.accountStatus} variant="success" />
            <IFMISField label="Globally Unique" value="Yes — Verified across PD, CCD, CrCD" variant="success" />
          </div>
        </IFMISAccordion>

        {/* Section 4: Account Mapping */}
        <IFMISAccordion
          number={4}
          title="Account Mapping & Persistence"
          badges={[{ label: 'Completed', type: 'completed' }]}
          defaultOpen={allOpen}
          showNext
        >
          <div className="ifmis-field-grid ifmis-field-grid--cols-3">
            <IFMISField label="Mapped to Deposit Account" value={accountData.depositTypeFull} variant="highlight" />
            <IFMISField label="Mapped to Sanction Order" value={accountData.sanctionOrderNo} />
            <IFMISField label="Mapped to Department/DDO/HoO" value={accountData.department} />
          </div>
          <div className="ifmis-field-grid ifmis-field-grid--cols-3" style={{ marginTop: 'var(--space-4)' }}>
            <IFMISField label="Stored In" value="Deposit Account Master" />
            <IFMISField label="Modification Lock" value="Locked — No further modification allowed" variant="success" />
            <IFMISField label="Reusability" value="Non-reusable — Even after account closure" />
          </div>
        </IFMISAccordion>

        {/* Section 5: Audit Trail */}
        <IFMISAccordion
          number={5}
          title="Audit Trail"
          defaultOpen={allOpen}
        >
          <table className="ifmis-audit-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Event</th>
                <th>Performed By</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Deposit Account Request Created</td>
                <td>Creator — Smt. P. Verma</td>
                <td>10-Apr-2026, 10:15:22</td>
                <td><span className="badge badge-info">Initiated</span></td>
                <td>Request submitted for PD account</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Verified by Department</td>
                <td>Verifier — Shri A.K. Singh</td>
                <td>11-Apr-2026, 14:30:10</td>
                <td><span className="badge badge-info">Verified</span></td>
                <td>All documents verified</td>
              </tr>
              <tr>
                <td>3</td>
                <td>Approved by HoD</td>
                <td>HoD — Shri M.P. Gupta</td>
                <td>12-Apr-2026, 11:45:33</td>
                <td><span className="badge badge-primary">Approved</span></td>
                <td>Forwarded to Treasury</td>
              </tr>
              <tr>
                <td>4</td>
                <td>Sanctioned by Treasury/HoAD</td>
                <td>HoAD — Shri R.K. Sharma</td>
                <td>15-Apr-2026, 12:58:10</td>
                <td><span className="badge badge-success">Sanctioned</span></td>
                <td>Sanction Order generated: {accountData.sanctionOrderNo}</td>
              </tr>
              <tr>
                <td>5</td>
                <td>Account Number Generated</td>
                <td>System (IFMIS)</td>
                <td>15-Apr-2026, 13:05:42</td>
                <td><span className="badge badge-success">Generated</span></td>
                <td>Unique Account No: {accountData.generatedAccountNo}</td>
              </tr>
              <tr>
                <td>6</td>
                <td>Account Status Updated</td>
                <td>System (IFMIS)</td>
                <td>15-Apr-2026, 13:05:43</td>
                <td><span className="badge badge-success">Account Created</span></td>
                <td>Account locked and visible to authorized users</td>
              </tr>
            </tbody>
          </table>
        </IFMISAccordion>

        {/* Section 6: Business Rules & Compliance */}
        <IFMISAccordion
          number={6}
          title="Business Rules & Compliance"
          defaultOpen={false}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div className="ifmis-field-grid ifmis-field-grid--cols-2">
              <IFMISField label="Generation Mode" value="Fully System-Driven (No manual creation)" />
              <IFMISField label="Modification Allowed" value="No — Account Number is immutable" />
            </div>
            <div className="ifmis-field-grid ifmis-field-grid--cols-2">
              <IFMISField label="Uniqueness Scope" value="Globally unique within IFMIS (across PD, CCD, CrCD)" />
              <IFMISField label="Reuse Policy" value="Non-reusable — even after account closure" />
            </div>
            <div className="ifmis-field-grid ifmis-field-grid--cols-2">
              <IFMISField label="Sequence Rule" value="Continuous numbering; gaps allowed for failed transactions" />
              <IFMISField label="Format Configuration" value="Configurable via system parameters" />
            </div>
            <div className="ifmis-field-grid ifmis-field-grid--cols-2">
              <IFMISField label="Failure Handling" value="Transaction rolled back safely on generation failure" />
              <IFMISField label="Applicable Act/Rule" value="MPTC 2020 SR 250 (1)" variant="highlight" />
            </div>
          </div>
        </IFMISAccordion>

        {/* Page Actions */}
        <div className="ifmis-page-actions">
          <button className="ifmis-btn-reset" id="action-reset">
            <RotateCcw size={16} />
            Reset
          </button>
          <button className="ifmis-btn-forward" id="action-forward">
            Forward
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </CommentLayer>
  );
}
