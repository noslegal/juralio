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

package com.juralio.common

enum APIErrorCodes {
    SIZE_TOO_SHORT("001"),
    SIZE_TOO_LONG("002"),
    BLANK_NOT_ALLOWED("010"),
    FIELD_MISSING("011"),
    OUT_OF_RANGE("020"),
    FORMAT_MISMATCH("030"),
    INVALID_VALUE("031"),
    INVALID_USERNAME("032"),
    OBJECT_ALREADY_EXISTS("040"),

    OLD_PASSWORD_INCORRECT("101"),
    NEW_PASSWORDS_DO_NOT_MATCH("102"),
    PASSWORD_COMPLEXITY_NOT_MET("103"),
    NEW_PASSWORD_MATCHES_OLD_PASSWORD("104"),
    USER_ALREADY_HAS_ORGANISATION("105"),
    USER_LOCKED("106"),

    DUPLICATE_PROJECT_NAME("250"),
    DUPLICATE_COLUMN_NAME("251"),
    DUPLICATE_TASK_NAME("252"),
    TASK_LEVEL_TOO_DEEP("253"),
    TASK_DESTINATION_INVALID("254"),
    TASK_IS_DESCENDANT("255"),
    DUPLICATE_DOCUMENT("256"),
    INVALID_DOCUMENT("257"),
    INVALID_MEETING("258"),
    PROJECT_CREATION_NOT_PERMITTED('259'),

    INVALID_USER("260"),

    SUBTASKS_FULL("261"),

    TEMPLATE_DUPLICATE_TASK_NAME("352"),

    HAS_NOT_STARTED_PARENTS("310"),
    HAS_NOT_DONE_CHILDREN("311"),
    HAS_DONE_PARENTS("312"),
    HAS_ACTIVE_AND_DONE_CHILDREN("313"),
    HAS_NOT_STARTED_PARENTS_AND_NOT_DONE_CHILDREN("314"),
    HAS_DONE_PARENTS_AND_DONE_CHILDREN("315"),
    HAS_NOT_REQUIRED_PARENTS("316"),
    HAS_NOT_REQUIRED_PARENTS_AND_CHILDREN("317"),
    HAS_NOT_REQUIRED_CHILDREN("318"),

    HAS_PARENT_IN_PROGRESS_ASD_LATER_THAN_CHILD_DONE_AED("319"),
    DATE_CONSISTENCY_EXCEPTION("320"),
    INCONSISTENT_PLANNED_DATES_REMOVED("321"),
    //HAS_CHILDREN_WITH_AED_AFTER_PARENTS_AED("320"),
    //HAS_PARENTS_WITH_AED_BEFORE_CHILDRENS_AED("321"),
    //HAS_CHILDREN_WITH_PED_AFTER_PARENTS_PED("322"),
    //HAS_PARENTS_WITH_PED_BEFORE_CHILD_PED("323"),
    //HAS_CHILDREN_WITH_ASD_AFTER_PARENTS_ASD("324"),
    //HAS_PARENTS_WITH_ASD_AFTER_CHILD_ASD("325"),
    //HAS_CHILDREN_WITH_PSD_BEFORE_PARENTS_PSD("326"),
    //HAS_PARENTS_WITH_PSD_AFTER_CHILD_PSD("327"),
    //HAS_PARENT_WITH_NO_START_DATES("332"),
    //HAS_PARENT_WITH_NO_END_DATES("333"),
    EXTERNAL_USER_CANNOT_SET_TASK_TO_NOT_REQUIRED('334'),
    TASK_BLOCKED_BY_IN_PROGRESS('335'),

    POST_CONTENT_TOO_LONG("350"),
    CUSTOM_MESSAGE_TOO_LONG('351'),


    FAILED_SSO_AUTHENTICATION("370"),
    NO_MATCHING_JURALIO_USER("371"),
    EXTERNAL_USER_NO_FORCE_ROLE_CHANGE("372"),
    USERNAME_ALREADY_IN_USE("373"),
    PASSWORD_DOES_NOT_MATCH("374"),
    MAGIC_LINK_EXPIRED("375"),
    MAGIC_LINK_ALREADY_USED("376"),
    BAD_MAGIC_LINK("377"),
    ACTIVATE_LAPSED_USER("378"),
    NO_PERSONAL_MATTER('388')


    private final String code

    APIErrorCodes(String code) {
        this.code = code
    }

    String code() {
        return code
    }

    String toString() {
        return code
    }

    boolean equals(String code) {
        this.code == code
    }
}
