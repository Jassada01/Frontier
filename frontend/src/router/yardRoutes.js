import YardManagement from '../views/Yard/yard-management.vue'
import YardIndex from '../views/Yard/yard-index.vue'

const yardRoutes = [
  {
    path: '/Yard',
    name: 'CreateYard',
    component: YardManagement
  },
  {
    path: '/Yard/:id',
    name: 'EditYard',
    component: YardManagement,
    props: true
  },
  {
    path: '/YardIndex',
    name: 'YardIndex',
    component: YardIndex
  }
]

export default yardRoutes
