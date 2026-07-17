export function formatPrice(amount) {
  return `Rs ${Number(amount).toLocaleString('en-PK')}`;
}

export function discountedPrice(price, discount) {
  return Math.round(price * (1 - discount / 100));
}
