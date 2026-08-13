import faker from 'faker'
import { generateAllSubsets } from '../data/permutation_helpers'
import { sysadminAddUserToOrganisation } from '../organisation/organisation_api_helper'

let users = []

export function createUser(
  prefix,
  resetPassword = true,
  assignDefaultOrg = true,
  additionalProperties,
  knowledgeManagerRole = false,
  isNeutral = false,
  nullNames = false,
  ignoreFtue = false
) {
  const userFirst = nullNames ? '' : faker.name.firstName().replace("'", '')
  const userLast = nullNames ? '' : faker.name.lastName().replace("'", '')

  const username = `${userFirst}${userLast}${new Date()
    .getTime()
    .toString()
    .slice(8)}@juralio.com`
  if (prefix) {
    if (typeof prefix !== 'string') {
      prefix = undefined
    }
  }

  const firstname = prefix === undefined ? userFirst : prefix + userFirst
  const lastname = prefix === undefined ? userLast : prefix + userLast

  const user = {
    firstname,
    lastname,
    username,
    ...additionalProperties,
  }

  return createUserAsSysAdmin(
    user,
    resetPassword,
    assignDefaultOrg,
    knowledgeManagerRole,
    undefined,
    ignoreFtue
  )
}

export function createKnowledgeManagerUser(
  prefix,
  resetPassword = true,
  assignDefaultOrg = true,
  additionalProperties
) {
  return createUser(
    prefix,
    resetPassword,
    assignDefaultOrg,
    additionalProperties,
    true
  )
}

export function createUserFromUsername(
  username,
  firstname,
  lastname,
  resetPassword = true,
  assignDefaultOrg = true,
  knowledgeManager = false
) {
  const user = {
    firstname,
    lastname,
    username,
  }

  return createUserAsSysAdmin(
    user,
    resetPassword,
    assignDefaultOrg,
    knowledgeManager
  )
}

// Log in as an OrgAdmin prior to calling this function.
export function createOrganisationUser(user) {
  return cy
    .request({
      url: `${Cypress.env('serverBaseUrl')}/users`,
      method: 'POST',
      body: {
        roles: ['ROLE_USER'],
        ...user,
      },
    })
    .its('body')
    .then(user => {
      users = [...users, user]

      return updateDefaultPassword(user)
    })
}

export function createMicrosoftUser(username) {
  return cy
    .request({
      url: `${Cypress.env('serverBaseUrl')}/users`,
      method: 'POST',
      body: {
        roles: ['ROLE_USER'],
        firstname: 'Unknown',
        isExternal: false,
        isThirdPartyUser: true,
        lastname: 'Microsoft User',
        thirdPartyProvider: 'microsoft',
        username: username,
      },
    })
    .its('body')
}

export function createOktaUser(username) {
  return cy
    .request({
      url: `${Cypress.env('serverBaseUrl')}/users`,
      method: 'POST',
      body: {
        roles: ['ROLE_USER'],
        firstname: 'Unknown',
        isExternal: false,
        isThirdPartyUser: true,
        lastname: 'Okta User',
        thirdPartyProvider: 'okta',
        username: username,
      },
    })
    .its('body')
}

export function createGoogleUser(username) {
  return cy
    .request({
      url: `${Cypress.env('serverBaseUrl')}/users`,
      method: 'POST',
      body: {
        roles: ['ROLE_USER'],
        firstname: 'Unknown',
        isExternal: false,
        isThirdPartyUser: true,
        lastname: 'Google User',
        thirdPartyProvider: 'google',
        username: username,
      },
    })
    .its('body')
}

export function updateDefaultPassword(user) {
  cy.request({
    url: `${Cypress.env('serverBaseUrl')}/settings/user/password`,
    method: 'POST',
    body: {
      newPassword: Cypress.env('defaultPassword'),
      newPasswordRepeat: Cypress.env('defaultPassword'),
      oldPassword: user.temporaryPassword.password,
      username: user.username,
    },
  }).then(() => user)
}

export const DEFAULT_ORGANISATION_ID = 16
export const MATTER_CREATOR_ID = 22

export const updateUser = body =>
  cy.login('sysadmin@juralio.com', 'Password1Password1$').then(() =>
    cy
      .request({
        url: `${Cypress.env('serverBaseUrl')}/users/${body.id}`,
        method: 'PATCH',
        body,
      })
      .its('body')
      .then(user => user)
  )

