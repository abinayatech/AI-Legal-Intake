const supabase = require('../db/supabase')

/**
 * getProfileById
 * Fetches a single profile row by auth user id.
 */
async function getProfileById(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, phone, role, avatar_url, created_at, updated_at')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

/**
 * updateProfile
 * Updates the editable profile fields for a user.
 * Role is intentionally excluded — never settable from this path.
 */
async function updateProfile(userId, updates) {
  const allowedFields = ['name', 'phone', 'avatar_url']
  const payload = {}

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      payload[field] = updates[field]
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select('id, name, email, phone, role, avatar_url, created_at, updated_at')
    .single()

  if (error) throw error
  return data
}

/**
 * changePassword
 * Updates the Supabase Auth password for the given user via the
 * admin API (service-role client). Requires the caller to already be
 * authenticated as that user — the controller verifies the current
 * password before calling this.
 */
async function changePassword(userId, newPassword) {
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
  })

  if (error) throw error
  return data
}

/**
 * verifyCurrentPassword
 * Confirms the user's existing password is correct before allowing a
 * change, by attempting a sign-in with it via the anon client.
 */
async function verifyCurrentPassword(email, currentPassword) {
  const { createClient } = require('@supabase/supabase-js')
  const supabaseAnon = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  )

  const { error } = await supabaseAnon.auth.signInWithPassword({
    email,
    password: currentPassword,
  })

  return !error
}

module.exports = {
  getProfileById,
  updateProfile,
  changePassword,
  verifyCurrentPassword,
}