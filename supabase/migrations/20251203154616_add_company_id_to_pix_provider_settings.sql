/*
  # Add Company ID Column to PIX Provider Settings

  1. Changes
    - Add `company_id` column to pix_provider_settings table
    - This field is required for Babylon provider authentication

  2. Important Notes
    - Babylon uses Authorization Basic with Secret Key and Company ID
    - Other providers don't need this field, so it's nullable
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pix_provider_settings' 
    AND column_name = 'company_id'
  ) THEN
    ALTER TABLE pix_provider_settings 
    ADD COLUMN company_id text;
  END IF;
END $$;
