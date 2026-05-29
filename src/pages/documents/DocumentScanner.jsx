import DocumentImageTool from '../../components/tools/DocumentImageTool.jsx';
import { documentScannerConfig } from './documentToolConfigs.js';

export default function DocumentScanner() {
  return <DocumentImageTool config={documentScannerConfig} />;
}
