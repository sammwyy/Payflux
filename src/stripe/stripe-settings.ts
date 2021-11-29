type PaymentMethodType =
  | 'acss_debit'
  | 'afterpay_clearpay'
  | 'alipay'
  | 'bacs_debit'
  | 'bancontact'
  | 'boleto'
  | 'card'
  | 'eps'
  | 'fpx'
  | 'giropay'
  | 'grabpay'
  | 'ideal'
  | 'klarna'
  | 'oxxo'
  | 'p24'
  | 'sepa_debit'
  | 'sofort'
  | 'wechat_pay';

export default interface IStripeSettings {
  public_key: string;
  secret_key: string;
  methods: PaymentMethodType[];
}
