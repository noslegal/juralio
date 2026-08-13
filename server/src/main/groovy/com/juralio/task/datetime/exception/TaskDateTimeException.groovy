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

package com.juralio.task.datetime.exception

class TaskDateTimeException extends Exception {
    @Override
    public synchronized Throwable fillInStackTrace() {
        return this;
    }
    TaskDateTimeException(String message) {
        super(message)
    }
}

class DateConsistencyException extends  TaskDateTimeException {
    DateConsistencyException() {
        super("This change breaks our date logic")
    }
}

class DateTypeStatusConflict extends TaskDateTimeException {
    DateTypeStatusConflict() {
        super("Task status does not allow dates of this type")
    }
}

class DateBoundaryException extends TaskDateTimeException {
    DateBoundaryException() {
        super("Attempted date change will be out of bounds")
    }
}
