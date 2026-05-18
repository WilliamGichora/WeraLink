import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  computeSkillScore,
  computeCategoryAffinity,
  computeAvailabilityScore,
  computeLocationScore,
  computePerformanceMultipliers,
  computeBonuses,
  applyColdStart,
  scoreWorkerForGig,
  rankCandidates
} from '../services/matching.service.js';

describe('Bidirectional Match Scoring Core Algorithm tests', () => {

  test('computeSkillScore should apply level scores and verified skill multipliers correctly', () => {
    const gigSkills = [
      { skillId: 'sk1', requiredLevel: 3 },
      { skillId: 'sk2', requiredLevel: 5 }
    ];

    // Case 1: Lack of skills
    const res1 = computeSkillScore([], gigSkills);
    assert.strictEqual(res1.score, 0);
    assert.deepStrictEqual(res1.missing, ['sk1', 'sk2']);
    assert.deepStrictEqual(res1.matched, []);

    // Case 2: Matching unverified skills partially
    const ws2 = [
      { skillId: 'sk1', level: 3, verified: false },
      { skillId: 'sk2', level: 4, verified: false }
    ];
    const res2 = computeSkillScore(ws2, gigSkills);
    // skill 1 score = 3/3 = 1.0. skill 2 score = 4/5 = 0.8. Total = (1.0 + 0.8)/2 = 0.90
    assert.strictEqual(Math.round(res2.score * 100) / 100, 0.90);
    assert.deepStrictEqual(res2.matched, ['sk1', 'sk2']);
    assert.deepStrictEqual(res2.missing, []);

    // Case 3: Verified skill multiplier boost (1.2x capped at 1.0)
    const ws3 = [
      { skillId: 'sk1', level: 2, verified: true }, // score = 2/3 = 0.667 * 1.2 = 0.8
      { skillId: 'sk2', level: 5, verified: true }  // score = 5/5 = 1.0 * 1.2 = 1.2 capped at 1.0
    ];
    const res3 = computeSkillScore(ws3, gigSkills);
    // (0.8 + 1.0)/2 = 0.9
    assert.strictEqual(Math.round(res3.score * 100) / 100, 0.90);
  });

  test('computeCategoryAffinity should handle baselines and experience normalization caps', () => {
    const category = 'DATA_ENTRY';

    // Case 1: 0 completed assignments in category returns baseline 0.3
    const res1 = computeCategoryAffinity([], category);
    assert.strictEqual(res1, 0.3);

    // Case 2: Partial affinity (3 completed gigs = 0.3 affinity)
    const assignments2 = [
      { status: 'PAID', gigCategory: 'DATA_ENTRY' },
      { status: 'APPROVED', gigCategory: 'DATA_ENTRY' },
      { status: 'PAID', gigCategory: 'DATA_ENTRY' },
      { status: 'OFFERED', gigCategory: 'DATA_ENTRY' }, // Not completed
      { status: 'PAID', gigCategory: 'TRANSLATION' }     // Mismatched category
    ];
    const res2 = computeCategoryAffinity(assignments2, category);
    assert.strictEqual(res2, 0.3);

    // Case 3: Ceiling saturation check (12 completed gigs in category capped at 1.0)
    const assignments3 = Array(12).fill({ status: 'PAID', gigCategory: 'DATA_ENTRY' });
    const res3 = computeCategoryAffinity(assignments3, category);
    assert.strictEqual(res3, 1.0);
  });

  test('computeAvailabilityScore should decay based on active assignment loads', () => {
    // Unavailability returns 0.0
    assert.strictEqual(computeAvailabilityScore(false, 0), 0.0);

    // Available with 0 active loads returns 1.0
    assert.strictEqual(computeAvailabilityScore(true, 0), 1.0);

    // Available with partial load (2 active assignments)
    // penalty = 2/5 = 0.4. score = 1.0 - (0.4 * 0.8) = 1.0 - 0.32 = 0.68
    const res2 = computeAvailabilityScore(true, 2);
    assert.strictEqual(Math.round(res2 * 100) / 100, 0.68);

    // Active loads beyond threshold caps at 0.2
    assert.strictEqual(computeAvailabilityScore(true, 10), 0.2);
  });

  test('computeLocationScore should match location alignment boundaries', () => {
    // Case 1: REMOTE gig returns 1.0 regardless of location
    assert.strictEqual(computeLocationScore('Nairobi', 'Mombasa', 'REMOTE'), 1.0);

    // Case 2: Empty values return neutral 0.5
    assert.strictEqual(computeLocationScore(null, 'Nairobi', 'ON_SITE'), 0.5);

    // Case 3: Case-insensitive containment matches return 1.0
    assert.strictEqual(computeLocationScore('Nairobi, Kenya', 'nairobi', 'ON_SITE'), 1.0);

    // Case 4: Word overlaps return 0.5
    assert.strictEqual(computeLocationScore('Nairobi, Westlands', 'Kilimani, Nairobi', 'HYBRID'), 0.5);

    // Case 5: Direct mismatches return 0.0
    assert.strictEqual(computeLocationScore('Mombasa, Kenya', 'Nairobi, Westlands', 'ON_SITE'), 0.0);
  });

  test('computePerformanceMultipliers should calculate average ratings and responses', () => {
    const ratings = [{ score: 5 }, { score: 4 }, { score: 3 }]; // avg = 4.0
    const assignments = [
      { status: 'PAID' },
      { status: 'APPROVED' },
      { status: 'REJECTED' } // countable = 3, completed = 2, rate = 2/3 = 0.667
    ];

    const multipliers = computePerformanceMultipliers(ratings, assignments);
    // Rating multiplier = 1.0 + ((4 - 3)/3)*0.1 = 1.033
    assert.ok(multipliers.ratingMult > 1.03 && multipliers.ratingMult < 1.04);
    // Completion multiplier = 1.0 + ((0.667 - 0.5)*0.1) = 1.0167
    assert.ok(multipliers.completionMult > 1.01 && multipliers.completionMult < 1.02);
  });

  test('computeBonuses should cap flat training and badges benefits', () => {
    // Under limits
    const res1 = computeBonuses(2, 2);
    assert.strictEqual(res1.badgeBonus, 0.02);
    assert.strictEqual(res1.trainingBonus, 0.02);

    // Exceeding caps (badge caps at 0.05, training at 0.03)
    const res2 = computeBonuses(10, 10);
    assert.strictEqual(res2.badgeBonus, 0.05);
    assert.strictEqual(res2.trainingBonus, 0.03);
  });

  test('applyColdStart should respect newcomer and early-career floors', () => {
    // Newcomer floor = 35%
    const res1 = applyColdStart(20, 0);
    assert.strictEqual(res1.score, 35);
    assert.deepStrictEqual(res1.tags, ['fresh-talent']);

    // Early career floor = 25%
    const res2 = applyColdStart(15, 2);
    assert.strictEqual(res2.score, 25);
    assert.deepStrictEqual(res2.tags, ['early-career']);

    // Pure merit returns original score
    const res3 = applyColdStart(48, 5);
    assert.strictEqual(res3.score, 48);
    assert.deepStrictEqual(res3.tags, []);
  });

  test('scoreWorkerForGig should build full composite score breakdown successfully', () => {
    const worker = {
      id: 'w1',
      name: 'Alpha Worker',
      skills: [{ skillId: 'sk1', level: 3, verified: true }],
      assignments: [{ status: 'PAID', gigCategory: 'MARKETING' }],
      profile: { location: 'Nairobi, Kenya', availabilityStatus: true },
      ratingsRecv: [{ score: 5 }],
      badgeCount: 2,
      passedModuleCount: 3,
      activeAssignmentCount: 0
    };

    const gig = {
      id: 'g1',
      title: 'Marketing Automation',
      category: 'MARKETING',
      skills: [{ skillId: 'sk1', requiredLevel: 3 }],
      location: 'Nairobi',
      workType: 'ON_SITE',
      payAmount: 1000
    };

    const res = scoreWorkerForGig(worker, gig);
    assert.strictEqual(res.workerId, 'w1');
    assert.ok(res.matchScore > 80 && res.matchScore <= 100);
    assert.deepStrictEqual(res.matchedSkills, ['sk1']);
    assert.deepStrictEqual(res.missingSkills, []);
  });

  test('rankCandidates should sort properly with scores and active-load tie-breakers', () => {
    const candidates = [
      { workerId: 'w1', matchScore: 85, activeAssignmentCount: 2, createdAt: '2026-05-17T00:00:00Z' },
      { workerId: 'w2', matchScore: 85, activeAssignmentCount: 1, createdAt: '2026-05-17T00:00:00Z' },
      { workerId: 'w3', matchScore: 90, activeAssignmentCount: 0, createdAt: '2026-05-17T00:00:00Z' }
    ];

    const sorted = rankCandidates(candidates);
    // Should be w3 first (90 score), then w2 (85 score, 1 active load), then w1 (85 score, 2 active loads)
    assert.strictEqual(sorted[0].workerId, 'w3');
    assert.strictEqual(sorted[1].workerId, 'w2');
    assert.strictEqual(sorted[2].workerId, 'w1');
  });
});
