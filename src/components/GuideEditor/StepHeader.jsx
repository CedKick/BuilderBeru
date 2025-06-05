import React from "react";

const StepHeader = ({ steps, currentStep, onStepChange, validatedSteps = [], nextStepReady }) => {
  return (
    <div className="flex items-center justify-center gap-2 py-6 flex-wrap">
      {steps.map((step, index) => {
        const isCurrent = index === currentStep;
        const isClickable = validatedSteps.includes(index) || index < currentStep;
        const isDone = validatedSteps.includes(index);
        const isNextStep = index === currentStep + 1;
        const shouldGlow = isNextStep && nextStepReady;

        return (
          <div
            key={step}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border 
              ${isCurrent
                ? 'bg-yellow-400 text-black border-yellow-500 shadow-md scale-105'
                : isClickable
                  ? 'bg-zinc-800 text-white border-zinc-600 hover:bg-zinc-700 cursor-pointer'
                  : shouldGlow
                    ? 'bg-zinc-800 text-white border-indigo-500 animate-pulse ring-2 ring-indigo-400 shadow'
                    : 'bg-zinc-700 text-gray-500 border-zinc-600 cursor-not-allowed opacity-60'}`}
            onClick={() => {
              if (isClickable) onStepChange(index);
            }}
          >
            {isDone && !isCurrent ? '✓ ' : ''}
            {step}
          </div>
        );
      })}
    </div>
  );
};

export default StepHeader;