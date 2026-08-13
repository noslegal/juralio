databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1608633980000 - 1) {
        addColumn(tableName: "project") {
            column(name: "closed_date", type: "TIMESTAMP WITHOUT TIME ZONE", {
                constraints(nullable: "true")
            })
        }
        addColumn(tableName: "project") {
            column(name: "creator_id", type: "bigint", {
                constraints(nullable: "true")
            })
        }
        addColumn(tableName: "project") {
            column(name: "closer_id", type: "bigint", {
                constraints(nullable: "true")
            })
        }
    }
}
