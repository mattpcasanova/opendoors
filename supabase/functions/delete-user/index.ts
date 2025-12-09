import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with the user's token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const userId = user.id
    console.log(`Starting deletion for user: ${userId}`)

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Delete all user-related data in the correct order
    // Start with tables that don't have foreign keys to other user tables

    console.log('Deleting analytics events...')
    await supabaseAdmin.from('analytics_events').delete().eq('user_id', userId)

    console.log('Deleting redemption surveys...')
    await supabaseAdmin.from('redemption_surveys').delete().eq('user_id', userId)

    console.log('Deleting door notifications...')
    await supabaseAdmin.from('door_notifications').delete().eq('user_id', userId)

    console.log('Deleting game plays...')
    await supabaseAdmin.from('game_plays').delete().eq('user_id', userId)

    console.log('Deleting game history...')
    await supabaseAdmin.from('game_history').delete().eq('user_id', userId)

    console.log('Deleting earned rewards...')
    await supabaseAdmin.from('earned_rewards').delete().eq('user_id', userId)

    console.log('Deleting user preferences...')
    await supabaseAdmin.from('user_preferences').delete().eq('user_id', userId)

    console.log('Deleting user settings...')
    await supabaseAdmin.from('user_settings').delete().eq('user_id', userId)

    console.log('Deleting favorites...')
    await supabaseAdmin.from('favorites').delete().eq('user_id', userId)

    console.log('Deleting door distributions (distributor)...')
    await supabaseAdmin.from('door_distributions').delete().eq('distributor_id', userId)

    console.log('Deleting door distributions (recipient)...')
    await supabaseAdmin.from('door_distributions').delete().eq('recipient_id', userId)

    console.log('Deleting distributor members (distributor)...')
    await supabaseAdmin.from('distributor_members').delete().eq('distributor_id', userId)

    console.log('Deleting distributor members (member)...')
    await supabaseAdmin.from('distributor_members').delete().eq('member_id', userId)

    console.log('Deleting referrals (referrer)...')
    await supabaseAdmin.from('referrals').delete().eq('referrer_id', userId)

    console.log('Deleting referrals (referred)...')
    await supabaseAdmin.from('referrals').delete().eq('referred_id', userId)

    // Update any user_profiles that were referred by this user (SET NULL)
    console.log('Updating user profiles referred_by...')
    await supabaseAdmin
      .from('user_profiles')
      .update({ referred_by_id: null })
      .eq('referred_by_id', userId)

    console.log('Deleting user profile...')
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Profile deletion error:', profileError)
      throw new Error(`Failed to delete profile: ${profileError.message}`)
    }

    // Finally, delete the auth user
    console.log('Deleting auth user...')
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Auth user deletion error:', deleteError)
      throw new Error(`Failed to delete auth user: ${deleteError.message}`)
    }

    console.log(`Successfully deleted user: ${userId}`)

    return new Response(
      JSON.stringify({ message: 'User deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Delete user function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
