import Image from "next/image";

import { Typography } from "@/components/atoms";
import { LockIcon, VerifiedIcon } from "@/components/icons";
import { content } from "@/data";

import { AuthFeedback } from "./auth-feedback";
import { AuthSubmitButton } from "./auth-submit-button";

type LoginViewProps = {
  authError: "authentication" | "member-not-registered" | null;
  discordConfigured: boolean;
  memberName?: string | null;
  signInAction: () => Promise<void>;
  signOutAction: () => Promise<void>;
};

export function LoginView({
  authError,
  discordConfigured,
  memberName,
  signInAction,
  signOutAction,
}: LoginViewProps) {
  return (
    <>
      <section className="crest-stage relative flex min-h-[360px] flex-col items-center justify-center lg:min-h-[760px]" aria-labelledby="brand-title">
        <div className="crest-orbit" aria-hidden="true" />
        <p className="chapter-mark absolute left-0 top-2 hidden text-[11px] font-bold uppercase tracking-[0.34em] text-[var(--color-primary-muted)] sm:block lg:top-8">
          {content.auth.chapter}
        </p>
        <Image
          alt="Shade of Triads golden dragon crest"
          className="crest-image relative z-10 h-auto w-[min(68vw,370px)] object-contain lg:w-[370px]"
          height={1230}
          priority
          src="/sot-logo.png"
          width={1105}
        />
        <div className="brand-lockup relative z-20 mt-4 self-start sm:absolute sm:bottom-4 sm:left-0 sm:mt-0 lg:bottom-10">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-[var(--color-danger)]">
            {content.auth.community}
          </p>
          <Typography as="h2" id="brand-title" className="text-2xl sm:text-3xl" variant="heading">
            {content.auth.brand}
          </Typography>
        </div>
      </section>

      <section className="login-panel relative mx-auto w-full max-w-[480px] py-10 lg:ml-auto lg:py-0">
        <div className="panel-index mb-8 flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--color-primary-muted)]">
          <span>{content.auth.sectionNumber}</span>
          <span className="h-px flex-1 bg-[var(--color-border)]" />
          <span>{content.auth.sectionLabel}</span>
        </div>

        <div className="login-copy">
          <Typography className="mb-5 inline-flex items-center gap-2 text-xs" variant="eyebrow">
            <LockIcon aria-hidden="true" /> {content.auth.eyebrow}
          </Typography>
          <Typography as="h1" className="max-w-md text-5xl leading-[0.92] sm:text-6xl" variant="display">
            {content.auth.title}
          </Typography>
          <Typography className="mt-6 max-w-md text-[15px] sm:text-base">
            {content.auth.description}
          </Typography>
        </div>

        <div className="mt-10 border-y border-[var(--color-border)] py-7">
          {authError ? <AuthFeedback kind={authError} /> : null}
          {!discordConfigured ? <AuthFeedback kind="configuration" /> : null}

          {memberName ? (
            <div>
              <div className="mb-5 flex items-center gap-3 text-sm text-[var(--color-foreground)]">
                <VerifiedIcon className="text-[var(--color-primary)]" aria-hidden="true" />
                <span>{content.auth.connectedAs} <strong>{memberName}</strong></span>
              </div>
              <form action={signOutAction}>
                <AuthSubmitButton mode="sign-out" />
              </form>
            </div>
          ) : (
            <form action={signInAction}>
              <AuthSubmitButton disabled={!discordConfigured} />
            </form>
          )}
        </div>

        <div className="mt-6 flex items-start gap-3 text-xs leading-5 text-[var(--color-foreground-muted)]">
          <LockIcon className="mt-0.5 text-[var(--color-primary-muted)]" aria-hidden="true" />
          <p>{content.auth.privacy}</p>
        </div>
      </section>
    </>
  );
}
