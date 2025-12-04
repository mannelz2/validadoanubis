/*
  # Cria trigger para detectar mudança de status e reenviar ao UTMify

  1. New Functions
    - `trigger_utmify_resync_on_status_change()` - Detecta quando o status muda e marca para ressincronizar
  
  2. New Triggers
    - `transaction_status_change_trigger` - Executa automaticamente quando o status de uma transação muda
  
  3. Notes
    - Quando uma transação muda de 'pending' para 'approved', o trigger detecta e reseta o campo `utmify_last_status_synced`
    - Isso força a função sync-utmify a reenviar a transação com o novo status
    - Resolve automaticamente o problema de transações aprovadas não atualizando no UTMify
*/

-- Cria função que detecta mudança de status e marca para ressincronização
CREATE OR REPLACE FUNCTION trigger_utmify_resync_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o status mudou e é diferente do último sincronizado
  IF (OLD.status IS DISTINCT FROM NEW.status) AND 
     (NEW.utmify_last_status_synced IS NOT NULL) AND 
     (NEW.utmify_last_status_synced != NEW.status) THEN
    
    -- Marca para ressincronizar (mantém utmify_sent = true, mas atualiza o campo de controle)
    NEW.utmify_last_status_synced := NULL;
    
    -- Log da mudança
    RAISE NOTICE 'Transaction % status changed from % to %, marked for UTMify resync', 
      NEW.id, OLD.status, NEW.status;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remove trigger existente se houver
DROP TRIGGER IF EXISTS transaction_status_change_trigger ON transactions;

-- Cria trigger que executa antes do UPDATE
CREATE TRIGGER transaction_status_change_trigger
  BEFORE UPDATE OF status ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_utmify_resync_on_status_change();