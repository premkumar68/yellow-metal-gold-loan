import React from 'react';
import { Check, User, Calculator, ShieldCheck } from 'lucide-react';

export const StepIndicator = ({ currentStep, setStep, isStep1Valid, isStep2Valid }) => {
  const steps = [
    {
      id: 1,
      title: 'Customer & Gold Details',
      subtitle: 'Weights, purity & contact',
      icon: User,
    },
    {
      id: 2,
      title: 'Dynamic Calculation',
      subtitle: '75% LTV & scheme selection',
      icon: Calculator,
    },
    {
      id: 3,
      title: 'Final Confirmation',
      subtitle: 'Review & instant lead sanction',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress connecting lines */}
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0">
          <div
            className="h-full bg-amber-500 transition-all duration-300 ease-out"
            style={{
              width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
            }}
          />
        </div>

        {/* Step circles and labels */}
        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const Icon = step.icon;

          // Determine if step is clickable backwards
          const isClickable =
            (step.id === 1) ||
            (step.id === 2 && isStep1Valid) ||
            (step.id === 3 && isStep1Valid && isStep2Valid);

          return (
            <div
              key={step.id}
              className={`flex flex-col items-center relative z-10 cursor-pointer transition-transform ${
                isClickable ? 'hover:scale-105' : 'cursor-not-allowed opacity-60'
              }`}
              onClick={() => {
                if (isClickable) setStep(step.id);
              }}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200 ${
                  isCompleted
                    ? 'bg-amber-500 text-white shadow-gold-glow'
                    : isActive
                    ? 'bg-amber-500/20 border-2 border-amber-500 text-amber-500 dark:text-amber-400 ring-4 ring-amber-500/10'
                    : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-400'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Icon className="w-4 h-4" />}
              </div>

              <span
                className={`mt-2 text-xs font-semibold text-center ${
                  isActive
                    ? 'text-amber-600 dark:text-amber-400'
                    : isCompleted
                    ? 'text-slate-800 dark:text-slate-200'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                Step {step.id}
              </span>
              <span className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 text-center max-w-[130px] truncate">
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
