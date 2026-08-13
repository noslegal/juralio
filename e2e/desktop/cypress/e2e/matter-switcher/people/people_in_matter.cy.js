import {
  removeMatterAdminByUserId,
  removeMatterTeamMemberByUserId,
} from '../../../../../helpers/matter/matter_api_helper'
import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { openSelector } from '../../../../../helpers/navigation/project-selector-helper'
import {
  createUser,
  disableUser,
  MATTER_CREATOR_ID,
} from '../../../../../helpers/users/user_api_helper'

describe('people_in_matter.cy', () => {
  let fixture, matterId, project, appPage
  let matterAdmin1,
    matterAdmin2,
    matterAdmin3,
    matterAdmin4,
    matterAdmin5,
    deactivatedMatterAdmin
  let matterEditor1, matterEditor2, matterEditor3, matterEditor4, matterEditor5
  let matterIdAllRoles, matterIdNoMatterEditors, matterIdNoMatterAdmins
  before(() => {
    createUser().then(user => (matterAdmin1 = user))
    createUser().then(user => (matterAdmin2 = user))
    createUser().then(user => (matterAdmin3 = user))
    createUser().then(user => (matterAdmin4 = user))
    createUser().then(user => (matterAdmin5 = user))
    createUser().then(user => (deactivatedMatterAdmin = user))
    createUser().then(user => (matterEditor1 = user))
    createUser().then(user => (matterEditor2 = user))
    createUser().then(user => (matterEditor3 = user))
    createUser().then(user => (matterEditor4 = user))
    createUser()
      .then(user => {
        matterEditor5 = user
        let seed = {
          matter: {
            prefix: '5_admins_5_editors',
            teamMembers: [
              matterEditor1,
              matterEditor2,
              matterEditor3,
              matterEditor4,
              matterEditor5,
            ],
            matterAdmins: [
              matterAdmin1,
              matterAdmin2,
              matterAdmin3,
              matterAdmin4,
              matterAdmin5,
            ],
            projects: [
              {
                name: '5 a side',
              },
            ],
          },
        }
        fixture = generateFixture(seed)
        matterIdAllRoles = fixture
        seed = {
          matter: {
            prefix: 'no_matter_admins',
            teamMembers: [matterEditor1],
            matterAdmins: [deactivatedMatterAdmin],
            projects: [
              {
                name: 'Workstream',
              },
            ],
          },
        }
        fixture = generateFixture(seed)
        matterIdNoMatterAdmins = fixture
        seed = {
          matter: {
            prefix: 'no_matter_editors',
            teamMembers: [],
            matterAdmins: [matterAdmin1],
            projects: [
              {
                name: 'Workstream',
              },
            ],
          },
        }
        fixture = generateFixture(seed)
        matterIdNoMatterEditors = fixture
        appPage = getWrapper(fixture)
      })
      .then(() => {
        matterIdAllRoles = matterIdAllRoles.matter.id
        matterIdNoMatterAdmins = matterIdNoMatterAdmins.matter.id
        matterIdNoMatterEditors = matterIdNoMatterEditors.matter.id
        // Remove matter creator from matters
        // Remove from matter editors
        removeMatterTeamMemberByUserId(
          matterAdmin1,
          matterIdAllRoles,
          MATTER_CREATOR_ID
        )
        removeMatterTeamMemberByUserId(
          deactivatedMatterAdmin,
          matterIdNoMatterAdmins,
          MATTER_CREATOR_ID
        )
        removeMatterTeamMemberByUserId(
          matterAdmin1,
          matterIdNoMatterEditors,
          MATTER_CREATOR_ID
        )
        // Remove from matter admins
        removeMatterAdminByUserId(
          matterAdmin1,
          matterIdAllRoles,
          MATTER_CREATOR_ID
        )
        removeMatterAdminByUserId(
          deactivatedMatterAdmin,
          matterIdNoMatterAdmins,
          MATTER_CREATOR_ID
        )
        removeMatterAdminByUserId(
          matterAdmin1,
          matterIdNoMatterEditors,
          MATTER_CREATOR_ID
        )
      })
      .then(() => {
        disableUser(matterAdmin1, deactivatedMatterAdmin)
      })
  })
  describe('when the matter switcher is opened', () => {
    before(() => {
      matterId = fixture.matter.id
      project = fixture.projects[0]
      cy.login(matterAdmin1.username)
      appPage.visitHome()
    })
    describe('when select a matter with 5 matter admins and 5 matter editors', () => {
      before(() => {
        openSelector()
        cy.backendRoute('/matter/*/team*').as('teamFetch')
        cy.backendRoute('/matter/*/workstream**').as('projectFetch')
        cy.get('[data-test=matter-switcher-matter-item]').eq(0).click()
        cy.wait(['@teamFetch', '@projectFetch'])
      })
      it('should show 8 avatars with the remaining users in the overflow part', () => {
        cy.get('[data-test=overflow-avatar]').should('contain', '+2')
      })
      describe('when click on an individual', () => {
        before(() => {
          cy.get(
            `[data-test=user-avatar-${matterAdmin1.firstname}-${matterAdmin1.lastname}]`
          ).click()
        })
        it('should show the list of users', () => {
          cy.get('[data-test=pop-up-menu]', { timeout: 30000 }).should('exist')
        })
      })
      describe('when hover over an individual', () => {
        before(() => {
          cy.get('[data-test=matter-switcher-matter-item]')
            .eq(0)
            .click({ force: true })
          cy.get(
            `[data-test=user-avatar-${matterAdmin1.firstname}-${matterAdmin1.lastname}`
          ).trigger('mouseover')
        })
        it('should show a tooltip with their name and matter roles', () => {
          cy.get(`[data-test=tooltip-text-${matterAdmin1.id}`).should(
            'have.text',
            `${matterAdmin1.firstname} ${matterAdmin1.lastname}`
          )
          cy.get(`[data-test=tooltip-role-${matterAdmin1.id}`).should(
            'have.text',
            'Admin'
          )
        })
        it('should have a button to show all the users in the tooltip', () => {
          cy.get(`[data-test=tooltip-button-${matterAdmin1.id}`).should(
            'have.text',
            'Click to see team'
          )
        })
        describe('when pressing the button', () => {
          before(() => {
            cy.get(`[data-test=tooltip-button-${matterAdmin1.id}`).click()
            // cy.get('[data-test=pop-up-menu]').click()
          })
          it('should bring up a full list of names', () => {
            cy.get('[data-test=users-list]').should('exist')
          })
          it('should show a title for matter admins', () => {
            cy.get('[data-test=users-list-matter-admins]').should('exist')
          })
          it('should show a title for matter editors', () => {
            cy.get('[data-test=users-list-matter-editors]').should('exist')
          })
        })
      })
    })
    // Check for no matter editors zero state
    describe('when select a matter with a matter admin', () => {
      before(() => {
        cy.backendRoute('/matter/*/team*').as('teamFetch')
        cy.backendRoute('/matter/*/workstream**').as('projectFetch')
        cy.get('[data-test=matter-switcher-matter-item]')
          .eq(1)
          .click({ force: true })
        cy.wait(['@teamFetch', '@projectFetch'])
        cy.wait(2000)
        cy.get(
          `[data-test=user-avatar-${matterAdmin1.firstname}-${matterAdmin1.lastname}`
        ).trigger('mouseover')
        cy.get(`[data-test=tooltip-button-${matterAdmin1.id}`).click()
      })
      it('should show a zero state for no matter admins', () => {
        cy.get('[data-test=matter-editors-zero-state]').should(
          'have.text',
          'There are no editors on this matter. A matter admin can add editors.'
        )
      })
    })
    // Check for no matter admins zero state
    describe('when select a matter with a matter editor and a deactivated matter admin', () => {
      before(() => {
        cy.login(matterEditor1.username)
        appPage.visitHome()
        openSelector()
        cy.backendRoute('/matter/*/team*').as('teamFetch')
        cy.backendRoute('/matter/*/workstream**').as('projectFetch')
        cy.get('[data-test=matter-switcher-matter-item]')
          .eq(1)
          .click({ force: true })
        cy.wait(['@teamFetch', '@projectFetch'])
        cy.get(
          `[data-test=user-avatar-${matterEditor1.firstname}-${matterEditor1.lastname}`
        ).trigger('mouseover')
        cy.get(`[data-test=tooltip-button-${matterEditor1.id}`).click()
        // cy.get('[data-test=users-list]').click()
      })
      it('should show a zero state for no matter admins', () => {
        cy.get('[data-test=matter-admins-zero-state]').should(
          'have.text',
          'There are no matter admins. You can ask your organisation admin (this may be someone in your IT service) to add one'
        )
      })
      it('should show a zero state for no matter viewers', () => {
        cy.get('[data-test=matter-viewers-zero-state]').should(
          'have.text',
          'There are no viewers on this matter. A matter admin can add viewers.'
        )
      })
    })
  })
})
