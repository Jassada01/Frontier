import EIRManagement from '../views/EIR/EIR-management.vue'
import EIRPDF from '../views/EIR/EID-PDF.vue'
import EIRIndex from '../views/EIR/EIR-index.vue'
import InvoiceIndex from '../views/EIR/invoice-index.vue'
import createMultiEIR from '../views/EIR/EIR-createMulti.vue'
import eirGroupView from '../views/EIR/EIR-GroupView.vue'

const EIRRoutes = [
  {
    path: '/EIR',
    name: 'CreateEIR',
    component: EIRManagement
  },
  {
    path: '/createMultiEIR',
    name: 'createMultiEIR',
    component: createMultiEIR
  },
  {
    path: '/eirGroupView/:id',  // เพิ่ม :id parameter
    name: 'eirGroupView',
    component: eirGroupView,
    props: true
  },
  {
    path: '/EIR/:id',
    name: 'EditEIR',
    component: EIRManagement,
    props: true
  },
  {
    path: '/EIRPDF',
    name: 'EIRPDF',
    component: EIRPDF,
    props: true
  },

  {
    path: '/EIRIndex',
    name: 'EIRIndex',
    component: EIRIndex
  },
  {
    path: '/InvoiceIndex',
    name: 'InvoiceIndex',
    component: InvoiceIndex
  }
]

export default EIRRoutes
