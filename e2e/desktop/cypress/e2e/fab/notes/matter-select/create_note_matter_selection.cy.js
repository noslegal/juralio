import { generateFixture } from '../../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../../helpers/matterprojects/visit_helpers'
import { openCreateNote } from '../../../../../../helpers/notes/notes_create_helper'
import { createUser } from '../../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('create_note_matter_selection.cy', () => {
  let user, fixtureTeam, dummyUser
  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      createUser().then(createdUser => {
        dummyUser = createdUser

        const matterTeamMember = {
          matter: {
            teamMembers: [user],
            matterAdmins: [dummyUser],
            projects: [
              {
                name: 'Project',
                tasks: [{ name: 'Task' }],
              },
            ],
          },
        }

        const matterAdminMember = {
          matter: {
            matterAdmins: [user],
            projects: [
              {
                name: 'Project',
              },
            ],
          },
        }

        fixtureTeam = generateFixture(matterTeamMember)
        generateFixture(matterAdminMember)
      })
    })
  })

  const getMatterSelector = () => cy.get('[data-test=matter-select-container]')
  const getMatterSelectorInput = () => getMatterSelector().find('input')

  describe('when the create note destination dialog is launched, the matter selector', () => {
    before(() => {
      cy.login(user.username)
      visitHelpers.visitHome()
      openCreateNote()
    })

    it('should be displayed', () => {
      getMatterSelector().should('be.visible')
    })

    it('should have a "Choose a matter" placeholder', () => {
      getMatterSelectorInput().should(
        'have.attr',
        'placeholder',
        'Choose a matter'
      )
    })

    describe('when a search term is entered', () => {
      before(() => {
        getMatterSelectorInput().type('a').type('{backspace}')
      })

      it('should render only matters where the user is a team member (NOT admin)', () => {
        cy.get('[data-test=matter-select-menu-item]').should('have.length', 1)
      })

      describe('a menuitem should be displayed', () => {
        it('should have the expected matter name', () => {
          cy.get('[data-test=matter-name]').should(
            'have.text',
            fixtureTeam.matter.name
          )
        })

        it('should have the expected matter id', () => {
          cy.get('[data-test=matter-id]').should(
            'have.text',
            fixtureTeam.matter.matterId
          )
        })
      })

      describe('clicking the matter menu item ', () => {
        before(() => {
          cy.get('[data-test=matter-select-menu-item]').click()
        })

        it('should close the menu', () => {
          cy.get('[data-test=matter-select-menu-item]').should('not.exist')
        })

        describe('should set the selected matter', () => {
          it('with the expected matter name', () => {
            getMatterSelectorInput().should(
              'have.value',
              fixtureTeam.matter.name + ' - ' + fixtureTeam.matter.matterId
            )
          })
        })
      })
    })
  })
})
