"use client";

import { useActionState, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Eye, EyeOff, LoaderCircle, Mail, ShieldAlert } from "lucide-react";
import {
  loginAction,
  registerAction,
  requestPasswordResetAction,
  resendVerificationAction,
  resetPasswordAction,
} from "@/app/(auth)/actions";
import { initialAuthState, type AuthActionState } from "@/lib/auth-validation";
import { GoogleMark } from "./auth-shell";

function Feedback({ state }: { state: AuthActionState }) {
  if (!state.message) return null;
  return <div className={`auth-feedback ${state.status}`} role={state.status === "error" ? "alert" : "status"}><ShieldAlert size={17} />{state.message}</div>;
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <button className="auth-primary" type="submit" disabled={pending} aria-disabled={pending}><span>{pending ? "Please wait…" : children}</span>{pending ? <LoaderCircle className="auth-loading" size={17} aria-hidden="true" /> : null}</button>;
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <small className="auth-field-error">{messages[0]}</small>;
}

function PasswordField({
  name = "password",
  label,
  autoComplete,
  aside,
  errors,
}: {
  name?: string;
  label: string;
  autoComplete: string;
  aside?: ReactNode;
  errors?: string[];
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="auth-field">
      <span className="auth-field-label"><label htmlFor={name}>{label}<small>{autoComplete === "new-password" ? "12+ characters" : "Required"}</small></label>{aside}</span>
      <span className="auth-input-wrap">
        <input id={name} name={name} type={visible ? "text" : "password"} autoComplete={autoComplete} required minLength={autoComplete === "new-password" ? 12 : undefined} maxLength={128} aria-invalid={Boolean(errors?.length)} />
        <button type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible((current) => !current)}>{visible ? <EyeOff size={19} /> : <Eye size={19} />}</button>
      </span>
      <FieldError messages={errors} />
    </div>
  );
}

function GoogleButton() {
  return (
    <button className="google-button" type="button" disabled aria-describedby="google-availability">
      <GoogleMark />Google sign-in coming soon
      <span className="sr-only" id="google-availability">Email and password are available now.</span>
    </button>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, action] = useActionState(registerAction, initialAuthState);
  return (
    <div className="auth-form-stack">
      <GoogleButton />
      <div className="auth-divider"><span>or sign up with email</span></div>
      <form action={action} className="auth-form">
        <input type="hidden" name="next" value={next ?? "/account/access"} />
        <label className="auth-field"><span>Display name <small>Optional</small></span><input name="displayName" autoComplete="name" maxLength={100} /></label>
        <label className="auth-field"><span>Work or personal email <small>Required</small></span><input name="email" type="email" autoComplete="email" required aria-invalid={Boolean(state.fieldErrors?.email)} /><FieldError messages={state.fieldErrors?.email} /></label>
        <PasswordField label="Create password" autoComplete="new-password" errors={state.fieldErrors?.password} />
        <Feedback state={state} />
        <SubmitButton>Create account</SubmitButton>
      </form>
      <p className="auth-separation-note">Account creation does not start a paid membership.</p>
      <p className="auth-switch">Already have an account? <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}>Log in</Link></p>
    </div>
  );
}

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, action] = useActionState(loginAction, initialAuthState);
  return (
    <div className="auth-form-stack">
      {notice ? <div className="auth-feedback success" role="status">{notice}</div> : null}
      <GoogleButton />
      <div className="auth-divider"><span>or log in with email</span></div>
      <form action={action} className="auth-form">
        <input type="hidden" name="next" value={next ?? "/account/access"} />
        <label className="auth-field"><span>Email address <small>Primary ID</small></span><input name="email" type="email" autoComplete="email" required aria-invalid={Boolean(state.fieldErrors?.email)} /><FieldError messages={state.fieldErrors?.email} /></label>
        <PasswordField label="Password" autoComplete="current-password" errors={state.fieldErrors?.password} aside={<Link href="/forgot-password">Forgot password?</Link>} />
        <Feedback state={state} />
        <SubmitButton>Log in</SubmitButton>
      </form>
      <p className="auth-switch">New to IncomeNow? <Link href="/register">Create account</Link></p>
    </div>
  );
}

export function VerifyEmailForm({ invalid = false }: { invalid?: boolean }) {
  const [state, action] = useActionState(resendVerificationAction, initialAuthState);
  return (
    <form action={action} className="auth-form">
      {invalid ? <div className="auth-feedback error" role="alert">This verification link is invalid, expired, or already used. Request a fresh message.</div> : null}
      <label className="auth-field"><span>Account email <small>For resend only</small></span><span className="auth-input-wrap"><Mail size={18} /><input name="email" type="email" autoComplete="email" required /></span></label>
      <Feedback state={state} />
      <SubmitButton>Resend verification email</SubmitButton>
      <Link className="auth-secondary" href="/login">Back to log in</Link>
      <p className="auth-help">Check spam or junk folders. A resend request does not prove that an inbox received a message.</p>
    </form>
  );
}

export function ForgotPasswordForm({ invalid = false }: { invalid?: boolean }) {
  const [state, action] = useActionState(requestPasswordResetAction, initialAuthState);
  return (
    <form action={action} className="auth-form">
      {invalid ? <div className="auth-feedback error" role="alert">That recovery link is invalid, expired, replayed, or was opened in a different browser context.</div> : null}
      <label className="auth-field"><span>Account email <small>Required</small></span><span className="auth-input-wrap"><Mail size={18} /><input name="email" type="email" autoComplete="email" required /></span></label>
      <Feedback state={state} />
      <SubmitButton>Request password reset</SubmitButton>
      <Link className="auth-secondary" href="/login">Back to log in</Link>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(resetPasswordAction, initialAuthState);
  return (
    <form action={action} className="auth-form">
      <PasswordField label="New password" autoComplete="new-password" errors={state.fieldErrors?.password} />
      <Feedback state={state} />
      <SubmitButton>Set new password</SubmitButton>
      <p className="auth-help">The verified recovery context expires after ten minutes and is consumed after a successful change.</p>
    </form>
  );
}
