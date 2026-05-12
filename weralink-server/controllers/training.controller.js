import trainingService from '../services/training.service.js';
import { respond } from '../utils/respond.js';
import { NODE_ENV, ENABLE_DEMO_CHEATSHEET } from '../config/env.js';

export const getModules = async (req, res, next) => {
  try {
    const workerId = req.user.id;
    const modules = await trainingService.getModulesForWorker(workerId);

    return respond(res, 200, modules);
  } catch (error) {
    next(error);
  }
};

export const getModule = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Always fetch without answers first
    const module = await trainingService.getModuleWithQuestions(id, false);

    // If we are in development mode (or for the MVP),
    // we attach a cheatSheet to the response so the user can demonstrate pass/fail scenarios.
    let cheatSheet = null;
    if (NODE_ENV !== 'production' || ENABLE_DEMO_CHEATSHEET === 'true') {
      const moduleWithAnswers = await trainingService.getModuleWithQuestions(id, true);
      cheatSheet = moduleWithAnswers.questions.map(q => {
        const correctOpt = q.options.find(o => o.isCorrect);
        return {
          questionId: q.id,
          correctOptionId: correctOpt ? correctOpt.id : null
        };
      });
    }

    const payload = {
      ...module,
      cheatSheet,
      isDemoMode: !!cheatSheet
    };

    return respond(res, 200, payload);
  } catch (error) {
    if (error.message === 'Module not found') {
      return respond(res, 404, null, null, [{ code: 'NOT_FOUND', message: 'Training module not found' }]);
    }
    next(error);
  }
};

export const submitQuiz = async (req, res, next) => {
  try {
    const workerId = req.user.id;
    const { id: moduleId } = req.params;
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return respond(res, 400, null, null, [{ code: 'BAD_REQUEST', message: 'Invalid payload: answers must be an array' }]);
    }

    const result = await trainingService.submitQuiz(workerId, moduleId, answers);

    return respond(res, 200, result);
  } catch (error) {
    if (error.message === 'Module not found' || error.message === 'Module has no questions to grade.') {
      return respond(res, 400, null, null, [{ code: 'BAD_REQUEST', message: error.message }]);
    }
    next(error);
  }
};
