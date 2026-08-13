databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1643371777000 - 1) {
        sql('''
        ALTER TABLE IF EXISTS public.matter_recency
        ADD CONSTRAINT matter_recency_user_id_matter_id_key UNIQUE (user_id, matter_id);
        ''')
    }
}
