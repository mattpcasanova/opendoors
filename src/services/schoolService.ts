import { supabase } from './supabase/client';
import { organizationService } from './organizationService';

export type GrantedRewardStatus =
  | 'granted'
  | 'redeem_requested'
  | 'redeemed'
  | 'revoked'
  | 'denied'
  | 'lost';

export interface ClassRow {
  id: string;
  teacher_id: string;
  organization_id: string | null;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ClassWithTeacher extends ClassRow {
  teacher_name: string;
}

export interface RosterMember {
  student_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  enrolled_at: string;
}

export type RewardType = 'direct' | 'game';

export interface RewardTemplate {
  id: string;
  teacher_id: string;
  class_id: string | null;
  title: string;
  description: string | null;
  icon: string | null;
  reward_type: RewardType;
  doors: number;
  is_active: boolean;
  created_at: string;
}

export interface GrantedReward {
  id: string;
  template_id: string | null;
  class_id: string;
  teacher_id: string;
  student_id: string;
  title: string;
  description: string | null;
  icon: string | null;
  reward_type: RewardType;
  doors: number;
  status: GrantedRewardStatus;
  requested_at: string | null;
  redeemed_at: string | null;
  note: string | null;
  created_at: string;
}

export interface GrantedRewardWithStudent extends GrantedReward {
  student_name: string;
}

export interface TeacherSummary {
  teacher_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  door_count: number;
}

const fullName = (
  first: string | null | undefined,
  last: string | null | undefined,
  email?: string | null
): string => {
  const name = `${first || ''} ${last || ''}`.trim();
  return name || email || 'Unknown';
};

class SchoolService {
  // ==========================================================================
  // STUDENT
  // ==========================================================================

  /** Classes the student is enrolled in, with the teacher's display name. */
  async getMyClassesAsStudent(
    studentId: string
  ): Promise<{ data: ClassWithTeacher[] | null; error: string | null }> {
    try {
      const { data: enrollments, error: enrollError } = await supabase
        .from('class_enrollments')
        .select('class_id, classes(*)')
        .eq('student_id', studentId);

      if (enrollError) {
        return { data: null, error: enrollError.message };
      }

      const classes = (enrollments || [])
        .map((e: any) => e.classes)
        .filter(Boolean) as ClassRow[];

      if (classes.length === 0) {
        return { data: [], error: null };
      }

      // Resolve teacher names
      const teacherIds = Array.from(new Set(classes.map((c) => c.teacher_id)));
      const { data: teachers } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .in('id', teacherIds);

      const teacherMap = new Map((teachers || []).map((t: any) => [t.id, t]));

      const withTeacher: ClassWithTeacher[] = classes.map((c) => {
        const t = teacherMap.get(c.teacher_id);
        return { ...c, teacher_name: fullName(t?.first_name, t?.last_name, t?.email) };
      });

      return { data: withTeacher, error: null };
    } catch (error: any) {
      console.error('Error fetching student classes:', error);
      return { data: null, error: error.message };
    }
  }

