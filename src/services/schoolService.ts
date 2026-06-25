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
  join_code: string | null;
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

/** Whether a reward is a food perk (fries, cookie) or a school perk (bonus point, HW pass). */
export type RewardClass = 'food' | 'school';

/** What a teacher door may be spent on. 'either' lets the student choose. */
export type DoorEligibility = 'food_only' | 'school_only' | 'either';

export interface RewardTemplate {
  id: string;
  teacher_id: string;
  class_id: string | null;
  title: string;
  description: string | null;
  icon: string | null;
  reward_type: RewardType;
  reward_class: RewardClass;
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
  reward_class: RewardClass;
  /** Eligibility of the door spent to get this reward; null for direct teacher grants. */
  door_eligibility: DoorEligibility | null;
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
  either_doors: number;
  food_doors: number;
  school_doors: number;
}

export interface RewardPreferenceStats {
  choice_food: number;
  choice_school: number;
  all_food: number;
  all_school: number;
}

export interface AssessmentName {
  assessment_name: string;
  recorded_count: number;
}

export interface DoorsVsAssessmentRow {
  student_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  doors_earned: number;
  score: number | null;
  max_score: number | null;
}

export interface DoorMessage {
  id: string;
  doors_sent: number;
  reason: string | null;
  created_at: string;
}

export interface ClassEngagement {
  student_id: string;
  doors_received: number;
  last_door_at: string | null;
}

export interface ClassGoal {
  title: string;
  target_doors: number;
  progress: number;
}

/** Group reward as the teacher sees it (one class). */
export interface GroupRewardTeacher {
  id: string;
  title: string;
  description: string | null;
  reward_class: RewardClass;
  target_doors: number;
  progress: number;
  contributors: number;
  fulfilled_at: string | null;
  created_at: string;
}

/** Group reward as a student sees it (with their own contribution). */
export interface GroupRewardStudent {
  id: string;
  class_id: string;
  class_name: string;
  title: string;
  description: string | null;
  reward_class: RewardClass;
  target_doors: number;
  progress: number;
  my_contribution: number;
  fulfilled_at: string | null;
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

