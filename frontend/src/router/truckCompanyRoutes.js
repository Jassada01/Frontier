import TruckCompanyManagement from '../views/TruckCompanies/truckCompany-management.vue'
import TruckCompanyIndex from '../views/TruckCompanies/truckCompany-index.vue'

const truckCompanyRoutes = [
  {
    path: '/TruckCompany',
    name: 'CreateTruckCompany',
    component: TruckCompanyManagement
  },
  {
    path: '/TruckCompany/:id',
    name: 'EditTruckCompany',
    component: TruckCompanyManagement,
    props: true
  },
  {
    path: '/TruckCompanyIndex',
    name: 'TruckCompanyIndex',
    component: TruckCompanyIndex
  }
]

export default truckCompanyRoutes
