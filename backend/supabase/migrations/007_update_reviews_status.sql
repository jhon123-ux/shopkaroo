-- Alter reviews table to support Pending/Approved/Rejected states via nullable is_approved
-- NULL = Pending
-- TRUE = Approved
-- FALSE = Rejected

ALTER TABLE public.reviews 
  ALTER COLUMN is_approved SET DEFAULT NULL,
  ALTER COLUMN is_approved DROP NOT NULL;

-- Update existing reviews: if they are false, they were "pending" in the old logic.
-- Actually, the old logic used false as pending. So we should keep them as NULL for pending.
UPDATE public.reviews SET is_approved = NULL WHERE is_approved = false;
