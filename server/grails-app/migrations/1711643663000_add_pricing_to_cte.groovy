databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1711643663000-1) {
              addColumn(tableName: "cost_time_estimate") {
            column(name: "matter_pricing_id", type: "bigint")
        }
    }
}
