import React from "react";
import { act, render, screen } from "@testing-library/react";
import useElementSize from "./useElementSize";

test("Container changes update the drawing size and the observer is disconnected on unmount", () => {
  let bounds = { width: 800, height: 600 };
  const measure = jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(() => ({
    ...bounds, top: 0, left: 0, right: bounds.width, bottom: bounds.height, x: 0, y: 0, toJSON: () => ({}),
  }));
  const originalObserver = global.ResizeObserver;
  const disconnect = jest.fn();
  let notify!: ResizeObserverCallback;
  let observer!: ResizeObserver;
  class Observer {
    constructor(callback: ResizeObserverCallback) { notify = callback; observer = this as unknown as ResizeObserver; }
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = disconnect;
  }
  global.ResizeObserver = Observer as unknown as typeof ResizeObserver;
  function SizeProbe() {
    const { ref, width, height } = useElementSize();
    return <div ref={ref}>{width} × {height}</div>;
  }
  try {
    const { unmount } = render(<SizeProbe />);
    expect(screen.getByText("800 × 600")).toBeInTheDocument();
    bounds = { width: 1440, height: 900 };
    act(() => notify([], observer));
    expect(screen.getByText("1440 × 900")).toBeInTheDocument();
    unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  } finally {
    global.ResizeObserver = originalObserver;
    measure.mockRestore();
  }
});
