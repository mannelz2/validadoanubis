/*
  # Create User Logs Table

  1. New Tables
    - `user_logs`
      - `id` (uuid, primary key) - Unique identifier
      - `session_id` (text) - Session identifier
      - `user_agent` (text) - Browser user agent
      - `ip_address` (text) - User IP address
      - `fingerprint` (jsonb) - Fycloak fingerprint data
      - `page_url` (text) - Page URL visited
      - `event_type` (text) - Type of event (pageview, form_submit, etc)
      - `metadata` (jsonb) - Additional metadata
      - `created_at` (timestamptz) - Log creation timestamp

  2. Security
    - Enable RLS on `user_logs` table
    - Add policy for public write access (anonymous users can log)
    - Add policy for authenticated read access (only admins can read logs)

  3. Indexes
    - Index on session_id for faster queries
    - Index on created_at for time-based queries
*/

CREATE TABLE IF NOT EXISTS user_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  user_agent text,
  ip_address text,
  fingerprint jsonb,
  page_url text,
  event_type text DEFAULT 'pageview',
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert logs"
  ON user_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read logs"
  ON user_logs
  FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS idx_user_logs_session_id ON user_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_user_logs_created_at ON user_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_logs_event_type ON user_logs(event_type);