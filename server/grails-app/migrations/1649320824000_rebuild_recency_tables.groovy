databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1649320824000 - 1) {
        sql('''
     CREATE TABLE project_template_recency_old(id SERIAL PRIMARY KEY, user_id bigint, project_template_id bigint, version bigint, last_visit timestamp);        
CREATE TABLE project_recency_old(id SERIAL PRIMARY KEY, user_id bigint, project_id bigint, version bigint, last_visit timestamp);        
CREATE TABLE project_visit_recency_old(id SERIAL PRIMARY KEY, user_id bigint, project_id bigint, version bigint, last_visit timestamp);

INSERT INTO project_template_recency_old (user_id, project_template_id, version, last_visit)
SELECT  user_id,project_template_id,version,last_visit from project_template_recency;
   
INSERT INTO project_recency_old (user_id, project_id, version, last_visit)
SELECT  user_id,project_id,version,last_visit from project_recency;
	 
INSERT INTO project_visit_recency_old (user_id, project_id, version, last_visit)
SELECT  user_id,project_id,version,last_visit from project_visit_recency;


DROP TABLE project_template_recency;
DROP TABLE project_recency;
DROP TABLE project_visit_recency;

CREATE TABLE project_template_recency(id SERIAL PRIMARY KEY, user_id bigint, project_template_id bigint, version bigint, last_visit timestamp);        
CREATE TABLE project_recency(id SERIAL PRIMARY KEY, user_id bigint, project_id bigint, version bigint, last_visit timestamp);        
CREATE TABLE project_visit_recency(id SERIAL PRIMARY KEY, user_id bigint, project_id bigint, version bigint, last_visit timestamp);

INSERT INTO project_template_recency (user_id, project_template_id, version, last_visit)
SELECT  user_id,project_template_id,version,last_visit from project_template_recency_old;

INSERT INTO project_recency (user_id, project_id, version, last_visit)
SELECT  user_id,project_id,version,last_visit from project_recency_old;

INSERT INTO project_visit_recency (user_id, project_id, version, last_visit)
SELECT  user_id,project_id,version,last_visit from project_visit_recency_old;
	 
DROP TABLE project_template_recency_old;   
DROP TABLE project_recency_old;
DROP TABLE project_visit_recency_old;
     ''')
    }
}
