// Service Worker for Event Dashboard
const CACHE_NAME = 'event-dashboard-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/logo192.png',
  '/manifest.json'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Clearing old cache');
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Cache the fetched response
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          });
      })
      .catch(() => {
        // If both cache and network fail, return a fallback
        if (event.request.url.indexOf('/api/') !== -1) {
          return new Response(JSON.stringify({ error: 'Network offline' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', event => {
  console.log('Service Worker: Push received');
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'Event Alert',
        message: event.data.text()
      };
    }
  }
  
  const title = data.title || 'Event Dashboard Alert';
  const options = {
    body: data.message || 'New priority alert',
    icon: '/logo192.png',
    badge: '/badge.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View Alert'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification click received');
  
  const notification = event.notification;
  const action = event.action;
  const url = notification.data.url || '/';
  
  notification.close();
  
  if (action === 'view') {
    // Open the app and focus on the alert
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then(clientList => {
          // Check if there's already a window/tab open
          for (const client of clientList) {
            if (client.url === url && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Otherwise, open a new window/tab
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
}); 