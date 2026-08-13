databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1646741517000 - 1) {
        createTable(tableName: "link_resource") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "linkResourcePK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "date_created", type: "TIMESTAMP WITHOUT TIME ZONE") {
                constraints(nullable: "false")
            }

            column(name: "last_updated", type: "TIMESTAMP WITHOUT TIME ZONE") {
                constraints(nullable: "false")
            }

            column(name: "name", type: "VARCHAR(30)") {
                constraints(nullable: "false")
            }

            column(name: "url", type: "VARCHAR(30000)") {
                constraints(nullable: "false")
            }

            column(name: "image", type: "VARCHAR(30000)")

            column(name: "matter_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "workstream_id", type: "BIGINT") {
                constraints(nullable: "true")
            }
            column(name: "creator_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: 1646741517000 - 2) {
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "link_resource", constraintName: "FK_link_resource_matter_id", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: 1646741517000 - 3) {
        addForeignKeyConstraint(baseColumnNames: "workstream_id", baseTableName: "link_resource", constraintName: "FK_link_resource_workstream_id", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: 1646741517000 - 4) {
        createTable(tableName: "link_resource_visit") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "linkResourceVisitPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "latest_visit_time", type: "TIMESTAMP WITHOUT TIME ZONE") {
                constraints(nullable: "false")
            }
            column(name: "user_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
            column(name: "link_resource_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
        }
    }
}
