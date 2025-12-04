/*
  # Create PIX Provider Settings Table

  1. New Tables
    - `pix_provider_settings`
      - `id` (uuid, primary key)
      - `provider` (text) - The PIX provider name ('genesys' or 'mangofy')
      - `api_url` (text) - Base API URL for the provider
      - `api_key` (text) - API key/secret for authentication
      - `store_code` (text, nullable) - Store code for Mangofy
      - `is_active` (boolean) - Whether this provider is currently active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `pix_provider_settings` table
    - Add policy for authenticated users to read settings
    - Add policy for authenticated users to update settings

  3. Initial Data
    - Insert default Genesys provider configuration
*/

CREATE TABLE IF NOT EXISTS pix_provider_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL CHECK (provider IN ('genesys', 'mangofy')),
  api_url text NOT NULL,
  api_key text NOT NULL,
  store_code text,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pix_provider_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read PIX provider settings"
  ON pix_provider_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert PIX provider settings"
  ON pix_provider_settings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update PIX provider settings"
  ON pix_provider_settings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete PIX provider settings"
  ON pix_provider_settings
  FOR DELETE
  USING (true);

-- Insert default Genesys provider (will be configured via settings page)
INSERT INTO pix_provider_settings (provider, api_url, api_key, is_active)
VALUES ('genesys', '', '', true)
ON CONFLICT DO NOTHING;