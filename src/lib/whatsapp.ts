import {
  WHATSAPP_GROUP_URL,
  WHATSAPP_DIRECT_NUMBER,
  WHATSAPP_DEFAULT_MESSAGE,
} from '../config';

/**
 * Returns the best WhatsApp link for the site.
 * Group invite if configured, otherwise a direct chat, otherwise null.
 */
export function whatsappHref(message?: string): string | null {
  if (WHATSAPP_GROUP_URL && !WHATSAPP_GROUP_URL.includes('REPLACE_WITH')) {
    return WHATSAPP_GROUP_URL;
  }
  if (WHATSAPP_DIRECT_NUMBER) {
    const text = encodeURIComponent(message ?? WHATSAPP_DEFAULT_MESSAGE);
    return `https://wa.me/${WHATSAPP_DIRECT_NUMBER}?text=${text}`;
  }
  return null;
}