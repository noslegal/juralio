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
  filterOutAtLevelAndBelow,
  flatTaskListFromTree,
  filterOutTaskById,
  getTaskById,
  getTaskDepth,
  getTaskByIdFromTree,
  filterOutSelfParentAndChildrenOfTask,
  buildValidTargetTaskList,
} from './task-list-data-provider'

describe('task-list-data-provider.test', () => {
  describe('getTaskDepth', () => {
    const taskNoSubTasks = { id: 1, tasks: [] }
    const task1LevelOfSubtasks = {
      tasks: [{ id: 1, tasks: [] }],
    }
    const task2LevelsOfSubtasks = {
      tasks: [{ id: 1, tasks: [{ id: 2, tasks: [] }] }],
    }
    const task3LevelsOfSubtasks = {
      tasks: [
        {
          id: 1,
          tasks: [
            {
              id: 2,
              tasks: [
                { id: 3, tasks: [] },
                { id: 4, tasks: [] },
                { id: 4, tasks: [] },
              ],
            },
          ],
        },
      ],
    }
    const task4LevelsOfSubtasks = {
      tasks: [
        {
          id: 1,
          tasks: [
            {
              id: 2,
              tasks: [{ id: 3, tasks: [{ id: 4, tasks: [] }] }],
            },
          ],
        },
      ],
    }
    const task5LevelsOfSubtasks = {
      tasks: [
        {
          id: 1,
          tasks: [
            {
              id: 2,
              tasks: [
                {
                  id: 3,
                  tasks: [
                    {
                      id: 4,
                      tasks: [{ id: 5, tasks: [] }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }

    it('should return 1 for the task', () => {
      expect(getTaskDepth(taskNoSubTasks)).toBe(1)
    })

    it('should return 2 for the task + 1 level', () => {
      expect(getTaskDepth(task1LevelOfSubtasks)).toBe(2)
    })

    it('should return 3 for the task + 2 level', () => {
      expect(getTaskDepth(task2LevelsOfSubtasks)).toBe(3)
    })

    it('should return 4 for the task + 3 level', () => {
      expect(getTaskDepth(task3LevelsOfSubtasks)).toBe(4)
    })

    it('should return 5 for the task + 4 level', () => {
      expect(getTaskDepth(task4LevelsOfSubtasks)).toBe(5)
    })

    it('should return 6 for the task + 5 level', () => {
      expect(getTaskDepth(task5LevelsOfSubtasks)).toBe(6)
    })
  })

  describe('flatTaskListFromTree', () => {
    const emptyProject = { tasks: [] }
    const populatedProject = {
      tasks: [{ id: 1, tasks: [{ id: 2 }, { id: 3 }] }],
    }
    const minimalProject = { tasks: [{ id: 1, tasks: [] }] }

    it('should return an empty list from and empty project', () => {
      expect(flatTaskListFromTree(emptyProject).length).toBe(0)
    })

    it('should return a list of 1 task from minimal project', () => {
      expect(flatTaskListFromTree(minimalProject).length).toBe(1)
    })

    it('should return a list of 3 Tasks from project', () => {
      let result = flatTaskListFromTree(populatedProject)
      expect(result.length).toBe(3)
      expect(result[0].id).toBe(1)
      expect(result[1].id).toBe(2)
      expect(result[2].id).toBe(3)
    })
  })

  describe('filterOutAtLevelAndBelow', () => {
    const tasks = [
      { id: 1, level: 1 },
      { id: 2, level: 2 },
      { id: 3, level: 3 },
      { id: 4, level: 4 },
    ]

    it('should return a list of 3 Tasks from project if there is a match', () => {
      let result = filterOutAtLevelAndBelow(tasks, 3)
      expect(result.length).toBe(2)
      expect(result[0].level).toBe(1)
      expect(result[1].level).toBe(2)
    })

    it('should return a list of 4 Tasks from project if there is no match', () => {
      let result = filterOutAtLevelAndBelow(tasks, 42)
      expect(result.length).toBe(4)
    })
  })

  describe('filterOutTaskById', () => {
    const tasks = [
      { id: 1, level: 1 },
      { id: 2, level: 2 },
      { id: 3, level: 3 },
      { id: 4, level: 4 },
    ]

    it('should return a list of 3 Tasks from project if there is a match', () => {
      let result = filterOutTaskById(tasks, 3)
      expect(result.length).toBe(3)
      expect(result[0].id).toBe(1)
      expect(result[1].id).toBe(2)
      expect(result[2].id).toBe(4)
    })

    it('should return a list of 4 Tasks from project if there is no match', () => {
      let result = filterOutAtLevelAndBelow(tasks, 42)
      expect(result.length).toBe(4)
    })
  })

  describe('getTaskById', () => {
    const tasks = [
      { id: 1, level: 1 },
      { id: 2, level: 2 },
      { id: 3, level: 3 },
      { id: 4, level: 4 },
    ]

    it('should find task with Id 3', () => {
      let result = getTaskById(tasks, 3)
      expect(result.id).toBe(3)
      expect(result.level).toBe(3)
    })

    it('should not find a task with Id 32', () => {
      let result = getTaskById(tasks, 32)
      expect(result).toBe(undefined)
    })
  })

  describe('getTaskByIdFromTree', () => {
    const taskTree = {
      id: 1,
      level: 1,
      tasks: [
        { id: 3, level: 3, tasks: [] },
        { id: 4, level: 6, tasks: [] },
      ],
    }

    it('should find task with Id 3', () => {
      let result = getTaskByIdFromTree(taskTree, 3)
      expect(result.id).toBe(3)
      expect(result.level).toBe(3)
    })

    it('should not find a task with Id 32', () => {
      let result = getTaskByIdFromTree(taskTree, 32)
      expect(result).toBe(undefined)
    })
  })

  describe('filterOutParentAndChildrenOfTask', () => {
    const taskTree = {
      id: 1,
      level: 1,
      tasks: [
        { id: 3, level: 3, tasks: [] },
        { id: 4, level: 6, tasks: [{ id: 99, tasks: [] }] },
      ],
    }
    const tasklist = [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 42 },
      { id: 99 },
      { id: 1066 },
    ]
    const parentId = 42

    it('should filter out all tasks except tasks id 2 and id 1066', () => {
      let result = filterOutSelfParentAndChildrenOfTask(
        tasklist,
        taskTree,
        parentId
      )
      expect(result.length).toBe(2)
      expect(result[0].id).toBe(2)
      expect(result[1].id).toBe(1066)
    })
  })

  describe('buildValidTargetTaskList', () => {
    const parentId = 64
    const taskId = 42
    const MovingTask = {
      id: 42,
      level: 2,
      tasks: [
        { id: 3, level: 3, tasks: [] },
        { id: 4, level: 4, tasks: [{ id: 99, tasks: [] }] },
      ],
    }
    const ParentTask = { id: 64, level: 1, tasks: [MovingTask] }

    it('should filter out all tasks if only parent and child tasks', () => {
      const tasks = [ParentTask]
      let result = buildValidTargetTaskList(tasks, taskId, parentId)
      expect(result.length).toBe(0)
    })

    it('should return valid peer target', () => {
      const tasksWithPeer = [ParentTask, { id: 888, level: 1, tasks: [] }]
      let result = buildValidTargetTaskList(tasksWithPeer, taskId, parentId)
      expect(result.length).toBe(1)
    })
  })
})
