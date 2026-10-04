import { useEffect, useRef } from "react";
import { authClient, useSession } from "@/lib/auth-client";

/**
 * Ensures the session always has an active organization.
 * Runs once per signed-in session. If the user has any membership,
 * the first one is set as active automatically.
 */
export function ActivateOrg() {
    const { data } = useSession();
    const done = useRef(false);

    useEffect(() => {
        if (!data?.user || done.current) return;

        (async () => {
            try {
                // 1. Check if there's already an active org on the session.
                const active = await authClient.organization.getActiveMember();
                if ((active as any).data) {
                    done.current = true;
                    return;
                }

                // 2. Otherwise pick the user's first organization.
                const list = await authClient.organization.list();
                const orgs = (list as any).data ?? [];
                const first = orgs[0];
                if (!first) {
                    done.current = true; // no orgs — nothing to activate
                    return;
                }

                await authClient.organization.setActive({ organizationId: first.id });
                done.current = true;

                // Refresh so subsequent calls (team page, invites) see the active org.
                window.dispatchEvent(new Event("focus"));
            } catch (err) {
                console.warn("[activate-org] failed", err);
            }
        })();
    }, [data?.user]);

    return null;
}