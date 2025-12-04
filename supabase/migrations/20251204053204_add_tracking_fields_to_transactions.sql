/*
  # Add Campaign Tracking Fields to Transactions Table

  1. Changes
    - Add tracking fields to `transactions` table:
      - `utm_source` (text) - Campaign source identifier
      - `utm_medium` (text) - Campaign medium (e.g., social, email)
      - `utm_campaign` (text) - Campaign name
      - `utm_content` (text) - Campaign content/variation
      - `utm_term` (text) - Campaign keywords
      - `src` (text) - Source tracking parameter
      - `sck` (text) - Source click parameter
      - `product_id` (text) - Product identifier
      - `user_ip` (text) - User IP address for geolocation
      - `user_agent` (text) - User browser/device information

  2. Purpose
    - Enable comprehensive campaign performance tracking
    - Support attribution and conversion analysis
    - Allow A/B testing and optimization
*/

-- Add tracking columns to transactions table
DO $$
BEGIN
  -- UTM parameters
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'utm_source'
  ) THEN
    ALTER TABLE transactions ADD COLUMN utm_source text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'utm_medium'
  ) THEN
    ALTER TABLE transactions ADD COLUMN utm_medium text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'utm_campaign'
  ) THEN
    ALTER TABLE transactions ADD COLUMN utm_campaign text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'utm_content'
  ) THEN
    ALTER TABLE transactions ADD COLUMN utm_content text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'utm_term'
  ) THEN
    ALTER TABLE transactions ADD COLUMN utm_term text;
  END IF;

  -- Source tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'src'
  ) THEN
    ALTER TABLE transactions ADD COLUMN src text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'sck'
  ) THEN
    ALTER TABLE transactions ADD COLUMN sck text;
  END IF;

  -- Product tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'product_id'
  ) THEN
    ALTER TABLE transactions ADD COLUMN product_id text;
  END IF;

  -- User tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'user_ip'
  ) THEN
    ALTER TABLE transactions ADD COLUMN user_ip text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE transactions ADD COLUMN user_agent text;
  END IF;
END $$;

-- Create indexes for better query performance on tracking fields
CREATE INDEX IF NOT EXISTS idx_transactions_utm_source ON transactions(utm_source);
CREATE INDEX IF NOT EXISTS idx_transactions_utm_campaign ON transactions(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_transactions_src ON transactions(src);
CREATE INDEX IF NOT EXISTS idx_transactions_product_id ON transactions(product_id);