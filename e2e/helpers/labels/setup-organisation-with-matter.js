import {
    generateFixtureUsingMatterCreator,
    getWrapper
} from '../matterprojects/fixture_helper'
import {
    createOrganisation,
    sysadminAddUserToOrganisation
} from '../organisation/organisation_api_helper'
import { createUser, updateFTUE } from '../users/user_api_helper'

// eslint-disable-next-line import/prefer-default-export
export const setupOrganisationWithMatter = (
  createAMatter = true,
  tasks = [],
  additionalProjects = []
) => {
  let organisationLabels, orgAdminUser, orgMC, orgKM, fixture, appPage

  const createOrganisationOther = () => {
    return createOrganisation('ORG_OTHER', false).then(organisation => {
      organisationLabels = organisation
    })
  }
  const createOrgAdmin = () => {
    return createUser('', true, false, {
      roles: ['ROLE_MATTER_CREATOR', 'ROLE_ORG_ADMIN'],
    }).then(createdUser => {
      orgAdminUser = createdUser
    })
  }

  const createOrgMC = () => {
    return createUser('', true, false, {
      roles: ['ROLE_MATTER_CREATOR'],
    }).then(createdUser => {
      orgMC = createdUser
    })
  }

  const createOrgKM = () => {
    return createUser('', true, false, {
      roles: ['ROLE_KNOWLEDGE_MANAGER'],
    }).then(createdUser => {
      orgKM = createdUser
    })
  }

  const assignOrgAdminToOtherOrganisation = () => {
    return sysadminAddUserToOrganisation(
      organisationLabels.body,
      orgAdminUser
    ).then(() => updateFTUE(orgAdminUser, { hasSeenOrgAdmin: true }))
  }

  const assignOrgMCToOtherOrganisation = () => {
    return sysadminAddUserToOrganisation(
      organisationLabels.body,
      orgMC
    ).then(() => updateFTUE(orgMC, { hasSeenOrgAdmin: true }))
  }

  const assignOrgKMToOtherOrganisation = () => {
    return sysadminAddUserToOrganisation(
      organisationLabels.body,
      orgKM
    ).then(() => updateFTUE(orgKM, { hasSeenOrgAdmin: true }))
  }

  const createMatter = () => {
    const seed = {
      matter: {
        prefix: 'LABELS',
        teamMembers: [orgAdminUser, orgKM],
        matterAdmins: [orgAdminUser],
        projects: [
          {
            name: 'matter_admin_labels.cy',
            tasks: tasks,
          },
          ...additionalProjects,
        ],
      },
    }
    fixture = generateFixtureUsingMatterCreator(seed, orgMC.username)
    appPage = getWrapper(fixture)
  }

  const sendResult = () =>
    Promise.resolve({
      organisationLabels,
      orgAdminUser,
      orgMC,
      orgKM,
      fixture,
      appPage,
    })

  if (createAMatter) {
    return createOrganisationOther()
      .then(createOrgMC)
      .then(createOrgKM)
      .then(createOrgAdmin)
      .then(assignOrgAdminToOtherOrganisation)
      .then(assignOrgMCToOtherOrganisation)
      .then(assignOrgKMToOtherOrganisation)
      .then(createMatter)
      .then(sendResult)
  }
  return createOrganisationOther()
    .then(createOrgAdmin)
    .then(assignOrgAdminToOtherOrganisation)
    .then(sendResult)
}
