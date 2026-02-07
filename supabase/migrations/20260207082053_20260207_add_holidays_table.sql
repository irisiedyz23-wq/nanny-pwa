/*
  # Add holidays table for 2026 holidays with rate multipliers

  1. New Tables
    - `holidays`
      - `id` (uuid, primary key)
      - `date` (date, unique)
      - `name` (text) - holiday name
      - `on_shift_multiplier` (decimal) - rate multiplier for on-shift days
      - `off_shift_multiplier` (decimal) - rate multiplier for off-shift days (paid leave)

  2. Security
    - Enable RLS on `holidays` table
    - Add policy for authenticated users to read holidays

  3. Data
    - Inserts 2026 holidays:
      - Jan 1: New Year (double for on-shift, normal for off-shift)
      - Feb 16-19: Chinese New Year (triple for on-shift, normal for off-shift)
      - Apr 4: Qingming Festival (double for on-shift, normal for off-shift)
      - May 1-2: Labour Day (double for on-shift, normal for off-shift)
      - Jun 19: Dragon Boat Festival (double for on-shift, normal for off-shift)
*/

CREATE TABLE IF NOT EXISTS holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  name text NOT NULL,
  on_shift_multiplier decimal(3,1) NOT NULL DEFAULT 1,
  off_shift_multiplier decimal(3,1) NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read holidays"
  ON holidays
  FOR SELECT
  USING (true);

INSERT INTO holidays (date, name, on_shift_multiplier, off_shift_multiplier) VALUES
  ('2026-01-01', 'New Year', 2.0, 1.0),
  ('2026-02-16', 'Chinese New Year', 3.0, 1.0),
  ('2026-02-17', 'Chinese New Year', 3.0, 1.0),
  ('2026-02-18', 'Chinese New Year', 3.0, 1.0),
  ('2026-02-19', 'Chinese New Year', 3.0, 1.0),
  ('2026-04-04', 'Qingming Festival', 2.0, 1.0),
  ('2026-05-01', 'Labour Day', 2.0, 1.0),
  ('2026-05-02', 'Labour Day', 2.0, 1.0),
  ('2026-06-19', 'Dragon Boat Festival', 2.0, 1.0)
ON CONFLICT (date) DO NOTHING;