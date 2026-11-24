-- Forgot/reset password support: a token table (not a single column on users) so a user can have
-- at most one *valid* token but old/expired/used ones stay around for audit history, plus a
-- password_changed_at stamp on users so already-issued refresh tokens can be invalidated the
-- moment a password actually changes (see auth.service.js#refresh).

ALTER TABLE users
  ADD COLUMN password_changed_at DATETIME NULL AFTER password_hash;

UPDATE users SET password_changed_at = created_at WHERE password_changed_at IS NULL;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  -- SHA-256 hex digest of the raw token - the raw token itself is only ever in the emailed link,
  -- never persisted, so a DB read can't be turned into a working reset link.
  token_hash  CHAR(64)     NOT NULL,
  expires_at  DATETIME     NOT NULL,
  used_at     DATETIME     NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prt_token_hash (token_hash),
  CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_prt_user_id ON password_reset_tokens(user_id);
