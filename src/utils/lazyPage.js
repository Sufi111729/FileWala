import { lazy } from 'react';

const reloadKey = 'filewala-lazy-reload';

function getReloadFlag() {
  try {
    return sessionStorage.getItem(reloadKey);
  } catch {
    return null;
  }
}

function setReloadFlag() {
  try {
    sessionStorage.setItem(reloadKey, 'true');
  } catch {
    // Storage can be unavailable in private/restricted browser contexts.
  }
}

function clearReloadFlag() {
  try {
    sessionStorage.removeItem(reloadKey);
  } catch {
    // Storage can be unavailable in private/restricted browser contexts.
  }
}

function isChunkLoadError(error) {
  const message = String(error?.message ?? error ?? '');
  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed') ||
    message.includes('Loading chunk') ||
    message.includes('ChunkLoadError')
  );
}

export function lazyPage(importer) {
  return lazy(async () => {
    try {
      const module = await importer();
      clearReloadFlag();
      return module;
    } catch (error) {
      if (typeof window !== 'undefined' && isChunkLoadError(error) && getReloadFlag() !== 'true') {
        setReloadFlag();
        window.location.reload();
        return new Promise(() => {});
      }

      throw error;
    }
  });
}
