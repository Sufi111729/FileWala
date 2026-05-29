import DocumentImageTool from '../../components/tools/DocumentImageTool.jsx';
import { signatureResizeConfig } from './documentToolConfigs.js';

export default function SignatureResize() {
  return <DocumentImageTool config={signatureResizeConfig} />;
}
