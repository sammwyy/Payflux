import Integration from '../integration';
import MercadoPago from 'mercadopago';
import IMercadopagoSettings from './mercadopago-settings';
import IPayment from '../payment';
import IPaymentResult from '../payment-result';
import { PreferenceGetResponse } from 'mercadopago/resources/preferences';
import { PaymentGetResponse } from 'mercadopago/resources/payment';
import IItem from '../item';

export interface IMPResponse {
  preferenceId: string;
  paymentId: number;
}

export default class MercadoPagoIntegration extends Integration {
  private readonly settings: IMercadopagoSettings;

  constructor(settings: IMercadopagoSettings) {
    super();
    this.settings = settings;
    MercadoPago.configure({
      access_token: settings.accessToken,
    });
  }

  jsonToPayment(preference: PreferenceGetResponse, payment: PaymentGetResponse) {
    const items = [] as IItem[];

    for (const item of preference.body.items) {
      items.push({
        currency: item.currency_id,
        name: item.title,
        price: item.unit_price,
        quantity: item.quantity,
        sku: item.id,
      });
    }

    return {
      id: preference.body.id,
      description: '',
      intent: 'sale',
      items,
      method: 'mercadopago',
      status: payment.body.status,
    };
  }

  paymentToJson(payment: IPayment) {
    const items = [];

    for (const item of payment.items) {
      items.push({
        id: item.sku,
        title: item.name,
        unit_price: parseInt(item.price, 10),
        quantity: item.quantity,
      });
    }

    return {
      back_urls: {
        success: payment.return_url,
        pending: payment.return_url,
        failure: payment.cancel_url,
      },
      items,
    };
  }

  async createPayment(payment: IPayment): Promise<IPaymentResult> {
    const preference = this.paymentToJson(payment);
    const paymentRequest = await MercadoPago.preferences.create(preference);
    return {
      description: '',
      intent: payment.intent,
      items: payment.items,
      method: payment.method,
      status: 'pending',
      id: paymentRequest.body.id,
      url: this.settings.mode === 'sandbox' ? paymentRequest.body.sandbox_init_point : paymentRequest.body.init_point,
    };
  }

  public requiredFields(): string[] {
    return ['preferenceId', 'paymentId'];
  }

  async executePayment(response: IMPResponse): Promise<IPaymentResult> {
    const preference = await MercadoPago.preferences.get(response.preferenceId);
    const payment = await MercadoPago.payment.get(response.paymentId);
    return this.jsonToPayment(preference, payment);
  }
}
