import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Clock,
  MapPin,
  Sparkles,
  Users,
  CreditCard,
  ArrowRight,
  Check
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Garden Table
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/discover" className="text-sm font-medium hover:text-accent-500 transition-colors hidden sm:inline">
              Discover
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/create">
              <Button size="sm">
                Create Event
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-50 via-background to-background -z-10" />
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
              Create beautiful food experiences
            </h1>
            <p className="mt-6 text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              The simplest way to host wine tastings, cooking classes, private dinners,
              and more. Create in 60 seconds. Get booked in 15.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create">
                <Button size="xl" className="w-full sm:w-auto group">
                  Start creating
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/discover">
                <Button size="xl" variant="outline" className="w-full sm:w-auto">
                  Explore experiences
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything you need, nothing you don't
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional-grade booking with Apple-level simplicity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Sparkles className="h-6 w-6" />}
              title="Beautiful by default"
              description="Your event page looks stunning without any customization. Just add your details and go."
            />
            <FeatureCard
              icon={<Clock className="h-6 w-6" />}
              title="60-second setup"
              description="Name, date, photos, price. That's it. Create your first event before your coffee gets cold."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="15-second booking"
              description="Apple Pay, Google Pay, or card. No account required. Guests book instantly."
            />
            <FeatureCard
              icon={<CalendarDays className="h-6 w-6" />}
              title="Automatic everything"
              description="Reminders, confirmations, thank you emails, waitlists. We handle it all."
            />
            <FeatureCard
              icon={<MapPin className="h-6 w-6" />}
              title="Get discovered"
              description="Join our marketplace and let food lovers find your experiences."
            />
            <FeatureCard
              icon={<CreditCard className="h-6 w-6" />}
              title="Instant payouts"
              description="Stripe handles payments. Money hits your account in 2 days."
            />
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold">
              Simple pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Free to start. Pay only when you make money.
            </p>

            <div className="mt-12 grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div className="rounded-2xl border-2 border-border p-8 text-left">
                <h3 className="text-lg font-semibold">Free</h3>
                <p className="mt-2 text-4xl font-bold">$0<span className="text-lg font-normal text-muted-foreground">/month</span></p>
                <p className="mt-2 text-sm text-muted-foreground">5% per booking</p>
                <ul className="mt-6 space-y-3">
                  <PricingItem>Unlimited events</PricingItem>
                  <PricingItem>Up to 50 bookings/month</PricingItem>
                  <PricingItem>All core features</PricingItem>
                  <PricingItem>Email support</PricingItem>
                </ul>
              </div>

              <div className="rounded-2xl border-2 border-foreground p-8 text-left relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-background px-3 py-1 rounded-full text-xs font-semibold">
                  Most popular
                </div>
                <h3 className="text-lg font-semibold">Growth</h3>
                <p className="mt-2 text-4xl font-bold">$99<span className="text-lg font-normal text-muted-foreground">/month</span></p>
                <p className="mt-2 text-sm text-muted-foreground">2.5% per booking</p>
                <ul className="mt-6 space-y-3">
                  <PricingItem>Everything in Free</PricingItem>
                  <PricingItem>Unlimited bookings</PricingItem>
                  <PricingItem>Custom domain</PricingItem>
                  <PricingItem>Priority support</PricingItem>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-foreground text-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to host something amazing?
            </h2>
            <p className="mt-4 text-lg text-background/70">
              Join hundreds of hosts creating unforgettable food experiences.
            </p>
            <Link href="/create" className="inline-block mt-8">
              <Button size="xl" variant="secondary" className="group">
                Create your first event
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold">Garden Table</span>
              <span className="text-muted-foreground">© 2024</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/discover" className="hover:text-foreground transition-colors">
                Discover
              </Link>
              <Link href="/pricing" className="hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/help" className="hover:text-foreground transition-colors">
                Help
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border-2 border-border bg-card p-6 transition-all hover:border-foreground hover:shadow-lg">
      <div className="h-12 w-12 rounded-xl bg-accent-100 flex items-center justify-center text-accent-600">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}

function PricingItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <Check className="h-4 w-4 text-success" />
      {children}
    </li>
  );
}
