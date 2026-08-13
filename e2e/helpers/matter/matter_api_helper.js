export function removeMatterTeamMemberByUserId(matterAdmin, matterId, userId) {
  getMatterTeam(matterAdmin, matterId).then(matterTeam => {
    let matterTeamMemberId = matterTeam.body.find(it => it.user.id === userId)
      .teamMemberId
    removeMatterTeamMember(matterAdmin, matterId, matterTeamMemberId)
  })
}

export function removeMatterAdminByUserId(matterAdmin, matterId, userId) {
  getMatterTeam(matterAdmin, matterId).then(matterTeam => {
    let matterTeamMemberId = matterTeam.body.find(it => it.user.id === userId)
      .matterAdminId
    removeMatterAdmin(matterAdmin, matterId, matterTeamMemberId)
  })
}

export function removeMatterAdmin(matterAdmin, matterId, matterMemberId) {
  cy.login(matterAdmin.username).then(() =>
    cy.request({
      url: `${Cypress.env(
        'serverBaseUrl'
      )}/admin/matter/${matterId}/matters/${matterMemberId}`,
      method: 'DELETE',
      body: {
        id: matterMemberId,
      },
    })
  )
}

export function removeMatterTeamMember(matterAdmin, matterId, matterMemberId) {
  cy.login(matterAdmin.username).then(() =>
    cy.request({
      url: `${Cypress.env(
        'serverBaseUrl'
      )}/admin/matter/${matterId}/teammembers/${matterMemberId}`,
      method: 'DELETE',
    })
  )
}

export function getMatterTeam(matterAdmin, matterId) {
  return cy.login(matterAdmin.username).then(() =>
    cy.request({
      url: `${Cypress.env('serverBaseUrl')}/matter/${matterId}/team`,
      method: 'GET',
    })
  )
}
