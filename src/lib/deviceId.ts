const KEY = 'amees_device_id';

export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      // crypto.randomUUID() requires HTTPS. If missing, we fallback.
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        id = crypto.randomUUID();
      } else {
        id = 'dev-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      }
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    // If localStorage is blocked entirely, generate a temporary one
    return 'temp-' + Math.random().toString(36).substring(2, 15);
  }
}