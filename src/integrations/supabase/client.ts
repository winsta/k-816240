// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jwegwufuaaguubjfrptc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3ZWd3dWZ1YWFndXViamZycHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3MzIxMjEsImV4cCI6MjA1NDMwODEyMX0.veJmtRJJqKu75St8E2tZecXXVo2YdY_bFsUsEiIr9rk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);