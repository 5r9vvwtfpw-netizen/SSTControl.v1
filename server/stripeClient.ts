/**
 * Stripe Client Configuration for SST Colombia
 * Uses environment variables for Stripe credentials
 */

import Stripe from 'stripe';

function getCredentials() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.VITE_STRIPE_PUBLIC_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }

  if (!publishableKey) {
    throw new Error('VITE_STRIPE_PUBLIC_KEY environment variable is not set');
  }

  return {
    publishableKey,
    secretKey,
  };
}

// WARNING: Never cache this client.
// Always call this function again to get a fresh client.
// Use getUncachableStripeClient() for server-side operations with secret key
export async function getUncachableStripeClient() {
  const { secretKey } = getCredentials();

  return new Stripe(secretKey, {
    apiVersion: '2025-04-30.basil' as any,
  });
}

// Use getStripePublishableKey() for client-side operations
export async function getStripePublishableKey() {
  const { publishableKey } = getCredentials();

  return publishableKey;
}

// Use getStripeSecretKey() for server-side operations requiring the secret key
export async function getStripeSecretKey() {
  const { secretKey } = getCredentials();
  return secretKey;
}

// StripeSync singleton for webhook processing and data sync
let stripeSync: any = null;

export async function getStripeSync() {
  if (!stripeSync) {
    const { StripeSync } = await import('stripe-replit-sync');
    const secretKey = await getStripeSecretKey();

    stripeSync = new StripeSync({
      poolConfig: {
        connectionString: process.env.DATABASE_URL!,
        max: 2,
      },
      stripeSecretKey: secretKey,
    });
  }
  return stripeSync;
}
