/**
 * Validates that a URL is an https Firebase Storage download URL for this project bucket.
 */
function isFirebaseStorageDownloadUrl(urlString) {
  if (!urlString || typeof urlString !== "string") {
    return false;
  }

  let url;
  try {
    url = new URL(urlString);
  } catch {
    return false;
  }

  if (url.protocol !== "https:") {
    return false;
  }

  if (url.hostname !== "firebasestorage.googleapis.com") {
    return false;
  }

  const pathMatch = url.pathname.match(/^\/v0\/b\/([^/]+)\/o\//);
  if (!pathMatch) {
    return false;
  }

  const bucketInUrl = decodeURIComponent(pathMatch[1]);
  const expectedBucket =
    process.env.FIREBASE_STORAGE_BUCKET ||
    (process.env.FIREBASE_PROJECT_ID ? `${process.env.FIREBASE_PROJECT_ID}.appspot.com` : null);

  if (!expectedBucket) {
    return true;
  }

  return bucketInUrl === expectedBucket;
}

module.exports = { isFirebaseStorageDownloadUrl };
