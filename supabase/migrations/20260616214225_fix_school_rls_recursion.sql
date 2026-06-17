-- Fix infinite recursion between classes / class_enrollments / reward_templates
-- RLS policies. The original cross-table EXISTS checks referenced each other
-- (classes_student_read -> class_enrollments -> enroll_teacher_read -> classes),
-- which Postgres rejects as infinite recursion, making the classes/enrollment
-- reads fail.
--
-- The cross-table membership checks now run through SECURITY DEFINER helper
-- functions that bypass RLS, so policy evaluation no longer re-enters the other
-- table's policies.

CREATE OR REPLACE FUNCTION public.is_class_teacher(p_class_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = '' STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = p_class_id AND c.teacher_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_enrolled_in_class(p_class_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = '' STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_enrollments e
    WHERE e.class_id = p_class_id AND e.student_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_student_of_teacher(p_teacher_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = '' STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_enrollments e
    JOIN public.classes c ON c.id = e.class_id
    WHERE e.student_id = auth.uid() AND c.teacher_id = p_teacher_id
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_class_teacher(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_enrolled_in_class(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_student_of_teacher(uuid) TO authenticated, anon;

DROP POLICY IF EXISTS classes_student_read ON public.classes;
CREATE POLICY classes_student_read ON public.classes
  FOR SELECT USING (public.is_enrolled_in_class(id));

DROP POLICY IF EXISTS enroll_teacher_read ON public.class_enrollments;
CREATE POLICY enroll_teacher_read ON public.class_enrollments
  FOR SELECT USING (public.is_class_teacher(class_id));

DROP POLICY IF EXISTS templates_student_read ON public.reward_templates;
CREATE POLICY templates_student_read ON public.reward_templates
  FOR SELECT USING (
    public.is_student_of_teacher(teacher_id)
    AND (class_id IS NULL OR public.is_enrolled_in_class(class_id))
  );
