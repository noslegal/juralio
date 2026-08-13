databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: "1613385124000-1") {
        addColumn(tableName: "post") {
            column(name: "task_when_archived_id", type: "BIGINT", defaultValue: null)
        }
        addColumn(tableName: "post") {
            column(name: "matter_when_archived_id", type: "bigint", {
                constraints(nullable: "true", defaultValue: null)
            })
        }
        addColumn(tableName: "post") {
            column(name: "project_when_archived_id", type: "bigint", {
                constraints(nullable: "true", defaultValue: null)
            })
        }
        addColumn(tableName: "post") {
            column(name: "archived_by_id", type: "bigint", {
                constraints(nullable: "true", defaultValue: null)
            })
        }
        addColumn(tableName: "post") {
            column(name: "archived_date", type: "timestamp", {
                constraints(nullable: "true", defaultValue: null)
            })
        }
    }
    changeSet(author: "juralio (generated)", id: "1613385124000-2") {
        addForeignKeyConstraint(baseColumnNames: "matter_when_archived_id", baseTableName: "post", constraintName: "FK_ARCHIVE_MATTER_ID_OF_POST", deferrable: "true", initiallyDeferred: "true", referencedColumnNames: "id", referencedTableName: "matter", validate: "true")
    }
    changeSet(author: "juralio (generated)", id: "1613385124000-3") {
        addForeignKeyConstraint(baseColumnNames: "project_when_archived_id", baseTableName: "post", constraintName: "FK_ARCHIVE_PROJECT_ID_OF_POST", deferrable: "true", initiallyDeferred: "true", referencedColumnNames: "id", referencedTableName: "project", validate: "true")
    }
    changeSet(author: "juralio (generated)", id: "1613385124000-4") {
        addForeignKeyConstraint(baseColumnNames: "task_when_archived_id", baseTableName: "post", constraintName: "FK_ARCHIVE_TASK_ID_OF_POST", deferrable: "true", initiallyDeferred: "true", referencedColumnNames: "id", referencedTableName: "task", validate: "true")
    }
    changeSet(author: "juralio (generated)", id: "1613385124000-5") {
        addForeignKeyConstraint(baseColumnNames: "archived_by_id", baseTableName: "post", constraintName: "FK_ARCHIVE_USER_ID_TO_POST", deferrable: "true", initiallyDeferred: "true", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }
}
