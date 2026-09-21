import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { PublicFaq } from "./public-faq";
import { PublicFaqSelector } from "./public-faq-selector";

const items = [
  { question: "What is included?", answer: "Focused guidance and labelled resources." },
  { question: "Is income guaranteed?", answer: "No. Every opportunity still needs validation." },
] as const;

describe("public FAQ", () => {
  afterEach(cleanup);

  it("renders every selector answer in the initial server markup", () => {
    const markup = renderToStaticMarkup(<PublicFaqSelector items={items} />);

    expect(markup).toContain(items[0].answer);
    expect(markup).toContain(items[1].answer);
  });

  it("uses real question buttons to update the dedicated answer panel", async () => {
    const user = userEvent.setup();
    render(<PublicFaqSelector items={items} />);

    const firstQuestion = screen.getByRole("button", { name: items[0].question });
    const secondQuestion = screen.getByRole("button", { name: items[1].question });
    expect(firstQuestion).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: items[0].question })).toHaveTextContent(items[0].answer);

    await user.click(secondQuestion);

    expect(firstQuestion).toHaveAttribute("aria-expanded", "false");
    expect(secondQuestion).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: items[1].question })).toHaveTextContent(items[1].answer);
    expect(screen.queryByRole("region", { name: items[0].question })).not.toBeInTheDocument();
  });

  it("keeps the disclosure pattern as the default for other public pages", () => {
    render(<PublicFaq items={items} />);

    expect(screen.getAllByText(items[0].question)).toHaveLength(1);
    expect(document.querySelectorAll("details.public-faq-item")).toHaveLength(2);
  });
});
