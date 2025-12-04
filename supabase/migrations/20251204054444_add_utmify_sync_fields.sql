/*
  # Add UTMify Sync Control Fields to Transactions Table

  1. Changes
    - Add sync control fields to `transactions` table:
      - `utmify_sent` (boolean) - Whether transaction was sent to UTMify
      - `utmify_sent_at` (timestamptz) - When transaction was sent to UTMify
      - `utmify_response` (jsonb) - Response received from UTMify API
      - `utmify_error` (text) - Error message if sending failed

  2. Purpose
    - Enable tracking of which transactions were sent to UTMify
    - Prevent duplicate sends
    - Allow retry of failed sends
    - Store API responses for debugging

  3. Indexes
    - Create index on `utmify_sent` for efficient querying
*/

-- Add UTMify sync control columns to transactions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'utmify_sent'
  ) THEN
    ALTER TABLE transactions ADD COLUMN utmify_sent boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'utmify_sent_at'
  ) THEN
    ALTER TABLE transactions ADD COLUMN utmify_sent_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'utmify_response'
  ) THEN
    ALTER TABLE transactions ADD COLUMN utmify_response jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'utmify_error'
  ) THEN
    ALTER TABLE transactions ADD COLUMN utmify_error text;
  END IF;
END $$;

-- Create index for efficient querying of unsent transactions
CREATE INDEX IF NOT EXISTS idx_transactions_utmify_sent ON transactions(utmify_sent) WHERE utmify_sent = false;

-- Create index for querying sent transactions by date
CREATE INDEX IF NOT EXISTS idx_transactions_utmify_sent_at ON transactions(utmify_sent_at);