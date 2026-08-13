databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: "1615198820000-1") {
        addColumn(tableName: "project_template") {
            column(name: "published", type: "boolean", defaultValue: "true") {
                constraints(nullable: "true")
            }
        }
    }
}
