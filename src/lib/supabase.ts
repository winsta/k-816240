import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iqrvskldidbjpuweuoft.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxcnZza2xkaWRianB1d2V1b2Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA2OTc1NzAsImV4cCI6MjAyNjI3MzU3MH0.Hs-Nx0HHOVzGWoFl6KxHVzm2iQz9rYOPYbkI4mXvIYY';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});