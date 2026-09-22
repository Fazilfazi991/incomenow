import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ResumiScenarioPlanner } from "./resumi-scenario-planner";

describe("ResumiScenarioPlanner", () => {
  it("starts at zero and recalculates from member-entered assumptions", async () => {
    const user = userEvent.setup();
    render(<ResumiScenarioPlanner />);

    expect(screen.getByText("Scenario paid users").parentElement).toHaveTextContent("0");

    await user.type(screen.getByLabelText("Monthly active users"), "1000");
    await user.type(screen.getByLabelText("Free-to-paid conversion %"), "5");
    await user.type(screen.getByLabelText("Premium price per period"), "10");
    await user.type(screen.getByLabelText("Hosting cost"), "100");

    expect(screen.getByText("Scenario paid users").parentElement).toHaveTextContent("50");
    expect(screen.getByText("Subscription revenue").parentElement).toHaveTextContent("500");
    expect(screen.getByText("Operating cost").parentElement).toHaveTextContent("100");
    expect(screen.getByText("Scenario gross margin").parentElement).toHaveTextContent("400");
  });
});
