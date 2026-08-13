import {
  generateFixture,
  getWrapper,
} from '../../../../helpers/matterprojects/fixture_helper'
import { createMatter } from '../../../../helpers/matterprojects/matter_api_helper'
import { createProject } from '../../../../helpers/matterprojects/projects_api_helper'
import { createTask } from '../../../../helpers/matterprojects/task_api_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import {
  createTemplate,
  publishTemplate,
} from '../../../../helpers/templates/template_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()
let user, fixture, appPage

describe('template_card_display.cy', () => {
  before(() => {
    cy.window().then(win => {
      win.sessionStorage.clear()
    })
    createUser('', true, true, {
      roles: ['ROLE_MATTER_CREATOR', 'ROLE_KNOWLEDGE_MANAGER'],
    }).then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'todo ',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'project1',
              tasks: [
                { name: 'task1', teamMembers: [user] },
                { name: 'task2', teamMembers: [user] },
              ],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
      createMatter('M2', user.username).then(matter => {
        createProject(matter.id, 'P1').then(project => {
          createTask(matter.id, project.id, 'not-started', 'T1').then(task => {
            cy.wait(2000) // This is an experimental step to avoid flaky first login.
            createTemplate('test', fixture.projects[0].id).then(res => {
              publishTemplate(res.id).then(res => {
                cy.wait(2000) // This is an experimental step to avoid flaky first login.
              })
            })
          })
        })
      })
    })
  })
  describe('when there are < 3 matters', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitHome()
      cy.wait(5000) // OTT value. Sorry.
    })
    it('should show one template card at the end', () => {
      cy.get('[data-test=masonry-item]').should('have.length', 4)
      cy.get('[data-test=template-card]').should('have.length', 2)
      cy.get('[data-test=masonry-item]')
        .eq(3)
        .find('[data-test=template-card]')
        .should('exist')
    })
  })
  describe('when there are <  5 matters', () => {
    before(() => {
      createMatter('M3', user.username).then(matter => {
        createProject(matter.id, 'P1').then(project => {
          createTask(matter.id, project.id, 'not-started', 'T1')
        })
      })
      createMatter('M4', user.username).then(matter => {
        createProject(matter.id, 'P1').then(project => {
          createTask(matter.id, project.id, 'not-started', 'T1')
        })
      })

      visitHelpers.visitHome()
    })
    it('should show one template card in the 3rd spot', () => {
      cy.get('[data-test=masonry-item]').should('have.length', 6)
      cy.get('[data-test=template-card]').should('have.length', 2)
      cy.get('[data-test=masonry-item]')
        .eq(4)
        .find('[data-test=template-card]')
        .should('exist')
    })
  })
  describe('when there are < 5 matters', () => {
    before(() => {
      createMatter('M5', user.username).then(matter => {
        createProject(matter.id, 'P1').then(project => {
          createTask(matter.id, project.id, 'not-started', 'T1')
        })
      })
      createMatter('M6', user.username).then(matter => {
        createProject(matter.id, 'P1').then(project => {
          createTask(matter.id, project.id, 'not-started', 'T1')
        })
      })

      visitHelpers.visitHome()
    })
    it('should show one template card in the 3rd and 6th spot', () => {
      cy.get('[data-test=masonry-item]').should('have.length', 9)
      cy.get('[data-test=template-card]').should('have.length', 2)
      cy.get('[data-test=masonry-item]')
        .eq(4)
        .find('[data-test=template-card]')
        .should('exist')
    })
    describe('when hovering over a template', () => {
      before(() => {
        cy.login(user.username)
        visitHelpers.visitHome()
        cy.wait(2000)
        cy.get('[data-test=template-card]').eq(0).trigger('mouseover')
      })
      it('should show the close button', () => {
        cy.get('[data-test=template-close-button]').should('be.visible')
      })
      describe('when clicking the close button', () => {
        before(() => {
          cy.get('[data-test=template-close-button]').eq(0).click()
        })
        it('should close that time', () => {
          cy.get('[data-test=template-card]').should('not.exist')
        })
      })
      describe('when revisiting the home page after closing a template', () => {
        before(() => {
          cy.login(user.username)
          visitHelpers.visitMatterOverview(fixture.matter.id)
          cy.wait(2000)
          visitHelpers.visitHome()
          cy.wait(2000)
        })
        it('should not show the template cards', () => {
          cy.get('[data-test=masonry-item]').should('have.length', 8)
          cy.get('[data-test=template-card]').should('have.length', 0)
        })
      })
    })
  })
})
