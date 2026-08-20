import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jseihmoupjkrptuwydyo.supabase.co';
const supabaseKey = 'sb_publishable_SEEp28Op-JNAgKEZC82OTg_bPys1i1l';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRls() {
  const { data: auth } = await supabase.auth.signInWithPassword({
    email: 'company@raisoni.edu',
    password: 'Password123!',
  });

  const { data: mentor } = await supabase.from('company_mentors').select('*').eq('user_id', auth.user.id).single();
  console.log('Mentor row:', mentor);

  const { data: rpcRes, error: rpcErr } = await supabase.rpc('get_company_mentor_company_id', { user_uuid: auth.user.id });
  console.log('RPC get_company_mentor_company_id:', rpcRes, 'Error:', rpcErr ? rpcErr.message : 'none');

  await supabase.auth.signOut();
}

testRls().catch(console.error);
