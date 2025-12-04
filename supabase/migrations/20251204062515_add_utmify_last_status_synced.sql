/*
  # Adiciona rastreamento de status sincronizado com UTMify

  1. Changes
    - Adiciona coluna `utmify_last_status_synced` para rastrear qual status foi enviado
    - Isso permite detectar quando o status mudou e precisa reenviar ao UTMify
    
  2. Notes
    - Quando uma transação muda de 'pending' para 'approved', o sistema detecta e reenvia
    - Resolve o problema de transações aprovadas não atualizando no UTMify
*/

-- Adiciona coluna para rastrear último status enviado ao UTMify
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS utmify_last_status_synced text;

-- Atualiza registros existentes que já foram enviados
UPDATE transactions 
SET utmify_last_status_synced = status 
WHERE utmify_sent = true;