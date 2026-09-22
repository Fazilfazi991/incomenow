import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LoginForm, RegisterForm } from "./auth-forms";

afterEach(cleanup);

describe("initial launch authentication options", () => {
  it.each([
    ["login", <LoginForm key="login" />],
    ["registration", <RegisterForm key="registration" />],
  ])("keeps Google visibly unavailable on %s", (_name, form) => {
    render(form);

    expect(screen.getByRole("button", { name: /Google sign-in coming soon/i })).toBeDisabled();
    expect(screen.queryByRole("button", { name: /Continue with Google/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Email and password are available now/i)).toBeInTheDocument();
  });
});
