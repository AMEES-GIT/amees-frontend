import { whatsappHref } from '../../lib/whatsapp';
import './WhatsAppFab.css';

export function WhatsAppFab() {
  const href = whatsappHref();
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="amees-wa-fab"
      aria-label="Chat with AMEES on WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
        <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.2-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.5-.9-2.1-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.1 0 1.3.9 2.5 1.1 2.6.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.7.1.5-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.2-.3-.2-.5-.3zM12 21.6c-1.7 0-3.3-.4-4.7-1.3L3 21.4l1.2-4.1C3 15.8 2.4 14 2.4 12 2.4 6.7 6.7 2.4 12 2.4s9.6 4.3 9.6 9.6-4.3 9.6-9.6 9.6z"/>
      </svg>
    </a>
  );
}