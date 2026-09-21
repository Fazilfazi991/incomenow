import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HeroMotionVideo } from "./hero-motion-video";
import { PublicHowItWorks } from "./public-how-it-works";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  Reflect.deleteProperty(window, "matchMedia");
});

describe("approved hero motion", () => {
  it("uses one muted inline looping player with WebM and MP4 fallback", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);

    const { container } = render(<HeroMotionVideo />);
    const video = await waitFor(() => {
      const element = container.querySelector("video");
      expect(element).not.toBeNull();
      return element!;
    });

    expect(video).toHaveAttribute("autoplay");
    expect(video).toHaveAttribute("playsinline");
    expect(video).toHaveProperty("muted", true);
    expect(video).not.toHaveAttribute("controls");
    expect(video).toHaveAttribute("loop");
    expect(video.querySelectorAll("source")).toHaveLength(2);
    expect(video.querySelector('source[type="video/webm"]')).toHaveAttribute("src", "/media/incomenow-hero-motion-loop.webm");
    expect(video.querySelector('source[type="video/mp4"]')).toHaveAttribute("src", "/media/incomenow-hero-motion-loop.mp4");
    expect(screen.getByAltText(/Pergola Business Kit connected/)).toHaveAttribute("src", expect.stringContaining("incomenow-hero-poster.webp"));
  });

  it("renders only the poster when reduced motion is requested", async () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });

    const { container } = render(<HeroMotionVideo />);
    await waitFor(() => expect(screen.getByAltText(/Pergola Business Kit connected/)).toBeInTheDocument());
    expect(container.querySelector("video")).not.toBeInTheDocument();
  });
});

describe("interactive how it works", () => {
  it("uses arrow keys and exposes selection beyond colour", async () => {
    const user = userEvent.setup();
    render(<PublicHowItWorks />);

    const discover = screen.getByRole("tab", { name: /Discover/ });
    discover.focus();
    await user.keyboard("{ArrowRight}");

    const explore = screen.getByRole("tab", { name: /Explore the kit/ });
    expect(explore).toHaveFocus();
    expect(explore).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Understand the workflow");
    expect(explore.querySelector("svg")).not.toBeNull();
  });
});
