databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1661441284000-1) {
        createTable(tableName: "template_provider_source") {
           column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "templateProviderPK")
            }
              column(name: "source_template_id", type: "BIGINT", defaultValue: null){
                constraints(nullable: "true")
            }
              column(name: "new_template_id", type: "BIGINT", defaultValue: null){
                constraints(nullable: "true")
            }
                       column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            addForeignKeyConstraint(baseColumnNames: "source_template_id", baseTableName: "template_provider_source", constraintName: "FK_SOURCE_TEMPLATE_TO_TEMPLATE", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project_template", validate: "true")
            addForeignKeyConstraint(baseColumnNames: "new_template_id", baseTableName: "template_provider_source", constraintName: "FK_NEW_TEMPLATE_TO_TEMPLATE", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project_template", validate: "true")
        }
    }
}
