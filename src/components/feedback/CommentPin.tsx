import { useState } from 'react';
import type { Comment } from '../../hooks/useComments';

interface CommentPinProps {
  comment: Comment;
  index: number;
  onClick: () => void;
}

export default function CommentPin({ comment, index, onClick }: CommentPinProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="comment-pin"
      style={{ left: `${comment.x_position}%`, top: `${comment.y_position}%` }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`comment-pin__dot comment-pin__dot--${comment.status}`}>
        {index}
      </div>
      {hovered && (
        <div className="comment-pin__preview">
          <strong>{comment.created_by}</strong>: {comment.comment_text}
        </div>
      )}
    </div>
  );
}
