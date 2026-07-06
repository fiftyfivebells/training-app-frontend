import { useMutation } from "@tanstack/react-query";
import { feedbackClient, SubmitFeedbackRequest } from "../api/feedbackClient";

export function useSubmitFeedback() {
  return useMutation({ mutationFn: (b: SubmitFeedbackRequest) => feedbackClient.submit(b) })
}
