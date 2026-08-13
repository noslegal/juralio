databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1649757364000 - 1) {
        sql('''
        ALTER TABLE IF EXISTS public.matter_recency
        DROP CONSTRAINT matter_recency_user_id_matter_id_key
        ''')
    }
}
