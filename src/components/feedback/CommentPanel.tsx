import { useState } from 'react';
import { X, MessageSquare, CheckCircle2, Trash2, Copy, ClipboardCheck } from 'lucide-react';
import type { Comment } from '../../hooks/useComments';

interface CommentPanelProps {
  comments: Comment[];
  openCount: number;
  resolvedCount: number;
  selectedComment: Comment | null;
  onSelectComment: (comment: Comment | null) => void;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

type FilterTab = 'all' | 'open' | 'resolved';

export default function CommentPanel({
  comments,
  openCount,
  resolvedCount,
  selectedComment,
  onSelectComment,
  onResolve,
  onDelete,
  onClose,
}: CommentPanelProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [copied, setCopied] = useState(false);

  const copyAllComments = async () => {
    if (filteredComments.length === 0) return;

    const screenId = filteredComments[0]?.screen_id || 'unknown-screen';
    const header = `=== Screen Feedback: ${screenId} ===\n`
      + `Total: ${filteredComments.length} comment(s) | Filter: ${activeTab}\n`
      + `Copied on: ${new Date().toLocaleString()}\n`
      + '='.repeat(50) + '\n\n';

    const formatted = filteredComments.map((c, i) => {
      return [
        `${i + 1}. [${c.status.toUpperCase()}] ${c.comment_text}`,
        `   — by ${c.created_by} on ${new Date(c.created_at).toLocaleString()}`,
        c.section_name ? `   Section: ${c.section_name}` : null,
        c.field_label ? `   Field: ${c.field_label}` : null,
        c.element_id ? `   Element ID: #${c.element_id}` : null,
        `   Position: (${c.x_position.toFixed(1)}%, ${c.y_position.toFixed(1)}%)`,
        '',
      ].filter(Boolean).join('\n');
    }).join('\n');

    const text = header + formatted;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredComments = comments.filter((c) => {
    if (activeTab === 'open') return c.status === 'open';
    if (activeTab === 'resolved') return c.status === 'resolved';
    return true;
  });

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  };

  return (
    <>
      <div className="comment-panel-overlay" onClick={onClose} />
      <div className="comment-panel">
        <div className="comment-panel__header">
          <h2 className="comment-panel__title">Comments</h2>
          <button className="comment-panel__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="comment-panel__tabs">
          <button
            className={`comment-panel__tab ${activeTab === 'all' ? 'comment-panel__tab--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All ({comments.length})
          </button>
          <button
            className={`comment-panel__tab ${activeTab === 'open' ? 'comment-panel__tab--active' : ''}`}
            onClick={() => setActiveTab('open')}
          >
            Open ({openCount})
          </button>
          <button
            className={`comment-panel__tab ${activeTab === 'resolved' ? 'comment-panel__tab--active' : ''}`}
            onClick={() => setActiveTab('resolved')}
          >
            Resolved ({resolvedCount})
          </button>

          {/* Copy All Button */}
          {filteredComments.length > 0 && (
            <button
              className={`comment-panel__copy-btn ${copied ? 'comment-panel__copy-btn--copied' : ''}`}
              onClick={copyAllComments}
              title="Copy all comments to clipboard"
            >
              {copied ? (
                <><ClipboardCheck size={14} /> Copied!</>
              ) : (
                <><Copy size={14} /> Copy All</>
              )}
            </button>
          )}
        </div>

        {/* Body */}
        <div className="comment-panel__body">
          {filteredComments.length === 0 ? (
            <div className="comment-panel__empty">
              <div className="comment-panel__empty-icon">
                <MessageSquare size={22} />
              </div>
              <p>No comments yet</p>
              <p style={{ fontSize: 'var(--font-size-xs)' }}>
                Click "Add Comment" and click on the screen to leave feedback
              </p>
            </div>
          ) : (
            filteredComments.map((comment) => (
              <div
                key={comment.id}
                className={`comment-card ${
                  selectedComment?.id === comment.id ? 'comment-card--selected' : ''
                }`}
                onClick={() => onSelectComment(comment)}
              >
                <div className="comment-card__header">
                  <div className="comment-card__author">
                    <div className="comment-card__author-avatar">
                      {comment.created_by.charAt(0).toUpperCase()}
                    </div>
                    <span className="comment-card__author-name">{comment.created_by}</span>
                    <span className={`badge badge-${comment.status === 'open' ? 'primary' : 'success'}`}>
                      {comment.status}
                    </span>
                  </div>
                  <span className="comment-card__time">{formatTime(comment.created_at)}</span>
                </div>

                <p className="comment-card__text">{comment.comment_text}</p>

                <div className="comment-card__actions">
                  {comment.status === 'open' && (
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onResolve(comment.id);
                      }}
                    >
                      <CheckCircle2 size={14} />
                      Resolve
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-ghost"
                    style={{ color: 'var(--color-error)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(comment.id);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
