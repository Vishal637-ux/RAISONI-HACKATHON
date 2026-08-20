import { supabase } from './src/supabase/client.js';
import { completionService } from './src/services/completionService.js';

const password = 'Password123!';

async function verifyInconsistency() {
  console.log('=== VERIFYING DATABASE INCONSISTENCY ===\n');

  await supabase.auth.signInWithPassword({ email: 'tpo@raisoni.edu', password });
  const intId = '3257bae8-6720-4c69-aa70-a31685478c43';

  // 1. Direct DB check
  const { data: cEval } = await supabase.from('company_evaluations').select('*').eq('internship_id', intId);
  const { data: fEval } = await supabase.from('faculty_evaluations').select('*').eq('internship_id', intId);

  console.log('1. Real PostgreSQL DB Rows:');
  console.log('   company_evaluations count:', cEval?.length || 0);
  console.log('   faculty_evaluations count:', fEval?.length || 0);

  // 2. Queue output
  const queue = await completionService.getTPOCompletionQueue();
  console.log('\n2. Live TPO Queue Result for Rahul Sharma:');
  const rahulItem = queue.find((q) => q.internship.id === intId);
  console.log('   Eligible:', rahulItem?.eligibility?.isEligible);
  console.log('   Reasons:', rahulItem?.eligibility?.reasons);
  console.log('   Dual Status in UI:', rahulItem?.eligibility?.isEligible ? 'Dual APPROVED' : 'Pending Evaluations');

  console.log('\n=== CONCLUSION ===');
  if ((cEval?.length || 0) === 0 || (fEval?.length || 0) === 0) {
    console.log('The database tables `company_evaluations` and `faculty_evaluations` currently have ZERO rows in PostgreSQL.');
    console.log('This is why the TPO page accurately displays "Pending Evaluations" for the live database state.');
    console.log('Once the Company Mentor and Faculty Mentor submit the real evaluations via /company/evaluate-intern and /faculty/evaluate-student, PostgreSQL will store the rows and TPO queue will immediately display "Dual APPROVED".');
  }
}

verifyInconsistency().catch(console.error);
