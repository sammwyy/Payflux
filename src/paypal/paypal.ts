import IPayment from '../payment';
import Paypal, { payment, PaymentResponse } from 'paypal-rest-sdk';
import { calculateItemPrice } from '../utils/payment.utils';
import IPaypalSettings from './paypal-settings';
import Integration from '../integration';
import IPaymentResult from '../payment-result';

export interface IPaypalResponse {
  payerId: string;
  paymentId: string;
}

export default class PaypalIntegration extends Integration {
  constructor(settings: IPaypalSettings) {
    super();
    Paypal.configure(settings);
  }

  jsonToPayment(json: PaymentResponse): IPaymentResult {
    return {
      description: json.transactions[0].description || '',
      method: 'paypal',
      intent: json.intent,
      items: json.transactions[0].item_list?.items || [],
      status: json.state || 'pending',
      id: json.id,
    };
  }

  paymentToJSON(payment: IPayment) {
    const itemPrice = calculateItemPrice(payment.items);
    return {
      intent: payment.intent,
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url: payment.return_url,
        cancel_url: payment.cancel_url,
      },
      transactions: [
        {
          item_list: {
            items: payment.items,
          },
          amount: {
            currency: itemPrice.currency,
            total: itemPrice.price,
          },
          description: payment.description,
        },
      ],
    };
  }

  async createPayment(payment: IPayment): Promise<IPaymentResult> {
    const paymentData = this.paymentToJSON(payment);
    return new Promise((resolve, reject) => {
      Paypal.payment.create(paymentData, (err, paypalPayment: PaymentResponse) => {
        if (err) {
          return reject(err);
        }

        const { links = [] } = paypalPayment;

        for (let i = 0; i < links.length; i++) {
          if (links[i].rel === 'approval_url') {
            const redirect = links[i].href;
            resolve({
              description: payment.description,
              id: paypalPayment.id,
              intent: payment.intent,
              items: payment.items,
              method: payment.method,
              status: 'pending',
              url: redirect,
            });
          }
        }
      });
    });
  }

  public requiredFields(): string[] {
    return ['payerId', 'paymentId'];
  }

  async executePayment(response: IPaypalResponse): Promise<IPaymentResult> {
    return new Promise((resolve, reject) => {
      const executeJson = { payer_id: response.payerId };
      Paypal.payment.execute(response.paymentId, executeJson, (err, payment) => {
        if (err) {
          return reject(err);
        }

        if (payment.state == 'approved') {
          resolve(this.jsonToPayment(payment));
        } else {
          return reject(new Error('Payment is in state ' + payment.state));
        }
      });
    });
  }
}
