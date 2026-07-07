const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('xflow_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const paymentService = {
  async createPixPayment({ amount, description, external_id, expiration }) {
    const response = await fetch(`${API_URL}/api/erp/payments/create-pix`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        amount,
        description,
        external_id,
        expiration: expiration || 1800,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar cobrança PIX');
    }

    return response.json();
  },

  async getPaymentStatus(id) {
    const response = await fetch(`${API_URL}/api/erp/payments/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao consultar pagamento');
    }

    return response.json();
  },
};
