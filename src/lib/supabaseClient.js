import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igxdgvxcfiucrlqizrhj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlneGRndnhjZml1Y3JscWl6cmhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0Mjk3MDAsImV4cCI6MjA2NTAwNTcwMH0.xq4xssRoA_htevIxVwopXzEdud3ajQ9FJqf_PmozMjc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);