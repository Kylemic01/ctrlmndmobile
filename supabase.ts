import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://iciecutonrezzhddnmjv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljaWVjdXRvbnJlenpoZGRubWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Nzk2MzYsImV4cCI6MjA2NjM1NTYzNn0.g0XXOGWQwLMYZTU6UuOEzmq2p3Kb6GvHV9lVFbsp7Jo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 