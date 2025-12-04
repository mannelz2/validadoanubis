/*
  # Create Transactions Table for Genesys Finance Integration

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key) - Unique identifier
      - `genesys_transaction_id` (text, unique) - ID from Genesys Finance API
      - `cpf` (text) - User's CPF
      - `amount` (numeric) - Transaction amount in BRL
      - `pix_key` (text) - PIX key for receiving payment
      - `qr_code` (text) - QR Code from Genesys
      - `qr_code_image` (text) - Base64 QR Code image
      - `status` (text) - Transaction status (pending, completed, failed, expired)
      - `expires_at` (timestamptz) - When transaction expires
      - `completed_at` (timestamptz) - When payment was completed
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `transactions` table
    - Add policy for public read access (users need to check their transaction status)
    - Add policy for system to create and update transactions
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  genesys_transaction_id text UNIQUE,
  cpf text NOT NULL,
  amount numeric(10,2) NOT NULL,
  pix_key text NOT NULL,
  qr_code text,
  qr_code_image text,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read transactions"
  ON transactions
  FOR SELECT
  USING (true);

CREATE POLICY "System can insert transactions"
  ON transactions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update transactions"
  ON transactions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_transactions_genesys_id ON transactions(genesys_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_cpf ON transactions(cpf);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);