import Swal from 'sweetalert2'

export const requiredFields = ['entry_type', 'receipt_no', 'date', 'container']

export const checkRequiredFields = (receipt) => {
  for (const field of requiredFields) {
    if (!receipt[field]) {
      Swal.fire('Error', `กรุณากรอกข้อมูลให้ครบถ้วน`, 'error')
      return false
    }
  }
  if (receipt.equipment_conditions.length === 0) {
    Swal.fire('Error', 'กรุณาเพิ่มข้อมูลสภาพอุปกรณ์', 'error')
    return false
  }
  return true
}
