import { useState } from 'react';
import {
  ChevronRight, Check, AlertCircle, ChevronUp, ChevronDown,
  UploadCloud, Eye, Trash2, RotateCcw, Calendar, Upload, File
} from 'lucide-react';
import './DepositAdminRuleConfigScreen.css';

export default function DepositAdminRuleConfigScreen() {
  const [applicabilityScope, setApplicabilityScope] = useState<'global' | 'specific'>('global');
  const [depositType, setDepositType] = useState('CCD');

  return (
    <div className="deposit-interest-master animate-fade-in">
      {/* Breadcrumb & Header */}
      <div className="page-header">
        <h1>Deposit Interest Master</h1>
        <div className="breadcrumb">
          <span>Dashboard</span>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="current">deposit interest configuration</span>
        </div>
      </div>

      {/* Stepper Card */}
      <div className="card stepper-card">
        <div className="stepper-header">
          <h2>Deposit Interest Rule – Approval Status</h2>
          <span className="badge-under-creation">Under Creation</span>
        </div>
        <div className="stepper-body">
          <div className="step completed">
            <div className="step-icon-wrapper">
              <div className="step-icon"><Check size={16} strokeWidth={3} /></div>
            </div>
            <div className="step-title">Creator</div>
            <div className="step-status">Completed</div>
            <button className="btn-details">Details <span className="arrow-up-right">↗</span></button>
          </div>
          <div className="step-line dotted-green"></div>
          <div className="step completed">
            <div className="step-icon-wrapper">
              <div className="step-icon"><Check size={16} strokeWidth={3} /></div>
            </div>
            <div className="step-title">Verifier</div>
            <div className="step-status">Completed</div>
            <button className="btn-details">Details <span className="arrow-up-right">↗</span></button>
          </div>
          <div className="step-line dotted-green"></div>
          <div className="step completed">
            <div className="step-icon-wrapper">
              <div className="step-icon"><Check size={16} strokeWidth={3} /></div>
            </div>
            <div className="step-title">Approver</div>
            <div className="step-status">Completed</div>
            <button className="btn-details">Details <span className="arrow-up-right">↗</span></button>
          </div>
        </div>
      </div>

      {/* Warning Box */}
      <div className="remark-box">
        <div className="remark-header">
          <div className="remark-title">
            <div className="remark-icon"><AlertCircle size={14} /></div>
            <strong>Return Remark By Verifier (HoD):</strong>
          </div>
          <button className="btn-icon-transparent"><ChevronUp size={18} /></button>
        </div>
        <div className="remark-content">
          Lorem ipsum dolor sit amet consectetur. Enim vel nisi proin tellus. Nisl nulla est egestas ligula etiam pharetra ut pretium. Tristique lacus quisque dui consequat sollicitudin at elementum iaculis. Et mus eros commodo dolor nam ut tortor dis.
        </div>
      </div>

      {/* Collapse/Expand Buttons */}
      <div className="accordion-controls">
        <button className="btn-control"><ChevronUp size={14} /> Collapse All</button>
        <button className="btn-control"><ChevronDown size={14} /> Expand All</button>
      </div>

      {/* Accordions */}
      <div className="accordion expanded">
        <div className="accordion-header">
          <div className="accordion-title">
            <span className="accordion-number">1</span>
            <h3>Interest Rule- Basic Details</h3>
          </div>
          <button className="accordion-toggle"><ChevronUp size={16} /></button>
        </div>
        <div className="accordion-body">
          <div className="grid-3">
            <div className="form-group">
              <label>Interest Type <span className="required">*</span></label>
              <select className="form-control select-icon">
                <option>Select Interest Type</option>
              </select>
            </div>
            <div className="form-group">
              <label>Interest Calculation Method <span className="required">*</span></label>
              <input type="text" className="form-control" value="Compounding" readOnly />
            </div>
            <div className="form-group">
              <label>Interest Applicability Scope <span className="required">*</span></label>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" name="scope" value="global" checked={applicabilityScope === 'global'} onChange={() => setApplicabilityScope('global')} />
                  <span className="radio-custom"></span>
                  <span className="radio-text">Global/Deposit Type Level</span>
                </label>
                <label className="radio-label">
                  <input type="radio" name="scope" value="specific" checked={applicabilityScope === 'specific'} onChange={() => setApplicabilityScope('specific')} />
                  <span className="radio-custom"></span>
                  <span className="radio-text">Specific Account level</span>
                </label>
              </div>
            </div>
          </div>
          <div className="form-actions right">
            <button className="btn-next">Next <ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      <div className="accordion expanded">
        <div className="accordion-header">
          <div className="accordion-title">
            <span className="accordion-number">2</span>
            <h3>Interest Configuration</h3>
          </div>
          <button className="accordion-toggle"><ChevronUp size={16} /></button>
        </div>
        <div className="accordion-body">
          <div className="grid-row-1">
            <div className="form-group full-width applicable-deposit">
              <label>Applicable Deposit Type <span className="required">*</span></label>
              <div className="radio-group horizontal">
                <label className="radio-label">
                  <input type="radio" name="depositType" value="CCD" checked={depositType === 'CCD'} onChange={() => setDepositType('CCD')} />
                  <span className="radio-custom"></span>
                  <span className="radio-text">Civil Court Deposit(CCD)</span>
                </label>
                <label className="radio-label">
                  <input type="radio" name="depositType" value="CrCD" checked={depositType === 'CrCD'} onChange={() => setDepositType('CrCD')} />
                  <span className="radio-custom"></span>
                  <span className="radio-text">Criminel Court Deposit (CrCD)</span>
                </label>
                <label className="radio-label">
                  <input type="radio" name="depositType" value="PD" checked={depositType === 'PD'} onChange={() => setDepositType('PD')} />
                  <span className="radio-custom"></span>
                  <span className="radio-text">PD with fund source other then consilated fund</span>
                </label>
              </div>
            </div>
            <div className="form-group rate-interest">
              <label>Rate Of Interest (%) <span className="required">*</span></label>
              <input type="text" className="form-control" placeholder="eg 6.5 %" />
            </div>
          </div>
          
          <div className="grid-3 configuration-row-2">
            <div className="form-group">
              <label>Compounding Frequency <span className="required">*</span></label>
              <select className="form-control select-icon">
                <option>Select Interest Type</option>
              </select>
            </div>
            <div className="form-group">
              <label>Effective From Date <span className="required">*</span></label>
              <div className="date-input-wrapper">
                <input type="text" className="form-control" placeholder="mm/dd/yyyy" />
                <Calendar className="date-icon" size={16} />
              </div>
            </div>
            <div className="form-group">
              <label>Effective to Date <span className="required">*</span></label>
              <div className="date-input-wrapper">
                <input type="text" className="form-control" placeholder="mm/dd/yyyy" />
                <Calendar className="date-icon" size={16} />
              </div>
            </div>
          </div>
          <div className="form-actions right">
            <button className="btn-next">Next <ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      <div className="accordion expanded">
        <div className="accordion-header">
          <div className="accordion-title">
            <span className="accordion-number">3</span>
            <h3>Fd Circular/Order & Documentation</h3>
          </div>
          <button className="accordion-toggle"><ChevronUp size={16} /></button>
        </div>
        <div className="accordion-body">
          <div className="grid-3">
            <div className="form-group">
              <label>Circular Order <span className="required">*</span></label>
              <input type="text" className="form-control" placeholder="eg Mp Treasury Code 2020" />
            </div>
            <div className="form-group">
              <label>Letter Number <span className="required">*</span></label>
              <input type="text" className="form-control" placeholder="eg 6.5 %" />
            </div>
            <div className="form-group">
              <label>Issue Date <span className="required">*</span></label>
              <div className="date-input-wrapper">
                <input type="text" className="form-control" placeholder="mm/dd/yyyy" />
                <Calendar className="date-icon" size={16} />
              </div>
            </div>
          </div>

          <div className="attachments-section-wrapper">
            <div className="attachments-indicator"></div>
            <div className="attachments-section">
              <div className="attachments-label">Attachments</div>
              <div className="attachments-container">
                <div className="upload-area-wrapper">
                  <div className="upload-area">
                    <UploadCloud size={20} className="upload-icon" />
                    <span className="upload-text"><strong>Drag and Drop to Upload</strong></span>
                  </div>
                  <button className="btn-upload"><Upload size={14} /> Upload File</button>
                </div>
                <div className="files-grid">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="file-item">
                      <div className="file-info">
                        <File size={14} className="file-icon" />
                        <span className="file-name">File E-sanction {i > 3 ? 2 : 1} (10mb)</span>
                      </div>
                      <div className="file-actions">
                        <button className="btn-icon-small eye"><Eye size={14} /></button>
                        <button className="btn-icon-small trash"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="page-footer">
        <button className="btn-reset"><RotateCcw size={14} /> Reset</button>
        <button className="btn-submit"><Check size={14} /> Submit</button>
      </div>
    </div>
  );
}
