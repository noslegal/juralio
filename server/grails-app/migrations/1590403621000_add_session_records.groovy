databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1590403621000 - 1) {
        createTable(tableName: "user_session_event") {
            column(name: "id", type: "int8") {
                constraints(nullable: "false", primaryKey: "true", primaryKeyName: "user_session_event_PK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "user_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "event_type", type: "varchar(255)") {
                constraints(nullable: "false")
            }

            column(name: "time", type: "TIMESTAMP WITHOUT TIME ZONE") {
                constraints(nullable: "false")
            }

            column(name: "request_issuer_ip_address", type: "varchar(255)")
        }
    }

    changeSet(author: "juralio (generated)", id: "1590403621000-1") {
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "user_session_event", constraintName: "FK_user_session_event_user_id", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }
}
