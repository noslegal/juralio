import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
  addMatterAdmin,
  addTeamMember,
  createMatter,
} from '../../../../../helpers/matterprojects/matter_api_helper'
import { createProject } from '../../../../../helpers/matterprojects/projects_api_helper'
import { createTask } from '../../../../../helpers/matterprojects/task_api_helper'
import VisitHelpers from '../../../../../helpers/matterprojects/visit_helpers'
import {
  createTemplate,
  publishTemplate,
} from '../../../../../helpers/templates/template_api_helper'
import {
  createKnowledgeManagerUser,
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'

const visitHelpers = new VisitHelpers()

describe('create_workstream_limit.cy', () => {
  let matterAdmin, teamMember, userHasBothRole, knowledgeManager, matter

  before(() => {
    createKnowledgeManagerUser()
      .then(createdUser => {
        knowledgeManager = createdUser

        const seed = {
          matter: {
            teamMembers: [knowledgeManager],
            matterAdmins: [knowledgeManager],
            projects: [
              {
                name: 'Create Workstream Spec0',
                tasks: [{ name: 'Task1' }],
              },
              {
                name: 'Create Workstream Spec1',
                tasks: [{ name: 'Task1' }],
              },
              {
                name: 'Create Workstream Spec2',
                tasks: [{ name: 'Task1' }],
              },
              {
                name: 'Create Workstream Spec3',
                tasks: [{ name: 'Task1' }],
              },
              {
                name: 'Create Workstream Spec4',
                tasks: [{ name: 'Task1' }],
              },
              {
                name: 'Create Workstream Spec5',
                tasks: [{ name: 'Task1' }],
              },
              {
                name: 'Create Workstream Spec6',
                tasks: [{ name: 'Task1' }],
              },
              {
                name: 'Create Workstream Spec7',
                tasks: [{ name: 'Task1' }],
              },
              {
                name: 'Create Workstream Spec8',
                tasks: [{ name: 'Task1' }],
              },
              {
                name: 'Create Workstream Spec9',
                tasks: [{ name: 'Task1' }],
              },
              {
                name: 'Create Workstream Spec10',
                tasks: [{ name: 'Task1' }],
              },

              {
                name: 'Create Workstream Spec11',
                tasks: [{ name: 'Task1' }],
              },
              {
                name: 'Create Workstream Spec12',
                tasks: [{ name: 'Task1' }],
              },
              {
                name: 'Create Workstream Spec13',
                tasks: [{ name: 'Task1' }],
              },
              {
                name: 'Create Workstream Spec14',
                tasks: [{ name: 'Task1' }],
              },
              {
                name: 'Create Workstream Spec15',
                tasks: [{ name: 'Task1' }],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
      .then(() => {
        workstream = fixture.projects[0]
        cy.login(knowledgeManager.username)
        createTemplate('newTemplateName', workstream.id).then(
          createdTemplate => {
            template = createdTemplate
            publishTemplate(template.id)
          }
        )
      })

    createUser()
      .then(user => {
        teamMember = user
        return createMatter()
      })
      .then(m => {
        matter = m
        addTeamMember(matter.id, teamMember.id)
      })
  })

  describe('when trying to create workstream', () => {
    describe('when logged in as a user who is both team member and matter admin', () => {
      before(() => {
        cy.login(knowledgeManager.username)
        visitHelpers.visitMatter(fixture.matter.id)
        cy.get('[data-test="close-icon"]').click()
        cy.get('[data-test="ftueSkipButton"]').click()
      })

      it('should display a single "Create new workstream" button as disabled', () => {
        cy.wait(2000)
        cy.get('[data-test=projects]').click()
        cy.wait(2000)
        cy.get('[data-test=create-new-workstream]').should('be.visible')
        cy.get('[data-test=create-new-workstream]').should('be.disabled')
      })
    })
  })
})
