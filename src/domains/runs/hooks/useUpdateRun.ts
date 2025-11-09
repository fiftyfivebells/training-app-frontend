import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { RunResponse, runsClient, UpdateRunRequest } from "../api/runsApi";
import { ApiError } from "@/lib/api/error";
import { runsKeys } from "../constants";

export function useUpdateRun(
  options?: UseMutationOptions<RunResponse, ApiError, { runId: string; body: UpdateRunRequest }>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ runId, body }: { runId: string; body: UpdateRunRequest }) => runsClient.updateRun(runId, body),
    onSuccess: (updatedRun) => {
      queryClient.setQueryData(runsKeys.detail(updatedRun.id), updatedRun);
      queryClient.invalidateQueries({ queryKey: runsKeys.lists() });
    },
    ...options,
  });
}