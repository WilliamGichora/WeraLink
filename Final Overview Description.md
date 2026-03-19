

Below is a text description of the project we will be undertaking in this workspace. I want to
give you the full description, so that you can synthesize, understand, and save this description in
your knowledge base, either in the .agent folder, or where you usually serve information like
this

WeraLink Platform – Comprehensive System Design Document
## 1. Introduction
WeraLink is a web-based micro-gig platform designed to tackle youth unemployment in Kenya.
It connects unemployed youth (workers) with employers offering small, short-term tasks
(“gigs”). The platform integrates with M-Pesa for secure escrow payments, provides
skill-building through training modules and badges, and is designed to eventually interface with
the Kenya Youth Employment and Opportunities Project (KYEOP). This document consolidates
all design artefacts produced during the project’s analysis and design phases, offering a
complete picture of the system’s architecture, functionality, and development roadmap.

## 2. System Overview
## Core Objectives:
Enable youth to register, build skill profiles, apply for gigs, submit work evidence, and receive
instant M-Pesa payments.
Allow employers to post gigs, specify required skills, review applicants, approve work, and
release payments.
Provide administrators with tools to manage users, resolve disputes, and generate reports.
Offer integrated learning modules to help youth acquire and verify skills.
Maintain a secure escrow-based payment system with automated M-Pesa transactions.
Ensure scalability, maintainability, and a clear upgrade path for future integration with KYEOP.

## Key Stakeholders
Youth Worker – seeks gigs, builds skills, earns money.
Employer – posts gigs, hires workers, manages payments.
System Administrator – oversees platform integrity, resolves disputes, monitors activity.
M-Pesa Gateway – external payment processor.

High-levelObjectives

- To design and implement a mobile-first registration and login module for workers and
employers and include skill-tagged user profiles.
- To develop a gig/job posting and listing module that enables employers to create micro-gigs
and workers to browse or filter gigs by skill tags, location etc.
- To implement a basic automated matching algorithm that recommends suitable workers for
posted gigs based on skills, requirements and location.
- To integrate a secure M-Pesa escrow and payout workflow that records all transactions and
enables instant worker payments upon verified gig completion.
- To build a simple skill-assessment module with at least three short quizzes and an automatic
digital badge award system for users who pass the assessments.
- To implement a lightweight rating and feedback system that allows employers to evaluate
completed gigs and automatically updates worker reliability scores.
- To generate standardized system reports, particularly monthly gig activity reports, worker
performance reports, and payment summaries that can be exported and viewed.


## Layer Technology Justification
Frontend React.js (with TypeScript)
## Backend Node.js + Express.js
Database PostgreSQL (via Supabase)
ORM Prisma
Authentication JWT + Supabase Auth (optional) Stateless, scalable, integrates with Supabase
File Storage Supabase Storage (S3-compatible)
Payments Safaricom Daraja API (M-Pesa) Standard for Kenyan payments, supports STK Push and
## B2C

## Note:
Frontend (Presentation): Built with React.js and Tailwind CSS, focused on a mobile-first
experience.Backend (Application): Powered by Node.js and Express.js. It acts as the "brain,"
handling matching algorithms, M-Pesa API orchestration via the Daraja SDK, and evidence
validation.Data (Persistence): Uses PostgreSQL (hosted on Supabase) for structured data and
Supabase Storage for "blob" data like photos or file evidence. Prisma ORM is used to mediate
between the backend and the database.

- User Interface Design (Potential Pages)

The web application will be responsive, targeting both smartphones and laptops. Below are the
anticipated pages grouped by user role.

## 7.1 Public / Unauthenticated
Landing Page – overview, how it works, featured gigs, call-to-action.
Register/Login – role-based sign-up (worker/employer).
About / Contact – platform information, support.

## 7.2 Youth Worker Pages

Dashboard – summary of applications, active assignments, earnings, recommended gigs.
Profile – view/edit bio, skills (add/remove skill levels), portfolio, badges earned.
Skill Assessment – take quizzes to earn skill badges.
Gig Marketplace – search/filter gigs, view details, apply.
My Applications – track status of applied gigs.
Active Assignment – details of accepted gig, submit evidence (upload files, form).
Payment History – list of completed gigs and payment status.
Training Modules – browse and take micro-courses.
Ratings Received – view feedback from employers.

## 7.3 Employer Pages

Dashboard – recent gig posts, applicants summary, spending overview.
Post a Gig – form to create a new gig (title, description, pay, skills required, deadline).
Manage Gigs – list of posted gigs with status (open, in progress, completed).
Applicants – view applicants for a gig, review profiles, assign worker.
Work Review – for an assigned gig, view submitted evidence, approve/reject.
Payment Dashboard – escrow status, release payment.
Reports – generate spending reports, worker performance summaries.

Ratings Given – track ratings left for workers.

## 7.4 Administrator Pages
Admin Dashboard – platform metrics (active users, gigs, transactions).

User Management – list all users, verify, suspend, activate.

Dispute Resolution – flagged assignments, review evidence, resolve disputes.

System Reports – generate audit logs, platform usage reports.

Content Management – manage training modules, badge definitions.

## 7.5 Common Components
Notification Panel – real-time alerts for gig matches, payment confirmations, etc.
Search Bar – global search for gigs (workers) or workers (employers).

N/B - The pages are not final and can be reviewed, edited, removed added, etc depending on
how well it aligns with the objectives
