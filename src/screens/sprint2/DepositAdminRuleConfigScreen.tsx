import React, { useState } from 'react';
import {
  Settings, Calculator, FileText, Upload,
  Search, X, HelpCircle, Save, CheckCircle
} from 'lucide-react';
import './DepositAdminRuleConfigScreen.css';

export default function DepositAdminRuleConfigScreen() {
  const [applicabilityScope, setApplicabilityScope] = useState<'global' | 'specific'>('global');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const mockAccounts = ['PD-49320', 'PD-82011', 'DEP-0921', 'PD-55910'];

  const handleScopeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApplicabilityScope(e.target.value as 'global' | 'specific');
  };

  const handleAddAccount = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      if (!selectedAccounts.includes(searchQuery.trim())) {
        setSelectedAccounts([...selectedAccounts, searchQuery.trim().toUpperCase()]);
      }
      setSearchQuery('');
    }
  };

  const handleRemoveAccount = (account: string) => {
    setSelectedAccounts(selectedAccounts.filter(a => a !== account));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Intentionally left blank for UI mock
    console.log("Form Submitted");
  };

  return (
    <div className="deposit-admin-config animate-fade-in">
      <header>
        <h1>Deposit Rule Configuration</h1>
        <p className="header-desc">
          Configure and manage deposit-related business rules, interest rates, and compliance directives.
        </p>
      </header>

      <form onSubmit={handleSubmit}>
        {/* Section 1: Basic Details */}
        <div className="config-section">
          <div className="config-section-header">
            <div className="config-section-icon">
              <Settings size={18} />
            </div>
            <h2>1. Interest Rule – Basic Details</h2>
          </div>
          <div className="config-section-body">
            <div className="grid-2-col">
              <div className="form-group form-row">
                <label className="form-label">
                  Interest Type <span className="required">*</span>
                </label>
                <select className="form-input" required>
                  <option value="">Select Interest Type</option>
                  <option value="saving">Saving Interest</option>
                  <option value="deposit">Deposit Interest</option>
                </select>
              </div>

              <div className="form-group form-row">
                <label className="form-label">
                  Interest Calculation Method <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value="Compounding"
                  disabled
                  readOnly
                />
                <span className="form-helper">System-fixed calculation method.</span>
              </div>
            </div>

            <div className="form-group form-row" style={{ marginTop: 'var(--space-4)' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Interest Applicability Scope <HelpCircle size={14} color="var(--color-text-tertiary)" /> <span className="required">*</span>
              </label>
              <div className="radio-group-container">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="applicability"
                    value="global"
                    checked={applicabilityScope === 'global'}
                    onChange={handleScopeChange}
                  />
                  <span className="radio-label">Global / Deposit-Type Level</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="applicability"
                    value="specific"
                    checked={applicabilityScope === 'specific'}
                    onChange={handleScopeChange}
                  />
                  <span className="radio-label">Specific Account Level</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Interest Configuration */}
        <div className="config-section">
          <div className="config-section-header">
            <div className="config-section-icon">
              <Calculator size={18} />
            </div>
            <h2>2. Interest Configuration</h2>
          </div>
          <div className="config-section-body">
            <div className="grid-2-col form-row">
              <div className="form-group">
                <label className="form-label">
                  Applicable Deposit Type(s) <span className="required">*</span>
                </label>
                <div className="checkbox-group-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', maxHeight: '120px', overflowY: 'auto' }}>
                  {['Civil Court Deposit (CCD)', 'Criminal Court Deposit(CrCD)', 'PD with fund source Other than Consolidated Fund '].map(type => (
                    <label key={type} className="checkbox-option" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" name="depositTypes" value={type} style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }} />
                      <span className="checkbox-label" style={{ fontSize: 'var(--font-size-sm)' }}>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Rate of Interest (%) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g., 6.5"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="grid-3-col form-row">
              <div className="form-group">
                <label className="form-label">
                  Compounding Frequency <span className="required">*</span>
                </label>
                <select className="form-input" required>
                  <option value="">Select Frequency</option>
                  <option value="yearly">Yearly</option>
                  <option value="half-yearly">Half-Yearly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="biennial">Once in 2 Years</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Effective From Date <span className="required">*</span>
                </label>
                <input type="date" className="form-input" required />
              </div>

              <div className="form-group">
                <label className="form-label">Effective To Date</label>
                <input type="date" className="form-input" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Account-Specific Configuration (Conditional) */}
        {applicabilityScope === 'specific' && (
          <div className="config-section account-specific-section">
            <div className="config-section-header">
              <div className="config-section-icon">
                <Search size={18} />
              </div>
              <h2>3. Account-Specific Overrides</h2>
            </div>
            <div className="config-section-body">
              <div className="form-row grid-2-col">
                <div className="form-group">
                  <label className="form-label">
                    Search & Select Account(s) <span className="required">*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', top: '10px', left: '10px', color: 'var(--color-text-tertiary)' }} />
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '34px' }}
                      placeholder="Enter PD or Deposit Account Number and press Enter"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleAddAccount}
                    />
                  </div>

                  {/* Selected Accounts Badges */}
                  {selectedAccounts.length > 0 && (
                    <div className="account-badge-list">
                      {selectedAccounts.map(acc => (
                        <span key={acc} className="account-badge animate-scale-in">
                          {acc}
                          <span className="badge-remove" onClick={() => handleRemoveAccount(acc)}>
                            <X size={14} />
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                  {selectedAccounts.length === 0 && (
                    <span className="form-helper" style={{ color: 'var(--color-warning)' }}>
                      Please select at least one account for specific scope.
                    </span>
                  )}
                </div>
              </div>

              <div className="form-row grid-2-col" style={{ marginTop: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Override Interest Rate (%)</label>
                  <input type="number" className="form-input" placeholder="Optional override" step="0.01" min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Override Compounding Frequency</label>
                  <select className="form-input">
                    <option value="">Same as Master</option>
                    <option value="yearly">Yearly</option>
                    <option value="half-yearly">Half-Yearly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="biennial">Once in 2 Years</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Legislative Reference & Documentation */}
        <div className="config-section">
          <div className="config-section-header">
            <div className="config-section-icon">
              <FileText size={18} />
            </div>
            <h2>{applicabilityScope === 'specific' ? '4' : '3'}. Legislative Reference & Documentation</h2>
          </div>
          <div className="config-section-body">
            <div className="grid-3-col form-row">
              <div className="form-group">
                <label className="form-label">
                  Act Name <span className="required">*</span>
                </label>
                <input type="text" className="form-input" placeholder="e.g., MP Treasury Code 2020" required />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Rule / Section / GO Number <span className="required">*</span>
                </label>
                <input type="text" className="form-input" placeholder="Enter reference number" required />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Issue Date <span className="required">*</span>
                </label>
                <input type="date" className="form-input" required />
              </div>
            </div>

            <div className="form-row" style={{ marginTop: 'var(--space-6)' }}>
              <label className="form-label">
                Sanction Order Document <span className="required">*</span>
              </label>
              <div className="file-upload-box">
                <Upload className="file-upload-icon" size={32} style={{ margin: '0 auto' }} />
                <div className="file-upload-text">
                  <span>Click to upload</span> or drag and drop
                </div>
                <div className="form-helper" style={{ marginTop: 'var(--space-1)' }}>
                  PDF format only. Maximum file size: 5MB
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="action-bar">
          <button type="button" className="btn btn-secondary">
            <Save size={16} /> Save as Draft
          </button>
          <button type="submit" className="btn btn-primary">
            <CheckCircle size={16} /> Submit for Approval
          </button>
        </div>
      </form>
    </div>
  );
}
