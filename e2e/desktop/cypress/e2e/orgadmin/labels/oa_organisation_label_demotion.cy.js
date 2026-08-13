import { setupOrganisationWithMatter } from '../../../../../helpers/labels/setup-organisation-with-matter'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'

const LABEL_NAME = 'DEMOTION'

describe('oa_organisation_label_demotion.cy', () => {
  let orgAdminUser
  let matterAdminUser
  let fixture
  let visitHelper = new VisitHelpers()
  let matterId, projectId
  let matter2Id, project2Id
  let task1, task2, label
  let matterLabel

  before(() => {
    cy.login('sysadmin@juralio.com', 'Password1Password1$')
    const url = `${Cypress.env(
      'serverRootBaseUrl'
    )}/api/admin/instance/settings`

    cy.apiSpecRequest({
      url,
      method: 'PATCH',
      body: {
        enablePaymentPlatformIntegration: false,
      },
    })
    setupOrganisationWithMatter(
      true,
      [{}],
      [
        {
          name: 'DELETED_2nd_project',
          tasks: [{}],
        },
      ]
    ).then(result => {
      fixture = result.fixture
      orgAdminUser = result.orgAdminUser
      matterAdminUser = result.orgMC
      matterId = fixture.matter.id
      projectId = fixture.projects[0].id

      matter2Id = fixture.projects[1].matter.id
      project2Id = fixture.projects[1].id

      task1 = fixture.tasks[0]
      task2 = fixture.tasks[1]

      cy.login(orgAdminUser.username)
      cy.apiSpecRequest({
        url: `${Cypress.env('serverBaseUrl')}/organisation/labels`,
        method: 'POST',
        body: {
          name: LABEL_NAME,
          type: 'risk',
        },
      }).then(response => {
        label = response.body
        cy.login(matterAdminUser.username)
        cy.apiSpecRequest({
          url: `${Cypress.env(
            'serverBaseUrl'
          )}/matter/${matterId}/workstreams/${projectId}/task/${
            task1.id
          }/labels`,
          method: 'POST',
          body: {
            labelId: label.id,
            modifier: 'red',
          },
        }).then(response => {
          cy.login(matterAdminUser.username)
          cy.apiSpecRequest({
            url: `${Cypress.env(
              'serverBaseUrl'
            )}/matter/${matter2Id}/workstreams/${project2Id}/task/${
              task2.id
            }/labels`,
            method: 'POST',
            body: {
              labelId: label.id,
              modifier: 'green',
            },
          }).then(() => {
            cy.login(orgAdminUser.username)
            cy.apiSpecRequest({
              url: `${Cypress.env('serverBaseUrl')}/organisation/labels/${
                label.id
              }`,
              method: 'PATCH',
              body: {
                inactive: true,
              },
            }).then(() => {
              // Recreate the label at the matter level
              cy.login(matterAdminUser.username)
              cy.apiSpecRequest({
                url: `${Cypress.env('serverBaseUrl')}/matter/${
                  fixture.matter.id
                }/labels`,
                method: 'POST',
                body: {
                  name: LABEL_NAME,
                  type: 'risk',
                },
              }).then(response => {
                matterLabel = response.body
              })
            })
          })
        })
      })
    })
  })

  describe('when visiting task1 with a label', () => {
    before(() => {
      cy.login(orgAdminUser)
      visitHelper.visitTaskDetails(matterId, projectId, task1.id)
    })

    it('should show the label', () => {
      cy.get('[data-test=label-chip-text]').should('have.text', LABEL_NAME)
    })
  })

  describe('when visiting task2 with a label', () => {
    before(() => {
      cy.login(orgAdminUser)
      visitHelper.visitTaskDetails(matter2Id, project2Id, task2.id)
    })

    it('should show the label', () => {
      cy.get('[data-test=label-chip-text]').should('have.text', LABEL_NAME)
    })
  })

  describe('when fetching task1', () => {
    it('should use the matter level label on the task', () => {
      cy.login(orgAdminUser)
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matterId}/workstreams/${projectId}/task/${
          fixture.tasks[0].id
        }`,
        method: 'GET',
      }).then(response => {
        expect(response.body.labels[0].labelId).to.eq(matterLabel.id)
      })
    })
  })

  describe('when fetching task2', () => {
    it('should use the matter level label on the task', () => {
      cy.login(orgAdminUser)
      cy.apiSpecRequest({
        url: `${Cypress.env(
          'serverBaseUrl'
        )}/matter/${matter2Id}/workstreams/${project2Id}/task/${
          fixture.tasks[1].id
        }`,
        method: 'GET',
      }).then(response => {
        expect(response.body.labels[0].labelId).to.eq(matterLabel.id)
      })
    })
  })
})
