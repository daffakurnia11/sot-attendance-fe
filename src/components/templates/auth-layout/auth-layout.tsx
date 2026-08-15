export function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[linear-gradient(90deg,rgba(255,255,255,.015)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.012)_1px,transparent_1px),radial-gradient(circle_at_31%_46%,rgba(226,158,38,.13),transparent_32%),linear-gradient(112deg,#070605_0%,#0d0a06_53%,#080706_100%)] bg-[size:72px_72px,72px_72px,auto,auto] before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:hidden before:bg-[linear-gradient(112deg,transparent_49.9%,var(--color-border)_50%,transparent_50.1%)] before:content-[''] sm:before:block">
      <div className="mx-auto grid min-h-dvh w-full max-w-[1440px] content-center items-center px-5 py-8 sm:px-8 lg:grid-cols-[1.18fr_0.82fr] lg:px-12 xl:px-20">
        {children}
      </div>
    </main>
  );
}
