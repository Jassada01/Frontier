import EIRManagement from '../views/EIR/EIR-management.vue'
import EIRPDF from '../views/EIR/EID-PDF.vue'
import EIRIndex from '../views/EIR/EIR-index.vue'

const EIRRoutes = [
  {
    path: '/EIR',
    name: 'CreateEIR',
    component: EIRManagement
  },
  {
    path: '/EIR/:id',
    name: 'EditEIR',
    component: EIRManagement,
    props: true
  },{
    path: '/EIRPDF',
    name: 'EIRPDF',
    component: EIRPDF,
    props: true
  },
  
  {
    path: '/EIRIndex',
    name: 'EIRIndex',
    component: EIRIndex
  }
]

export default EIRRoutes
