import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xsjhddlytszkxpzhrqaq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzamhkZGx5dHN6a3hwemhycWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NzI2ODYsImV4cCI6MjA2NDU0ODY4Nn0.npStSsbV98SqShxXleESK5H-AYdyiLGpG-YTqYbV6-s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);