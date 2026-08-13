databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1594894234000 - 1) {
        createTable(tableName: "user_status_event") {
            column(name: "id", type: "int8") {
                constraints(nullable: "false", primaryKey: "true", primaryKeyName: "user_status_event_PK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "user_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "performed_by_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "event_type", type: "varchar(255)") {
                constraints(nullable: "false")
            }

            column(name: "time", type: "TIMESTAMP WITHOUT TIME ZONE") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: 1594894234000 - 2) {
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "user_status_event", constraintName: "FK_user_status_event_user_id", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
        addForeignKeyConstraint(baseColumnNames: "performed_by_id", baseTableName: "user_status_event", constraintName: "FK_user_status_event_performed_by_id", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }
}
