import {
  generateFixture,
  getWrapper,
} from '../../../../../../helpers/matterprojects/fixture_helper'
import { openSelector } from '../../../../../../helpers/navigation/project-selector-helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'
import { get } from '../../../../../../page/project/overview/project_overview_page'

describe('project_overview_navigation.cy', () => {
  let testUser, fixture, appPage

  const checkNameAndMapContent = (projectIndex, taskCount) => {
    it('should display the name of the project', () => {
      get.projectName().should('contain.text', fixture.projects[projectIndex].name)
    })
  }

  before(() => {
    createUser().then(createdUser => {
      testUser = createdUser
      const seed = {
        matter: {
          prefix: 'project_overview',
          teamMembers: [testUser],
          matterAdmins: [testUser],
          projects: [
            {
              name: 'Overview Spec with Tasks',
              tasks: [
                { name: 'Task1' },
                { name: 'Task2' },
                { name: 'Task3' },
                { name: 'Task4' },
              ],
            },
            {
              name: 'Overview Spec without Tasks',
            },
          ],
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })

  describe('When navigating to a project overview', () => {
    before(() => {
      cy.login(testUser.username)
      cy.backendRoute('/matter/*/workstreams/*/overview').as(
        'workstreamOverview'
      )
      appPage.visitProjectOverview(fixture.matter.id, fixture.projects[0].id)
      cy.wait('@workstreamOverview')
    })

    // checkNameAndMapContent(0, 4)

    describe('When navigating to another project overview', () => {
      before(() => {
        openSelector()
        cy.get('[data-test=matter-switcher-workstream-chip]').eq(1).click()
      })

      checkNameAndMapContent(1, 0)
    })
  })
})
