import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import taskmap_page from '../../../../../page/taskmap/taskmap_page'
import { addBlocker } from '../../../../../security/cypress/e2e/task/blockers/task_blocker_helpers'

let teamMember, fixture

describe('task_blockers_taskmap_and_roadmap_display', () => {
  before(() => {
    createUser().then(createdUser => {
      teamMember = createdUser
      const seed = {
        matter: {
          teamMembers: [teamMember],
          matterAdmins: [teamMember],
          projects: [
            {
              name: 'Project 1',
              tasks: [
                {
                  name: 'Blocker',
                  properties: {
                    datesLinkedToSiblings: true,
                    plannedStartDate: new Date(2000, 5, 5),
                  },
                },
                {
                  name: 'Blocked',
                  properties: {
                    datesLinkedToSiblings: true,
                    plannedStartDate: new Date(2000, 5, 5),
                  },
                },
                {
                  name: 'Date Link',
                  properties: {
                    datesLinkedToSiblings: true,
                    plannedStartDate: new Date(2000, 5, 5),
                  },
                },
                {
                  name: 'No Link',
                  properties: {
                    datesLinkedToSiblings: false,
                    plannedStartDate: new Date(2000, 5, 5),
                  },
                },
              ],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
    })
  })

  describe('when adding blocks and navigating to the taskmap', () => {
    before(() => {
      cy.login(teamMember.username)
        .then(() => {
          addBlocker(
            fixture.tasks[0].id,
            fixture.tasks[1].id,
            fixture.projects[0].id,
            fixture.matter.id
          )
        })
        .then(() => {
          taskmap_page.navigate.map(fixture.matter.id, fixture.projects[0].id)
        })
    })

    it('should show the relevant blocker icons', () => {
      cy.get('[data-test=task-cell-test]')
        .eq(0)
        .get('[data-test=task-blocker-icon]')
        .should('be.visible')
      cy.get('[data-test=task-cell-test]')
        .eq(1)
        .get('[data-test=task-blocked-icon]')
        .should('be.visible')
    })

    it('should only show the date link icon on the non-blocker task', () => {
      cy.get('[data-test=task-cell-test]')
        .eq(0)
        .children('[data-test=dates-linked-icon]')
        .should('not.exist')
      cy.get('[data-test=task-cell-test]')
        .eq(1)
        .children('[data-test=dates-linked-icon]')
        .should('not.exist')
      cy.get('[data-test=task-cell-test]')
        .eq(2)
        .get('[data-test=dates-linked-icon]')
        .should('be.visible')
    })

    describe('when opening a linked task preview', () => {
      before(() => {
        cy.get('[data-test=task-cell-test]').eq(2).trigger('mouseover')
        cy.wait(1000)
        cy.get('[data-test=task-preview-opener]').eq(0).click()
      })
      it('should show the link summary text and icon', () => {
        cy.get('[data-test=task-links-icon]', { timeout: 30000 }).should(
          'be.visible'
        )
        cy.get('[data-test=task-links-summary]').should(
          'have.text',
          '2 date links, 1 blocking link'
        )
      })
    })

    describe('when opening an unlinked task preview', () => {
      before(() => {
        cy.login(teamMember.username).then(() => {
          taskmap_page.navigate.map(fixture.matter.id, fixture.projects[0].id)
        })
        cy.get('[data-test=task-cell-test]').eq(3).trigger('mouseover')
        cy.wait(1000)
        cy.get('[data-test=task-preview-opener]').eq(3).click()
      })
      it('should not show the link summary', () => {
        cy.get('[data-test=task-links-icon]').should('not.exist')
        cy.get('[data-test=task-links-summary]').should('not.exist')
      })
    })

    // describe('when viewing the map in detailed mode', () => {
    //   before(() => {
    //     cy.login(teamMember.username).then(() => {
    //       taskmap_page.navigate.map(fixture.matter.id, fixture.projects[0].id)
    //     })

    //     cy.get('[data-test=task-cell-test]').eq(2).trigger('mouseover')
    //     cy.wait(1000)
    //     cy.get('[data-test=task-preview-opener]').eq(2).click()

    //     // add label to enable detailed view
    //     addRiskToTask('Clarity')

    //     cy.get('[data-testid=ExpandLessIcon]').click()
    //     cy.get('[data-test=detailed-view-filter]').click()
    //     cy.get('[data-test=detailed-view-filter-detailed-view]').click()
    //   })

    //   it('should show the block icons in chips with text', () => {
    //     cy.get('[data-test=task-cell-test]')
    //       .eq(0)
    //       .get('[data-test=task-blocker-icon]')
    //       .contains('Blocker')
    //     cy.get('[data-test=task-cell-test]')
    //       .eq(1)
    //       .get('[data-test=task-blocked-icon]')
    //       .contains('Blocked')
    //   })
    // })
  })
})
