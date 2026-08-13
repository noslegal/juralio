import nameGenerator from 'project-name-generator'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
    createTemplate,
    publishTemplate
} from '../../../../../helpers/templates/template_api_helper'
import { createUser } from '../../../../../helpers/users/user_api_helper'

const newTemplateName = nameGenerator.generate().spaced

describe('use_template_new_project_from_full_template_create_denied.cy', () => {
  let matterAdmin, user, matter1Fixture, newTemplate, visitHelpers

  before(() => {
    createUser('aaa', true, true, {
      roles: ['ROLE_MATTER_CREATOR', 'ROLE_KNOWLEDGE_MANAGER'],
    }).then((createdUser1) => {
      user = createdUser1

      createUser().then((createdUser2) => {
        matterAdmin = createdUser2
        const seed = {
          matter: {
            prefix: 'tcpds ',
            teamMembers: [matterAdmin, user],
            matterAdmins: [matterAdmin],
            projects: [
              {
                tasks: [{}],
              },
            ],
          },
        }
        matter1Fixture = generateFixture(seed)

        visitHelpers = new VisitHelpers()
      })
    })
  })

  describe('When template map page is open', () => {
    before(() => {
      cy.login(user.username)

      createTemplate(newTemplateName, matter1Fixture.projects[0].id)
        .then((template) => {
          newTemplate = template
        })
        .then(() => {
          publishTemplate(newTemplate.id)
        })
    })

    // describe('when a non-Admin clicks the "Use template" button,', () => {
    //   before(() => {
    //     cy.login(user.username)
    //     visitHelpers.visitTemplateOverview(newTemplate.id)
    //     cy.wait(5000)
    //     cy.get('[data-test=use-template-button]').click()
    //   })

    //   // describe('when a name is entered and next clicked', () => {
    //   //   before(() => {
    //   //     cy.get('[data-test=action-dialog-button]').click()
    //   //     createProjectFromTemplateSingle({ name: 't' }, false)
    //   //   })

    //   //   it('The validation message should be shown.', () => {
    //   //     cy.get('[data-test=new-name]').should(
    //   //       'contain',
    //   //       'You must be a matter admin to create workstreams.'
    //   //     )
    //   //   })
    //   // })
    // })
  })
})
