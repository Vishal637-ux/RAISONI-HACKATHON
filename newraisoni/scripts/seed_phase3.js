import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jseihmoupjkrptuwydyo.supabase.co';
const supabaseKey = 'sb_publishable_SEEp28Op-JNAgKEZC82OTg_bPys1i1l';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedPhase3() {
  console.log('=== STEP 2: SEED COMPANY MENTOR FOR PHASE 3 ===\n');

  // 1. Authenticate as admin@raisoni.edu to seed structural records safely under RLS
  const { data: adminAuth, error: adminAuthErr } = await supabase.auth.signInWithPassword({
    email: 'admin@raisoni.edu',
    password: 'Password123!',
  });

  if (adminAuthErr) {
    console.error('Failed to sign in as admin@raisoni.edu:', adminAuthErr.message);
    process.exit(1);
  }

  console.log('Authenticated admin user:', adminAuth.user.email);

  // 2. Fetch the company mentor's user_id from public.users for company@raisoni.edu
  const { data: mentorUser, error: userErr } = await supabase
    .from('users')
    .select('id, role, email')
    .eq('email', 'company@raisoni.edu')
    .single();

  if (userErr || !mentorUser) {
    console.error('Failed to find company@raisoni.edu user record:', userErr?.message);
    process.exit(1);
  }

  const mentorUserId = mentorUser.id;
  console.log('Company mentor user found in DB:', mentorUser.email, 'ID:', mentorUserId, 'Role:', mentorUser.role);

  // 3. Check if company_mentors entry already exists for this user
  const { data: existingMentor, error: mentorCheckErr } = await supabase
    .from('company_mentors')
    .select('*')
    .eq('user_id', mentorUserId)
    .maybeSingle();

  let companyId;

  if (existingMentor) {
    companyId = existingMentor.company_id;
    console.log('Company mentor link already exists. company_id:', companyId);
  } else {
    // Check if default company exists or create one
    const { data: existingCompanies, error: coErr } = await supabase
      .from('companies')
      .select('*')
      .limit(1);

    if (!coErr && existingCompanies && existingCompanies.length > 0) {
      companyId = existingCompanies[0].id;
      console.log('Using existing company:', existingCompanies[0].company_name, 'ID:', companyId);
    } else {
      // Insert company as admin
      const { data: newCompany, error: createCoErr } = await supabase
        .from('companies')
        .insert({
          company_name: 'TechCorp Solutions',
          industry: 'Information Technology',
          website: 'https://techcorp.example.com',
          address: 'Nagpur IT Park, Maharashtra',
        })
        .select()
        .single();

      if (createCoErr) {
        console.error('Failed to create company as admin:', createCoErr.message);
        process.exit(1);
      }
      companyId = newCompany.id;
      console.log('Created company:', newCompany.company_name, 'ID:', companyId);
    }

    // Insert company_mentors entry
    const { data: newMentor, error: createMentorErr } = await supabase
      .from('company_mentors')
      .insert({
        user_id: mentorUserId,
        company_id: companyId,
        designation: 'Senior Technical Lead',
      })
      .select()
      .single();

    if (createMentorErr) {
      console.error('Failed to insert company_mentors row:', createMentorErr.message);
      process.exit(1);
    }

    console.log('Successfully created company_mentors entry:', JSON.stringify(newMentor, null, 2));
  }

  await supabase.auth.signOut();

  // 4. Now authenticate as company@raisoni.edu and test resolving company_id & posting INSERT
  console.log('\n--- VERIFYING COMPANY MENTOR PERMISSIONS ---');
  const { data: mentorAuth, error: mentorAuthErr } = await supabase.auth.signInWithPassword({
    email: 'company@raisoni.edu',
    password: 'Password123!',
  });

  if (mentorAuthErr) {
    console.error('Company mentor login verification failed:', mentorAuthErr.message);
    process.exit(1);
  }

  // Check company resolution
  const { data: fetchedMentor, error: fetchErr } = await supabase
    .from('company_mentors')
    .select('*, companies(*)')
    .eq('user_id', mentorAuth.user.id)
    .single();

  if (fetchErr || !fetchedMentor) {
    console.error('Failed to fetch company_mentors row as company@raisoni.edu:', fetchErr?.message);
    process.exit(1);
  }

  console.log('Company Mentor profile resolved successfully:');
  console.log(' - Company ID:', fetchedMentor.company_id);
  console.log(' - Company Name:', fetchedMentor.companies?.company_name);

  // Test posting creation RLS
  const { data: testPosting, error: postingErr } = await supabase
    .from('internship_postings')
    .insert({
      company_id: fetchedMentor.company_id,
      title: 'SEED_VERIFICATION_POSTING',
      description: 'Temporary verification posting',
      duration: '3 Months',
      mode: 'Remote',
      stipend: '10000/mo',
      vacancies: 2,
      work_location: 'Remote',
      min_cgpa: 6.0,
      eligible_departments: JSON.stringify(['Computer Science']),
      deadline: new Date(Date.now() + 864000000).toISOString().split('T')[0],
      status: 'Closed',
    })
    .select()
    .single();

  if (postingErr) {
    console.error('internship_postings INSERT RLS check failed:', postingErr.message);
    process.exit(1);
  }

  console.log('internship_postings INSERT RLS check passed! Posting ID:', testPosting.id);

  // Cleanup test posting
  await supabase.from('internship_postings').delete().eq('id', testPosting.id);
  console.log('Cleaned up test posting.');

  await supabase.auth.signOut();
  console.log('\n=== STEP 2 COMPLETE: SEEDING SUCCESSFUL & VERIFIED ===');
}

seedPhase3().catch((err) => {
  console.error('Unhandled seed error:', err);
  process.exit(1);
});
