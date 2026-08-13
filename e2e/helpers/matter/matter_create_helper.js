/* eslint-disable import/prefer-default-export */

import VisitHelpers from '../matterprojects/visit_helpers'

const visitHelpers = new VisitHelpers()

export const createMatterWithBlankWorkstream = (
  clientName,
  matterName,
  referenceNumber
) => {
  visitHelpers.visitHome()
  cy.get('[data-test=fab-button]').click()
  cy.get('[data-test=create-matter-button]').click()
  cy.get('[data-test=blank-workstream]', { timeout: 30000 }).click()

  cy.get('[data-test=position-select]', { timeout: 30000 }).click()
  cy.get('[data-test=position-option-advisor]').click()
  cy.get('[data-test=client-name]').find('input').type(clientName)
  cy.get('[data-test=name]').find('input').type(matterName)
  cy.get('[data-test=reference-number]').find('input').type(referenceNumber)
  cy.get('[data-test=action-dialog-button]').click()
}

export const createMatterUsingTemplate = (
  clientName,
  matterName,
  referenceNumber,
  templateIndex = 0
) => {
  visitHelpers.visitHome()
  cy.get('[data-test=fab-button]').click()
  cy.get('[data-test=create-matter-button]').click()
  cy.get('[data-test=create-workstream-from-template]').click()
  cy.get('[data-test=template]').eq(templateIndex).click()
  cy.get('[data-test=action-dialog-button]').click()
}
