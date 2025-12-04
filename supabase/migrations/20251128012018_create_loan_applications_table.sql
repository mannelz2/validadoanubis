/*
  # Create Loan Applications Table

  1. New Tables
    - `loan_applications`
      - `id` (uuid, primary key) - Unique identifier
      - `cpf` (text) - User CPF
      - `created_at` (timestamptz) - Timestamp of application
      - `updated_at` (timestamptz) - Last update timestamp
      - `monthly_income` (text) - Selected monthly income range
      - `payment_day` (text) - Day of month user receives payment
      - `occupation` (text) - User occupation type
      - `education` (text) - Education level
      - `loan_priority` (text) - What's most important in a loan
      - `is_nubank_customer` (text) - Whether user is existing customer
      - `credit_status` (text) - Whether user has credit restrictions
      - `loan_amount` (decimal) - Approved loan amount
      - `selected_installments` (integer) - Number of installments chosen
      - `installment_value` (decimal) - Value of each installment
      - `selected_due_date` (integer) - Selected due date (day of month)
      - `protocol` (text) - Transaction protocol number
      - `status` (text) - Application status (pending, approved, completed)

  2. Security
    - Enable RLS on `loan_applications` table
    - Add policy for anyone to insert applications (public form)
    - Add policy for service role to read all applications
    - This allows tracking of user journey without requiring authentication

  3. Indexes
    - Index on cpf for fast lookups
    - Index on created_at for time-based queries
    - Index on status for filtering
*/

CREATE TABLE IF NOT EXISTS loan_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cpf text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  monthly_income text,
  payment_day text,
  occupation text,
  education text,
  loan_priority text,
  is_nubank_customer text,
  credit_status text,
  loan_amount decimal(10,2),
  selected_installments integer,
  installment_value decimal(10,2),
  selected_due_date integer,
  protocol text,
  status text DEFAULT 'pending'
);

ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert loan applications"
  ON loan_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can read all applications"
  ON loan_applications
  FOR SELECT
  TO service_role
  USING (true);

CREATE INDEX IF NOT EXISTS idx_loan_applications_cpf ON loan_applications(cpf);
CREATE INDEX IF NOT EXISTS idx_loan_applications_created_at ON loan_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(status);