import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ToolPageLayout from '../../components/layouts/ToolPageLayout.jsx';
import { useLanguage } from '../../i18n.jsx';

const initialResume = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  objective: '',
  education: '',
  skills: '',
  experience: '',
  projects: '',
};

const fields = [
  ['fullName', 'Full Name', 'text'],
  ['email', 'Email', 'email'],
  ['phone', 'Phone', 'tel'],
  ['address', 'Address', 'text'],
  ['objective', 'Objective', 'textarea'],
  ['education', 'Education', 'textarea'],
  ['skills', 'Skills', 'textarea'],
  ['experience', 'Experience', 'textarea'],
  ['projects', 'Projects', 'textarea'],
];

export default function ResumeBuilder() {
  const { text } = useLanguage();
  const previewRef = useRef(null);
  const [resume, setResume] = useState(initialResume);
  const [status, setStatus] = useState('');

  useEffect(() => {
    document.title = 'Resume Builder - FileWalaTool';
  }, []);

  const updateField = (name, value) => {
    setResume((current) => ({ ...current, [name]: value }));
  };

  const downloadPdf = async () => {
    if (!previewRef.current) return;
    setStatus(text.resume.preparing);

    const canvas = await html2canvas(previewRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    });
    const imageData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const width = canvas.width * ratio;
    const height = canvas.height * ratio;
    const x = (pageWidth - width) / 2;

    pdf.addImage(imageData, 'PNG', x, 0, width, height);
    pdf.save('resume.pdf');
    setStatus(text.resume.downloaded);
  };

  return (
    <ToolPageLayout title={text.tools['resume-builder'][0]} description={text.tools['resume-builder'][1]}>
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-md border border-black/10 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-black">{text.resume.details}</h2>
          <div className="mt-5 grid gap-4">
            {fields.map(([name, label, type]) => (
              <label key={name} className="grid gap-2 text-sm font-bold text-black/70">
                {text.resume.fields[name] ?? label}
                {type === 'textarea' ? (
                  <textarea
                    value={resume[name]}
                    onChange={(event) => updateField(name, event.target.value)}
                    rows={name === 'objective' ? 3 : 4}
                    className="focus-ring resize-y rounded-md border border-black/10 px-3 py-3 text-sm font-semibold text-black"
                  />
                ) : (
                  <input
                    type={type}
                    value={resume[name]}
                    onChange={(event) => updateField(name, event.target.value)}
                    className="focus-ring rounded-md border border-black/10 px-3 py-3 text-sm font-semibold text-black"
                  />
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-black/10 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-black">{text.resume.livePreview}</h2>
              <p className="mt-1 text-sm font-semibold text-black/55">{text.resume.template}</p>
            </div>
            <button
              type="button"
              onClick={downloadPdf}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800"
            >
              <Download className="h-4 w-4" />
              {text.resume.downloadPdf}
            </button>
          </div>

          <div className="mt-5 overflow-x-auto rounded-md border border-black/10 bg-black/[0.025] p-3 sm:p-5">
            <article ref={previewRef} className="mx-auto min-h-[940px] w-[720px] bg-white px-12 py-10 text-black shadow-sm">
              <header className="border-b-2 border-black pb-5">
                <h3 className="text-3xl font-black tracking-tight">{resume.fullName || text.resume.placeholders.fullName}</h3>
                <p className="mt-2 text-sm font-semibold text-black/60">
                  {[resume.email || text.resume.placeholders.email, resume.phone || text.resume.placeholders.phone, resume.address || text.resume.placeholders.address].filter(Boolean).join(' | ')}
                </p>
              </header>

              <ResumeSection title={text.resume.fields.objective} value={resume.objective || text.resume.placeholders.objective} />
              <ResumeSection title={text.resume.fields.education} value={resume.education || text.resume.placeholders.education} />
              <ResumeSection title={text.resume.fields.skills} value={resume.skills || text.resume.placeholders.skills} />
              <ResumeSection title={text.resume.fields.experience} value={resume.experience || text.resume.placeholders.experience} />
              <ResumeSection title={text.resume.fields.projects} value={resume.projects || text.resume.placeholders.projects} />
            </article>
          </div>
          {status && <p className="mt-3 text-sm font-bold text-green-700">{status}</p>}
        </div>
      </div>
    </ToolPageLayout>
  );
}

function ResumeSection({ title, value }) {
  return (
    <section className="mt-7">
      <h4 className="border-b border-black/10 pb-1 text-sm font-black uppercase tracking-wide text-blue-700">{title}</h4>
      <p className="mt-3 whitespace-pre-line text-sm font-medium leading-6 text-black/70">{value}</p>
    </section>
  );
}
