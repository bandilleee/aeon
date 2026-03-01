/**
 * Role type for authorization
 * This matches what your backend sends
 */
export type Role = "admin" | "member" | "community_leader" | "moderator" | "viewer";

/**
 * Re-export everything from user.types for convenience
 */
export * from "./user.types";