/**
 * Enhanced TypeScript types for Better Auth integration.
 *
 * Provides improved type inference for the Better Auth instance,
 * including session/user types, API methods, and error codes.
 */ /**
 * Payload endpoint type with Better Auth context.
 *
 * Use this for custom endpoints that need access to Better Auth.
 *
 * @template O - Better Auth options type for inference
 *
 * @example
 * ```ts
 * const myEndpoint: EndpointWithBetterAuth<typeof myOptions> = {
 *   path: '/custom-auth',
 *   method: 'post',
 *   handler: async (req) => {
 *     // req.payload.betterAuth is fully typed
 *     const session = await req.payload.betterAuth.api.getSession({
 *       headers: req.headers,
 *     })
 *     return Response.json({ session })
 *   },
 * }
 * ```
 */ export { };
