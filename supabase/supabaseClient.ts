import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://prkrgozvwnyqgrouqlbf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBya3Jnb3p2d255cWdyb3VxbGJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNzQxMjMsImV4cCI6MjA2NTk1MDEyM30.xeS9Dozsd9rgxDq92x6R7N9ah2GxuRFG8PC0V_HNsRg",
);
