-- Tabela de pagamentos NexusPag
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id INTEGER,
  transaction_id TEXT,
  txid TEXT,
  external_id TEXT,
  amount DECIMAL(10,2),
  fee DECIMAL(10,2),
  fee_percent DECIMAL(5,2),
  net_amount DECIMAL(10,2),
  method TEXT DEFAULT 'pix',
  status TEXT DEFAULT 'pending',
  pix_copia_cola TEXT,
  qr_code_base64 TEXT,
  payer_name TEXT,
  payer_document TEXT,
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_external_id ON payments(external_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);

-- Habilitar Realtime na tabela payments
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
