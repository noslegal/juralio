databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1655994741000 - 1) {
        createTable(tableName: "template_resource") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "templateResourcePK")
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

            column(name: "template_id", type: "BIGINT") {
                constraints(nullable: "false")
            }


        }
    }

    changeSet(author: "juralio (generated)", id: 1655994741000 - 2) {
        addForeignKeyConstraint(baseColumnNames: "template_id", baseTableName: "template_resource", constraintName: "FK_template_resource_template_id", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project_template", validate: "true")
    }


}
