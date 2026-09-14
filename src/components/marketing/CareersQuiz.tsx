"use client";

import { Button } from "@starter/site-ui/primitives";

import { ArrowRight } from "lucide-react";
import { LeadgenQuizModal } from "@/modules/leadgen/LeadgenQuizModal";
import {
  CAREERS_QUIZ_OPEN_EVENT,
  careersQuizContent,
} from "@/project/careers-quiz";

const CAREERS_QUIZ_SOURCE = "corporate:rabota-rieltorom:hero";

export function CareersQuizButton({
  className,
  showIcon = false,
  source = CAREERS_QUIZ_SOURCE,
}: {
  className: string;
  showIcon?: boolean;
  source?: string;
}) {
  function openQuiz() {
    window.dispatchEvent(
      new CustomEvent(CAREERS_QUIZ_OPEN_EVENT, {
        detail: {
          source,
          formType: careersQuizContent.quiz.formType,
        },
      }),
    );
  }

  return (
    <Button variant="plain"
      type="button"
      className={className}
      data-careers-quiz-trigger
      data-careers-quiz-source={source}
      onClick={openQuiz}
    >
      Пройти отбор
      {showIcon ? <ArrowRight className="" aria-hidden /> : null}
    </Button>
  );
}

export function CareersQuizModal() {
  return (
    <LeadgenQuizModal
      content={careersQuizContent}
      openEventName={CAREERS_QUIZ_OPEN_EVENT}
      defaultSource={CAREERS_QUIZ_SOURCE}
    />
  );
}
