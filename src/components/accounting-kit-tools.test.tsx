import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AccountingPricingPlanner } from "./accounting-kit-tools";

describe("AccountingPricingPlanner", () => {
  afterEach(cleanup);

  it("recalculates projected gross margin from editable assumptions", () => {
    render(<AccountingPricingPlanner />);
    fireEvent.change(screen.getByLabelText("Application hosting"), { target: { value: "100" } });
    fireEvent.change(screen.getByLabelText("Discovery and requirements"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText("Hourly internal cost"), { target: { value: "20" } });
    fireEvent.change(screen.getByLabelText("Implementation fee"), { target: { value: "500" } });

    expect(screen.getByText("200.00", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("300.00", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText(/40.00% from assumptions/i)).toBeInTheDocument();
  });

  it("labels the tool as an estimate rather than a recommended price", () => {
    render(<AccountingPricingPlanner />);
    expect(screen.getByText(/not a recommended price or earnings claim/i)).toBeInTheDocument();
  });
});
