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

package com.juralio.search


import com.juralio.common.ArrayHelperService
import com.juralio.common.SqlHelperService
import com.juralio.matter.referencenumber.MatterContentReferenceNumberService
import com.juralio.project.Project
import com.juralio.project.ProjectService
import com.juralio.task.Task
import com.juralio.task.TaskService
import com.juralio.task.TaskTreeHelperService
import com.juralio.task.followers.TaskFollowerService
import com.juralio.task.status.TaskStatus
import com.juralio.task.team.TaskTeamMemberService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import org.grails.datastore.mapping.query.api.BuildableCriteria

@Transactional
class TaskSearchService {

    SqlHelperService sqlHelperService
    MatterContentReferenceNumberService matterContentReferenceNumberService
    ProjectService projectService
    TaskService taskService
    TaskTreeHelperService taskTreeHelperService
    TaskFollowerService taskFollowerService
    TaskTeamMemberService taskTeamMemberService
    ArrayHelperService arrayHelperService
    SpringSecurityService springSecurityService

    def performSearch(ProjectContentSearchFilter filterObject) {
        def searchCriteria = Task.createCriteria()

        List<Project> projectsUserCanAccess = projectService.getProjectsByUser()
        projectsUserCanAccess = projectsUserCanAccess.findAll { Project project -> projectService.canAccessPrivateWorkstream(project) }
        List<Task> tasksUserIsTTM = taskTeamMemberService.listTasksByTaskTeamMember(projectsUserCanAccess)
        List<Task> tasksUserIsTF = taskFollowerService.listTasksByTaskFollower(projectsUserCanAccess)

        Set<String> set = new LinkedHashSet<>(tasksUserIsTTM)
        set.addAll(tasksUserIsTF)
        List<String> tasksUserIsTtmOrTf = new ArrayList<>(set)

        boolean shouldPerformGlobalSearch = !filterObject.project && tasksUserIsTtmOrTf.size() > 0
        boolean shouldPerformInProjectSearch = projectsUserCanAccess.contains(filterObject.project)

        if (shouldPerformGlobalSearch || shouldPerformInProjectSearch) {
            def result = searchCriteria.list {
                and {
                    delegate.ne("status", TaskStatus.NOT_REQUIRED.value())

                    setupProjectFilter(delegate, filterObject)


                    setupTaskFilter(delegate, filterObject, tasksUserIsTtmOrTf)


                    if (filterObject.searchPlanned || filterObject.searchActual) {
                        or {
                            setupPlannedDateFilter(delegate, filterObject)
                            setupActualDateFilter(delegate, filterObject)
                        }
                    }

                    if (filterObject.searchTerm) {
                        or {
                            setupTermFilter(delegate, filterObject)
                        }
                    }

                    setupTeamFilter(delegate, filterObject)
                    setupCompletedFilter(delegate, filterObject)
                }
            }
            return result
        }

        return []
    }

    private def setupProjectFilter(BuildableCriteria criteriaBuilder, ProjectContentSearchFilter filterObject) {
        if (filterObject.project) {
            criteriaBuilder.eq("project", filterObject.project)
        }
    }

    private def setupTaskFilter(BuildableCriteria criteriaBuilder, ProjectContentSearchFilter filterObject, List<Task> tasksUserIsTtmOrTf) {
        if (filterObject.taskId) {
            Task task = taskService.getTaskOnly(filterObject.taskId, filterObject.project.id)
            List<Task> taskWithChildren = taskTreeHelperService.getFlatTaskList(task)
            def taskIds = arrayHelperService.extractIdsFromObjects(taskWithChildren)
            criteriaBuilder.in("id", taskIds)
        } else if (!filterObject.project) {
            criteriaBuilder.in("id", tasksUserIsTtmOrTf.id)
        }

    }


    private def setupPlannedDateFilter(BuildableCriteria criteriaBuilder, ProjectContentSearchFilter filterObject) {
        if (filterObject.searchPlanned) {

            criteriaBuilder.and {
                if (filterObject.deadlineStartDatetime) {
                    criteriaBuilder.ge("plannedEndDate",
                            filterObject.deadlineStartDatetime)
                }

                if (filterObject.deadlineEndDatetime) {
                    criteriaBuilder.le("plannedEndDate",
                            filterObject.deadlineEndDatetime)
                }

                if (filterObject.startStartDatetime) {
                    criteriaBuilder.ge("plannedStartDate",
                            filterObject.startStartDatetime)
                }

                if (filterObject.startEndDatetime) {
                    criteriaBuilder.le("plannedStartDate",
                            filterObject.startEndDatetime)
                }
            }

        }
    }

    private def setupActualDateFilter(BuildableCriteria criteriaBuilder, ProjectContentSearchFilter filterObject) {
        if (filterObject.searchActual) {

            criteriaBuilder.and {
                if (filterObject.deadlineStartDatetime) {
                    criteriaBuilder.ge("actualEndDate",
                            filterObject.deadlineStartDatetime)
                }

                if (filterObject.deadlineEndDatetime) {
                    criteriaBuilder.le("actualEndDate",
                            filterObject.deadlineEndDatetime)
                }

                if (filterObject.startStartDatetime) {
                    criteriaBuilder.ge("actualStartDate",
                            filterObject.startStartDatetime)
                }

                if (filterObject.startEndDatetime) {
                    criteriaBuilder.le("actualStartDate",
                            filterObject.startEndDatetime)
                }
            }

        }
    }

    private def setupTermFilter(BuildableCriteria criteriaBuilder, ProjectContentSearchFilter filterObject) {
        String escapedSearchTerm = sqlHelperService.escapeLikeQueryWildcards(filterObject.searchTerm)
        if (matterContentReferenceNumberService.isReferenceNumber(filterObject.searchTerm)) {
            criteriaBuilder.eq("referenceNumber", filterObject.searchTerm.toUpperCase())
        }
        criteriaBuilder.ilike("name", "%$escapedSearchTerm%")
        criteriaBuilder.ilike("description", "%$escapedSearchTerm%")
    }

    private def setupTeamFilter(BuildableCriteria criteriaBuilder, ProjectContentSearchFilter filterObject) {
        if (filterObject.teamSearchType?.equals(ProjectContentSearchFilter.TeamSearchType.NOBODY)) {
            criteriaBuilder.sizeEq("teamMembers", 0)
        }
    }

    private def setupCompletedFilter(BuildableCriteria criteriaBuilder, ProjectContentSearchFilter filterObject) {
        if (filterObject.completed != null) {
            if (filterObject.completed) {
                criteriaBuilder.eq("status", TaskStatus.DONE.value())
            } else {
                criteriaBuilder.ne("status", TaskStatus.DONE.value())
            }
        }
    }
}
