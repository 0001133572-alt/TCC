import express from 'express';
import { supabase } from '../../config/supabase.js';

const router = express.Router();

const NEXUSPAG_BASE_URL = process.env.NEXUSPAG_BASE_URL || 'https://api.nexuspag.com';

function getNexusPagApiKey() {
  return process.env.NEXUSPAG_API_KEY;
}

// POST /payments/create-pix (added detailed logging)
router.post('/payments/create-pix', async (req, res) => {
  try {
    const { amount, description, external_id, webhook_url, expiration } = req.body;

    const apiKey = getNexusPagApiKey();
    console.log('[PIX] API Key presente:', !!apiKey, '| Primeiros chars:', apiKey ? apiKey.substring(0, 15) : 'N/A');
    console.log('[PIX] Criando cobrança PIX...');

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valor do pagamento é obrigatório e deve ser maior que zero' });
    }

    if (!apiKey) {
      console.error('[PIX] NEXUSPAG_API_KEY não configurada');
      return res.status(500).json({ error: 'Chave da API de pagamento não configurada' });
    }

    const webhookUrl = process.env.NEXUSPAG_WEBHOOK_URL || `${req.protocol}://${req.get('host')}/api/erp/payments/webhook`;
    const payload = {
      amount: parseFloat(amount),
      description: description || 'Pagamento XFlow ERP',
      external_id: external_id || `order-${Date.now()}`,
      webhook_url: webhook_url || '' ,
      expiration: expiration || 1800,
    };

    console.log('[PIX] Payload:', JSON.stringify(payload, null, 2));

    // Use webhook URL from env if set, otherwise fallback to request host
    const webhookUrl = process.env.NEXUSPAG_WEBHOOK_URL || `${req.protocol}://${req.get('host')}/api/erp/payments/webhook`;
    const response = await fetch(`${NEXUSPAG_BASE_URL}/api/pix/create`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    console.log('[PIX] Status NexusPag:', response.status);
    console.log('[PIX] Resposta NexusPag:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('[PIX] Erro da NexusPag:', JSON.stringify(data, null, 2));
      return res.status(response.status).json({
        error: data.message || 'Erro ao criar cobrança PIX',
        details: data,
      });
    }

    if (!data.success || !data.transaction) {
      console.error('[PIX] NexusPag retornou success=false ou sem transaction:', JSON.stringify(data, null, 2));
      return res.status(400).json({
        error: data.message || 'NexusPag não retornou dados da transação',
        details: data,
      });
    }

    const orderIdNum = external_id ? parseInt(String(external_id).replace('order-', ''), 10) : null;

    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        order_id: isNaN(orderIdNum) ? null : orderIdNum,
        transaction_id: data.transaction.id,
        txid: data.transaction.txid,
        external_id: data.transaction.external_id,
        amount: data.transaction.amount,
        fee: data.transaction.fee,
        fee_percent: data.transaction.fee_percent,
        net_amount: data.transaction.net_amount,
        method: 'pix',
        status: 'pending',
        pix_copia_cola: data.transaction.pix_copia_cola,
        qr_code_base64: data.transaction.qr_code_base64,
        expires_at: data.transaction.expires_at,
      });

    if (insertError) {
      console.error('[PIX] Erro ao salvar pagamento no Supabase:', insertError.message);
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('[PIX] Erro ao criar cobrança PIX:', error);
    res.status(500).json({ error: 'Erro interno ao criar cobrança PIX' });
  }
});

// GET /payments/:id
router.get('/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`[PIX] Consultando pagamento: ${id}`);

    const response = await fetch(`${NEXUSPAG_BASE_URL}/api/pix/${id}`, {
      method: 'GET',
      headers: {
        'x-api-key': getNexusPagApiKey(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[PIX] Erro ao consultar PIX:', data);
      return res.status(response.status).json({ error: data.message || 'Erro ao consultar PIX' });
    }

    console.log(`[PIX] Status do pagamento ${id}:`, data.status || 'ok');

    res.json(data);
  } catch (error) {
    console.error('[PIX] Erro ao consultar PIX:', error);
    res.status(500).json({ error: 'Erro interno ao consultar PIX' });
  }
});

// POST /payments/webhook
router.post('/payments/webhook', async (req, res) => {
  try {
    const event = req.headers['x-nexuspag-event'];

    console.log(`[PIX] Webhook recebido - Evento: ${event}`);
    console.log('[PIX] Body:', JSON.stringify(req.body, null, 2));

    if (event === 'payment.confirmed') {
      const { transaction_id, external_id, status, amount, payer_name, paid_at } = req.body;

      console.log(`[PIX] Pagamento confirmado: ${transaction_id} | Order: ${external_id} | Valor: R$ ${amount}`);

      const { error: paymentError } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          payer_name: payer_name || null,
          paid_at: paid_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('transaction_id', transaction_id);

      if (paymentError) {
        console.error('[PIX] Erro ao atualizar pagamento:', paymentError);
      }

      if (external_id) {
        const { error: orderError } = await supabase
          .from('orders')
          .update({
            payment_status: 'pago',
            updated_at: new Date().toISOString(),
          })
          .eq('id', external_id);

        if (orderError) {
          console.error('[PIX] Erro ao atualizar pedido:', orderError);
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('[PIX] Erro ao processar webhook:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

export default router;
