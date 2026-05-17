import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import prisma from '../config/prisma.js';
import { AdminService } from '../services/admin.service.js';

describe('Learning Hub - Admin LMS Service Tests', () => {
  // Store original prisma methods to restore them after tests
  const originals = {};

  before(() => {
    originals.trainingModuleFindMany = prisma.trainingModule.findMany;
    originals.trainingModuleFindUnique = prisma.trainingModule.findUnique;
    originals.trainingModuleCount = prisma.trainingModule.count;
    originals.trainingModuleCreate = prisma.trainingModule.create;
    originals.trainingModuleUpdate = prisma.trainingModule.update;
    originals.trainingModuleDelete = prisma.trainingModule.delete;
    originals.questionDeleteMany = prisma.question.deleteMany;
    originals.questionCreate = prisma.question.create;
    originals.optionCreateMany = prisma.option.createMany;
    originals.userActivityCreate = prisma.userActivity.create;
    originals.skillFindMany = prisma.skill.findMany;
    originals.transaction = prisma.$transaction;
    originals.moduleCompletionAggregate = prisma.moduleCompletion ? prisma.moduleCompletion.aggregate : undefined;
    originals.moduleCompletionCount = prisma.moduleCompletion ? prisma.moduleCompletion.count : undefined;
  });

  after(() => {
    prisma.trainingModule.findMany = originals.trainingModuleFindMany;
    prisma.trainingModule.findUnique = originals.trainingModuleFindUnique;
    prisma.trainingModule.count = originals.trainingModuleCount;
    prisma.trainingModule.create = originals.trainingModuleCreate;
    prisma.trainingModule.update = originals.trainingModuleUpdate;
    prisma.trainingModule.delete = originals.trainingModuleDelete;
    prisma.question.deleteMany = originals.questionDeleteMany;
    prisma.question.create = originals.questionCreate;
    prisma.option.createMany = originals.optionCreateMany;
    prisma.userActivity.create = originals.userActivityCreate;
    prisma.skill.findMany = originals.skillFindMany;
    prisma.$transaction = originals.transaction;
    if (prisma.moduleCompletion) {
      prisma.moduleCompletion.aggregate = originals.moduleCompletionAggregate;
      prisma.moduleCompletion.count = originals.moduleCompletionCount;
    }
  });

  test('listAllSkills should return all platform skills', async () => {
    const mockSkills = [
      { id: '1', name: 'React Development', category: 'MARKETING' },
      { id: '2', name: 'Translation Verification', category: 'TRANSLATION' }
    ];

    prisma.skill.findMany = async (params) => {
      assert.deepStrictEqual(params, { orderBy: { name: 'asc' } });
      return mockSkills;
    };

    const result = await AdminService.listAllSkills();
    assert.deepStrictEqual(result, mockSkills);
  });

  test('listLmsModules should apply filters and return paginated courses', async () => {
    const mockModules = [
      {
        id: 'mod1',
        title: 'React Fundamentals',
        skillId: '1',
        isActive: true,
        createdAt: new Date(),
        skill: { name: 'React Development', category: 'MARKETING' },
        _count: { questions: 1, completions: 1 }
      }
    ];

    prisma.trainingModule.findMany = async (params) => {
      assert.ok(params.where);
      assert.strictEqual(params.take, 10);
      assert.strictEqual(params.skip, 0);
      return mockModules;
    };

    prisma.trainingModule.count = async (params) => {
      return 1;
    };

    prisma.moduleCompletion = {
      aggregate: async (params) => {
        assert.strictEqual(params.where.moduleId, 'mod1');
        return {
          _avg: { score: 85 }
        };
      },
      count: async (params) => {
        assert.strictEqual(params.where.moduleId, 'mod1');
        return 1;
      }
    };

    const result = await AdminService.listLmsModules({
      page: 1,
      limit: 10,
      search: 'React',
      category: 'MARKETING',
      isActive: true
    });

    assert.strictEqual(result.modules.length, 1);
    assert.strictEqual(result.modules[0].title, 'React Fundamentals');
    assert.strictEqual(result.pagination.total, 1);
    assert.strictEqual(result.pagination.totalPages, 1);
    assert.strictEqual(result.modules[0].stats.totalCompletions, 1);
    assert.strictEqual(result.modules[0].stats.passedCompletions, 1);
    assert.strictEqual(result.modules[0].stats.avgScore, 85);
  });

  test('getLmsModuleDetail should fetch a specific module and compute completions statistics', async () => {
    const mockModule = {
      id: 'mod1',
      title: 'React Fundamentals',
      skillId: '1',
      isActive: true,
      createdAt: new Date(),
      skill: { name: 'React Development', category: 'MARKETING' },
      questions: [
        {
          id: 'q1',
          text: 'What is JSX?',
          options: [
            { id: 'o1', text: 'JavaScript XML', isCorrect: true },
            { id: 'o2', text: 'Java Syntax Extension', isCorrect: false }
          ]
        }
      ],
      completions: [
        { id: 'c1', score: 100, passed: true },
        { id: 'c2', score: 60, passed: false }
      ]
    };

    prisma.trainingModule.findUnique = async (params) => {
      assert.strictEqual(params.where.id, 'mod1');
      return mockModule;
    };

    prisma.moduleCompletion = {
      aggregate: async (params) => {
        assert.strictEqual(params.where.moduleId, 'mod1');
        return {
          _avg: { score: 80 }
        };
      }
    };

    const result = await AdminService.getLmsModuleDetail('mod1');
    assert.strictEqual(result.id, 'mod1');
    assert.strictEqual(result.stats.totalCompletions, 2);
    assert.strictEqual(result.stats.passedCompletions, 1);
    assert.strictEqual(result.stats.avgScore, 80);
    assert.strictEqual(result.stats.passRate, 50);
  });

  test('createLmsModule should create training module and questions atomically', async () => {
    const newModuleData = {
      title: 'New Translation Standard',
      skillId: 'sk2',
      passScore: 85,
      isActive: true,
      questions: [
        {
          text: 'Is precision critical?',
          options: [
            { text: 'Yes', isCorrect: true },
            { text: 'No', isCorrect: false }
          ]
        }
      ]
    };

    prisma.$transaction = async (callback) => {
      const mockTx = {
        trainingModule: {
          create: async (params) => {
            assert.strictEqual(params.data.title, newModuleData.title);
            assert.strictEqual(params.data.passScore, 85);
            return { id: 'new-mod-1', title: newModuleData.title };
          }
        },
        question: {
          create: async (params) => {
            assert.strictEqual(params.data.moduleId, 'new-mod-1');
            assert.strictEqual(params.data.text, 'Is precision critical?');
            return { id: 'new-q-1' };
          }
        },
        option: {
          createMany: async (params) => {
            assert.strictEqual(params.data.length, 2);
            assert.strictEqual(params.data[0].questionId, 'new-q-1');
            assert.strictEqual(params.data[0].isCorrect, true);
            return { count: 2 };
          }
        },
        userActivity: {
          create: async (params) => {
            assert.strictEqual(params.data.action, 'LMS_MODULE_CREATED');
            return { id: 'act-1' };
          }
        }
      };
      return await callback(mockTx);
    };

    const result = await AdminService.createLmsModule(newModuleData, 'admin-123');
    assert.strictEqual(result.id, 'new-mod-1');
  });

  test('deleteLmsModule should delete module and log activity', async () => {
    prisma.$transaction = async (callback) => {
      const mockTx = {
        trainingModule: {
          findUnique: async (params) => {
            assert.strictEqual(params.where.id, 'mod-to-delete');
            return { id: 'mod-to-delete', title: 'To Delete' };
          },
          delete: async (params) => {
            assert.strictEqual(params.where.id, 'mod-to-delete');
            return { id: 'mod-to-delete' };
          }
        },
        userActivity: {
          create: async (params) => {
            assert.strictEqual(params.data.action, 'LMS_MODULE_DELETED');
            return { id: 'act-delete' };
          }
        }
      };
      return await callback(mockTx);
    };

    const result = await AdminService.deleteLmsModule('mod-to-delete', 'admin-123');
    assert.strictEqual(result.success, true);
  });
});
