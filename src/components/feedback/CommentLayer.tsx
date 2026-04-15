import { useState, useRef, useEffect } from 'react';
import { MessageCirclePlus, X } from 'lucide-react';
import { useComments, type Comment } from '../../hooks/useComments';
import CommentPin from './CommentPin';
import CommentPanel from './CommentPanel';
import './CommentLayer.css';

interface CommentLayerProps {
  screenId: string;
  moduleName?: string;
  children: React.ReactNode;
}

export default function CommentLayer({
  screenId,
  moduleName = 'deposit',
  children,
}: CommentLayerProps) {
  const { comments, addComment, resolveComment, deleteComment } = useComments(screenId);
  const [commentMode, setCommentMode] = useState(false);
  const [draftContext, setDraftContext] = useState<{
    x: number;
    y: number;
    field_label?: string;
    section_name?: string;
    element_id?: string;
  } | null>(null);
  const [draftText, setDraftText] = useState('');
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const layerRef = useRef<HTMLDivElement>(null);

  const handleLayerClick = (e: React.MouseEvent) => {
    if (!commentMode || !layerRef.current) return;

    const rect = layerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const target = e.target as HTMLElement;

    // Extract UI context from the clicked element
    let field_label = undefined;
    let section_name = undefined;
    let element_id = target.id || undefined;

    const fieldElem = target.closest('.ifmis-field, .form-group');
    if (fieldElem) {
      const labelElem = fieldElem.querySelector('.ifmis-field__label, label');
      if (labelElem) field_label = labelElem.textContent?.replace('*', '')?.trim();
    }

    const accordionElem = target.closest('.ifmis-accordion');
    if (accordionElem) {
      const titleElem = accordionElem.querySelector('.ifmis-accordion__title');
      if (titleElem) section_name = titleElem.textContent?.trim();
    }

    setDraftContext({ x, y, field_label, section_name, element_id });
    setDraftText('');
  };

  const handleSubmitComment = async () => {
    if (!draftContext || !draftText.trim()) return;

    await addComment({
      module_name: moduleName,
      screen_id: screenId,
      x_position: draftContext.x,
      y_position: draftContext.y,
      field_label: draftContext.field_label,
      section_name: draftContext.section_name,
      element_id: draftContext.element_id,
      comment_text: draftText.trim(),
      created_by: 'Admin',
    });

    setDraftContext(null);
    setDraftText('');
    setCommentMode(false);
  };

  const handleCancelDraft = () => {
    setDraftContext(null);
    setDraftText('');
  };

  const openComments = comments.filter((c) => c.status === 'open');
  const resolvedComments = comments.filter((c) => c.status === 'resolved');

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger if typing in an input field or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setCommentMode((prev) => !prev);
        // Clear any existing draft to ensure a clean state
        setDraftContext(null);
        setDraftText('');
      }

      if (e.key === 'Escape') {
        setDraftContext(null);
        setDraftText('');
        setCommentMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="comment-layer-wrapper">
      {/* Toolbar */}
      <div className="comment-toolbar">
        <button
          className={`btn ${commentMode ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setCommentMode(!commentMode);
            if (commentMode) handleCancelDraft();
          }}
          id="toggle-comment-mode"
        >
          <MessageCirclePlus size={16} />
          {commentMode ? 'Exit Comment Mode (Esc)' : 'Add Comment (C)'}
        </button>

        <button
          className="btn btn-ghost"
          onClick={() => setPanelOpen(!panelOpen)}
          id="toggle-comment-panel"
        >
          {openComments.length > 0 && (
            <span className="badge badge-primary">{openComments.length}</span>
          )}
          All Comments ({comments.length})
        </button>
      </div>

      {/* Comment mode indicator */}
      {commentMode && (
        <div className="comment-mode-banner animate-fade-in-down">
          <MessageCirclePlus size={14} />
          Click anywhere on the screen to place a comment
          <button className="btn btn-sm btn-ghost" onClick={() => setCommentMode(false)}>
            <X size={14} />
            Cancel
          </button>
        </div>
      )}

      {/* Interactive layer */}
      <div
        ref={layerRef}
        className={`comment-layer ${commentMode ? 'comment-layer--active' : ''}`}
        onClick={handleLayerClick}
      >
        {children}

        {/* Existing comment pins */}
        {comments.map((comment, index) => (
          <CommentPin
            key={comment.id}
            comment={comment}
            index={index + 1}
            onClick={() => {
              setSelectedComment(comment);
              setPanelOpen(true);
            }}
          />
        ))}

        {/* Draft pin */}
        {draftContext && (
          <div
            className="comment-draft animate-scale-in"
            style={{ left: `${draftContext.x}%`, top: `${draftContext.y}%` }}
          >
            <div className="comment-draft__bubble">
              <textarea
                className="comment-draft__input"
                placeholder="Type your comment..."
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                autoFocus
                rows={3}
              />
              <div className="comment-draft__actions">
                <button className="btn btn-sm btn-ghost" onClick={handleCancelDraft}>
                  Cancel
                </button>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={handleSubmitComment}
                  disabled={!draftText.trim()}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Side panel */}
      {panelOpen && (
        <CommentPanel
          comments={comments}
          openCount={openComments.length}
          resolvedCount={resolvedComments.length}
          selectedComment={selectedComment}
          onSelectComment={setSelectedComment}
          onResolve={resolveComment}
          onDelete={deleteComment}
          onClose={() => {
            setPanelOpen(false);
            setSelectedComment(null);
          }}
        />
      )}
    </div>
  );
}
