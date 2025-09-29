console.log('serviceWorker script loaded');

try {
  /* eslint-disable no-undef */
  if ('function' === typeof ((self).importScripts)) {
    (self).importScripts("background.js");
  }
} catch (e) {
  console.error(e);
}