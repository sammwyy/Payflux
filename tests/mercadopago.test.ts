import { Payflux } from '../dist';

jest.setTimeout(20000);

const payflux = new Payflux({
  mercadopago: {
    accessToken: process.env['MERCADOPAGO_ACCESS_TOKEN'] || '',
    mode: 'sandbox',
  },
});

test('Create payment', async () => {
  const payment = await payflux.createPayment({
    method: 'mercadopago',
    cancel_url: 'http://localhost/cancel',
    return_url: 'http://localhost/complete',
    description: 'My first purchase',
    intent: 'sale',
    items: [
      {
        currency: 'USD',
        name: 'My Item',
        price: '300',
        quantity: 5,
        sku: 'my-item-0000',
      },
      {
        currency: 'USD',
        name: 'Another Item',
        price: '100',
        quantity: 3,
        sku: 'another-item-0001',
      },
    ],
  });
  expect(payment.url).not.toBeNull();
});

test('Confirm payment', async () => {
  const confirm = await payflux.executePayment({
    method: 'mercadopago',
    query: {
      preferenceId: process.env['MERCADOPAGO_PREFERENCE_ID'] || '',
      paymentId: process.env['MERCADOPAGO_PAYMENT_ID'] || 0,
    },
  });
  expect(confirm.status).toBe('approved');
});
