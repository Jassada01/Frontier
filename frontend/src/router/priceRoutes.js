//import PriceManagement from '../views/Price/price-management.vue'
import PriceIndex from '../views/Price/price-index.vue'

const priceRoutes = [
    /*
  {
    path: '/Price',
    name: 'CreatePrice',
    component: PriceManagement
  },
  {
    path: '/Price/:id',
    name: 'EditPrice',
    component: PriceManagement,
    props: true
  },
  */
  {
    path: '/PriceIndex',
    name: 'PriceIndex',
    component: PriceIndex
  }
]

export default priceRoutes
