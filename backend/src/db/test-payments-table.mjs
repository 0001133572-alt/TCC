import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zkwixygfwfpzabvscfig.supabase.co',
  'sb_publishable_Bc9zatcLVl16e67SRiIi7w_AM3v9DoE'
);

async function run() {
  // Test insert
  console.log('Testando insercao na tabela payments...');
  const { data, error } = await supabase
    .from('payments')
    .insert({
      order_id: 9999,
      transaction_id: 'test-tx-' + Date.now(),
      txid: 'test-txid',
      external_id: 'test-external',
      amount: 0.01,
      fee: 0.00,
      fee_percent: 0,
      net_amount: 0.01,
      method: 'pix',
      status: 'pending',
    })
    .select();

  if (error) {
    console.log('Erro ao inserir:', error.message);
    console.log('Detalhes:', error.details);
    console.log('Hint:', error.hint);
  } else {
    console.log('Insercao OK!', data);

    // Clean up test data
    if (data && data[0]) {
      await supabase.from('payments').delete().eq('id', data[0].id);
      console.log('Dados de teste removidos.');
    }
  }

  // Test select
  console.log('');
  console.log('Testando select...');
  const { data: selectData, error: selectError } = await supabase
    .from('payments')
    .select('*')
    .limit(5);

  if (selectError) {
    console.log('Erro ao selecionar:', selectError.message);
  } else {
    console.log('Select OK! Registros:', selectData.length);
  }
}

run();
