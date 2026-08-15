export { auth as proxy } from "@/auth";

export const config = {
  // api/health is excluded so the container healthcheck reaches the route
  // itself. Left in, the authorized callback would redirect the unauthenticated
  // probe to "/", wget would follow it to a 200, and a broken app would still
  // report healthy.
  matcher: ["/((?!api/auth|api/health|_next/static|_next/image|favicon.ico|sot-logo.png).*)"],
};
