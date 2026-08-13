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

package com.juralio.task.status.exception

class TaskStatusException extends Exception {
    @Override
    public synchronized Throwable fillInStackTrace() {
        return this;
    }
    TaskStatusException(String message) {
        super(message)
    }
}

class HasNotStartedParents extends TaskStatusException {
    HasNotStartedParents() {
        super("Task has not started parents.")
    }
}

class HasDoneParents extends TaskStatusException {
    HasDoneParents() {
        super("Task has done parents.")
    }
}

class ExternalUserCannotSetTaskToNotRequired extends  TaskStatusException {
    ExternalUserCannotSetTaskToNotRequired(){
        super('External users cannot change tasks to not-required')
    }
}

class HasNotDoneChildren extends TaskStatusException {
    HasNotDoneChildren() {
        super("Task has not done children.")
    }
}

class HasActiveAndDoneChildren extends TaskStatusException {
    HasActiveAndDoneChildren() {
        super("Task has done active and done children.")
    }
}

class HasNotStartedParentsAndNotDoneChildren extends TaskStatusException {
    HasNotStartedParentsAndNotDoneChildren() {
        super("Task has not started parents and not done children.")
    }
}

class HasDoneParentsAndDoneChildren extends TaskStatusException {
    HasDoneParentsAndDoneChildren() {
        super("Task has done parents and done children.")
    }
}

class HasNotRequiredParents extends TaskStatusException {
    HasNotRequiredParents() {
        super("Task has not required parents.")
    }
}

class HasNotRequiredChildren extends TaskStatusException {
    HasNotRequiredChildren() {
        super("Task has not required children.")
    }
}

class HasNotRequiredParentsAndChildren extends TaskStatusException {
    HasNotRequiredParentsAndChildren() {
        super("Task has not required parents and children.")
    }
}
