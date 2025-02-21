const Project = require('../../renderer/models/project');
const dbUtils = require('../../renderer/utils/dbUtils');

describe('Project Model - Database Operations', () => {
    beforeAll(async () => {
        Project.setDatabase('taskflow_test_project.sqlite');
        dbUtils.connect('taskflow_test_project.sqlite'); 
        dbUtils.resetDatabase(); // Reset of database before all tests
    });

    beforeEach(async () => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Avoid race conditions in tests
    });

    test('It should create and retrieve a project', async () => {
        const projectId = await Project.createProject('Test Project', 'Sample description');

        expect(projectId).toBeDefined();
        const project = await Project.getProjectById(projectId);
        expect(project).not.toBeNull();
        expect(project.name).toBe('Test Project');
        expect(project.description).toBe('Sample description');
    });

    test('It should update a project', async () => {
        const projectId = await Project.createProject('Updatable Project', 'Original description');

        const updated = await Project.updateProject(projectId, { name: 'Updated Project Name' });
        expect(updated.success).toBeTruthy();

        const updatedProject = await Project.getProjectById(projectId);
        expect(updatedProject.name).toBe('Updated Project Name');
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
        await Project.createProject('Project A', 'Description A');
        await Project.createProject('Project B', 'Description B');

        const projects = await Project.getAllProjects();
        expect(projects.length).toBeGreaterThanOrEqual(2);
    });

    afterAll(async () => {
        dbUtils.close();
    });
});