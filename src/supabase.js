import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'ضع_PROJECT_URL_هنا';
const SUPABASE_KEY = 'ضع_PUBLISHABLE_KEY_هنا';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
