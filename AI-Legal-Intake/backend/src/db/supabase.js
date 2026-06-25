// backend/src/db/supabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Service-role client — full DB access, bypasses RLS.
// Used by controllers/services for trusted server-side reads/writes
// (e.g. admin.updateUserById, profile lookups by id).
// Never expose this key to the frontend.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default supabase;