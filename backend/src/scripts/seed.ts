import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
// We need to create users through Better Auth so passwords hash correctly,
// not through Prisma directly.
import { prismaAdapter } from "better-auth/adapters/prisma";

const db = new PrismaClient();

const auth = betterAuth({
    database: prismaAdapter(db, { provider: "postgresql" }),
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:4000",
    emailAndPassword: { enabled: true, requireEmailVerification: false },
});

async function main() {
    console.log("🌱 Seeding NEXA demo data…");

    const email = "demo-owner@nexa.local";
    const password = "Password123";

    // Idempotent: skip if the user already exists.
    const existing = await db.user.findUnique({ where: { email } });
    let userId: string;

    if (existing) {
        console.log("   User exists, reusing:", email);
        userId = existing.id;
    } else {
        const result = await auth.api.signUpEmail({
            body: { email, password, name: "NEXA Demo Owner" },
        });
        userId = result.user.id;
        console.log("   Created user:", email);
    }

    // Find or create the demo org
    let org = await db.organization.findFirst({
        where: { slug: "nexa-demo" },
    });

    if (!org) {
        org = await db.organization.create({
            data: {
                id: crypto.randomUUID(),        // Better Auth models have String @id
                name: "NEXA Demo Org",
                slug: "nexa-demo",
                createdAt: new Date(),
            },
        });
        console.log("   Created org:", org.name);
    } else {
        console.log("   Org exists:", org.name);
    }

    // Ensure membership row exists with owner role
    const member = await db.member.findFirst({
        where: { userId, organizationId: org.id },
    });

    if (!member) {
        await db.member.create({
            data: {
                id: crypto.randomUUID(),
                userId,
                organizationId: org.id,
                role: "owner",
                createdAt: new Date(),
            },
        });
        console.log("   Created membership: owner");
    }

    // ── Clients ─────────────────────────────────────────────
    const clientsData = [
        { name: "Acme Logistics", email: "ops@acme.local", company: "Acme Logistics LLC" },
        { name: "Brightside Studio", email: "hello@brightside.local", company: "Brightside Studio" },
        { name: "Cobalt Payroll", email: "ar@cobalt.local", company: "Cobalt Payroll Inc." },
    ];

    const clients = [];
    for (const c of clientsData) {
        const existing = await db.client.findFirst({
            where: { organizationId: org.id, email: c.email },
        });
        const row = existing ?? await db.client.create({
            data: {
                organizationId: org.id,
                createdById: userId,
                name: c.name,
                email: c.email,
                company: c.company,
                status: "ACTIVE",
            },
        });
        clients.push(row);
    }
    console.log(`   Clients: ${clients.length}`);

    // ── Projects ────────────────────────────────────────────
    const projectsData = [
        { clientIdx: 0, name: "Payroll automation rollout", status: "ACTIVE", priority: "HIGH" },
        { clientIdx: 1, name: "Marketing site rebuild", status: "PLANNING", priority: "MEDIUM" },
        { clientIdx: 2, name: "Accounting dashboard v2", status: "ACTIVE", priority: "URGENT" },
    ];

    const projects = [];
    for (const p of projectsData) {
        const client = clients[p.clientIdx];
        if (!client) continue;
        const existing = await db.project.findFirst({
            where: { organizationId: org.id, clientId: client.id, name: p.name },
        });
        const row = existing ?? await db.project.create({
            data: {
                organizationId: org.id,
                clientId: client.id,
                createdById: userId,
                name: p.name,
                status: p.status as any,
                priority: p.priority as any,
            },
        });
        projects.push(row);
    }
    console.log(`   Projects: ${projects.length}`);

    // ── Tasks ───────────────────────────────────────────────
    const tasksData = [
        { projectIdx: 0, title: "Map current payroll process", status: "COMPLETED" },
        { projectIdx: 0, title: "Draft automation spec", status: "IN_PROGRESS" },
        { projectIdx: 0, title: "Vendor API integration", status: "TODO" },
        { projectIdx: 1, title: "Content audit", status: "TODO" },
        { projectIdx: 1, title: "Design system tokens", status: "IN_PROGRESS" },
        { projectIdx: 2, title: "Wireframe charts", status: "REVIEW" },
        { projectIdx: 2, title: "Build summary API", status: "TODO" },
    ];

    let taskCount = 0;
    for (const t of tasksData) {
        const project = projects[t.projectIdx];
        if (!project) continue;
        const existing = await db.task.findFirst({
            where: { organizationId: org.id, projectId: project.id, title: t.title },
        });
        if (!existing) {
            await db.task.create({
                data: {
                    organizationId: org.id,
                    projectId: project.id,
                    createdById: userId,
                    assignedToId: userId,
                    title: t.title,
                    status: t.status as any,
                },
            });
            taskCount++;
        }
    }
    console.log(`   Tasks created: ${taskCount}`);

    console.log("✅ Seed complete.");
}

main()
    .catch((err) => {
        console.error("❌ Seed failed:", err);
        process.exit(1);
    })
    .finally(() => db.$disconnect());