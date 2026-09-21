import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ArtworkImage } from "./artwork-image";

vi.mock("next/image", () => ({
  default: ({ alt, onError, src }: { alt: string; onError: () => void; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} onError={onError} src={src} />
  ),
}));

describe("ArtworkImage", () => {
  afterEach(cleanup);

  it("replaces a failed image with an accessible local fallback", () => {
    render(<ArtworkImage alt="A pergola project desk" sizes="320px" src="/artwork/ideas/missing.webp" />);
    fireEvent.error(screen.getByRole("img", { name: "A pergola project desk" }));
    expect(screen.getByRole("img", { name: "A pergola project desk. Artwork unavailable." })).toHaveTextContent("Artwork unavailable");
  });
});
