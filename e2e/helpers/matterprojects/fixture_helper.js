import { getFixtureWrapper } from './fixture_wrapper_helper'
import {
  addMatterAdmin,
  addMatterViewer,
  addTeamMember,
  createMatter,
} from './matter_api_helper'
import {
  addPrivateMembers,
  createWorkstream,
  updateProject,
} from './projects_api_helper'
import {
  addFollowers,
  addTeamMembers,
  createSubTask,
  createTask,
  updateTask,
} from './task_api_helper'

const fixtureTemplate = {
  matter: undefined,
  projects: [],
  tasks: [],
  actions: [],
  tasksMappedByName: {},
}

const letThereBeLight = (
  seed,
  fixture,
  matterCreator = 'matter.creator@juralio.com'
) => {
  createMatter(
    seed.matter.prefix,
    matterCreator,
    seed.matter.isNeutralMatter ? seed.matter.isNeutralMatter : false,
    seed.matter.description ? seed.matter.description : null,
    {},
    '1234567890',
    seed.matter.department ? seed.matter.department : null,
    seed.matter.position ? seed.matter.position : null
  ).then(createdMatter => {
    fixture.matter = createdMatter

    if (seed.matter.teamMembers) {
      seed.matter.teamMembers.forEach(teamMember =>
        addTeamMember(createdMatter.id, teamMember.id, matterCreator)
      )
    }

    if (seed.matter.matterViewer) {
      seed.matter.matterViewer.forEach(teamMember =>
        addMatterViewer(createdMatter.id, teamMember.id, matterCreator)
      )
    }

    if (seed.matter.matterAdmins) {
      seed.matter.matterAdmins.forEach(teamMember =>
        addMatterAdmin(createdMatter.id, teamMember.id, matterCreator)
      )
    }

    if (seed.matter.projects) {
      seed.matter.workstreams = seed.matter.projects
    }

    if (seed.matter.workstreams) {
      seed.matter.workstreams.forEach(project => {
        cy.login(seed.matter.matterAdmins[0]? seed.matter.matterAdmins[0].username : matterCreator)
        createWorkstream(
          createdMatter.id,
          project.name,
          project.properties
        ).then(createdProject =>
          updateProject(
            createdMatter.id,
            createdProject,
            project.properties
          ).then(updatedProject => {
            if (project.privateTeam) {
              //When adding private memebers ensure that the first matter admin in your array is also the first member of your private team as they will need it to work for the permissions
              cy.login(seed.matter.matterAdmins[0].username)
              addPrivateMembers(
                createdMatter.id,
                updatedProject.id,
                project.privateTeam
              )
            }
            fixture.projects.push(updatedProject)
            if (project.tasks) {
              cy.login(seed.matter.teamMembers[0].username)
              project.tasks.forEach(task =>
                createTask(
                  createdMatter.id,
                  updatedProject.id,
                  'not-started',
                  task.name,
                  task.isMilestone
                ).then(createdTask => {
                  if (task.properties) {
                    updateTask(
                      createdMatter.id,
                      updatedProject.id,
                      createdTask.id,
                      task.properties
                    )
                  }

                  if (task.followers) {
                    addFollowers(
                      createdMatter.id,
                      updatedProject.id,
                      createdTask.id,
                      task.followers
                    )

                    // Relogin as team member as followers require their individual logins.
                    cy.login(seed.matter.teamMembers[0].username)
                  }

                  if (task.teamMembers) {
                    addTeamMembers(
                      createdMatter.id,
                      updatedProject.id,
                      createdTask.id,
                      task.teamMembers
                    )
                  }

                  createSubTasks(
                    createdTask,
                    task,
                    createdMatter,
                    updatedProject,
                    fixture,
                    seed
                  )

                  fixture.tasks.push(createdTask)
                  fixture.tasksMappedByName[task.name] = createdTask
                })
              )
            }
          })
        )
      })
    }
  })
}

function createSubTasks(
  parentTask,
  task,
  createdMatter,
  createdProject,
  fixture,
  seed
) {
  if (!task.tasks) return
  task.tasks.forEach(task => {
    createSubTask(
      createdMatter.id,
      createdProject.id,
      'not-started',
      task.name,
      parentTask.id, //parent
      task.isMilestone
    ).then(createdTask => {
      if (task.properties) {
        updateTask(
          createdMatter.id,
          createdProject.id,
          createdTask.id,
          task.properties
        )
      }
      if (task.followers) {
        addFollowers(
          createdMatter.id,
          createdProject.id,
          createdTask.id,
          task.followers
        )

        // Relogin as team member as followers require their individual logins.
        cy.login(seed.matter.teamMembers[0].username)
      }

      if (task.teamMembers) {
        addTeamMembers(
          createdMatter.id,
          createdProject.id,
          createdTask.id,
          task.teamMembers
        )
      }
      fixture.tasks.push(createdTask)
      fixture.tasksMappedByName[task.name] = createdTask
      if (!task.tasks || task.tasks.length === 0) return
      createSubTasks(
        createdTask,
        task,
        createdMatter,
        createdProject,
        fixture,
        seed
      )
    })
  })
}

export const generateFixture = seed => {
  let fixture = { ...fixtureTemplate }
  letThereBeLight(seed, fixture)
  return fixture
}

export const generateFixtureUsingMatterCreator = (seed, matterCreator) => {
  let fixture = { ...fixtureTemplate }

  letThereBeLight(seed, fixture, matterCreator)
  return fixture
}

export const getWrapper = fixture => getFixtureWrapper(fixture)
