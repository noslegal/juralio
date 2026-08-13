import { getOrgRowByOrgName } from '../organisation/organisation_table_helper'

export const visitHome = () => cy.visit('/#/home')

export const visitGlobalUsers = () => {
  visitHome()
  cy.get('[data-test=accounts]').click()
}

export const visitOrganisations = () => {
  visitHome()
  cy.get('[data-test=organisations]').click()
}

export const visitInstanceManagement = () => {
  visitHome()
  cy.get('[data-test=instance-management]').click()
}

export const visitOrganisationDetail = orgName => {
  cy.backendRoute('GET', '/organisations').as('getOrgs')
  visitOrganisations()
  cy.wait('@getOrgs')
  cy.get('[data-test=organisations]').click()
  getOrgRowByOrgName(orgName)
  cy.get('[data-test=organisation-list-item]').eq(0).click()
}

export const visitActiveUsers = () => {
  visitHome()
  cy.backendRoute('/usage/report/summary').as('getActiveUsers')
  cy.get('[data-test=active-users]').click()
  cy.wait(['@getActiveUsers'])
}

export const visitNoticeboard = () => {
  cy.visit('/#/noticeboard')
}
