if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/erin/sw.js', { scope: '/erin/' }).catch((error) => {
      console.warn('Service worker registration failed:', error);
    });
  });
}
