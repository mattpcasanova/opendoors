-- Self-service onboarding: each class has a short join code students enter.

ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS join_code text UNIQUE;

-- Generate a unique 6-char code (no ambiguous chars: 0/O/1/I/L excluded).
CREATE OR REPLACE FUNCTION public.generate_class_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  chars text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text;
  i int;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(chars, floor(random() * length(chars))::int + 1, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.classes WHERE join_code = code);
  END LOOP;
  RETURN code;
END;
$$;
REVOKE ALL ON FUNCTION public.generate_class_code() FROM PUBLIC;

-- Backfill existing classes (loop so each sees prior assignments)
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT id FROM public.classes WHERE join_code IS NULL LOOP
    UPDATE public.classes SET join_code = public.generate_class_code() WHERE id = r.id;
  END LOOP;
END $$;

-- Teacher regenerates a class code
CREATE OR REPLACE FUNCTION public.regenerate_class_code(p_class_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE v_code text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.classes WHERE id = p_class_id AND teacher_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized for this class';
  END IF;
  v_code := public.generate_class_code();
  UPDATE public.classes SET join_code = v_code, updated_at = now() WHERE id = p_class_id;
  RETURN v_code;
END;
$$;
REVOKE ALL ON FUNCTION public.regenerate_class_code(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.regenerate_class_code(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.regenerate_class_code(uuid) TO authenticated;

-- Student joins a class by code
CREATE OR REPLACE FUNCTION public.join_class_by_code(p_code text)
RETURNS public.classes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE v_class public.classes;
BEGIN
  SELECT * INTO v_class
  FROM public.classes
  WHERE upper(join_code) = upper(btrim(p_code)) AND is_active = true;

  IF v_class.id IS NULL THEN
    RAISE EXCEPTION 'No class found for that code';
  END IF;

  IF v_class.teacher_id = auth.uid() THEN
    RAISE EXCEPTION 'You are the teacher of this class';
  END IF;

  INSERT INTO public.class_enrollments(class_id, student_id)
  VALUES (v_class.id, auth.uid())
  ON CONFLICT (class_id, student_id) DO NOTHING;

  RETURN v_class;
END;
$$;
REVOKE ALL ON FUNCTION public.join_class_by_code(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.join_class_by_code(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.join_class_by_code(text) TO authenticated;
