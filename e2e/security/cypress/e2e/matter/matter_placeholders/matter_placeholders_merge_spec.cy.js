import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import { sysadminAddUserToOrganisation } from '../../../../../helpers/organisation/organisation_api_helper'
import {
    createUser,
    DEFAULT_ORGANISATION_ID
} from '../../../../../helpers/users/user_api_helper'
import faker from 'faker'

const createPlaceholder = () => {
  cy.apiSpecRequest({
    url: `${Cypress.env('serverBaseUrl')}/matter/${
      fixture.matter.id
    }/placeholders`,
    method: 'POST',
    body:{
      firstName:faker.name.firstName(),
      lastName:faker.name.lastName()
    }
  })
}


describe('matter_placeholders_merge_spec.cy', () => {
  let user, user2, fixture, resource,p1,p2
  before(() => {
    createUser('other user', undefined, false).then(createdUser => {
      user2 = createdUser
      sysadminAddUserToOrganisation({ id: DEFAULT_ORGANISATION_ID }, user2)
      createUser().then(createdUser => {
        user = createdUser

        const seed = {
          matter: {
            prefix: 'importantMatter',
            teamMembers: [user],
            matterAdmins: [ user2],
            projects: [],
          },
        }
        fixture = generateFixture(seed)
       
      })
    })
  })
  describe('as a matter editor',()=>{
    before(()=>{
      cy.login(user2)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
          fixture.matter.id
        }/placeholders`,
        method: 'POST',
        body:{
          firstName:faker.name.firstName(),
          lastName:faker.name.lastName()
        }
      }).then(res => {
        p1 = res.body
        cy.apiSpecRequest({
          url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
            fixture.matter.id
          }/placeholders`,
          method: 'POST',
          body:{
            firstName:faker.name.firstName(),
            lastName:faker.name.lastName()
          }
        }).then(res => {
          p2 = res.body
        })
      })
      cy.login(user.username)
    })
    it('should not let me merge placeholders', () => {
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
          fixture.matter.id
        }/placeholders/merge`,
        method: 'POST',
        body:{
          masterPlaceholderId:p1.id,
          minorPlaceholderId:p2.id
        }
      }).then(response => {
        expect(response.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
  describe('as a matter admin',()=>{
    before(()=>{ 
      cy.login(user2.username)
      //add p1 ad ttm
      //ass p2 as ttm
      //add p2 to post
    })
  
  it('should let me merge placeholders',()=>{
    cy.apiSpecRequest({
      url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
        fixture.matter.id
      }/placeholders/merge`,
      method: 'POST',
      body:{
        masterPlaceholderId:p1.id,
        minorPlaceholderId:p2.id
      }
    }).then(response => {
      expect(response.status).to.eq(HttpStatus.OK)
    })
  })
  it('should not let me merge badplaceholders',()=>{
    cy.login(user2.username)
    cy.apiSpecRequest({
      url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
        fixture.matter.id
      }/placeholders/merge`,
      method: 'POST',
      body:{
        masterPlaceholderId:-1,
        minorPlaceholderId:p2.id
      }
    }).then(response => {
      expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
    })
  })
  it('should not let me merge badplaceholders',()=>{
    cy.login(user2.username)
    cy.apiSpecRequest({
      url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
        fixture.matter.id
      }/placeholders/merge`,
      method: 'POST',
      body:{
        masterPlaceholderId:p1.id,
        minorPlaceholderId:-1
      }
    }).then(response => {
      expect(response.status).to.eq(HttpStatus.BAD_REQUEST)
    })
    //check it migrates the ttm and post member
    //check it does not store duplicates
  })})
})