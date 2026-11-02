import type { SiteContent } from './types';

export interface ContentSource {
  load(): Promise<SiteContent>;
}

export const httpSource = (url: string): ContentSource => ({
  async load() {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load content');
    return res.json();
  }
});