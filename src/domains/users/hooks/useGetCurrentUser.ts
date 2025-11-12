import { UseBaseQueryOptions, useQuery } from "@tanstack/react-query";
import { userClient, UserResponse } from "../api/userApi";
import { usersKeys } from "../users.constants";
import { User, userResponseToUser } from "../users.types";
import { createMappedQueryHook } from "@/lib/hooks/createMappedQueryHook";

export const useGetCurrentUser = createMappedQueryHook<UserResponse, User, readonly["users", "me"]>(
  usersKeys.me(),
  () => userClient.getCurrentUser(),
  userResponseToUser
)