databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1674141837000-1) {
      addColumn(tableName: "organisation") {
            column(name: "lapsed_login_message", type: "VARCHAR(150)") {
                constraints(nullable: "true")
            }
        }
        addColumn(tableName: "organisation") {
            column(name: "trial_message", type: "VARCHAR(20)") {
                constraints(nullable: "true")
            }
        }
    }
}
