
import { db } from "../config/db.js";

async function main() {
    const users = await db.user.count();
    const orgs = await db.organization.count();

    console.log("✅ Prisma + Better Auth tables reachable");
    console.log("   users →", users);
    console.log("   organizations →", orgs);

    await db.$disconnect();
}

main().catch(async (err) => {
    console.error("❌ DB check failed:");
    console.error(err);
    await db.$disconnect();
    process.exit(1);
});

























// import { db } from "../config/db.js";

// async function main() {
//     const rows = await db.$queryRaw<Array<{ result: number }>>`SELECT 1 as result`;
//     const first = rows[0];

//     if (!first || first.result !== 1) {
//         console.error("❌ Unexpected result:", rows);
//         process.exit(1);
//     }

//     const now = await db.$queryRaw<Array<{ now: Date }>>`SELECT NOW() as now`;

//     console.log("✅ Neon connection OK");
//     console.log("   SELECT 1 →", first.result);
//     console.log("   Server time →", now[0]?.now);

//     await db.$disconnect();
// }

// main().catch(async (err) => {
//     console.error("❌ Database ping failed:");
//     console.error(err);
//     await db.$disconnect();
//     process.exit(1);
// });