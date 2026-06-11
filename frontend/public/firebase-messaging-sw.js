// Firebase messaging service worker
// Place this file at: frontend/public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: self.__WB_FIREBASE_API_KEY__ || 'your_api_key',
  authDomain: self.__WB_FIREBASE_AUTH_DOMAIN__ || 'your_project.firebaseapp.com',
  projectId: self.__WB_FIREBASE_PROJECT_ID__ || 'your_project_id',
  storageBucket: self.__WB_FIREBASE_STORAGE_BUCKET__ || 'your_project.appspot.com',
  messagingSenderId: self.__WB_FIREBASE_MESSAGING_SENDER_ID__ || '123456789',
  appId: self.__WB_FIREBASE_APP_ID__ || '1:123:web:abc',
});

const messaging = firebase.messaging();

// ─── Handle background push notifications ─────────────────────────────────────
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message:', payload);

  const { title, body, image } = payload.notification || {};
  const data = payload.data || {};

  self.registration.showNotification(title || 'AgroAI', {
    body: body || 'You have a new notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    image,
    data,
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    requireInteraction: data.type === 'disease' || data.type === 'reminder',
  });
});

// ─── Handle notification click ────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const data = event.notification.data || {};
  let url = '/';

  if (data.type === 'order') url = `/orders`;
  else if (data.type === 'disease') url = `/disease-scanner`;
  else if (data.type === 'reminder') url = `/home-grower`;
  else if (data.type === 'price') url = `/mandi-prices`;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
