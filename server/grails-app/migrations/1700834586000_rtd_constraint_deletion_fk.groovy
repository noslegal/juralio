databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1700834586000-1) {
      addForeignKeyConstraint(baseColumnNames: "rate_table_details_id", baseTableName: "period", constraintName: "FK_RTD_ID_FOR_PERIOD", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "rate_table_details", validate: "true", onDelete: "CASCADE")
      addForeignKeyConstraint(baseColumnNames: "rate_table_details_id", baseTableName: "rate", constraintName: "FK_RTD_ID_FOR_RATE", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "rate_table_details", validate: "true", onDelete: "CASCADE")
    }
}
