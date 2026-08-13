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

package com.juralio.task.status


import grails.testing.gorm.DataTest
import grails.testing.services.ServiceUnitTest
import spock.lang.Specification

class TaskStatusServiceSpec extends Specification implements ServiceUnitTest<TaskStatusService>, DataTest {

//    void "maintainStatusConsistency - has not started parents"() {
//        Project project = new Project(name: 'test')
//        Task mockTask = new Task(name: 'test',
//                status: TaskStatus.NOT_STARTED.value(), project: project)
//
//        setup:
//        mockDomain(Task)
//        project.save(failOnError: true, flush: true)
//        mockTask.save(failOnError: true, flush: true)
//        service.taskStatusHelperService = Mock(TaskStatusHelperService)
//
//        when: "method is called"
//        mockTask.previousStatus = TaskStatus.NOT_STARTED.value()
//        mockTask.status = TaskStatus.IN_PROGRESS.value()
//        service.maintainStatusConsistency(mockTask, false)
//
//        then: "should call getParentInStatus on taskStatusHelperService"
//        1 * service.taskStatusHelperService.getParentsInStatus(mockTask, TaskStatus.NOT_STARTED.value()) >> [new Task()]
//
//        then: "should call discard on task"
//        Task.get(mockTask.id).status == TaskStatus.NOT_STARTED.value()
//        !Task.get(mockTask.id).previousStatus
//
//        then: "it should throw HasNotStartedParent exception"
//        thrown(HasNotStartedParents)
//    }

    //TODO: reinstante rest of test
//    void "maintainStatusConsistency - has not done children"() {
//
//        TaskStatus mockNotStarted = Mock(TaskStatus) { getName() >> 'Not Started' }
//        TaskStatus mockActive = Mock(TaskStatus) { getName() >> 'Active' }
//
//        Task mockTask = Mock(Task) {
//            getPreviousStatus() >> Mock(TaskStatus) { getName() >> 'Active' }
//            getStatus() >> Mock(TaskStatus) { getName() >> 'Done' }
//            getProject() >> Mock(Project) { getStatuses() >> [mockNotStarted, mockActive] }
//        }
//
//        setup:
//        service.taskStatusHelperService = Mock(TaskStatusHelperService)
//
//        when: "method is called"
//        service.maintainStatusConsistency(mockTask, false)
//
//        then: "should call getChildrenInStatuses on taskStatusHelperService"
//        1 * service.taskStatusHelperService.getChildrenInStatuses(mockTask, [mockNotStarted, mockActive]) >> [Mock(Task)]
//
//        then: "should call discard on task"
//        1 * mockTask.discard()
//
//        then: "it should throw HasNotDoneChildren exception"
//        thrown(HasNotDoneChildren)
//    }
//
//    void "maintainStatusConsistency - has done parents"() {
//        Task mockTask = Mock(Task) {
//            getPreviousStatus() >> Mock(TaskStatus) { getName() >> 'Done' }
//            getStatus() >> Mock(TaskStatus) { getName() >> 'Active' }
//        }
//
//        setup:
//        service.taskStatusHelperService = Mock(TaskStatusHelperService)
//
//        when: "method is called"
//        service.maintainStatusConsistency(mockTask, false)
//
//        then: "should call getParentInStatus on taskStatusHelperService"
//        1 * service.taskStatusHelperService.getParentsInStatus(mockTask, mockTask.previousStatus) >> [Mock(Task)]
//
//        then: "should call discard on task"
//        1 * mockTask.discard()
//
//        then: "it should throw HasNotStartedParent exception"
//        thrown(HasDoneParents)
//    }
//
//    void "maintainStatusConsistency - has active and done children"() {
//        TaskStatus mockDone = Mock(TaskStatus) { getName() >> 'Done' }
//        TaskStatus mockActive = Mock(TaskStatus) { getName() >> 'Active' }
//
//        Task mockTask = Mock(Task) {
//            getPreviousStatus() >> Mock(TaskStatus) { getName() >> 'Active' }
//            getStatus() >> Mock(TaskStatus) { getName() >> 'Not Started' }
//            getProject() >> Mock(Project) { getStatuses() >> [mockDone, mockActive] }
//        }
//
//        setup:
//        service.taskStatusHelperService = Mock(TaskStatusHelperService)
//
//        when: "method is called"
//        service.maintainStatusConsistency(mockTask, false)
//
//        then: "should call getChildrenInStatuses on taskStatusHelperService"
//        1 * service.taskStatusHelperService.getChildrenInStatuses(mockTask, [mockActive, mockDone]) >> [Mock(Task)]
//
//        then: "should call discard on task"
//        1 * mockTask.discard()
//
//        then: "it should throw HasNotDoneChildren exception"
//        thrown(HasActiveAndDoneChildren)
//    }
//
//    void "maintainStatusConsistency - has not started parents and not done children"() {
//        TaskStatus mockNotStarted = Mock(TaskStatus) { getName() >> 'Not Started' }
//        TaskStatus mockActive = Mock(TaskStatus) { getName() >> 'Active' }
//
//        Task mockTask = Mock(Task) {
//            getPreviousStatus() >> Mock(TaskStatus) { getName() >> 'Not Started' }
//            getStatus() >> Mock(TaskStatus) { getName() >> 'Done' }
//            getProject() >> Mock(Project) { getStatuses() >> [mockNotStarted, mockActive] }
//        }
//
//        setup:
//        service.taskStatusHelperService = Mock(TaskStatusHelperService)
//
//        when: "method is called"
//        service.maintainStatusConsistency(mockTask, false)
//
//        then: "should call getParentInStatus on taskStatusHelperService"
//        1 * service.taskStatusHelperService.getParentsInStatus(mockTask, mockTask.previousStatus) >> [Mock(Task)]
//
//        then: "should call getChildrenInStatuses on taskStatusHelperService"
//        1 * service.taskStatusHelperService.getChildrenInStatuses(mockTask, [mockNotStarted, mockActive]) >> [Mock(Task)]
//
//        then: "should call discard on task"
//        1 * mockTask.discard()
//
//        then: "it should throw HasNotStartedParentsAndNotDoneChildren exception"
//        thrown(HasNotStartedParentsAndNotDoneChildren)
//
//    }
//
//    void "maintainStatusConsistency - has done parents and done children"() {
//        TaskStatus mockDone = Mock(TaskStatus) { getName() >> 'Done' }
//        TaskStatus mockNotStarted = Mock(TaskStatus) { getName() >> 'Not Started' }
//
//        Task mockTask = Mock(Task) {
//            getPreviousStatus() >> Mock(TaskStatus) { getName() >> 'Done' }
//            getStatus() >> Mock(TaskStatus) { getName() >> 'Not Started' }
//            getProject() >> Mock(Project) { getStatuses() >> [mockNotStarted, mockDone] }
//        }
//
//        setup:
//        service.taskStatusHelperService = Mock(TaskStatusHelperService)
//
//        when: "method is called"
//        service.maintainStatusConsistency(mockTask, false)
//
//        then: "should call getParentInStatus on taskStatusHelperService"
//        1 * service.taskStatusHelperService.getParentsInStatus(mockTask, mockTask.previousStatus) >> [Mock(Task)]
//
//        then: "should call getChildrenInStatuses on taskStatusHelperService"
//        1 * service.taskStatusHelperService.getChildrenInStatuses(mockTask, [mockDone]) >> [Mock(Task)]
//
//        then: "should call discard on task"
//        1 * mockTask.discard()
//
//        then: "it should throw HasNotStartedParentsAndNotDoneChildren exception"
//        thrown(HasDoneParentsAndDoneChildren)
//    }
}