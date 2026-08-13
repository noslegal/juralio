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

package com.juralio.label

class LabelException extends Exception{
    LabelException(String message){
        super(message)
    }
}

class CannotFindLabelException extends LabelException {
    CannotFindLabelException() {
        super("Cannot find label, please check if the details provided are correct")
    }
}


class InsufficientPermissions extends LabelException {
    InsufficientPermissions(){
        super("You do not have sufficient permissions to perform this action")
    }
}


class CannotAddLabelToTask extends LabelException {
    CannotAddLabelToTask() {
        super("Cannot add label the specified task")
    }
}

class LabelUniquenessException extends LabelException {
    LabelUniquenessException() {
        super("Label is not unique")
    }
}

class LabelLimitException extends LabelException {
    LabelLimitException() {
        super("Label limit has been reached")
    }
}