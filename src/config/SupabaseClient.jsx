import { createClient } from '@supabase/supabase-js';
// const supabaseUrl = 'https://luodxetlpmfirpwxxnlf.supabase.co';
// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_KEY;
// const supabaseKey = process.env.REACT_APP_ANON_KEY; //this is from .env
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY; //this is from .env
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
