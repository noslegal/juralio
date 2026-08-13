import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import {
  addNoteToTask,
  updateTask,
} from '../../../../../helpers/matterprojects/task_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { createTemplateFromProject } from '../../../../../helpers/templates/template_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('not_required_api.cy', () => {
  let user, fixture, appPage
  let user1, user2, user3, user4, user5
  let templateId, templateTaskId, note

  before(() => {
    createKnowledgeManagerUser().then(createdUser => {
      user = createdUser

      const createUser1 = () =>
        createKnowledgeManagerUser('MMM').then(
          createdUser => (user1 = createdUser)
        )

      createUser1().then(() => {
        const seed = {
          matter: {
            prefix: 'taskMapTest',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                tasks: [
                  {
                    properties: {
                      name: 'task1',
                      status: 'not-started',
                    },
                  },
                  {
                    properties: {
                      name: 'task2',
                      status: 'in-progress',
                    },
                  },
                  {
                    properties: {
                      name: 'task3',
                      status: 'in-progress',
                    },
                  },
                ],
              },
            ],
          },
        }

        fixture = generateFixture(seed)
        appPage = getWrapper(fixture)
      })
    })
  })

  describe('moving a task to the child of a not-required task', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitHome()
      addNoteToTask(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        { name: 'test' }
      ).then(res => {
        note = res
        updateTask(
          fixture.matter.id,
          fixture.projects[0].id,
          fixture.tasks[0].id,
          { status: 'task-not-required' }
        )
      })
    })
    it('should return a bad result', () => {
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[1].id
        }/move`,
        method: 'POST',
        body: {
          destinationParentId: fixture.tasks[0].id,
          destinationParentType: 'TASK',
          destinationProjectId: fixture.projects[0].id,
          maintainTaskConsistency: true,
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(400)
        expect(res.body.text).to.eq(
          'Cannot move a task to be a child of a not-required task'
        )
      })
    })
  })
  describe('copying a not-required task', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitHome()
    })
    it('should return a bad result', () => {
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${fixture.projects[0].id}/task/${
          fixture.tasks[0].id
        }/copy`,
        method: 'POST',
        body: {
          name: 'test',
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(400)
      })
    })
  })
  describe('using a template task as a child of a not-required task', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitTemplates()
      //make the template
      createTemplateFromProject(
        'not required template',
        fixture.matter.name,
        fixture.projects[0].name
      )
      cy.wait(5000)
      cy.get('[data-test=task-cell-test]').eq(1).click()
      cy.url().then(url => {
        templateId = url.split('/')[5]
        templateTaskId = url.split('/')[7]
      })
    })
    it('should return a bad request when using a task', () => {
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/matter/${
          fixture.matter.id
        }/workstreams/${
          fixture.projects[0].id
        }/tasks?templateTaskId=${templateTaskId}`,
        method: 'POST',
        body: {
          includesPosts: true,
          phase: fixture.tasks[0].id,
          project: fixture.projects[0].id,
        },
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(400)
        expect(res.body[0].message).to.eq(
          'Cannot create children of a not required task'
        )
      })
    })
    describe('using a template as a child of a not-required task', () => {
      before(() => {
        cy.login(user.username)
        visitHelpers.visitTemplates()
        //make the template
        createTemplateFromProject(
          'not required template',
          fixture.matter.name,
          fixture.projects[0].name
        )
        cy.wait(5000)
        cy.get('[data-test=task-cell-test]').eq(1).click()
        cy.url().then(url => {
          templateId = url.split('/')[5]
          templateTaskId = url.split('/')[7]
        })
      })
      it('should return a bad request when using a whole template', () => {
        cy.request({
          url: `${Cypress.env('serverBaseUrl')}/matter/${
            fixture.matter.id
          }/workstreams/${
            fixture.projects[0].id
          }/tasks?templateProjectId=${templateId}`,
          method: 'POST',
          body: {
            includesPosts: true,
            phase: fixture.tasks[0].id,
            project: fixture.projects[0].id,
          },
          failOnStatusCode: false,
        }).then(res => {
          expect(res.status).to.eq(400)
          expect(res.body[0].message).to.eq(
            'Cannot create children of a not required task'
          )
        })
      })
    })
    describe('when updating the post of a not-required task', () => {
      it('should return a bad request when trying to update post', () => {
        cy.login(user.username).then(() => {
          cy.request({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              fixture.matter.id
            }/workstreams/${fixture.projects[0].id}/task/${
              fixture.tasks[0].id
            }/post/${note.id}`,
            method: 'PATCH',
            body: {
              description: 'hello',
            },
            failOnStatusCode: false,
          }).then(res => {
            expect(res.status).to.eq(400)
            expect(res.body).to.eq('Cannot edit notes of not-required tasks')
          })
        })
      })
    })
    describe('when trying to create a post in a not-required task', () => {
      it('should return a bad request when trying to create a post', () => {
        cy.login(user.username).then(() => {
          cy.request({
            url: `${Cypress.env('serverBaseUrl')}/matter/${
              fixture.matter.id
            }/workstreams/${fixture.projects[0].id}/task/${
              fixture.tasks[0].id
            }/posts`,
            method: 'POST',
            body: { name: 'test2' },
            failOnStatusCode: false,
          }).then(res => {
            expect(res.status).to.eq(400)
          })
        })
      })
    })
  })
})
