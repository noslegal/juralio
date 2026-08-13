databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: "1603711873000-1") {
        createTable(tableName: "project_visit_recency") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "project_visit_recencyPK")
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

    changeSet(author: "juralio (generated)", id: "1603711873000-2") {
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "project_visit_recency", constraintName: "FK_USER_ID_TO_USER_be4c7abf-1396-4f80-ab04-bce0cb644604", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1603711873000-3") {
        addForeignKeyConstraint(baseColumnNames: "project_id", baseTableName: "project_visit_recency", constraintName: "FK_PROJECT_ID_TO_PROJECT_593eca24-4946-46e4-8788-8a44917d7d86", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project", validate: "true")
    }
}
