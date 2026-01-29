// In-memory store for shareable links (server-side)
// This persists across requests while the server is running

import { ShareableLink } from '@/types';

export type StoredLink = ShareableLink & {
  documents: Array<{
    id: string;
    name: string;
    description?: string;
    status: 'pending' | 'received';
  }>;
};

// Global store that persists in server memory
const globalStore = globalThis as typeof globalThis & {
  shareableLinksStore?: Map<string, StoredLink>;
};

if (!globalStore.shareableLinksStore) {
  globalStore.shareableLinksStore = new Map<string, StoredLink>();
}

export const shareableLinksStore = globalStore.shareableLinksStore;
