export default function StepTabs({ steps, activeStep }) {
  return (
    <div className="grid gap-2 rounded-md border border-black/10 bg-white p-1.5 shadow-sm sm:grid-cols-3">
      {steps.map((step, index) => {
        const isActive = activeStep === index;
        const isComplete = activeStep > index;
        return (
          <div
            key={step}
            className={`rounded-md px-3 py-2 text-center text-sm font-black transition-colors ${
              isActive
                ? 'bg-blue-700 text-white'
                : isComplete
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-black/[0.035] text-black/55'
            }`}
          >
            {index + 1}. {step}
          </div>
        );
      })}
    </div>
  );
}
