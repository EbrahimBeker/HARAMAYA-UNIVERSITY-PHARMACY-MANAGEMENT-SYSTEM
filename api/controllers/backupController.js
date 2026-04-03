const db = require("../config/database");
const fs = require("fs").promises;
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

exports.createBackup = async (req, res, next) => {
  try {
    const { backup_type = "Full", description } = req.body;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupName = `pharmacy_backup_${timestamp}.sql`;
    const backupPath = path.join(process.cwd(), "backups", backupName);

    // Ensure backups directory exists
    await fs.mkdir(path.dirname(backupPath), { recursive: true });

    // Create MySQL dump
    const dbConfig = {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "haramaya_pharmacy",
    };

    const dumpCommand = `mysqldump -h ${dbConfig.host} -u ${dbConfig.user} ${dbConfig.password ? `-p${dbConfig.password}` : ""} ${dbConfig.database} > "${backupPath}"`;

    await execAsync(dumpCommand);

    // Get file size
    const stats = await fs.stat(backupPath);
    const backupSize = stats.size;

    // Record backup in database
    const [result] = await db.execute(
      `INSERT INTO system_backups (backup_name, backup_path, backup_size, backup_type, status, created_by, completed_at)
       VALUES (?, ?, ?, ?, 'Completed', ?, NOW())`,
      [backupName, backupPath, backupSize, backup_type, req.user.id],
    );

    res.status(201).json({
      message: "Backup created successfully",
      backup: {
        id: result.insertId,
        name: backupName,
        size: backupSize,
        type: backup_type,
        created_at: new Date(),
      },
    });
  } catch (error) {
    // Update backup status to failed if record exists
    try {
      await db.execute(
        'UPDATE system_backups SET status = "Failed" WHERE backup_name = ?',
        [backupName],
      );
    } catch (updateError) {
      console.error("Failed to update backup status:", updateError);
    }
    next(error);
  }
};

exports.getBackups = async (req, res, next) => {
  try {
    const [backups] = await db.execute(
      `SELECT sb.*, CONCAT(u.first_name, ' ', u.last_name) as created_by_name
       FROM system_backups sb
       LEFT JOIN users u ON sb.created_by = u.id
       ORDER BY sb.created_at DESC`,
    );

    res.json({
      data: backups,
    });
  } catch (error) {
    next(error);
  }
};

exports.restoreBackup = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get backup details
    const [backups] = await db.execute(
      'SELECT * FROM system_backups WHERE id = ? AND status = "Completed"',
      [id],
    );

    if (backups.length === 0) {
      return res
        .status(404)
        .json({ message: "Backup not found or not completed" });
    }

    const backup = backups[0];

    // Check if backup file exists
    try {
      await fs.access(backup.backup_path);
    } catch (error) {
      return res.status(404).json({ message: "Backup file not found on disk" });
    }

    // Restore database
    const dbConfig = {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "haramaya_pharmacy",
    };

    const restoreCommand = `mysql -h ${dbConfig.host} -u ${dbConfig.user} ${dbConfig.password ? `-p${dbConfig.password}` : ""} ${dbConfig.database} < "${backup.backup_path}"`;

    await execAsync(restoreCommand);

    res.json({
      message: "Database restored successfully",
      backup_name: backup.backup_name,
      restored_at: new Date(),
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteBackup = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get backup details
    const [backups] = await db.execute(
      "SELECT * FROM system_backups WHERE id = ?",
      [id],
    );

    if (backups.length === 0) {
      return res.status(404).json({ message: "Backup not found" });
    }

    const backup = backups[0];

    // Delete file from disk
    try {
      await fs.unlink(backup.backup_path);
    } catch (error) {
      console.warn("Backup file not found on disk:", backup.backup_path);
    }

    // Delete record from database
    await db.execute("DELETE FROM system_backups WHERE id = ?", [id]);

    res.json({
      message: "Backup deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.downloadBackup = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get backup details
    const [backups] = await db.execute(
      'SELECT * FROM system_backups WHERE id = ? AND status = "Completed"',
      [id],
    );

    if (backups.length === 0) {
      return res.status(404).json({ message: "Backup not found" });
    }

    const backup = backups[0];

    // Check if file exists
    try {
      await fs.access(backup.backup_path);
    } catch (error) {
      return res.status(404).json({ message: "Backup file not found" });
    }

    res.download(backup.backup_path, backup.backup_name);
  } catch (error) {
    next(error);
  }
};
