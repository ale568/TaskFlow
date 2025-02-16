const Project = require('../../renderer/models/project');

describe('Project Model - Database Integration', () => {
    test('It should create a new project in the database', async () => {
        const project = await Project.createProject('Test Project', 'This is a test project');
        expect(project).toBeInstanceOf(Project);
        expect(project.name).toBe('Test Project');
        expect(project.description).toBe('This is a test project');
    });

    test('It should retrieve a project by ID', async () => {
        const newProject = await Project.createProject('New Project', 'Another test project');
        const retrievedProject = await Project.getProjectById(newProject.id);
        expect(retrievedProject).toBeInstanceOf(Project);
        expect(retrievedProject.id).toBe(newProject.id);
    });

    test('It should return null for a non-existing project ID', async () => {
        const project = await Project.getProjectById(99999);
        expect(project).toBeNull();
    });

    test('It should retrieve all projects', async () => {
        const project1 = await Project.createProject('Project 1', 'Description 1');
        const project2 = await Project.createProject('Project 2', 'Description 2');

        const projects = await Project.getAllProjects();
        expect(projects.length).toBeGreaterThanOrEqual(2);
        expect(projects).toEqual(expect.arrayContaining([
            expect.objectContaining({ id: project1.id }),
            expect.objectContaining({ id: project2.id })
        ]));
    });

    test('It should update a project successfully', async () => {
        const project = await Project.createProject('Update Test', 'To be updated');
        const updated = await Project.updateProject(project.id, { name: 'Updated Name', description: 'Updated description' });

        expect(updated).toBe(true);
        const updatedProject = await Project.getProjectById(project.id);
        expect(updatedProject.name).toBe('Updated Name');
        expect(updatedProject.description).toBe('Updated description');
    });

    test('It should delete a project successfully', async () => {
        const project = await Project.createProject('Delete Test', 'To be deleted');
        const deleted = await Project.deleteProject(project.id);
        expect(deleted).toBe(true);

        const deletedProject = await Project.getProjectById(project.id);
        expect(deletedProject).toBeNull();
    });

    test('It should return false if deleting a non-existing project', async () => {
        const deleted = await Project.deleteProject(99999);
        expect(deleted).toBe(false);
    });
});
