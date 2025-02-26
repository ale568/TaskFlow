const Project = require('../../renderer/models/project');
const dbUtils = require('../../renderer/utils/dbUtils');

describe('Project Model - Database Operations', () => {
    beforeAll(async () => {
        Project.setDatabase('taskflow_test_project.sqlite');
        dbUtils.connect('taskflow_test_project.sqlite'); 
    });

    test('It should create and retrieve a project', async () => {
        const uniqueName = `Test Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueName, 'Sample description');
    
        expect(projectId).toBeDefined();
        const project = await Project.getProjectById(projectId);
        expect(project).not.toBeNull();
        expect(project.name).toBe(uniqueName);
        expect(project.description).toBe('Sample description');
    });

    test('It should update a project (Model)', async () => {
        const uniqueName = `Updatable Model Project ${Date.now()}`;
        const projectId = await Project.createProject(uniqueName, 'Original description');
    
        const updated = await Project.updateProject(projectId, { name: `Updated Model Project ${Date.now()}` });
        expect(updated.success).toBeTruthy();
    
        const updatedProject = await Project.getProjectById(projectId);
        expect(updatedProject.name).toContain('Updated Model Project');
    });    

    test('It should delete a project', async () => {
        const projectId = await Project.createProject('To Delete', 'Temporary data');

        const deleted = await Project.deleteProject(projectId);
        expect(deleted).toBeTruthy();

        const deletedProject = await Project.getProjectById(projectId);
        expect(deletedProject).toBeNull();
    });

    test('It should return null for a non-existing project', async () => {
        const project = await Project.getProjectById(99999);
        expect(project).toBeNull();
    });

    test('It should return false when updating a non-existing project', async () => {
        const result = await Project.updateProject(99999, { name: 'New Name' });
        expect(result.success).toBeFalsy();
    });

    test('It should return false when deleting a non-existing project', async () => {
        const result = await Project.deleteProject(99999);
        expect(result).toBeFalsy();
    });

    test('It should retrieve all projects', async () => {
        const uniqueNameA = `Project A ${Date.now()}`;
        const uniqueNameB = `Project B ${Date.now()}`;
    
        await Project.createProject(uniqueNameA, 'Description A');
        await Project.createProject(uniqueNameB, 'Description B');
    
        const projects = await Project.getAllProjects();
        expect(projects.length).toBeGreaterThanOrEqual(2);
    });

    afterAll(async () => {
        dbUtils.close();
    });
});