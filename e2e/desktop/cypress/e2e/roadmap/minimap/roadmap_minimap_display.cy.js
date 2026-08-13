import {
    generateFixture,
    getWrapper
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import { get as roadmap } from '../../../../../page/roadmap/roadmap_page'

describe('roadmap_minimap_display.cy', () => {
  let user, fixture, project, appPage

  before(() => {
    createUser()
      .then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'roadmap_minimap_display.cy',
            teamMembers: [user],
            matterAdmins: [user],
            projects: [
              {
                name: 'Mix of Statuses',
                tasks: [
                  {
                    name: 'Done Task',
                    properties: {
                      status: 'done',
                    },
                  },
                  {
                    name: 'In Progress Task',
                    properties: {
                      status: 'in-progress',
                    },
                  },
                  {
                    name: 'Not Started Task',
                    properties: {
                      status: 'not-started',
                    },
                  },
                ],
              },
            ],
          },
        }

        fixture = generateFixture(seed)
      })
      .then(() => {
        appPage = getWrapper(fixture)
        project = fixture.projects
      })
  })

  describe('When navigating to roadmap', () => {
    before(() => {
      cy.login(user)
      appPage.visitRoadmap()
    })

    it('should show the minimap', () => {
      roadmap.miniMap().should('be.visible')
    })

    describe('when close the minimap', () => {
      before(() => {
        roadmap.miniMapMaximized().click()
      })

      it('should no longer show the minimap', () => {
        roadmap.miniMap().should('not.be.visible')
      })
    })

    describe('when open the minimap', () => {
      before(() => {
        roadmap.miniMapMinimized().click()
      })

      it('should no longer show the minimap', () => {
        roadmap.miniMap().should('be.visible')
      })
    })
  })
})
