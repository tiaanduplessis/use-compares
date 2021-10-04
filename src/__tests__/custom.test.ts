import { renderHook } from "@testing-library/react-hooks";
import { dequal } from "dequal";
import {
  useCustomCompareMemo,
  useCustomCompareCallback,
  useCustomCompareEffect,
  useCustomCompareLayoutEffect,
} from "../custom";

describe("useCustomCompareMemo", () => {
  it("should not change if deps are the same", () => {
    const deps = [{ foo: true }, 4, { bar: false }];
    const factory = jest.fn();
    const { rerender } = renderHook(() =>
      useCustomCompareMemo(factory, deps, dequal)
    );
    expect(factory).toHaveBeenCalledTimes(1);
    rerender();
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it("should change if deps change", () => {
    let deps = [{ foo: true }, 4, { bar: false }];
    const factory = jest.fn();
    const { rerender } = renderHook(() =>
      useCustomCompareMemo(factory, deps, dequal)
    );
    expect(factory).toHaveBeenCalledTimes(1);
    deps = [{ foo: false }, 5, { bar: true }];
    rerender();
    expect(factory).toHaveBeenCalledTimes(2);
  });
});

describe("useCustomCallback", () => {
  it("should not change if deps are the same", () => {
    let deps = [true, null, { foo: "bar" }];
    let prevCallback;
    let callback = () => {};
    const { rerender, result } = renderHook(() =>
      useCustomCompareCallback(callback, deps, dequal)
    );

    deps = [true, null, { foo: "bar" }];
    prevCallback = result.current;
    callback = () => {};
    rerender();
    expect(result.current).toBe(prevCallback);
  });

  it("should change if deps change", () => {
    let deps = [true, null, 5];
    let prevCallback;
    let callback = () => {};
    const { rerender, result } = renderHook(() =>
      useCustomCompareCallback(callback, deps, dequal)
    );
    prevCallback = result.current;

    const newCallback = () => {};
    deps = [false, null, 10];
    callback = newCallback;
    rerender();
    expect(result.current).not.toBe(prevCallback);
    expect(result.current).toBe(newCallback);
  });
});

describe("useCustomCompareEffect", () => {
  it("should not change if deps are the same", () => {
    const deps = [{ foo: true }, 4, { bar: false }];
    const factory = jest.fn();
    const { rerender } = renderHook(() =>
      useCustomCompareEffect(factory, deps, dequal)
    );
    expect(factory).toHaveBeenCalledTimes(1);
    rerender();
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it("should change if deps change", () => {
    let deps = [{ foo: true }, 4, { bar: false }];
    const factory = jest.fn();
    const { rerender } = renderHook(() =>
      useCustomCompareEffect(factory, deps, dequal)
    );
    expect(factory).toHaveBeenCalledTimes(1);
    deps = [{ foo: false }, 5, { bar: true }];
    rerender();
    expect(factory).toHaveBeenCalledTimes(2);
  });
});

describe("useCustomCompareLayoutEffect", () => {
  it("should not change if deps are the same", () => {
    const deps = [{ foo: true }, 4, { bar: false }];
    const factory = jest.fn();
    const { rerender } = renderHook(() =>
      useCustomCompareLayoutEffect(factory, deps, dequal)
    );
    expect(factory).toHaveBeenCalledTimes(1);
    rerender();
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it("should change if deps change", () => {
    let deps = [{ foo: true }, 4, { bar: false }];
    const factory = jest.fn();
    const { rerender } = renderHook(() =>
      useCustomCompareLayoutEffect(factory, deps, dequal)
    );
    expect(factory).toHaveBeenCalledTimes(1);
    deps = [{ foo: false }, 5, { bar: true }];
    rerender();
    expect(factory).toHaveBeenCalledTimes(2);
  });
});
