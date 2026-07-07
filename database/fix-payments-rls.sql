-- =====================================================
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. Habilitar RLS (já deve estar ativo)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 2. Criar política para permitir INSERT (inserir pagamentos)
CREATE POLICY "allow_insert_payments" ON payments
  FOR INSERT
  WITH CHECK (true);

-- 3. Criar política para permitir SELECT (ler pagamentos)
CREATE POLICY "allow_select_payments" ON payments
  FOR SELECT
  USING (true);

-- 4. Criar política para permitir UPDATE (atualizar pagamentos - webhook)
CREATE POLICY "allow_update_payments" ON payments
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 5. Criar política para permitir DELETE (limpar dados de teste)
CREATE POLICY "allow_delete_payments" ON payments
  FOR DELETE
  USING (true);

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_external_id ON payments(external_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);

-- 7. Habilitar Realtime na tabela payments
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
