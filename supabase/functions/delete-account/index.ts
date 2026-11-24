import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { cancelAppSubscriptions } from './stripe-cancel.ts';

// Momentum Stripe products (verified against Stripe live, 2026-11-24).
// Premium is current; the rest are retired but may still hold old subscriptions.
const MOMENTUM_PRODUCT_IDS = new Set([
  'prod_U3w9PqaaJVSOto', // Momentum Premium
  'prod_U3w81PJvJRTiQQ', // Momentum Pro (legacy Plus, retired)
  'prod_U3vT2StszUp7uL', // Momentum Pro (retired)
  'prod_U3vSrPHBDq24U8', // Momentum Plus (retired)
]);

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

    // 0a. Cancel Stripe subscriptions (must succeed before anything is deleted).
    // Cancels every Momentum subscription that can still bill (active,
    // trialing, past_due, unpaid, paused) on the stored customer and on any
    // customer matching the user's email. If Stripe cannot confirm that, stop
    // here: no data is deleted and the user can retry.
    const { data: stripeRow, error: stripeRowLookupError } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (stripeRowLookupError) {
      console.error('stripe_customers lookup error (email lookup still runs):', stripeRowLookupError);
    }

    const stripeResult = await cancelAppSubscriptions({
      stripeKey: Deno.env.get('STRIPE_SECRET_KEY'),
      email: user.email,
      knownCustomerIds: [stripeRow?.stripe_customer_id],
      productIds: MOMENTUM_PRODUCT_IDS,
    });
    console.log('Stripe cancel result:', JSON.stringify(stripeResult));
    if (!stripeResult.ok) {
      console.error('Stripe cancel failed, aborting deletion:', stripeResult.errors);
      return new Response(
        JSON.stringify({
          error: 'Could not cancel your subscription, so your account was not deleted. Please try again or contact support.',
          stripe: stripeResult,
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
