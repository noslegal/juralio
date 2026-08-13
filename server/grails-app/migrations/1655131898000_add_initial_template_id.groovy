databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1655131898000 - 1) {
        sql("""
    ALTER TABLE instance_settings ADD COLUMN initial_template_id BIGINT
    """)
        sql("""
    ALTER TABLE first_time_user_experience
            ADD has_seen_template_taskmap BOOLEAN NOT NULL DEFAULT false
""")
    }
}
