import { Button, Step, StepContent, StepLabel, Stepper } from "@mui/material";
import { ReactElement, useState } from "react";

export interface StepInfo {
  label: string;
  canContinue: boolean;
  content: ReactElement;
}

export function MultistepForm({
  steps,
  submitLabel,
  onSubmit,
}: {
  steps: StepInfo[];
  submitLabel: string;
  onSubmit?: () => void;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const handleNext = () => {
    if (activeStep === steps.length - 1) onSubmit?.();
    setActiveStep((step) => step + 1);
  };
  const handleBack = () => setActiveStep((step) => step - 1);

  return (
    <Stepper activeStep={activeStep} orientation="vertical">
      {steps.map((step, index) => (
        <Step key={index}>
          <StepLabel>{step.label}</StepLabel>
          <StepContent>
            <div className="flex flex-col gap-2 mt-4 items-start">
              {step.content}
            </div>
            <div className="mt-4 flex gap-2 items-center">
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!step.canContinue}
              >
                {index === steps.length - 1 ? submitLabel : "Continue"}
              </Button>
              <Button disabled={index === 0} onClick={handleBack}>
                Back
              </Button>
            </div>
          </StepContent>
        </Step>
      ))}
    </Stepper>
  );
}
