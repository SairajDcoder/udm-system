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

async function test() {
  const { data, error } = await supabase
    .from('unichain_state')
    .select('*')
    .eq('id', 'main')
    .single();

  if (error) {
    console.error("Error fetching from Supabase:", error);
  } else {
    console.log("Success! Data fetched:", data);
  }
}

test();
