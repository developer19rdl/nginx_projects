/* eslint-disable no-console */
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const env = require('../../config/env');
const { PERMISSIONS, ROLES } = require('../../config/constants');

async function seed() {
  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
  });

  try {
    // Permissions
    for (const code of Object.values(PERMISSIONS)) {
      const module = code.split('.')[0];
      await connection.query(
        `INSERT INTO permissions (permission_code, module) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE module = VALUES(module)`,
        [code, module]
      );
    }

    // Roles
    const roleDefs = [
      { code: ROLES.ADMIN, name: 'Administrator', perms: Object.values(PERMISSIONS) },
      {
        code: ROLES.PLANNER,
        name: 'Production Planner',
        perms: [
          PERMISSIONS.PRODUCTION_PLAN_VIEW,
          PERMISSIONS.PRODUCTION_PLAN_IMPORT,
          PERMISSIONS.PRODUCTION_PLAN_MANAGE,
          PERMISSIONS.MACHINE_VIEW,
          PERMISSIONS.SHIFT_VIEW,
          PERMISSIONS.PLANNING_AUTO,
          PERMISSIONS.PLANNING_MANUAL,
          PERMISSIONS.PLANNING_CONFIRM,
          PERMISSIONS.PLANNING_VIEW,
          PERMISSIONS.PLANNING_PRODUCE,
          PERMISSIONS.DASHBOARD_VIEW,
          PERMISSIONS.DOWNTIME_VIEW,
          PERMISSIONS.CHECKLIST_VIEW,
        ],
      },
      {
        code: ROLES.SUPERVISOR,
        name: 'Production Supervisor',
        perms: [
          PERMISSIONS.PRODUCTION_PLAN_VIEW,
          PERMISSIONS.MACHINE_VIEW,
          PERMISSIONS.SHIFT_VIEW,
          PERMISSIONS.PLANNING_VIEW,
          PERMISSIONS.DASHBOARD_VIEW,
          PERMISSIONS.DOWNTIME_VIEW,
          PERMISSIONS.CHECKLIST_VIEW,
          PERMISSIONS.QUALITY_VIEW,
          PERMISSIONS.INVENTORY_VIEW,
        ],
      },
      {
        code: ROLES.OPERATOR,
        name: 'Machine Operator',
        perms: [
          PERMISSIONS.PLANNING_VIEW,
          PERMISSIONS.MACHINE_VIEW,
          PERMISSIONS.PLANNING_PRODUCE,
          PERMISSIONS.DOWNTIME_VIEW,
          PERMISSIONS.DOWNTIME_LOG,
          PERMISSIONS.CHECKLIST_VIEW,
          PERMISSIONS.CHECKLIST_LOG,
        ],
      },
      {
        code: ROLES.VIEWER,
        name: 'Viewer',
        perms: [PERMISSIONS.PRODUCTION_PLAN_VIEW, PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.PLANNING_VIEW],
      },
      {
        code: ROLES.QUALITY,
        name: 'Quality Engineer',
        perms: [
          PERMISSIONS.QUALITY_VIEW,
          PERMISSIONS.QUALITY_INSPECT,
          PERMISSIONS.QUALITY_MANAGE,
          PERMISSIONS.MACHINE_VIEW,
          PERMISSIONS.PLANNING_VIEW,
          PERMISSIONS.DASHBOARD_VIEW,
          PERMISSIONS.INVENTORY_VIEW,
          PERMISSIONS.INVENTORY_MANAGE,
        ],
      },
    ];

    for (const role of roleDefs) {
      await connection.query(
        `INSERT INTO roles (role_code, role_name) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE role_name = VALUES(role_name)`,
        [role.code, role.name]
      );
      const [[roleRow]] = await connection.query('SELECT id FROM roles WHERE role_code = ?', [role.code]);
      for (const permCode of role.perms) {
        const [[permRow]] = await connection.query('SELECT id FROM permissions WHERE permission_code = ?', [permCode]);
        if (!permRow) continue;
        await connection.query(
          `INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`,
          [roleRow.id, permRow.id]
        );
      }
    }

    // Admin user
    const [[adminRole]] = await connection.query('SELECT id FROM roles WHERE role_code = ?', [ROLES.ADMIN]);
    const passwordHash = await bcrypt.hash(env.seedAdmin.password, 10);
    await connection.query(
      `INSERT INTO users (full_name, email, password_hash, role_id, status)
       VALUES ('System Administrator', ?, ?, ?, 'Active')
       ON DUPLICATE KEY UPDATE password_hash = password_hash`,
      [env.seedAdmin.email, passwordHash, adminRole.id]
    );

    // Shifts (A/B/C, C crosses midnight)
    const shifts = [
      { code: 'A', name: 'Shift A', start: '06:00:00', end: '14:00:00', crosses: 0, breakMin: 30, hours: 7.5 },
      { code: 'B', name: 'Shift B', start: '14:00:00', end: '22:00:00', crosses: 0, breakMin: 30, hours: 7.5 },
      { code: 'C', name: 'Shift C', start: '22:00:00', end: '06:00:00', crosses: 1, breakMin: 30, hours: 7.5 },
    ];
    for (const s of shifts) {
      await connection.query(
        `INSERT INTO shifts (shift_code, shift_name, start_time, end_time, crosses_midnight, break_duration_minutes, total_working_hours)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE shift_name = VALUES(shift_name)`,
        [s.code, s.name, s.start, s.end, s.crosses, s.breakMin, s.hours]
      );
    }

    console.log('Seed complete.');
    console.log(`Admin login: ${env.seedAdmin.email} / (password from SEED_ADMIN_PASSWORD env var)`);
  } finally {
    await connection.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
