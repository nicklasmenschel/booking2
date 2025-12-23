import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Check, X, AlertCircle, Loader2, Star, Search } from 'lucide-react';

export default function ComponentShowcase() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-8 py-20">

                {/* Header */}
                <header className="mb-20">
                    <h1 className="text-5xl font-semibold text-gray-900 mb-3 tracking-tight">
                        Design System
                    </h1>
                    <p className="text-lg text-gray-600">
                        Components and patterns for Garden Table
                    </p>
                </header>

                <div className="space-y-20">

                    {/* Color Palette */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-8">Color Palette</h2>

                        {/* Brand Colors */}
                        <div className="grid grid-cols-3 gap-6 mb-8">
                            <div>
                                <div className="h-32 rounded-2xl bg-[#C9A76B] mb-3" />
                                <p className="text-sm font-medium text-gray-900">Primary</p>
                                <code className="text-xs text-gray-500">#C9A76B</code>
                            </div>
                            <div>
                                <div className="h-32 rounded-2xl bg-[#9CAF6E] mb-3" />
                                <p className="text-sm font-medium text-gray-900">Success</p>
                                <code className="text-xs text-gray-500">#9CAF6E</code>
                            </div>
                            <div>
                                <div className="h-32 rounded-2xl bg-[#FF5722] mb-3" />
                                <p className="text-sm font-medium text-gray-900">Error</p>
                                <code className="text-xs text-gray-500">#FF5722</code>
                            </div>
                        </div>

                        {/* Neutrals */}
                        <div className="grid grid-cols-6 gap-4">
                            {[
                                { name: 'Gray 100', color: '#F5F5F5' },
                                { name: 'Gray 200', color: '#E5E5E5' },
                                { name: 'Gray 400', color: '#A3A3A3' },
                                { name: 'Gray 600', color: '#525252' },
                                { name: 'Gray 800', color: '#262626' },
                                { name: 'Gray 900', color: '#171717' },
                            ].map(({ name, color }) => (
                                <div key={name}>
                                    <div
                                        className="h-16 rounded-xl mb-2"
                                        style={{ backgroundColor: color }}
                                    />
                                    <p className="text-xs text-gray-500">{name}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Typography */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-8">Typography</h2>
                        <div className="space-y-6 bg-white p-8 rounded-2xl">
                            <div>
                                <h1 className="text-6xl font-semibold text-gray-900 tracking-tight mb-2">Display</h1>
                                <code className="text-xs text-gray-500">60px / Semibold / Tight</code>
                            </div>
                            <div>
                                <h2 className="text-4xl font-semibold text-gray-900 mb-2">Heading 1</h2>
                                <code className="text-xs text-gray-500">36px / Semibold</code>
                            </div>
                            <div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Heading 2</h3>
                                <code className="text-xs text-gray-500">24px / Semibold</code>
                            </div>
                            <div>
                                <p className="text-lg text-gray-900 mb-2">Body Large</p>
                                <code className="text-xs text-gray-500">18px / Regular</code>
                            </div>
                            <div>
                                <p className="text-base text-gray-900 mb-2">Body</p>
                                <code className="text-xs text-gray-500">16px / Regular</code>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Caption</p>
                                <code className="text-xs text-gray-500">14px / Regular / Gray 600</code>
                            </div>
                        </div>
                    </section>

                    {/* Buttons */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-8">Buttons</h2>

                        <div className="bg-white p-8 rounded-2xl space-y-8">
                            {/* Primary Buttons */}
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-4">Primary</p>
                                <div className="flex items-center gap-4">
                                    <Button
                                        size="lg"
                                        className="bg-[#C9A76B] hover:bg-[#B8955A] text-white"
                                    >
                                        Large
                                    </Button>
                                    <Button
                                        size="md"
                                        className="bg-[#C9A76B] hover:bg-[#B8955A] text-white"
                                    >
                                        Medium
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-[#C9A76B] hover:bg-[#B8955A] text-white"
                                    >
                                        Small
                                    </Button>
                                    <Button
                                        size="md"
                                        disabled
                                        className="bg-[#C9A76B] text-white"
                                    >
                                        Disabled
                                    </Button>
                                </div>
                            </div>

                            {/* Secondary Buttons */}
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-4">Secondary</p>
                                <div className="flex items-center gap-4">
                                    <Button
                                        size="lg"
                                        variant="secondary"
                                        className="border-gray-300"
                                    >
                                        Large
                                    </Button>
                                    <Button
                                        size="md"
                                        variant="secondary"
                                        className="border-gray-300"
                                    >
                                        Medium
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="border-gray-300"
                                    >
                                        Small
                                    </Button>
                                    <Button
                                        size="md"
                                        variant="secondary"
                                        disabled
                                    >
                                        Disabled
                                    </Button>
                                </div>
                            </div>

                            {/* With Icons */}
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-4">With Icons</p>
                                <div className="flex items-center gap-4">
                                    <Button className="bg-[#C9A76B] hover:bg-[#B8955A] text-white">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Book Event
                                    </Button>
                                    <Button variant="secondary" className="border-gray-300">
                                        <Search className="h-4 w-4 mr-2" />
                                        Search
                                    </Button>
                                    <Button disabled>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Loading
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Form Inputs */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-8">Form Inputs</h2>

                        <div className="bg-white p-8 rounded-2xl">
                            <div className="max-w-md space-y-6">
                                <div>
                                    <Input
                                        label="Name"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div>
                                    <Input
                                        label="Email"
                                        type="email"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div>
                                    <Input
                                        label="Phone"
                                        error="Invalid phone number"
                                        defaultValue="123"
                                    />
                                </div>
                                <div>
                                    <Input
                                        label="Disabled"
                                        disabled
                                        placeholder="Not editable"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Cards */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-8">Cards</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Standard Card */}
                            <Card className="p-6 bg-white">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-[#C9A76B] flex items-center justify-center flex-shrink-0">
                                        <Calendar className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            Event Card
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Use for displaying event information with clear hierarchy
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Interactive Card */}
                            <Card
                                interactive
                                className="p-6 bg-white cursor-pointer"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-[#9CAF6E] flex items-center justify-center flex-shrink-0">
                                        <Star className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            Interactive Card
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Hover to see subtle elevation change
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </section>

                    {/* Badges */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-8">Badges</h2>

                        <div className="bg-white p-8 rounded-2xl space-y-6">
                            {/* Status Badges */}
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-4">Status</p>
                                <div className="flex flex-wrap gap-3">
                                    <Badge
                                        className="bg-[#9CAF6E] text-white"
                                    >
                                        <Check className="h-3 w-3 mr-1" />
                                        Confirmed
                                    </Badge>
                                    <Badge
                                        className="bg-[#F59E0B] text-white"
                                    >
                                        Pending
                                    </Badge>
                                    <Badge
                                        className="bg-[#FF5722] text-white"
                                    >
                                        <X className="h-3 w-3 mr-1" />
                                        Cancelled
                                    </Badge>
                                    <Badge
                                        className="bg-gray-100 text-gray-700"
                                    >
                                        Draft
                                    </Badge>
                                </div>
                            </div>

                            {/* Size Variants */}
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-4">Sizes</p>
                                <div className="flex items-center gap-3">
                                    <Badge size="sm" className="bg-[#C9A76B] text-white">
                                        Small
                                    </Badge>
                                    <Badge size="md" className="bg-[#C9A76B] text-white">
                                        Medium
                                    </Badge>
                                    <Badge size="lg" className="bg-[#C9A76B] text-white">
                                        Large
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* States */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-8">States</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Loading State */}
                            <Card className="p-8 bg-white">
                                <p className="text-sm font-medium text-gray-700 mb-4">Loading</p>
                                <div className="space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                                    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                                </div>
                            </Card>

                            {/* Empty State */}
                            <Card className="p-8 bg-white text-center">
                                <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm font-medium text-gray-900 mb-1">
                                    No results
                                </p>
                                <p className="text-xs text-gray-500">
                                    Try adjusting your search
                                </p>
                            </Card>
                        </div>
                    </section>

                    {/* Spacing */}
                    <section>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-8">Spacing Scale</h2>

                        <div className="bg-white p-8 rounded-2xl space-y-3">
                            {[
                                { value: '4px', name: 'xs' },
                                { value: '8px', name: 'sm' },
                                { value: '16px', name: 'md' },
                                { value: '24px', name: 'lg' },
                                { value: '32px', name: 'xl' },
                                { value: '48px', name: '2xl' },
                                { value: '64px', name: '3xl' },
                            ].map(({ value, name }) => (
                                <div key={name} className="flex items-center gap-6">
                                    <code className="text-xs text-gray-500 w-12">{value}</code>
                                    <div
                                        className="h-6 bg-[#C9A76B] rounded"
                                        style={{ width: value }}
                                    />
                                    <span className="text-sm text-gray-600">{name}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <footer className="mt-20 pt-8 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-500">Garden Table Design System</p>
                </footer>

            </div>
        </div>
    );
}
