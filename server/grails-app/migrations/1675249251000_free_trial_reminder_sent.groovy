databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1675249251000-1) {
      addColumn(tableName: "app_user") {
            column(name: "trial_reminder_sent", type: "boolean") {
                constraints(nullable: "true")
            }
        }
      
    }
}
