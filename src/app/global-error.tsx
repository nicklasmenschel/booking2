'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
                    <div className="text-center max-w-md">
                        <h1 className="text-6xl font-bold text-gray-900 mb-4">500</h1>
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                            Critical Error
                        </h2>
                        <p className="text-gray-600 mb-8">
                            We encountered a critical error. Please refresh the page or contact support if the problem persists.
                        </p>
                        <button
                            onClick={reset}
                            className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800"
                        >
                            Refresh page
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
