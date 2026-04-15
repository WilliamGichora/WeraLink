/**
 * WeraLink Skill Seeder
 *
 * Seeds the predefined Skill lookup table with curated skills
 * mapped to each of the 6 MVP gig categories (the "Golden 6").
 *
 * Run with: npm run seed
 * (Configured via the "prisma.seed" key in package.json)
 *
 * Idempotent: uses upsert so it can be run multiple times safely.
 */

import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/index.js";

const { Pool } = pg;

// Build the Prisma client with the PgBouncer adapter (same pattern as config/prisma.js)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SKILLS = [
  // --- TRANSLATION ---
  { name: "Swahili Proficiency", category: "Translation" },
  { name: "English Proficiency", category: "Translation" },
  { name: "Localization", category: "Translation" },
  { name: "Proofreading", category: "Translation" },

  // --- MARKETING (Social Media / Micro-Content) ---
  { name: "Social Media Management", category: "Marketing" },
  { name: "Content Creation", category: "Marketing" },
  { name: "Graphic Design", category: "Marketing" },
  { name: "Copywriting", category: "Marketing" },

  // --- DATA ENTRY / CLEANING ---
  { name: "Data Entry", category: "Data Entry" },
  { name: "Data Cleaning", category: "Data Entry" },
  { name: "Excel & Spreadsheets", category: "Data Entry" },
  { name: "CSV Formatting", category: "Data Entry" },
  { name: "Attention to Detail", category: "Data Entry" },

  // --- BUG HUNTING / QA TESTING ---
  { name: "Bug Reporting", category: "QA Testing" },
  { name: "Manual Testing", category: "QA Testing" },
  { name: "Web Testing", category: "QA Testing" },
  { name: "Mobile App Testing", category: "QA Testing" },
  { name: "Technical Writing", category: "QA Testing" },

  // --- AI DATASET TAGGING / IMAGE LABELING ---
  { name: "Image Labeling", category: "AI & Data Labeling" },
  { name: "Data Annotation", category: "AI & Data Labeling" },
  { name: "JSON Formatting", category: "AI & Data Labeling" },
  { name: "Bounding Box Tagging", category: "AI & Data Labeling" },

  // --- ACADEMIC / ONLINE RESEARCH ---
  { name: "Online Research", category: "Research" },
  { name: "Report Writing", category: "Research" },
  { name: "Academic Writing", category: "Research" },
  { name: "Source Verification", category: "Research" },
  { name: "PDF Formatting", category: "Research" },
];

async function main() {
  console.log("🌱 Starting WeraLink Skill Seeder...\n");

  let created = 0;
  let skipped = 0;

  for (const skill of SKILLS) {
    const existing = await prisma.skill.findUnique({
      where: { name: skill.name },
    });

    if (existing) {
      console.log(`  ⏭️  Skipped (exists): [${skill.category}] ${skill.name}`);
      skipped++;
    } else {
      await prisma.skill.create({
        data: { name: skill.name, category: skill.category },
      });
      console.log(`  ✅ Created: [${skill.category}] ${skill.name}`);
      created++;
    }
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`   Created: ${created} skill(s)`);
  console.log(`   Skipped: ${skipped} skill(s) (already existed)`);
  console.log(`   Total:   ${SKILLS.length} skill(s) processed\n`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
