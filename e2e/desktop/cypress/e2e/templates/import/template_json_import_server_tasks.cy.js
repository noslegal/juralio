import 'cypress-file-upload'
import { createKnowledgeManagerUser } from '../../../../../helpers/users/user_api_helper'

const GOOD_FIXTURE = 'template_import/good_template.json'

const longString = length => 'x'.repeat(length)

const attachPayload = payload =>
  cy.get('[data-test=json-import-file-input]').attachFile({
    fileContent: payload,
    fileName: 'template.json',
    mimeType: 'application/json',
    encoding: 'utf8',
  })

const enterNameAndSubmit = (name = 'Imported Test Template') => {
  cy.get('[data-test=json-import-rename-field]')
    .find('input')
    .clear()
    .type(name)
  cy.get('[data-test=action-dialog-button]').click()
}

const expectErrorMessage = messageFragment => {
  cy.get('[data-test=json-import-error]').should(
    'contain.text',
    messageFragment
  )
}

describe('template_json_import_server_tasks.cy', () => {
  let user

  before(() => {
    createKnowledgeManagerUser('import_tasks_spec').then(createdUser => {
      user = createdUser
    })
  })

  const openImportDialog = () => {
    cy.login(user.username)
    cy.visit('/#/templates')
    cy.get('[data-test=import-template-json-button]', {
      timeout: 20000,
    }).click()
  }

  const loadGood = () =>
    cy.fixture(GOOD_FIXTURE).then(p => JSON.parse(JSON.stringify(p)))

  describe('server validation - tasks', () => {
    describe('when exceeding the phase limit', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          payload.tasks = Array.from({ length: 17 }, (_, i) => ({
            name: `Phase ${i}`,
            isMilestone: false,
            isDeliverable: false,
            tasks: [],
            posts: [],
          }))
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the too-many-phases error', () => {
        expectErrorMessage('maximum phase count')
      })
    })

    describe('when exceeding the total task count', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          payload.tasks = Array.from({ length: 16 }, (_, p) => ({
            name: `Phase ${p}`,
            isMilestone: false,
            isDeliverable: false,
            tasks: Array.from({ length: 20 }, (_, t) => ({
              name: `Task ${p}-${t}`,
              isMilestone: false,
              isDeliverable: false,
              tasks: [],
              posts: [],
            })),
            posts: [],
          }))
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the too-many-tasks error', () => {
        expectErrorMessage('maximum task limit')
      })
    })

    describe('when task nesting is too deep', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          const buildDeep = depth =>
            depth === 0
              ? []
              : [
                  {
                    name: `Level ${depth}`,
                    isMilestone: false,
                    isDeliverable: false,
                    tasks: buildDeep(depth - 1),
                    posts: [],
                  },
                ]
          payload.tasks = buildDeep(7)
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the nesting-too-deep error', () => {
        expectErrorMessage('maximum task depth')
      })
    })

    describe('when a task has too many subtasks', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          payload.tasks[0].tasks[0].tasks = Array.from(
            { length: 9 },
            (_, i) => ({
              name: `Sub ${i}`,
              isMilestone: false,
              isDeliverable: false,
              tasks: [],
              posts: [],
            })
          )
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the too-many-subtasks error', () => {
        expectErrorMessage('maximum subtask limit')
      })
    })

    describe('when a task has a missing name', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          payload.tasks[0].tasks[0].name = ''
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the task-missing-name error', () => {
        expectErrorMessage('All tasks must have a name')
      })
    })

    describe('when a task name is too long', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          payload.tasks[0].tasks[0].name = longString(71)
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the task-name-too-long error', () => {
        expectErrorMessage('task name exceeds the maximum length')
      })
    })

    describe('when a task description is too long', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          payload.tasks[0].tasks[0].description = longString(501)
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the task-description-too-long error', () => {
        expectErrorMessage('task description exceeds the maximum length')
      })
    })

    describe('when a task is both a milestone and a deliverable', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          payload.tasks[0].tasks[0].isMilestone = true
          payload.tasks[0].tasks[0].isDeliverable = true
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the milestone-is-deliverable error', () => {
        expectErrorMessage('cannot be both a milestone and a deliverable')
      })
    })

    describe('when a milestone has subtasks', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          payload.tasks[0].tasks[0].isMilestone = true
          payload.tasks[0].tasks[0].tasks = [
            {
              name: 'child',
              isMilestone: false,
              isDeliverable: false,
              tasks: [],
              posts: [],
            },
          ]
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the milestone-has-subtasks error', () => {
        expectErrorMessage('Milestone tasks cannot have subtasks')
      })
    })

    describe('when a top-level phase is a milestone', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          payload.tasks[0].isMilestone = true
          payload.tasks[0].tasks = []
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the invalid-phase-type error', () => {
        expectErrorMessage(
          'Milestones and deliverables cannot be top-level phases'
        )
      })
    })

    describe('when a top-level phase is a deliverable', () => {
      before(() => {
        openImportDialog()
        loadGood().then(payload => {
          payload.tasks[0].isDeliverable = true
          attachPayload(payload)
        })
        enterNameAndSubmit()
      })

      it('should show the invalid-phase-type error', () => {
        expectErrorMessage(
          'Milestones and deliverables cannot be top-level phases'
        )
      })
    })
  })
})
