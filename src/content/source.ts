import type { SiteContent } from './types';
import { seedContent } from './seed';

/** Where content comes from. The admin backend will provide a second implementation. */
export interface ContentSource {
  load(): Promise<SiteContent>;
}

export const seedSource: ContentSource = {
  load: () => Promise.resolve(seedContent),
};

/** Ready for when the API exists. Not used yet. */
export const httpSource = (url: string): ContentSource => ({
  load: async () => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Content request failed: ${res.status}`);
    return (await res.json()) as SiteContent;
  },
});