-- Per-student reward engagement for a teacher's class, so teachers can spot
-- students they haven't rewarded recently and keep things fair.
CREATE OR REPLACE FUNCTION public.get_class_engagement(p_class_id uuid)
RETURNS TABLE (student_id uuid, doors_received bigint, last_door_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.classes c WHERE c.id = p_class_id AND c.teacher_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized for this class';
  END IF;

  RETURN QUERY
  SELECT e.student_id,
         COALESCE(count(dd.id), 0) AS doors_received,
         max(dd.created_at) AS last_door_at
  FROM public.class_enrollments e
  LEFT JOIN public.door_distributions dd
    ON dd.recipient_id = e.student_id AND dd.distributor_id = auth.uid()
  WHERE e.class_id = p_class_id
  GROUP BY e.student_id;
END;
$$;
REVOKE ALL ON FUNCTION public.get_class_engagement(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_class_engagement(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_class_engagement(uuid) TO authenticated;
