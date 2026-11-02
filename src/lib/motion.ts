/**
 * True when animation is allowed for this element.
 * Reads the nearest [data-motion="reduce"] ancestor (works on the Deract canvas root and on <html>),
 * then the element's own window's prefers-reduced-motion. Never touches the global window.
 */
export function motionAllowed(el: Element): boolean {
  if (el.closest('[data-motion="reduce"]')) return false;
  const mq = el.ownerDocument.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)');
  return !mq?.matches;
}