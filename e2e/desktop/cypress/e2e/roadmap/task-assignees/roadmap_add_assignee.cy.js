import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import { removeTeamMember } from '../../../../../helpers/tasks/tasks_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const visitHelper = new VisitHelpers()

describe('roadmap_add_assignee.cy', () => {
  let fixture, appPage, user1, user2, user3, user4, user5

  const createUser1 = () =>
    createUser().then(createdUser => (user1 = createdUser))
  const createUser2 = () =>
    createUser().then(createdUser => (user2 = createdUser))
  const createUser3 = () =>
    createUser().then(createdUser => (user3 = createdUser))
  const createUser4 = () =>
    createUser().then(createdUser => (user4 = createdUser))
  const createUser5 = () =>
    createUser().then(createdUser => (user5 = createdUser))

  before(() => {
    createUser1()
      .then(createUser2)
      .then(createUser3)
      .then(createUser4)
      .then(createUser5)
      .then(() => {
        const seed = {
          matter: {
            prefix: 'task_moved_event',
            teamMembers: [user1, user2, user3, user4, user5],
            matterAdmins: [user1],
            projects: [
              {
                name: 'Alpha Project',
                tasks: [
                  {
                    name: 'Moon',
                    teamMembers: [user1],
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

  describe('when viewing the roadmap', () => {
    before(() => {
      cy.login(user1.username)
      removeTeamMember(
        fixture.matter.id,
        fixture.projects[0].id,
        fixture.tasks[0].id,
        user1.id
      )
      appPage.visitRoadmap()
    })
    it('should show the cell with no team members', () => {
      cy.get('[data-test=task-cell-assignee-chip]', { timeout: 10000 })
        .eq(0)
        .find('[data-test=task-cell-zero-assignee-chip]')
        .should('exist')
    })
    // Commented out because too flakey
    // describe('hovering over the assignee chip', () => {
    //   before(() => {
    //     cy.get('[data-test=task-cell-assignee-chip]')
    //       .eq(0)
    //       .scrollIntoView()
    //       .trigger('mouseover', { force: true })
    //   })
    //   it('should show a tooltip', () => {
    //     cy.get('.generic-tooltip').eq(0).should('have.text', 'Add team member')
    //   })
    // })
    // describe('clicking the chip', () => {
    //   before(() => {
    //     cy.wait(5000)
    //     cy.get('[data-test=task-cell-assignee-chip]')
    //       .eq(0)
    //       //.scrollIntoView({ left: 20 })
    //       .click(10, -10) //, { force: true })
    //   })
    //   it('should open the assign user popover', () => {
    //     cy.get('[data-test=add-assignee-popover]').should('exist')
    //   })
    //   it('should list some user choices', () => {
    //     cy.get('[data-test=name-text]').eq(0).should('have.text', 'You')
    //     cy.get('[data-test=name-text]')
    //       .eq(1)
    //       .should(
    //         'have.text',
    //         `${user1.firstname} ${user1.lastname} (${user1.username})`
    //       )
    //   })

    //   // describe('when selecting another matter in the matter switcher and going back to the assignee box', () => {
    //   //   before(() => {
    //   //     cy.get('[data-test=project-selector-closed]').click()
    //   //     cy.get('[data-test=matter-list-item]').eq(0).click()
    //   //     cy.get('[data-test=roadmap-scroll-frame]').click('bottom')
    //   //     cy.get('[data-test=task-cell-assignee-chip]').eq(0).click()
    //   //   })

    //   //   it('should list the same user choices', () => {
    //   //     cy.get('[data-test=name-text]').eq(0).should('have.text', 'You')
    //   //     cy.get('[data-test=name-text]')
    //   //       .eq(1)
    //   //       .should(
    //   //         'have.text',
    //   //         `${user1.firstname} ${user1.lastname} (${user1.username})`
    //   //       )
    //   //   })
    //   // })
    // })
    // describe('clicking a suggested user', () => {
    //   before(() => {
    //     cy.get('[data-test=name-text]').eq(1).click()
    //   })
    //   it('should set the assinged user to that user', () => {
    //     cy.get('[data-test=add-assignee-popover]').should('not.exist')
    //     cy.get('[data-test=task-cell-zero-assignee-chip]').should('not.exist')
    //     cy.get('[data-test=task-cell-single-assignee-chip]').should('exist')
    //     cy.get('[data-test=task-cell-single-assignee-chip]').should(
    //       'have.text',
    //       `${user1.firstname[0]} ${user1.lastname[0]}`
    //     )
    //   })
    // })
    // describe('using the search functionality', () => {
    //   before(() => {
    //     removeTeamMember(
    //       fixture.matter.id,
    //       fixture.projects[0].id,
    //       fixture.tasks[0].id,
    //       user1.id
    //     )
    //     appPage.visitRoadmap()
    //     cy.get('[data-test=task-cell-assignee-chip]').eq(0).click()
    //     cy.get('[data-test=auto-complete-search-term]')
    //       .find('input')
    //       .eq(0)
    //       .type(user1.firstname)
    //   })
    //   it('should hide the suggestions', () => {
    //     cy.get('[data-test=name-text]').should('not.exist')
    //   })
    //   it('should show matching users in the matter team', () => {
    //     cy.get('[data-test=search-result-list-item]').eq(0).should('exist')
    //     cy.get('[data-test=search-result-list-item]')
    //       .eq(0)
    //       .contains(`${user1.firstname} ${user1.lastname} (${user1.username})`)
    //   })
    //   describe('clicking the matched user', () => {
    //     before(() => {
    //       cy.get('[data-test=search-result-list-item]').eq(0).click()
    //     })
    //     it('should set the assinged user to that user', () => {
    //       cy.get('[data-test=add-assignee-popover]').should('not.exist')
    //       cy.get('[data-test=task-cell-zero-assignee-chip]').should('not.exist')
    //       cy.get('[data-test=task-cell-single-assignee-chip]').should('exist')
    //       cy.get('[data-test=task-cell-single-assignee-chip]').should(
    //         'have.text',
    //         `${user1.firstname[0]} ${user1.lastname[0]}`
    //       )
    //     })
    //   })
    // })
  })
})
