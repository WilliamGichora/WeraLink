import {
  Search,
  Bookmark,
  Briefcase,
  CheckCircle,
  Clock,
  Wallet,
  ArrowRightLeft,
  GraduationCap,
  Award,
  Medal,
  User,
  Settings,
  Star,
  Users,
  FileText,
  AlertTriangle,
  Flag,
  Database,
  BarChart,
  Target
} from "lucide-react";
import React from "react";

export interface NavSubLink {
  title: string;
  href: string;
  description?: string;
  icon?: React.ElementType;
}

export interface NavCategory {
  title?: string;
  items: NavSubLink[];
}

export interface NavLink {
  title: string;
  href?: string; // If undefined, it acts as a dropdown trigger
  categories?: NavCategory[];
}

export type NavConfigMap = {
  [key in 'PUBLIC' | 'WORKER' | 'EMPLOYER' | 'ADMIN']: NavLink[];
};

export const NAV_CONFIG: NavConfigMap = {
  PUBLIC: [
    { title: "Home", href: "/" },
    { title: "How It Works", href: "/#how-it-works" },
    { title: "Gigs", href: "/gigs" },
    { title: "About", href: "/about" },
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
    {
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
    },
    {
      title: "Learning",
      categories: [
        {
          title: "Growth",
          items: [
            { title: "Skill Assessments", href: "/worker/learning/assessments", description: "Take quizzes to earn new badges", icon: Award },
            { title: "Training Modules", href: "/worker/learning/modules", description: "Short micro-courses to upskill", icon: GraduationCap },
            { title: "My Badges", href: "/worker/learning/badges", description: "View your earned achievements", icon: Medal },
          ]
        }
      ]
    },
    {
      title: "Profile",
      categories: [
        {
          items: [
            { title: "View Profile", href: "/worker/profile", icon: User },
            { title: "Edit Profile", href: "/worker/profile/edit", icon: Settings },
            { title: "Ratings Received", href: "/worker/profile/ratings", icon: Star },
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
            { title: "All Applicants", href: "/employer/applicants", description: "View across all your active gigs", icon: Users },
            { title: "Pending Reviews", href: "/employer/applicants/pending", description: "Awaiting your decision", icon: AlertTriangle },
          ]
        }
      ]
    },
    {
      title: "Work Review",
      categories: [
        {
          items: [
            { title: "Submitted Work", href: "/employer/review", description: "Assignments with pending evidence", icon: CheckCircle },
            { title: "Ready for Approval", href: "/employer/review/approval", description: "Final check before releasing payment", icon: Star },
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
      title: "Reports",
      categories: [
        {
          items: [
            { title: "Spending Report", href: "/employer/reports/spending", icon: BarChart },
            { title: "Worker Performance", href: "/employer/reports/performance", icon: Star },
          ]
        }
      ]
    },
  ],
  ADMIN: [
    { title: "Dashboard", href: "/admin" },
    {
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
            { title: "Audit Log & Reports", href: "/admin/reports", icon: BarChart },
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
    }
  ]
};
