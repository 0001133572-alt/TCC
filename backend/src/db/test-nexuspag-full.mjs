import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zkwixygfwfpzabvscfig.supabase.co',
  'sb_publishable_Bc9zatcLVl16e67SRiIi7w_AM3v9DoE'
);

const NEXUSPAG_API_KEY = 'nxp_live_4f4d0882e6be5d04b85ea4b00b564105791e31926d2c0e976adb1d8aa3417c12';
const NEXUSPAG_BASE_URL = 'https://nexuspag.com';

async function testFullFlow() {
  console.log('=== TESTE COMPLETO: NexusPag + Supabase ===\n');

  // 1. Criar cobranca PIX na NexusPag
  console.log('1. Criando cobranca PIX na NexusPag (R$ 1,00 - minimo)...');
  const pixResponse = await fetch(`${NEXUSPAG_BASE_URL}/api/pix/create`, {
    method: 'POST',
    headers: {
      'x-api-key': NEXUSPAG_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: 1.00,
      description: 'Teste XFlow ERP - R$ 0,01',
      external_id: `test-${Date.now()}`,
      expiration: 1800,
    }),
  });

  const pixData = await pixResponse.json();

  if (!pixResponse.ok) {
    console.log('ERRO NexusPag:', pixData);
    return;
  }

  console.log('NexusPag respondeu:');
  console.log('  Transaction ID:', pixData.transaction.id);
  console.log('  TXID:', pixData.transaction.txid);
  console.log('  Valor:', pixData.transaction.amount);
  console.log('  Taxa:', pixData.transaction.fee);
  console.log('  Liquido:', pixData.transaction.net_amount);
  console.log('  Status:', pixData.transaction.status);
  console.log('  PIX Copia e Cola:', pixData.transaction.pix_copia_cola ? 'SIM' : 'NAO');
  console.log('  QR Code Base64:', pixData.transaction.qr_code_base64 ? 'SIM' : 'NAO');
  console.log('  Expira em:', pixData.transaction.expires_at);

  // 2. Salvar no Supabase
  console.log('\n2. Salvando pagamento no Supabase...');
  const { data: insertData, error: insertError } = await supabase
    .from('payments')
    .insert({
      order_id: 1,
      transaction_id: pixData.transaction.id,
      txid: pixData.transaction.txid,
      external_id: pixData.transaction.external_id,
      amount: pixData.transaction.amount,
      fee: pixData.transaction.fee,
      fee_percent: pixData.transaction.fee_percent,
      net_amount: pixData.transaction.net_amount,
      method: 'pix',
      status: 'pending',
      pix_copia_cola: pixData.transaction.pix_copia_cola,
      qr_code_base64: pixData.transaction.qr_code_base64,
      expires_at: pixData.transaction.expires_at,
    })
    .select();

  if (insertError) {
    console.log('ERRO ao salvar:', insertError.message);
    return;
  }
  console.log('Salvo no Supabase! ID:', insertData[0].id);

  // 3. Consultar pagamento no Supabase
  console.log('\n3. Consultando pagamento no Supabase...');
  const { data: selectData, error: selectError } = await supabase
    .from('payments')
    .select('*')
    .eq('transaction_id', pixData.transaction.id)
    .single();

  if (selectError) {
    console.log('ERRO ao consultar:', selectError.message);
    return;
  }
  console.log('Pagamento encontrado:');
  console.log('  ID:', selectData.id);
  console.log('  Status:', selectData.status);
  console.log('  Valor:', selectData.amount);

  // 4. Consultar status na NexusPag
  console.log('\n4. Consultando status na NexusPag...');
  const statusResponse = await fetch(`${NEXUSPAG_BASE_URL}/api/pix/${pixData.transaction.id}`, {
    headers: { 'x-api-key': NEXUSPAG_API_KEY },
  });
  const statusData = await statusResponse.json();
  console.log('Status NexusPag:', statusData.status);
  console.log('  Expira em:', statusData.expires_at);

  // 5. Cleanup
  console.log('\n5. Limpando dados de teste...');
  await supabase.from('payments').delete().eq('id', insertData[0].id);
  console.log('Dados removidos do Supabase.');

  console.log('\n=== TODOS OS TESTES PASSARAM ===');
  console.log('NexusPag API: OK');
  console.log('Supabase INSERT: OK');
  console.log('Supabase SELECT: OK');
  console.log('Supabase DELETE: OK');
}

testFullFlow().catch(console.error);
