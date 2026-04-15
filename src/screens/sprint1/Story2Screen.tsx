import { Info } from 'lucide-react';
import CommentLayer from '../../components/feedback/CommentLayer';
import './Screen.css';

export default function Story2Screen() {
  return (
    <CommentLayer screenId="sprint1-story2" moduleName="deposit">
      <div className="screen">
        {/* Screen header */}
        <div className="screen__header">
          <div>
            <h2 className="screen__title">Interest Rate Configuration</h2>
            <p className="screen__subtitle">
              Configure interest rates based on deposit type and tenure
            </p>
          </div>
          <div className="screen__header-badges">
            <span className="badge badge-warning">Pending Review</span>
          </div>
        </div>

        {/* Rate Table */}
        <div className="card">
          <div className="card-header">
            <div className="screen__section-title">
              <Info size={16} />
              <span>Rate Matrix</span>
            </div>
          </div>
          <div className="card-body">
            <div className="table-wrapper">
              <table className="data-table" id="rate-matrix-table">
                <thead>
                  <tr>
                    <th>Deposit Type</th>
                    <th>Min Tenure</th>
                    <th>Max Tenure</th>
                    <th>Interest Rate (%)</th>
                    <th>Effective From</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Fixed Deposit</td>
                    <td>6 months</td>
                    <td>12 months</td>
                    <td>6.50%</td>
                    <td>01-Apr-2026</td>
                    <td><span className="badge badge-success">Active</span></td>
                  </tr>
                  <tr>
                    <td>Fixed Deposit</td>
                    <td>12 months</td>
                    <td>24 months</td>
                    <td>7.00%</td>
                    <td>01-Apr-2026</td>
                    <td><span className="badge badge-success">Active</span></td>
                  </tr>
                  <tr>
                    <td>Recurring Deposit</td>
                    <td>12 months</td>
                    <td>36 months</td>
                    <td>6.75%</td>
                    <td>01-Apr-2026</td>
                    <td><span className="badge badge-success">Active</span></td>
                  </tr>
                  <tr>
                    <td>Savings Deposit</td>
                    <td>—</td>
                    <td>—</td>
                    <td>4.00%</td>
                    <td>01-Jan-2026</td>
                    <td><span className="badge badge-info">Under Review</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="screen__actions">
          <button className="btn btn-secondary" id="action-add-rate">
            + Add New Rate
          </button>
          <button className="btn btn-primary" id="action-submit-rates">
            Submit for Approval
          </button>
        </div>
      </div>
    </CommentLayer>
  );
}
