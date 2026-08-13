databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: "1779715790000-1") {
        createTable(tableName: "matter_event") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "matter_eventPK")
            }
            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }
            column(name: "event_type", type: "VARCHAR(100)") {
                constraints(nullable: "false")
            }
            column(name: "schema_version", type: "INT") {
                constraints(nullable: "false")
            }
            column(name: "matter_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
            column(name: "performed_by_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
            column(name: "occurred_at", type: "TIMESTAMP WITHOUT TIME ZONE") {
                constraints(nullable: "false")
            }
            column(name: "payload", type: "TEXT") {
                constraints(nullable: "false")
            }
            column(name: "correlation_id", type: "VARCHAR(255)")
        }
    }

    changeSet(author: "juralio (generated)", id: "1779715790000-2") {
        sql('CREATE INDEX idx_matter_event_matter_occurred ON matter_event (matter_id, occurred_at)')
    }

    changeSet(author: "juralio (generated)", id: "1779715790000-3") {
        sql('CREATE INDEX idx_matter_event_event_type ON matter_event (event_type)')
    }

    changeSet(author: "juralio (generated)", id: "1779715790000-4") {
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "matter_event", constraintName: "FK_matter_event_matter_id", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1779715790000-5") {
        addForeignKeyConstraint(baseColumnNames: "performed_by_id", baseTableName: "matter_event", constraintName: "FK_matter_event_performed_by_id", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }
}
