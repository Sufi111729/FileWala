function runSecurityWorker(operation, file, password) {
  return new Promise(async (resolve, reject) => {
    const worker = new Worker(new URL('../workers/qpdf.worker.js', import.meta.url), { type: 'module' });
    const timeout = window.setTimeout(() => {
      worker.terminate();
      reject(new Error('PDF security engine failed to load. Please refresh and try again.'));
    }, 90000);
    worker.onmessage = ({ data }) => {
      window.clearTimeout(timeout);
      worker.terminate();
      if (data.ok) resolve(new Blob([data.bytes], { type: 'application/pdf' }));
      else if (operation === 'unlock' && /password|encrypted|invalid/i.test(data.message)) {
        reject(new Error('Wrong password. Please enter the correct PDF password.'));
      } else reject(new Error('PDF security engine failed to load. Please refresh and try again.'));
    };
    worker.onerror = () => {
      window.clearTimeout(timeout);
      worker.terminate();
      reject(new Error('PDF security engine failed to load. Please refresh and try again.'));
    };
    const bytes = await file.arrayBuffer();
    worker.postMessage({ operation, bytes, password }, [bytes]);
  });
}

export const protectPdf = (file, password) => runSecurityWorker('protect', file, password);
export const unlockPdf = (file, password) => runSecurityWorker('unlock', file, password);
