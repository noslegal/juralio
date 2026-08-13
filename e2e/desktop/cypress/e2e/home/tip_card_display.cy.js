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

describe('tip_card_display.cy', () => {
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
          createTask(matter.id, project.id, 'not-started', 'T1')
        })
      })
    })
  })
  describe('when there are <3 matters', () => {
    before(() => {
      cy.login(user.username)
      createTemplate('test', fixture.projects[0].id).then(res => {
        publishTemplate(res.id)
      })
      visitHelpers.visitHome()
    })
    it('should show one tip card at the end', () => {
      cy.get('[data-test=tip-card]').should('have.length', 2)
      cy.get('[data-test=masonry-item]')
        .eq(2)
        .find('[data-test=tip-card]')
        .should('exist')
    })
  })
  describe('when there are <5 matters', () => {
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
    it('should show one tip card in the 3rd spot', () => {
      cy.get('[data-test=masonry-item]').should('have.length', 6)
      cy.get('[data-test=tip-card]').should('have.length', 2)
      cy.get('[data-test=masonry-item]')
        .eq(2)
        .find('[data-test=tip-card]')
        .should('exist')
    })
  })
  describe('when there are <5 matters', () => {
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
    it('should show one tip card in the 3rd and 6th spot', () => {
      cy.get('[data-test=tip-card]').should('have.length', 4)
      cy.get('[data-test=masonry-item]')
        .eq(2)
        .find('[data-test=tip-card]')
        .should('exist')
      cy.get('[data-test=masonry-item]')
        .find('[data-test=tip-card]')
        .should('exist')
    })
    describe('when hovering over a tip', () => {
      before(() => {
        cy.login(user.username)
        visitHelpers.visitHome()
        cy.get('[data-test=tip-card]').eq(0).trigger('mouseover')
      })
      it('should show the close button', () => {
        cy.get('[data-test=tip-close-button]').should('be.visible')
      })
      describe('when clicking the close button', () => {
        before(() => {
          cy.get('[data-test=tip-close-button]').eq(0).click()
        })
        it('should close that time', () => {
          cy.get('[data-test=tip-card]').should('have.length', 2)
        })
      })
      describe('when revisiting the home page after closing a tip', () => {
        before(() => {
          cy.login(user.username)
          visitHelpers.visitMatterOverview(fixture.matter.id)
          visitHelpers.visitHome()
        })
        it('should not show the tip cards', () => {
          cy.get('[data-test=masonry-item]').should('have.length', 7)
          cy.get('[data-test=tip-card]').should('have.length', 0)
        })
      })
    })
  })
})
