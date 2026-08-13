databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1723125594000-1) {
        addColumn(tableName: "cost_ratio") {
            column(name: "cost_time_estimate_id", type: "bigint", {
                constraints(nullable: "true")
            })
        }
        addColumn(tableName: "cost_ratio") {
            column(name: "project_id", type: "bigint", {
                constraints(nullable: "true")
            })
        }
    }
}
