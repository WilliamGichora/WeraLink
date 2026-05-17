import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Learning Hub - Frontend UI Schema & Route Tests', () => {
  
  test('AdminLms page component file should exist and contain required React hooks and UI components', () => {
    const filePath = path.resolve('src/pages/admin/AdminLms.tsx');
    assert.ok(fs.existsSync(filePath), 'AdminLms.tsx page component must exist');

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Check that it implements the required interactive UI controls
    assert.ok(fileContent.includes('AdminLms'), 'Should export the AdminLms component');
    assert.ok(fileContent.includes('useAdminListLmsModules'), 'Should use useAdminListLmsModules hook');
    assert.ok(fileContent.includes('useAdminLmsModuleDetail'), 'Should use useAdminLmsModuleDetail hook');
    assert.ok(fileContent.includes('useAdminCreateLmsModule'), 'Should use useAdminCreateLmsModule hook');
    assert.ok(fileContent.includes('useAdminUpdateLmsModule'), 'Should use useAdminUpdateLmsModule hook');
    assert.ok(fileContent.includes('useAdminDeleteLmsModule'), 'Should use useAdminDeleteLmsModule hook');
    
    // Verify the standard 6 skill categories are configured
    assert.ok(fileContent.includes('Translation') || fileContent.includes('TRANSLATION'), 'Should support Translation category');
    assert.ok(fileContent.includes('Marketing') || fileContent.includes('MARKETING'), 'Should support Marketing category');
    assert.ok(fileContent.includes('Data Entry') || fileContent.includes('DATA_ENTRY'), 'Should support Data Entry category');
    assert.ok(fileContent.includes('QA Testing') || fileContent.includes('BUG_HUNTING') || fileContent.includes('QA_TESTING'), 'Should support QA Testing category');
    assert.ok(fileContent.includes('AI & Data Labeling') || fileContent.includes('AI_LABELING') || fileContent.includes('AI_AND_DATA_LABELING'), 'Should support AI & Data Labeling category');
    assert.ok(fileContent.includes('Research') || fileContent.includes('RESEARCH'), 'Should support Research category');
  });

  test('AdminLmsReport component file should exist and properly render portfolio metrics', () => {
    const filePath = path.resolve('src/features/reports/components/AdminLmsReport.tsx');
    assert.ok(fs.existsSync(filePath), 'AdminLmsReport.tsx must exist');

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    assert.ok(fileContent.includes('AdminLmsReport'), 'Should export AdminLmsReport component');
    assert.ok(fileContent.includes('LMS & Skill Assessments Directory'), 'Should include report header title');
    assert.ok(fileContent.includes('Total Courses Audited'), 'Should render Total Courses Audited metric');
  });

  test('App Router should correctly register the learning hub admin route', () => {
    const filePath = path.resolve('src/App.tsx');
    assert.ok(fs.existsSync(filePath), 'App.tsx must exist');

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    assert.ok(fileContent.includes('AdminLms'), 'Should import AdminLms component lazily');
    assert.ok(fileContent.includes('path="lms"'), 'Should register Route with path "lms" under admin segment');
  });

  test('Admin Sidebar Layout should include Learning Hub command center link', () => {
    const filePath = path.resolve('src/layouts/AdminLayout.tsx');
    assert.ok(fs.existsSync(filePath), 'AdminLayout.tsx must exist');

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    assert.ok(fileContent.includes('/admin/lms'), 'Should link to the Admin LMS page (/admin/lms)');
    assert.ok(fileContent.includes('Learning Hub'), 'Should label the link as Learning Hub');
  });
});
