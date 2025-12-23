import Link from "next/link";
import Image from "next/image";
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
    <div className="min-h-screen bg-white">
      {/* Navigation - Refined Apple-style */}
      <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-lg font-semibold text-gray-900">
              Garden Table
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/discover" className="hidden sm:inline-block">
                <Button variant="ghost" size="md">
                  Discover
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="ghost" size="md">
                  Sign in
                </Button>
              </Link>
              <Link href="/create">
                <Button variant="primary" size="md">
                  Create Event
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - 50/50 Split with Visual Proof */}
      <section className="relative px-6 md:px-10 pt-40 pb-32">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div className="max-w-[640px]">
              <h1 className="text-[72px] leading-[1.1] font-bold text-gray-900 tracking-[-0.02em] mb-8">
                Create in 60&nbsp;seconds.
                <br />
                Get booked in&nbsp;15.
              </h1>
              <p className="text-xl text-gray-600 leading-[1.65] mb-12 max-w-[520px]">
                For hosts who want full event pages without full websites.
              </p>
              <div className="flex items-center gap-4">
                <Link href="/create">
                  <Button
                    size="lg"
                    variant="primary"
                    className="group text-lg px-8 py-4 h-auto rounded-xl font-semibold"
                  >
                    Create your first event
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Visual Proof - Event Page Mockup */}
            <div className="relative h-[600px] rounded-2xl overflow-hidden shadow-2xl hidden md:block">
              <Image
                src="/event-mockup.png"
                alt="Beautiful event page example"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Generous Spacing */}
      <section className="py-32 px-6 md:px-10 bg-gray-50">
        <div className="max-w-[1280px] mx-auto">
          <div className="mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Everything you need,<br />nothing you don't
            </h2>
            <p className="text-xl text-gray-600 max-w-[520px] leading-relaxed">
              Professional-grade booking with Apple-level simplicity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Sparkles className="h-8 w-8" />}
              title="Beautiful by default"
              description="Event pages look stunning without customization. Just add your details and go."
            />
            <FeatureCard
              icon={<Clock className="h-8 w-8" />}
              title="60-second setup"
              description="Name, date, photos, price. That's it. Create your first event before your coffee gets cold."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="15-second booking"
              description="Apple Pay, Google Pay, or card. No account required. Guests book instantly."
            />
            <FeatureCard
              icon={<CalendarDays className="h-8 w-8" />}
              title="Automatic everything"
              description="Reminders, confirmations, thank you emails, waitlists. We handle it all."
            />
            <FeatureCard
              icon={<MapPin className="h-8 w-8" />}
              title="Get discovered"
              description="Join our marketplace and let food lovers find your experiences."
            />
            <FeatureCard
              icon={<CreditCard className="h-8 w-8" />}
              title="Instant payouts"
              description="Stripe handles payments. Money hits your account in 2 days."
            />
          </div>
        </div>
      </section>

      {/* Pricing Preview - Dramatic Numbers */}
      <section className="py-32 px-6 md:px-10">
        <div className="max-w-[1280px] mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Simple pricing
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Free to start. Pay only when you make money.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-[900px] mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-10">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Free</h3>
              <p className="flex items-baseline mb-2">
                <span className="text-[72px] font-extrabold text-gray-900 leading-none">$0</span>
                <span className="ml-2 text-xl text-gray-600">/month</span>
              </p>
              <p className="text-base text-gray-600 mb-8">5% per booking</p>
              <ul className="space-y-3">
                <PricingItem>Unlimited events</PricingItem>
                <PricingItem>Up to 50 bookings/month</PricingItem>
                <PricingItem>All core features</PricingItem>
                <PricingItem>Email support</PricingItem>
              </ul>
            </div>

            {/* Growth Plan */}
            <div className="bg-white rounded-2xl border-2 border-[#C9A76B] p-10 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 rounded-xl text-xs font-semibold">
                Most popular
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Growth</h3>
              <p className="flex items-baseline mb-2">
                <span className="text-[72px] font-extrabold text-gray-900 leading-none">$99</span>
                <span className="ml-2 text-xl text-gray-600">/month</span>
              </p>
              <p className="text-base text-gray-600 mb-8">2.5% per booking</p>
              <ul className="space-y-3">
                <PricingItem><span className="font-semibold">Everything in Free</span></PricingItem>
                <PricingItem>Unlimited bookings</PricingItem>
                <PricingItem>Custom domain</PricingItem>
                <PricingItem>Priority support</PricingItem>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-10 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to host something amazing?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join hundreds of hosts creating unforgettable food experiences.
          </p>
          <Link href="/create">
            <Button size="lg" variant="secondary" className="group text-lg px-8 py-4 h-auto rounded-xl">
              Create your first event
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="py-12 px-6 md:px-10 border-t border-gray-200 bg-white">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">Garden Table</span>
              <span className="text-gray-600">© 2024</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/discover" className="text-gray-600 hover:text-gray-900 transition-colors">
                Discover
              </Link>
              <Link href="/create" className="text-gray-600 hover:text-gray-900 transition-colors">
                Create
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component - Enhanced
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
    <div className="bg-white rounded-2xl border-2 border-gray-300 p-8 transition-all duration-200 hover:border-gray-300 hover:shadow-lg hover:-translate-y-0.5">
      <div className="text-[#C9A76B] mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-base text-gray-600 leading-[1.6]">{description}</p>
    </div>
  );
}

// Pricing Item Component
function PricingItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 text-base text-gray-900">
      <Check className="h-5 w-5 text-[#9CAF6E] flex-shrink-0" />
      {children}
    </li>
  );
}
