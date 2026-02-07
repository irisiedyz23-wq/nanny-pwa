/*
  # Fix RLS policy for anon users

  Allow anon users to read and modify work records without authentication
*/

DROP POLICY IF EXISTS "Allow all access to work_records" ON work_records;

CREATE POLICY "Allow all access to work_records"
  ON work_records
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to insert work_records"
  ON work_records
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon to update work_records"
  ON work_records
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon to delete work_records"
  ON work_records
  FOR DELETE
  TO anon
  USING (true);