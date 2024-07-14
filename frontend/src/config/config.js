const CONFIG = {
  SYSTEM_NAME: 'Giraffe Container', // System Name
  APP_PORT: 5127, //App port
  //API_SERVER: 'http://localhost:3000', // API Server
  //API_SERVER: 'https://giraffe-container.app', // REAL
  API_SERVER: 'http://192.168.1.53:3000', // API Server

  // Master Variable
  CONTAINE_SIZE: [
    "20 GP",
    "40 GP",
    "40' HC",
    "45'",
    'LCL',
    'วางพื้น',
    "20' FR",
    "40' FR",
    "20' RF",
    "40' RF",
    "20' OT",
    "40' OT",
    'OOG'
  ],

  CONTAINE_COLOR: [
    { name: 'Red(แดง)', color: '#FF0000' },
    { name: 'Green(เขียว)', color: '#00FF00' },
    { name: 'Blue(น้ำเงิน)', color: '#0000FF' },
    { name: 'Yellow(เหลือง)', color: '#FFFF00' },
    { name: 'Black(ดำ)', color: '#000000' },
    { name: 'White(ขาว)', color: '#FFFFFF' },
    { name: 'Orange(ส้ม)', color: '#FFA500' },
    { name: 'Purple(ม่วง)', color: '#800080' },
    { name: 'Pink(ชมพู)', color: '#FFC0CB' },
    { name: 'Gray(เทา)', color: '#808080' },
    { name: 'Brown(น้ำตาล)', color: '#A52A2A' },
    { name: 'Cyan(ฟ้า)', color: '#00FFFF' },
    { name: 'Magenta(ม่วงแดง)', color: '#FF00FF' }
  ]
}

export default CONFIG
