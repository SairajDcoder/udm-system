const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL="?([^"\n]+)"?/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY="?([^"\n]+)"?/);

const url = urlMatch ? urlMatch[1] : null;
const key = keyMatch ? keyMatch[1] : null;

if (!url || !key) {
  console.error("Missing URL or KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

async function checkUsers() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("Error fetching users:", error);
  } else {
    console.log("Users:", data.users.map(u => ({
      id: u.id,
      email: u.email,
      confirmed_at: u.email_confirmed_at,
      last_sign_in_at: u.last_sign_in_at,
      created_at: u.created_at
    })));
  }
}

checkUsers();
