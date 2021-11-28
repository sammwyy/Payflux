export default interface IPaypalSettings {
  mode: 'sandbox' | 'live';
  client_id: string;
  client_secret: string;
}
