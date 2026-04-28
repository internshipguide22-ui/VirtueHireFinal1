const STORAGE_PREFIX = "virtuehire_hr_subscription::";

export const HR_SUBSCRIPTION_PLANS = [
  {
    type: "FREE_TRIAL_3_MONTHS",
    label: "Free for 3 Months",
    durationDays: 90,
    priceLabel: "Free",
    description: "Start with full HR module access for 90 days at no cost.",
  },
  {
    type: "ONE_MONTH_SUBSCRIPTION",
    label: "1 Month Subscription",
    durationDays: 30,
    priceLabel: "Contact Sales",
    description: "Continue your HR access with a short 30-day renewal.",
  },
  {
    type: "THREE_MONTHS_SUBSCRIPTION",
    label: "3 Months Subscription",
    durationDays: 90,
    priceLabel: "Contact Sales",
    description: "Extend the HR module for another 90 days.",
  },
  {
    type: "ONE_YEAR_SUBSCRIPTION",
    label: "1 Year Subscription",
    durationDays: 365,
    priceLabel: "Contact Sales",
    description: "Keep the HR module active for a full year.",
  },
];

const getPlanByType = (planType) =>
  HR_SUBSCRIPTION_PLANS.find((plan) => plan.type === planType) || HR_SUBSCRIPTION_PLANS[0];

const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const getStorageKey = (identity) => `${STORAGE_PREFIX}${String(identity || "").trim().toLowerCase()}`;

export const getHrIdentity = (userOrEmail) => {
  if (!userOrEmail) return "";
  if (typeof userOrEmail === "string") return userOrEmail.trim().toLowerCase();
  if (userOrEmail.email) return String(userOrEmail.email).trim().toLowerCase();
  if (userOrEmail.id != null) return String(userOrEmail.id);
  return "";
};

const buildSubscription = (planType, startDate = new Date()) => {
  const plan = getPlanByType(planType);
  const startsAt = new Date(startDate);
  const endsAt = addDays(startsAt, plan.durationDays);

  return {
    planType: plan.type,
    planLabel: plan.label,
    durationDays: plan.durationDays,
    priceLabel: plan.priceLabel,
    description: plan.description,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
  };
};

const computeSubscriptionMeta = (subscription) => {
  const now = new Date();
  const end = new Date(subscription.endsAt);
  const diffMs = end.getTime() - now.getTime();
  const remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  return {
    ...subscription,
    isExpired: remainingDays === 0,
    remainingDays,
  };
};

export const getHrSubscription = (userOrEmail) => {
  const identity = getHrIdentity(userOrEmail);
  if (!identity) return null;

  const raw = localStorage.getItem(getStorageKey(identity));
  if (!raw) return null;

  try {
    return computeSubscriptionMeta(JSON.parse(raw));
  } catch {
    return null;
  }
};

export const activateHrSubscription = (userOrEmail, planType, startDate = new Date()) => {
  const identity = getHrIdentity(userOrEmail);
  if (!identity) return null;

  const subscription = buildSubscription(planType, startDate);
  localStorage.setItem(getStorageKey(identity), JSON.stringify(subscription));
  return computeSubscriptionMeta(subscription);
};

export const ensureHrSubscription = (userOrEmail) => {
  const existing = getHrSubscription(userOrEmail);
  if (existing) return existing;
  return activateHrSubscription(userOrEmail, "FREE_TRIAL_3_MONTHS");
};

export const attachHrSubscriptionToUser = (user) => {
  if (!user) return user;
  const subscription = ensureHrSubscription(user);
  return {
    ...user,
    hrSubscription: subscription,
    planType: subscription?.planLabel || user.planType || "Free for 3 Months",
  };
};

export const syncStoredHrUser = (user) => {
  const enhancedUser = attachHrSubscriptionToUser(user);
  if (!enhancedUser) return null;
  localStorage.setItem("current_hr_user", JSON.stringify(enhancedUser));
  localStorage.setItem("user", JSON.stringify(enhancedUser));
  return enhancedUser;
};