export const enableMFA = (orgAdmin, targetUser, mfaEnabled = true) =>
  cy.login(orgAdmin).then(() =>
    cy
      .request({
        url: `${Cypress.env('serverBaseUrl')}/users/${targetUser.id}`,
        method: 'PATCH',
        body: { mfaEnabled },
      })
      .its('body')
      .then(user => user)
  )

export const disableUser = (orgAdmin, targetUser, enabled = false) =>
  cy.login(orgAdmin).then(() =>
    cy
      .request({
        url: `${Cypress.env('serverBaseUrl')}/users/${targetUser.id}`,
        method: 'PATCH',
        body: { enabled },
      })
      .its('body')
      .then(user => user)
  )

export const updateFTUE = (user, body) => {
  cy.login(user.username, user.password).then(() =>
    cy
      .request({
        url: `${Cypress.env('serverBaseUrl')}/settings/user/updateftue/`,
        method: 'PATCH',
        body,
      })
      .its('body')
      .then(() => {
        return user
      })
  )
}

export const getUsers = idx => (idx !== undefined ? users[idx] : users)

function createUserAsSysAdmin(
  user,
  resetPassword,
  assignToDefaultOrgAsOrgAdmin,
  knowledgeManagerRole,
  isNeutraMatterCreator,
  ignoreFtue = false
) {
  return cy
    .login('sysadmin@juralio.com', 'Password1Password1$')
    .then(() =>
      // Resolve the default organisation's internal group dynamically - its id is not stable
      // across environments/DB resets, so it must not be hardcoded.
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/groups`,
        method: 'GET',
      })
    )
    .then(groupsResponse => {
      const defaultOrgInternalGroup = groupsResponse.body.find(
        group =>
          group.organisation &&
          group.organisation.id === DEFAULT_ORGANISATION_ID &&
          group.isInternal
      )
      return cy
        .request({
          url: `${Cypress.env('serverBaseUrl')}/users`,
          method: 'POST',
          body: {
            roles: [
              'ROLE_USER',
              ...(assignToDefaultOrgAsOrgAdmin ? ['ROLE_ORG_ADMIN'] : []),
              ...(knowledgeManagerRole ? ['ROLE_KNOWLEDGE_MANAGER'] : []),
              ...(isNeutraMatterCreator ? ['ROLE_NEUTRAL_MATTER_CREATOR'] : []),
            ],
            ...user,
            group: defaultOrgInternalGroup && defaultOrgInternalGroup.id,
          },
        })
        .its('body')
        .then(user => {
          users = [...users, user]
          if (resetPassword) {
            return updateDefaultPassword(user)
          }
          return user
        })
        .then(user => {
          if (assignToDefaultOrgAsOrgAdmin) {
            sysadminAddUserToOrganisation({ id: DEFAULT_ORGANISATION_ID }, user)
          }

          return cy.wrap(user)
        })
    })
    .then(response => {
      if (!resetPassword || !assignToDefaultOrgAsOrgAdmin || ignoreFtue) {
        return
      }
      return updateFTUE(response, {
        hasSeenTaskmap: true,
        hasSeenTemplates: true,
        hasSeenTemplateOverview: true,
        hasSeenTemplateTaskmap: true,
        hasSeenTimeline: true,
        hasSeenInbox: true,
        hasSeenOrgAdmin: true,
        hasSeenRoadmap: true,
        hasSeenHomePage: true,
      })
    })
}

export const getForbiddenUserRoleCombinations = () => {
  const forbiddenCombinations = []

  const forbiddenAuthorities = [
    'ROLE_SYSADMIN',
    'ROLE_DEMO',
    'ROLE_UPDATES',
    'ROLE_WIP',
    'ROLE_ANALYSIS',
  ]
  const allowedAuthorities = [
    'ROLE_USER',
    'ROLE_MATTER_CREATOR',
    'ROLE_ORG_ADMIN',
    'ROLE_KNOWLEDGE_MANAGER',
  ]

  const forbidden = generateAllSubsets(forbiddenAuthorities, false)
  const allowed = generateAllSubsets(allowedAuthorities, true)

  for (let f of forbidden) {
    for (let a of allowed) {
      forbiddenCombinations.push(f.concat(a))
    }
  }

  return forbiddenCombinations
}
