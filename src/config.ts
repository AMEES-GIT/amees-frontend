/**
 * Public-facing WhatsApp destination for the site.
 *
 * For a community, a group invite link is better than a personal number:
 * no number exposed, multiple admins, survives exec handover.
 *
 * To update: open the group on WhatsApp → Group info → Invite via link → Copy.
 * If the group rotates its link, change this constant and redeploy.
 */
export const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/REPLACE_WITH_YOUR_INVITE_CODE';

/** Optional fallback: a direct chat with a dedicated AMEES number (E.164, no +). */
export const WHATSAPP_DIRECT_NUMBER = ''; // e.g. '2348012345678'

export const WHATSAPP_DEFAULT_MESSAGE = 'Hi AMEES, I .....';