import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
    typescript: true,
});

/**
 * Process a refund for a booking
 */
export async function processRefund(
    paymentIntentId: string,
    amount: number,
    reason: 'requested_by_customer' | 'duplicate' | 'fraudulent' = 'requested_by_customer'
): Promise<{ success: boolean; refund?: Stripe.Refund; error?: string }> {
    try {
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: Math.round(amount * 100), // Convert to cents
            reason,
        });

        return { success: true, refund };
    } catch (error: any) {
        console.error('Stripe refund error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Process a partial refund
 */
export async function processPartialRefund(
    paymentIntentId: string,
    amount: number
): Promise<{ success: boolean; refund?: Stripe.Refund; error?: string }> {
    return processRefund(paymentIntentId, amount, 'requested_by_customer');
}

/**
 * Process a full refund
 */
export async function processFullRefund(
    paymentIntentId: string
): Promise<{ success: boolean; refund?: Stripe.Refund; error?: string }> {
    try {
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
        });

        return { success: true, refund };
    } catch (error: any) {
        console.error('Stripe refund error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Charge additional amount to existing payment method
 */
export async function chargeAdditionalAmount(
    customerId: string,
    paymentMethodId: string,
    amount: number,
    metadata?: Record<string, string>
): Promise<{ success: boolean; paymentIntent?: Stripe.PaymentIntent; error?: string }> {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'usd',
            customer: customerId,
            payment_method: paymentMethodId,
            off_session: true,
            confirm: true,
            metadata,
        });

        return { success: true, paymentIntent };
    } catch (error: any) {
        console.error('Stripe charge error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Calculate refund amount based on cancellation policy
 */
export function calculateRefundAmount(
    totalAmount: number,
    hoursUntilEvent: number,
    policy: 'FLEXIBLE' | 'MODERATE' | 'STRICT'
): number {
    switch (policy) {
        case 'FLEXIBLE':
            // Full refund if 24+ hours before
            return hoursUntilEvent >= 24 ? totalAmount : 0;

        case 'MODERATE':
            // Full refund if 7+ days before
            if (hoursUntilEvent >= 168) return totalAmount;
            // 50% refund if 24+ hours before
            if (hoursUntilEvent >= 24) return totalAmount * 0.5;
            return 0;

        case 'STRICT':
            // Full refund if 14+ days before
            return hoursUntilEvent >= 336 ? totalAmount : 0;

        default:
            return 0;
    }
}
