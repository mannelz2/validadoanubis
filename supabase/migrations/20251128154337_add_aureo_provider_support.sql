/*
  # Add Aureo Provider Support to PIX Provider Settings

  1. Schema Changes
    - Update `pix_provider_settings` table constraint to include 'aureo' as a valid provider
    - Add `public_key` column (text, nullable) - Public key for Aureo authentication
    - Add `secret_key` column (text, nullable) - Secret key for Aureo authentication
    - Update existing provider constraint to allow 'genesys', 'mangofy', and 'aureo'

  2. Changes Made
    - Drop existing CHECK constraint on provider column
    - Add new CHECK constraint that includes 'aureo' as valid provider option
    - Add public_key column for Basic Authentication with Aureo API
    - Add secret_key column for Basic Authentication with Aureo API

  3. Notes
    - Aureo uses Basic Authentication: Base64(publicKey:secretKey)
    - Existing providers (Genesys, Mangofy) will have null values for public_key and secret_key
    - New Aureo provider will use public_key and secret_key instead of api_key for authentication
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pix_provider_settings' AND column_name = 'secret_key'
  ) THEN
    ALTER TABLE pix_provider_settings ADD COLUMN secret_key text;
  END IF;
END $$;

DO $$
BEGIN
  ALTER TABLE pix_provider_settings DROP CONSTRAINT IF EXISTS pix_provider_settings_provider_check;

  ALTER TABLE pix_provider_settings ADD CONSTRAINT pix_provider_settings_provider_check
    CHECK (provider IN ('genesys', 'mangofy', 'aureo'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
