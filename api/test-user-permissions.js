require("dotenv").config();
const db = require("./config/database");

async function testUserPermissions() {
  try {
    console.log("Testing user permissions...\n");

    // Get the physician user (username: physician)
    const [users] = await db.execute(
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.is_active,
              GROUP_CONCAT(DISTINCT r.name) as roles,
              GROUP_CONCAT(DISTINCT rp.permission) as permissions
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       LEFT JOIN role_permissions rp ON r.id = rp.role_id
       WHERE u.username = 'doctor' AND u.deleted_at IS NULL
       GROUP BY u.id`,
    );

    if (users.length === 0) {
      console.log("❌ Physician user not found!");
      process.exit(1);
    }

    const user = users[0];
    console.log("User:", user.username);
    console.log("Roles:", user.roles);
    console.log("Permissions:", user.permissions);
    console.log("\nParsed:");
    console.log("Roles array:", user.roles ? user.roles.split(",") : []);
    console.log(
      "Permissions array:",
      user.permissions ? user.permissions.split(",") : [],
    );

    const permissions = user.permissions ? user.permissions.split(",") : [];
    const hasViewPrescriptions = permissions.includes("view_prescriptions");
    console.log("\nHas 'view_prescriptions'?", hasViewPrescriptions);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testUserPermissions();
