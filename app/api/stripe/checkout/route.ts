import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { createAdminClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.redirect(new URL('/pricing', request.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription'],
    });

    if (!session.customer || typeof session.customer === 'string') {
      throw new Error('Invalid customer data from Stripe.');
    }

    const customerId = session.customer.id;
    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;

    if (!subscriptionId) {
      throw new Error('No subscription found for this session.');
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price.product'],
    });

    const plan = subscription.items.data[0]?.price;

    if (!plan) {
      throw new Error('No plan found for this subscription.');
    }

    const productId = (plan.product as Stripe.Product).id;

    if (!productId) {
      throw new Error('No product ID found for this subscription.');
    }

    const userId = session.client_reference_id;
    if (!userId) {
      throw new Error("No user ID found in session's client_reference_id.");
    }

    // Use admin client since this runs during Stripe checkout callback (no user session)
    const adminSupabase = createAdminClient();

    // Get user
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .select('id')
      .eq('id', Number(userId))
      .single();

    if (userError || !user) {
      throw new Error('User not found in database.');
    }

    // Get user's team
    const { data: teamMember, error: teamMemberError } = await adminSupabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)
      .single();

    if (teamMemberError || !teamMember) {
      throw new Error('User is not associated with any team.');
    }

    // Update team with subscription info
    const { error: updateError } = await adminSupabase
      .from('teams')
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        stripe_product_id: productId,
        plan_name: (plan.product as Stripe.Product).name,
        subscription_status: subscription.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', teamMember.team_id);

    if (updateError) {
      throw new Error(`Failed to update team: ${updateError.message}`);
    }

    // Session is handled by Supabase Auth - no need to set session here
    return NextResponse.redirect(new URL('/settings', request.url));
  } catch (error) {
    console.error('Error handling successful checkout:', error);
    return NextResponse.redirect(new URL('/error', request.url));
  }
}
