databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1782345600000-1) {
        addColumn(tableName: "cost_assumption") {
            column(name: "status", type: "VARCHAR(20)", defaultValue: "on-target") {
                constraints(nullable: "false")
            }
        }
    }
}
