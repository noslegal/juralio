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

package com.juralio.project.exception

import org.springframework.security.access.AccessDeniedException

class ProjectException extends Exception {
    @Override
    public synchronized Throwable fillInStackTrace() {
        return this;
    }
    ProjectException() {
        super()
    }
    ProjectException(String message) {
        super(message)
    }
}

class ProjectNotCreatedException extends ProjectException {}

class ProjectNotFoundException extends ProjectException {
    ProjectNotFoundException (String message) {
        super(message)
    }
}

class StatusNotCreatedException extends ProjectException {}

class ProjectCreationNotPermittedException extends AccessDeniedException {
    String code

    ProjectCreationNotPermittedException(String code) {
        super('Project creation not permitted')
        this.code = code
    }
}
