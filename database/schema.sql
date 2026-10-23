-- ============================================================
-- EMPLOYEE PAY FIXATION & PAY COMMISSION MANAGEMENT SYSTEM
-- Database Schema - Microsoft SQL Server
-- Version: 1.0.0
-- ============================================================

USE master;
GO
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'PayCommissionDB')
    CREATE DATABASE PayCommissionDB;
GO
USE PayCommissionDB;
GO

-- ============================================================
-- ROLES & PERMISSIONS
-- ============================================================
CREATE TABLE roles (
    role_id     INT IDENTITY(1,1) PRIMARY KEY,
    role_name   NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(500),
    is_active   BIT NOT NULL DEFAULT 1,
    created_at  DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at  DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE TABLE permissions (
    permission_id  INT IDENTITY(1,1) PRIMARY KEY,
    permission_key NVARCHAR(100) NOT NULL UNIQUE,
    module         NVARCHAR(100) NOT NULL,
    action         NVARCHAR(100) NOT NULL,
    description    NVARCHAR(500),
    created_at     DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE TABLE role_permissions (
    role_id       INT NOT NULL REFERENCES roles(role_id),
    permission_id INT NOT NULL REFERENCES permissions(permission_id),
    PRIMARY KEY (role_id, permission_id)
);

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    user_id       INT IDENTITY(1,1) PRIMARY KEY,
    username      NVARCHAR(100) NOT NULL UNIQUE,
    email         NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(500) NOT NULL,
    full_name     NVARCHAR(200) NOT NULL,
    role_id       INT NOT NULL REFERENCES roles(role_id),
    is_active     BIT NOT NULL DEFAULT 1,
    last_login    DATETIME2,
    created_at    DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at    DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    created_by    INT REFERENCES users(user_id)
);

-- ============================================================
-- DEPARTMENTS, BRANCHES, DESIGNATIONS
-- ============================================================
CREATE TABLE departments (
    department_id  INT IDENTITY(1,1) PRIMARY KEY,
    dept_code      NVARCHAR(50) NOT NULL UNIQUE,
    dept_name      NVARCHAR(200) NOT NULL,
    parent_dept_id INT REFERENCES departments(department_id),
    is_active      BIT NOT NULL DEFAULT 1,
    created_at     DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at     DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE TABLE branches (
    branch_id     INT IDENTITY(1,1) PRIMARY KEY,
    department_id INT NOT NULL REFERENCES departments(department_id),
    branch_code   NVARCHAR(50) NOT NULL UNIQUE,
    branch_name   NVARCHAR(200) NOT NULL,
    address       NVARCHAR(500),
    is_active     BIT NOT NULL DEFAULT 1,
    created_at    DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE TABLE designations (
    designation_id   INT IDENTITY(1,1) PRIMARY KEY,
    designation_code NVARCHAR(50) NOT NULL UNIQUE,
    designation_name NVARCHAR(200) NOT NULL,
    department_id    INT REFERENCES departments(department_id),
    grade_level      NVARCHAR(50),
    is_active        BIT NOT NULL DEFAULT 1,
    created_at       DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at       DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- ============================================================
-- PAY COMMISSION MASTER (Configurable - supports 7th, 8th, future)
-- ============================================================
CREATE TABLE pay_commissions (
    commission_id   INT IDENTITY(1,1) PRIMARY KEY,
    commission_code NVARCHAR(50) NOT NULL UNIQUE,
    commission_name NVARCHAR(200) NOT NULL,
    effective_from  DATE NOT NULL,
    effective_to    DATE,
    status          NVARCHAR(50) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT','ACTIVE','INACTIVE','FUTURE')),
    fitment_factor  DECIMAL(10,4),
    description     NVARCHAR(1000),
    is_active       BIT NOT NULL DEFAULT 1,
    created_at      DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at      DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    created_by      INT
);

-- ============================================================
-- PAY LEVELS & PAY MATRIX
-- ============================================================
CREATE TABLE pay_levels (
    pay_level_id  INT IDENTITY(1,1) PRIMARY KEY,
    commission_id INT NOT NULL REFERENCES pay_commissions(commission_id),
    level_number  NVARCHAR(10) NOT NULL,
    level_name    NVARCHAR(100),
    grade_pay     DECIMAL(12,2),
    description   NVARCHAR(500),
    is_active     BIT NOT NULL DEFAULT 1,
    created_at    DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UNIQUE(commission_id, level_number)
);

CREATE TABLE pay_matrix (
    matrix_id      INT IDENTITY(1,1) PRIMARY KEY,
    commission_id  INT NOT NULL REFERENCES pay_commissions(commission_id),
    pay_level_id   INT NOT NULL REFERENCES pay_levels(pay_level_id),
    cell_number    INT NOT NULL,
    basic_pay      DECIMAL(12,2) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to   DATE,
    is_active      BIT NOT NULL DEFAULT 1,
    created_at     DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at     DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    created_by     INT,
    UNIQUE(pay_level_id, cell_number, effective_from)
);

-- ============================================================
-- PAY RULES ENGINE (Commission-agnostic rule storage)
-- ============================================================
CREATE TABLE pay_rule_types (
    rule_type_id INT IDENTITY(1,1) PRIMARY KEY,
    type_code    NVARCHAR(50) NOT NULL UNIQUE,
    type_name    NVARCHAR(100) NOT NULL,
    description  NVARCHAR(500)
);

CREATE TABLE pay_rules (
    rule_id            INT IDENTITY(1,1) PRIMARY KEY,
    commission_id      INT NOT NULL REFERENCES pay_commissions(commission_id),
    rule_type_id       INT NOT NULL REFERENCES pay_rule_types(rule_type_id),
    rule_code          NVARCHAR(100) NOT NULL,
    rule_name          NVARCHAR(200) NOT NULL,
    rule_description   NVARCHAR(2000),
    rule_parameters    NVARCHAR(MAX),     -- JSON: configurable params
    formula_expression NVARCHAR(2000),
    effective_from     DATE NOT NULL,
    effective_to       DATE,
    is_active          BIT NOT NULL DEFAULT 1,
    priority           INT NOT NULL DEFAULT 1,
    created_at         DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at         DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    created_by         INT
);

-- ============================================================
-- EMPLOYEES
-- ============================================================
CREATE TABLE employees (
    employee_id                 INT IDENTITY(1,1) PRIMARY KEY,
    employee_code               NVARCHAR(50) NOT NULL UNIQUE,
    employee_name               NVARCHAR(200) NOT NULL,
    fathers_husbands_name       NVARCHAR(200),
    gender                      NVARCHAR(10) CHECK (gender IN ('MALE','FEMALE','OTHER')),
    date_of_birth               DATE,
    date_of_joining             DATE NOT NULL,
    date_of_retirement          DATE,
    date_of_initial_appointment DATE,
    date_of_regular_appointment DATE,
    department_id               INT REFERENCES departments(department_id),
    branch_id                   INT REFERENCES branches(branch_id),
    designation_id              INT REFERENCES designations(designation_id),
    current_post                NVARCHAR(200),
    employee_type               NVARCHAR(50),   -- REGULAR, CONTRACT, DEPUTATION
    category                    NVARCHAR(50),   -- GEN, OBC, SC, ST
    current_commission_id       INT REFERENCES pay_commissions(commission_id),
    current_pay_level_id        INT REFERENCES pay_levels(pay_level_id),
    current_pay_cell            INT,
    basic_pay                   DECIMAL(12,2),
    increment_date              DATE,
    pan_number                  NVARCHAR(20),
    aadhaar_number              NVARCHAR(20),
    bank_name                   NVARCHAR(100),
    bank_account_number         NVARCHAR(50),
    bank_ifsc                   NVARCHAR(20),
    mobile_number               NVARCHAR(15),
    email                       NVARCHAR(255),
    address_line1               NVARCHAR(255),
    address_line2               NVARCHAR(255),
    city                        NVARCHAR(100),
    state                       NVARCHAR(100),
    pincode                     NVARCHAR(10),
    status                      NVARCHAR(50) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE','RETIRED','RESIGNED','DECEASED','ON_LEAVE')),
    remarks                     NVARCHAR(1000),
    photo_path                  NVARCHAR(500),
    created_at                  DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at                  DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    created_by                  INT,
    updated_by                  INT
);

-- ============================================================
-- SERVICE HISTORY
-- ============================================================
CREATE TABLE service_event_types (
    event_type_id INT IDENTITY(1,1) PRIMARY KEY,
    type_code     NVARCHAR(50) NOT NULL UNIQUE,
    type_name     NVARCHAR(100) NOT NULL,
    description   NVARCHAR(500),
    affects_pay   BIT NOT NULL DEFAULT 0,
    is_active     BIT NOT NULL DEFAULT 1
);

CREATE TABLE employee_service_history (
    history_id              INT IDENTITY(1,1) PRIMARY KEY,
    employee_id             INT NOT NULL REFERENCES employees(employee_id),
    event_type_id           INT NOT NULL REFERENCES service_event_types(event_type_id),
    effective_date          DATE NOT NULL,
    previous_designation_id INT REFERENCES designations(designation_id),
    new_designation_id      INT REFERENCES designations(designation_id),
    previous_commission_id  INT REFERENCES pay_commissions(commission_id),
    new_commission_id       INT REFERENCES pay_commissions(commission_id),
    previous_pay_level_id   INT REFERENCES pay_levels(pay_level_id),
    new_pay_level_id        INT REFERENCES pay_levels(pay_level_id),
    previous_pay_cell       INT,
    new_pay_cell            INT,
    previous_basic_pay      DECIMAL(12,2),
    new_basic_pay           DECIMAL(12,2),
    order_number            NVARCHAR(100),
    order_date              DATE,
    remarks                 NVARCHAR(1000),
    approval_status         NVARCHAR(50) NOT NULL DEFAULT 'DRAFT'
        CHECK (approval_status IN ('DRAFT','CALCULATED','SUBMITTED','APPROVED','REJECTED','APPLIED')),
    approved_by             INT,
    approved_at             DATETIME2,
    applied_by              INT,
    applied_at              DATETIME2,
    is_reversed             BIT NOT NULL DEFAULT 0,
    created_at              DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at              DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    created_by              INT
);

-- ============================================================
-- PROMOTIONS
-- ============================================================
CREATE TABLE employee_promotions (
    promotion_id            INT IDENTITY(1,1) PRIMARY KEY,
    employee_id             INT NOT NULL REFERENCES employees(employee_id),
    history_id              INT REFERENCES employee_service_history(history_id),
    promotion_date          DATE NOT NULL,
    previous_designation_id INT REFERENCES designations(designation_id),
    new_designation_id      INT REFERENCES designations(designation_id),
    previous_pay_level_id   INT REFERENCES pay_levels(pay_level_id),
    new_pay_level_id        INT REFERENCES pay_levels(pay_level_id),
    previous_pay_cell       INT,
    new_pay_cell            INT,
    previous_basic_pay      DECIMAL(12,2),
    new_basic_pay           DECIMAL(12,2),
    applicable_rule_id      INT REFERENCES pay_rules(rule_id),
    order_number            NVARCHAR(100),
    order_date              DATE,
    next_increment_date     DATE,
    calculation_details     NVARCHAR(MAX),  -- JSON: full transparent breakdown
    remarks                 NVARCHAR(1000),
    approval_status         NVARCHAR(50) NOT NULL DEFAULT 'DRAFT'
        CHECK (approval_status IN ('DRAFT','CALCULATED','SUBMITTED','APPROVED','REJECTED','APPLIED')),
    approved_by             INT,
    approved_at             DATETIME2,
    created_at              DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at              DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    created_by              INT
);

-- ============================================================
-- INCREMENTS
-- ============================================================
CREATE TABLE employee_increments (
    increment_id        INT IDENTITY(1,1) PRIMARY KEY,
    employee_id         INT NOT NULL REFERENCES employees(employee_id),
    history_id          INT REFERENCES employee_service_history(history_id),
    increment_date      DATE NOT NULL,
    previous_pay_level_id INT REFERENCES pay_levels(pay_level_id),
    previous_pay_cell   INT,
    new_pay_cell        INT,
    previous_basic_pay  DECIMAL(12,2),
    new_basic_pay       DECIMAL(12,2),
    applicable_rule_id  INT REFERENCES pay_rules(rule_id),
    next_increment_date DATE,
    calculation_details NVARCHAR(MAX),
    remarks             NVARCHAR(1000),
    approval_status     NVARCHAR(50) NOT NULL DEFAULT 'DRAFT'
        CHECK (approval_status IN ('DRAFT','CALCULATED','SUBMITTED','APPROVED','REJECTED','APPLIED')),
    approved_by         INT,
    approved_at         DATETIME2,
    created_at          DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at          DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    created_by          INT
);

-- ============================================================
-- SELECTION GRADE / SENIOR SELECTION GRADE
-- ============================================================
CREATE TABLE employee_selection_grades (
    selection_grade_id      INT IDENTITY(1,1) PRIMARY KEY,
    employee_id             INT NOT NULL REFERENCES employees(employee_id),
    history_id              INT REFERENCES employee_service_history(history_id),
    grade_type              NVARCHAR(50) NOT NULL,  -- SELECTION_GRADE, SENIOR_SELECTION_GRADE
    effective_date          DATE NOT NULL,
    previous_designation_id INT REFERENCES designations(designation_id),
    new_designation_id      INT REFERENCES designations(designation_id),
    previous_pay_level_id   INT REFERENCES pay_levels(pay_level_id),
    new_pay_level_id        INT REFERENCES pay_levels(pay_level_id),
    previous_pay_cell       INT,
    new_pay_cell            INT,
    previous_basic_pay      DECIMAL(12,2),
    new_basic_pay           DECIMAL(12,2),
    applicable_rule_id      INT REFERENCES pay_rules(rule_id),
    order_number            NVARCHAR(100),
    order_date              DATE,
    next_increment_date     DATE,
    calculation_details     NVARCHAR(MAX),
    remarks                 NVARCHAR(1000),
    approval_status         NVARCHAR(50) NOT NULL DEFAULT 'DRAFT'
        CHECK (approval_status IN ('DRAFT','CALCULATED','SUBMITTED','APPROVED','REJECTED','APPLIED')),
    approved_by             INT,
    approved_at             DATETIME2,
    created_at              DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at              DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    created_by              INT
);

-- ============================================================
-- PAY REVISIONS (individual + bulk)
-- ============================================================
CREATE TABLE bulk_pay_revisions (
    bulk_revision_id   INT IDENTITY(1,1) PRIMARY KEY,
    revision_name      NVARCHAR(200) NOT NULL,
    from_commission_id INT REFERENCES pay_commissions(commission_id),
    to_commission_id   INT REFERENCES pay_commissions(commission_id),
    effective_date     DATE NOT NULL,
    applicable_rule_id INT REFERENCES pay_rules(rule_id),
    status             NVARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    total_employees    INT,
    processed_count    INT,
    remarks            NVARCHAR(1000),
    created_at         DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at         DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    created_by         INT
);

CREATE TABLE employee_pay_revisions (
    revision_id           INT IDENTITY(1,1) PRIMARY KEY,
    employee_id           INT NOT NULL REFERENCES employees(employee_id),
    history_id            INT REFERENCES employee_service_history(history_id),
    effective_date        DATE NOT NULL,
    from_commission_id    INT REFERENCES pay_commissions(commission_id),
    to_commission_id      INT REFERENCES pay_commissions(commission_id),
    previous_pay_level_id INT REFERENCES pay_levels(pay_level_id),
    new_pay_level_id      INT REFERENCES pay_levels(pay_level_id),
    previous_pay_cell     INT,
    new_pay_cell          INT,
    previous_basic_pay    DECIMAL(12,2),
    new_basic_pay         DECIMAL(12,2),
    applicable_rule_id    INT REFERENCES pay_rules(rule_id),
    fitment_factor_used   DECIMAL(10,4),
    calculation_details   NVARCHAR(MAX),
    remarks               NVARCHAR(1000),
    approval_status       NVARCHAR(50) NOT NULL DEFAULT 'DRAFT'
        CHECK (approval_status IN ('DRAFT','CALCULATED','SUBMITTED','APPROVED','REJECTED','APPLIED')),
    approved_by           INT,
    approved_at           DATETIME2,
    is_bulk               BIT NOT NULL DEFAULT 0,
    bulk_revision_id      INT REFERENCES bulk_pay_revisions(bulk_revision_id),
    created_at            DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at            DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    created_by            INT
);

-- ============================================================
-- PAY FIXATION (full audit trail)
-- ============================================================
CREATE TABLE employee_pay_fixations (
    fixation_id           INT IDENTITY(1,1) PRIMARY KEY,
    employee_id           INT NOT NULL REFERENCES employees(employee_id),
    fixation_type         NVARCHAR(50) NOT NULL,  -- PROMOTION, INCREMENT, SELECTION_GRADE, PAY_REVISION, INITIAL
    reference_id          INT,
    commission_id         INT REFERENCES pay_commissions(commission_id),
    effective_date        DATE NOT NULL,
    previous_pay_level_id INT REFERENCES pay_levels(pay_level_id),
    new_pay_level_id      INT REFERENCES pay_levels(pay_level_id),
    previous_pay_cell     INT,
    new_pay_cell          INT,
    previous_basic_pay    DECIMAL(12,2),
    new_basic_pay         DECIMAL(12,2),
    applicable_rule_id    INT REFERENCES pay_rules(rule_id),
    rule_name_used        NVARCHAR(200),
    input_snapshot        NVARCHAR(MAX),   -- JSON: all inputs at calculation time
    calculation_steps     NVARCHAR(MAX),   -- JSON: step-by-step transparent breakdown
    final_approved_value  DECIMAL(12,2),
    next_increment_date   DATE,
    calculated_by         INT,
    calculated_at         DATETIME2,
    approval_status       NVARCHAR(50) NOT NULL DEFAULT 'DRAFT'
        CHECK (approval_status IN ('DRAFT','CALCULATED','SUBMITTED','APPROVED','REJECTED','APPLIED')),
    approved_by           INT,
    approved_at           DATETIME2,
    approval_remarks      NVARCHAR(500),
    created_at            DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at            DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    created_by            INT
);

-- ============================================================
-- ARREARS
-- ============================================================
CREATE TABLE arrears (
    arrear_id           INT IDENTITY(1,1) PRIMARY KEY,
    employee_id         INT NOT NULL REFERENCES employees(employee_id),
    arrear_from_date    DATE NOT NULL,
    arrear_to_date      DATE NOT NULL,
    old_basic_pay       DECIMAL(12,2) NOT NULL,
    revised_basic_pay   DECIMAL(12,2) NOT NULL,
    reference_type      NVARCHAR(50),
    reference_id        INT,
    monthly_details     NVARCHAR(MAX),   -- JSON: month-by-month breakdown
    total_arrear        DECIMAL(12,2),
    deductions          DECIMAL(12,2),
    net_arrear          DECIMAL(12,2),
    calculation_details NVARCHAR(MAX),
    approval_status     NVARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    approved_by         INT,
    approved_at         DATETIME2,
    remarks             NVARCHAR(1000),
    created_at          DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at          DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    created_by          INT
);

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE documents (
    document_id    INT IDENTITY(1,1) PRIMARY KEY,
    employee_id    INT NOT NULL REFERENCES employees(employee_id),
    document_type  NVARCHAR(100) NOT NULL,
    file_name      NVARCHAR(255) NOT NULL,
    file_path      NVARCHAR(500) NOT NULL,
    file_size      BIGINT,
    mime_type      NVARCHAR(100),
    related_module NVARCHAR(100),
    related_id     INT,
    description    NVARCHAR(500),
    upload_date    DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    uploaded_by    INT,
    is_active      BIT NOT NULL DEFAULT 1
);

-- ============================================================
-- REPORT TEMPLATES (configurable per commission)
-- ============================================================
CREATE TABLE report_templates (
    template_id     INT IDENTITY(1,1) PRIMARY KEY,
    commission_id   INT REFERENCES pay_commissions(commission_id),
    template_code   NVARCHAR(100) NOT NULL UNIQUE,
    template_name   NVARCHAR(200) NOT NULL,
    report_type     NVARCHAR(100) NOT NULL,
    template_config NVARCHAR(MAX) NOT NULL,  -- JSON layout definition
    is_default      BIT NOT NULL DEFAULT 0,
    is_active       BIT NOT NULL DEFAULT 1,
    created_at      DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_at      DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    created_by      INT
);

-- ============================================================
-- SYSTEM SETTINGS
-- ============================================================
CREATE TABLE system_settings (
    setting_id    INT IDENTITY(1,1) PRIMARY KEY,
    setting_key   NVARCHAR(200) NOT NULL UNIQUE,
    setting_value NVARCHAR(MAX),
    setting_group NVARCHAR(100),
    description   NVARCHAR(500),
    updated_at    DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    updated_by    INT
);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE audit_logs (
    log_id      BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id     INT,
    username    NVARCHAR(100),
    action      NVARCHAR(100) NOT NULL,
    module      NVARCHAR(100) NOT NULL,
    record_id   INT,
    employee_id INT REFERENCES employees(employee_id),
    old_value   NVARCHAR(MAX),
    new_value   NVARCHAR(MAX),
    description NVARCHAR(1000),
    ip_address  NVARCHAR(50),
    user_agent  NVARCHAR(500),
    created_at  DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- ============================================================
-- APPROVAL HISTORY
-- ============================================================
CREATE TABLE approval_history (
    approval_history_id INT IDENTITY(1,1) PRIMARY KEY,
    module              NVARCHAR(100) NOT NULL,
    record_id           INT NOT NULL,
    employee_id         INT REFERENCES employees(employee_id),
    from_status         NVARCHAR(50),
    to_status           NVARCHAR(50),
    action              NVARCHAR(50),
    remarks             NVARCHAR(500),
    action_by           INT,
    action_at           DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

GO

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IX_employees_code       ON employees(employee_code);
CREATE INDEX IX_employees_status     ON employees(status);
CREATE INDEX IX_employees_dept       ON employees(department_id);
CREATE INDEX IX_employees_commission ON employees(current_commission_id);
CREATE INDEX IX_employees_increment  ON employees(increment_date);

CREATE INDEX IX_svc_history_emp      ON employee_service_history(employee_id);
CREATE INDEX IX_svc_history_date     ON employee_service_history(effective_date);

CREATE INDEX IX_promotions_emp       ON employee_promotions(employee_id);
CREATE INDEX IX_increments_emp       ON employee_increments(employee_id);
CREATE INDEX IX_sel_grades_emp       ON employee_selection_grades(employee_id);
CREATE INDEX IX_pay_fixations_emp    ON employee_pay_fixations(employee_id);
CREATE INDEX IX_pay_revisions_emp    ON employee_pay_revisions(employee_id);

CREATE INDEX IX_pay_matrix_level     ON pay_matrix(pay_level_id);
CREATE INDEX IX_pay_matrix_comm      ON pay_matrix(commission_id);

CREATE INDEX IX_audit_user           ON audit_logs(user_id);
CREATE INDEX IX_audit_module         ON audit_logs(module);
CREATE INDEX IX_audit_emp            ON audit_logs(employee_id);
CREATE INDEX IX_audit_date           ON audit_logs(created_at);

GO

-- ============================================================
-- SEED DATA
-- ============================================================

-- Roles
INSERT INTO roles (role_name, description) VALUES
('SUPER_ADMIN', 'Full system access - manage all modules and configurations'),
('ADMIN',       'HR Admin - manage employees, pay fixation and reports'),
('VIEWER',      'Read-only access to employee data and reports');

-- Permissions
INSERT INTO permissions (permission_key, module, action, description) VALUES
('employees.view',           'EMPLOYEES',        'VIEW',   'View employee records'),
('employees.create',         'EMPLOYEES',        'CREATE', 'Create new employees'),
('employees.edit',           'EMPLOYEES',        'EDIT',   'Edit employee records'),
('employees.delete',         'EMPLOYEES',        'DELETE', 'Delete employee records'),
('pay_commission.view',      'PAY_COMMISSION',   'VIEW',   'View pay commissions'),
('pay_commission.manage',    'PAY_COMMISSION',   'MANAGE', 'Manage pay commissions'),
('pay_matrix.view',          'PAY_MATRIX',       'VIEW',   'View pay matrix'),
('pay_matrix.manage',        'PAY_MATRIX',       'MANAGE', 'Manage pay matrix'),
('promotions.manage',        'PROMOTIONS',       'MANAGE', 'Manage promotions'),
('increments.manage',        'INCREMENTS',       'MANAGE', 'Manage increments'),
('selection_grade.manage',   'SELECTION_GRADE',  'MANAGE', 'Manage selection grades'),
('pay_revision.manage',      'PAY_REVISION',     'MANAGE', 'Manage pay revisions'),
('pay_fixation.calculate',   'PAY_FIXATION',     'CALC',   'Calculate pay fixation'),
('pay_fixation.approve',     'PAY_FIXATION',     'APPROVE','Approve pay fixation'),
('reports.view',             'REPORTS',          'VIEW',   'View and generate reports'),
('audit_logs.view',          'AUDIT_LOGS',       'VIEW',   'View audit logs'),
('users.manage',             'USERS',            'MANAGE', 'Manage users'),
('settings.manage',          'SETTINGS',         'MANAGE', 'Manage system settings');

-- Service Event Types
INSERT INTO service_event_types (type_code, type_name, affects_pay) VALUES
('APPOINTMENT',      'Initial Appointment',     0),
('REGULARIZATION',   'Regularization',          1),
('INCREMENT',        'Annual Increment',        1),
('PROMOTION',        'Promotion',               1),
('DEMOTION',         'Demotion',                1),
('TRANSFER',         'Transfer',                0),
('SELECTION_GRADE',  'Selection Grade',         1),
('SENIOR_SEL_GRADE', 'Senior Selection Grade',  1),
('PAY_REVISION',     'Pay Commission Revision', 1),
('PAY_FIXATION',     'Pay Fixation',            1),
('RETIREMENT',       'Retirement',              0),
('RESIGNATION',      'Resignation',             0),
('SUSPENSION',       'Suspension',              0),
('REINSTATEMENT',    'Reinstatement',           0),
('OTHER',            'Other Service Event',     0);

-- Pay Rule Types
INSERT INTO pay_rule_types (type_code, type_name, description) VALUES
('INCREMENT_RULE',       'Increment Rule',       'Rules for annual increment calculation'),
('PROMOTION_RULE',       'Promotion Rule',       'Rules for pay fixation on promotion'),
('REVISION_RULE',        'Pay Revision Rule',    'Rules for pay revision between commissions'),
('SELECTION_GRADE_RULE', 'Selection Grade Rule', 'Rules for selection grade fixation'),
('FITMENT_RULE',         'Fitment Rule',         'Rules for fitment factor on commission change');

-- Placeholder 7th Pay Commission
-- NOTE: Actual pay matrix and rules MUST be loaded from official client documents
INSERT INTO pay_commissions
    (commission_code, commission_name, effective_from, status, fitment_factor, description)
VALUES
    ('7TH_PC', '7th Pay Commission', '2016-01-01', 'ACTIVE', 2.57,
     'PLACEHOLDER: 7th Central Pay Commission effective 01-Jan-2016. ' +
     'Official pay matrix and rules must be imported from client-provided documents before production use.');

-- System Settings
INSERT INTO system_settings (setting_key, setting_value, setting_group, description) VALUES
('org.name',             'Organisation Name',   'ORGANIZATION', 'Name of the organisation'),
('org.address',          'Address',             'ORGANIZATION', 'Organisation address'),
('org.logo_path',        '',                    'ORGANIZATION', 'Logo file path'),
('app.timezone',         'Asia/Kolkata',         'APPLICATION',  'Application timezone'),
('app.currency',         'INR',                  'APPLICATION',  'Currency'),
('app.date_format',      'DD-MM-YYYY',           'APPLICATION',  'Display date format'),
('upload.max_size_mb',   '10',                   'UPLOAD',       'Max file upload size MB'),
('upload.allowed_types', 'pdf,jpg,jpeg,png',     'UPLOAD',       'Allowed upload file types'),
('increment.auto_apply', 'false',                'WORKFLOW',     'Auto-apply increments without approval'),
('approval.required',    'true',                 'WORKFLOW',     'Require approval before applying pay changes');

GO
