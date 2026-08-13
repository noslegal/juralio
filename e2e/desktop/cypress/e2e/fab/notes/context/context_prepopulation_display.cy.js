import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../../helpers/matterprojects/visit_helpers'
import { openCreateNote } from '../../../../../../helpers/notes/notes_create_helper'
import {
  createUser,
  updateFTUE,
} from '../../../../../../helpers/users/user_api_helper'

describe('context_prepopulation_display.cy', () => {
  let user, fixture, appPage
  const visitHelpers = new VisitHelpers()
  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      updateFTUE(user, { hasSeenMatterAdmin: true })
      const matterTeamMember = {
        matter: {
          matterAdmins: [user],
          teamMembers: [user],
          projects: [
            {
              name: 'Matter1Project1',
              tasks: [
                {
                  name: 'Project1Task1',
                },
                {
                  name: 'Project1Task2',
                },
              ],
            },
            {
              name: 'Matter1Project2',
              tasks: [
                {
                  name: 'Project2Task1',
                },
                {
                  name: 'Project2Task2',
                },
              ],
            },
          ],
        },
      }

      fixture = generateFixture(matterTeamMember)
      appPage = getWrapper(fixture)
    })
  })

  describe('when the create note destination dialog is launched outside of a matter', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitHome()
      openCreateNote()
    })

    it('the matter selector should not be populated', () => {
      getMatterSelectInput().should('have.attr', 'value', '')
    })

    it('should automatically open the search results for matters', () => {
      cy.get('[data-test=search-results-list]', { timeout: 30000 }).should(
        'be.visible'
      )
    })

    it('the project selector should not be populated', () => {
      getProjectSelectorInput().should('have.attr', 'value', '')
    })
  })

  describe('when the create note destination dialog is launched inside of a matter', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskMap()
      openCreateNote()
    })

    it('the matter selector should be populated with correct matter name', () => {
      getMatterSelectInput().should(
        'have.attr',
        'value',
        fixture.matter.name + ' - ' + fixture.matter.matterId
      )
    })

    it('the project selector should be populated with the correct project name', () => {
      cy.wait(5000)
      getProjectSelectorInput().should(
        'have.attr',
        'value',
        fixture.projects[0].name
      )
    })

    it('the task selector should not be populated', () => {
      getTaskSelectorInput().should('have.attr', 'value', '')
    })
  })

  describe('when the create note destination dialog is launched inside of a task', () => {
    before(() => {
      cy.login(user.username)
      appPage.visitTaskByName('Project1Task1')
      openCreateNote()
    })
  })

  describe('when the create note destination dialog is launched inside of a matter details page', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitMatter(fixture.matter.id)
      openCreateNote()
    })

    it('the matter selector should be populated with correct matter name', () => {
      getMatterSelectInput().should(
        'have.attr',
        'value',
        fixture.matter.name + ' - ' + fixture.matter.matterId
      )
    })

    it('the project selector should be NOT populated', () => {
      getProjectSelectorInput().should('have.attr', 'value', '')
    })

    it('should automatically open the search results for projects', () => {
      cy.get('[data-test=search-results-list]', { timeout: 30000 }).should(
        'be.visible'
      )
    })

    it('the task selector should not be visible', () => {
      getTaskSelector().should('not.exist')
    })
  })

  describe('when the create note destination dialog is launched inside of an invalid matter', () => {
    before(() => {
      cy.login(user.username)
      cy.visit(
        `/#/matter/zzzzzzzzzz/workstream/${fixture.projects[0].id}/taskmap/`
      )
      openCreateNote()
    })

    it('the matter selector should not be populated', () => {
      getMatterSelectInput().should('have.attr', 'value', '')
    })

    it('should automatically open the search results for matters', () => {
      cy.get('[data-test=search-results-list]', { timeout: 30000 }).should(
        'be.visible'
      )
    })

    it('the project selector should not be populated', () => {
      getProjectSelectorInput().should('have.attr', 'value', '')
    })

    it('the task selector should not be visible', () => {
      getTaskSelector().should('not.exist')
    })
  })

  describe('when the create note destination dialog is launched inside of an invalid project but a valid matter', () => {
    before(() => {
      cy.login(user.username)
      cy.visit(`/#/matter/${fixture.matter.id}/workstream/z67567576/taskmap/`)
      openCreateNote()
    })

    it('the matter selector should be populated with correct matter name', () => {
      getMatterSelectInput().should(
        'have.attr',
        'value',
        fixture.matter.name + ' - ' + fixture.matter.matterId
      )
    })

    it('the project selector should not be populated', () => {
      getProjectSelectorInput().should('have.attr', 'value', '')
    })

    it('should automatically open the search results for projects', () => {
      cy.get('[data-test=search-results-list]', { timeout: 30000 }).should(
        'be.visible'
      )
    })
    it('the task selector should not be visible', () => {
      getTaskSelector().should('not.exist')
    })
  })
})

const getMatterSelectInput = () =>
  cy
    .get('[data-test=matter-select-container]', { timeout: 30000 })
    .find('input')

const getProjectSelector = () => cy.get('[data-test=project-select-container]')
const getProjectSelectorInput = () => getProjectSelector().find('input')

const getTaskSelector = () => cy.get('[data-test=task-select]')
const getTaskSelectorInput = () => getTaskSelector().find('input')
