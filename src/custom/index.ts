import {
  useMemo,
  useCallback,
  useEffect,
  useLayoutEffect,
  EffectCallback,
} from "react";
import { CompareDepsFunc, Deps } from "../types";
import { useCompareRef } from "../use-compare-ref";

export const useCustomCompareMemo = <T>(
  factory: () => T,
  deps: Deps,
  isEqual: CompareDepsFunc
) => useMemo(factory, useCompareRef(deps, isEqual));

export const useCustomCompareCallback = <T>(
  factory: () => T,
  deps: Deps,
  isEqual: CompareDepsFunc
) => useCallback(factory, useCompareRef(deps, isEqual));

export const useCustomCompareEffect = (
  effect: EffectCallback,
  deps: Deps,
  isEqual: CompareDepsFunc
) => useEffect(effect, useCompareRef(deps, isEqual));

export const useCustomCompareLayoutEffect = (
  effect: EffectCallback,
  deps: Deps,
  isEqual: CompareDepsFunc
) => useLayoutEffect(effect, useCompareRef(deps, isEqual));
