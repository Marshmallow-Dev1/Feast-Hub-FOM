export const FAMILY_MINISTRIES = [
  { value: "awesome_kids", label: "Awesome Kids Ministry", description: "For children and families with young kids" },
  { value: "youth", label: "Youth Ministry", description: "For teenagers and young adults" },
  { value: "singles", label: "Singles Ministry", description: "For single adults" },
  { value: "couples", label: "Couples Ministry", description: "For married couples" },
  { value: "grandlane", label: "Grandlane Ministry", description: "For senior citizens" },
  { value: "armours_of_god", label: "Armours of God", description: "For single parents" },
] as const;

export const SERVICE_MINISTRIES = [
  {
    value: "worship",
    label: "Worship Ministry",
    description: "Leads the congregation in praise and worship through music. We serve with our voices and instruments to create an atmosphere of prayer and celebration.",
  },
  {
    value: "dance",
    label: "Dance Ministry",
    description: "Expresses worship through liturgical and contemporary dance. Open to all who love movement and want to use it as an offering to God.",
  },
  {
    value: "awesome_kids_service",
    label: "Awesome Kids Ministry",
    description: "Serves and cares for children during the Feast. If you love kids and want to help them encounter God early in life, this is for you.",
  },
  {
    value: "liturgical",
    label: "Liturgical Ministry",
    description: "Serves during the Holy Mass as lectors, altar servants, and extraordinary ministers. A ministry of reverence and humble service at the altar.",
  },
  {
    value: "production",
    label: "Production Ministry",
    description: "Handles the technical side of the Feast — lights, visuals, live streaming, cameras, and more. Keeps everything running smoothly behind the scenes.",
  },
  {
    value: "creatives",
    label: "Creatives Ministry",
    description: "Creates content that shares the Good News through social media, graphic design, photography, and marketing materials.",
  },
  {
    value: "security_logistics",
    label: "Security & Logistics",
    description: "Ensures the safety and smooth flow of every Sunday service — crowd management, venue setup, and logistics.",
  },
  {
    value: "food",
    label: "Food Ministry",
    description: "Provides meals, snacks, and hospitality. A ministry of love expressed through feeding and welcoming others.",
  },
  {
    value: "intercessory",
    label: "Intercessory Ministry",
    description: "Prayer warriors who intercede for the community through novenas, prayer chains, and Catholic devotionals.",
  },
  {
    value: "pastoral_care",
    label: "Pastoral Care Ministry",
    description: "Provides spiritual and emotional support to members going through challenges. A ministry of compassionate presence and care.",
  },
  {
    value: "engagers",
    label: "Engagers Ministry",
    description: "The welcoming face of The Feast! Greets, assists, and makes every first-timer and regular attendee feel at home every Sunday.",
  },
] as const;

export type FamilyMinistryValue = typeof FAMILY_MINISTRIES[number]["value"];
export type ServiceMinistryValue = typeof SERVICE_MINISTRIES[number]["value"];

export const HOW_HEARD_OPTIONS = [
  { value: "friend", label: "Invited by a friend" },
  { value: "family", label: "Invited by a family member" },
  { value: "social_media", label: "Social media (Facebook, Instagram, TikTok)" },
  { value: "poster_tarpaulin", label: "Poster or tarpaulin" },
  { value: "walk_in", label: "Walk-in / passed by" },
  { value: "other", label: "Other" },
] as const;

export const LG_SCHEDULE_DAYS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday (after Feast session)" },
] as const;

export const LG_TIME_PREFERENCES = [
  { value: "morning", label: "Morning (6AM - 12PM)" },
  { value: "afternoon", label: "Afternoon (12PM - 6PM)" },
  { value: "evening", label: "Evening (6PM - 10PM)" },
] as const;

export const OFFERING_TYPES = [
  { value: "tithe", label: "Tithe" },
  { value: "love_offering", label: "Love Offering" },
  { value: "special_offering", label: "Special Offering" },
] as const;

// Dashboard route role access
export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  connect_head: "Connect Ministry",
  family_ministry_head: "Family Ministry Head",
  service_ministry_head: "Service Ministry Head",
  lg_head: "LG Head",
  finance: "Finance Team",
};
