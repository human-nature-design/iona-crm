import { Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const STRIPE_CHECKOUT_DOCS = 'https://docs.stripe.com/checkout/quickstart';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with back navigation */}
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to settings
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-foreground mb-3">Choose your plan</h1>
          <p className="text-muted-foreground">
            Start free, upgrade when you need more
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Starter Plan */}
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-1">Starter</h2>
              <p className="text-sm text-muted-foreground">For individuals getting started</p>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-foreground">$29</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            <ul className="space-y-3 mb-8 flex-grow">
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Up to 500 contacts</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">1 team member</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Email support</span>
              </li>
            </ul>

            <Button variant="outline" className="w-full" asChild>
              <a href={STRIPE_CHECKOUT_DOCS} target="_blank" rel="noopener noreferrer">
                Get started
              </a>
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="bg-card border-2 border-primary rounded-lg p-6 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                Popular
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-1">Pro</h2>
              <p className="text-sm text-muted-foreground">For growing teams</p>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-foreground">$79</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            <ul className="space-y-3 mb-8 flex-grow">
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Unlimited contacts</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Up to 10 team members</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">AI-powered insights</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Priority support</span>
              </li>
            </ul>

            <Button className="w-full" asChild>
              <a href={STRIPE_CHECKOUT_DOCS} target="_blank" rel="noopener noreferrer">
                Get started
              </a>
            </Button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-1">Enterprise</h2>
              <p className="text-sm text-muted-foreground">For large organizations</p>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-foreground">Custom</span>
            </div>

            <ul className="space-y-3 mb-8 flex-grow">
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Unlimited everything</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Unlimited team members</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">Custom integrations</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">SLA & dedicated support</span>
              </li>
            </ul>

            <Button variant="outline" className="w-full" asChild>
              <a href={STRIPE_CHECKOUT_DOCS} target="_blank" rel="noopener noreferrer">
                Contact sales
              </a>
            </Button>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            This is a boilerplate pricing page. Connect your{' '}
            <a href={STRIPE_CHECKOUT_DOCS} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
              Stripe Checkout
            </a>{' '}
            to enable real payments.
          </p>
        </div>
      </div>
    </div>
  );
}
