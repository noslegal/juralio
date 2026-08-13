import { createUser } from "../../../../helpers/users/user_api_helper"
import VisitHelpers from "../../../../helpers/matterprojects/visit_helpers"
import { openSelector } from "../../../../helpers/navigation/project-selector-helper"
import { createMatter, updateMatterStatus } from "../../../../helpers/matterprojects/matter_api_helper"


describe('matter_switcher_zero_state.cy',()=>{
  let  user1
  const visitHelpers = new VisitHelpers()
  before(()=>{
    createUser('', true, false, {}, false, false, false, true).then(
      user => (user1 = user)
    )
  })
  describe('when opening the switcher in a zero state with closed matters hidden',()=>{
    before(()=>{
      cy.login('matter.creator@juralio.com', 'Password2Password2$')
      visitHelpers.visitHome()
      cy.wait(1000)
      openSelector()
      cy.wait(1000)
      cy.get("[data-test=matter-switcher-filter-input]").type("123456778800bnasd")
    })
    it('should show both zero state texts',()=>{
        cy.get("[data-test=zero-state-text-1]").should("contain", "No matters available.")
        cy.get("[data-test=zero-state-text-2]").should("contain", "Check your closed matters by selecting the box above.")
    })
    describe('when pressing the checkbox to show the closed matters',()=>{
      before(()=>{
        createMatter().then(matter => {
          returnedMatter = matter
          updateMatterStatus(matter.id, 'closed')
          cy.login('matter.creator@juralio.com', 'Password2Password2$')
          cy.reload()
          openSelector()
          cy.wait(1000)
          cy.get('[data-test=closed-matters-checkbox]').click()
        })
      })
      it('should hide the second zero state line',()=>{
        cy.get("[data-test=zero-state-text-2]").should("not.exist")
      })
    })
  })
})