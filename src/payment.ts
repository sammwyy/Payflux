import IItem from './item';

export default interface IPayment {
  method: string;
  intent: string;
  description: string;
  items: IItem[];
  return_url: string;
  cancel_url: string;
}
