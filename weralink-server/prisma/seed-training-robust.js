/**
 * WeraLink Robust Training Module Seeder
 *
 * Seeds high-quality training modules, assessments, and badges across the 6 core categories.
 * Features:
 * - ACID Compliance via Prisma Transactions.
 * - Relevant YouTube videos (30-60 mins).
 * - Tiered Badge System (Expert/Specialist).
 * - High-quality MCQ assessments.
 *
 * Run with: node prisma/seed-training-robust.js
 */

import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/index.js";
import 'dotenv/config';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TRAINING_DATA = [
  {
    category: "Translation",
    skillName: "Localization",
    badgeExpert: {
      name: "Localization Expert",
      description: "Demonstrated advanced mastery of software and cultural localization principles.",
      criteria: "Score 90% or above in the Localization Proficiency Assessment."
    },
    badgeSpecialist: {
      name: "Localization Specialist",
      description: "Demonstrated proficiency in adapting content for specific locales and cultures.",
      criteria: "Score 80-89% in the Localization Proficiency Assessment."
    },
    module: {
      title: "Localization Proficiency & Cultural Adaptation",
      videoUrl: "https://www.youtube.com/embed/5Y64qW8g8YI",
      docUrl: "https://www.easygenerator.com/wp-content/uploads/2021/11/Localization-Checklist.pdf",
      passScore: 80,
      questions: [
        {
          text: "What is the primary objective of 'Localization' compared to simple translation?",
          options: [
            { text: "Translating words literally without changing the format.", isCorrect: false },
            { text: "Adapting content, visuals, and functionality to meet the cultural and linguistic expectations of a specific locale.", isCorrect: true },
            { text: "Making sure the text fits in the same amount of space.", isCorrect: false },
            { text: "Converting audio files into text format.", isCorrect: false }
          ]
        },
        {
          text: "In the context of software localization, what does 'i18n' (Internationalization) represent?",
          options: [
            { text: "The process of translating the UI into 18 different languages.", isCorrect: false },
            { text: "Designing and developing a product so that it can be easily localized for different cultures.", isCorrect: true },
            { text: "A specific file format for storing translation strings.", isCorrect: false },
            { text: "The final step of Quality Assurance in a translation project.", isCorrect: false }
          ]
        },
        {
          text: "Why is 'hard-coding' strings (text) directly into software code considered a major barrier to localization?",
          options: [
            { text: "It makes the software run faster but harder to read.", isCorrect: false },
            { text: "It prevents translators from accessing and changing the text without modifying the source code.", isCorrect: true },
            { text: "It causes the app to crash on non-English operating systems.", isCorrect: false },
            { text: "It is actually the preferred method for modern localized apps.", isCorrect: false }
          ]
        },
        {
          text: "Which of the following is a 'cultural nuance' that should be addressed during localization?",
          options: [
            { text: "Date and time formats (e.g., DD/MM/YYYY vs MM/DD/YYYY).", isCorrect: false },
            { text: "Currency symbols and conversion rates.", isCorrect: false },
            { text: "Symbolism of colors and icons in different regions.", isCorrect: false },
            { text: "All of the above.", isCorrect: true }
          ]
        },
        {
          text: "What does a 'String Freeze' signify in a localization project workflow?",
          options: [
            { text: "A bug where the app stops responding to touch input.", isCorrect: false },
            { text: "A point in the development cycle where no more new text can be added, allowing translations to catch up.", isCorrect: true },
            { text: "The process of encrypting translation files for security.", isCorrect: false },
            { text: "When a translator refuses to work on a specific difficult word.", isCorrect: false }
          ]
        }
      ]
    }
  },
  {
    category: "Marketing",
    skillName: "Content Creation",
    badgeExpert: {
      name: "Content Creation Expert",
      description: "Mastered the art of strategic content production and multi-platform engagement.",
      criteria: "Score 90% or above in the Content Creation Strategy Assessment."
    },
    badgeSpecialist: {
      name: "Content Creation Specialist",
      description: "Proficient in producing engaging digital content for social platforms.",
      criteria: "Score 80-89% in the Content Creation Strategy Assessment."
    },
    module: {
      title: "Content Creation Strategy & Growth",
      videoUrl: "https://www.youtube.com/embed/3-zJm16LdF0",
      docUrl: "https://generationunified.org/wp-content/uploads/2020/06/Content-Creation-Workbook.pdf",
      passScore: 80,
      questions: [
        {
          text: "In social media video content (TikTok/Reels), what is the 'Hook'?",
          options: [
            { text: "The call to action at the end of the video.", isCorrect: false },
            { text: "The first 1-3 seconds designed to stop the user from scrolling.", isCorrect: true },
            { text: "The music track used in the background.", isCorrect: false },
            { text: "The link in the bio of the creator.", isCorrect: false }
          ]
        },
        {
          text: "What is the primary benefit of 'Batching' content production?",
          options: [
            { text: "It allows you to post everything at the same time.", isCorrect: false },
            { text: "It increases efficiency by grouping similar tasks together, saving time on setup and creative flow.", isCorrect: true },
            { text: "It helps the algorithm understand your niche better.", isCorrect: false },
            { text: "It guarantees that a video will go viral.", isCorrect: false }
          ]
        },
        {
          text: "Which of these engagement metrics is generally considered a stronger signal to modern algorithms than a 'Like'?",
          options: [
            { text: "Views.", isCorrect: false },
            { text: "Saves and Shares.", isCorrect: true },
            { text: "Profile clicks.", isCorrect: false },
            { text: "The number of followers you have.", isCorrect: false }
          ]
        },
        {
          text: "What defines a 'Content Pillar' in a brand's social media strategy?",
          options: [
            { text: "A high-performing video that gets over 1 million views.", isCorrect: false },
            { text: "A core theme or topic area that the brand consistently creates content around to build authority.", isCorrect: true },
            { text: "A specific hashtag that is used in every post.", isCorrect: false },
            { text: "The profile picture of the brand.", isCorrect: false }
          ]
        },
        {
          text: "Why is 'Repurposing' content (e.g., turning a YouTube video into 5 Reels) a critical strategy?",
          options: [
            { text: "To hide the fact that you have no new ideas.", isCorrect: false },
            { text: "To maximize the reach and lifespan of a single creative asset across different platforms with minimal extra effort.", isCorrect: true },
            { text: "Because platforms penalize you if you only post once.", isCorrect: false },
            { text: "To confuse the algorithm into thinking you are more active.", isCorrect: false }
          ]
        }
      ]
    }
  },
  {
    category: "Data Entry",
    skillName: "Excel & Spreadsheets",
    badgeExpert: {
      name: "Excel & Spreadsheets Expert",
      description: "Demonstrated advanced mastery of data manipulation, formulas, and analysis in Excel.",
      criteria: "Score 90% or above in the Advanced Spreadsheets Assessment."
    },
    badgeSpecialist: {
      name: "Excel & Spreadsheets Specialist",
      description: "Proficient in spreadsheet management and data formatting.",
      criteria: "Score 80-89% in the Advanced Spreadsheets Assessment."
    },
    module: {
      title: "Advanced Excel & Data Management",
      videoUrl: "https://www.youtube.com/embed/e7xGuGqgp-Q",
      docUrl: "https://training.it.ufl.edu/media/trainingitufledu/public-files/Excel-Intermediate-Handout.pdf",
      passScore: 80,
      questions: [
        {
          text: "Which Excel function is best suited for looking up a value in a column and returning a corresponding value from another column?",
          options: [
            { text: "SUMIF", isCorrect: false },
            { text: "VLOOKUP or XLOOKUP", isCorrect: true },
            { text: "COUNTIF", isCorrect: false },
            { text: "CONCATENATE", isCorrect: false }
          ]
        },
        {
          text: "What is the primary purpose of a 'Pivot Table' in Excel?",
          options: [
            { text: "To draw complex graphs and charts manually.", isCorrect: false },
            { text: "To summarize, analyze, explore, and present large amounts of data dynamically.", isCorrect: true },
            { text: "To format cells with colors based on their value.", isCorrect: false },
            { text: "To protect the worksheet with a password.", isCorrect: false }
          ]
        },
        {
          text: "In a formula, what does the dollar sign ($) signify (e.g., $A$1)?",
          options: [
            { text: "The cell contains a currency value.", isCorrect: false },
            { text: "An absolute cell reference that does not change when the formula is copied.", isCorrect: true },
            { text: "The cell is locked for editing.", isCorrect: false },
            { text: "The value in the cell is a hidden variable.", isCorrect: false }
          ]
        },
        {
          text: "What would be the result of the formula: =CONCATENATE('Data', ' ', 'Analysis')?",
          options: [
            { text: "DataAnalysis", isCorrect: false },
            { text: "Data Analysis", isCorrect: true },
            { text: "Error: #VALUE!", isCorrect: false },
            { text: "AnalysisData", isCorrect: false }
          ]
        },
        {
          text: "Which Excel tool allows you to automatically remove duplicate records from a dataset based on selected columns?",
          options: [
            { text: "Conditional Formatting", isCorrect: false },
            { text: "Remove Duplicates (under the Data tab)", isCorrect: true },
            { text: "AutoFilter", isCorrect: false },
            { text: "Data Validation", isCorrect: false }
          ]
        }
      ]
    }
  },
  {
    category: "QA Testing",
    skillName: "Manual Testing",
    badgeExpert: {
      name: "Manual Testing Expert",
      description: "Mastered test case design, bug reporting, and Quality Assurance methodologies.",
      criteria: "Score 90% or above in the Manual Testing Fundamentals Assessment."
    },
    badgeSpecialist: {
      name: "Manual Testing Specialist",
      description: "Proficient in identifying and reporting software defects through manual testing.",
      criteria: "Score 80-89% in the Manual Testing Fundamentals Assessment."
    },
    module: {
      title: "Manual Testing & QA Fundamentals",
      videoUrl: "https://www.youtube.com/embed/U6pL8Z6Y9E0",
      docUrl: "https://www.softwaretestinghelp.com/wp-content/uploads/2018/11/Manual-Testing-Guide.pdf",
      passScore: 80,
      questions: [
        {
          text: "What is 'Regression Testing'?",
          options: [
            { text: "Testing a new feature for the first time.", isCorrect: false },
            { text: "Re-running previously passed tests to ensure that new code changes haven't broken existing functionality.", isCorrect: true },
            { text: "Testing how the app performs under high stress.", isCorrect: false },
            { text: "Testing the app without any documentation.", isCorrect: false }
          ]
        },
        {
          text: "What is the key characteristic of 'Black Box Testing'?",
          options: [
            { text: "The tester has full access to the source code.", isCorrect: false },
            { text: "The tester focuses on the input and output of the software without knowing its internal code structure.", isCorrect: true },
            { text: "Testing that happens only in the dark.", isCorrect: false },
            { text: "Testing done by a specialized AI bot.", isCorrect: false }
          ]
        },
        {
          text: "In a professional bug report, what does 'Severity' describe?",
          options: [
            { text: "How soon the developer should fix the bug.", isCorrect: false },
            { text: "The technical impact of the bug on the system's ability to function.", isCorrect: true },
            { text: "How angry the customer will be about the bug.", isCorrect: false },
            { text: "The number of lines of code affected.", isCorrect: false }
          ]
        },
        {
          text: "What is the purpose of 'Smoke Testing'?",
          options: [
            { text: "To see if the server starts smoking under pressure.", isCorrect: false },
            { text: "Initial high-level testing to ensure that the most critical functions of the application work before starting deeper testing.", isCorrect: true },
            { text: "Testing the UI layout for alignment issues.", isCorrect: false },
            { text: "The final test before releasing to the public.", isCorrect: false }
          ]
        },
        {
          text: "When should a tester mark a test case as 'Blocked'?",
          options: [
            { text: "When the test fails consistently.", isCorrect: false },
            { text: "When a bug in another part of the system prevents the tester from reaching the feature they need to test.", isCorrect: true },
            { text: "When the tester is too busy to finish the test.", isCorrect: false },
            { text: "When the employer cancels the gig.", isCorrect: false }
          ]
        }
      ]
    }
  },
  {
    category: "AI & Data Labeling",
    skillName: "Data Annotation",
    badgeExpert: {
      name: "Data Annotation Expert",
      description: "Mastered high-precision data labeling for advanced machine learning models.",
      criteria: "Score 90% or above in the Data Annotation & RLHF Assessment."
    },
    badgeSpecialist: {
      name: "Data Annotation Specialist",
      description: "Proficient in accurate image tagging and text classification for AI training.",
      criteria: "Score 80-89% in the Data Annotation & RLHF Assessment."
    },
    module: {
      title: "Data Annotation & AI Training Ethics",
      videoUrl: "https://www.youtube.com/embed/bef5sCFZmi8",
      docUrl: "https://arxiv.org/pdf/2306.05942.pdf",
      passScore: 80,
      questions: [
        {
          text: "What does 'RLHF' stand for in the context of training LLMs (Large Language Models)?",
          options: [
            { text: "Real-time Logical Human Flow", isCorrect: false },
            { text: "Reinforcement Learning from Human Feedback", isCorrect: true },
            { text: "Relative Learning High Fidelity", isCorrect: false },
            { text: "Remote Labeling for Human Filtering", isCorrect: false }
          ]
        },
        {
          text: "What is a 'Bounding Box' in the context of computer vision annotation?",
          options: [
            { text: "A box that contains the entire dataset.", isCorrect: false },
            { text: "A rectangular frame drawn around a specific object in an image to identify its location and size.", isCorrect: true },
            { text: "A tool used to crop an image for social media.", isCorrect: false },
            { text: "A filter that removes background noise.", isCorrect: false }
          ]
        },
        {
          text: "Why is 'Consistency' vital in a data labeling project?",
          options: [
            { text: "To make the project finish faster.", isCorrect: false },
            { text: "To ensure that the machine learning model receives clear, non-contradictory signals for learning patterns.", isCorrect: true },
            { text: "To satisfy the employer's aesthetic preferences.", isCorrect: false },
            { text: "It is not actually vital; variation helps the AI learn.", isCorrect: false }
          ]
        },
        {
          text: "What is 'Semantic Segmentation' in image annotation?",
          options: [
            { text: "Drawing a box around a car.", isCorrect: false },
            { text: "Assigning a specific class (e.g., 'road', 'sidewalk', 'tree') to every single pixel in an image.", isCorrect: true },
            { text: "Writing a caption for the image.", isCorrect: false },
            { text: "Identifying the emotional tone of the image.", isCorrect: false }
          ]
        },
        {
          text: "How can human annotator bias negatively affect an AI model?",
          options: [
            { text: "It makes the model run slower.", isCorrect: false },
            { text: "It can introduce systemic prejudices and inaccuracies into the model's decision-making process.", isCorrect: true },
            { text: "It increases the cost of data storage.", isCorrect: false },
            { text: "Bias is actually beneficial for AI creativity.", isCorrect: false }
          ]
        }
      ]
    }
  },
  {
    category: "Research",
    skillName: "Online Research",
    badgeExpert: {
      name: "Online Research Expert",
      description: "Mastered advanced search techniques, source verification, and analytical synthesis.",
      criteria: "Score 90% or above in the Advanced Online Research Assessment."
    },
    badgeSpecialist: {
      name: "Online Research Specialist",
      description: "Proficient in gathering and verifying reliable information from digital sources.",
      criteria: "Score 80-89% in the Advanced Online Research Assessment."
    },
    module: {
      title: "Advanced Online Research & Verification",
      videoUrl: "https://www.youtube.com/embed/TEqYnV6KWfY",
      docUrl: "https://lib.purdue.edu/sites/default/files/how_to_research.pdf",
      passScore: 80,
      questions: [
        {
          text: "What does the Google search operator 'site:weralink.com' do?",
          options: [
            { text: "Finds the owner of the domain.", isCorrect: false },
            { text: "Restricts all search results to only those found on that specific website.", isCorrect: true },
            { text: "Finds other websites that look like WeraLink.", isCorrect: false },
            { text: "Reports the website for spam.", isCorrect: false }
          ]
        },
        {
          text: "Which of the following is considered a 'Primary Source' in research?",
          options: [
            { text: "A textbook summarizing historical events.", isCorrect: false },
            { text: "A first-hand account or original document (e.g., a diary, original data, or raw interview).", isCorrect: true },
            { text: "An encyclopedia article.", isCorrect: false },
            { text: "A social media post discussing a news article.", isCorrect: false }
          ]
        },
        {
          text: "What is 'Lateral Reading'?",
          options: [
            { text: "Reading a document from left to right very carefully.", isCorrect: false },
            { text: "Opening new tabs to research the source's credibility and claims on other independent websites.", isCorrect: true },
            { text: "Reading the footnotes of a book.", isCorrect: false },
            { text: "Skipping the introduction and jumping to the conclusion.", isCorrect: false }
          ]
        },
        {
          text: "What is the purpose of Boolean operators (AND, OR, NOT) in search queries?",
          options: [
            { text: "To translate the search query into different languages.", isCorrect: false },
            { text: "To refine and control the scope of search results by combining or excluding specific keywords.", isCorrect: true },
            { text: "To speed up the internet connection.", isCorrect: false },
            { text: "To check the spelling of the search terms.", isCorrect: false }
          ]
        },
        {
          text: "How should you handle information that appears on a 'sponsored' or 'ad' result in a search engine?",
          options: [
            { text: "Trust it completely because companies pay for accuracy.", isCorrect: false },
            { text: "Treat it with skepticism and verify it against independent, non-sponsored sources.", isCorrect: true },
            { text: "Never use sponsored results for any purpose.", isCorrect: false },
            { text: "Assume it is the most popular result because it is at the top.", isCorrect: false }
          ]
        }
      ]
    }
  }
];

