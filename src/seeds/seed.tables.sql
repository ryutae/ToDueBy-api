BEGIN;

TRUNCATE
  tasks,
  projects,
  userprojectref,
  users
  RESTART IDENTITY CASCADE;

INSERT INTO users (first_name, last_name, email, password)
VALUES
  ('Ryuta', 'Eguchi', 'test@test.com', '$2a$12$lHK6LVpc15/ZROZcKU00QeiD.RyYq5dVlV/9m4kKYbGibkRc5l4Ne'),
  ('Josh', 'Yim', 'slick@test.com', '$2a$12$VQ5HgWm34QQK2rJyLc0lmu59cy2jcZiV6U1.bE8rBBnC9VxDf/YQO'),
  ('Hans', 'Phang', 'goat@goat.com', '$2a$12$2fv9OPgM07xGnhDbyL6xsuAeQjAYpZx/3V2dnu0XNIR27gTeiK2gK'),
  ('Matt', 'D', 'matt4sports@matt.com', '$2a$12$/4P5/ylaB7qur/McgrEKwuCy.3JZ6W.cRtqxiJsYCdhr89V4Z3rp.');

INSERT INTO projects (name, description, date_created, created_by)
VALUES
  ('Tech', 'tech needs', '2019-05-08', 1),
  ('Art', 'art needs', '2019-05-10', 2),
  ('Coffee', 'coffee needs', '2019-06-08', 3),
  ('Meeting', 'Meeting agendas', '2019-07-08', 4);

INSERT INTO userprojectref (user_id, project_id) 
VALUES 
  (1,1),
  (1,2),
  (1,3),
  (1,4),
  (2,1),
  (3,1),
  (2,2),
  (3,3),
  (4,4),
  (2,4);

INSERT INTO tasks (project_id, name, description, due_date, created_by, date_completed, assigned_to)
VALUES 
  (1, 'sound check', '', '2019-08-08', 1, null, null),
  (1, 'lighting check', '', '2019-08-08', 1, null, null),
  (1, 'propre check', '', '2019-08-08', 1, null, null),
  (1, 'mic check', '', '2019-08-08', 1, null, null),
  (2, 'art check', '', '2019-08-08', 1, null, null),
  (2, 'queue check', '', '2019-08-08', 1, null, null),
  (3, 'sound check', '', '2019-08-08', 1, null, null),
  (3, 'camel check', '', '2019-08-08', 1, null, null),
  (4, 'sound check', '', '2019-08-08', 1, null, null),
  (1, 'coat check', '', '2019-08-08', 1, null, null),
  (1, 'line', '', '2019-08-08', 1, null, null),
  (1, 'guitar check', '', '2019-08-08', 1, null, null),
  (1, 'bass check', '', '2019-08-08', 1, null, null),
  (1, 'drum check', '', '2019-08-08', 1, null, null),
  (1, 'keys check', '', '2019-08-08', 1, null, null);
  
COMMIT;
