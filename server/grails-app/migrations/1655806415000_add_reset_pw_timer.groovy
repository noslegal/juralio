databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1655806415000 - 1) {
        addColumn(tableName: "app_user") {
            column(name: "reset_pw_time", type: "timestamp") {
                constraints(nullable: "true")
            }
        }
    }
}
