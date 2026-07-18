export function formatPrice(amount) {
  if (amount == null) return '—';
  return `Rs ${Number(amount).toLocaleString('en-PK')}`;
}

export function discountedPrice(price, discount) {
  return Math.round(price * (1 - discount / 100));
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatShortDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
}

export function relativeTime(value) {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  return formatShortDate(value);
}
