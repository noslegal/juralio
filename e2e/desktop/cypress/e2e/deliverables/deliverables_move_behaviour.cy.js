import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

describe('deliverable_move_behaviour', () => {
  let user, fixture

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      const seed = {
        matter: {
          prefix: 'deliverable_behaviour',
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
                      name: 'i am a deliverable',
                      properties: {
                        isDeliverable: true,
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
  describe('when moving deliverable to another tasks subtasks', () => {
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
      cy.get('[data-test=task-card-option-menu] [role=menuitem]').eq(7).click()
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
    it('should show the deliverable indicator', () => {
      cy.get('[data-test=task-header-jur-number]').should(
        'contain.text',
        'B-deliverable'
      )
    })
    it('should show the deliverable icon', () => {
      cy.get('[data-test=deliverable-icon]').should('exist')
    })
  })
  describe('When moving a deliverable to level A', () => {
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
      cy.get('[data-test=task-card-option-menu] [role=menuitem]').eq(7).click()
      cy.get('.MuiSelect-select').click()
      cy.get('[data-test="destination-level-a"]').click()
      cy.get('[data-test="action-dialog-button"]').click()
      cy.wait(3000)
      cy.get('[data-test="name"]').eq(2).click()
    })
    it('should not show the deliverable indicator', () => {
      cy.get('[data-test=task-header-jur-number]').should(
        'contain.text',
        'A-phase'
      )
    })
    it('should not show the deliverable icon', () => {
      cy.get('[data-test=deliverable-icon]').should('not.exist')
    })
  })
})
