import IItem from './item';

export default interface IPaymentResult {
  id?: string | undefined;
  method: string;
  intent: string;
  description: string;
  items: IItem[];
  url?: string | undefined;
  status: string;
}