async function main() {
  console.log('🚀 Starting Robust Training & Badge Seeding...');

  try {
    await prisma.$transaction(async (tx) => {
      for (const data of TRAINING_DATA) {
        console.log(`\n--- Processing Category: ${data.category} ---`);

        // 1. Find or Create the Skill
        let skill = await tx.skill.findUnique({ where: { name: data.skillName } });
        if (!skill) {
          skill = await tx.skill.create({
            data: { name: data.skillName, category: data.category }
          });
          console.log(`✅ Created Skill: ${skill.name}`);
        }

        // 2. Upsert Expert Badge
        const expertBadge = await tx.badge.upsert({
          where: { name: data.badgeExpert.name },
          update: {
            description: data.badgeExpert.description,
            criteria: data.badgeExpert.criteria
          },
          create: data.badgeExpert
        });
        console.log(`✅ Upserted Expert Badge: ${expertBadge.name}`);

        // 3. Upsert Specialist Badge
        const specialistBadge = await tx.badge.upsert({
          where: { name: data.badgeSpecialist.name },
          update: {
            description: data.badgeSpecialist.description,
            criteria: data.badgeSpecialist.criteria
          },
          create: data.badgeSpecialist
        });
        console.log(`✅ Upserted Specialist Badge: ${specialistBadge.name}`);

        // 4. Create Training Module
        // We use deleteMany + create to ensure the module is "fresh" with updated questions
        // This is safe because it's in a transaction and idempotent for development
        const existingModule = await tx.trainingModule.findFirst({
            where: { skillId: skill.id, title: data.module.title }
        });

        if (existingModule) {
            await tx.trainingModule.delete({ where: { id: existingModule.id } });
            console.log(`♻️  Replacing existing module: ${data.module.title}`);
        }

        const newModule = await tx.trainingModule.create({
          data: {
            title: data.module.title,
            skillId: skill.id,
            videoUrl: data.module.videoUrl,
            docUrl: data.module.docUrl,
            passScore: data.module.passScore,
            isActive: true,
            questions: {
              create: data.module.questions.map(q => ({
                text: q.text,
                options: {
                  create: q.options
                }
              }))
            }
          }
        });
        console.log(`✅ Created Training Module with ${data.module.questions.length} questions: ${newModule.title}`);
      }
    }, {
        timeout: 60000 // Increase timeout for large seed
    });

    console.log('\n✨ Seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Seeding failed. Transaction rolled back.');
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
