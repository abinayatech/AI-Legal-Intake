-- =====================================================================
-- Migration: 004_storage_rls_documents.sql
-- Purpose:   Allow the anonymous (public) role to INSERT files into the
--            `documents` Storage bucket so that the intake form — which
--            runs without authentication — can upload client files.
--
--            The backend (intakeCtrl.js) uses the service-role key and
--            already bypasses RLS. This policy covers the frontend path
--            where the anon Supabase client does the Storage upload
--            directly.
--
--            Safe to run multiple times — uses CREATE POLICY IF NOT EXISTS
--            equivalents via DROP IF EXISTS + CREATE.
-- =====================================================================

-- ── 1. Ensure the bucket exists (no-op if already created in the UI) ──
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ── 2. Allow anyone (anon + authenticated) to upload files ────────────
-- Intake is a public form; uploaders are not authenticated.
DROP POLICY IF EXISTS "documents_insert_anon"   ON storage.objects;
DROP POLICY IF EXISTS "documents_insert_auth"   ON storage.objects;
DROP POLICY IF EXISTS "documents_select_public" ON storage.objects;
DROP POLICY IF EXISTS "documents_delete_auth"   ON storage.objects;

-- Public read (bucket is public, but the policy is needed for RLS)
CREATE POLICY "documents_select_public"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'documents');

-- Anonymous upload  (intake form — no session)
CREATE POLICY "documents_insert_anon"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'documents');

-- Authenticated upload (admin/attorney uploading additional evidence)
CREATE POLICY "documents_insert_auth"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

-- Authenticated delete (admin cleanup)
CREATE POLICY "documents_delete_auth"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents');

-- ── 3. Enable RLS on storage.objects (idempotent) ─────────────────────
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
