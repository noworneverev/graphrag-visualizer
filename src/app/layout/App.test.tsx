import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("../components/GraphDataHandler", () => {
  const React = require("react");
  const { useTheme } = require("@mui/material");
  return function ThemeProbe() {
    const theme = useTheme();
    return React.createElement("div", { "data-testid": "theme-mode" }, theme.palette.mode);
  };
});
jest.mock("react-ga4", () => ({ initialize: jest.fn(), send: jest.fn() }));

const originalMeasurementId = process.env.REACT_APP_GA_MEASUREMENT_ID;
beforeEach(() => {
  localStorage.clear();
  process.env.REACT_APP_GA_MEASUREMENT_ID = "G-TEST";
});
afterEach(() => {
  if (originalMeasurementId === undefined) delete process.env.REACT_APP_GA_MEASUREMENT_ID;
  else process.env.REACT_APP_GA_MEASUREMENT_ID = originalMeasurementId;
});

test("Dark mode is the default when no theme was saved", () => {
  render(<App />);
  expect(screen.getByTestId("theme-mode")).toHaveTextContent("dark");
});

test("The saved light theme is restored and theme changes are saved", () => {
  localStorage.setItem("theme", "light");
  const { unmount } = render(<App />);
  expect(screen.getByTestId("theme-mode")).toHaveTextContent("light");
  fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
  expect(screen.getByTestId("theme-mode")).toHaveTextContent("dark");
  expect(localStorage.getItem("theme")).toBe("dark");
  unmount();
  render(<App />);
  expect(screen.getByTestId("theme-mode")).toHaveTextContent("dark");
});
