databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1678788098000 - 1) {
        dropForeignKeyConstraint(baseTableName: "matter", constraintName: "FK67x3ph7t8mcsh317p5022xw44")
        addForeignKeyConstraint(baseColumnNames: "organisation_id", baseTableName: "matter", constraintName: "FK67x3ph7t8mcsh317p5022xw44", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "organisation", validate: "true", onDelete: "CASCADE")
        dropForeignKeyConstraint(baseTableName: "project_template", constraintName: "FKmmmm4o9p64n2y5ij711bj5od2")
        addForeignKeyConstraint(baseColumnNames: "organisation_id", baseTableName: "project_template", constraintName: "FKmmmm4o9p64n2y5ij711bj5od2", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "organisation", validate: "true", onDelete: "CASCADE")
        dropForeignKeyConstraint(baseTableName: "app_user", constraintName: "FKsoo5wi186endhly28ofp3f1vg")
        addForeignKeyConstraint(baseColumnNames: "organisation_id", baseTableName: "app_user", constraintName: "FKsoo5wi186endhly28ofp3f1vg", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "organisation", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: 1678788098000 - 2) {
        dropForeignKeyConstraint(baseTableName: "task_template", constraintName: "FKamgml42woua2aw64t1n549su")
        addForeignKeyConstraint(baseColumnNames: "project_template_id", baseTableName: "task_template", constraintName: "FKamgml42woua2aw64t1n549su", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project_template", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: 1678788098000 - 3) {
        dropForeignKeyConstraint(baseTableName: "template_resource", constraintName: "FK_template_resource_template_id")
        addForeignKeyConstraint(baseColumnNames: "template_id", baseTableName: "template_resource", constraintName: "FK_template_resource_template_id", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project_template", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: 1678788098000 - 4) {
        dropForeignKeyConstraint(baseTableName: "task_recency", constraintName: "FKd9m2s6bpafpfqde8pp41apwxk")
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "task_recency", constraintName: "FKd9m2s6bpafpfqde8pp41apwxk", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: 1678788098000 - 5) {
        dropForeignKeyConstraint(baseTableName: "post", constraintName: "FKdyk8abmkx904g0ebp2p600tvr")
        addForeignKeyConstraint(baseColumnNames: "creator_id", baseTableName: "post", constraintName: "FKdyk8abmkx904g0ebp2p600tvr", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: 1678788098000 - 6) {
        dropForeignKeyConstraint(baseTableName: "user_session_event", constraintName: "FK_user_session_event_user_id")
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "user_session_event", constraintName: "FK_user_session_event_user_id", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: 1678788098000 - 7) {
        dropForeignKeyConstraint(baseTableName: "task_creation_context", constraintName: "FK_CREATOR_ID_TO_USER")
        addForeignKeyConstraint(baseColumnNames: "creator_id", baseTableName: "task_creation_context", constraintName: "FK_CREATOR_ID_TO_USER", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: 1678788098000 - 8) {
        dropForeignKeyConstraint(baseTableName: "task_template_post", constraintName: "FK_TTP_TTID_COL")
        addForeignKeyConstraint(baseColumnNames: "task_template_posts_id", baseTableName: "task_template_post", constraintName: "FK_TTP_TTID_COL", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task_template", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: 1678788098000 - 9){
        sql('''
          CREATE TABLE IF NOT EXISTS deleted_organisation_log(id SERIAL PRIMARY KEY, version BIGINT, organisation_id BIGINT UNIQUE NOT NULL, organisation_name VARCHAR(255) NOT NULL,  deleted_by VARCHAR(255) NOT NULL, marked_for_deletion TIMESTAMP NOT NULL, permanently_deleted TIMESTAMP);
        ''')
    }
    changeSet(author: "juralio (generated)", id: 1678788098000 - 10) {
        dropForeignKeyConstraint(baseTableName: "task_follower", constraintName: "FK1wg63dj67cg3ejpmvna2km157")
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "task_follower", constraintName: "FK1wg63dj67cg3ejpmvna2km157", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: 1678788098000 - 11) {
        dropForeignKeyConstraint(baseTableName: "task_template_task_template", constraintName: "FKm0n7to7m0wlwwqynf0qxr745p")
        addForeignKeyConstraint(baseColumnNames: "task_template_id", baseTableName: "task_template_task_template", constraintName: "FKm0n7to7m0wlwwqynf0qxr745p", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task_template", validate: "true", onDelete: "CASCADE")
    }
    changeSet(author: "juralio (generated)", id: 1678788098000 - 12) {
        addForeignKeyConstraint(baseColumnNames: "organisation_id", baseTableName: "deleted_matter_log", constraintName: "FKm0n7to7m0wlwwqynf0qxr358y", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "organisation", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "organisation_id", baseTableName: "inactive_label", constraintName: "FKm0n7to7m0wlwwqynf0qxr358r", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "organisation", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "organisation_id", baseTableName: "label", constraintName: "FKm0n7to7m0wlwwqynf0qxr358s", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "organisation", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "app_user_id", baseTableName: "marketplace_project_favourite", constraintName: "FKm0n7to7m0wlwwqynf0qxr358t", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "app_user_id", baseTableName: "project_template_favourite", constraintName: "FKm0n7to7m0wlwwqynf0qxr358u", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "project_template_recency", constraintName: "FKm0n7to7m0wlwwqynf0qxr358v", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true", onDelete: "CASCADE")
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "tour", constraintName: "FKm0n7to7m0wlwwqynf0qxr358w", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true", onDelete: "CASCADE")
    }
}

