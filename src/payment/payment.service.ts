import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  }

  async checkoutSession({
    customer_email,
    cancel_url = process.env.STRIPE_CANCEL_URL,
    success_url= process.env.STRIPE_SUCCESS_URL,
    line_items,
    metadata = {},
    discounts = [],
    mode = 'payment',
  }: Stripe.Checkout.SessionCreateParams) {
    const session = await this.stripe.checkout.sessions.create({
      customer_email,
      cancel_url,
      success_url,
      line_items,
      metadata,
      discounts,
      mode,
    });
    return session;
  }
}
