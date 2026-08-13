/*
Purpose: Tests Matter overview link is only shown if relevant.

Test flow:  Sets up matter + workstreams and runs through various states of active/inactive.


Date created: 23/12/21
*/

import {
  addMatterAdmin,
  addTeamMember,
  createMatter,
  updateMatterStatus,
} from '../../../../helpers/matterprojects/matter_api_helper'
import { createProject } from '../../../../helpers/matterprojects/projects_api_helper'
import VisitHelpers from '../../../../helpers/matterprojects/visit_helpers'
import {
  createUser,
  updateFTUE,
} from '../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('matter_admin_overviewlink.cy', () => {
  let matter
  let workstream1, workstream2
  let user

  before(() => {
    createUser('', true, true, {
      roles: ['ROLE_MATTER_CREATOR', 'ROLE_KNOWLEDGE_MANAGER', 'ROLE_USER'],
    }).then(createdUser => {
      user = createdUser
      createMatter('V').then(newMatter1 => {
        addMatterAdmin(newMatter1.id, user.id).then(() => {
          addTeamMember(newMatter1.id, user.id).then(() => {
            createProject(newMatter1.id, 'P1').then(newWorkstream => {
              matter = newMatter1
              workstream1 = newWorkstream
              createProject(newMatter1.id, 'P2').then(newWorkstream => {
                workstream2 = newWorkstream
                cy.login(user.username)
                visitHelpers.visitMatter(newMatter1.id)
              })
            })
          })
        })
      })
    })
  })

  it('The link to the Matter overview is displayed', () => {
    cy.get('[data-test=go-to-matter-overview]').should('be.visible')
  })

  describe('when the Matter is inactive', () => {
    before(() => {
      cy.login(user.username)
      updateFTUE(user, { hasSeenMatterAdmin: true })
      updateMatterStatus(matter.id, 'closed')
      cy.reload()
    })

    it('The link to the Matter overview is not displayed', () => {
      cy.get('[data-test=go-to-matter-overview]').should('not.exist')
    })

    after(() => {
      cy.login(user.username)
      updateMatterStatus(matter.id, 'active')
      cy.reload()
    })
  })

  describe('when the 1 workstream is inactive', () => {
    before(() => {
      cy.login(user.username)
      cy.wait(2000)
      cy.get('[data-test=projects]').click()
      cy.get('[data-rowindex="0"] [data-colindex="1"]').click()
      // cy.get('[data-test=status-select-selection-dropdown]').eq(0).click()
      cy.get('[data-test=status-select-off-option]').click()
    })

    it('The link to the Matter overview is displayed', () => {
      cy.get('[data-test=go-to-matter-overview]').should('be.visible')
    })
  })

  describe('when the workstreams are made inactive', () => {
    before(() => {
      cy.login(user.username)
      cy.get('[data-rowindex="1"] [data-colindex="1"]').click()
      // cy.get('[data-test=status-select-selection-dropdown]').eq(0).click()
      cy.get('[data-test=status-select-off-option]').click()
    })

    it('The link to the Matter overview is not displayed', () => {
      cy.get('[data-test=go-to-matter-overview]').should('not.exist')
    })
  })
})
