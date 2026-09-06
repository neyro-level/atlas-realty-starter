"use client";

import { LeadgenQuizModal } from "./LeadgenQuizModal";
import { homeNewBuildingQuizContent } from "./home-new-building-quiz-content";

/** Homepage-only quiz entrypoint. Uses a dedicated open event, not leadgen Direct landings. */
export function HomeNewBuildingQuizModal() {
  return (
    <LeadgenQuizModal
      content={homeNewBuildingQuizContent}
      openEventName="open-home-new-building-quiz"
      defaultSource="home-services:new-building-quiz"
    />
  );
}
