import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Navbar from "./Navbar";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: null, signOut: vi.fn() }),
}));

describe("Navbar accessibility", () => {
  it("names both desktop and mobile sign-in links", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole("link", { name: /sign in/i })).toHaveLength(2);
  });
});
