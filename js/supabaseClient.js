// Supabase client, shared by the game and the leaderboard page.
//
// The URL and anon key below are PUBLIC by design: Supabase expects them to
// ship in client code, and Row Level Security (see supabase/schema.sql) is
// what actually protects the data. Never put the service_role key here.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://xqunngucvuduebzhihwj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxdW5uZ3VjdnVkdWViemhpaHdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMzE2MjIsImV4cCI6MjEwNDgwNzYyMn0.m6mjLDMDWzbT1komBpLKNjBtzv2oDLpWf47euJ_yrns";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
