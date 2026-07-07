import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zkwixygfwfpzabvscfig.supabase.co',
  'sb_publishable_Bc9zatcLVl16e67SRiIi7w_AM3v9DoE'
);

const sql = `
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

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_external_id ON payments(external_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
`;

async function run() {
  console.log('Tentando criar tabela payments via Supabase...');

  // Try rpc first
  const { data, error } = await supabase.rpc('exec_sql', { query: sql });

  if (error) {
    console.log('RPC falhou:', error.message);
    console.log('Tentando via query raw...');

    // Try raw query
    const { data: data2, error: error2 } = await supabase.from('payments').select('*').limit(1);

    if (error2) {
      console.log('Tabela payments ainda nao existe:', error2.message);
      console.log('');
      console.log('=> Voce precisa criar a tabela manualmente no Supabase Dashboard:');
      console.log('   1. Va em https://supabase.com/dashboard');
      console.log('   2. Selecione o projeto zkwixygfwfpzabvscfig');
      console.log('   3. Va em SQL Editor');
      console.log('   4. Cole o SQL do arquivo database/payments.sql');
      console.log('   5. Clique em Run');
    } else {
      console.log('Tabela payments ja existe! Dados:', data);
    }
  } else {
    console.log('Sucesso!', data);
  }
}

run();
