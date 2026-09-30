import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorBoundary from "@/app/error";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("Route Error Boundary", () => {
  it("renders user-friendly error message", () => {
    const error = new Error("Test error message") as Error & { digest?: string };
    const retry = vi.fn();

    render(<ErrorBoundary error={error} retry={retry} />);

    expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
    expect(
      screen.getByText(/We apologize for the inconvenience/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("calls retry when 'Try again' button is clicked", () => {
    const error = new Error("Test error message") as Error & { digest?: string };
    const retry = vi.fn();

    render(<ErrorBoundary error={error} retry={retry} />);

    const retryButton = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(retryButton);

    expect(retry).toHaveBeenCalledTimes(1);
  });
});
