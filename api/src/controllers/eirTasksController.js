const db = require("../config/dbConfig");

// Get tasks by EIR ID
exports.getTasksByEIR = (req, res) => {
  const { eir_id } = req.query;



  if (!eir_id) {
    return res.status(400).send({ message: "EIR ID is required" });
  }

  const query = `SELECT * FROM eir_tasks WHERE eir_id = ?`;
  db.query(query, [eir_id], (err, results) => {
    if (err) {
      return res
        .status(500)
        .send({ message: "Error retrieving tasks", error: err });
    }

    // ส่งกลับ [] หากไม่พบผลลัพธ์
    res.send(results.length ? results : []);
  });
};

// Add multiple tasks
exports.addTasks = (req, res) => {
  const { tasks } = req.body; // รับเป็น array ของ tasks

  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return res
      .status(400)
      .send({ message: "Tasks array is required and cannot be empty" });
  }

  // สร้าง query และ parameters สำหรับ Batch Insert
  const query = `
    INSERT INTO eir_tasks (eir_id, task_name, task_details) 
    VALUES ${tasks.map(() => "(?, ?, ?)").join(", ")}
  `;
  const params = tasks.flatMap((task) => [
    task.eir_id,
    task.task_name,
    task.task_details,
  ]);

  db.query(query, params, (err, results) => {
    if (err) {
      res.status(500).send({ message: "Error adding tasks", error: err });
      return;
    }
    res.send({
      message: "Tasks added successfully",
      inserted_count: results.affectedRows,
    });
  });
};

// Update a task
exports.updateTask = (req, res) => {
  const { task_id } = req.params;
  const { task_name, task_details, complete_datetime, cancel_flag } = req.body;

  if (!task_id) {
    return res.status(400).send({ message: "Task ID is required" });
  }

  const query = `
    UPDATE eir_tasks 
    SET 
      task_name = ?, 
      task_details = ?, 
      complete_datetime = ?, 
      cancel_flag = ?
    WHERE task_id = ?
  `;
  const params = [
    task_name,
    task_details,
    complete_datetime,
    cancel_flag,
    task_id,
  ];

  db.query(query, params, (err, results) => {
    if (err) {
      res.status(500).send({ message: "Error updating task", error: err });
      return;
    }
    res.send({ message: "Task updated successfully" });
  });
};

// Delete a task
exports.deleteTask = (req, res) => {
  const { task_id } = req.params;
  if (!task_id) {
    return res.status(400).send({ message: "Task ID is required" });
  }

  const query = `DELETE FROM eir_tasks WHERE task_id = ?`;
  db.query(query, [task_id], (err, results) => {
    if (err) {
      res.status(500).send({ message: "Error deleting task", error: err });
      return;
    }
    res.send({ message: "Task deleted successfully" });
  });
};


// Complete a task (update complete_datetime only)
exports.completeTask = (req, res) => {
  const { task_id } = req.params;

  if (!task_id) {
    return res.status(400).send({ message: "Task ID is required" });
  }

  const query = `
    UPDATE eir_tasks 
    SET 
      complete_datetime = CURRENT_TIMESTAMP(),
      update_datetime = CURRENT_TIMESTAMP()
    WHERE task_id = ?
  `;

  db.query(query, [task_id], (err, results) => {
    if (err) {
      return res.status(500).send({ 
        message: "Error completing task", 
        error: err 
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).send({ 
        message: "Task not found or already completed" 
      });
    }

    res.send({ 
      message: "Task completed successfully",
      complete_datetime: new Date()
    });
  });
};