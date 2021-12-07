import { Payflux } from '../';

jest.setTimeout(20000);

const payflux = new Payflux({
  paypal: {
    client_id: process.env['PAYPAL_CLIENT_ID'] || '',
    client_secret: process.env['PAYPAL_SECRET'] || '',
    mode: 'sandbox',
  },
});

test('Create payment', async () => {
  const payment = await payflux.createPayment({
    method: 'paypal',
    cancel_url: 'http://localhost/cancel',
    return_url: 'http://localhost/complete',
    description: 'My first purchase',
    intent: 'sale',
    items: [
      {
        currency: 'USD',
        name: 'My Item',
        price: '10.00',
        quantity: 5,
        sku: 'my-item-0000',
      },
      {
        currency: 'USD',
        name: 'Another Item',
        price: '3.00',
        quantity: 3,
        sku: 'another-item-0001',
      },
    ],
  });

  expect(payment.url).not.toBeNull();
});

test('Confirm payment', async () => {
  const confirm = await payflux.executePayment({
    method: 'paypal',
    query: {
      paymentId: process.env['PAYPAL_PAYMENT_ID'] || '',
      payerId: process.env['PAYPAL_PAYER_ID'] || '',
    },
  });

  expect(confirm.status).toBe('approved');
});
