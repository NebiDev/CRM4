import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_AUTH_URL ?? "http://localhost:4000",
    plugins: [organizationClient()],
});

export const {
    useSession,
    signIn,
    signUp,
    signOut,
} = authClient;