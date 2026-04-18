import { actions, kea, listeners, path, reducers, selectors } from "kea";
import posthog from "posthog-js";

import type { ftuxLogicType } from "./ftuxLogicType";

export enum FTUXStep {
  NOT_STARTED = "not_started",
  EDITOR = "editor",
  SAVE = "save",
  INTEGRATIONS = "integrations",
  COMPLETED = "completed",
}

export const ftuxLogic = kea<ftuxLogicType>([
  path(["src", "lib", "logics", "ftuxLogic"]),

  actions({
    queueFTUX: true,
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
    // Queued for the next eligible project view; cleared once FTUX runs
    // (started, skipped, or completed). Persisted so it survives reloads
    // between passphrase setup and the user opening their first project.
    ftuxQueued: [
      false as boolean,
      { persist: true },
      {
        queueFTUX: () => true,
        setCurrentStep: (state, { step }) =>
          step === FTUXStep.EDITOR ? false : state,
        skipFTUX: () => false,
        completeFTUX: () => false,
      },
    ],
    // Sticky terminal flag: once true, FTUX never auto-starts again.
    ftuxCompleted: [
      false as boolean,
      { persist: true },
      {
        skipFTUX: () => true,
        completeFTUX: () => true,
      },
    ],
    currentStep: [
      FTUXStep.NOT_STARTED as FTUXStep,
      {
        setCurrentStep: (_, { step }) => step,
        skipFTUX: () => FTUXStep.COMPLETED,
        completeFTUX: () => FTUXStep.COMPLETED,
      },
    ],
  }),

  selectors({
    isFTUXActive: [
      (s) => [s.currentStep],
      (currentStep) =>
        currentStep !== FTUXStep.NOT_STARTED &&
        currentStep !== FTUXStep.COMPLETED,
    ],
    isFTUXCompleted: [
      (s) => [s.currentStep],
      (currentStep) => currentStep === FTUXStep.COMPLETED,
    ],
    shouldShowEditorTooltip: [
      (s) => [s.currentStep],
      (currentStep) => currentStep === FTUXStep.EDITOR,
    ],
    shouldShowSaveTooltip: [
      (s) => [s.currentStep],
      (currentStep) => currentStep === FTUXStep.SAVE,
    ],
    shouldShowIntegrationsTooltip: [
      (s) => [s.currentStep],
      (currentStep) => currentStep === FTUXStep.INTEGRATIONS,
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
    queueFTUX: () => {
      posthog.capture("ftux_queued");
    },

    startFTUX: () => {
      // Run only when explicitly queued (after passphrase setup) and
      // not already finished. Idempotent: subsequent calls do nothing.
      if (values.ftuxCompleted || !values.ftuxQueued) {
        return;
      }

      posthog.capture("ftux_started");
      actions.setCurrentStep(FTUXStep.EDITOR);
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
      posthog.capture("ftux_skipped", {
        current_step: values.currentStep,
      });
    },

    completeFTUX: () => {
      posthog.capture("ftux_done_button_clicked");
    },

    nextStep: () => {
      const { currentStep } = values;

      if (currentStep !== FTUXStep.INTEGRATIONS) {
        posthog.capture("ftux_next_button_clicked", {
          current_step: currentStep,
        });
      }

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
