databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1681221009000-1) {
      dropForeignKeyConstraint(baseTableName: "user_status_event", constraintName: "FK_user_status_event_performed_by_id")

    }
}
