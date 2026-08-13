import 'cypress-file-upload'
import {
  createOrganisation,
  sysadminAddUserToOrganisation,
} from '../../../../helpers/organisation/organisation_api_helper'
import { createUser } from '../../../../helpers/users/user_api_helper'

Cypress.Commands.add('form_request', (method, url, auth, formData, done) => {
  const xhr = new XMLHttpRequest()
  xhr.open(method, url)
  xhr.setRequestHeader('Authorization', auth)
  xhr.onload = function () {
    done(xhr)
  }
  xhr.onerror = function () {
    done(xhr)
  }
  xhr.send(formData)
})

describe('organisation_logo.cy', () => {
  let organisation, standardUser, auth

  const navigateToOrg = () => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
  }

  before(() => {
    const createStandardUser = () =>
      createUser(undefined, true, false).then(user => (standardUser = user))
    const associateStandardUserWithOrg = () =>
      sysadminAddUserToOrganisation(organisation, standardUser)

    createOrganisation()
      .then(_organisation => {
        organisation = _organisation.body
      })
      .then(createStandardUser)
      .then(associateStandardUserWithOrg)
  })

  before(navigateToOrg)
  describe('when uploading an image', () => {
    it('should return an OK status', () => {
      auth =
        'Bearer ' +
        JSON.parse(localStorage.getItem('userData')).auth.access_token
      cy.fixture('juralio.png', 'binary')
        .then(Cypress.Blob.binaryStringToBlob)
        .then(blob => {
          let formData = new FormData()
          const file = new File([blob], 'juralio.png')
          formData.append('logo', file)
          cy.form_request(
            'POST',
            `${Cypress.env('serverBaseUrl')}/organisations/${
              organisation.id
            }/logo`,
            auth,
            formData,
            response => {
              expect(response.status).to.eq(200)
            }
          )
        })
    })
  })
  describe('when fetching an image that exists', () => {
    it('should return the image correctly', () => {
      cy.form_request(
        'GET',
        `${Cypress.env('serverBaseUrl')}/organisations/${organisation.id}/logo`,
        auth,
        null,
        response => {
          expect(response.status).to.eq(200)
        }
      )
    })
  })
  describe('when fetching an image that does not exists', () => {
    it('should return a BAD_REQUEST', () => {
      cy.form_request(
        'GET',
        `${Cypress.env('serverBaseUrl')}/organisations/${
          organisation.id + 1
        }/logo`,
        auth,
        null,
        response => {
          expect(response.status).to.eq(400)
        }
      )
    })
  })
  describe('when deleting an image that exists', () => {
    it('should return a OK', () => {
      cy.form_request(
        'DELETE',
        `${Cypress.env('serverBaseUrl')}/organisations/${organisation.id}/logo`,
        auth,
        null,
        response => {
          expect(response.status).to.eq(200)
          cy.form_request(
            'GET',
            `${Cypress.env('serverBaseUrl')}/organisations/${
              organisation.id
            }/logo`,
            auth,
            null,
            response => {
              expect(response.status).to.eq(400)
            }
          )
        }
      )
    })
  })
  describe('when deleting an image that does not exists', () => {
    it('should return a OK', () => {
      cy.form_request(
        'DELETE',
        `${Cypress.env('serverBaseUrl')}/organisations/${organisation.id}/logo`,
        auth,
        null,
        response => {
          expect(response.status).to.eq(200)
        }
      )
    })
  })
  describe('when overriting an image that exists', () => {
    before(() => {
      cy.fixture('juralio.png', 'binary')
        .then(Cypress.Blob.binaryStringToBlob)
        .then(blob => {
          let formData = new FormData()
          const file = new File([blob], 'juralio.png')
          formData.append('logo', file)
          cy.form_request(
            'POST',
            `${Cypress.env('serverBaseUrl')}/organisations/${
              organisation.id
            }/logo`,
            auth,
            formData,
            () => {}
          )
        })
    })
    it('should return OK', () => {
      cy.fixture('juralio_2.png', 'binary')
        .then(Cypress.Blob.binaryStringToBlob)
        .then(blob => {
          let formData = new FormData()
          const file = new File([blob], 'juralio.png')
          formData.append('logo', file)
          cy.form_request(
            'POST',
            `${Cypress.env('serverBaseUrl')}/organisations/${
              organisation.id
            }/logo`,
            auth,
            formData,
            response => {
              expect(response.status).to.eq(200)
            }
          )
        })
    })
  })
})
