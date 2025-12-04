/*
  # Add Babylon Provider Support

  1. Changes
    - Update the provider check constraint to include 'babylon'
    - This allows the pix_provider_settings table to accept Babylon as a valid provider

  2. Important Notes
    - Babylon uses Authorization Basic authentication (Secret Key + Company ID)
    - Babylon supports PIX payments with webhook notifications
    - Endpoint base: https://api.bancobabylon.com/functions/v1
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'pix_provider_settings' 
    AND constraint_name LIKE '%provider_check%'
  ) THEN
    ALTER TABLE pix_provider_settings 
    DROP CONSTRAINT IF EXISTS pix_provider_settings_provider_check;
  END IF;
  
  ALTER TABLE pix_provider_settings
  ADD CONSTRAINT pix_provider_settings_provider_check 
  CHECK (provider = ANY (ARRAY['genesys'::text, 'mangofy'::text, 'aureo'::text, 'bestfy'::text, 'babylon'::text]));
END $$;
