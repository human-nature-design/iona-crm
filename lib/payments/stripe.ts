import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import {
  clearTeamStripeData,
  getTeamByStripeCustomerId,
  getUser,
  updateTeamSubscription,
} from '@/lib/db/supabase-queries';
import { getURL } from '@/lib/utils';

type TeamWithStripe = {
  id: number;
  stripe_customer_id?: string | null;
  stripe_product_id?: string | null;
};

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil'
});

export async function createCheckoutSession({
  team,
  priceId
}: {
  team: TeamWithStripe | null;
  priceId: string;
}) {
  const user = await getUser();

  if (!team || !user) {
    redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
  }

  const customerId = team.stripe_customer_id;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: `${getURL()}api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getURL()}pricing`,
    customer: customerId || undefined,
    client_reference_id: user.id.toString(),
    allow_promotion_codes: true,
  });

  redirect(session.url!);
}

export async function createCustomerPortalSession(team: TeamWithStripe) {
  const customerId = team.stripe_customer_id;

  if (!customerId) {
    redirect('/pricing');
  }

  // Fetch all active subscription products (Solo, Team) for upgrade/downgrade
  const [soloProduct, teamProduct] = await Promise.all([
    stripe.products.search({ query: "active:'true' AND name:'Solo'" }),
    stripe.products.search({ query: "active:'true' AND name:'Team'" }),
  ]);

  const productIds = [
    ...soloProduct.data.map(p => p.id),
    ...teamProduct.data.map(p => p.id),
  ].filter(Boolean);

  // Fetch prices for all products
  const allPrices = await stripe.prices.list({
    active: true,
    type: 'recurring',
    limit: 100,
  });

  // Build products config for portal
  const productsConfig = productIds.map(productId => ({
    product: productId,
    prices: allPrices.data
      .filter(price =>
        (typeof price.product === 'string' ? price.product : price.product.id) === productId
      )
      .map(price => price.id),
  })).filter(p => p.prices.length > 0);

  // Always create a fresh configuration to ensure all products are included
  const configuration = await stripe.billingPortal.configurations.create({
    business_profile: {
      headline: 'Manage your subscription'
    },
    features: {
      subscription_update: {
        enabled: true,
        default_allowed_updates: ['price', 'promotion_code'],
        proration_behavior: 'create_prorations',
        products: productsConfig,
      },
      subscription_cancel: {
        enabled: true,
        mode: 'at_period_end',
        cancellation_reason: {
          enabled: true,
          options: [
            'too_expensive',
            'missing_features',
            'switched_service',
            'unused',
            'other'
          ]
        }
      },
      payment_method_update: {
        enabled: true
      }
    }
  });

  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${getURL()}settings`,
    configuration: configuration.id
  });
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  const team = await getTeamByStripeCustomerId(customerId);

  if (!team) {
    console.error('Team not found for Stripe customer:', customerId);
    return;
  }

  if (status === 'active' || status === 'trialing') {
    const plan = subscription.items.data[0]?.plan;
    const productId = typeof plan?.product === 'string'
      ? plan.product
      : plan?.product?.id;

    // Fetch the product to get its name
    let planName: string | null = null;
    if (productId) {
      const product = await stripe.products.retrieve(productId);
      planName = product.name;
    }

    await updateTeamSubscription(team.id, {
      stripe_subscription_id: subscriptionId,
      stripe_product_id: productId || null,
      plan_name: planName,
      subscription_status: status
    });
  } else if (status === 'canceled' || status === 'unpaid') {
    await updateTeamSubscription(team.id, {
      stripe_subscription_id: null,
      stripe_product_id: null,
      plan_name: null,
      subscription_status: status
    });
  }
}

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ['data.product'],
    active: true,
    type: 'recurring'
  });

  return prices.data.map((price) => ({
    id: price.id,
    productId:
      typeof price.product === 'string' ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring?.interval,
    trialPeriodDays: price.recurring?.trial_period_days
  }));
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ['data.default_price']
  });

  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    defaultPriceId:
      typeof product.default_price === 'string'
        ? product.default_price
        : product.default_price?.id
  }));
}

export async function handleCustomerDeleted(customer: Stripe.Customer) {
  const customerId = customer.id;

  console.log('Processing customer.deleted event for:', customerId);

  const team = await getTeamByStripeCustomerId(customerId);

  if (!team) {
    console.log('Team not found for deleted Stripe customer:', customerId);
    return;
  }

  await clearTeamStripeData(team.id);

  console.log('Cleared Stripe data for team:', team.id);
}
