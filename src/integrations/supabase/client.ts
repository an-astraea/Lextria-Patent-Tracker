
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://afjnaobrkqxejmztqyhd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmam5hb2Jya3F4ZWptenRxeWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMDA3OTEsImV4cCI6MjA1Njc3Njc5MX0.zOz-qXNc_eMOqE63uzwLNovVIBXDoBjhiKteu8YOK-E";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
