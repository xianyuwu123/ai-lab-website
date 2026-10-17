// Preserve previously shared links to the microcomputer chapter/lab directory.
const legacyAnchors = new Set(['knowledge', 'catalogue', 'assembly-title', 'gpio-title', 'interrupt-title', 'timer-title', 'io-title']);
function followLegacyAnchor() {
  if (legacyAnchors.has(window.location.hash.slice(1))) {
    window.location.replace(new URL(`microcomputer.html${window.location.hash}`, window.location.href));
  }
}
followLegacyAnchor();
window.addEventListener('hashchange', followLegacyAnchor);
