-- Deposit-UI Comments Table
-- Per SRS §7.4

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name VARCHAR(100) NOT NULL,
  screen_id VARCHAR(100) NOT NULL,
  field_id VARCHAR(100),
  field_label VARCHAR(255),
  section_name VARCHAR(255),
  element_id VARCHAR(100),
  x_position FLOAT NOT NULL,
  y_position FLOAT NOT NULL,
  comment_text TEXT NOT NULL,
  created_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE
);

-- Index for fast screen-level queries
CREATE INDEX idx_comments_screen ON comments(screen_id);
CREATE INDEX idx_comments_status ON comments(screen_id, status);
