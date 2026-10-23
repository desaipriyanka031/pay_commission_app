# Employee Pay Fixation & Pay Commission Management System

A complete, production-ready **Employee Pay Fixation & Pay Commission Management Software** built with a **configurable Pay Commission / Rules Engine architecture** (7th Pay Commission compliant and 8th Pay Commission extensible).

## Architecture Highlights
- **Configurable Rules Engine**: Commission-agnostic core (`PayRuleEngine`, `PayCommissionService`) allowing new Pay Commissions (such as the upcoming 8th CPC) to be added dynamically without application rebuilds.
- **Transparent Calculations**: Step-by-step mathematical breakdown for every pay fixation event under FR 22(I)(a)(1), annual increments, MACP / selection grades, and pay commission revisions.
- **Auditable Workflow**: Maker-Checker approval pipeline (Draft -> Calculated -> Submitted -> Approved -> Applied) with full audit logging.
- **Due-Drawn Arrears Calculator**: Month-by-month differential calculation of Due vs Drawn Basic, DA, and HRA for retrospective pay fixation orders.
- **Interactive Pay Matrix**: Complete Level 1 to 18 matrix with smart pay lookup and historical Grade Pay references.
- **Sanction Orders Generator**: Formatted, printable Office Sanction Memorandum templates.

## Tech Stack
- **Frontend**: React.js, TypeScript, Vite, React Router, Lucide Icons, Modern Enterprise CSS
- **Backend**: Node.js, Express, TypeScript, Zod, JWT, BCrypt, MSSQL
- **Database**: Microsoft SQL Server / Relational Schema
