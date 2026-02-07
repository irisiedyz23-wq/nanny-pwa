/*
  # Create work records table

  1. New Tables
    - `work_records`
      - `id` (uuid, primary key) - Unique identifier for each record
      - `date` (date) - The date of the work record
      - `period` (text) - Either 'AM' or 'PM'
      - `is_working` (boolean) - Whether the nanny is working during this period
      - `created_at` (timestamptz) - Timestamp when record was created
      - `updated_at` (timestamptz) - Timestamp when record was last updated

  2. Security
    - Enable RLS on `work_records` table
    - Add policy for public access (single user app, no auth required)
    - Unique constraint on date + period combination to prevent duplicates

  3. Notes
    - This table stores working status for each AM/PM block per day
    - Used to calculate total working days and salary
*/

CREATE TABLE IF NOT EXISTS work_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  period text NOT NULL CHECK (period IN ('AM', 'PM')),
  is_working boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique constraint to prevent duplicate records for same date/period
CREATE UNIQUE INDEX IF NOT EXISTS work_records_date_period_idx ON work_records(date, period);

-- Enable RLS
ALTER TABLE work_records ENABLE ROW LEVEL SECURITY;

-- Allow all operations for everyone (single user app)
CREATE POLICY "Allow all access to work_records"
  ON work_records
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);