-- Add missing admin module tables without destructive changes
-- Safe migration principles:
-- 1) CREATE IF NOT EXISTS
-- 2) No DROP/ALTER of existing business tables
-- 3) Additive indexes and constraints only

-- =====================================================
-- attendance_records
-- =====================================================
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id UUID NOT NULL,
  user_id UUID NOT NULL,
  meeting_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
  marked_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'attendance_records_house_id_fkey'
      AND conrelid = 'public.attendance_records'::regclass
  ) THEN
    ALTER TABLE public.attendance_records
      ADD CONSTRAINT attendance_records_house_id_fkey
      FOREIGN KEY (house_id)
      REFERENCES public.core_houses(id)
      ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'attendance_records_user_id_fkey'
      AND conrelid = 'public.attendance_records'::regclass
  ) THEN
    ALTER TABLE public.attendance_records
      ADD CONSTRAINT attendance_records_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES public.users_profile(id)
      ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'attendance_records_marked_by_fkey'
      AND conrelid = 'public.attendance_records'::regclass
  ) THEN
    ALTER TABLE public.attendance_records
      ADD CONSTRAINT attendance_records_marked_by_fkey
      FOREIGN KEY (marked_by)
      REFERENCES public.users_profile(id)
      ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'attendance_records_house_user_meeting_unique'
      AND conrelid = 'public.attendance_records'::regclass
  ) THEN
    ALTER TABLE public.attendance_records
      ADD CONSTRAINT attendance_records_house_user_meeting_unique
      UNIQUE (house_id, user_id, meeting_date);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_attendance_records_house_id
  ON public.attendance_records(house_id);

CREATE INDEX IF NOT EXISTS idx_attendance_records_user_id
  ON public.attendance_records(user_id);

CREATE INDEX IF NOT EXISTS idx_attendance_records_meeting_date
  ON public.attendance_records(meeting_date DESC);

-- =====================================================
-- approval_requests
-- =====================================================
CREATE TABLE IF NOT EXISTS public.approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type TEXT NOT NULL CHECK (
    request_type IN ('category_opening', 'member_removal', 'role_assignment', 'membership_change', 'suspension')
  ),
  subject_user_id UUID NOT NULL,
  requested_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  remarks TEXT,
  metadata JSONB,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'approval_requests_subject_user_id_fkey'
      AND conrelid = 'public.approval_requests'::regclass
  ) THEN
    ALTER TABLE public.approval_requests
      ADD CONSTRAINT approval_requests_subject_user_id_fkey
      FOREIGN KEY (subject_user_id)
      REFERENCES public.users_profile(id)
      ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'approval_requests_requested_by_fkey'
      AND conrelid = 'public.approval_requests'::regclass
  ) THEN
    ALTER TABLE public.approval_requests
      ADD CONSTRAINT approval_requests_requested_by_fkey
      FOREIGN KEY (requested_by)
      REFERENCES public.users_profile(id)
      ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'approval_requests_approved_by_fkey'
      AND conrelid = 'public.approval_requests'::regclass
  ) THEN
    ALTER TABLE public.approval_requests
      ADD CONSTRAINT approval_requests_approved_by_fkey
      FOREIGN KEY (approved_by)
      REFERENCES public.users_profile(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_approval_requests_status
  ON public.approval_requests(status);

CREATE INDEX IF NOT EXISTS idx_approval_requests_subject_user_id
  ON public.approval_requests(subject_user_id);

CREATE INDEX IF NOT EXISTS idx_approval_requests_requested_by
  ON public.approval_requests(requested_by);

CREATE INDEX IF NOT EXISTS idx_approval_requests_created_at
  ON public.approval_requests(created_at DESC);

COMMENT ON TABLE public.attendance_records IS 'Attendance entries per member, house, and meeting date for admin module';
COMMENT ON TABLE public.approval_requests IS 'Approval workflow requests for category opening, member actions, and role/membership changes';