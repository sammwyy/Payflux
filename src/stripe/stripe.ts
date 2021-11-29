import Integration from '../integration';
import IStripeSettings from './stripe-settings';
import Stripe from 'stripe';
import IPayment from '../payment';
import IPaymentResult from '../payment-result';

export interface IStripeResponse {
  paymentId: string;
}

export default class StripeIntegration extends Integration {
  private readonly settings: IStripeSettings;
  private readonly stripe: Stripe;

  constructor(settings: IStripeSettings) {
    super();
    this.settings = settings;
    this.stripe = new Stripe(settings.secret_key, {
      apiVersion: '2020-08-27',
    });
  }

  formatStatus(status: string | null): string {
    if (status === undefined || status === null || status === 'open') {
      return 'pending';
    } else if (status === 'complete') {
      return 'approved';
    } else {
      return 'cancelled';
    }
  }

  async createPayment(payment: IPayment): Promise<IPaymentResult> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: this.settings.methods,
      line_items: payment.items.map((item) => ({
        price_data: {
          currency: item.currency,
          product_data: {
            name: item.name,
            metadata: {
              sku: item.sku || null,
            },
          },
          unit_amount: parseInt(item.price) * 100,
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: payment.return_url + '?paymentId={CHECKOUT_SESSION_ID}',
      cancel_url: payment.cancel_url,
    });

    return {
      description: payment.description,
      intent: payment.intent,
      items: payment.items,
      method: payment.method,
      status: this.formatStatus(session.status),
      id: session.id,
      url: session.url || '',
    };
  }

  requiredFields(): string[] {
    return ['paymentId'];
  }

  async executePayment(response: IStripeResponse): Promise<IPaymentResult> {
    const session = await this.stripe.checkout.sessions.retrieve(response.paymentId, {});
    return {
      description: '',
      intent: 'sale',
      items: (session.line_items?.data || []).map((item) => ({
        currency: item.currency.toUpperCase(),
        sku: item.price?.metadata.sku || '',
        name: item.price?.nickname || '',
        price: (item.price?.unit_amount || '') + '',
        quantity: item.quantity || 0,
      })),
      method: 'stripe',
      status: this.formatStatus(session.status),
      id: session.id,
    };
  }
}
