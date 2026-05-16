import {
  Search,
  Bookmark,
  Briefcase,
  CheckCircle,
  Clock,
  Wallet,
  ArrowRightLeft,
  Award,
  Users,
  FileText,
  Database,
  BarChart3,
  Target,
  History,
  type LucideIcon
} from "lucide-react";

export interface NavSubLink {
  title: string;
  href: string;
  description?: string;
  icon?: LucideIcon;
}

export interface NavCategory {
  title?: string;
  items: NavSubLink[];
}

export interface NavLink {
  title: string;
  href?: string;
  categories?: NavCategory[];
}

export type NavConfigMap = {
  [key in 'PUBLIC' | 'WORKER' | 'EMPLOYER' | 'ADMIN']: NavLink[];
};

export const NAV_CONFIG: NavConfigMap = {
  PUBLIC: [
    { title: "Home", href: "/" },
    { title: "Marketplace", href: "/marketplace" },
    { title: "Find Talent", href: "/talent" },
    { title: "How It Works", href: "/#how-it-works" },
    { title: "Sign In", href: "/auth" },
    { title: "Join", href: "/auth?tab=register" },
  ],
  WORKER: [
    { title: "Dashboard", href: "/worker" },
    {
      title: "Gigs",
      categories: [
        {
          title: "Discover",
          items: [
            { title: "Recommended for You", href: "/worker/gigs/recommended", description: "Matches based on your algorithm profile", icon: Target },
            { title: "All Gigs", href: "/worker/gigs", description: "Browse the full marketplace", icon: Search },
            { title: "Saved Gigs", href: "/worker/gigs/saved", description: "Gigs you've bookmarked for later", icon: Bookmark },
          ]
        }
      ]
    },
    {
      title: "My Work",
      categories: [
        {
          title: "Execution Cycle",
          items: [
            { title: "My Applications", href: "/worker/applications", description: "Track your gig application status", icon: FileText },
            { title: "Active Assignments", href: "/worker/assignments", description: "Current work & evidence submission", icon: Briefcase },
            { title: "Completed Gigs", href: "/worker/history", description: "History of your finished work", icon: CheckCircle },
          ]
        }
      ]
    },
    /*{
      title: "Payments",
      categories: [
        {
          title: "M-Pesa Finances",
          items: [
            { title: "Earnings Overview", href: "/worker/payments", description: "Your payment history and overall income", icon: Wallet },
            { title: "Withdraw Funds", href: "/worker/withdraw", description: "Transfer funds to M-Pesa", icon: ArrowRightLeft },
          ]
        }
      ]
    },*/
    {
      title: "Learning",
      categories: [
        {
          title: "Growth",
          items: [
            { title: "Learning Hub", href: "/worker/learning-hub", description: "Verify skills, take modules, and earn badges", icon: Award },
          ]
        }
      ]
    },
    {
      title: "Insights",
      categories: [
        {
          items: [
            { title: "Analytics", href: "/worker/analytics", description: "Your performance metrics and trends", icon: BarChart3 },
            { title: "Reports", href: "/worker/reports", description: "Generate branded PDF reports", icon: FileText },
          ]
        }
      ]
    },
  ],
  EMPLOYER: [
    { title: "Dashboard", href: "/employer" },
    {
      title: "Gigs",
      categories: [
        {
          items: [
            { title: "Post a Gig", href: "/employer/gigs/new", description: "Create a new listing wizard", icon: FileText },
            { title: "Manage Gigs", href: "/employer/gigs", description: "List all active and past gigs", icon: Briefcase },
            { title: "Draft Gigs", href: "/employer/gigs/drafts", description: "Finish creating your saved gigs", icon: Clock },
          ]
        }
      ]
    },
    {
      title: "Applicants",
      categories: [
        {
          items: [
            { title: "Application Feed", href: "/employer/applicants-global", description: "Consolidated view of all candidates across your gigs", icon: Users },
            /*{ title: "Review & Matching", href: "/employer/applicants", description: "Evaluate candidate fit and matching breakdown", icon: Target },*/
          ]
        }
      ]
    },
    {
      title: "Hiring",
      categories: [
        {
          items: [
            { title: "Submitted Work", href: "/employer/reviews", description: "Review work submitted by workers", icon: CheckCircle },
            { title: "Hiring History", href: "/employer/history", description: "Archive of past gigs and workers", icon: History },
          ]
        }
      ]
    },
    {
      title: "Payments",
      categories: [
        {
          items: [
            { title: "Escrow Balance", href: "/employer/payments", description: "Current funds held in M-Pesa escrow", icon: Wallet },
            { title: "Payment History", href: "/employer/payments/history", description: "Outgoing payments to workers", icon: ArrowRightLeft },
            { title: "Deposit Funds", href: "/employer/payments/deposit", description: "Top up your M-Pesa escrow", icon: Database },
          ]
        }
      ]
    },
    {
      title: "Insights",
      categories: [
        {
          items: [
            { title: "Analytics", href: "/employer/analytics", description: "Hiring metrics and spending trends", icon: BarChart3 },
            { title: "Reports", href: "/employer/reports", description: "Generate branded PDF reports", icon: FileText },
          ]
        }
      ]
    },
  ],
  ADMIN: [
    { title: "Dashboard", href: "/admin" },
    /*{
      title: "Users",
      categories: [
        {
          items: [
            { title: "All Users", href: "/admin/users", icon: Users },
            { title: "Pending Verification", href: "/admin/users/pending", icon: AlertTriangle },
            { title: "Suspended Accounts", href: "/admin/users/suspended", icon: Flag },
          ]
        }
      ]
    },
    {
      title: "Platform",
      categories: [
        {
          title: "System Oversight",
          items: [
            { title: "All Gigs", href: "/admin/gigs", icon: Briefcase },
            { title: "Open Disputes", href: "/admin/disputes", description: "Cases needing mediation", icon: AlertTriangle },
            { title: "Analytics", href: "/admin/analytics", description: "Platform performance metrics", icon: BarChart3 },
            { title: "Reports", href: "/admin/reports", icon: BarChart },
          ]
        },
        {
          title: "Content & Settings",
          items: [
            { title: "Training & Badges", href: "/admin/content", icon: GraduationCap },
            { title: "Payment Rules", href: "/admin/settings/payments", icon: Wallet },
            { title: "General Settings", href: "/admin/settings", icon: Settings },
          ]
        }
      ]
    }*/
  ]
};
