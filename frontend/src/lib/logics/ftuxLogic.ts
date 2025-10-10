import { actions, kea, listeners, path, reducers, selectors } from "kea";

import type { ftuxLogicType } from "./ftuxLogicType";

export enum FTUXStep {
  NOT_STARTED = "not_started",
  EDITOR = "editor",
  SAVE = "save",
  INTEGRATIONS = "integrations",
  COMPLETED = "completed",
}

const FTUX_STORAGE_KEY = "ftux_completed";

export const ftuxLogic = kea<ftuxLogicType>([
  path(["src", "lib", "logics", "ftuxLogic"]),

  actions({
    startFTUX: true,
    nextStep: true,
    previousStep: true,
    skipFTUX: true,
    completeFTUX: true,
    setCurrentStep: (step: FTUXStep) => ({ step }),
    userMadeEdit: true,
    userSaved: true,
    userOpenedIntegrationsDialog: true,
  }),

  reducers({
    currentStep: [
      FTUXStep.NOT_STARTED as FTUXStep,
      {
        setCurrentStep: (_, { step }) => step,
        startFTUX: () => FTUXStep.EDITOR,
        skipFTUX: () => FTUXStep.COMPLETED,
        completeFTUX: () => FTUXStep.COMPLETED,
      },
    ],
    isFTUXActive: [
      false as boolean,
      {
        startFTUX: () => true,
        skipFTUX: () => false,
        completeFTUX: () => false,
      },
    ],
  }),

  selectors({
    isFTUXCompleted: [
      (s) => [s.currentStep],
      (currentStep) => currentStep === FTUXStep.COMPLETED,
    ],
    shouldShowEditorTooltip: [
      (s) => [s.currentStep, s.isFTUXActive],
      (currentStep, isFTUXActive) =>
        isFTUXActive && currentStep === FTUXStep.EDITOR,
    ],
    shouldShowSaveTooltip: [
      (s) => [s.currentStep, s.isFTUXActive],
      (currentStep, isFTUXActive) =>
        isFTUXActive && currentStep === FTUXStep.SAVE,
    ],
    shouldShowIntegrationsTooltip: [
      (s) => [s.currentStep, s.isFTUXActive],
      (currentStep, isFTUXActive) =>
        isFTUXActive && currentStep === FTUXStep.INTEGRATIONS,
    ],
    currentStepNumber: [
      (s) => [s.currentStep],
      (currentStep) => {
        switch (currentStep) {
          case FTUXStep.EDITOR:
            return 1;
          case FTUXStep.SAVE:
            return 2;
          case FTUXStep.INTEGRATIONS:
            return 3;
          default:
            return 0;
        }
      },
    ],
  }),

  listeners(({ actions, values }) => ({
    startFTUX: () => {
      // Check if FTUX was already completed
      const completed = localStorage.getItem(FTUX_STORAGE_KEY);
      if (completed === "true") {
        actions.setCurrentStep(FTUXStep.COMPLETED);
      } else {
        actions.setCurrentStep(FTUXStep.EDITOR);
      }
    },

    userMadeEdit: () => {
      if (values.currentStep === FTUXStep.EDITOR) {
        actions.setCurrentStep(FTUXStep.SAVE);
      }
    },

    userSaved: () => {
      if (values.currentStep === FTUXStep.SAVE) {
        actions.setCurrentStep(FTUXStep.INTEGRATIONS);
      }
    },

    userOpenedIntegrationsDialog: () => {
      if (values.currentStep === FTUXStep.INTEGRATIONS) {
        actions.completeFTUX();
      }
    },

    skipFTUX: () => {
      localStorage.setItem(FTUX_STORAGE_KEY, "true");
    },

    completeFTUX: () => {
      localStorage.setItem(FTUX_STORAGE_KEY, "true");
    },

    nextStep: () => {
      const { currentStep } = values;
      switch (currentStep) {
        case FTUXStep.EDITOR:
          actions.setCurrentStep(FTUXStep.SAVE);
          break;
        case FTUXStep.SAVE:
          actions.setCurrentStep(FTUXStep.INTEGRATIONS);
          break;
        case FTUXStep.INTEGRATIONS:
          actions.completeFTUX();
          break;
      }
    },

    previousStep: () => {
      const { currentStep } = values;
      switch (currentStep) {
        case FTUXStep.SAVE:
          actions.setCurrentStep(FTUXStep.EDITOR);
          break;
        case FTUXStep.INTEGRATIONS:
          actions.setCurrentStep(FTUXStep.SAVE);
          break;
      }
    },
  })),
]);
