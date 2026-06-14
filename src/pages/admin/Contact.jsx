import SeoHelmet from '../../components/seo/SeoHelmet.jsx';
import { absoluteUrl } from '../../data/siteMetadata.js';
import ContactMessagesAdmin from './ContactMessagesAdmin.jsx';

export default function Contact() {
  return (
    <>
      <SeoHelmet
        title="Contact Messages Admin | FileWalaTool"
        description="FileWalaTool contact message administration."
        canonical={absoluteUrl('/admin/contact-messages')}
        robots="noindex,nofollow"
      />
      <ContactMessagesAdmin />
    </>
  );
}
