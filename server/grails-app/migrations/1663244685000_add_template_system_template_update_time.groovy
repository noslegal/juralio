databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1663244685000-1) {
        addColumn(tableName: "project_template") {
            column(name: "system_template_last_updated", type: "TIMESTAMP WITHOUT TIME ZONE") {
                constraints(nullable: "true")
            }
            column(name: "system_template_update_count", type: "BIGINT", defaultValue:0) {
                constraints(nullable: "false")
            }
        }
    }
}
