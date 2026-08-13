import {
  addMatterAdmin,
  addTeamMember,
  createMatter,
} from '../../../../helpers/matterprojects/matter_api_helper'
import { createProject } from '../../../../helpers/matterprojects/projects_api_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import {
  createUser,
  updateFTUE,
} from '../../../../helpers/users/user_api_helper'
import matterPage from '../../../../page/matterprojects/matter_page'

describe('matter_activation.cy', () => {
  let newMatter1, returnedUser, visitHelpers

  before(() => {
    createUser().then(user =>
      createMatter().then(matter => {
        newMatter1 = matter
        addTeamMember(matter.id, user.id).then(() => {
          addMatterAdmin(matter.id, user.id).then(() => {
            createProject(newMatter1.id, 'P1').then(newWorkstream => {
              matter = newMatter1
              workstream1 = newWorkstream
            })
          })
        })
        cy.login(user.username)
        returnedUser = user
        visitHelpers = new VisitHelpers()
      })
    )
  })

  describe('When visiting a matter it should display the status', () => {
    before(() => {
      updateFTUE(returnedUser, { hasSeenMatterAdmin: true })
      cy.login(returnedUser.username)
      visitHelpers.visitMatter(newMatter1.id)
    })

    it('should display the matter status toggle as Active', () => {
      matterPage.get.statusToggle().should('contain.text', 'Active')
    })

    describe('should display the Matter status', () => {
      before(() => {
        matterPage.get.statusToggle().click()
        cy.get('[data-test=status-select-off-option]').click()
      })
      it('should display the matter status toggle as Active', () => {
        matterPage.get.statusToggle().should('contain.text', 'Closed')
      })

      describe('When the matter is reopened', () => {
        before(() => {
          matterPage.get.statusToggle().click()
          cy.get('[data-test=status-select-on-option]').click()
        })

        it('The link to the Matter overview is displayed', () => {
          cy.reload()
          cy.login(returnedUser.username)
          visitHelpers.visitMatter(newMatter1.id)
          cy.get('[data-test=go-to-matter-overview]').should('be.visible')
        })

        describe('When the link is clicked', () => {
          before(() => {
            cy.get('[data-test=go-to-matter-overview]').click()
          })

          it('The Matter overview is displayed', () => {
            cy.get('[data-test=project-overview-taskmap-no-content]').should(
              'be.visible'
            )
          })
        })
      })
    })
  })
})
