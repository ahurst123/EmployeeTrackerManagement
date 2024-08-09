const { Client } = require('pg');
const inquirer = require('inquirer');
const cTable = require('console.table');

// Connect to the database
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'employee_db',
    password: 'your_password',
    port: 5432,
});

client.connect();

function mainMenu() {
    inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Exit'
        ]
    }).then(answer => {
        switch (answer.action) {
            case 'View all departments':
                viewDepartments();
                break;
            case 'View all roles':
                viewRoles();
                break;
            case 'View all employees':
                viewEmployees();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update an employee role':
                updateEmployeeRole();
                break;
            case 'Exit':
                client.end();
                break;
        }
    });
}

function viewDepartments() {
    client.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        mainMenu();
    });
}

function viewRoles() {
    client.query(`
        SELECT role.id, role.title, role.salary, department.name AS department
        FROM role
        JOIN department ON role.department_id = department.id
    `, (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        mainMenu();
    });
}

function viewEmployees() {
    client.query(`
        SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, 
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM employee
        LEFT JOIN role ON employee.role_id = role.id
        LEFT JOIN department ON role.department_id = department.id
        LEFT JOIN employee manager ON manager.id = employee.manager_id
    `, (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        mainMenu();
    });
}

function addDepartment() {
    inquirer.prompt({
        name: 'name',
        type: 'input',
        message: 'What is the name of the department?'
    }).then(answer => {
        client.query('INSERT INTO department (name) VALUES ($1)', [answer.name], (err, res) => {
            if (err) throw err;
            console.log(`Added ${answer.name} to the database.`);
            mainMenu();
        });
    });
}

function addRole() {
    client.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        const departments = res.rows.map(department => ({
            name: department.name,
            value: department.id
        }));

        inquirer.prompt([
            {
                name: 'title',
                type: 'input',
                message: 'What is the title of the role?'
            },
            {
                name: 'salary',
                type: 'input',
                message: 'What is the salary of the role?'
            },
            {
                name: 'department_id',
                type: 'list',
                message: 'Which department does this role belong to?',
                choices: departments
            }
        ]).then(answer => {
            client.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', 
            [answer.title, answer.salary, answer.department_id], (err, res) => {
                if (err) throw err;
                console.log(`Added ${answer.title} to the database.`);
                mainMenu();
            });
        });
    });
}

function addEmployee() {
    client.query('SELECT * FROM role', (err, res) => {
        if (err) throw err;
        const roles = res.rows.map(role => ({
            name: role.title,
            value: role.id
        }));

        client.query('SELECT * FROM employee', (err, res) => {
            if (err) throw err;
            const managers = res.rows.map(manager => ({
                name: `${manager.first_name} ${manager.last_name}`,
                value: manager.id
            }));
            managers.unshift({ name: 'None', value: null });

            inquirer.prompt([
                {
                    name: 'first_name',
                    type: 'input',
                    message: "What is the employee's first name?"
                },
                {
                    name: 'last_name',
                    type: 'input',
                    message: "What is the employee's last name?"
                },
                {
                    name: 'role_id',
                    type: 'list',
                    message: "What is the employee's role?",
                    choices: roles
                },
                {
                    name: 'manager_id',
                    type: 'list',
                    message: "Who is the employee's manager?",
                    choices: managers
                }
            ]).then(answer => {
                client.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', 
                [answer.first_name, answer.last_name, answer.role_id, answer.manager_id], (err, res) => {
                    if (err) throw err;
                    console.log(`Added ${answer.first_name} ${answer.last_name} to the database.`);
                    mainMenu();
                });
            });
        });
    });
}

function updateEmployeeRole() {
    client.query('SELECT * FROM employee', (err, res) => {
        if (err) throw err;
        const employees = res.rows.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
        }));

        client.query('SELECT * FROM role', (err, res) => {
            if (err) throw err;
            const roles = res.rows.map(role => ({
                name: role.title,
                value: role.id
            }));

            inquirer.prompt([
                {
                    name: 'employee_id',
                    type: 'list',
                    message: "Which employee's role do you want to update?",
                    choices: employees
                },
                {
                    name: 'role_id',
                    type: 'list',
                    message: 'What is the new role?',
                    choices: roles
                }
            ]).then(answer => {
                client.query('UPDATE employee SET role_id = $1 WHERE id = $2', 
                [answer.role_id, answer.employee_id], (err, res)
