import { ref } from 'vue'
import axios from 'axios'
import CONFIG from '../config/config'
import Swal from 'sweetalert2'
import imageCompression from 'browser-image-compression'

const isUploading = ref(false)
const generateRandomString = () => {
  const timestamp = new Date().getTime()
  const random = Math.random().toString(36).substring(2, 10)
  return `${timestamp}_${random}`
}

const resizeImage = async (file, maxSizeMB = 0.5) => {
  // ตรวจสอบว่าเป็นไฟล์รูปภาพหรือไม่
  if (!file.type.startsWith('image/')) {
    throw new Error('File is not an image')
  }

  const options = {
    maxSizeMB: maxSizeMB,
    maxWidthOrHeight: 1920, // ความกว้างหรือความสูงสูงสุด
    useWebWorker: true, // ใช้ Web Worker เพื่อไม่ให้ block main thread
    initialQuality: 0.7, // คุณภาพเริ่มต้น
    // สำหรับ PNG โดยเฉพาะ
    maxIteration: 10, // จำนวนครั้งสูงสุดในการพยายามบีบอัด
    webWorkerPath: undefined, // ถ้าต้องการกำหนด path ของ web worker เอง
    // รองรับการแปลงรูปแบบไฟล์
    fileType: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
    alwaysKeepResolution: false // false จะยอมให้ลดความละเอียดถ้าจำเป็น
  }

  try {
    // บีบอัดรูปภาพ
    const compressedFile = await imageCompression(file, options)

    // ถ้าไฟล์ที่บีบอัดใหญ่กว่าต้นฉบับ ให้ใช้ไฟล์ต้นฉบับ
    if (compressedFile.size > file.size) {
      console.log('Compressed size larger than original, using original file')
      return file
    }

    // สร้างชื่อไฟล์ใหม่พร้อมระบุขนาดที่บีบอัด
    const fileExtension = compressedFile.type === 'image/png' ? 'png' : 'jpg'
    const newFileName = `${file.name.split('.')[0]}_${generateRandomString()}_compressed.${fileExtension}`

    return new File([compressedFile], newFileName, {
      type: compressedFile.type
    })
  } catch (error) {
    console.error('Image compression failed:', error)
    throw error
  }
}

const uploadFile = async (file, type, containerIndex = null, formData) => {
  isUploading.value = true
  const uploadFormData = new FormData()

  try {
    let fileToUpload = file
    if (fileToUpload.type.startsWith('image/')) {
      // เพิ่มการตรวจสอบขนาดไฟล์ก่อนบีบอัด
      const fileSizeMB = file.size / (1024 * 1024)
      console.log(`Original file size: ${fileSizeMB.toFixed(2)} MB`)

      // ปรับ maxSizeMB ตามขนาดไฟล์ต้นฉบับ
      const maxSizeMB = fileSizeMB > 5 ? 1 : 0.3
      fileToUpload = await resizeImage(file, maxSizeMB)

      const compressedSizeMB = fileToUpload.size / (1024 * 1024)
      console.log(`Compressed file size: ${compressedSizeMB.toFixed(2)} MB`)
    }

    uploadFormData.append('file', fileToUpload)

    const response = await axios.post(
      `${CONFIG.API_SERVER}/api/upload-to-subfolder`,
      uploadFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          console.log(`Upload Progress: ${percentCompleted}%`)
        }
      }
    )

    if (response.data && response.data.fileUrl) {
      if (type === 'image' && containerIndex !== null) {
        formData.containers[containerIndex].imageUrls.push(response.data.fileUrl)
      } else if (type === 'document') {
        formData.returnDocumentUrls.push(response.data.fileUrl)
      }
      return response.data.fileUrl
    }
  } catch (error) {
    console.error('Failed to upload file:', error)
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: error.message || 'ไม่สามารถอัปโหลดไฟล์ได้'
    })
    throw error
  } finally {
    isUploading.value = false
  }
}

// Utility function สำหรับตรวจสอบขนาดและประเภทของไฟล์
const validateFile = (file, type) => {
  const maxSizeMB = type === 'image' ? 10 : 20 // 10MB for images, 20MB for documents
  const fileSizeMB = file.size / (1024 * 1024)

  if (fileSizeMB > maxSizeMB) {
    throw new Error(`ไฟล์มีขนาดใหญ่เกินไป (สูงสุด ${maxSizeMB}MB)`)
  }

  if (type === 'image' && !file.type.startsWith('image/')) {
    throw new Error('กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น')
  }

  return true
}

export { uploadFile, isUploading, validateFile }
