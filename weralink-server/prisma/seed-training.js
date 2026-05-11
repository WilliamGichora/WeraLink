import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/index.js";
import 'dotenv/config'; // Load .env for DATABASE_URL

const { Pool } = pg;

// Build the Prisma client with the PgBouncer adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Training Module & Badges...');

  // 1. Find Data Entry skill
  let skill = await prisma.skill.findUnique({
    where: { name: 'Data Entry' }
  });

  if (!skill) {
    skill = await prisma.skill.create({
      data: { name: 'Data Entry', category: 'Data Entry' }
    });
  }

  // 2. Create Standard Badge
  const badgeName = 'Data Entry Expert';
  let badge = await prisma.badge.findUnique({
    where: { name: badgeName }
  });

  if (!badge) {
    badge = await prisma.badge.create({
      data: {
        name: badgeName,
        description: 'Demonstrated advanced proficiency and accuracy in Data Entry via the WeraLink Verification Assessment.',
        criteria: 'Score 90% or above in the Data Entry Quality Standard Assessment.',
      }
    });
    console.log(`Created badge: ${badge.name}`);
  }

  const intermediateBadgeName = 'Data Entry Specialist';
  let intBadge = await prisma.badge.findUnique({
    where: { name: intermediateBadgeName }
  });

  if (!intBadge) {
    intBadge = await prisma.badge.create({
      data: {
        name: intermediateBadgeName,
        description: 'Demonstrated proficiency in Data Entry via the WeraLink Verification Assessment.',
        criteria: 'Score 80-89% in the Data Entry Quality Standard Assessment.',
      }
    });
    console.log(`Created badge: ${intBadge.name}`);
  }

  // 3. Create Training Module
  let module = await prisma.trainingModule.findFirst({
    where: { skillId: skill.id, title: 'Data Entry Quality Standards' }
  });

  if (!module) {
    module = await prisma.trainingModule.create({
      data: {
        title: 'Data Entry Quality Standards',
        skillId: skill.id,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder URL
        docUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Lightweight PDF
        passScore: 80,
        isActive: true,
      }
    });
    console.log(`Created training module: ${module.title}`);

    // 4. Create Questions (8 Hard/Intermediate Questions)
    const questions = [
      {
        text: 'When encountering a blurry or illegible word in a source document, what is the standard protocol for transcription according to WeraLink guidelines?',
        options: [
          { text: 'Guess the word based on context to maintain flow.', isCorrect: false },
          { text: 'Leave it blank and skip to the next readable word.', isCorrect: false },
          { text: 'Insert an [illegible] tag or specific placeholder defined in the brief.', isCorrect: true },
          { text: 'Highlight the entire sentence in red and notify the employer immediately.', isCorrect: false }
        ]
      },
      {
        text: 'In a spreadsheet containing thousands of rows, you identify a systemic date formatting error (e.g., DD/MM/YYYY mixed with MM/DD/YYYY). How should this be resolved efficiently?',
        options: [
          { text: 'Manually review and retype each date to ensure 100% accuracy.', isCorrect: false },
          { text: 'Use data validation and text-to-columns/Power Query to standardize the format.', isCorrect: true },
          { text: 'Leave the dates as they are, as long as the data is preserved.', isCorrect: false },
          { text: 'Delete the column to avoid data corruption and notify the employer.', isCorrect: false }
        ]
      },
      {
        text: 'What is the primary difference between a VLOOKUP and an INDEX-MATCH function, and why is the latter often preferred in advanced data entry tasks?',
        options: [
          { text: 'INDEX-MATCH can only look up values from left to right, making it safer.', isCorrect: false },
          { text: 'VLOOKUP requires the lookup value to be in the first column of the range, while INDEX-MATCH is fully dynamic and two-directional.', isCorrect: true },
          { text: 'VLOOKUP is significantly faster on large datasets than INDEX-MATCH.', isCorrect: false },
          { text: 'There is no functional difference; it is purely a matter of syntax preference.', isCorrect: false }
        ]
      },
      {
        text: 'A client provides a PDF table with merged cells that need to be extracted into a flat CSV format. How should merged cells be handled?',
        options: [
          { text: 'Unmerge the cells and fill the value down/across to all corresponding rows/columns to maintain relational integrity.', isCorrect: true },
          { text: 'Keep the merged cells in the CSV by using commas to separate the empty cells.', isCorrect: false },
          { text: 'Assign the value to the first cell and leave the rest blank to save time.', isCorrect: false },
          { text: 'Skip the row containing the merged cell to avoid database parsing errors.', isCorrect: false }
        ]
      },
      {
        text: 'If you are required to deduplicate a client list containing 50,000 records, which sequence of actions is the most robust?',
        options: [
          { text: 'Sort by name, visually scan for duplicates, and delete rows manually.', isCorrect: false },
          { text: 'Apply Conditional Formatting to highlight duplicates, then use the "Remove Duplicates" tool based on a unique composite key (e.g., Email + Phone).', isCorrect: true },
          { text: 'Copy the entire list into a Word document and use the "Find and Replace" function.', isCorrect: false },
          { text: 'Delete any record that shares the same First Name and Last Name immediately.', isCorrect: false }
        ]
      },
      {
        text: 'What is the most effective way to prevent leading zeros from being dropped when importing a CSV file containing phone numbers or zip codes into Excel?',
        options: [
          { text: 'Format the column as "Accounting" after importing.', isCorrect: false },
          { text: 'Import the data using the Data Wizard and explicitly set the column data format to "Text".', isCorrect: true },
          { text: 'Change the file extension from .csv to .xlsx before opening it.', isCorrect: false },
          { text: 'Type a space before every phone number in the source file.', isCorrect: false }
        ]
      },
      {
        text: 'When entering confidential PII (Personally Identifiable Information), which of the following practices violates basic data security principles?',
        options: [
          { text: 'Using a secure VPN while accessing the employer’s database.', isCorrect: false },
          { text: 'Storing temporary, unencrypted working copies of the dataset on a personal desktop.', isCorrect: true },
          { text: 'Locking your computer screen whenever you step away from your desk.', isCorrect: false },
          { text: 'Using two-factor authentication to access the work portal.', isCorrect: false }
        ]
      },
      {
        text: 'You receive raw survey data where multiple responses for a single question are stored in one cell, comma-separated. The required output is a normalized database table. What must you do?',
        options: [
          { text: 'Leave it as comma-separated, since databases handle CSV fields natively.', isCorrect: false },
          { text: 'Split the values into separate columns, expanding the dataset horizontally.', isCorrect: false },
          { text: 'Perform a pivot operation and sum the values.', isCorrect: false },
          { text: 'Use a split/delimiting function and unpivot the data so each response has its own row (One-to-Many normalization).', isCorrect: true }
        ]
      }
    ];

    for (const q of questions) {
      await prisma.question.create({
        data: {
          moduleId: module.id,
          text: q.text,
          options: {
            create: q.options
          }
        }
      });
    }
    console.log('Created 8 hard/intermediate questions for the module.');
  } else {
    console.log('Training module already exists. Skipping creation.');
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
