import { DependencyList, useRef } from "react";
import { CompareDepsFunc, Deps } from "./types";

export const useCompareRef = (deps: Deps, isEqual: CompareDepsFunc) => {
  const ref = useRef<DependencyList | null>(null);

  if (!ref.current || !isEqual(ref.current, deps)) {
    ref.current = deps;
  }

  return ref.current;
};
