import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import Subscription from "../models/Subscription";
import CreditTransaction from "../models/CreditTransaction";
import stripe from "../config/stripe";
import Stripe from "stripe";

// Subscription plan details
const SUBSCRIPTION_PLANS = {
  regular: {
    name: "Regular Subscription",
    priceId: process.env.REGUALR_USER,
    trialDays: 7,
    initialCredits: 10, // Updated to 10 credits for trial
    monthlyCredits: 100,
    interval: "month",
    intervalCount: 1,
  },
  premium: {
    name: "Premium Subscription",
    priceId: process.env.PREMIUM_USER,
    trialDays: 10,
    initialCredits: 20, // Updated to 20 credits for trial
    monthlyCredits: 200,
    interval: "year",
    intervalCount: 1,
  },
};

// @desc    Get subscription plans
// @route   GET /api/subscription/plans
// @access  Public
export const getSubscriptionPlans = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        regular: {
          name: SUBSCRIPTION_PLANS.regular.name,
          trialDays: SUBSCRIPTION_PLANS.regular.trialDays,
          initialCredits: SUBSCRIPTION_PLANS.regular.initialCredits,
          monthlyCredits: SUBSCRIPTION_PLANS.regular.monthlyCredits,
          interval: SUBSCRIPTION_PLANS.regular.interval,
          price: 10,
        },
        premium: {
          name: SUBSCRIPTION_PLANS.premium.name,
          trialDays: SUBSCRIPTION_PLANS.premium.trialDays,
          initialCredits: SUBSCRIPTION_PLANS.premium.initialCredits,
          monthlyCredits: SUBSCRIPTION_PLANS.premium.monthlyCredits,
          interval: SUBSCRIPTION_PLANS.premium.interval,
          price: 20,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user active subscription
// @route   GET /api/subscription
// @access  Private
export const getUserSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Get subscription details from Stripe if user has a subscription
    let stripeSubscription: Stripe.Subscription | null = null;
    if (user.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(
          user.stripeSubscriptionId
        );
        stripeSubscription = subscription as Stripe.Subscription;
      } catch (error) {
        console.error("Error retrieving subscription from Stripe:", error);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        credits: user.credits,
        subscriptionType: user.subscriptionType,
        subscriptionStatus: user.subscriptionStatus,
        trialEndsAt: user.trialEndsAt,
        nextBillingDate: user.nextBillingDate,
        stripeSubscription: stripeSubscription
          ? {
              id: stripeSubscription.id,
              status: stripeSubscription.status,
              currentPeriodEnd: new Date(
                (stripeSubscription as any).current_period_end * 1000
              ),
              cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            }
          : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all user subscriptions
// @route   GET /api/subscription/all
// @access  Private
export const getAllUserSubscriptions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Get all subscriptions for the user
    const subscriptions = await Subscription.find({ user: user._id }).sort({
      createdAt: -1,
    });

    console.log('Found subscriptions:', subscriptions);

    // Get details from Stripe for each subscription
    const subscriptionsWithDetails = await Promise.all(
      subscriptions.map(async (sub) => {
        let stripeData = null;
        try {
          const stripeSub = await stripe.subscriptions.retrieve(
            sub.stripeSubscriptionId
          );
          stripeData = {
            status: stripeSub.status,
            currentPeriodEnd: new Date(
              (stripeSub as any).current_period_end * 1000
            ),
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          };
        } catch (error) {
          console.error(
            `Error retrieving subscription ${sub.stripeSubscriptionId} from Stripe:`,
            error
          );
        }

        return {
          id: sub._id,
          name: sub.name,
          subscriptionType: sub.subscriptionType,
          status: sub.status,
          isActive: sub.isActive,
          currentPeriodStart: sub.currentPeriodStart,
          currentPeriodEnd: sub.currentPeriodEnd,
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
          trialEnd: sub.trialEnd,
          stripeSubscriptionId: sub.stripeSubscriptionId,
          stripeData,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptionsWithDetails,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Activate a specific subscription
// @route   POST /api/subscription/activate/:id
// @access  Private
export const activateSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Find the subscription to activate
    const subscriptionToActivate = await Subscription.findOne({
      _id: id,
      user: user._id,
    });

    if (!subscriptionToActivate) {
      return res.status(404).json({
        success: false,
        error: "Subscription not found",
      });
    }

    // Check if subscription is valid in Stripe
    try {
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscriptionToActivate.stripeSubscriptionId
      );

      if (
        stripeSubscription.status !== "active" &&
        stripeSubscription.status !== "trialing"
      ) {
        return res.status(400).json({
          success: false,
          error: "Cannot activate a non-active subscription",
        });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: "Invalid subscription in Stripe",
      });
    }

    // Deactivate the current active subscription
    if (user.stripeSubscriptionId) {
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: user.stripeSubscriptionId },
        { isActive: false }
      );
    }

    // Activate the new subscription
    subscriptionToActivate.isActive = true;
    await subscriptionToActivate.save();

    // Update user with the new active subscription
    user.stripeSubscriptionId = subscriptionToActivate.stripeSubscriptionId;
    user.subscriptionType = subscriptionToActivate.subscriptionType;
    user.subscriptionStatus = subscriptionToActivate.status;

    // Update trial end date if applicable
    if (subscriptionToActivate.trialEnd) {
      user.trialEndsAt = subscriptionToActivate.trialEnd;
    }

    // Update next billing date
    user.nextBillingDate = subscriptionToActivate.currentPeriodEnd;

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        message: "Subscription activated successfully",
        subscription: {
          id: subscriptionToActivate._id,
          name: subscriptionToActivate.name,
          subscriptionType: subscriptionToActivate.subscriptionType,
          status: subscriptionToActivate.status,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create checkout session for subscription
// @route   POST /api/subscription/checkout
// @access  Private
export const createCheckoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { plan } = req.body;

    if (!plan || !["regular", "premium"].includes(plan)) {
      return res.status(400).json({
        success: false,
        error: "Invalid subscription plan",
      });
    }

    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // We now allow multiple subscriptions, so this check is removed

    // Create or retrieve Stripe customer
    let customer;
    if (user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });

      // Update user with Stripe customer ID
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    // Get subscription plan details
    const planDetails =
      SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS];
    console.log(planDetails);

    // Check if user has already had a trial
    const hasHadTrial = user.subscriptionStatus === 'active' ||
                        user.subscriptionStatus === 'trialing' ||
                        user.subscriptionStatus === 'canceled' ||
                        await Subscription.exists({ user: user._id });

    console.log('User has had trial:', hasHadTrial);

    // Create a unique identifier for this subscription
    const subscriptionReference = `sub_ref_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    console.log(`Creating checkout session with reference: ${subscriptionReference}`);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [
        {
          price: planDetails.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        // Only include trial period if user hasn't had a trial before
        ...(hasHadTrial ? {} : { trial_period_days: planDetails.trialDays }),
        metadata: {
          userId: user.id,
          plan,
          hasHadTrial: hasHadTrial ? 'true' : 'false',
          subscriptionReference,
        },
      },
      metadata: {
        userId: user.id,
        plan,
        subscriptionReference,
      },
      success_url: `${req.headers.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}&ref=${subscriptionReference}`,
      cancel_url: `${req.headers.origin}/subscription/cancel`,
    });

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Handle subscription webhook events
// @route   POST /api/subscription/webhook
// @access  Public
export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const signature = req.headers["stripe-signature"] as string;

  let event;

  try {
    // req.body is a raw buffer for webhooks
    const payload = req.body;

    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  console.log(`Received webhook event: ${event.type}`);
  console.log('Event data:', JSON.stringify(event.data.object, null, 2));

  switch (event.type) {
    case "customer.subscription.created":
      console.log('Handling subscription created event');
      await handleSubscriptionCreated(event.data.object);
      break;
    case "customer.subscription.updated":
      console.log('Handling subscription updated event');
      await handleSubscriptionUpdated(event.data.object);
      break;
    case "customer.subscription.deleted":
      console.log('Handling subscription deleted event');
      await handleSubscriptionDeleted(event.data.object);
      break;
    case "invoice.payment_succeeded":
      console.log('Handling invoice payment succeeded event');
      await handleInvoicePaymentSucceeded(event.data.object);
      break;
    case "invoice.payment_failed":
      console.log('Handling invoice payment failed event');
      await handleInvoicePaymentFailed(event.data.object);
      break;
    case "checkout.session.completed":
      console.log('Handling checkout session completed event');
      await handleCheckoutSessionCompleted(event.data.object);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
};

// Helper function to handle subscription created event
const handleSubscriptionCreated = async (subscription: Stripe.Subscription) => {
  console.log('Handling subscription created event', subscription);
  try {
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;
    const status = subscription.status;
    const plan = subscription.metadata.plan || "regular";
    const hasHadTrial = subscription.metadata.hasHadTrial === 'true';

    // Find user by Stripe customer ID
    const user = await User.findOne({ stripeCustomerId: customerId });

    if (!user) {
      console.error(`User not found for Stripe customer ID: ${customerId}`);
      return;
    }

    // Get plan details
    const planDetails =
      SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS];

    // Check if subscription already exists in database
    const existingSubscription = await Subscription.findOne({
      stripeSubscriptionId: subscriptionId
    });

    // If subscription already exists, don't create a duplicate
    if (existingSubscription) {
      console.log(`Subscription already exists in database: ${subscriptionId}`);
      console.log(`Existing subscription ID: ${existingSubscription._id}`);

      // Make sure the subscription is in the user's subscriptions array
      if (!user.subscriptions) {
        user.subscriptions = [];
      }

      const subscriptionExists = user.subscriptions.some(
        (subId) => subId.toString() === existingSubscription._id?.toString()
      );

      if (!subscriptionExists) {
        console.log(`Adding existing subscription ${existingSubscription._id} to user's subscriptions array`);
        user.subscriptions.push(existingSubscription._id as any);
        await user.save();
      }

      return; // Exit early to prevent duplicate creation
    }

    // Check if user already has a subscription with the same plan
    // If the plan is different, we'll create a new subscription
    const existingPlanSubscription = await Subscription.findOne({
      user: user._id,
      subscriptionType: plan
    });

    if (existingPlanSubscription) {
      console.log(`User already has a ${plan} subscription: ${existingPlanSubscription._id}`);
      console.log(`Creating new subscription anyway since it has a different Stripe ID`);
    }

    console.log(`Creating new subscription record for: ${subscriptionId}`);

    // Create subscription record
    const newSubscription = await Subscription.create({
      user: user._id,
      name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription`,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      subscriptionType: plan,
      status,
      isActive: true, // Set this new subscription as active
      currentPeriodStart: new Date(
        (subscription as any).current_period_start * 1000
      ),
      currentPeriodEnd: new Date(
        (subscription as any).current_period_end * 1000
      ),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialStart: subscription.trial_start
        ? new Date(subscription.trial_start * 1000)
        : undefined,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : undefined,
    });

    console.log(`New subscription created with ID: ${newSubscription._id}`);

    // If user already has an active subscription, deactivate it
    if (user.stripeSubscriptionId) {
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: user.stripeSubscriptionId },
        { isActive: false }
      );
    }

    // Update user subscription details
    user.stripeSubscriptionId = subscriptionId;
    user.subscriptionType =
      plan === "regular" || plan === "premium" ? plan : "regular";
    user.subscriptionStatus = status as any;

    // Set trial end date if applicable
    if (subscription.trial_end) {
      user.trialEndsAt = new Date(subscription.trial_end * 1000);
    }

    // Set next billing date
    user.nextBillingDate = new Date(
      (subscription as any).current_period_end * 1000
    );

    // Add initial credits based on plan
    user.credits += planDetails.initialCredits;

    // Add subscription to user's subscriptions array
    if (!user.subscriptions) {
      user.subscriptions = [];
    }

    // Check if subscription already exists in the array to avoid duplicates
    const subscriptionExists = user.subscriptions.some(
      (subId) => subId.toString() === newSubscription?._id?.toString()
    );

    if (!subscriptionExists) {
      user.subscriptions.push(newSubscription._id as any);
      console.log('Added subscription to user subscriptions array:', newSubscription._id);
    }

    await user.save();

    // Record credit transaction
    await CreditTransaction.create({
      user: user._id,
      amount: planDetails.initialCredits,
      type: "subscription",
      description: `Initial credits for ${plan} subscription`,
      reference: subscriptionId,
    });

    console.log(`Subscription created for user: ${user._id}`);
  } catch (error) {
    console.error("Error handling subscription created event:", error);
  }
};

// Helper function to handle subscription updated event
const handleSubscriptionUpdated = async (subscription: Stripe.Subscription) => {
  try {
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;
    const status = subscription.status;

    // Find user by Stripe customer ID
    const user = await User.findOne({ stripeCustomerId: customerId });

    if (!user) {
      console.error(`User not found for Stripe customer ID: ${customerId}`);
      return;
    }

    // Update user subscription status
    user.subscriptionStatus = status as any;

    // Update trial end date if applicable
    if (subscription.trial_end) {
      user.trialEndsAt = new Date(subscription.trial_end * 1000);
    }

    // Update next billing date
    user.nextBillingDate = new Date(
      (subscription as any).current_period_end * 1000
    );

    await user.save();

    // Update subscription record
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscriptionId },
      {
        status,
        currentPeriodStart: new Date(
          (subscription as any).current_period_start * 1000
        ),
        currentPeriodEnd: new Date(
          (subscription as any).current_period_end * 1000
        ),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : undefined,
      }
    );

    console.log(`Subscription updated for user: ${user._id}`);
  } catch (error) {
    console.error("Error handling subscription updated event:", error);
  }
};

// Helper function to handle subscription deleted event
const handleSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
  try {
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;

    // Find user by Stripe customer ID
    const user = await User.findOne({ stripeCustomerId: customerId });

    if (!user) {
      console.error(`User not found for Stripe customer ID: ${customerId}`);
      return;
    }

    // Update user subscription details
    user.subscriptionStatus = "none";
    user.subscriptionType = "none";
    user.stripeSubscriptionId = undefined;
    user.trialEndsAt = undefined;
    user.nextBillingDate = undefined;

    await user.save();

    // Update subscription record
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscriptionId },
      {
        status: "canceled",
        canceledAt: new Date(),
      }
    );

    console.log(`Subscription deleted for user: ${user._id}`);
  } catch (error) {
    console.error("Error handling subscription deleted event:", error);
  }
};

// Helper function to handle invoice payment succeeded event
const handleInvoicePaymentSucceeded = async (invoice: Stripe.Invoice) => {
  try {
    // Only process subscription invoices
    if ((invoice as any).subscription) {
      const customerId = invoice.customer;
      const subscriptionId = (invoice as any).subscription;

      // Find user by Stripe customer ID
      const user = await User.findOne({ stripeCustomerId: customerId });

      if (!user) {
        console.error(`User not found for Stripe customer ID: ${customerId}`);
        return;
      }

      // Get subscription to determine plan
      const subscription = await Subscription.findOne({
        stripeSubscriptionId: subscriptionId,
      });

      if (!subscription) {
        console.error(`Subscription not found: ${subscriptionId}`);
        return;
      }

      // Add credits based on plan
      const plan = subscription.subscriptionType;
      const planDetails =
        SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS];

      // Only add credits if it's not the first invoice (which is for the trial)
      if (
        !invoice.billing_reason ||
        invoice.billing_reason !== "subscription_create"
      ) {
        user.credits += planDetails.monthlyCredits;
        await user.save();

        // Record credit transaction
        await CreditTransaction.create({
          user: user._id,
          amount: planDetails.monthlyCredits,
          type: "subscription",
          description: `Monthly credits for ${plan} subscription`,
          reference: subscriptionId,
        });

        console.log(
          `Added ${planDetails.monthlyCredits} credits to user: ${user._id}`
        );
      }
    }
  } catch (error) {
    console.error("Error handling invoice payment succeeded event:", error);
  }
};

// Helper function to handle invoice payment failed event
const handleInvoicePaymentFailed = async (invoice: Stripe.Invoice) => {
  try {
    if ((invoice as any).subscription) {
      const customerId = invoice.customer;
      const subscriptionId = (invoice as any).subscription;

      // Find user by Stripe customer ID
      const user = await User.findOne({ stripeCustomerId: customerId });

      if (!user) {
        console.error(`User not found for Stripe customer ID: ${customerId}`);
        return;
      }

      // Update user subscription status
      user.subscriptionStatus = "past_due";
      await user.save();

      // Update subscription record
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: subscriptionId },
        { status: "past_due" }
      );

      console.log(`Subscription payment failed for user: ${user._id}`);
    }
  } catch (error) {
    console.error("Error handling invoice payment failed event:", error);
  }
};

// Helper function to handle checkout session completed event
const handleCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session
) => {
  try {
    // Only process credit purchase sessions (one-time payments)
    if (session.mode === "payment" && session.metadata?.creditPackage) {
      // const customerId = session.customer; // Not used
      const userId = session.metadata.userId;
      // const creditPackage = session.metadata.creditPackage; // Not used
      const creditsToAdd = parseInt(session.metadata.credits || "0");

      // Find user by ID
      const user = await User.findById(userId);

      if (!user) {
        console.error(`User not found for ID: ${userId}`);
        return;
      }

      // Add credits to user
      user.credits += creditsToAdd;
      await user.save();

      // Record credit transaction
      await CreditTransaction.create({
        user: user._id,
        amount: creditsToAdd,
        type: "purchase",
        description: `Purchased ${creditsToAdd} credits`,
        reference: session.id,
      });

      console.log(`Added ${creditsToAdd} credits to user: ${user._id}`);
    }
  } catch (error) {
    console.error("Error handling checkout session completed event:", error);
  }
};

// @desc    Cancel subscription
// @route   POST /api/subscription/cancel
// @access  Private
export const cancelSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        error: "No active subscription found",
      });
    }

    // Cancel subscription at period end
    const subscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      }
    );

    // Update subscription record
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: user.stripeSubscriptionId },
      { cancelAtPeriodEnd: true }
    );

    res.status(200).json({
      success: true,
      data: {
        message:
          "Subscription will be canceled at the end of the billing period",
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: new Date(
          (subscription as any).current_period_end * 1000
        ),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Resume canceled subscription
// @route   POST /api/subscription/resume
// @access  Private
export const resumeSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        error: "No subscription found",
      });
    }

    // Resume subscription by removing cancel_at_period_end
    const subscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      {
        cancel_at_period_end: false,
      }
    );

    // Update subscription record
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: user.stripeSubscriptionId },
      { cancelAtPeriodEnd: false }
    );

    res.status(200).json({
      success: true,
      data: {
        message: "Subscription resumed successfully",
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a test subscription (for debugging)
// @route   POST /api/subscription/debug/create
// @access  Private
export const createTestSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { plan } = req.body;

    if (!plan || !["regular", "premium"].includes(plan)) {
      return res.status(400).json({
        success: false,
        error: "Invalid subscription plan",
      });
    }

    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Create a fake Stripe subscription ID
    const fakeSubscriptionId = `test_sub_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Create subscription record
    const newSubscription = await Subscription.create({
      user: user._id,
      name: `Test ${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription`,
      stripeCustomerId: user.stripeCustomerId || 'test_customer',
      stripeSubscriptionId: fakeSubscriptionId,
      subscriptionType: plan,
      status: 'active',
      isActive: false, // Not active by default
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      cancelAtPeriodEnd: false,
    });

    // Add subscription to user's subscriptions array
    if (!user.subscriptions) {
      user.subscriptions = [];
    }

    user.subscriptions.push(newSubscription._id as any);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Test subscription created successfully',
      data: newSubscription,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all subscriptions in database (for debugging)
// @route   GET /api/subscription/debug
// @access  Private
export const debugAllSubscriptions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get all subscriptions in the database
    const allSubscriptions = await Subscription.find().sort({
      createdAt: -1,
    });

    // Get the user's subscriptions array
    const user = await User.findById(req.user?.id);

    res.status(200).json({
      success: true,
      count: allSubscriptions.length,
      userSubscriptionsArray: user?.subscriptions || [],
      data: allSubscriptions,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Sync Stripe subscriptions with database
// @route   POST /api/subscription/sync
// @access  Private
export const syncSubscriptions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (!user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        error: "No Stripe customer ID found for this user",
      });
    }

    console.log(`Syncing subscriptions for user: ${user._id} (${user.email})`);

    // Get all subscriptions from Stripe for this customer
    const stripeSubscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'all',
      expand: ['data.default_payment_method']
    });

    console.log(`Found ${stripeSubscriptions.data.length} subscriptions in Stripe`);

    // Get all subscriptions from database for this user
    const dbSubscriptions = await Subscription.find({ user: user._id });
    console.log(`Found ${dbSubscriptions.length} subscriptions in database`);

    // Track new subscriptions added
    const newSubscriptionsAdded = [];

    // Process each Stripe subscription
    for (const stripeSub of stripeSubscriptions.data) {
      // Check if this subscription exists in the database
      const existingSubscription = dbSubscriptions.find(
        (dbSub) => dbSub.stripeSubscriptionId === stripeSub.id
      );

      if (!existingSubscription) {
        try {
          console.log(`Adding missing subscription from Stripe: ${stripeSub.id}`);
          console.log('Stripe subscription data:', JSON.stringify({
            id: stripeSub.id,
            status: stripeSub.status,
            current_period_start: (stripeSub as any).current_period_start,
            current_period_end: (stripeSub as any).current_period_end,
            trial_start: stripeSub.trial_start,
            trial_end: stripeSub.trial_end,
            metadata: stripeSub.metadata
          }, null, 2));

          // Get plan from metadata or default to regular
          const plan = stripeSub.metadata?.plan || "regular";

          // Safely convert timestamps to dates with validation
          const safelyCreateDate = (timestamp: number | null | undefined): Date | undefined => {
            if (!timestamp) return undefined;

            const date = new Date(timestamp * 1000);
            // Validate the date is valid
            if (isNaN(date.getTime())) {
              console.warn(`Invalid timestamp: ${timestamp}`);
              return undefined;
            }
            return date;
          };

          const currentPeriodStart = safelyCreateDate((stripeSub as any).current_period_start);
          const currentPeriodEnd = safelyCreateDate((stripeSub as any).current_period_end);
          const trialStart = safelyCreateDate(stripeSub.trial_start);
          const trialEnd = safelyCreateDate(stripeSub.trial_end);

          // If we don't have valid dates for required fields, use current date
          const now = new Date();
          const oneMonthFromNow = new Date();
          oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

          // Create subscription record
          const newSubscription = await Subscription.create({
            user: user._id,
            name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription`,
            stripeCustomerId: user.stripeCustomerId,
            stripeSubscriptionId: stripeSub.id,
            subscriptionType: plan,
            status: stripeSub.status,
            isActive: false, // Not active by default
            currentPeriodStart: currentPeriodStart || now,
            currentPeriodEnd: currentPeriodEnd || oneMonthFromNow,
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
            trialStart: trialStart,
            trialEnd: trialEnd,
          });

          // Add to user's subscriptions array if not already there
          if (!user.subscriptions) {
            user.subscriptions = [];
          }

          user.subscriptions.push(newSubscription._id as any);
          newSubscriptionsAdded.push(newSubscription);
        } catch (error) {
          console.error(`Error creating subscription record for ${stripeSub.id}:`, error);
          // Continue with the next subscription instead of failing the entire sync
        }
      }
    }

    // Save user if we added any subscriptions
    if (newSubscriptionsAdded.length > 0) {
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: `Sync complete. Added ${newSubscriptionsAdded.length} subscriptions.`,
      newSubscriptions: newSubscriptionsAdded,
      stripeSubscriptionsCount: stripeSubscriptions.data.length,
      dbSubscriptionsCount: dbSubscriptions.length,
    });
  } catch (err) {
    console.error('Error syncing subscriptions:', err);
    next(err);
  }
};

// @desc    Get credit transaction history
// @route   GET /api/subscription/credits/history
// @access  Private
export const getCreditHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const transactions = await CreditTransaction.find({
      user: req.user?.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Purchase credits directly (without subscription)
// @route   POST /api/subscription/credits/purchase
// @access  Private
export const purchaseCredits = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { package: creditPackage } = req.body;

    // Define available credit packages
    const CREDIT_PACKAGES = {
      small: {
        name: "Small Credit Package",
        credits: 20,
        price: 5.99,
        priceId: process.env.CREDIT_PACKAGE_SMALL,
      },
      medium: {
        name: "Medium Credit Package",
        credits: 50,
        price: 12.99,
        priceId: process.env.CREDIT_PACKAGE_MEDIUM,
      },
      large: {
        name: "Large Credit Package",
        credits: 100,
        price: 19.99,
        priceId: process.env.CREDIT_PACKAGE_LARGE,
      },
    };

    if (
      !creditPackage ||
      !["small", "medium", "large"].includes(creditPackage)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid credit package",
      });
    }

    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Create or retrieve Stripe customer
    let customer;
    if (user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });

      // Update user with Stripe customer ID
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    // Get credit package details
    const packageDetails =
      CREDIT_PACKAGES[creditPackage as keyof typeof CREDIT_PACKAGES];

    // Create checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: packageDetails.name,
              description: `${packageDetails.credits} Credits`,
            },
            unit_amount: Math.round(packageDetails.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        userId: user.id,
        creditPackage,
        credits: packageDetails.credits.toString(),
      },
      success_url: `${req.headers.origin}/subscription/success?type=credits&package=${creditPackage}`,
      cancel_url: `${req.headers.origin}/subscription/cancel`,
    });

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (err) {
    console.error("Error creating credit purchase session:", err);
    next(err);
  }
};
