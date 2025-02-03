const summaryController = require('../../renderer/controllers/summaryController');
const Project = require('../../renderer/models/project');
const Activity = require('../../renderer/models/activity');
const Tag = require('../../renderer/models/tag');

describe('Summary Controller', () => {

    let project1, project2, activity1, activity2, activity3, tag1, tag2;

    beforeEach(() => {
        project1 = new Project('Project1');
        project2 = new Project('Project2');

        tag1 = new Tag(1, 'Urgent', '#FF0000');
        tag2 = new Tag(2, 'Important', '#00FF00');

        activity1 = new Activity('Task1', 50, 'Project1');
        activity1.tag = tag1;
        activity2 = new Activity('Task2', 500, 'Project1');
        activity2.tag = tag2;
        activity3 = new Activity('Task3', 350, 'Project2');
        activity3.tag = tag1;

        project1.addActivity(activity1);
        project1.addActivity(activity2);
        project2.addActivity(activity3);
    });

    test('It should calculate the total hours worked', () => {
        const totalTime = summaryController.getTotalWorkedHours([project1, project2]);
        expect(totalTime).toBe(900);
    });

    test('It should return the activities summary per projects', () => {
        const summary = summaryController.getActivitySummaryByProject([project1, project2]);
        expect(summary['Project1']).toBe(550);
        expect(summary['Project2']).toBe(350);
    });

    test('It should return a summary of the most used tags', () => {
        const tagSummary = summaryController.getTagUsageSummary([project1, project2]);
        expect(tagSummary['Urgent']).toBe(2);
        expect(tagSummary['Important']).toBe(1);
    });
});