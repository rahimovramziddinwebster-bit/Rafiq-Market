import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

export const stripe: Stripe | null = key
  ? new Stripe(key, { apiVersion: "2026-04-22.dahlia", typescript: true })
  : null;
