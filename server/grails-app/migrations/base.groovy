databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: "1573654131425-1") {
        createSequence(incrementBy: "1", sequenceName: "hibernate_sequence", startValue: "1")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-2") {
        createTable(tableName: "acl_class") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "acl_classPK")
            }

            column(name: "class", type: "VARCHAR(255)") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-3") {
        createTable(tableName: "acl_entry") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "acl_entryPK")
            }

            column(name: "sid", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "audit_failure", type: "BOOLEAN") {
                constraints(nullable: "false")
            }

            column(name: "granting", type: "BOOLEAN") {
                constraints(nullable: "false")
            }

            column(name: "acl_object_identity", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "audit_success", type: "BOOLEAN") {
                constraints(nullable: "false")
            }

            column(name: "ace_order", type: "INT") {
                constraints(nullable: "false")
            }

            column(name: "mask", type: "INT") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-4") {
        createTable(tableName: "acl_object_identity") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "acl_object_identityPK")
            }

            column(name: "object_id_identity", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "entries_inheriting", type: "BOOLEAN") {
                constraints(nullable: "false")
            }

            column(name: "object_id_class", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "owner_sid", type: "BIGINT")

            column(name: "parent_object", type: "BIGINT")
        }
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-5") {
        createTable(tableName: "acl_sid") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "acl_sidPK")
            }

            column(name: "sid", type: "VARCHAR(255)") {
                constraints(nullable: "false")
            }

            column(name: "principal", type: "BOOLEAN") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-6") {
        createTable(tableName: "app_user") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "app_userPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "failed_login_attempts", type: "INT") {
                constraints(nullable: "false")
            }

            column(name: "password_expired", type: "BOOLEAN") {
                constraints(nullable: "false")
            }

            column(name: "first_time_user_experience_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "mfa_registered", type: "BOOLEAN") {
                constraints(nullable: "false")
            }

            column(name: "organisation_id", type: "BIGINT")

            column(name: "account_expired", type: "BOOLEAN") {
                constraints(nullable: "false")
            }

            column(name: "firstname", type: "VARCHAR(255)") {
                constraints(nullable: "false")
            }

            column(name: "account_locked_time", type: "timestamp")

            column(name: "username", type: "VARCHAR(255)") {
                constraints(nullable: "false")
            }

            column(name: "account_locked", type: "BOOLEAN") {
                constraints(nullable: "false")
            }

            column(name: "mfa_key", type: "VARCHAR(255)")

            column(name: "mfa_enabled", type: "BOOLEAN") {
                constraints(nullable: "false")
            }

            column(name: "password", type: "VARCHAR(255)") {
                constraints(nullable: "false")
            }

            column(name: "lastname", type: "VARCHAR(255)") {
                constraints(nullable: "false")
            }

            column(name: "enabled", type: "BOOLEAN") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-7") {
        createTable(tableName: "first_time_user_experience") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "first_time_user_experiencePK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "has_seen_timeline", type: "BOOLEAN") {
                constraints(nullable: "false")
            }

            column(name: "has_seen_inbox", type: "BOOLEAN") {
                constraints(nullable: "false")
            }

            column(name: "has_seen_taskmap", type: "BOOLEAN") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-8") {
        createTable(tableName: "inbox_notification") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "inbox_notificationPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "target_user_id", type: "BIGINT")

            column(name: "recorded", type: "timestamp") {
                constraints(nullable: "false")
            }

            column(name: "type", type: "VARCHAR(255)") {
                constraints(nullable: "false")
            }

            column(name: "matter_id", type: "BIGINT")

            column(name: "performed_by_id", type: "BIGINT")

            column(name: "project_id", type: "BIGINT")

            column(name: "event", type: "VARCHAR(30000)") {
                constraints(nullable: "false")
            }

            column(name: "task_id", type: "BIGINT")

            column(name: "project_scope", type: "BOOLEAN") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-9") {
        createTable(tableName: "matter") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "matterPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "organisation_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "matter_status", type: "VARCHAR(255)") {
                constraints(nullable: "false")
            }

            column(name: "case_id", type: "VARCHAR(255)")

            column(name: "name", type: "VARCHAR(255)") {
                constraints(nullable: "false")
            }

            column(name: "client_name", type: "VARCHAR(255)") {
                constraints(nullable: "false")
            }

            column(name: "creation_date", type: "timestamp") {
                constraints(nullable: "false")
            }

            column(name: "creator_id", type: "BIGINT")

            column(name: "deleted_mirror_id", type: "BIGINT")
        }
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-10") {
        createTable(tableName: "matter_admin") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "matter_adminPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "user_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "matter_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-11") {
        createTable(tableName: "matter_recency") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "matter_recencyPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "last_visit", type: "timestamp") {
                constraints(nullable: "false")
            }

            column(name: "user_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "matter_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-12") {
        createTable(tableName: "matter_team_member") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "matter_team_memberPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "user_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "matter_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-13") {
        createTable(tableName: "note") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "notePK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "date_created", type: "timestamp") {
                constraints(nullable: "false")
            }

            column(name: "private_note", type: "BOOLEAN") {
                constraints(nullable: "false")
            }

            column(name: "privacy_owner_id", type: "BIGINT")

            column(name: "last_updated", type: "timestamp") {
                constraints(nullable: "false")
            }

            column(name: "url", type: "VARCHAR(30000)")

            column(name: "name", type: "VARCHAR(50)") {
                constraints(nullable: "false")
            }

            column(name: "reference_number", type: "VARCHAR(255)")

            column(name: "type", type: "VARCHAR(50)")

            column(name: "finalised", type: "BOOLEAN") {
                constraints(nullable: "false")
            }

            column(name: "creator_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "description", type: "VARCHAR(30000)")
        }
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-14") {
        createTable(tableName: "organisation") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "organisationPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "name", type: "VARCHAR(50)") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-15") {
        createTable(tableName: "project") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "projectPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "active", type: "BOOLEAN") {
                constraints(nullable: "false")
            }

            column(name: "matter_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "name", type: "VARCHAR(30)") {
                constraints(nullable: "false")
            }

            column(name: "reference_number", type: "VARCHAR(255)")

            column(name: "creation_date", type: "timestamp") {
                constraints(nullable: "false")
            }

            column(name: "deleted_mirror_id", type: "BIGINT")
        }
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-16") {
        createTable(tableName: "project_recency") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "project_recencyPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "last_visit", type: "timestamp") {
                constraints(nullable: "false")
            }

            column(name: "user_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "project_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-17") {
        createTable(tableName: "project_template") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "project_templatePK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "date_created", type: "timestamp") {
                constraints(nullable: "false")
            }

            column(name: "last_updated", type: "timestamp") {
                constraints(nullable: "false")
            }

            column(name: "organisation_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "archived", type: "BOOLEAN") {
                constraints(nullable: "false")
            }

            column(name: "noticeboard_text", type: "CLOB")

            column(name: "name", type: "VARCHAR(50)") {
                constraints(nullable: "false")
            }

            column(name: "reference_number", type: "VARCHAR(255)")
        }
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-18") {
        createTable(tableName: "role") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "rolePK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "authority", type: "VARCHAR(255)") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-19") {
        createTable(tableName: "task") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "taskPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "level", type: "SMALLINT") {
                constraints(nullable: "false")
            }

            column(name: "is_parked", type: "BOOLEAN")

            column(name: "previous_status", type: "VARCHAR(255)")

            column(name: "actual_start_date", type: "timestamp")

            column(name: "actual_end_date", type: "timestamp")

            column(name: "planned_start_date", type: "timestamp")

            column(name: "name", type: "VARCHAR(50)") {
                constraints(nullable: "false")
            }

            column(name: "archived_by_id", type: "BIGINT")

            column(name: "reference_number", type: "VARCHAR(255)")

            column(name: "planned_end_date", type: "timestamp")

            column(name: "status", type: "VARCHAR(255)") {
                constraints(nullable: "false")
            }

            column(name: "archived_date", type: "timestamp")

            column(name: "description", type: "VARCHAR(500)")

            column(name: "project_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "tasks_idx", type: "INT")
        }
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-20") {
        createTable(tableName: "task_note") {
            column(name: "task_notes_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "note_id", type: "BIGINT")
        }
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-21") {
        createTable(tableName: "task_recency") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "task_recencyPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "last_visit", type: "timestamp") {
                constraints(nullable: "false")
            }

            column(name: "user_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "task_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-22") {
        createTable(tableName: "task_task") {
            column(name: "task_tasks_id", type: "BIGINT")

            column(name: "task_id", type: "BIGINT")

            column(name: "tasks_idx", type: "INT")
        }
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-23") {
        createTable(tableName: "task_template") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "task_templatePK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "level", type: "SMALLINT") {
                constraints(nullable: "false")
            }

            column(name: "noticeboard_text", type: "CLOB")

            column(name: "name", type: "VARCHAR(50)") {
                constraints(nullable: "false")
            }

            column(name: "reference_number", type: "VARCHAR(255)")

            column(name: "project_template_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "tasks_idx", type: "INT")
        }
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-24") {
        createTable(tableName: "task_template_task_template") {
            column(name: "task_template_tasks_id", type: "BIGINT")

            column(name: "task_template_id", type: "BIGINT")

            column(name: "tasks_idx", type: "INT")
        }
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-25") {
        createTable(tableName: "user_auth_token") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "user_auth_tokenPK")
            }

            column(name: "date_created", type: "timestamp") {
                constraints(nullable: "false")
            }

            column(name: "token_value", type: "VARCHAR(255)") {
                constraints(nullable: "false")
            }

            column(name: "username", type: "VARCHAR(255)") {
                constraints(nullable: "false")
            }

            column(name: "last_updated", type: "timestamp") {
                constraints(nullable: "false")
            }

            column(name: "access_count", type: "FLOAT8") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-26") {
        createTable(tableName: "user_role") {
            column(name: "user_id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "user_rolePK")
            }

            column(name: "role_id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "user_rolePK")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-27") {
        addUniqueConstraint(columnNames: "class", constraintName: "UC_ACL_CLASSCLASS_COL", tableName: "acl_class")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-28") {
        addUniqueConstraint(columnNames: "username", constraintName: "UC_APP_USERUSERNAME_COL", tableName: "app_user")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-29") {
        addUniqueConstraint(columnNames: "authority", constraintName: "UC_ROLEAUTHORITY_COL", tableName: "role")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-30") {
        addUniqueConstraint(columnNames: "sid, principal", constraintName: "UK1781b9a084dff171b580608b3640", tableName: "acl_sid")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-31") {
        addUniqueConstraint(columnNames: "object_id_class, object_id_identity", constraintName: "UK56103a82abb455394f8c97a95587", tableName: "acl_object_identity")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-32") {
        addUniqueConstraint(columnNames: "matter_id, name", constraintName: "UK5eef4272c182ad23e4c5eef70bc4", tableName: "project")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-33") {
        addUniqueConstraint(columnNames: "acl_object_identity, ace_order", constraintName: "UKce200ed06800e5a163c6ab6c0c85", tableName: "acl_entry")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-34") {
        addUniqueConstraint(columnNames: "task_id, user_id", constraintName: "UKd38c0766f84b2627a0ff888a772d", tableName: "task_recency")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-35") {
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "matter_recency", constraintName: "FK1802kqe7wwlh7fy7rxmhe5f7b", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-36") {
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "matter_admin", constraintName: "FK2fahw9htmgayuyijss1wlb1es", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-37") {
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "matter_team_member", constraintName: "FK2ywa6bf9y262giwsxedfv5vfo", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-38") {
        addForeignKeyConstraint(baseColumnNames: "creator_id", baseTableName: "note", constraintName: "FK3wwpng6bpbbfrkt580m5s51jd", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-39") {
        addForeignKeyConstraint(baseColumnNames: "parent_object", baseTableName: "acl_object_identity", constraintName: "FK4soxn7uid8qxltqps8kewftx7", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "acl_object_identity", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-40") {
        addForeignKeyConstraint(baseColumnNames: "archived_by_id", baseTableName: "task", constraintName: "FK4yrax92n1jfvcwpqgpoducvp2", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-41") {
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "project_recency", constraintName: "FK56joeq8lt9l5c90u70cxffg07", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-42") {
        addForeignKeyConstraint(baseColumnNames: "organisation_id", baseTableName: "matter", constraintName: "FK67x3ph7t8mcsh317p5022xw44", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "organisation", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-43") {
        addForeignKeyConstraint(baseColumnNames: "deleted_mirror_id", baseTableName: "matter", constraintName: "FK6su8yoqkoirduuwbugctkuo9i", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-44") {
        addForeignKeyConstraint(baseColumnNames: "first_time_user_experience_id", baseTableName: "app_user", constraintName: "FK6y64ucyvwqtfbu6k0lgr03y3s", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "first_time_user_experience", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-45") {
        addForeignKeyConstraint(baseColumnNames: "note_id", baseTableName: "task_note", constraintName: "FK9f2ailr9u0w823uad2ynuevj0", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "note", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-46") {
        addForeignKeyConstraint(baseColumnNames: "sid", baseTableName: "acl_entry", constraintName: "FK9r4mj8ewa904g3wivff0tb5b0", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "acl_sid", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-47") {
        addForeignKeyConstraint(baseColumnNames: "role_id", baseTableName: "user_role", constraintName: "FKa68196081fvovjhkek5m97n3y", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "role", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-48") {
        addForeignKeyConstraint(baseColumnNames: "target_user_id", baseTableName: "inbox_notification", constraintName: "FKaebe1t5ws8br1ysfbr240nwk4", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-49") {
        addForeignKeyConstraint(baseColumnNames: "project_template_id", baseTableName: "task_template", constraintName: "FKamgml42woua2aw64t1n549su", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project_template", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-50") {
        addForeignKeyConstraint(baseColumnNames: "object_id_class", baseTableName: "acl_object_identity", constraintName: "FKc06nv93ck19el45a3g1p0e58w", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "acl_class", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-51") {
        addForeignKeyConstraint(baseColumnNames: "project_id", baseTableName: "inbox_notification", constraintName: "FKcf5skqh21lkd36bj7puxfiqax", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-52") {
        addForeignKeyConstraint(baseColumnNames: "privacy_owner_id", baseTableName: "note", constraintName: "FKd145s02e1t2gvmn00jc0jhetb", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-53") {
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "task_recency", constraintName: "FKd9m2s6bpafpfqde8pp41apwxk", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-54") {
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "inbox_notification", constraintName: "FKd9pr66yyfkqvjxarx9r817ihd", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-55") {
        addForeignKeyConstraint(baseColumnNames: "creator_id", baseTableName: "matter", constraintName: "FKdq616p5kncfw67ltoisnu3xqg", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-56") {
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "matter_admin", constraintName: "FKfrqj79bhg9gxniwku55m1fup6", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-57") {
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "user_role", constraintName: "FKg7fr1r7o0fkk41nfhnjdyqn7b", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-58") {
        addForeignKeyConstraint(baseColumnNames: "task_id", baseTableName: "task_task", constraintName: "FKhx03pg4qy2hjddt7v2ub77pki", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-59") {
        addForeignKeyConstraint(baseColumnNames: "owner_sid", baseTableName: "acl_object_identity", constraintName: "FKikrbtok3aqlrp9wbq6slh9mcw", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "acl_sid", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-60") {
        addForeignKeyConstraint(baseColumnNames: "deleted_mirror_id", baseTableName: "project", constraintName: "FKjk5cup7d9rd2kap5j6w9odb4p", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-61") {
        addForeignKeyConstraint(baseColumnNames: "project_id", baseTableName: "task", constraintName: "FKk8qrwowg31kx7hp93sru1pdqa", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-62") {
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "matter_team_member", constraintName: "FKl0ejhfiyb3lyarwd3a2egp4uk", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-63") {
        addForeignKeyConstraint(baseColumnNames: "task_notes_id", baseTableName: "task_note", constraintName: "FKl0qggrhj7xbsl6jtdmr07ssw4", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-64") {
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "matter_recency", constraintName: "FKl0ywofdb90gv6ns88uqs5k621", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-65") {
        addForeignKeyConstraint(baseColumnNames: "acl_object_identity", baseTableName: "acl_entry", constraintName: "FKl39t1oqikardwghegxe0wdcpt", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "acl_object_identity", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-66") {
        addForeignKeyConstraint(baseColumnNames: "task_template_id", baseTableName: "task_template_task_template", constraintName: "FKm0n7to7m0wlwwqynf0qxr745p", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task_template", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-67") {
        addForeignKeyConstraint(baseColumnNames: "organisation_id", baseTableName: "project_template", constraintName: "FKmmmm4o9p64n2y5ij711bj5od2", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "organisation", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-68") {
        addForeignKeyConstraint(baseColumnNames: "performed_by_id", baseTableName: "inbox_notification", constraintName: "FKp8us9m6n0da6598rsq8btooux", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-69") {
        addForeignKeyConstraint(baseColumnNames: "task_id", baseTableName: "task_recency", constraintName: "FKptlivdud8vcsl3y2uvka3egbx", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-70") {
        addForeignKeyConstraint(baseColumnNames: "project_id", baseTableName: "project_recency", constraintName: "FKq7vgq6l8xd7p83dg6o7guf8q5", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-71") {
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "project", constraintName: "FKqb37804yyfsq7hv0739txup92", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-72") {
        addForeignKeyConstraint(baseColumnNames: "task_id", baseTableName: "inbox_notification", constraintName: "FKsf8vlwa965ycvlkj9cvwkm0qs", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1573654131425-73") {
        addForeignKeyConstraint(baseColumnNames: "organisation_id", baseTableName: "app_user", constraintName: "FKsoo5wi186endhly28ofp3f1vg", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "organisation", validate: "true")
    }
}
