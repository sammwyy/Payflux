import IPayment from './payment';
import IPaymentResult from './payment-result';

export default class Integration {
  async createPayment(payment: IPayment): Promise<IPaymentResult> {
    return {
      description: '',
      intent: '',
      items: [],
      method: '',
      status: 'pending',
    };
  }

  requiredFields(): string[] {
    return [];
  }

  async executePayment(response: any): Promise<IPaymentResult> {
    return {
      description: '',
      intent: '',
      items: [],
      method: '',
      status: 'pending',
    };
  }
}
