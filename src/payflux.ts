import Integration from './integration';
import IPaypalSettings from './paypal/paypal-settings';
import PaypalIntegration from './paypal/paypal';
import IPayment from './payment';
import IPaymentResponse from './payment-response';
import IPaymentResult from './payment-result';

export interface IPayfluxSettings {
  paypal?: IPaypalSettings;
}

export class Payflux {
  private readonly integrations: Map<string, Integration>;
  private readonly settings: IPayfluxSettings;

  public constructor(settings: IPayfluxSettings) {
    this.integrations = new Map();
    this.settings = settings;

    const { paypal } = settings;

    if (paypal != null) {
      this.registerIntegration('paypal', new PaypalIntegration(paypal));
    }
  }

  public registerIntegration(name: string, integration: Integration) {
    this.integrations.set(name, integration);
  }

  public getIntegration(method: string): Integration {
    const integration = this.integrations.get(method);
    if (integration == null) {
      throw new Error('Integration for payment method named ' + method + " doesn't exist.");
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
