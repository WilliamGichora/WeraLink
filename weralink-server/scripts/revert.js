import prisma from '../config/prisma.js';

async function revertAssignment() {
  const assignmentId = '23dcf0a8-f450-4d0d-965a-4a8fbfdbffef';
  
  try {
    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        status: 'SUBMITTED',
        approvedAt: null,
        autoApproveAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) 
      }
    });
    console.log('Successfully reverted assignment to SUBMITTED:', updated.id);
  } catch (error) {
    console.error('Error reverting assignment:', error);
  } finally {
    await prisma.$disconnect();
  }
}

revertAssignment();
