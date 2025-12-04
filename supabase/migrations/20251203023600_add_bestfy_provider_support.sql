/*
  # Add Bestfy Provider Support

  1. Changes
    - Add 'bestfy' as a valid provider option in pix_provider_settings table
    - Add public_key column to support Bestfy's public key authentication
    - Update check constraint to include bestfy as valid provider
  
  2. Security
    - Maintains existing RLS policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pix_provider_settings' AND column_name = 'public_key'
  ) THEN
    ALTER TABLE pix_provider_settings ADD COLUMN public_key text;
  END IF;
END $$;

ALTER TABLE pix_provider_settings DROP CONSTRAINT IF EXISTS pix_provider_settings_provider_check;

ALTER TABLE pix_provider_settings 
  ADD CONSTRAINT pix_provider_settings_provider_check 
  CHECK (provider IN ('genesys', 'mangofy', 'aureo', 'bestfy'));