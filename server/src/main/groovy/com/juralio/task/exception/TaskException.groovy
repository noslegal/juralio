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

package com.juralio.task.exception

class TaskException extends Exception {
    @Override
    public synchronized Throwable fillInStackTrace() {
        return this;
    }
    TaskException(String message) {
        super(message)
    }
}

class MaximumLevelsExceededException extends TaskException {
    MaximumLevelsExceededException(String message) {
        super("Maximum number of levels has been exceeded.  Cannot create task")
    }
}

class MaximumTasksExceededException extends TaskException {
    MaximumTasksExceededException(String message) {
        super("Maximum project size (300 tasks) reached. You can move tasks to another project or archive unneeded tasks.")
    }
}

class MaximumNumberOfSubTasksExceededException extends TaskException {
    MaximumNumberOfSubTasksExceededException(String message) {
        super("Maximum number of subtasks has been exceeded.  Cannot create or move specified task to this destination.")
    }
}

class MaximumNumberOfLevelATasksExceededException extends TaskException {
    MaximumNumberOfLevelATasksExceededException(String message) {
        super("Maximum number of Level A tasks has been exceeded.  Cannot create or move specified task to this destination.")
    }
}

class TaskNotFoundException extends TaskException {
    TaskNotFoundException(String message) {
        super(message)
    }
}

class InvalidDestinationParent extends TaskException {
    InvalidDestinationParent(String message) {
        super(message)
    }
}

class TaskAlreadyHasUserAsFollowerException extends TaskException {
    TaskAlreadyHasUserAsFollowerException(String message) {
        super("The Task already has the user as a Follower.")
    }
}

class TaskAlreadyHasUserAsTeamMemberException extends TaskException {
    TaskAlreadyHasUserAsTeamMemberException(String message) {
        super("The Task already has the user as a Team Member.")
    }
}

class TaskUserCannotBeBothFollowerAndTeamMemberException extends TaskException {
    TaskUserCannotBeBothFollowerAndTeamMemberException(String message) {
        super("The Task cannot have a user as a Follower and a Team Member.")
    }
}

class TaskCannotBeUnarchivedException extends TaskException {
    TaskCannotBeUnarchivedException(String message) {
        super("The task cannot be restored because " + message)
    }
}

class LinkedTaskWouldEndAfterParentException extends TaskException {
    LinkedTaskWouldEndAfterParentException(String message) {
        super(message)
    }
}

class LinkedTaskWouldStartBeforeParentException extends TaskException {
    LinkedTaskWouldStartBeforeParentException(String message) {
        super(message)
    }
}

class LinkedTaskWouldStartAfterItFinished extends TaskException {
    LinkedTaskWouldStartAfterItFinished(String message) {
        super(message)
    }
}

class LinkedTaskWouldEndBeforeItStarted extends TaskException {
    LinkedTaskWouldEndBeforeItStarted(String message) {
        super(message)
    }
}