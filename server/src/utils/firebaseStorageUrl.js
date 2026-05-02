const MAX_DELIVERY_URL_LENGTH = 4096;

function isGenericHttpsUrl(urlString) {
  if (!urlString || typeof urlString !== "string" || urlString.length > MAX_DELIVERY_URL_LENGTH) {
    return false;
  }

  let url;
  try {
    url = new URL(urlString.trim());
  } catch {
    return false;
  }

  if (url.protocol !== "https:" || !url.hostname) {
    return false;
  }

  return true;
}

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

/**
 * Firebase Storage URLs are required by default. Set ALLOW_NON_FIREBASE_DELIVERY_URLS=true to accept
 * any https URL (demo / staging only — do not enable in production unless you trust submitters).
 */
function isAllowedDeliveryFileUrl(urlString) {
  if (isFirebaseStorageDownloadUrl(urlString)) {
    return true;
  }

  const allowNonFirebase =
    process.env.ALLOW_NON_FIREBASE_DELIVERY_URLS === "true" ||
    process.env.ALLOW_NON_FIREBASE_DELIVERY_URLS === "1";

  if (!allowNonFirebase) {
    return false;
  }

  return isGenericHttpsUrl(urlString);
}

module.exports = { isFirebaseStorageDownloadUrl, isAllowedDeliveryFileUrl };
