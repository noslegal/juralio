import chaiColors from 'chai-colors'
import { generateFixture } from '../../../../helpers/matterprojects/fixture_helper'
import { updateMatterStatus } from '../../../../helpers/matterprojects/matter_api_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import { openSelector } from '../../../../helpers/navigation/project-selector-helper'
import {
  createUser,
  updateFTUE,
} from '../../../../helpers/users/user_api_helper'
import matterPage from '../../../../page/matterprojects/matter_page'

const visitHelpers = new VisitHelpers()

chai.use(chaiColors)

describe('matter_details_display.cy', () => {
  let user,
    matterAdminUser,
    fixtures = []

  before(() => {
    createUser().then(createdUser => {
      user = createdUser

      createUser().then(createdUser => {
        matterAdminUser = createdUser
        updateFTUE(user, { hasSeenMatterAdmin: true })
        updateFTUE(matterAdminUser, { hasSeenMatterAdmin: true })
        fixtures.push(
          generateFixture({
            matter: {
              prefix: 'matters_display_1_client',
              teamMembers: [user, matterAdminUser],
              matterAdmins: [matterAdminUser],
              projects: [{ name: 'robot', tasks: [] }],
            },
          })
        )
        fixtures.push(
          generateFixture({
            matter: {
              prefix: 'second_matter',
              teamMembers: [user],
              matterAdmins: [matterAdminUser],
            },
          })
        )
        fixtures.push(
          generateFixture({
            matter: {
              prefix: 'non_member_matter',
              matterAdmins: [matterAdminUser],
            },
          })
        )
        fixtures.push(
          generateFixture({
            matter: {
              prefix: 'empty_closed_matter',
              teamMembers: [user],
              matterAdmins: [user, matterAdminUser],
              projects: [{ name: 'empty', tasks: [] }],
            },
          })
        )

        fixtures.push(
          generateFixture({
            matter: {
              prefix: 'multi_workstreams',
              teamMembers: [user],
              matterAdmins: [user, matterAdminUser],
              projects: [{}, {}],
            },
          })
        )

        fixtures.push(
          generateFixture({
            matter: {
              prefix: 'multi_workstreams',
              teamMembers: [],
              matterAdmins: [matterAdminUser],
              projects: [{}, {}],
            },
          })
        )

        cy.login(matterAdminUser.username).then(() => {
          updateMatterStatus(fixtures[3].matter.id, 'closed')
        })
      })
    })
  })

  describe('when navigating to a specific matter on which the user is an admin', () => {
    before(() => {
      cy.login(matterAdminUser.username)
      visitHelpers.visitMatter(fixtures[0].matter.id)
    })

    it('should display the client name', () => {
      matterPage.get
        .clientName()
        .should('contain.text', fixtures[0].matter.clientName)
    })

    it('should display the matter name', () => {
      matterPage.get
        .matterName()
        .should('contain.text', fixtures[0].matter.name)
    })

    it('should display the matter status toggle as Active', () => {
      matterPage.get.statusToggle().should('contain.text', 'Active')
    })

    it('should display the go to matter overview button', () => {
      matterPage.get.matterOverviewButton().should('exist')
    })

    it('should display the matter user defined reference number', () => {
      matterPage.get
        .userDefinedReferenceNumber()
        .should('contain.text', fixtures[0].matter.userDefinedReferenceNumber)
    })

    it('should display the matters Juralio reference number', () => {
      matterPage.get
        .juralioReferenceNumber()
        .should('contain.text', fixtures[0].matter.matterId)
    })

    it('should display the matter details edit button', () => {
      matterPage.get
        .matterDetailsButton()
        .should('contain.text', 'Edit matter details')
    })

    it('should display the single workstream text', () => {
      matterPage.get
        .singleWorkstreamsWorkstreamsText()
        .should(
          'have.text',
          'This is a single workstream matterWorkstreams allow you to conveniently sub-divide your work.Create new workstream'
        )
    })

    it('should display the create new workstream button', () => {
      matterPage.get
        .createNewWorkstreamButton()
        .should('contain.text', 'Create new workstream')
    })

    it('should display the matter team size and matter admin count', () => {
      matterPage.get.matterAdminCount().should('contain.text', '2')
      matterPage.get.matterTeamSize().should('contain.text', '3')
      matterPage.get
        .teamSummaryPanel()
        .should('contain.text', 'This matter has3editors,0viewers and2admins.')
    })

    it('should go to matter overview when button is clicked', () => {
      matterPage.get.matterOverviewButton().click()
      cy.get('[data-test=overview-button]').should('exist')
    })
  })

  describe('given a matter on which the user is a team-member', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitMatter(fixtures[1].matter.id)
    })

    it('the page should not be displayed', () => {
      cy.get('[data-test=not-found-page]').should('contain', 'Wrong turn')
    })
  })

  describe('given a matter on which the user is NOT an admin and NOT a team-member', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitMatter(fixtures[2].matter.id)
    })

    it('the page should not be displayed', () => {
      cy.get('[data-test=not-found-page]').should('contain', 'Wrong turn')
    })
  })

  describe('given a matter with a closed status', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitMatter(fixtures[3].matter.id)
    })

    it('should display the client name', () => {
      cy.get('[data-test=client-name]').should(
        'contain.text',
        fixtures[3].matter.clientName
      )
    })

    it('should display the matter status toggle as Closed', () => {
      cy.get('[data-test=status-select-selection-dropdown]')
        .eq(0)
        .should('contain.text', 'Closed')
    })

    it('should display the single workstream text', () => {
      matterPage.get
        .singleWorkstreamsWorkstreamsText()
        .should(
          'have.text',
          'This is a single workstream matterWorkstreams allow you to conveniently sub-divide your work.'
        )
    })

    it('should display the matter team size and matter admin count', () => {
      matterPage.get
        .teamSummaryPanel()
        .should('contain.text', 'This matter has2editors,0viewers and3admins.')
    })

    describe('when opening the matter selector', () => {
      before(() => {
        openSelector()
        cy.get('[data-test=closed-matters-checkbox]').click()
      })

      it('the currently viewed matter should be selected', () => {
        cy.get('[data-test=matter-item-matter-name]', { timeout: 30000 })
          .eq(0)
          .should('contain', fixtures[3].matter.name)
      })

      describe('when selecting a different matter and closing the selector', () => {
        before(() => {
          cy.get('[data-test=matter-item-matter-name]', { timeout: 30000 })
            .eq(1)
            .click()
        })

        it('should display the client name', () => {
          cy.get('[data-test=matter-item-client-name]')
            .eq(0)
            .should('contain.text', fixtures[3].matter.clientName)
        })
      })
    })
  })

  describe('given a matter with multiple workstreams', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitMatter(fixtures[4].matter.id)
    })

    it('should display the client name', () => {
      cy.get('[data-test=client-name]').should(
        'contain.text',
        fixtures[4].matter.clientName
      )
    })

    it('should display the multiple workstream text with the number 2', () => {
      matterPage.get
        .multipleWorkstreamsText()
        .should('have.text', 'This matter has2active workstreams.')
    })

    it('should not display the create new workstream button', () => {
      matterPage.get.createNewWorkstreamButton().should('not.exist')
    })

    it('should display the matter team size and matter admin count', () => {
      matterPage.get
        .teamSummaryPanel()
        .should('contain.text', 'This matter has2editors,0viewers and3admins.')
    })
  })

  describe('given a matter with multiple workstreams with single MTM and Admin', () => {
    before(() => {
      cy.login(matterAdminUser.username)
      visitHelpers.visitMatter(fixtures[5].matter.id)
    })

    it('should display the client name', () => {
      cy.get('[data-test=client-name]').should(
        'contain.text',
        fixtures[5].matter.clientName
      )
    })

    it('should display the multiple workstream text with the number 2', () => {
      matterPage.get
        .multipleWorkstreamsText()
        .should('have.text', 'This matter has2active workstreams.')
    })

    it('should not display the create new workstream button', () => {
      matterPage.get.createNewWorkstreamButton().should('not.exist')
    })

    // it('should not display the go to matter overview button', () => {
    //   matterPage.get.matterOverviewButton().should('not.exist')
    // })

    it('should display the matter team size and matter admin count', () => {
      matterPage.get
        .teamSummaryPanel()
        .should('contain.text', 'This matter has1editor,0viewers and2admins.')
    })
    it('should display the add people button and should take you to the people tab dialog', () => {
      cy.get('[data-test="add-user-matter-button"]').should('exist')
      cy.get('[data-test="add-user-matter-button"]').click()
      cy.get('[data-test="cancel-dialog-button"]').should('exist')
    })
  })
})
