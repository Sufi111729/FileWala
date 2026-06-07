import initQpdf from 'qpdf-wasm';
import qpdfWasmUrl from 'qpdf-wasm/qpdf.wasm?url';

self.onmessage = async ({ data }) => {
  const { operation, bytes, password } = data;
  const errors = [];
  try {
    const qpdf = await initQpdf({
      // qpdf uses the same bundled worker URL for its internal pthread workers.
      locateFile: (path) => (path.endsWith('.wasm') ? qpdfWasmUrl : self.location.href),
      printErr: (message) => errors.push(String(message)),
    });
    qpdf.FS.writeFile('/input.pdf', new Uint8Array(bytes));
    const args = operation === 'protect'
      ? ['--encrypt', password, `${password}-owner`, '256', '--', '/input.pdf', '/output.pdf']
      : [`--password=${password}`, '--decrypt', '/input.pdf', '/output.pdf'];
    qpdf.callMain(args);
    const output = qpdf.FS.readFile('/output.pdf');
    self.postMessage({ ok: true, bytes: output.buffer }, [output.buffer]);
  } catch (error) {
    self.postMessage({ ok: false, message: errors.join('\n') || error?.message || String(error) });
  }
};
