import { DependencyList } from "react";

export type CompareDepsFunc = (
  prevDeps: DependencyList,
  newDeps: DependencyList
) => boolean;

export type Deps = DependencyList;