  /** Recent door shout-outs the student received from a teacher (RLS limits to own). */
  async getDoorMessagesFromTeacher(
    teacherId: string
  ): Promise<{ data: DoorMessage[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('door_distributions')
        .select('id, doors_sent, reason, created_at')
        .eq('distributor_id', teacherId)
        .order('created_at', { ascending: false })
        .limit(15);
      return { data: data as DoorMessage[] | null, error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error fetching door messages:', error);
      return { data: null, error: error.message };
    }
  }

  /** Student joins a class with its code. */
  async joinClassByCode(
    code: string
  ): Promise<{ data: ClassRow | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('join_class_by_code', { p_code: code });
      return { data: data as ClassRow | null, error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error joining class:', error);
      return { data: null, error: error.message };
    }
  }

  /** Teacher regenerates a class join code. */
  async regenerateClassCode(
    classId: string
  ): Promise<{ data: string | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('regenerate_class_code', { p_class_id: classId });
      return { data: data as string | null, error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error regenerating class code:', error);
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

  /** Per-student reward engagement (doors received from this teacher + last date). */
  async getClassEngagement(
    classId: string
  ): Promise<{ data: ClassEngagement[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('get_class_engagement', { p_class_id: classId });
      return { data: data as ClassEngagement[] | null, error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error fetching class engagement:', error);
      return { data: null, error: error.message };
    }
  }

  /** A class's shared goal + progress (teacher or enrolled student). */
  async getClassGoal(
    classId: string
  ): Promise<{ data: ClassGoal | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('get_class_goal', { p_class_id: classId });
      const row = Array.isArray(data) && data.length > 0 ? (data[0] as ClassGoal) : null;
      return { data: row, error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error fetching class goal:', error);
      return { data: null, error: error.message };
    }
  }

  /** Teacher sets/updates the class goal. */
  async setClassGoal(
    classId: string,
    title: string,
    target: number
  ): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.rpc('set_class_goal', {
        p_class_id: classId,
        p_title: title,
        p_target: target,
      });
      return { error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error setting class goal:', error);
      return { error: error.message };
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
    reward_class?: RewardClass;
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
          reward_class: t.reward_class ?? 'food',
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
    note?: string;
    rewardClass?: RewardClass;
  }): Promise<{ data: GrantedReward | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('grant_classroom_reward', {
        p_class_id: args.classId,
        p_student_id: args.studentId,
        p_template_id: args.templateId ?? null,
        p_title: args.title ?? null,
        p_description: args.description ?? null,
        p_icon: args.icon ?? null,
        p_note: args.note ?? null,
        p_reward_class: args.rewardClass ?? null,
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
    note?: string;
    rewardClass?: RewardClass;
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
        note: args.note,
        rewardClass: args.rewardClass,
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

  /** Send doors (game plays) from a teacher to a student, optionally locked to food/school. */
  async sendDoorsToStudent(
    teacherId: string,
    studentId: string,
    doors: number,
    reason: string,
    eligibility: DoorEligibility = 'either'
  ) {
    return organizationService.sendDoors(teacherId, studentId, doors, reason, eligibility);
  }

  // ==========================================================================
  // ANALYTICS / RESEARCH
  // ==========================================================================

  /** Food-vs-school reward stats for the teacher (optionally one class). */
  async getRewardPreferenceStats(
    classId?: string | null
  ): Promise<{ data: RewardPreferenceStats | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('get_reward_preference_stats', {
        p_class_id: classId ?? null,
      });
      const row = Array.isArray(data) && data.length > 0 ? (data[0] as RewardPreferenceStats) : null;
      return { data: row, error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error fetching reward preference stats:', error);
      return { data: null, error: error.message };
    }
  }

  /** Record/update one student's assessment score (e.g. an EOC). */
  async upsertAssessment(args: {
    studentId: string;
    assessmentName: string;
    score: number;
    maxScore?: number | null;
    classId?: string | null;
    term?: string | null;
  }): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.rpc('upsert_student_assessment', {
        p_student_id: args.studentId,
        p_assessment_name: args.assessmentName,
        p_score: args.score,
        p_max_score: args.maxScore ?? null,
        p_class_id: args.classId ?? null,
        p_term: args.term ?? null,
      });
      return { error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error saving assessment:', error);
      return { error: error.message };
    }
  }

  /** Distinct assessment names the teacher has recorded. */
  async getAssessmentNames(): Promise<{ data: AssessmentName[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('get_my_assessment_names');
      return { data: data as AssessmentName[] | null, error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error fetching assessment names:', error);
      return { data: null, error: error.message };
    }
  }

  /** Per-student doors-earned vs assessment score for one class (correlation view). */
  async getDoorsVsAssessment(
    classId: string,
    assessmentName: string
  ): Promise<{ data: DoorsVsAssessmentRow[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('get_doors_vs_assessment', {
        p_class_id: classId,
        p_assessment_name: assessmentName,
      });
      return { data: data as DoorsVsAssessmentRow[] | null, error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error fetching doors vs assessment:', error);
      return { data: null, error: error.message };
    }
  }

  // ==========================================================================
  // GROUP REWARDS (class-wide, student-funded door pools)
  // ==========================================================================

  /** Teacher creates a group reward for a class. */
  async createGroupReward(args: {
    classId: string;
    title: string;
    target: number;
    description?: string;
    rewardClass?: RewardClass;
  }): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.rpc('create_group_reward', {
        p_class_id: args.classId,
        p_title: args.title,
        p_target: args.target,
        p_description: args.description ?? null,
        p_reward_class: args.rewardClass ?? 'school',
      });
      return { error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error creating group reward:', error);
      return { error: error.message };
    }
  }

  /** Teacher removes a group reward. */
  async deactivateGroupReward(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.rpc('deactivate_group_reward', { p_id: id });
      return { error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error deleting group reward:', error);
      return { error: error.message };
    }
  }

  /** Student contributes doors to a group reward (spends eligible teacher doors). */
  async contributeToGroupReward(
    groupId: string,
    doors: number
  ): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.rpc('contribute_to_group_reward', {
        p_group_id: groupId,
        p_doors: doors,
      });
      return { error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error contributing to group reward:', error);
      return { error: error.message };
    }
  }

  /** Teacher: active group rewards for one class. */
  async getClassGroupRewards(
    classId: string
  ): Promise<{ data: GroupRewardTeacher[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('get_class_group_rewards', { p_class_id: classId });
      return { data: data as GroupRewardTeacher[] | null, error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error fetching class group rewards:', error);
      return { data: null, error: error.message };
    }
  }

  /** Student: active group rewards across classes shared with one teacher. */
  async getGroupRewardsForTeacher(
    teacherId: string
  ): Promise<{ data: GroupRewardStudent[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase.rpc('get_group_rewards_for_teacher', {
        p_teacher_id: teacherId,
      });
      return { data: data as GroupRewardStudent[] | null, error: error?.message ?? null };
    } catch (error: any) {
      console.error('Error fetching group rewards:', error);
      return { data: null, error: error.message };
    }
  }
}

export const schoolService = new SchoolService();
