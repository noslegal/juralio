import HttpStatus from 'http-status-codes'
import { generateFixture } from '../../../../../helpers/matterprojects/fixture_helper'
import {
  createDefaultOrgTestUsers,
  createPopulatedDummyOrg,
} from '../../../../../helpers/organisation/organisation_api_helper'

let templateImport = {
  companyImageBackground: true,
  published: true,
  archived: false,
  name: 'yee-haw 144',
  systemTemplateLastUpdated: '2022-09-29T12:32:24Z',
  tasks: [
    {
      id: 'CT3832',
      name: 'Test 3',
      level: 1,
      isMilestone: false,
      tasks: [],
      posts: [],
    },
    {
      id: 'CT3833',
      name: 'Test 1',
      level: 1,
      isMilestone: false,
      tasks: [
        {
          id: 'CT3834',
          name: 'Alpha',
          level: 2,
          isMilestone: false,
          tasks: [],
          posts: [],
        },
        {
          id: 'CT3835',
          name: 'Beta',
          level: 2,
          isMilestone: false,
          tasks: [],
          posts: [
            {
              id: 'CT3837',
              name: 'bank note',
              type: null,
              url: null,
              description: null,
              startTime: null,
              endTime: null,
              finalised: true,
              privatePost: false,
            },
            {
              id: 'CT3836',
              name: 'document link',
              type: 'Document link',
              url: 'google.com',
              description: null,
              startTime: null,
              endTime: null,
              finalised: true,
              privatePost: false,
            },
          ],
        },
        {
          id: 'CT3838',
          name: 'Gamma',
          level: 2,
          isMilestone: false,
          tasks: [],
          posts: [],
        },
      ],
      posts: [
        {
          id: 'CT3839',
          name: 'post 1',
          type: null,
          url: null,
          description: '<p>data!</p>',
          startTime: null,
          endTime: null,
          finalised: true,
          privatePost: false,
        },
      ],
    },
    {
      id: 'CT3840',
      name: 'Test 2',
      level: 1,
      isMilestone: false,
      tasks: [],
      posts: [],
    },
    {
      id: 'CT3841',
      name: 'Alpha',
      level: 1,
      isMilestone: false,
      tasks: [],
      posts: [],
    },
    {
      id: 'CT3842',
      name: 'Beta',
      level: 1,
      isMilestone: false,
      tasks: [],
      posts: [
        {
          id: 'CT3843',
          name: 'document link',
          type: 'Document link',
          url: 'google.com',
          description: null,
          startTime: null,
          endTime: null,
          finalised: true,
          privatePost: false,
        },
        {
          id: 'CT3844',
          name: 'bank note',
          type: null,
          url: null,
          description: null,
          startTime: null,
          endTime: null,
          finalised: true,
          privatePost: false,
        },
      ],
    },
    {
      id: 'CT3845',
      name: 'Gamma',
      level: 1,
      isMilestone: false,
      tasks: [],
      posts: [],
    },
  ],
  resources: [
    {
      name: 'resource',
      url: 'https://google.com',
      image: null,
    },
  ],
  images: {
    url:
      'https://images.unsplash.com/photo-1581888227599-779811939961?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNTc2NjN8MHwxfHNlYXJjaHwxMXx8ZG9nfGVufDB8MHx8fDE2NjQzNzc4MjY&ixlib=rb-1.2.1&q=80&w=1080',
    urlCredit:
      'https://unsplash.com/@jamie452?umt_source=Juralio+Template+Card+Background+Images&utm_medium=referral',
    urlCreditName: 'Jamie Street',
    companyImage: null,
    companyImageBackground: true,
  },
  metadata: {
    instance: '${DOMAIN}',
    submitterId: 17,
    submissionDate: '2022-09-30T09:54:28.206Z',
    submittedTemplateId: 3831,
    version: 0,
  },
}

describe('sysadmin_import_template_spec', () => {
  before(() => {
    createDefaultOrgTestUsers()
      .then(users => {
        orgUsers = users
      })
      .then(() => createPopulatedDummyOrg('otherOrg'))
      .then(users => {
        otherOrgUsers = users
      })
      .then(() => {
        const seed = {
          matter: {
            prefix: 'importantMatter',
            teamMembers: [
              orgUsers.teamMember,
              orgUsers.matterAdminAndTeamMember,
              orgUsers.knowledgeManager,
            ],
            matterAdmins: [
              orgUsers.matterAdmin,
              orgUsers.matterAdminAndTeamMember,
            ],
            projects: [
              {
                name: 'Project 1',
                tasks: [
                  {
                    name: 'task a',
                    tasks: [
                      { name: 'task 1' },
                      { name: 'task 2', isMilestone: true },
                    ],
                  },
                  { name: 'task b' },
                ],
              },
            ],
          },
        }
        fixture = generateFixture(seed)
      })
  })
  describe('only sysadmin can import', () => {
    it('doesnot allow me to export', () => {
      cy.login(orgUsers.teamMember.username)
      cy.request({
        url: 'http://localhost:8080/api/projecttemplates/import',
        method: 'POST',
        body: templateImport,
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(HttpStatus.FORBIDDEN)
      })
    })
  })
  describe('when importing a template', () => {
    before(() => {
      cy.login('sysadmin@juralio.com', 'Password1Password1$')
      cy.request({
        url: 'http://localhost:8080/api/projecttemplates/import',
        method: 'POST',
        body: templateImport,
        failOnStatusCode: false,
      }).then(res => {
        expect(res.status).to.eq(HttpStatus.CREATED)
      })
    })
  })
})
