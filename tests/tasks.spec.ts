import { expect, test } from '@playwright/test'
import { TaskModel } from './fixtures/task.model'
import { deleteTaskByHelper, postTask } from './support/helpers'
import { TasksPage } from './support/pages/tasks'
import data from './fixtures/tasks.json'

let tasksPage: TasksPage

test.beforeEach(({ page }) => {
    tasksPage = new TasksPage(page)
})

test.describe('taskInput', () => {

    test('should be able to create new task', async ({ request }) => {
        const task = data.success as TaskModel

        // GIVEN that I have a new task
        await deleteTaskByHelper(request, task.name)

        // AND that I'm on the create task page
        await tasksPage.go()

        // WHEN I create a new task
        await tasksPage.create(task)

        // THEN this task will be displayed on the list
        await tasksPage.shouldHaveText(task.name)
    })

    test('should not allow duplicate tasks', async ({ request }) => {
        const task = data.duplicate as TaskModel

        // GIVEN that I have a new task
        await deleteTaskByHelper(request, task.name)

        // AND that I create a new task
        await postTask(request, task)

        // AND that I'm on the create task page
        await tasksPage.go()

        // WHEN I create the same task again
        await tasksPage.create(task)

        // THEN I should get an error message
        await tasksPage.alertHaveText('Task already exists!')

    })

    test('should not allow empty task field', async () => {
        const task = data.required as TaskModel

        await tasksPage.go()
        await tasksPage.create(task)

        const validationMessage = await tasksPage.inputTaskName.evaluate(e => (e as HTMLInputElement).validationMessage)
        expect(validationMessage).toEqual('This is a required field')
    })
})

test.describe('taskUpdate', () => {

    test('should finish a task', async ({ request }) => {
        const task = data.update as TaskModel

        await deleteTaskByHelper(request, task.name)
        await postTask(request, task)

        await tasksPage.go()
        await tasksPage.toggle(task.name)
        await tasksPage.shouldBeDone(task.name)
    })
})

test.describe('taskDelete', () => {

    test('should delete a task', async ({ request }) => {
        const task = data.delete as TaskModel

        await deleteTaskByHelper(request, task.name)
        await postTask(request, task)

        await tasksPage.go()
        await tasksPage.delete(task.name)
        await tasksPage.shouldNotExist(task.name)

    })
})