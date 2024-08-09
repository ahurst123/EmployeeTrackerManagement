INSERT INTO department (name) VALUES ('Engineering'), ('Finance'), ('Human Resources'), ('Sales');

INSERT INTO role (title, salary, department_id) VALUES
('Software Engineer', 80000, 1),
('Accountant', 60000, 2),
('HR Manager', 70000, 3),
('Sale Representative', 50000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('John', 'Williams',  1, NULL),
('Hugh', 'Jackson', 2, NULL),
('Jake', 'Burgess', 3, NULL),
('Aubrey', 'Campbell', 4, NULL);