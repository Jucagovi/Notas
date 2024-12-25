import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  "https://ddnutxxwwabjkvprennr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbnV0eHh3d2Fiamt2cHJlbm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0Mjk3MjgsImV4cCI6MjA1MDAwNTcyOH0.2jOe56aXhcToO6_ajxGQ0uCC-oycp_jiG1rWce86LN8"
);
export default supabase;
