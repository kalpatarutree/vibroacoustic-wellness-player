import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { RangeRequestsPlugin } from 'workbox-range-requests';

// Cache proxied R2 audio and image files with range request support
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/proxy'),
  new CacheFirst({
    cacheName: 'r2-media-cache',
    plugins: [
      new RangeRequestsPlugin(),
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  })
);
