/**
 * Cleans up stale tasks, expert profiles, and experiences from the previous MVP.
 * Run from repo root: pnpm exec ts-node scripts/cleanup-stale-data.ts
 */
import { prisma } from '../packages/db/src';

async function main() {
  const [taskCount, expertCount, experienceCount, leadCount] = await Promise.all([
    prisma.task.count(),
    prisma.expert.count(),
    prisma.experience.count(),
    prisma.lead.count(),
  ]);

  console.log('Before cleanup:');
  console.log({ tasks: taskCount, experts: expertCount, experiences: experienceCount, leads: leadCount });
  console.log('');

  // Delete tasks (they reference experiences + experts)
  const deletedTasks = await prisma.task.deleteMany({});
  console.log(`Deleted ${deletedTasks.count} tasks`);

  // Delete proposals (reference tasks + experts)
  try {
    const deletedProposals = await (prisma as any).expertProposal.deleteMany({});
    console.log(`Deleted ${deletedProposals.count} proposals`);
  } catch { console.log('No proposals table yet, skipping'); }

  // Delete package options
  try {
    const deletedPackages = await (prisma as any).packageOption.deleteMany({});
    console.log(`Deleted ${deletedPackages.count} package options`);
  } catch { console.log('No packageOptions table yet, skipping'); }

  // Delete experiences (reference leads)
  const deletedExperiences = await prisma.experience.deleteMany({});
  console.log(`Deleted ${deletedExperiences.count} experiences`);

  // Delete leads
  const deletedLeads = await prisma.lead.deleteMany({});
  console.log(`Deleted ${deletedLeads.count} leads`);

  // Delete all experts (stale profiles from old MVP)
  const deletedExperts = await prisma.expert.deleteMany({});
  console.log(`Deleted ${deletedExperts.count} experts`);

  // Delete vendor applications
  try {
    const deletedApps = await prisma.vendorApplication.deleteMany({});
    console.log(`Deleted ${deletedApps.count} vendor applications`);
  } catch { console.log('No vendorApplications, skipping'); }

  console.log('\nDone. DB is clean.');
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
