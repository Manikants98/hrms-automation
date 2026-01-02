import prisma from '../configs/prisma.client';

export async function getDetails(id: number, type: string) {
  console.log(`Getting details for ${type} with id: ${id}`);

  try {
    switch (type) {
      case 'user':
        return await prisma.users.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            email: true,
            employee_id: true,
            department_id: true,
            designation_id: true,
          },
        });

      case 'department':
        return await prisma.departments.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            code: true,
          },
        });

      case 'company':
        return await prisma.companies.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            code: true,
          },
        });

      default:
        console.log(`Unknown type: ${type}`);
        return null;
    }
  } catch (error) {
    console.error(`Error getting ${type} details:`, error);
    return null;
  }
}
