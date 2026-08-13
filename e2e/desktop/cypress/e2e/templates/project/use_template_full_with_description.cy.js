//whole template new matter
//whole tmeplate new project
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createTemplate,
  publishTemplate,
} from '../../../../../helpers/templates/template_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

//while template level A
const visitHelper = new VisitHelpers()
describe('use_template_full_with_description.cy', () => {
  let testUser,
    regularUser,
    fixture,
    project,
    template,
    appPage,
    newTemplateName = 'Test Template'

  before(() => {
    createUser('', true, true, {
      roles: ['ROLE_MATTER_CREATOR', 'ROLE_KNOWLEDGE_MANAGER'],
    })
      .then(createdUser => {
        testUser = createdUser
        createUser().then(createdUser => {
          regularUser = createdUser
          const seed = {
            matter: {
              teamMembers: [testUser],
              matterAdmins: [testUser],
              projects: [
                {
                  name: 'Overview Spec with Tasks',
                  tasks: [{ name: 'Task1' }],
                },
                {
                  name: 'Project 2',
                  tasks: [],
                },
              ],
            },
          }
          fixture = generateFixture(seed)
          appPage = getWrapper(fixture)
        })
      })
      .then(() => {
        project = fixture.projects[0]
      })
  })

  describe('when using a templte with a description', () => {
    before(() => {
      cy.login(testUser.username)
      createTemplate(newTemplateName, project.id).then(createdTemplate => {
        template = createdTemplate
        cy.login(testUser.username)
        publishTemplate(template.id)
      })
    })

    describe('when using the template in a new matter', () => {
      before(() => {
        cy.login(testUser.username)
        visitHelper.visitTemplateTaskDetails(template.id, template.tasks[0].id)
        cy.get('[data-test=task-description]').click()
        cy.get('[data-test=task-description]').type('description!')
        cy.wait(1000)
        // cy.get('body').click()
        cy.wait(3000)
        cy.get('[data-test="overview-button"]').click()
        cy.get('[data-test=use-template-button]').click({ timeout: 30000 })
        // cy.get('[data-test=use-full-template-radio]').click()
        cy.get('[data-test=action-dialog-button]').click()
        cy.get('[data-test=new-matter-button]').click()
        cy.get('[data-test=action-dialog-button]').click()
        cy.get('[data-test=client-name]', {
          timeout: 30000,
        }).type('c')
        cy.get('[data-test=action-dialog-button]').should('be.disabled')
        cy.get('[data-test=name]').type('m')
        cy.get('[data-test=reference-number]').clear()
        cy.get('[data-test=action-dialog-button]').should('be.disabled')
        cy.get('[data-test=reference-number]').type('1234')
        cy.get('[data-test=action-dialog-button]').click()
        cy.get('[data-test=add-task-button]', { timeout: 60000 }).click()
        cy.wait(3000)
        cy.get('body').type('{esc}')
        cy.get('[data-test=task-cell-test]', { timeout: 30000 })
          .eq(0)
          .click(0, 0, { force: true })
      })
      it('should have coped the description', () => {
        cy.get('[data-test=raw-text-line0]', { timeout: 30000 }).should(
          'contain.text',
          'description!'
        )
      })
      describe('when usign a template and not copying the description', () => {
        describe('when using the template in a new matter', () => {
          before(() => {
            cy.login(testUser.username)
            visitHelper.visitTemplateOverview(template.id)
            cy.get('[data-test=use-template-button]').click({ timeout: 30000 })
            cy.get('[data-test=use-full-template-radio]').click()
            cy.get('[data-test=include-descriptions]').click()
            cy.get('[data-test=action-dialog-button]').click()
            cy.get('[data-test=new-matter-button]').click()
            cy.get('[data-test=action-dialog-button]').click()
            cy.get('[data-test=client-name]', {
              timeout: 30000,
            }).type('c')
            cy.get('[data-test=action-dialog-button]').should('be.disabled')
            cy.get('[data-test=name]').type('m')
            cy.get('[data-test=reference-number]').clear()
            cy.get('[data-test=action-dialog-button]').should('be.disabled')
            cy.get('[data-test=reference-number]').type('1234')
            cy.get('[data-test=action-dialog-button]').click()
            cy.get('[data-test=add-task-button]', { timeout: 60000 }).click()
            cy.wait(3000)
            cy.get('body').type('{esc}')
            cy.get('[data-test=task-cell-test]', { timeout: 30000 })
              .eq(0)
              .click(0, 0, { force: true })
          })
          it('should have coped the description', () => {
            cy.get('[data-test=raw-text-line0]').should('not.exist')
          })
        })
      })
    })

    describe('when using the template as a new project in an existing matter', () => {
      before(() => {
        cy.login(testUser.username)
        visitHelper.visitTemplateTaskDetails(template.id, template.tasks[0].id)
        cy.get('[data-test=task-description]').click()
        cy.get('[data-test=task-description]').type('description!')
        cy.wait(1000)
        // cy.get('body').click()
        cy.wait(3000)
        cy.get('[data-test=taskmap-navigation]').click()
        cy.get('[data-test=use-template-button]').click({ timeout: 30000 })
        cy.get('[data-test=action-dialog-button]').click()
        cy.get('[data-test=matter-switcher-filter]').eq(0).click()
        cy.get('[data-test=matter-switcher-filter]')
          .eq(0)
          .find('input')
          .type(fixture.matter.name)
        cy.wait(1000)
        cy.get('[data-test=matter-switcher-matter-item]').eq(0).click()

        cy.get('[data-test=action-dialog-button]').click()
        cy.get('[data-test=new-stream]').click()
        cy.get('[data-test=action-dialog-button]').click()
        cy.get('[data-test=taskmap-navigation]', { timeout: 60000 }).click()
        cy.wait(3000)
        cy.get('body').type('{esc}')
        cy.get('[data-test=task-cell-test]', { timeout: 30000 })
          .eq(0)
          .click(0, 0, { force: true })
      })
      it('should have coped the description', () => {
        cy.get('[data-test=raw-text-line0]', { timeout: 30000 }).should(
          'contain.text',
          'description!'
        )
      })
      describe('when usign a template and not copying the description', () => {
        describe('when using the template in a new matter', () => {
          before(() => {
            cy.login(testUser.username)
            visitHelper.visitTemplateOverview(template.id)

            cy.get('[data-test=use-template-button]').click({ timeout: 30000 })
            cy.get('[data-test=include-descriptions]').click()

            cy.get('[data-test=action-dialog-button]').click()

            cy.get('[data-test=matter-switcher-filter]').eq(0).click()
            cy.get('[data-test=matter-switcher-filter]')
              .eq(0)
              .find('input')
              .type(fixture.matter.name)
            cy.wait(1000)
            cy.get('[data-test=matter-switcher-matter-item]').eq(0).click()
            cy.get('[data-test=action-dialog-button]').click()
            cy.get('[data-test=new-stream]').click()
            cy.get('[data-test=action-dialog-button]').click()
            cy.get('[data-test=taskmap-navigation]', { timeout: 60000 }).click()
            cy.wait(3000)
            cy.get('body').type('{esc}')
            cy.get('[data-test=task-cell-test]', { timeout: 30000 })
              .eq(0)
              .click(0, 0, { force: true })
          })
          it('should have copied the description', () => {
            cy.get('[data-test=raw-text-line0]').should('not.exist')
          })
        })
      })
    })
    describe('when using the template as a new tasks in an existing project', () => {
      before(() => {
        cy.login(testUser.username)
        visitHelper.visitTemplateTaskDetails(template.id, template.tasks[0].id)
        cy.get('[data-test=task-description]').click()
        cy.get('[data-test=task-description]').type('description!')
        cy.wait(1000)
        // cy.get('body').click()
        cy.wait(3000)
        cy.get('[data-test=taskmap-navigation]').click()
        cy.get('[data-test=use-template-button]').click({ timeout: 30000 })
        cy.get('[data-test=action-dialog-button]').click()
        cy.get('[data-test=matter-switcher-filter]').eq(0).click()
        cy.get('[data-test=matter-switcher-filter]')
          .eq(0)
          .find('input')
          .type(fixture.matter.name)
        cy.wait(1000)
        cy.get('[data-test=matter-switcher-matter-item]').eq(0).click()
        cy.get('[data-test=action-dialog-button]').click()
        cy.get('[data-test=matter-switcher-workstream-chip]').eq(0).click()

        cy.get('[data-test=action-dialog-button]').click()
        cy.get('[data-test=matter-switcher-button]').click()
        cy.get('[data-test=matter-switcher-matter-item]').eq(0).click()
        cy.get('[data-test=matter-switcher-workstream-chip]', {
          timeout: 30000,
        })
          .eq(0)
          .click()
        cy.get('[data-test=taskmap-navigation]', { timeout: 60000 }).click()
        cy.wait(3000)
        cy.get('body').type('{esc}')
        cy.get('[data-test=task-cell-test]', { timeout: 30000 })
          .eq(1)
          .click(0, 0, { force: true })
      })
      it('should have coped the description', () => {
        cy.get('[data-test=raw-text-line0]', { timeout: 30000 }).should(
          'contain.text',
          'description!'
        )
      })
      describe('when usign a template and not copying the description', () => {
        describe('when using the template in a new matter', () => {
          before(() => {
            cy.login(testUser.username)
            visitHelper.visitTemplateOverview(template.id)

            cy.get('[data-test=use-template-button]').click({ timeout: 30000 })
            cy.get('[data-test=include-descriptions]').click()

            cy.get('[data-test=action-dialog-button]').click()

            cy.get('[data-test=matter-switcher-filter]').eq(0).click()
            cy.get('[data-test=matter-switcher-filter]')
              .eq(0)
              .find('input')
              .type(fixture.matter.name)
            cy.wait(1000)
            cy.get('[data-test=matter-switcher-matter-item]').eq(0).click()
            cy.get('[data-test=action-dialog-button]').click()
            cy.get('[data-test=matter-switcher-workstream-chip]').eq(0).click()
            cy.get('[data-test=action-dialog-button]').click()

            cy.get('[data-test=matter-switcher-button]').click()
            cy.get('[data-test=matter-switcher-matter-item]').eq(0).click()
            cy.get('[data-test=matter-switcher-workstream-chip]', {
              timeout: 30000,
            })
              .eq(0)
              .click()
            cy.get('[data-test=taskmap-navigation]', { timeout: 60000 }).click()
            cy.wait(3000)
            cy.get('body').type('{esc}')
            cy.get('[data-test=task-cell-test]', { timeout: 30000 })
              .eq(2)
              .click(0, 0, { force: true })
          })
          it('should have coped the description', () => {
            cy.get('[data-test=raw-text-line0]').should('not.exist')
          })
        })
      })
    })
  })
})
