import prisma from '../config/prisma.js';

class TrainingService {
  /**
   * Get all training modules relevant to a worker's unverified skills
   * @param {string} workerId
   */
  /**
   * Get all training modules, flagging those relevant to worker skills
   * @param {string} workerId
   */
  async getModulesForWorker(workerId) {
    const userSkills = await prisma.userSkill.findMany({
      where: { userId: workerId },
      include: { skill: true }
    });

    const skillIds = userSkills.map(us => us.skillId);

    const allModules = await prisma.trainingModule.findMany({
      where: {
        isActive: true
      },
      include: {
        skill: true,
        completions: {
          where: { userId: workerId }
        }
      }
    });

    // Attach current status for the worker and recommendation flag
    return allModules.map(mod => {
      const completion = mod.completions[0];
      const userSkill = userSkills.find(us => us.skillId === mod.skillId);
      return {
        ...mod,
        completions: undefined,
        status: completion ? (completion.passed ? 'PASSED' : 'FAILED') : 'NOT_STARTED',
        bestScore: completion ? completion.score : null,
        skillLevel: userSkill ? userSkill.level : 1,
        isVerified: userSkill ? userSkill.verified : false,
        isRecommended: skillIds.includes(mod.skillId)
      };
    });
  }

  /**
   * Get a specific module and its questions
   * @param {string} moduleId
   * @param {boolean} includeAnswers - Only true for grading or demo cheat sheets
   */
  async getModuleWithQuestions(moduleId, includeAnswers = false) {
    const module = await prisma.trainingModule.findUnique({
      where: { id: moduleId },
      include: {
        skill: true,
        questions: {
          include: {
            options: {
              select: {
                id: true,
                text: true,
                questionId: true,
                ...(includeAnswers ? { isCorrect: true } : {})
              }
            }
          }
        }
      }
    });

    if (!module) throw new Error('Module not found');
    return module;
  }

  /**
   * Grades a submitted quiz and performs the atomic verification transaction if passed.
   * @param {string} userId
   * @param {string} moduleId
   * @param {Array<{questionId: string, optionId: string}>} userAnswers
   */
  async submitQuiz(userId, moduleId, userAnswers) {
    // 1. Fetch the true answers
    const module = await this.getModuleWithQuestions(moduleId, true);
    
    if (!module.questions || module.questions.length === 0) {
      throw new Error('Module has no questions to grade.');
    }

    let correctCount = 0;
    const totalQuestions = module.questions.length;

    // 2. Calculate score
    for (const question of module.questions) {
      const submitted = userAnswers.find(ua => ua.questionId === question.id);
      if (submitted) {
        const correctOption = question.options.find(opt => opt.isCorrect);
        if (correctOption && correctOption.id === submitted.optionId) {
          correctCount++;
        }
      }
    }

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercentage >= module.passScore;

    // 3. Handle successful passing via atomic transaction
    let newLevel = 1;
    let badgeAwarded = null;

    if (passed) {
      newLevel = scorePercentage >= 90 ? 3 : 2; 

      const badgeSuffix = scorePercentage >= 90 ? 'Expert' : 'Specialist';
      const badgeName = `${module.skill.name} ${badgeSuffix}`;

      await prisma.$transaction(async (tx) => {
        
        await tx.moduleCompletion.upsert({
          where: {
            userId_moduleId: { userId, moduleId }
          },
          update: {
            score: scorePercentage,
            passed: true,
            completedAt: new Date()
          },
          create: {
            userId,
            moduleId,
            score: scorePercentage,
            passed: true
          }
        });

        // Update UserSkill
        await tx.userSkill.upsert({
          where: {
            userId_skillId: { userId, skillId: module.skillId }
          },
          update: {
            verified: true,
            verifiedAt: new Date(),
            level: newLevel
          },
          create: {
            userId,
            skillId: module.skillId,
            verified: true,
            verifiedAt: new Date(),
            level: newLevel
          }
        });

        // Award Badge (if exists)
        const badge = await tx.badge.findUnique({ where: { name: badgeName } });
        if (badge) {
          await tx.userBadge.upsert({
            where: {
              userId_badgeId: { userId, badgeId: badge.id }
            },
            update: { awardedAt: new Date() },
            create: {
              userId,
              badgeId: badge.id
            }
          });
          badgeAwarded = badge;
        }
      });
    } else {
      // Failed - just record the attempt
      await prisma.moduleCompletion.upsert({
        where: {
          userId_moduleId: { userId, moduleId }
        },
        update: {
          score: Math.max(scorePercentage, 0),
          passed: false,
          completedAt: new Date()
        },
        create: {
          userId,
          moduleId,
          score: scorePercentage,
          passed: false
        }
      });
    }

    return {
      score: scorePercentage,
      passed,
      correctCount,
      totalQuestions,
      newLevel: passed ? newLevel : null,
      badgeAwarded
    };
  }
}

export default new TrainingService();