  /** All perks granted to the student (any status), newest first. */
  async getMyGrantedRewards(
    studentId: string
  ): Promise<{ data: GrantedReward[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('granted_rewards')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      return { data: data as GrantedReward[] | null, error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error fetching granted rewards:', error);
      return { data: null, error: error.message };
    }
  }

  /** Student requests redemption of a direct granted perk (granted -> redeem_requested). */
  async requestRedemption(
    grantedId: string
  ): Promise<{ data: GrantedReward | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('request_reward_redemption', {
        p_granted_id: grantedId,
      });
      return { data: data as GrantedReward | null, error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error requesting redemption:', error);
      return { data: null, error: error.message };
    }
  }

  /** Student records a play-to-win game result. win -> redeem_requested, lose -> lost. */
  async recordRewardGame(
    grantedId: string,
    won: boolean
  ): Promise<{ data: GrantedReward | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('record_reward_game', {
        p_granted_id: grantedId,
        p_won: won,
      });
      return { data: data as GrantedReward | null, error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error recording reward game:', error);
      return { data: null, error: error.message };
    }
  }

  /** Student's teachers, each with how many of that teacher's doors they hold. */
  async getMyTeachers(): Promise<{ data: TeacherSummary[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('get_my_teachers');
      return { data: data as TeacherSummary[] | null, error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error fetching teachers:', error);
      return { data: null, error: error.message };
    }
  }

  /** A teacher's item menu (visible to the enrolled student via RLS). */
  async getTeacherItems(
    teacherId: string
  ): Promise<{ data: RewardTemplate[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('reward_templates')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      return { data: data as RewardTemplate[] | null, error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error fetching teacher items:', error);
      return { data: null, error: error.message };
    }
  }

  /** The student's reward history with one teacher (RLS limits to own rows). */
  async getMyRewardsFromTeacher(
    teacherId: string
  ): Promise<{ data: GrantedReward[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('granted_rewards')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });
      return { data: data as GrantedReward[] | null, error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error fetching rewards from teacher:', error);
      return { data: null, error: error.message };
    }
  }

  /** Spend one of a teacher's doors on their item (RPC enforces the scoping). */
  async spendDoorOnItem(
    templateId: string
  ): Promise<{ data: GrantedReward | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('spend_door_on_item', {
        p_template_id: templateId,
      });
      return { data: data as GrantedReward | null, error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error spending door on item:', error);
      return { data: null, error: error.message };
    }
  }

  // ==========================================================================
  // TEACHER
  // ==========================================================================

  /** Classes the teacher owns. */
  async getMyClassesAsTeacher(
    teacherId: string
  ): Promise<{ data: ClassRow[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('is_active', true)
        .order('name', { ascending: true });

      return { data: data as ClassRow[] | null, error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error fetching teacher classes:', error);
      return { data: null, error: error.message };
    }
  }

  /** Enrolled students for a class (via SECURITY DEFINER RPC). */
  async getClassRoster(
    classId: string
  ): Promise<{ data: RosterMember[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('get_class_roster', {
        p_class_id: classId,
      });
      return { data: data as RosterMember[] | null, error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error fetching class roster:', error);
      return { data: null, error: error.message };
    }
  }

  /** Reward templates owned by the teacher. */
  async listTemplates(
    teacherId: string
  ): Promise<{ data: RewardTemplate[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('reward_templates')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      return { data: data as RewardTemplate[] | null, error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error listing templates:', error);
      return { data: null, error: error.message };
    }
  }

  /** Create a reward template. class_id null => usable across all classes. */
  async createTemplate(t: {
    teacher_id: string;
    class_id: string | null;
    title: string;
    description?: string;
    icon?: string;
    reward_type?: RewardType;
    doors?: number;
  }): Promise<{ data: RewardTemplate | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('reward_templates')
        .insert({
          teacher_id: t.teacher_id,
          class_id: t.class_id,
          title: t.title,
          description: t.description ?? null,
          icon: t.icon ?? null,
          reward_type: t.reward_type ?? 'direct',
          doors: t.doors ?? 3,
        })
        .select()
        .single();

      return { data: data as RewardTemplate | null, error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error creating template:', error);
      return { data: null, error: error.message };
    }
  }

  /** Soft-delete a template (existing granted perks keep their snapshot). */
  async deactivateTemplate(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('reward_templates')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      return { success: !error, error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error deactivating template:', error);
      return { success: false, error: error.message };
    }
  }

  /** Grant a perk to a student (via SECURITY DEFINER RPC). */
  async grantReward(args: {
    classId: string;
    studentId: string;
    templateId?: string;
    title?: string;
    description?: string;
    icon?: string;
  }): Promise<{ data: GrantedReward | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('grant_classroom_reward', {
        p_class_id: args.classId,
        p_student_id: args.studentId,
        p_template_id: args.templateId ?? null,
        p_title: args.title ?? null,
        p_description: args.description ?? null,
        p_icon: args.icon ?? null,
      });
      return { data: data as GrantedReward | null, error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error granting reward:', error);
      return { data: null, error: error.message };
    }
  }

  /** Grant the same perk to many students. Returns count granted. */
  async grantRewardToMany(args: {
    classId: string;
    studentIds: string[];
    templateId?: string;
    title?: string;
    description?: string;
    icon?: string;
  }): Promise<{ granted: number; error: string | null }> {
    let granted = 0;
    for (const studentId of args.studentIds) {
      const { error } = await this.grantReward({
        classId: args.classId,
        studentId,
        templateId: args.templateId,
        title: args.title,
        description: args.description,
        icon: args.icon,
      });
      if (error) {
        return { granted, error };
      }
      granted += 1;
    }
    return { granted, error: null };
  }

  /** Pending redemption requests across all the teacher's grants. */
  async getPendingRequests(
    teacherId: string
  ): Promise<{ data: GrantedRewardWithStudent[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('granted_rewards')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('status', 'redeem_requested')
        .order('requested_at', { ascending: true });

      if (error) {
        return { data: null, error: error.message };
      }

      const rows = (data || []) as GrantedReward[];
      if (rows.length === 0) {
        return { data: [], error: null };
      }

      const studentIds = Array.from(new Set(rows.map((r) => r.student_id)));
      const { data: students } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .in('id', studentIds);

      const studentMap = new Map((students || []).map((s: any) => [s.id, s]));

      const withNames: GrantedRewardWithStudent[] = rows.map((r) => {
        const s = studentMap.get(r.student_id);
        return { ...r, student_name: fullName(s?.first_name, s?.last_name, s?.email) };
      });

      return { data: withNames, error: null };
    } catch (error: any) {
      console.error('Error fetching pending requests:', error);
      return { data: null, error: error.message };
    }
  }

  /** Teacher resolves a redemption request. */
  private async resolve(
    grantedId: string,
    action: 'confirm' | 'deny' | 'revoke'
  ): Promise<{ data: GrantedReward | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('resolve_reward_redemption', {
        p_granted_id: grantedId,
        p_action: action,
      });
      return { data: data as GrantedReward | null, error: error?.message ?? null };
    } catch (error: any) {
      console.error(`Error resolving redemption (${action}):`, error);
      return { data: null, error: error.message };
    }
  }

  confirmRedemption(grantedId: string) {
    return this.resolve(grantedId, 'confirm');
  }

  denyRedemption(grantedId: string) {
    return this.resolve(grantedId, 'deny');
  }

  revokeReward(grantedId: string) {
    return this.resolve(grantedId, 'revoke');
  }

  // ==========================================================================
  // DOORS (reuse the existing distribution pipeline)
  // ==========================================================================

  /** Send doors (game plays) from a teacher to a student. */
  async sendDoorsToStudent(
    teacherId: string,
    studentId: string,
    doors: number,
    reason: string
  ) {
    return organizationService.sendDoors(teacherId, studentId, doors, reason);
  }
}

export const schoolService = new SchoolService();
