import { MessageCircle, Instagram, Globe } from 'lucide-react';

const ICONS = { whatsapp: MessageCircle, instagram: Instagram, web: Globe };

export default function ChannelIcon({ channel, className = 'size-4' }) {
  const Icon = ICONS[channel] ?? Globe;
  return (
    <span title={channel} aria-label={channel} className="inline-flex text-ink-soft">
      <Icon className={className} aria-hidden="true" />
    </span>
  );
}
