const CACHE_NAME = 'bcp-planner-v1'
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  // Add critical CSS and JS files
  '/_next/static/css/',
  '/_next/static/js/',
  // Add common API endpoints for offline access
  '/api/export-pdf'
]

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache')
        return cache.addAll(urlsToCache)
      })
      .catch(err => {
        console.error('Failed to cache resources:', err)
      })
  )
})

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // Handle API requests differently
  if (event.request.url.includes('/api/')) {
    event.respondWith(handleApiRequest(event.request))
    return
  }

  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response
        }
        return fetch(event.request)
          .then(response => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone the response
            const responseToCache = response.clone()

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache)
              })

            return response
          })
      })
      .catch(() => {
        // Return offline page for HTML requests
        if (event.request.destination === 'document') {
          return caches.match('/offline.html')
        }
      })
  )
})

// Handle API requests with offline fallback
async function handleApiRequest(request) {
  try {
    // Try network first for API requests
    const response = await fetch(request)
    
    // If successful, cache the response for certain endpoints
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    // If network fails, try cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response for API requests
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This feature requires an internet connection' 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Handle background sync for form data
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync-form') {
    event.waitUntil(syncFormData())
  }
})

// Sync form data when connection is restored
async function syncFormData() {
  try {
    // Get pending form data from IndexedDB or localStorage
    const pendingData = await getPendingFormData()
    
    if (pendingData && pendingData.length > 0) {
      for (const data of pendingData) {
        try {
          await fetch('/api/save-form', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          
          // Remove from pending after successful sync
          await removePendingFormData(data.id)
        } catch (error) {
          console.error('Failed to sync form data:', error)
        }
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Mock functions for form data management
// In a real implementation, these would use IndexedDB
async function getPendingFormData() {
  // Return pending form submissions
  return []
}

async function removePendingFormData(id) {
  // Remove synced data
  console.log('Removing synced data:', id)
}

// Handle push notifications (if needed in future)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      }
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close()
  
  event.waitUntil(
    clients.openWindow('/')
  )
}) 