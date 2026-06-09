import { lazy } from 'react';

const reloadKey = 'filewala-lazy-reload';
const defaultRetries = 3;
const defaultDelay = 1000;

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

export function retryImport(importer, retries = defaultRetries, delay = defaultDelay) {
  return importer().catch((error) => {
    if (retries <= 0 || !isChunkLoadError(error)) throw error;

    return new Promise((resolve) => {
      globalThis.setTimeout(resolve, delay);
    }).then(() => retryImport(importer, retries - 1, delay * 1.5));
  });
}

export function lazyWithRetry(importer) {
  return lazy(async () => {
    try {
      const module = await retryImport(importer);
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

export const lazyPage = lazyWithRetry;
