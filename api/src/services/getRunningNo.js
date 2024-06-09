const db = require('../config/dbConfig');
const moment = require('moment');

function getRunningNo(running_type, running_prefix, date) {
  return new Promise((resolve, reject) => {
    // Running Digit
    const leadZerodigit = 3;

    // แยกปีและเดือนจากวันที่
    const running_year = moment(date).format('YYYY');
    const running_month = moment(date).format('MM');

    // กำหนดค่าตัวแปร
    let last_running_no = 0;

    // ค้นหา last running no จากตาราง system_running_no
    const selectQuery = `SELECT last_running_no FROM system_running_no WHERE running_type=? AND running_prefix=? AND running_year=? AND running_month=?`;

    db.query(selectQuery, [running_type, running_prefix, running_year, running_month], (err, results) => {
      if (err) {
        return reject(err);
      }

      if (results.length > 0) {
        last_running_no = results[0].last_running_no;
      } else {
        // ถ้าไม่พบในตาราง ให้เพิ่มข้อมูลลงในตาราง
        const insertQuery = `INSERT INTO system_running_no (running_type, running_prefix, running_year, running_month, last_document_no, last_running_no) VALUES (?, ?, ?, ?, 0, 0)`;
        db.query(insertQuery, [running_type, running_prefix, running_year, running_month], (err, result) => {
          if (err) {
            return reject(err);
          }
        });
      }

      // สร้างเลขที่รันรหัสใหม่
      last_running_no++;
      const document_no = `${running_prefix}${running_year}${running_month}${String(last_running_no).padStart(leadZerodigit, '0')}`;

      // อัพเดท last running no ในตาราง system_running_no
      const updateQuery = `UPDATE system_running_no SET last_document_no=?, last_running_no=? WHERE running_type=? AND running_prefix=? AND running_year=? AND running_month=?`;
      db.query(updateQuery, [document_no, last_running_no, running_type, running_prefix, running_year, running_month], (err, result) => {
        if (err) {
          return reject(err);
        }

        // คืนค่าเลขที่รันรหัสใหม่
        resolve(document_no);
      });
    });
  });
}

module.exports = { getRunningNo };
