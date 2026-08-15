// Container liveness probe for the Dockerfile HEALTHCHECK and the deploy job.
// Deliberately free of imports: pulling in auth or env.server would make the
// probe fail for reasons that have nothing to do with the server being up, and
// would report a misconfigured secret as a dead container.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
}
