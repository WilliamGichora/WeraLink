/**
 * WeraLink Gig Seeder
 *
 * Seeds 25 starter gigs and links them to existing employers and skills dynamically.
 * Uses a Prisma $transaction to ensure that either all gigs are created, or none are (rollback on failure).
 *
 * Run with: node prisma/seed-gigs.js
 */

import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/index.js";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categoryMap = {
  TRANSLATION: "Translation",
  MARKETING: "Marketing",
  DATA_ENTRY: "Data Entry",
  BUG_HUNTING: "QA Testing",
  AI_LABELING: "AI & Data Labeling",
  RESEARCH: "Research",
};

const getFutureDate = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

const GIG_DATA = [
  // --- TRANSLATION ---
  {
    title: "Translate 5-page legal NDA document to Swahili",
    description: "Looking for an expert to translate a legally binding Non-Disclosure Agreement from English to Swahili. Must preserve the exact legal context. Length is approximately 2500 words.",
    category: "TRANSLATION",
    workType: "REMOTE",
    location: "Global Virtual",
    payAmount: 2000,
    evidenceTemplate: [{ label: "Translated PDF/Doc", type: "FILE", required: true, tag: "trans_1" }]
  },
  {
    title: "Localize FinTech App UI Strings to English",
    description: "We have an app built in Swahili. We need all the JSON language files localized to English appropriately.",
    category: "TRANSLATION",
    workType: "REMOTE",
    location: "Virtual",
    payAmount: 3500,
    evidenceTemplate: [{ label: "Localized JSON file", type: "FILE", required: true, tag: "trans_2" }]
  },
  {
    title: "Translate 10-minute Agriculture Podcast to Swahili",
    description: "Listen to our 10-minute podcast on modern farming techniques and provide a transcribed Swahili text document.",
    category: "TRANSLATION",
    workType: "REMOTE",
    location: "Kenya",
    payAmount: 1500,
    evidenceTemplate: [{ label: "Translated Text Document", type: "FILE", required: true, tag: "trans_3" }]
  },
  {
    title: "E-commerce Product Description Translation",
    description: "Translate 50 product descriptions from English to Swahili for our new online store.",
    category: "TRANSLATION",
    workType: "REMOTE",
    location: "Kenya",
    payAmount: 1000,
    evidenceTemplate: [{ label: "Product Descriptions File", type: "FILE", required: true, tag: "trans_4" }]
  },

  // --- MARKETING ---
  {
    title: "Create 3 Instagram Reels for a new Cafe in Kilimani",
    description: "We need someone to come to our newly opened cafe in Kilimani and shoot/edit 3 engaging Instagram Reels to attract youth.",
    category: "MARKETING",
    workType: "ON_SITE",
    location: "Kilimani, Nairobi",
    payAmount: 3000,
    evidenceTemplate: [{ label: "Video Links (Google Drive)", type: "LINK", required: true, tag: "mkt_1" }]
  },
  {
    title: "Write 5 Twitter Threads for a SaaS Startup Launch",
    description: "We are launching a new B2B SaaS tool. Need an engaging storyteller to write 5 interconnected Twitter threads for the launch week.",
    category: "MARKETING",
    workType: "REMOTE",
    location: "Virtual",
    payAmount: 2500,
    evidenceTemplate: [{ label: "Threads Document", type: "FILE", required: true, tag: "mkt_2" }]
  },
  {
    title: "Design 4 LinkedIn Carousel Posts for Real Estate",
    description: "Design 4 high-quality PDF carousels for LinkedIn detailing the benefits of investing in off-plan properties.",
    category: "MARKETING",
    workType: "REMOTE",
    location: "Virtual",
    payAmount: 2000,
    evidenceTemplate: [{ label: "PDF Carousels", type: "FILE", required: true, tag: "mkt_3" }]
  },
  {
    title: "Manage Facebook Ads Content for a Weekend Event",
    description: "Create engaging ad copy and source 3 royalty-free images for our upcoming weekend tech boot camp.",
    category: "MARKETING",
    workType: "REMOTE",
    location: "Virtual",
    payAmount: 5000,
    evidenceTemplate: [{ label: "Ad Copy & Images link", type: "LINK", required: true, tag: "mkt_4" }]
  },
  {
    title: "Social Media Campaign for Boma Yangu Affordable Housing",
    description: "Create an awareness campaign tailored for Kenyan youth detailing how to apply for the government's Boma Yangu affordable housing initiative. Need 2 short-form videos and 5 graphics explaining the registration process.",
    category: "MARKETING",
    workType: "REMOTE",
    location: "Kenya",
    payAmount: 4500,
    evidenceTemplate: [
      { label: "Campaign Strategies Doc", type: "FILE", required: true, tag: "mkt_5_1" },
      { label: "Content Drive Link", type: "LINK", required: true, tag: "mkt_5_2" }
    ]
  },

  // --- DATA ENTRY ---
  {
    title: "Transcribe 50 handwritten inventory pages to CSV",
    description: "We will provide scanned PDFs of our warehouse inventory. You need to carefully type them into a structured CSV file.",
    category: "DATA_ENTRY",
    workType: "REMOTE",
    location: "Virtual",
    payAmount: 4000,
    evidenceTemplate: [{ label: "Completed CSV File", type: "FILE", required: true, tag: "data_1" }]
  },
  {
    title: "Clean up messy customer database (1000 rows)",
    description: "Format names, properly set phone numbers to 254 format, and remove duplicates from our customer list.",
    category: "DATA_ENTRY",
    workType: "REMOTE",
    location: "Virtual",
    payAmount: 2500,
    evidenceTemplate: [{ label: "Cleaned Excel File", type: "FILE", required: true, tag: "data_2" }]
  },
  {
    title: "Product Data entry for Shopify Store (100 Items)",
    description: "We will provide a supplier catalog. Enter 100 products into our Shopify store via CSV import format (Title, Price, description, image link).",
    category: "DATA_ENTRY",
    workType: "REMOTE",
    location: "Virtual",
    payAmount: 2000,
    evidenceTemplate: [{ label: "Shopify Import CSV", type: "FILE", required: true, tag: "data_3" }]
  },
  {
    title: "Standardize Phone Numbers in Lead List",
    description: "Take an unordered list of 2000 phone numbers and ensure they all follow international dialing format.",
    category: "DATA_ENTRY",
    workType: "REMOTE",
    location: "Virtual",
    payAmount: 800,
    evidenceTemplate: [{ label: "Phone numbers CSV", type: "FILE", required: true, tag: "data_4" }]
  },

  // --- BUG HUNTING ---
  {
    title: "Test new Mobile Payment Gateway on Android",
    description: "Test M-Pesa integration on our demo app. Try edge cases like insufficient funds, timeout, etc.",
    category: "BUG_HUNTING",
    workType: "REMOTE",
    location: "Kenya",
    payAmount: 1500,
    evidenceTemplate: [
      { label: "Screen Recording Link", type: "LINK", required: true, tag: "bug_1_1" },
      { label: "Bug Report Text", type: "TEXT", required: true, tag: "bug_1_2" }
    ]
  },
  {
    title: "Find UI rendering issues on iOS Safari",
    description: "Browse our responsive website on an iPhone (Safari) and report layout shifts, clipping, or unclickable buttons.",
    category: "BUG_HUNTING",
    workType: "REMOTE",
    location: "Virtual",
    payAmount: 1000,
    evidenceTemplate: [{ label: "Screenshots File", type: "FILE", required: true, tag: "bug_2" }]
  },
  {
    title: "Stress Test Registration Form (Report 3 Edge Cases)",
    description: "Attempt SQL injection, XSS, and invalid inputs on our new registration form. Provide a report of vulnerabilities.",
    category: "BUG_HUNTING",
    workType: "REMOTE",
    location: "Virtual",
    payAmount: 1200,
    evidenceTemplate: [{ label: "Vulnerability Report", type: "FILE", required: true, tag: "bug_3" }]
  },
  {
    title: "QA Check Checkout Flow for local delivery app",
    description: "Go through the entire ordering and checkout process, adding multiple cart items, changing addresses, and canceling.",
    category: "BUG_HUNTING",
    workType: "REMOTE",
    location: "Virtual",
    payAmount: 2000,
    evidenceTemplate: [{ label: "QA Check Report", type: "FILE", required: true, tag: "bug_4" }]
  },

  // --- AI LABELING ---
  {
    title: "Draw Bounding Boxes on 500 Nairobi Traffic Images",
    description: "Label cars, matatus, pedestrians, and motorcycles in dashboard camera images.",
    category: "AI_LABELING",
    workType: "REMOTE",
    location: "Virtual",
    payAmount: 5000,
    evidenceTemplate: [{ label: "Label JSON", type: "FILE", required: true, tag: "ai_1" }]
  },
  {
    title: "Label 1000 images of local crops for disease detection",
    description: "Identify and tag healthy vs diseased leaves on maize and beans images using standard polygon tools.",
    category: "AI_LABELING",
    workType: "REMOTE",
    location: "Virtual",
    payAmount: 4000,
    evidenceTemplate: [{ label: "Annotations File", type: "FILE", required: true, tag: "ai_2" }]
  },
  {
    title: "Categorize text sentiment for 500 product reviews",
    description: "Read 500 short customer reviews and classify them as Positive, Neutral, or Negative in a spreadsheet.",
    category: "AI_LABELING",
    workType: "REMOTE",
    location: "Virtual",
    payAmount: 1500,
    evidenceTemplate: [{ label: "Sentiment CSV", type: "FILE", required: true, tag: "ai_3" }]
  },
  {
    title: "Identify audio transcription errors in 50 clips",
    description: "Listen to 50 short Swahili voice clips and fix the drafted text to correctly match the audio.",
    category: "AI_LABELING",
    workType: "REMOTE",
    location: "Virtual",
    payAmount: 2000,
    evidenceTemplate: [{ label: "Corrected Transcription file", type: "FILE", required: true, tag: "ai_4" }]
  },

  // --- RESEARCH ---
  {
    title: "Compile list of 50 active Angel Investors in Nairobi",
    description: "Research 50 individuals or firms actively investing in tech startups in Nairobi. Include contact emails and investment thesis.",
    category: "RESEARCH",
    workType: "REMOTE",
    location: "Virtual",
    payAmount: 3000,
    evidenceTemplate: [{ label: "Investors Spreadsheeet", type: "FILE", required: true, tag: "res_1" }]
  },
  {
    title: "Research competitor pricing for 5 local HR SaaS platforms",
    description: "Gather pricing tiers, feature lists, and any hidden costs for 5 requested local HR platforms.",
    category: "RESEARCH",
    workType: "REMOTE",
    location: "Virtual",
    payAmount: 2000,
    evidenceTemplate: [{ label: "Pricing Comparison Doc", type: "FILE", required: true, tag: "res_2" }]
  },
  {
    title: "Summarize Government policy on Digital Assets",
    description: "Read the latest 2025 Kenya Revenue Authority guidelines on digital assets and create a 2-page summary of implications.",
    category: "RESEARCH",
    workType: "REMOTE",
    location: "Virtual",
    payAmount: 1500,
    evidenceTemplate: [{ label: "Policy Summary PDF", type: "FILE", required: true, tag: "res_3" }]
  },
  {
    title: "Find 20 active B2B suppliers for electronics in Kenya",
    description: "Compile a list of 20 legitimate B2B wholesale electronics suppliers operating out of Nairobi/Mombasa.",
    category: "RESEARCH",
    workType: "REMOTE",
    location: "Virtual",
    payAmount: 2500,
    evidenceTemplate: [{ label: "Suppliers List", type: "FILE", required: true, tag: "res_4" }]
  }
];

