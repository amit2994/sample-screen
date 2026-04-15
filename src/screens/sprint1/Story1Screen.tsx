import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Upload,
  Info,
} from 'lucide-react';
import CommentLayer from '../../components/feedback/CommentLayer';
import './Screen.css';

export default function Story1Screen() {
  const [openSections, setOpenSections] = useState<string[]>(['basic', 'deposit']);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const isSectionOpen = (section: string) => openSections.includes(section);

  return (
    <CommentLayer screenId="sprint1-story1" moduleName="deposit">
      <div className="screen">
        {/* Screen header */}
        <div className="screen__header">
          <div>
            <h2 className="screen__title">Deposit Account Creation</h2>
            <p className="screen__subtitle">
              Create a new deposit account with all required details
            </p>
          </div>
          <div className="screen__header-badges">
            <span className="badge badge-info">Draft</span>
            <span className="badge badge-warning">Step 1 of 3</span>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="screen__progress">
          <div className="progress-steps">
            <div className="progress-step progress-step--active">
              <div className="progress-step__dot">1</div>
              <span className="progress-step__label">Account Details</span>
            </div>
            <div className="progress-step__line" />
            <div className="progress-step">
              <div className="progress-step__dot">2</div>
              <span className="progress-step__label">Configuration</span>
            </div>
            <div className="progress-step__line" />
            <div className="progress-step">
              <div className="progress-step__dot">3</div>
              <span className="progress-step__label">Review & Submit</span>
            </div>
          </div>
        </div>

        {/* Section: Basic Information */}
        <div className="screen__section card">
          <button
            className="screen__section-header card-header"
            onClick={() => toggleSection('basic')}
          >
            <div className="screen__section-title">
              <Info size={16} />
              <span>Basic Information</span>
            </div>
            {isSectionOpen('basic') ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {isSectionOpen('basic') && (
            <div className="card-body animate-fade-in">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Account Holder Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter full name"
                    id="field-account-holder"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Account Type <span className="required">*</span>
                  </label>
                  <select className="form-input" id="field-account-type">
                    <option value="">Select account type</option>
                    <option value="fixed">Fixed Deposit</option>
                    <option value="recurring">Recurring Deposit</option>
                    <option value="savings">Savings Deposit</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Department <span className="required">*</span>
                  </label>
                  <select className="form-input" id="field-department">
                    <option value="">Select department</option>
                    <option value="finance">Finance</option>
                    <option value="treasury">Treasury</option>
                    <option value="operations">Operations</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Employee ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., EMP-2024-001"
                    id="field-employee-id"
                  />
                  <span className="form-helper">Auto-generated if left blank</span>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Opening Date <span className="required">*</span>
                  </label>
                  <div className="form-input-icon">
                    <Calendar size={16} />
                    <input
                      type="date"
                      className="form-input"
                      id="field-opening-date"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 XXXXX XXXXX"
                    id="field-contact"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section: Deposit Details */}
        <div className="screen__section card">
          <button
            className="screen__section-header card-header"
            onClick={() => toggleSection('deposit')}
          >
            <div className="screen__section-title">
              <Info size={16} />
              <span>Deposit Details</span>
            </div>
            {isSectionOpen('deposit') ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {isSectionOpen('deposit') && (
            <div className="card-body animate-fade-in">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Deposit Amount <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="₹ 0.00"
                    id="field-deposit-amount"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Tenure (Months) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g., 12"
                    id="field-tenure"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Interest Rate (%)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Auto-calculated"
                    disabled
                    id="field-interest-rate"
                  />
                  <span className="form-helper">Based on tenure and deposit type</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Maturity Date</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Auto-calculated"
                    disabled
                    id="field-maturity-date"
                  />
                </div>

                <div className="form-group form-group--full">
                  <label className="form-label">Remarks</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Add any additional remarks..."
                    id="field-remarks"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Upload Supporting Document</label>
                  <div className="form-upload" id="field-document-upload">
                    <Upload size={20} />
                    <span>Click or drag file to upload</span>
                    <span className="form-helper">PDF, JPG, PNG up to 5MB</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Auto-renewal</label>
                  <label className="form-toggle" id="field-auto-renewal">
                    <input type="checkbox" />
                    <span className="form-toggle__slider" />
                    <span className="form-toggle__label">Enable auto-renewal on maturity</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="screen__actions">
          <button className="btn btn-secondary" id="action-save-draft">
            Save as Draft
          </button>
          <button className="btn btn-primary btn-lg" id="action-next-step">
            Next: Configuration →
          </button>
        </div>
      </div>
    </CommentLayer>
  );
}
