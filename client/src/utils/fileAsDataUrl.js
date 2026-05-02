const MAX_STORAGE_BYTES = 3 * 1024 * 1024;

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export function estimateDataUrlBytes(dataUrl) {
  if (typeof dataUrl !== "string" || !dataUrl.includes(",")) return 0;
  const base64 = dataUrl.split(",", 2)[1] || "";
  return Math.ceil((base64.length * 3) / 4);
}

export function exceedsSessionStorageBudget(dataUrl) {
  return estimateDataUrlBytes(dataUrl) > MAX_STORAGE_BYTES;
}

export function dataUrlToBlob(dataUrl) {
  const parts = typeof dataUrl === "string" ? dataUrl.split(",", 2) : [];
  const base64 = parts[1];
  const head = parts[0];
  const mimeMatch = /^data:(.*?);/.exec(head);
  const mime = mimeMatch?.[1] || "application/octet-stream";
  const binStr = typeof atob === "function" ? atob(base64) : "";

  const len = binStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binStr.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}
