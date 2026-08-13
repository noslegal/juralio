import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createBlankTemplate,
  createTemplateTask,
  publishTemplate,
} from '../../../../../helpers/templates/template_api_helper'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('create_matter_display.cy', () => {
  let standardUser, otherUser, fixture, template

  before(() => {
    createUser().then(user => {
      otherUser = user
    })
    createUser(undefined, true, true, {
      roles: [
        'ROLE_ORG_ADMIN',
        'ROLE_MATTER_CREATOR',
        'ROLE_KNOWLEDGE_MANAGER',
      ],
    }).then(createdUser => {
      standardUser = createdUser
      const seed = {
        matter: {
          prefix: 'taskCardTest',
          teamMembers: [standardUser, otherUser],
          matterAdmins: [standardUser],
          projects: [
            {
              name: 'Task Note Spec',
              tasks: [{ name: 'Task 1' }, { name: 'Task 2' }],
            },
          ],
        },
      }

      fixture = generateFixture(seed)
      getWrapper(fixture)
    })
    createBlankTemplate('temp').then(t => {
      template = t
      createTemplateTask(template.id, undefined, 'test')
      publishTemplate(template.id)
    })
  })

  describe('login as a non-matter-creator user and visit home page', () => {
    before(() => {
      updateFTUE(otherUser, { hasSeenMatterAdmin: true })
      cy.login(otherUser.username)
      visitHelpers.visitHome()
      cy.get('[data-test="fab-button"]').click()
    })

    it('should not display "Create Matter" button', () => {
      cy.get('[data-test="create-matter-button"]').should('have.length', 0)
    })
  })

  describe('login as a matter creator', () => {
    describe('and visit home page', () => {
      before(() => {
        cy.login(standardUser.username)
        visitHelpers.visitHome()
        cy.get('[data-test="fab-button"]').click()
      })

      it('should display "Create Matter" button', () => {
        cy.get('[data-test="create-matter-button"]').should('have.length', 1)
      })
    })
  })

  describe('login as a matter creator', () => {
    describe('and visit matter page', () => {
      before(() => {
        updateFTUE(standardUser, { hasSeenMatterAdmin: true })
        cy.login(standardUser.username)
        visitHelpers.visitMatter(fixture.matter.id)
        cy.get('[data-test="fab-button"]').click()
      })

      it('should display "Create Matter" button', () => {
        cy.get('[data-test="create-matter-button"]').should('have.length', 0)
      })
    })
  })

  describe('login as a matter creator', () => {
    describe('and visit org page', () => {
      before(() => {
        cy.login(standardUser.username)
        visitHelpers.visitOrgUsers()
        cy.get('[data-test="fab-button"]').click()
      })

      it('should display "Create Matter" button', () => {
        cy.get('[data-test="create-matter-button"]').should('have.length', 1)
      })
    })
  })
})
