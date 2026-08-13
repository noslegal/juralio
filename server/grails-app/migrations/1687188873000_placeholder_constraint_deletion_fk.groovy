databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1687188873000-1) {
      addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "placeholders", constraintName: "FK_MATTER_ID_FOR_PLACEHOLDER", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")
    }
}
