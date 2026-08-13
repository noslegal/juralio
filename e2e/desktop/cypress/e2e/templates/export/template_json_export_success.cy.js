import {
  createBlankTemplate,
  createTemplateTask,
  createTemplateTaskPost,
  createTemplateResource,
} from '../../../../../helpers/templates/template_api_helper'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

describe('template_json_export_success.cy', () => {
  let user, template, phaseA, group1

  before(() => {
    createKnowledgeManagerUser('json_export_spec').then(createdUser => {
      user = createdUser
      cy.login(user.username)

      createBlankTemplate('Test JSON Export Template').then(createdTemplate => {
        template = createdTemplate

        createTemplateTask(template.id, null, 'Phase A').then(task => {
          phaseA = task
          createTemplateTask(template.id, phaseA.id, 'Group 1').then(task => {
            group1 = task
            createTemplateTask(template.id, group1.id, 'Subtask 1')
          })
          createTemplateTaskPost(template.id, phaseA.id, 'Phase A Note')
        })

        createTemplateTask(template.id, null, 'Phase B')
        createTemplateResource(
          template.id,
          'Test Resource',
          'https://example.com'
        )
      })
    })
  })

  describe('when navigating to the template overview', () => {
    before(() => {
      cy.login(user.username)
      cy.visit(`/#/template/${template.id}/overview`)
    })

    it('should display the template name in the breadcrumb', () => {
      cy.get('[data-test=bread1]').should(
        'contain.text',
        'Test JSON Export Template'
      )
    })

    describe('when opening the download submenu', () => {
      before(() => {
        cy.get('[data-test=template-options-button]').eq(1).click()
        cy.get('[data-test="menu-text-download-template"]').click()
      })

      it('should show the JSON download option', () => {
        cy.get('[data-test="menu-text-download-template-json"]').should('exist')
      })

      it('should show the Excel download option', () => {
        cy.get('[data-test="menu-text-download-template-excel"]').should(
          'exist'
        )
      })

      describe('when clicking the JSON download option', () => {
        before(() => {
          cy.backendRoute('GET', '/projecttemplates/*/export/json').as(
            'exportJson'
          )
          cy.get('[data-test="menu-text-download-template-json"]').click()
          cy.wait('@exportJson')
        })

        it('should call the export endpoint and return 200 with correct data', () => {
          cy.get('@exportJson').then(intercept => {
            expect(intercept.response.statusCode).to.eq(200)
            expect(intercept.response.body.name).to.eq(
              'Test JSON Export Template'
            )
            expect(intercept.response.body.tasks).to.be.an('array')
            expect(intercept.response.body.tasks.length).to.be.greaterThan(0)
            const taskNames = intercept.response.body.tasks.map(t => t.name)
            expect(taskNames).to.include('Phase A')
            expect(taskNames).to.include('Phase B')
            const { metadata } = intercept.response.body
            expect(metadata).to.exist
            expect(metadata.schemaVersion).to.eq(1)
            expect(metadata.submittedTemplateId).to.eq(template.id)
            expect(intercept.response.body.resources).to.be.an('array')
            const resourceNames = intercept.response.body.resources.map(
              r => r.name
            )
            expect(resourceNames).to.include('Test Resource')
          })
        })
      })
    })
  })

  describe('when verifying the exported JSON structure via direct API', () => {
    let exportedJson

    before(() => {
      cy.login(user.username)
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates/${
          template.id
        }/export/json`,
        method: 'GET',
      }).then(response => {
        exportedJson = response.body
      })
    })

    it('should return status 200', () => {
      cy.request({
        url: `${Cypress.env('serverBaseUrl')}/projecttemplates/${
          template.id
        }/export/json`,
        method: 'GET',
      }).then(response => {
        expect(response.status).to.eq(200)
      })
    })

    it('should contain nested task structure under Phase A', () => {
      const phaseAExport = exportedJson.tasks.find(t => t.name === 'Phase A')
      expect(phaseAExport).to.exist
      expect(phaseAExport.tasks).to.be.an('array')
      const group1Export = phaseAExport.tasks.find(t => t.name === 'Group 1')
      expect(group1Export).to.exist
      expect(group1Export.tasks.map(t => t.name)).to.include('Subtask 1')
    })

    it('should include the post on Phase A', () => {
      const phaseAExport = exportedJson.tasks.find(t => t.name === 'Phase A')
      expect(phaseAExport.posts).to.be.an('array')
      const postNames = phaseAExport.posts.map(p => p.name)
      expect(postNames).to.include('Phase A Note')
    })

    it('should set task IDs as CT-prefixed strings', () => {
      exportedJson.tasks.forEach(task => {
        expect(task.id).to.match(/^CT\d+$/)
      })
    })

    it('should include valid metadata fields', () => {
      const { metadata } = exportedJson
      expect(metadata.schemaVersion).to.eq(1)
      expect(metadata.submittedTemplateId).to.eq(template.id)
      expect(metadata.submissionDate).to.be.a('string')
      expect(metadata.instance).to.be.a('string')
    })

    it('should not include any cover image fields', () => {
      expect(exportedJson).to.not.have.property('images')
      expect(exportedJson).to.not.have.property('url')
      expect(exportedJson).to.not.have.property('urlCredit')
      expect(exportedJson).to.not.have.property('urlCreditName')
      expect(exportedJson).to.not.have.property('companyImage')
      expect(exportedJson).to.not.have.property('companyImageBackground')
    })
  })
})
