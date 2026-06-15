import { useLanguage } from '../../i18n.jsx';

export default function RequirementStep({ title = 'Output requirements', fields = [], requirements = [], values, onChange }) {
  const { text, tLiteral } = useLanguage();

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.2fr)]">
      <div className="rounded-md border border-black/10 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-lg font-black text-black">{text.documentTool.requirement}</h2>
        <div className="mt-4 grid gap-3">
          {fields.map((field) => (
            <label key={field.name} className="grid gap-2 text-sm font-bold text-black/70">
              {tLiteral(field.label)}
              {field.type === 'number' ? (
                <input
                  type="number"
                  min={field.min}
                  max={field.max}
                  value={values[field.name]}
                  onChange={(event) => onChange(field.name, event.target.value)}
                  className="focus-ring rounded-md border border-black/10 bg-white px-3 py-2.5 text-sm font-semibold text-black"
                />
              ) : (
                <select
                  value={values[field.name]}
                  onChange={(event) => onChange(field.name, event.target.value)}
                  className="focus-ring rounded-md border border-black/10 bg-white px-3 py-2.5 text-sm font-semibold text-black"
                >
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {tLiteral(option)}
                    </option>
                  ))}
                </select>
              )}
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-black/10 bg-blue-50/50 p-4 sm:p-5">
        <h2 className="text-lg font-black text-black">{tLiteral(title)}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {requirements.map((item) => (
            <div key={item} className="flex min-h-14 items-center rounded-md border border-black/10 bg-white px-4 py-3 text-sm font-bold leading-6 text-black/70 shadow-sm">
              {tLiteral(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
