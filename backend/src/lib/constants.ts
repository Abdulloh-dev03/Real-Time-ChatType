export const CONST = {
  READ: "read" as const,
  DELIVERED: "delivered" as const,
  SENT: "sent" as const,
} as const;

export type MessageStatus = (typeof CONST)[keyof typeof CONST];

export const AUTH_STATE = {
  NOT_AUTHENTICATED: "NOT_AUTHENTICATED" as const,
  AUTHENTICATED_BUT_NOT_VERIFIED: "AUTHENTICATED_BUT_NOT_VERIFIED" as const,
  FULLY_AUTHENTICATED: "FULLY_AUTHENTICATED" as const,
} as const;

export type AuthState = (typeof AUTH_STATE)[keyof typeof AUTH_STATE];
