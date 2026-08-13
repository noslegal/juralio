import nameGenerator from 'project-name-generator'
import { createMatter } from '../matterprojects/matter_api_helper'
import {
  createKnowledgeManagerUser,
  createUser,
} from '../users/user_api_helper'

export function createOrganisation(prefix, mfaEnabled = true) {
  const orgName = (
    (prefix ? prefix : '') + nameGenerator.generate().raw
  ).substring(0, 49)

  return cy.login('sysadmin@juralio.com', 'Password1Password1$').then(() => {
    return cy.request({
      url: `${Cypress.env('serverBaseUrl')}/organisations`,
      method: 'POST',
      body: {
        name: orgName,
        mfaEnabled: mfaEnabled,
      },
    })
  })
}

//WIP
export function updateOrganisation(
  id,
  microsoft_sso_enabled,
  okta_sso_enabled
) {
  return cy.request({
    url: `${Cypress.env('serverBaseUrl')}/organisations/${id}`,
    method: 'PATCH',
    body: {
      microsoftSsoEnabled: microsoft_sso_enabled,
      oktaSsoEnabled: okta_sso_enabled,
    },
  })
}

export function sysadminAddUserToOrganisation(organisation, user) {
  return cy.login('sysadmin@juralio.com', 'Password1Password1$').then(() => {
    return cy.request({
      url: `${Cypress.env('serverBaseUrl')}/organisations/${
        organisation.id
      }/users`,
      method: 'POST',
      body: { username: user.username },
    })
  })
}

export const sysadminRemoveUserFromOrganisation = (organisation, user) => {
  return cy.login('sysadmin@juralio.com', 'Password1Password1$').then(() => {
    return cy.request({
      url: `${Cypress.env('serverBaseUrl')}/organisations/${
        organisation.id
      }/users`,
      method: 'DELETE',
      body: { username: user.username },
    })
  })
}

// `positionId` (optional) is the group's DEFAULT position. The save endpoint
// treats it as an INDEX into the org's default positions
// (OrganisationGroupService.saveGroup), so pass the index of the desired
// position within GET /groupPositions, not its database id. Omitted → index 0.
export function createOrganisationGroup(
  orgId,
  name,
  isInternal = false,
  positionId
) {
  return cy
    .request({
      url: `${Cypress.env('serverBaseUrl')}/organisations/${orgId}/group`,
      method: 'POST',
      body: { name, isInternal, ...(positionId != null && { positionId }) },
    })
    .its('body')
}

export const createDefaultOrgTestUsers = () => {
  let nonTeamMember,
    teamMember,
    matterAdmin,
    matterAdminAndTeamMember,
    knowledgeManager,
    matterViewer

  return createUser('', true, true, { roles: [] })
    .then(createdUser => {
      nonTeamMember = createdUser
    })
    .then(createUser)
    .then(createdUser => {
      teamMember = createdUser
    })
    .then(createUser)
    .then(createdUser => {
      matterViewer = createdUser
    })
    .then(createUser)
    .then(createdUser => {
      matterAdmin = createdUser
    })
    .then(createUser)
    .then(createdUser => {
      matterAdminAndTeamMember = createdUser
    })
    .then(createKnowledgeManagerUser)
    .then(createdUser => {
      knowledgeManager = createdUser
    })
    .then(() => ({
      nonTeamMember,
      teamMember,
      matterViewer,
      matterAdmin,
      matterAdminAndTeamMember,
      knowledgeManager,
    }))
}

export const addUserToOrganisation = (
  organisationAdmin,
  roles,
  organisationId
) => {
  return createUser(null, true, false, { roles }).then(createdUser => {
    cy.login(organisationAdmin.username)

    return cy
      .apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/organisations/${organisationId}/users`,
        method: 'POST',
        body: createdUser,
      })
      .then(newUser => {
        return cy.wrap(newUser.body)
      })
  })
}

export const getDummyOrgUserProperties = () => {
  return [
    { name: 'orgAdmin', roles: ['ROLE_ORG_ADMIN'] },
    { name: 'matterCreator', roles: ['ROLE_MATTER_CREATOR'] },
    { name: 'nonTeamMember', roles: ['ROLE_USER'] },
    { name: 'teamMember', roles: ['ROLE_USER'] },
    { name: 'matterAdmin', roles: ['ROLE_USER'] },
    { name: 'matterAdminAndTeamMember', roles: ['ROLE_USER'] },
    {
      name: 'knowledgeManager',
      roles: ['ROLE_USER', 'ROLE_KNOWLEDGE_MANAGER'],
    },
  ]
}

export const getUniqueEmailAddress = () =>
  `uniqueUser.${crypto.randomUUID()}@juralio.com`

export const createPopulatedDummyOrg = orgNamePrefix => {
  let otherOrgUsers = {}
  let createdOrg

  return createOrganisation(orgNamePrefix, false)
    .then(newOrg => {
      createdOrg = newOrg.body
    })
    .then(() => {
      createUser(`${orgNamePrefix}_user_`, true, false, {
        roles: ['ROLE_ORG_ADMIN'],
      })
    })
    .then(createdUser => {
      otherOrgUsers.orgAdmin = createdUser
    })
    .then(() =>
      sysadminAddUserToOrganisation(createdOrg, otherOrgUsers.orgAdmin)
    )
    .then(() => {
      Cypress.Promise.all(
        getDummyOrgUserProperties().map(c => {
          return addUserToOrganisation(
            otherOrgUsers.orgAdmin,
            c.roles,
            createdOrg.id
          ).then(u => {
            otherOrgUsers[c.name] = u
            return cy.wrap(u)
          })
        })
      )
    })
    .then(() => {
      cy.login(otherOrgUsers.matterCreator.username)
      createMatter('matter', otherOrgUsers.matterCreator.username)
    })
    .then(matter => {
      cy.login(otherOrgUsers.matterCreator.username)
      const teamMembers = [
        otherOrgUsers.matterAdminAndTeamMember,
        otherOrgUsers.teamMember,
      ]
      teamMembers.forEach(tm =>
        cy
          .request({
            url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
              matter.id
            }/teammembers`,
            method: 'POST',
            body: {
              matter: matter.id,
              user: tm.id,
            },
          })
          .its('body')
      )
      const matterAdmins = [
        otherOrgUsers.matterAdminAndTeamMember,
        otherOrgUsers.matterAdmin,
      ]
      matterAdmins.forEach(ma =>
        cy
          .request({
            url: `${Cypress.env('serverBaseUrl')}/admin/matter/${
              matter.id
            }/matters`,
            method: 'POST',
            body: {
              matter: matter.id,
              user: ma.id,
            },
          })
          .its('body')
      )
    })
    .then(() => cy.wrap(otherOrgUsers))
}
