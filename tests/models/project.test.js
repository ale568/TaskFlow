const Project = require('../../renderer/models/project');
const dbUtils = require('../../renderer/utils/dbUtils');

describe('Project Model - Database Integration', () => {
    beforeAll(async () => {
        await dbUtils.runQuery('DELETE FROM projects'); // Pulisce la tabella prima di eseguire i test
    });

    test('It should create a new project in the database', async () => {
        const project = await Project.createProject(`Test Project ${Date.now()}`, 'This is a test project');
        expect(project).toBeInstanceOf(Project);
        expect(project.name).toContain('Test Project');
    });

    test('It should throw an error when creating a project without a name', async () => {
        await expect(Project.createProject('')).rejects.toThrow('Invalid project name');
    });

    test('It should throw an error if project name already exists', async () => {
        const name = `Duplicate Project ${Date.now()}`;
        await Project.createProject(name, 'First instance');
        await expect(Project.createProject(name, 'Second instance')).rejects.toThrow('Project with this name already exists');
    });

    test('It should retrieve a project by ID', async () => {
        const project = await Project.createProject(`Project ${Date.now()}`, 'Another test project');
        const retrievedProject = await Project.getProjectById(project.id);
        expect(retrievedProject.id).toBe(project.id);
    });

    test('It should return null for a non-existing project ID', async () => {
        const project = await Project.getProjectById(99999);
        expect(project).toBeNull();
    });

    test('It should retrieve all projects', async () => {
        await Project.createProject(`Project A ${Date.now()}`, 'Description 1');
        await Project.createProject(`Project B ${Date.now()}`, 'Description 2');

        const projects = await Project.getAllProjects();
        expect(projects.length).toBeGreaterThanOrEqual(2);
    });

    test('It should update a project successfully', async () => {
        const project = await Project.createProject(`Update Test ${Date.now()}`, 'To be updated');
        const updated = await Project.updateProject(project.id, { name: `Updated Name ${Date.now()}` });

        expect(updated).toBe(true);
        const updatedProject = await Project.getProjectById(project.id);
        expect(updatedProject.name).toContain('Updated Name');
    });

    test('It should not update a project with an invalid name', async () => {
        const project = await Project.createProject(`Invalid Update ${Date.now()}`, 'To be updated');
        await expect(Project.updateProject(project.id, { name: '' })).rejects.toThrow('Invalid project name');
    });

    test('It should delete a project successfully', async () => {
        const project = await Project.createProject(`Delete Test ${Date.now()}`, 'To be deleted');
        const deleted = await Project.deleteProject(project.id);
        expect(deleted).toBe(true);

        const deletedProject = await Project.getProjectById(project.id);
        expect(deletedProject).toBeNull();
    });

    test('It should return false if deleting a non-existing project', async () => {
        const deleted = await Project.deleteProject(99999);
        expect(deleted).toBe(false);
    });

    test('It should throw an error when trying to delete with an invalid ID', async () => {
        await expect(Project.deleteProject('invalid')).rejects.toThrow('Invalid project ID');
    });
});
