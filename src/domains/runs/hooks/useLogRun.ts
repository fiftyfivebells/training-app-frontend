import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { LogRunRequest, RunResponse, runsClient } from "../api/runsApi";
import { ApiError } from "@/lib/api/error";
import { runsKeys } from "../constants";

export function useLogRun(
  options?: UseMutationOptions<RunResponse, ApiError, LogRunRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: LogRunRequest) => runsClient.logRun(body),
    onSuccess: (newRun) => {
      queryClient.setQueryData(runsKeys.detail(newRun.id), newRun);
      queryClient.invalidateQueries({ queryKey: runsKeys.lists() });
    },
    ...options,
  });
}
