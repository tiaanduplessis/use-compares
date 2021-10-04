import {
  EffectCallback,
} from "react";

import { dequal as isEqual } from "dequal/lite";
import { Deps } from "../types";
import {
  useCustomCompareCallback,
  useCustomCompareEffect,
  useCustomCompareLayoutEffect,
  useCustomCompareMemo,
} from "../custom";

export const useDeepCompareMemo = <T>(factory: () => T, deps: Deps) =>
  useCustomCompareMemo(factory, deps, isEqual);

export const useDeepCompareCallback = <T>(factory: () => T, deps: Deps) =>
  useCustomCompareCallback(factory, deps, isEqual);

export const useDeepCompareEffect = (effect: EffectCallback, deps: Deps) =>
  useCustomCompareEffect(effect, deps, isEqual);

export const useDeepCompareLayoutEffect = (
  effect: EffectCallback,
  deps: Deps
) => useCustomCompareLayoutEffect(effect, deps, isEqual);
