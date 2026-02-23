-- Add claim_notes column to items table if it doesn't exist
ALTER TABLE items ADD COLUMN IF NOT EXISTS claim_notes TEXT;
