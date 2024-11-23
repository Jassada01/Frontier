const db = require("../config/dbConfig");

exports.createGroupWithMembers = (req, res) => {
  const { group_name, group_image, notes, created_by, members } = req.body;

  db.beginTransaction((err) => {
    if (err) {
      return res
        .status(500)
        .send({ message: "Error starting transaction", error: err });
    }

    db.query(
      `INSERT INTO line_customer_id_group (group_name, group_image, notes, created_by) VALUES (?, ?, ?, ?)`,
      [group_name, group_image, notes, created_by],
      (err, groupResult) => {
        if (err) {
          return db.rollback(() => {
            res
              .status(500)
              .send({ message: "Error creating group", error: err });
          });
        }

        const group_id = groupResult.insertId;
        const memberValues = members.map((member) => [
          group_id,
          member
        ]);

        db.query(
          `INSERT INTO line_group_members (group_id, line_user_id) VALUES ?`,
          [memberValues],
          (err) => {
            if (err) {
              return db.rollback(() => {
                res
                  .status(500)
                  .send({ message: "Error adding group members", error: err });
              });
            }

            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).send({
                    message: "Error committing transaction",
                    error: err,
                  });
                });
              }
              res.send({
                message: "Group and members created successfully",
                group_id: group_id,
              });
            });
          }
        );
      }
    );
  });
};

exports.getGroupsWithMembers = (req, res) => {
  const { group_id } = req.query;

  let query = `
    SELECT 
      g.group_id,
      g.group_name,
      g.group_image,
      g.notes,
      g.created_by,
      g.created_at,
      g.updated_at,
      m.line_user_id,
      u.display_name,
      u.picture_url,
      u.user_type,
      u.name,
      u.company_name
    FROM line_customer_id_group g
    LEFT JOIN line_group_members m ON g.group_id = m.group_id
    LEFT JOIN line_user_profiles u ON m.line_user_id = u.line_user_id
  `;

  let params = [];

  if (group_id) {
    query += ` WHERE g.group_id = ?`;
    params.push(group_id);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      return res
        .status(500)
        .send({ message: "Error retrieving group information", error: err });
    }

    // Group the results by group_id
    const groupedResults = results.reduce((acc, row) => {
      if (!acc[row.group_id]) {
        acc[row.group_id] = {
          group_id: row.group_id,
          group_name: row.group_name,
          group_image: row.group_image,
          notes: row.notes,
          created_by: row.created_by,
          created_at: row.created_at,
          updated_at: row.updated_at,
          members: [],
        };
      }

      if (row.line_user_id) {
        acc[row.group_id].members.push({
          line_user_id: row.line_user_id,
          display_name: row.display_name,
          picture_url: row.picture_url,
          user_type: row.user_type,
          name: row.name,
          company_name: row.company_name
        });
      }

      return acc;
    }, {});

    // Convert the grouped results object to an array
    const formattedResults = Object.values(groupedResults);

    res.send(group_id ? formattedResults[0] : formattedResults);
  });
};

exports.updateGroupAndMembers = (req, res) => {
  const { group_id } = req.params;
  const { group_name, group_image, notes, members } = req.body;

  db.beginTransaction((err) => {
    if (err) {
      return res
        .status(500)
        .send({ message: "Error starting transaction", error: err });
    }

    db.query(
      `UPDATE line_customer_id_group SET group_name = ?, group_image = ?, notes = ? WHERE group_id = ?`,
      [group_name, group_image, notes, group_id],
      (err) => {
        if (err) {
          return db.rollback(() => {
            res
              .status(500)
              .send({ message: "Error updating group", error: err });
          });
        }

        db.query(
          `DELETE FROM line_group_members WHERE group_id = ?`,
          [group_id],
          (err) => {
            if (err) {
              return db.rollback(() => {
                res
                  .status(500)
                  .send({ message: "Error removing old members", error: err });
              });
            }

            if (members && members.length > 0) {
              const memberValues = members.map((member) => [group_id, member]);
              db.query(
                `INSERT INTO line_group_members (group_id, line_user_id) VALUES ?`,
                [memberValues],
                (err) => {
                  if (err) {
                    return db.rollback(() => {
                      res.status(500).send({
                        message: "Error adding new members",
                        error: err,
                      });
                    });
                  }

                  db.commit((err) => {
                    if (err) {
                      return db.rollback(() => {
                        res.status(500).send({
                          message: "Error committing transaction",
                          error: err,
                        });
                      });
                    }
                    res.send({
                      message: "Group and members updated successfully",
                    });
                  });
                }
              );
            } else {
              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).send({
                      message: "Error committing transaction",
                      error: err,
                    });
                  });
                }
                res.send({
                  message: "Group updated and all members removed successfully",
                });
              });
            }
          }
        );
      }
    );
  });
};

exports.deleteGroupAndMembers = (req, res) => {
  const { group_id } = req.params;

  db.query(
    `DELETE FROM line_customer_id_group WHERE group_id = ?`,
    [group_id],
    (err, results) => {
      if (err) {
        return res
          .status(500)
          .send({ message: "Error deleting group and members", error: err });
      }
      if (results.affectedRows === 0) {
        return res.status(404).send({ message: "Group not found" });
      }
      res.send({
        message: "Group and all associated members deleted successfully",
      });
    }
  );
};