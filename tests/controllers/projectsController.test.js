const ProjectsController = require('../../renderer/controllers/projectsController');
const Project = require('../../renderer/models/project');
const dbUtils = require('../../renderer/utils/dbUtils');

describe('ProjectsController - Database Operations', () => {
    beforeAll(async () => {
        Project.setDatabase('taskflow_test_project.sqlite'); // Set the dedicated test database
        dbUtils.connect('taskflow_test_project.sqlite'); // Connect to the test database
    });

    test('It should create and retrieve a project', async () => {
        const uniqueName = `Test Project ${Date.now()}`;
        const spy = jest.spyOn(Project, 'createProject');

        const projectId = await ProjectsController.createProject(uniqueName, 'Sample description');

        expect(spy).toHaveBeenCalledWith(uniqueName, 'Sample description');
        expect(projectId).toBeDefined();

        const project = await ProjectsController.getProjectById(projectId);
        expect(project).not.toBeNull();
        expect(project.name).toBe(uniqueName);

        spy.mockRestore();
    });

    test('It should update a project', async () => {
        const uniqueName = `Updatable Project ${Date.now()}`;
        const projectId = await ProjectsController.createProject(uniqueName, 'Original description');

        const spy = jest.spyOn(Project, 'updateProject');
        const updated = await ProjectsController.updateProject(projectId, { name: `Updated Project ${Date.now()}` });

        expect(spy).toHaveBeenCalledWith(projectId, { name: expect.stringContaining('Updated Project') });
        expect(updated.success).toBeTruthy();

        const updatedProject = await ProjectsController.getProjectById(projectId);
        expect(updatedProject).not.toBeNull();
        expect(updatedProject.name).toContain('Updated Project');

        spy.mockRestore();
    });

    test('It should delete a project', async () => {
        const uniqueName = `To Delete ${Date.now()}`;
        const projectId = await ProjectsController.createProject(uniqueName, 'Temporary data');

        const spy = jest.spyOn(Project, 'deleteProject');
        const deleted = await ProjectsController.deleteProject(projectId);

        expect(spy).toHaveBeenCalledWith(projectId);
        expect(deleted).toBeTruthy();

        const deletedProject = await ProjectsController.getProjectById(projectId);
        expect(deletedProject).toBeNull();

        spy.mockRestore();
    });

    test('It should fail to create a project without a name', async () => {
        const spy = jest.spyOn(Project, 'createProject').mockImplementation(() => {
            throw new Error('Invalid project name');
        });

        await expect(ProjectsController.createProject(null, 'No name'))
            .rejects.toThrow('Failed to create project');

        spy.mockRestore();
    });

    test('It should return an error if retrieving a project that does not exist', async () => {
        const spy = jest.spyOn(Project, 'getProjectById');
        const project = await ProjectsController.getProjectById(99999);

        expect(spy).toHaveBeenCalledWith(99999);
        expect(project).toBeNull();

        spy.mockRestore();
    });

    test('It should handle errors when updating a non-existing project', async () => {
        const spy = jest.spyOn(Project, 'updateProject');
        const result = await ProjectsController.updateProject(99999, { name: 'Non-existent' });

        expect(spy).toHaveBeenCalledWith(99999, { name: 'Non-existent' });
        expect(result.success).toBeFalsy();

        spy.mockRestore();
    });

    test('It should handle errors when deleting a non-existing project', async () => {
        const spy = jest.spyOn(Project, 'deleteProject');
        const result = await ProjectsController.deleteProject(99999);

        expect(spy).toHaveBeenCalledWith(99999);
        expect(result).toBeFalsy();

        spy.mockRestore();
    });

    test('It should retrieve all projects', async () => {
        const uniqueNameA = `Project A ${Date.now()}`;
        const uniqueNameB = `Project B ${Date.now()}`;

        await ProjectsController.createProject(uniqueNameA, 'Description A');
        await ProjectsController.createProject(uniqueNameB, 'Description B');

        const spy = jest.spyOn(Project, 'getAllProjects');
        const projects = await ProjectsController.getAllProjects();

        expect(spy).toHaveBeenCalled();
        expect(projects.length).toBeGreaterThanOrEqual(2);

        spy.mockRestore();
    });

    test.skip('It should handle database connection failure gracefully', async () => {
        dbUtils.close(); // Simulate database connection failure
    
        let result;
        try {
            result = await ProjectsController.createProject('Database Fail Project', 'DB should fail');
        } catch (error) {
            result = 'error'; // Questo indica che l'errore è stato catturato
        }
    
        expect(result).not.toBeTruthy();
    
        dbUtils.connect('taskflow_test_project.sqlite'); // Restore database connection for further tests
    });    

    afterAll(async () => {
        dbUtils.close();
    });
});