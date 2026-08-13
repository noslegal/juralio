import dayjs from 'dayjs'
import {
  addMatterAdmin,
  addTeamMember,
  createMatter,
} from '../../../../../helpers/matterprojects/matter_api_helper'
import { createProject } from '../../../../../helpers/matterprojects/projects_api_helper'
import {
  createUser,
  updateFTUE,
} from '../../../../../helpers/users/user_api_helper'

function getDateDisplayString(date, dateFormat, fulldateOnly) {
  if (!date) {
    return undefined
  }
  if (!dateFormat) {
    dateFormat = DATE_FORMAT_FULL
  }

  const currentDate = dayjs().startOf('day')
  const endDate = dayjs(dayjs(date)).startOf('day')
  const comparison = endDate.diff(currentDate, 'day')

  if (!fulldateOnly) {
    if (comparison === 0) return 'Today'
    if (comparison === 1) return 'Tomorrow'
    if (comparison === -1) return 'Yesterday'
  }
  return dayjs(date).format(dateFormat)
}
const DATE_FORMAT_DAY_MONTH_YEAR = 'D MMM YYYY'

describe('project_status_display.cy', () => {
  let returnedMatter, matterUser

  before(() => {
    createUser().then(user => {
      matterUser = user
      createMatter().then(matter => {
        returnedMatter = matter
        addTeamMember(matter.id, user.id)
        addMatterAdmin(matter.id, user.id)
        updateFTUE(user, { hasSeenMatterAdmin: true })
        cy.login(user.username)
      })
    })
  })

  describe('given a matter with projects', () => {
    before(() => {
      createProject(returnedMatter.id, 'Active project')
      createProject(returnedMatter.id, 'Closed project', {
        active: false,
      })
      createUser().then(user => {
        addTeamMember(returnedMatter.id, user.id)
        addMatterAdmin(returnedMatter.id, user.id)
        updateFTUE(user, { hasSeenMatterAdmin: true })
        cy.login(user.username)
        cy.visit(`/#/matteradmin/${returnedMatter.id}`)
      })
      cy.get('[data-test=projects]').click()
      cy.get('[data-test=status-select-selection-dropdown]').should('exist')
    })

    it('the active project should show an "Active" and the closed should show "Closed"', () => {
      cy.get('[data-test=status-select-selection-dropdown]')
        .eq(0)
        .should('contain', 'Active')
      cy.get('[data-test=status-select-selection-dropdown]')
        .eq(2)
        .should('contain', 'Closed')
    })

    it('the active project should show an a creation date and the closed projetc should show both a creation and a closed date', () => {
      cy.get('[data-rowindex="1"] [data-colindex="0"]').click()
      cy.get('[data-test=project-created-on]')
        .eq(0)
        .should('contain', 'Created by ')
        .should('contain', matterUser.firstname)
        .should('contain', matterUser.lastname)
        .should(
          'contain',
          getDateDisplayString(new Date(), DATE_FORMAT_DAY_MONTH_YEAR, true)
        )

      cy.get('[data-test=project-closed-on]')
        .eq(0)
        .should('contain', 'Closed by ')
        .should('contain', matterUser.firstname)
        .should('contain', matterUser.lastname)
        .should(
          'contain',
          getDateDisplayString(new Date(), DATE_FORMAT_DAY_MONTH_YEAR, true)
        )
    })
  })
})
