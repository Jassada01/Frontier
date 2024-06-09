import DriverManagement from '../views/Driver/driver-management.vue'
import DriverIndex from '../views/Driver/driver-index.vue'

const driverRoutes = [
  {
    path: '/Driver',
    name: 'CreateDriver',
    component: DriverManagement
  },
  {
    path: '/Driver/:id',
    name: 'EditDriver',
    component: DriverManagement,
    props: true
  },
  {
    path: '/DriverIndex',
    name: 'DriverIndex',
    component: DriverIndex
  }
]

export default driverRoutes
