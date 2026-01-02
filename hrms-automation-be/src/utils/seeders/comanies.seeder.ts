import prisma from '../../configs/prisma.client';

export async function seedCompanies() {
  console.log('🏢 Seeding companies...');

  const companyData = {
    name: 'MKX Technologies Pvt Ltd',
    code: 'MKX',
    address: 'Sector 15, Industrial Area',
    city: 'Faridabad',
    state: 'Haryana',
    country: 'India',
    zipcode: '121007',
    phone_number: '+91-129-1234567',
    email: 'info@mkxtech.com',
    website: 'https://www.mkxtech.com',
    logo: null,
    is_active: 'Y',
    created_by: 1,
    updated_by: null,
    log_inst: null,
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_username: 'noreply@mkxtech.com',
    smtp_password: null, // Set this via environment variable in production
  };

  try {
    // Check if company already exists
    const existingCompany = await prisma.companies.findUnique({
      where: { code: companyData.code },
    });

    if (existingCompany) {
      console.log(`   ℹ️  Company "${companyData.name}" already exists`);
      return existingCompany;
    }

    // Create company
    const company = await prisma.companies.create({
      data: companyData,
    });

    console.log(`   ✅ Created company: ${company.name} (ID: ${company.id})`);
    return company;
  } catch (error) {
    console.error('   ❌ Error seeding companies:', error);
    throw error;
  }
}
