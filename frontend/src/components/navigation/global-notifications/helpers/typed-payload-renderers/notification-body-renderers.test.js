/*
 * Copyright 2026 Graeme and Joanna Johnston
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  getBodyText,
  getNotificationNavigationDetails,
  getTitleText,
} from './index'

// A mock t that returns the i18n key verbatim and records its interpolation
// argument, so each test can assert both which key a renderer routed to and the
// exact values it interpolated (guarding against undefined-field regressions).
const makeT = () => jest.fn(key => key)

const currentUser = { id: 1, firstname: 'Current', lastname: 'User' }

const build = (eventType, payload = {}, extra = {}) => ({
  id: 1,
  read: false,
  dismissed: false,
  dateCreated: '2026-01-01T00:00:00Z',
  relatedNotifications: [],
  matterEvent: {
    eventType,
    occurredAt: '2026-01-01T00:00:00Z',
    matterId: 10,
    matterReference: 'JUR-1',
    matterName: 'Acme Ltd',
    performedBy: { id: 2, firstName: 'Perry', lastName: 'Former' },
    payload,
  },
  ...extra,
})

describe('notification-body-renderers', () => {
  describe('getBodyText — task and post events', () => {
    const cases = [
      {
        eventType: 'TaskCreated',
        payload: { taskName: 'Draft NDA' },
        key: 'notifications.text.tasks.taskWasCreated',
        opts: { taskName: 'Draft NDA' },
      },
      {
        eventType: 'MarkedAsNotRequired',
        payload: { taskName: 'Draft NDA' },
        key: 'notifications.text.tasks.taskWasMarkedAsNotRequired',
        opts: { taskName: 'Draft NDA' },
      },
      {
        eventType: 'AddedToTaskTeam',
        payload: { taskName: 'Draft NDA' },
        key: 'notifications.text.tasks.addedTaskTeam',
        opts: { taskName: 'Draft NDA' },
      },
      {
        eventType: 'RemovedFromTaskTeam',
        payload: { taskName: 'Draft NDA' },
        key: 'notifications.text.tasks.removedTaskTeam',
        opts: { taskName: 'Draft NDA' },
      },
      {
        eventType: 'PostCreated',
        payload: { postName: 'Kickoff note' },
        key: 'notifications.text.posts.wasCreated',
        opts: { postName: 'Kickoff note' },
      },
      {
        eventType: 'PostMarkedFinal',
        payload: { postName: 'Kickoff note' },
        key: 'notifications.text.posts.wasFinalised',
        opts: { postName: 'Kickoff note' },
      },
    ]

    test.each(cases)(
      '$eventType routes to $key with the expected fields',
      ({ eventType, payload, key, opts }) => {
        const t = makeT()
        const result = getBodyText(t, build(eventType, payload), currentUser)
        expect(result).toBe(key)
        expect(t).toHaveBeenCalledWith(key, opts)
      }
    )
  })

  describe('getBodyText — task status changes', () => {
    test('not-started to in-progress renders the started text', () => {
      const t = makeT()
      const result = getBodyText(
        t,
        build('TaskStatusChanged', {
          taskName: 'Draft NDA',
          previousTaskStatus: 'not-started',
          taskStatus: 'in-progress',
        }),
        currentUser
      )
      expect(result).toBe('notifications.text.tasks.taskWasStarted')
      expect(t).toHaveBeenCalledWith(
        'notifications.text.tasks.taskWasStarted',
        { taskName: 'Draft NDA' }
      )
    })

    test('in-progress to done renders the completed text', () => {
      const t = makeT()
      const result = getBodyText(
        t,
        build('TaskStatusChanged', {
          taskName: 'Draft NDA',
          previousTaskStatus: 'in-progress',
          taskStatus: 'done',
        }),
        currentUser
      )
      expect(result).toBe('notifications.text.tasks.taskWasCompleted')
    })
  })

  // Regression guard: all three move types share one renderer, and each payload
  // carries different fields. Before the per-variant fix, new-parent and level-A
  // moves interpolated an absent oldProjectName and rendered "from undefined".
  describe('getBodyText — task moves render per-variant with defined fields', () => {
    test('TaskMovedNewProject uses the inter-project text', () => {
      const t = makeT()
      const result = getBodyText(
        t,
        build('TaskMovedNewProject', {
          taskName: 'Draft NDA',
          oldProjectName: 'Project A',
          projectName: 'Project B',
        }),
        currentUser
      )
      expect(result).toBe('notifications.text.taskMove.interProject')
      expect(t).toHaveBeenCalledWith(
        'notifications.text.taskMove.interProject',
        {
          taskName: 'Draft NDA',
          oldProjectName: 'Project A',
          projectName: 'Project B',
        }
      )
    })

    test('TaskMovedNewParent uses the parent text with a defined parent name', () => {
      const t = makeT()
      const result = getBodyText(
        t,
        build('TaskMovedNewParent', {
          taskName: 'Draft NDA',
          oldParentName: 'Old Parent',
          newParentTaskName: 'New Parent',
        }),
        currentUser
      )
      expect(result).toBe('notifications.text.taskMove.interParent')
      expect(t).toHaveBeenCalledWith(
        'notifications.text.taskMove.interParent',
        {
          taskName: 'Draft NDA',
          newParentTaskName: 'New Parent',
        }
      )
      const [, opts] = t.mock.calls[0]
      expect(Object.values(opts)).not.toContain(undefined)
    })

    test('TaskMovedLevelA uses the level-A text', () => {
      const t = makeT()
      const result = getBodyText(
        t,
        build('TaskMovedLevelA', {
          taskName: 'Draft NDA',
          oldParentName: 'Old Parent',
        }),
        currentUser
      )
      expect(result).toBe('notifications.text.taskMove.toLevelA')
      expect(t).toHaveBeenCalledWith('notifications.text.taskMove.toLevelA', {
        taskName: 'Draft NDA',
      })
    })
  })

  describe('getBodyText — matter membership events', () => {
    test('another user added as admin uses the admin-added text', () => {
      const t = makeT()
      const result = getBodyText(
        t,
        build('AddedToMatter', {
          affectedMemberId: 99,
          affectedMemberFirstName: 'Ada',
          affectedMemberLastName: 'Member',
          adminStatusChanged: true,
        }),
        currentUser
      )
      expect(result).toBe('notifications.text.matters.matterMemberAddedAdmin')
    })

    test('another user added as editor uses the editor-added text', () => {
      const t = makeT()
      const result = getBodyText(
        t,
        build('AddedToMatter', {
          affectedMemberId: 99,
          affectedMemberFirstName: 'Ada',
          affectedMemberLastName: 'Member',
          adminStatusChanged: false,
        }),
        currentUser
      )
      expect(result).toBe('notifications.text.matters.matterMemberAdded')
    })

    test('current user added uses the you-were-added text', () => {
      const t = makeT()
      const result = getBodyText(
        t,
        build('AddedToMatter', {
          affectedMemberId: currentUser.id,
          affectedMemberFirstName: 'Current',
          affectedMemberLastName: 'User',
          adminStatusChanged: true,
        }),
        currentUser
      )
      expect(result).toBe('notifications.text.matters.addedMatterAdmin')
    })

    test('another user removed uses the member-removed text', () => {
      const t = makeT()
      const result = getBodyText(
        t,
        build('RemovedFromMatter', {
          affectedMemberId: 99,
          affectedMemberFirstName: 'Ada',
          affectedMemberLastName: 'Member',
          adminStatusChanged: false,
        }),
        currentUser
      )
      expect(result).toBe(
        'notifications.text.matters.matterMemberRemovedEditor'
      )
    })

    test('DeletedMatter uses the matter-deleted detail text', () => {
      const t = makeT()
      const result = getBodyText(
        t,
        build('DeletedMatter', { matterName: 'Acme Ltd' }),
        currentUser
      )
      expect(result).toBe('notifications.detailText.matterDeleted')
    })

    test('RestoredMatter uses the matter-restored detail text', () => {
      const t = makeT()
      const result = getBodyText(
        t,
        build('RestoredMatter', { matterName: 'Acme Ltd' }),
        currentUser
      )
      expect(result).toBe('notifications.detailText.matterRestored')
    })
  })

  describe('getBodyText — unrecognised event type', () => {
    test('returns an empty string and logs the offending notification', () => {
      const t = makeT()
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
      const result = getBodyText(t, build('SomethingNew', {}), currentUser)
      expect(result).toBe('')
      expect(spy).toHaveBeenCalled()
      spy.mockRestore()
    })
  })

  describe('getTitleText', () => {
    test('DeletedMatter renders the deleted title', () => {
      const t = makeT()
      const result = getTitleText(t, build('DeletedMatter', {}))
      expect(result).toBe('notifications.titleText.matterDeleted')
    })

    test('RestoredMatter renders the restored title', () => {
      const t = makeT()
      const result = getTitleText(t, build('RestoredMatter', {}))
      expect(result).toBe('notifications.titleText.matterRestored')
    })

    test('other events render the matter reference and name', () => {
      const t = makeT()
      const result = getTitleText(t, build('TaskCreated', {}))
      expect(result).toBe('JUR-1 Acme Ltd')
    })
  })

  describe('getNotificationNavigationDetails', () => {
    test('AddedToMatter targets the matter admin view', () => {
      const details = getNotificationNavigationDetails(
        build('AddedToMatter', { affectedMemberId: 99 })
      )
      expect(details).toEqual({ matterAdminId: 10 })
    })

    test('RestoredMatter targets the matter', () => {
      const details = getNotificationNavigationDetails(
        build('RestoredMatter', {})
      )
      expect(details).toEqual({ matterId: 10, matterID: true })
    })

    test('DeletedMatter flags the deleted matter (no navigation target)', () => {
      const details = getNotificationNavigationDetails(
        build('DeletedMatter', {})
      )
      expect(details).toEqual({ deletedMatter: true })
    })

    test('task events target the matter, project, task and post', () => {
      const details = getNotificationNavigationDetails(
        build('PostCreated', { projectId: 5, taskId: 9, postId: 3 })
      )
      expect(details).toEqual({
        matterId: 10,
        projectId: 5,
        taskId: 9,
        postId: 3,
      })
    })
  })
})
