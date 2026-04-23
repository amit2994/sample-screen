import {
  Shield,
  Lock,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Copy,
  Info,
  FileText,
  Building,
  Hash
} from 'lucide-react';
import './DepositAccountNumberScreen.css';

export default function DepositAccountNumberScreen() {

  // Static data based on mockup
  const accountData = {
    generatedAccountNo: 'PD-TRMPBPL01-032026-4591-EDUSCHOL',
    generationDate: '26 Mar 2026, 14:32:18',
    sequenceNo: '#4591',
    requestID: 'DEP-REQ-2026-00147',
    sanctionDate: '2026-03-26',
    formatRule: '[Type]-[TreasuryCode]-[MMYYYY]-[SeqNo]-[PurposeCode]',
    
    // Info grid 1
    deptCode: 'DEPT-FIN-01',
    ddoCode: 'DDO-MP-BPL-0042',
    depositType: 'Personal Deposit (PD)',
    purposeCode: 'EDU-SCHOL',
    expenditureHoa: ['2202-01-102-0000-00', '2203-01-102-0000-00', '2204-01-102-0000-00'],
    hoa: '8443-00-106-0000-00',
    
    // Info grid 2
    deptName: 'Department of Finance',
    ddoName: 'Shri Rajesh Kumar Sharma',
    fundSource: 'State Fund',
    expenditurePattern: 'Standard Pattern',
    receiptHoa: ['0202-01-102-0000-00', '0203-01-102-0000-00', '0204-01-102-0000-00'],
    pdOperatorName: 'Smt. Anita Verma'
  };

  const steps = [
    { id: 'hoo', label: 'HoO', status: 'Completed', state: 'completed' },
    { id: 'hod', label: 'HoD', status: 'Completed', state: 'completed' },
    { id: 'hoad', label: 'HoAD', status: 'Completed', state: 'completed' },
    { id: 'fd', label: 'FD', status: 'Completed', state: 'completed' },
    { id: 'acc', label: 'Acc Created', status: 'Completed', state: 'completed' }
  ];

  return (
    <>
      <div className="deposit-account-screen" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header Area */}
        <div className="deposit-account-header">
          <div>
            <h2>Deposit Account Number Generation</h2>
            <p>Request ID: {accountData.requestID}</p>
          </div>
          <div className="status-badge-created">
            <CheckCircle2 size={16} /> Account Created
          </div>
        </div>

        {/* Generated Account Number Card */}
        <div className="ifmis-gen-card">
          <div className="ifmis-gen-card__icon">
            <Hash size={28} />
          </div>
          <div className="ifmis-gen-card__content">
            <div className="ifmis-gen-card__label">Generated Unique Account Number</div>
            <div className="ifmis-gen-card__number">
              {accountData.generatedAccountNo} <Copy size={16} style={{ color: '#aaa', cursor: 'pointer', marginLeft: '8px' }} />
            </div>
            <div className="ifmis-gen-card__meta">
              <span className="ifmis-gen-card__meta-item">
                <LockKeyhole size={14} /> Non-editable
              </span>
              <span className="ifmis-gen-card__meta-item">
                <Clock size={14} /> Generated: {accountData.generationDate}
              </span>
              <span className="ifmis-gen-card__meta-item">
                <Hash size={14} /> Seq: {accountData.sequenceNo}
              </span>
            </div>
          </div>
          <div className="ifmis-gen-card__format">
            <div className="ifmis-gen-card__format-label">Account Number Format</div>
            <div className="ifmis-gen-card__format-value">{accountData.formatRule}</div>
          </div>
        </div>

        {/* Stepper Card */}
        <div className="ifmis-stepper-card">
          <div className="ifmis-stepper-card__header">
            <h3 className="ifmis-stepper-card__title">Deposit Account Opening Request Status</h3>
          </div>
          <div className="ifmis-stepper__container">
            {steps.map((step, index) => (
              <div key={step.id} className={`ifmis-step ${step.state === 'pending' ? 'ifmis-step--pending' : ''}`}>
                <div className="ifmis-step__circle">
                  <CheckCircle2 strokeWidth={3} />
                </div>
                <div className="ifmis-step__title">{step.label}</div>
                <div className="ifmis-step__status">{step.status}</div>
                <a href="#" className="ifmis-step__link">Details <ArrowRight size={10} style={{ transform: 'rotate(-45deg)' }} /></a>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <>
            {/* Info Grids */}
            <div className="ifmis-info-grid">
              {/* Box 1 */}
              <div className="ifmis-info-card">
                <div className="ifmis-info-card__header">
                  <FileText className="ifmis-info-card__icon" />
                  <h3 className="ifmis-info-card__title">Deposit Account Information</h3>
                </div>
                <div className="ifmis-info-card__row">
                  <span className="ifmis-info-card__label">Dept Code</span>
                  <span className="ifmis-info-card__value">{accountData.deptCode}</span>
                </div>
                <div className="ifmis-info-card__row">
                  <span className="ifmis-info-card__label">DDO Code</span>
                  <span className="ifmis-info-card__value">{accountData.ddoCode}</span>
                </div>
                <div className="ifmis-info-card__row">
                  <span className="ifmis-info-card__label">Deposit Type</span>
                  <span className="ifmis-info-card__value">{accountData.depositType}</span>
                </div>
                <div className="ifmis-info-card__row">
                  <span className="ifmis-info-card__label">Purpose Code</span>
                  <span className="ifmis-info-card__value">{accountData.purposeCode}</span>
                </div>
                <div className="ifmis-info-card__row">
                  <span className="ifmis-info-card__label">Expenditure HoA</span>
                  <span className="ifmis-info-card__value">{Array.isArray(accountData.expenditureHoa) ? accountData.expenditureHoa.join(', ') : accountData.expenditureHoa}</span>
                </div>
                <div className="ifmis-info-card__row">
                  <span className="ifmis-info-card__label">HoA</span>
                  <span className="ifmis-info-card__value">{accountData.hoa}</span>
                </div>
              </div>

              {/* Box 2 */}
              <div className="ifmis-info-card">
                <div className="ifmis-info-card__header">
                  <Building className="ifmis-info-card__icon" />
                  <h3 className="ifmis-info-card__title">Department & Treasury Details</h3>
                </div>
                <div className="ifmis-info-card__row">
                  <span className="ifmis-info-card__label">Dept Name</span>
                  <span className="ifmis-info-card__value">{accountData.deptName}</span>
                </div>
                <div className="ifmis-info-card__row">
                  <span className="ifmis-info-card__label">DDO Name</span>
                  <span className="ifmis-info-card__value">{accountData.ddoName}</span>
                </div>
                <div className="ifmis-info-card__row">
                  <span className="ifmis-info-card__label">Fund Source</span>
                  <span className="ifmis-info-card__value">{accountData.fundSource}</span>
                </div>
                <div className="ifmis-info-card__row">
                  <span className="ifmis-info-card__label">Expenditure Pattern</span>
                  <span className="ifmis-info-card__value">{accountData.expenditurePattern}</span>
                </div>
                <div className="ifmis-info-card__row">
                  <span className="ifmis-info-card__label">Receipt HoA</span>
                  <span className="ifmis-info-card__value">{Array.isArray(accountData.receiptHoa) ? accountData.receiptHoa.join(', ') : accountData.receiptHoa}</span>
                </div>
                <div className="ifmis-info-card__row">
                  <span className="ifmis-info-card__label">PD Operator Name</span>
                  <span className="ifmis-info-card__value">{accountData.pdOperatorName}</span>
                </div>
              </div>
            </div>

            {/* Account Components Card */}
            <div className="components-card">
              <div className="components-card__header">
                <Hash className="components-card__icon" />
                <h3 className="components-card__title">Account Number Components</h3>
              </div>
              
              <div className="components-grid">
                <div className="component-box box-blue">
                  <span className="component-box__label">Deposit Type</span>
                  <span className="component-box__value">PD</span>
                </div>
                <div className="component-box box-purple">
                  <span className="component-box__label">Treasury Code</span>
                  <span className="component-box__value">TRMPBPL01</span>
                </div>
                <div className="component-box box-yellow">
                  <span className="component-box__label">Month & Year</span>
                  <span className="component-box__value">032026</span>
                </div>
                <div className="component-box box-green">
                  <span className="component-box__label">Sequence No.</span>
                  <span className="component-box__value">4591</span>
                </div>
                <div className="component-box box-red">
                  <span className="component-box__label">Purpose Code</span>
                  <span className="component-box__value">EDUSCHOL</span>
                </div>
              </div>
              
              <div className="components-footer">
                <Info size={14} />
                Sequence number 4591 is globally unique across all deposit types (PD, CCD, CrCD)
              </div>
            </div>
          </>

        {/* Footer Actions */}
        <div className="deposit-footer">
          <div className="deposit-footer__ref">
            Ref: MPTC 2020 SR 250 (1) • Account Number is system-generated and non-editable
          </div>
          <div className="deposit-footer__actions">
          </div>
        </div>

      </div>
    </>
  );
}
