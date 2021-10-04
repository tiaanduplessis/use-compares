import { EffectCallback } from "react";
import { CompareDepsFunc, Deps } from "../types";

import {
  useCustomCompareCallback,
  useCustomCompareEffect,
  useCustomCompareLayoutEffect,
  useCustomCompareMemo
} from "../custom";

// @ts-ignore
import stringify from "json-stringify-deterministic";

const isEqual: CompareDepsFunc = (foo, bar) =>
  stringify(foo) === stringify(bar);

export const useDeterministicCompareMemo = <T>(factory: () => T, deps: Deps) =>
  useCustomCompareMemo(factory, deps, isEqual);

export const useDeterministicCompareCallback = <T>(
  factory: () => T,
  deps: Deps
) => useCustomCompareCallback(factory, deps, isEqual);

export const useDeterministicCompareEffect = (
  effect: EffectCallback,
  deps: Deps
) => useCustomCompareEffect(effect, deps, isEqual);

export const useDeterministicCompareLayoutEffect = (
  effect: EffectCallback,
  deps: Deps
) => useCustomCompareLayoutEffect(effect, deps, isEqual);
