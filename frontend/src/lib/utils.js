import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(dateString) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export function formatDateLong(dateString) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}

export function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getSubscriptionStatusColor(status) {
  const colors = {
    active: "bg-primary-container text-on-primary-container",
    cancelled: "bg-error-container text-on-error-container",
    past_due: "bg-secondary-container text-on-secondary-container",
    trialing: "bg-tertiary-container text-on-tertiary-container",
    incomplete: "bg-surface-container-highest text-on-surface-variant",
  };
  return colors[status] || colors.incomplete;
}

export function getMatchTypeLabel(matchCount) {
  const labels = {
    "5": "Grand Slam",
    "4": "Eagle Tier",
    "3": "Birdie Tier",
  };
  return labels[matchCount] || `${matchCount}-Match`;
}

export function getMatchTypeColor(matchCount) {
  const colors = {
    "5": "text-gradient-gold",
    "4": "text-primary",
    "3": "text-tertiary",
  };
  return colors[matchCount] || "text-on-surface";
}
