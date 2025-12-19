import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <h1 className="text-9xl font-bold text-gray-900 mb-4">404</h1>
                <h2 className="text-3xl font-semibold text-gray-700 mb-4">
                    Page Not Found
                </h2>
                <p className="text-gray-600 mb-8">
                    Sorry, we couldn't find the page you're looking for. It may have been moved or deleted.
                </p>
                <div className="space-x-4">
                    <Link href="/">
                        <Button variant="default">Go Home</Button>
                    </Link>
                    <Link href="/discover">
                        <Button variant="outline">Browse Events</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
