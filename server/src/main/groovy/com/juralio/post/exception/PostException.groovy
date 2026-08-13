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

package com.juralio.post.exception

class PostException extends Exception {
    @Override
    public synchronized Throwable fillInStackTrace() {
        return this;
    }
    PostException(String message) {
        super(message)
    }
}

class FinalisedPostEditException extends PostException {

    FinalisedPostEditException(String message) {
        super("Finalised posts can only have the privacy updated.")
    }
}

class PostRestoreDestinationException extends PostException {
    PostRestoreDestinationException(String message) {
        super("Destination in not valid for this post.")
    }
}

class PostNotArchivedException extends PostException {
    PostNotArchivedException(String message) {
        super("Post is not archived.")
    }
}

class InvalidLinkUrlException extends PostException {
    InvalidLinkUrlException(String message) {
        super("An invalid link url was specified.")
    }
}

class PostContentTooLongException extends PostException {
    PostContentTooLongException(String message) {
        super("Description field content is too long.")
    }
}

class DuplicateAuthorException extends PostException {
    DuplicateAuthorException(String message) {
        super("The user is already an author on this post.")
    }

    DuplicateAuthorException() {
        super("The user is already an author on this post.")
    }
}

class SoleAuthorDeletionAttemptException extends PostException {
    SoleAuthorDeletionAttemptException() {
        super("The user is the sole author on this post and cannot be deleted.")
    }
}

class DuplicateTeamMemberException extends PostException {
    DuplicateTeamMemberException() {
        super("The user is already member in this post")
    }
}

class SoleTeamMemberException extends PostException {
    SoleTeamMemberException() {
        super("The user is the sole author on this post and cannot be deleted.")
    }
}

class NoValidUserException extends PostException {
    NoValidUserException() {
        super("No user could be found to match the credentials")
    }
}