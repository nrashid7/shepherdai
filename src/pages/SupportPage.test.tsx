import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import SupportPage from "./SupportPage";

describe("SupportPage", () => {
  it("provides a working support contact and account deletion instructions", () => {
    render(
      <MemoryRouter>
        <SupportPage />
      </MemoryRouter>,
    );

    const supportLink = screen.getByRole("link", {
      name: "nr.rashid7@gmail.com",
    });

    expect(supportLink).toHaveAttribute("href", "mailto:nr.rashid7@gmail.com");
    expect(screen.getByText(/Settings/)).toBeInTheDocument();
    expect(screen.getByText(/Delete My Account/)).toBeInTheDocument();
  });
});
