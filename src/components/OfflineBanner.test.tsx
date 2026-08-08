import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import OfflineBanner from "./OfflineBanner";

describe("OfflineBanner", () => {
  it("shows an actionable message while the device is offline", () => {
    Object.defineProperty(navigator, "onLine", { configurable: true, value: false });
    render(<OfflineBanner />);
    expect(screen.getByRole("alert")).toHaveTextContent("offline");

    Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
    fireEvent(window, new Event("online"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
