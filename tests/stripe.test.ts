import { Payflux } from '../';

jest.setTimeout(20000);

const payflux = new Payflux({
  stripe: {
    secret_key: process.env['STRIPE_SECRET_KEY'] || '',
    public_key: process.env['STRIPE_PUBLIC_KEY'] || '',
    methods: ['card'],
  },
});

test('Create payment', async () => {
  const payment = await payflux.createPayment({
    method: 'stripe',
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
    method: 'stripe',
    query: {
      paymentId: process.env['STRIPE_PAYMENT_ID'] || '',
    },
  });

  expect(confirm.status).toBe('approved');
});
