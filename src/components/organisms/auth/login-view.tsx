"use client";

import Image from "next/image";

import { LanguageSwitcher, Typography } from "@/components/atoms";
import { LockIcon, VerifiedIcon } from "@/components/icons";
import { useI18n } from "@/i18n";

import { AuthFeedback } from "./auth-feedback";
import { AuthSubmitButton } from "./auth-submit-button";

type LoginViewProps = {
  authError: "authentication" | "member-not-registered" | "service-unavailable" | null;
  authErrorReference?: string;
  discordConfigured: boolean;
  memberName?: string | null;
  signInAction: () => Promise<void>;
  signOutAction: () => Promise<void>;
};

export function LoginView({
  authError,
  authErrorReference,
  discordConfigured,
  memberName,
  signInAction,
  signOutAction,
}: LoginViewProps) {
  const { t } = useI18n();
  return (
    <>
      <LanguageSwitcher className="fixed top-4 right-4 z-30" />
      <section
        className="relative flex min-h-80 flex-col items-center justify-center after:absolute after:bottom-0 after:h-px after:w-[84%] after:bg-[linear-gradient(90deg,transparent,var(--color-border),transparent)] after:content-[''] sm:min-h-[360px] lg:min-h-[760px] lg:after:right-0 lg:after:bottom-auto lg:after:h-[72%] lg:after:w-px lg:after:bg-[linear-gradient(transparent,var(--color-border),transparent)]"
        aria-labelledby="brand-title"
      >
        <div
          className="absolute aspect-square w-[min(74vw,460px)] rounded-full border border-[var(--color-border)] shadow-[inset_0_0_90px_rgba(242,182,61,.04),0_0_80px_rgba(242,182,61,.05)] before:absolute before:inset-[6%] before:rounded-full before:border before:border-[rgba(217,169,80,.1)] before:content-[''] after:absolute after:inset-[14%] after:rounded-full after:border after:border-[rgba(216,58,47,.12)] after:content-[''] lg:w-[min(70vw,590px)]"
          aria-hidden="true"
        />
        <p className="absolute top-2 left-0 hidden text-xs font-bold tracking-[0.34em] text-[var(--color-primary-muted)] uppercase sm:block lg:top-8">
          {t("SOT / Member system")}
        </p>
        <Image
          alt={t("Shade of Triads golden dragon crest")}
          className="relative z-10 h-auto w-[min(68vw,370px)] object-contain [filter:drop-shadow(0_32px_42px_rgba(0,0,0,.7))_saturate(.9)_contrast(1.04)] lg:w-[370px]"
          height={1230}
          priority
          src="/sot-logo.png"
          width={1105}
        />
        <div className="relative z-20 mt-4 max-w-[80%] self-start sm:absolute sm:bottom-4 sm:left-0 sm:mt-0 sm:max-w-none lg:bottom-10">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.28em] text-[var(--color-danger)]">
            {t("FiveM Roleplay Community")}
          </p>
          <Typography as="h2" id="brand-title" className="text-2xl sm:text-3xl" variant="heading">
            Shade of Triads
          </Typography>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-[480px] py-10 before:absolute before:-top-[34px] before:-left-10 before:hidden before:h-[70px] before:w-[70px] before:border-t before:border-l before:border-[var(--color-border)] before:content-[''] sm:before:block lg:ml-auto lg:py-0">
        <div className="mb-8 flex items-center gap-4 text-xs font-bold tracking-[0.28em] text-[var(--color-primary-muted)] uppercase">
          <span>01</span>
          <span className="h-px flex-1 bg-[var(--color-border)]" />
          <span>{t("Secure access")}</span>
        </div>

        <div>
          <Typography className="mb-5 inline-flex items-center gap-2 text-xs" variant="eyebrow">
            <LockIcon aria-hidden="true" /> {t("Member gateway")}
          </Typography>
          <Typography as="h1" className="max-w-md text-5xl leading-[0.92] sm:text-6xl" variant="display">
            {t("Enter the attendance hall.")}
          </Typography>
          <Typography className="mt-6 max-w-md text-[15px] sm:text-base">
            {t("Verify your community identity through Discord. No password, no separate account.")}
          </Typography>
        </div>

        <div className="mt-10 border-y border-[var(--color-border)] py-7">
          {authError ? <AuthFeedback kind={authError} reference={authErrorReference} /> : null}
          {!discordConfigured ? <AuthFeedback kind="configuration" /> : null}

          {memberName ? (
            <div>
              <div className="mb-5 flex items-center gap-3 text-sm text-[var(--color-foreground)]">
                <VerifiedIcon className="text-[var(--color-primary)]" aria-hidden="true" />
                <span>
                  {t("Connected as")} <strong>{memberName}</strong>
                </span>
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
          <p>{t("Discord handles authentication. SOT never receives or stores your Discord password.")}</p>
        </div>
      </section>
    </>
  );
}
