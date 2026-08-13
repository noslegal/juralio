databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1615375794000 - 1) {
        addColumn(tableName: "post") {
            column(name: "finalised_by_id", type: "bigint", {
                constraints(nullable: "true", defaultValue: null)
            })
        }
    }
}
