import Integration from './integration';
import IPaypalSettings from './paypal/paypal-settings';
import PaypalIntegration from './paypal/paypal';
import IPayment from './payment';
import IPaymentResponse from './payment-response';
import IPaymentResult from './payment-result';
import IMercadopagoSettings from './mercadopago/mercadopago-settings';
import MercadoPagoIntegration from './mercadopago/mercadopago';

export interface IPayfluxSettings {
  paypal?: IPaypalSettings;
  mercadopago?: IMercadopagoSettings;
}

export class Payflux {
  private readonly integrations: Map<string, Integration | null>;

  public constructor(settings: IPayfluxSettings) {
    this.integrations = new Map();

    const { paypal, mercadopago } = settings;

    if (paypal != null) {
      this.registerIntegration('paypal', new PaypalIntegration(paypal));
    } else {
      this.registerIntegration('paypal', null);
    }

    if (mercadopago != null) {
      this.registerIntegration('mercadopago', new MercadoPagoIntegration(mercadopago));
    } else {
      this.registerIntegration('mercadopago', null);
    }
  }

  public registerIntegration(name: string, integration: Integration | null) {
    this.integrations.set(name, integration);
  }

  public getIntegration(method: string): Integration {
    if (!this.integrations.has(method)) {
      throw new Error('Integration for payment method named ' + method + " doesn't exist.");
    }

    const integration = this.integrations.get(method);
    if (integration == null) {
      throw new Error(
        'Integration for payment method named ' +
          method +
          ' is missconfigured. Please define integration settings on the library constructor.',
      );
    }

    return integration;
  }

  public createPayment(payment: IPayment): Promise<IPaymentResult> {
    const integration = this.getIntegration(payment.method);
    return integration.createPayment(payment);
  }

  public executePayment(payment: IPaymentResponse): Promise<IPaymentResult> {
    const integration = this.getIntegration(payment.method);
    const requiredFields = integration.requiredFields();
    for (const field of requiredFields) {
      if (payment.query[field] == null) {
        throw new Error('Field ' + field + " isn't present in query at payment response.");
      }
    }
    return integration.executePayment(payment.query);
  }
}
