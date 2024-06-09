import ZoneManagement from '../views/Zone/zone-management.vue'
import ZoneIndex from '../views/Zone/zone-index.vue'

const zoneRoutes = [
  {
    path: '/Zone',
    name: 'CreateZone',
    component: ZoneManagement
  },
  {
    path: '/Zone/:id',
    name: 'EditZone',
    component: ZoneManagement,
    props: true
  },
  {
    path: '/ZoneIndex',
    name: 'ZoneIndex',
    component: ZoneIndex
  }
]

export default zoneRoutes
