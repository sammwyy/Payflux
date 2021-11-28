import IItem from '../item';

export function calculateItemPrice(items: IItem[]) {
  const currency = 'USD';
  let price = 0;

  for (const item of items) {
    if (item.currency === currency) {
      price += parseInt(item.price) * item.quantity;
    }
  }

  return {
    currency,
    price: '' + price,
  };
}
