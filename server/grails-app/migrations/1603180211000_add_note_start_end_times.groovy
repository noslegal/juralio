databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1603180211000 - 1) {
        addColumn(tableName: "post") {
            column(name: "start_time", type: "TIMESTAMP WITHOUT TIME ZONE") {
                constraints(nullable: "true")
            }
        }
        addColumn(tableName: "post") {
            column(name: "end_time", type: "TIMESTAMP WITHOUT TIME ZONE") {
                constraints(nullable: "true")
            }
        }
    }
}



