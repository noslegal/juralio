import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

describe('milestone_move_behaviour', () => {
  let user, fixture

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'milestone_behaviour',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'workstream',
              tasks: [
                { name: 'pos 1' },
                {
                  name: 'pos 2',
                  tasks: [
                    {
                      name: 'i am a milestone',
                      properties: {
                        isMilestone: true,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
    })
  })
  describe('when moving milestone to another tasks subtasks', () => {
    before(() => {
      cy.login(user)
      cy.visit(
        '/#/matter/' +
          fixture.matter.id +
          '/workstream/' +
          fixture.projects[0].id +
          '/taskmap'
      )
      cy.get('[data-test=options-dropdown]').eq(2).click()
      cy.get('[data-test=task-card-option-menu-more]').click()
      cy.get('[data-test=task-card-option-menu] [role=menuitem]').eq(5).click()
      cy.get('.MuiSelect-select').click()
      cy.get('[data-test="destination-subtask-of"]').click()
      cy.get(
        '[data-test="auto-complete-search-term"] > .MuiInputBase-root'
      ).click()
      cy.get('[data-test="search-result-list-item"]').click()
      cy.get('[data-test="action-dialog-button"]').click()
      cy.wait(3000)
      cy.get('[data-test="name"]').eq(1).click()
    })
    it('should show the milestone indicator', () => {
      cy.get('[data-test=task-header-jur-number]').should(
        'contain.text',
        'B-milestone'
      )
    })
    it('should show the milestone icon', () => {
      cy.get('[data-test=milestone-icon]').should('exist')
    })
  })
  describe('When moving a milestone to level A', () => {
    before(() => {
      cy.login(user)
      cy.visit(
        '/#/matter/' +
          fixture.matter.id +
          '/workstream/' +
          fixture.projects[0].id +
          '/taskmap'
      )
    })
    it('should convert to a phase', () => {
      cy.get('[data-test=options-dropdown]').eq(1).click()
      cy.get('[data-test=task-card-option-menu-more]').click()
      cy.get('[data-test=task-card-option-menu] [role=menuitem]').eq(5).click()
      cy.get('.MuiSelect-select').click()
      cy.get('[data-test="destination-level-a"]').click()
      cy.get('[data-test="action-dialog-button"]').click()
      cy.wait(3000)
      cy.get('[data-test="name"]').eq(2).click()
    })
    it('should not show the milestone indicator', () => {
      cy.get('[data-test=task-header-jur-number]').should(
        'contain.text',
        'A-phase'
      )
    })
    it('should not show the milestone icon', () => {
      cy.get('[data-test=milestone-icon]').should('not.exist')
    })
  })
})
