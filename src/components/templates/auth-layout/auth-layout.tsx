export function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="login-shell min-h-dvh overflow-hidden">
      <div className="login-grid mx-auto grid min-h-dvh w-full max-w-[1440px] items-center px-5 py-8 sm:px-8 lg:grid-cols-[1.18fr_0.82fr] lg:px-12 xl:px-20">
        {children}
      </div>
    </main>
  );
}
