import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a client with the user's token to verify authentication
    const userClient = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    console.log('Deleting account for user:', userId);

    // 0a. Cancel Stripe subscription (non-blocking)
    try {
      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
      if (stripeKey) {
        const { data: stripeRow } = await supabase
          .from('stripe_customers')
          .select('stripe_subscription_id, stripe_customer_id')
          .eq('user_id', userId)
          .maybeSingle();

        if (stripeRow?.stripe_subscription_id) {
          const cancelRes = await fetch(
            `https://api.stripe.com/v1/subscriptions/${stripeRow.stripe_subscription_id}`,
            {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${stripeKey}` },
            }
          );
          console.log('Stripe subscription cancel status:', cancelRes.status);
        } else {
          console.log('No Stripe subscription found for user:', userId);
        }
      } else {
        console.log('STRIPE_SECRET_KEY not configured, skipping Stripe cancel');
      }
    } catch (stripeErr) {
      console.error('Non-blocking Stripe cancel error:', stripeErr);
    }

    // 0b. Delete RevenueCat subscriber (non-blocking)
    try {
      const rcKey = Deno.env.get('REVENUECAT_API_KEY');
      if (rcKey) {
        const rcRes = await fetch(
          `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${rcKey}` },
          }
        );
        console.log('RevenueCat subscriber delete status:', rcRes.status);
      } else {
        console.log('REVENUECAT_API_KEY not configured, skipping RevenueCat delete');
      }
    } catch (rcErr) {
      console.error('Non-blocking RevenueCat delete error:', rcErr);
    }

    // Delete all user-related data in order (respecting foreign keys)
    // 1. Delete chat messages
    const { error: chatError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', userId);

    if (chatError) {
      console.error('Error deleting chat messages:', chatError);
    } else {
      console.log('Deleted chat messages for user:', userId);
    }

    // 2. Delete coach triggers
    const { error: triggersError } = await supabase
      .from('coach_triggers')
      .delete()
      .eq('user_id', userId);

    if (triggersError) {
      console.error('Error deleting coach triggers:', triggersError);
    } else {
      console.log('Deleted coach triggers for user:', userId);
    }

    // 3. Delete activity logs
    const { error: activityError } = await supabase
      .from('activity_logs')
      .delete()
      .eq('user_id', userId);

    if (activityError) {
      console.error('Error deleting activity logs:', activityError);
    } else {
      console.log('Deleted activity logs for user:', userId);
    }

    // 4. Delete goals
    const { error: goalsError } = await supabase
      .from('goals')
      .delete()
      .eq('user_id', userId);

    if (goalsError) {
      console.error('Error deleting goals:', goalsError);
    } else {
      console.log('Deleted goals for user:', userId);
    }

    // 4a. Delete daily_context
    const { error: dailyContextError } = await supabase
      .from('daily_context')
      .delete()
      .eq('user_id', userId);
    if (dailyContextError) {
      console.error('Error deleting daily_context:', dailyContextError);
    } else {
      console.log('Deleted daily_context for user:', userId);
    }

    // 4b. Delete pain_reports
    const { error: painReportsError } = await supabase
      .from('pain_reports')
      .delete()
      .eq('user_id', userId);
    if (painReportsError) {
      console.error('Error deleting pain_reports:', painReportsError);
    } else {
      console.log('Deleted pain_reports for user:', userId);
    }

    // 4c. Delete streak_repairs
    const { error: streakRepairsError } = await supabase
      .from('streak_repairs')
      .delete()
      .eq('user_id', userId);
    if (streakRepairsError) {
      console.error('Error deleting streak_repairs:', streakRepairsError);
    } else {
      console.log('Deleted streak_repairs for user:', userId);
    }

    // 4d. Delete cost_tracking (costs)
    const { error: costTrackingError } = await supabase
      .from('cost_tracking')
      .delete()
      .eq('user_id', userId);
    if (costTrackingError) {
      console.error('Error deleting cost_tracking:', costTrackingError);
    } else {
      console.log('Deleted cost_tracking for user:', userId);
    }

    // 4e. Delete testimonials
    const { error: testimonialsError } = await supabase
      .from('testimonials')
      .delete()
      .eq('user_id', userId);
    if (testimonialsError) {
      console.error('Error deleting testimonials:', testimonialsError);
    } else {
      console.log('Deleted testimonials for user:', userId);
    }

    // 4f. Delete user_roles
    const { error: userRolesError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
    if (userRolesError) {
      console.error('Error deleting user_roles:', userRolesError);
    } else {
      console.log('Deleted user_roles for user:', userId);
    }

    // 4g. Delete workout_buddies (both sides of relationship)
    const { error: workoutBuddiesError } = await supabase
      .from('workout_buddies')
      .delete()
      .or(`user_id.eq.${userId},buddy_id.eq.${userId}`);
    if (workoutBuddiesError) {
      console.error('Error deleting workout_buddies:', workoutBuddiesError);
    } else {
      console.log('Deleted workout_buddies for user:', userId);
    }

    // 5. Delete profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
    } else {
      console.log('Deleted profile for user:', userId);
    }

    // 5b. Delete stripe_customers row (avoid orphan after auth delete)
    const { error: stripeRowError } = await supabase
      .from('stripe_customers')
      .delete()
      .eq('user_id', userId);
    if (stripeRowError) {
      console.error('Error deleting stripe_customers row:', stripeRowError);
    }

    // 6. Finally, delete the auth user (this must be done last)
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete account', details: deleteUserError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully deleted account for user:', userId);

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in delete-account function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
