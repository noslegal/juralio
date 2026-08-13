import {
  generateFixture,
  getWrapper,
} from '../../../../../helpers/matterprojects/fixture_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'

const visitHelpers = new VisitHelpers()
describe('taskmap_zoom.cy', () => {
  let user, appPage, fixture
  before(() => {
    createUser().then(createdUser => {
      user = createdUser
      const seed = {
        matter: {
          prefix: 'detailed_display',
          teamMembers: [user],
          matterAdmins: [user],
          projects: [
            {
              name: 'Alpha Project',
              tasks: [
                {
                  name: 'Moon',
                },
                { name: 'Stars' },
              ],
            },
          ],
        },
      }
      fixture = generateFixture(seed)
      appPage = getWrapper(fixture)
    })
  })
  describe('when clicking the plus button to zoom in', () => {
    before(() => {
      cy.login(user.username).then(() => {
        visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
        cy.get('[data-test=taskmap-zoom-in]').click()
      })
    })
    it('should be change taskmap wrapper zoom to 1.1', () => {
      cy.get('[data-test=zoom-taskmap]')
        .should('have.css', 'zoom')
        .and('eq', '1.1')
    })
  })
  describe('when zooming in to 120%', () => {
    before(() => {
      cy.get('[data-test=taskmap-zoom-in]').click({ force: true })
    })
    it('should disable the zoom in',()=>{
      cy.get('[data-test=taskmap-zoom-in]').should('be.disabled')
    })
  })
  describe('when zooming out',()=>{
    before(() => {
      cy.login(user.username).then(() => {
        visitHelpers.visitTaskMap(fixture.matter.id, fixture.projects[0].id)
        cy.get('[data-test=taskmap-zoom-out]').click({ force: true })
      })
    })
    it('should be change taskmap wrapper zoom to 1.1', () => {
      cy.get('[data-test=zoom-taskmap]')
        .should('have.css', 'zoom')
        .and('eq', '0.9')
    })
  })
  describe('when zooming out to 30%',()=>{
    before(() => {
      Cypress._.times(6, () => {
        cy.get('[data-test=taskmap-zoom-out]').click({ force: true })
      })
    })
    it('should disable the zoom in',()=>{
      cy.get('[data-test=taskmap-zoom-out]').should('be.disabled')
    })
  })
})
