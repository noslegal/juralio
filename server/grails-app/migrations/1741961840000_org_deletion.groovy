databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1741961840000-1) {
           //organisation foreign keys 
        addForeignKeyConstraint(baseColumnNames: "organisation_id", baseTableName: "other_cost", constraintName: "FK_organisation_id_other_cost", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "organisation", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "organisation_id", baseTableName: "grade", constraintName: "FK_organisation_id_grade", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "organisation", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "organisation_id", baseTableName: "grade_category", constraintName: "FK_organisation_id_grade_cateogry", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "organisation", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "organisation_id", baseTableName: "rate_type", constraintName: "FK_organisation_id_rate_type", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "organisation", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "organisation_id", baseTableName: "rate_table_details", constraintName: "FK_organisation_id_rate_table_details", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "organisation", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "organisation_id", baseTableName: "rate", constraintName: "FK_organisation_id_rate", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "organisation", validate: "true", onDelete: "CASCADE")

        //rtd foreign keys 
        addForeignKeyConstraint(baseColumnNames: "rate_table_details_id", baseTableName: "period", constraintName: "FK_rate_table_details_period", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "rate_table_details", validate: "true", onDelete: "CASCADE")

        //matter foreign keys
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "cost_ratio", constraintName: "FK_matter_cost_ratio", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "cost_snapshot", constraintName: "FK_matter_cost_snapshot", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "matter_costs", constraintName: "FK_matter_matter_costs", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "matter_pricing", constraintName: "FK_matter_matter_pricing", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "matter_id", baseTableName: "projection_period", constraintName: "FK_matter_projection_period", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "matter", validate: "true", onDelete: "CASCADE")

        //projection period foreign keys 
        addForeignKeyConstraint(baseColumnNames: "projection_period_id", baseTableName: "cost_time_estimate", constraintName: "FK_projection_period_cost_time_estimate", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "projection_period", validate: "true", onDelete: "CASCADE")
    }
  }
