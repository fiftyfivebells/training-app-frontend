import { useSessionChecker } from "../hooks";

export function SessionChecker() {
  console.log("SessionChecker mounted");
  useSessionChecker();
  return null;
}