async function main() {
  console.log("🌱 Starting WeraLink Gig Seeder (Robust Transaction Mode)...\n");

  const employers = await prisma.user.findMany({
    where: { role: "EMPLOYER" }
  });

  if (employers.length === 0) {
    console.error("❌ No Employers found in the database. Please register at least one employer before seeding gigs.");
    process.exit(1);
  }

  console.log(`Found ${employers.length} Employer(s) to distribute gigs to.`);

  const allSkills = await prisma.skill.findMany();

  if (allSkills.length === 0) {
    console.error("❌ No Skills found. Please make sure to run the pre-seed step (npm run seed) to populate the skills table.");
    process.exit(1);
  }

  console.log(`Found ${allSkills.length} Skills.`);

  try {
    // We run the entire insertion in a single transaction with increased timeout limits
    await prisma.$transaction(async (tx) => {

      let createdCount = 0;

      for (let i = 0; i < GIG_DATA.length; i++) {
        const gigSetup = GIG_DATA[i];
        
        // Round Robin distribution among employers
        const employer = employers[i % employers.length];

        // Fetch skills matching this gig's category
        const categoryUI = categoryMap[gigSetup.category];
        const categorySkills = allSkills.filter(s => s.category === categoryUI);

        // We use up to 3 skills for each gig, or just whatever is mapped
        const skillsToAttach = categorySkills.slice(0, 3).map(sk => ({
           skillId: sk.id,
           requiredLevel: 1
        }));

        await tx.gig.create({
          data: {
            title: gigSetup.title,
            description: gigSetup.description,
            category: gigSetup.category,
            workType: gigSetup.workType,
            location: gigSetup.location,
            payAmount: gigSetup.payAmount,
            currency: "KES",
            expiresAt: getFutureDate(14), // 2 weeks from now
            status: "OPEN",
            employerId: employer.id,
            evidenceTemplate: gigSetup.evidenceTemplate,
            skills: {
              create: skillsToAttach
            }
          }
        });

        createdCount++;
      }

      console.log(`\n✅ Successfully Seeded ${createdCount} Gigs!\n`);
    }, {
      maxWait: 20000, // 20 seconds max wait to start transaction
      timeout: 60000 // 60 seconds transaction max time
    });
    
  } catch (error) {
    console.error("❌ Transaction Failed. All partial changes have been rejected and rolled back.");
    console.error(error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
