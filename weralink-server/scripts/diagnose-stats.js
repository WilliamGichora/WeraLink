import prisma from '../config/prisma.js';

async function diagnose() {
  try {
    console.log('--- Platform Health Diagnosis ---');
    
    const workerCount = await prisma.user.count({ where: { role: 'WORKER' } });
    const verifiedProfileCount = await prisma.user.count({ 
      where: { role: 'WORKER', profile: { verified: true } } 
    });
    const verifiedSkillCount = await prisma.user.count({
      where: { role: 'WORKER', skills: { some: { verified: true } } }
    });
    const bothCount = await prisma.user.count({
      where: { 
        role: 'WORKER', 
        OR: [
          { profile: { verified: true } },
          { skills: { some: { verified: true } } }
        ]
      }
    });

    console.log(`Total Workers: ${workerCount}`);
    console.log(`Workers with Verified Profiles: ${verifiedProfileCount}`);
    console.log(`Workers with Verified Skills: ${verifiedSkillCount}`);
    console.log(`Combined (OR) Verified: ${bothCount}`);

    // Details for top worker
    const workers = await prisma.user.findMany({
        where: { role: 'WORKER' },
        include: { profile: true, skills: true }
    });
    
    workers.forEach(w => {
        console.log(`- Worker: ${w.name} (ID: ${w.id})`);
        console.log(`  Profile Verified: ${w.profile?.verified}`);
        console.log(`  Skills Count: ${w.skills.length}`);
        console.log(`  Verified Skills: ${w.skills.filter(s => s.verified).length}`);
    });

    const gigCounts = await prisma.gig.groupBy({
        by: ['status'],
        _count: { id: true }
    });
    console.log('\nGig Statuses:', gigCounts);

  } catch (error) {
    console.error('Diagnosis failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
