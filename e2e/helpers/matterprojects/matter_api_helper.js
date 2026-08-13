import nameGenerator from 'project-name-generator'

let matters = []

// `position` chooses the creator's group position on the matter:
//   'Advisor' (or 1) → Advisor, 'Client' (or 0) → Client.
// Left null it is omitted, so the matter falls back to the creator's group
// default position (a new org's internal group defaults to Client).
const POSITION_INDEX = { client: 0, advisor: 1 }

const resolvePosition = position => {
  if (position === null || position === undefined) return null
  if (typeof position === 'number') return position
  return POSITION_INDEX[String(position).toLowerCase()]
}

export function createMatter(
  matterName,
  userName = 'matter.creator@juralio.com',
  isNeutralMatter = false,
  description = null,
  matterParties = {},
  userDefinedReferenceNumber = '1234567890',
  department = null,
  position = null
) {
  const clientName = nameGenerator.generate().spaced

  const name = matterName ? matterName : nameGenerator.generate().spaced

  const positionIndex = resolvePosition(position)

  return cy.login(userName).then(() => {
    return cy
      .request({
        url: `${Cypress.env('serverBaseUrl')}/matters`,
        method: 'POST',
        body: {
          clientName,
          name,
          isNeutralMatter,
          matterParties,
          userDefinedReferenceNumber,
          description,
          department,
          ...(positionIndex != null && { position: positionIndex }),
        },
      })
      .its('body')
      .then(matter => {
        matters = [...matters, matter]
        return matter
      })
  })
}

// Convenience wrapper for costs specs: a matter whose creator is positioned as
// Advisor on the matter. Costs gating is position-scoped and org costs are
// seeded for Advisor (see setupOrgLevelCosts), so the costs suite needs the
// creator on the Advisor side rather than the Client default. Mirrors
// createMatter's signature minus the trailing position arg.
export function createAdvisorMatter(
  matterName,
  userName = 'matter.creator@juralio.com',
  isNeutralMatter = false,
  description = null,
  matterParties = {},
  userDefinedReferenceNumber = '1234567890',
  department = null
) {
  return createMatter(
    matterName,
    userName,
    isNeutralMatter,
    description,
    matterParties,
    userDefinedReferenceNumber,
    department,
    'Advisor'
  )
}

export const addTeamMember = (
  matterId,
  userId,
  matterCreator = 'matter.creator@juralio.com',
  password = 'Password2Password2$'
) =>
  cy.login(matterCreator, password).then(() =>
    cy
      .request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/admin/matter/${matterId}/teammembers`,
        method: 'POST',
        body: {
          matter: matterId,
          user: userId,
        },
      })
      .its('body')
  )

export const addTeamMembers = (
  matterId,
  userIds,
  matterCreator = 'matter.creator@juralio.com',
  password = 'Password2Password2$'
) =>
  cy.login(matterCreator, password).then(() =>
    cy
      .request({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/admin/matter/${matterId}/teammembers`,
        method: 'POST',
        body: {
          matter: matterId,
          users: userIds,
        },
      })
      .its('body')
  )

export const addMatterAdmin = (
  matterId,
  userId,
  matterCreator = 'matter.creator@juralio.com'
) =>
  cy.login(matterCreator, 'Password2Password2$').then(() =>
    cy
      .request({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${matterId}/matters`,
        method: 'POST',
        body: {
          matter: matterId,
          user: userId,
        },
      })
      .its('body')
  )

export const addMatterViewer = (
  matterId,
  userId,
  matterCreator = 'matter.creator@juralio.com'
) =>
  cy.login(matterCreator, 'Password2Password2$').then(() =>
    cy
      .request({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${matterId}/viewers`,
        method: 'POST',
        body: {
          matter: matterId,
          users: [userId],
        },
      })
      .its('body')
  )

export const addMatterCosts = (
  matterId,
  userId,
  matterCreator = 'matter.creator@juralio.com'
) =>
  cy.login(matterCreator).then(() =>
    cy
      .request({
        url: `${Cypress.env('serverBaseUrl')}/admin/matter/${matterId}/costs`,
        method: 'POST',
        body: {
          matter: matterId,
          id: userId,
        },
      })
      .its('body')
  )

// Creates an internal group holding the "Client" position and attaches it to a
// matter. This is what makes `matterHasInternalClientGroup` true, routing an
// advisor (or a client in an internal group) to the client costs view
// (ClientMatterCostsContainer) where the projection download lives.
// `adminUser` must be an org admin with matter-admin rights on the matter.
export const addInternalClientGroupToMatter = (
  orgId,
  matterId,
  adminUser,
  groupName = 'Internal Client Group'
) =>
  cy.login(adminUser.username ? adminUser.username : adminUser).then(() =>
    cy
      .request({
        url: `${Cypress.env('serverBaseUrl')}/organisations/${orgId}/group`,
        method: 'POST',
        body: { name: groupName, isInternal: true },
      })
      .its('body')
      .then(group =>
        cy
          .request({
            url: `${Cypress.env('serverBaseUrl')}/groupPositions`,
            method: 'GET',
          })
          .its('body')
          .then(positions => {
            const clientPosition = positions.find(p => p.name === 'Client')
            return cy
              .request({
                url: `${Cypress.env(
                  'serverBaseUrl'
                )}/matter/${matterId}/matterGroupPosition`,
                method: 'PATCH',
                body: { groupId: group.id, positionId: clientPosition.id },
              })
              .then(() => group)
          })
      )
  )

export const updateMatterStatus = (matterId, status) => {
  cy.request({
    url: `${Cypress.env('serverBaseUrl')}/admin/matter/${matterId}`,
    method: 'PATCH',
    body: {
      matterStatus: status,
    },
  }).its('body')
}

export const getMatters = idx => (idx !== undefined ? matters[idx] : matters)
