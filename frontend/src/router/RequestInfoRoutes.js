import requestReturnIndex from '../views/RequestInfo/requestReturn-Index.vue'
import requestReceiveIndex from '../views/RequestInfo/requestReceive-Index.vue'

const RequestInfoRoutes = [
  {
    path: '/RequestReturnIndex',
    name: 'requestReturnIndex',
    component: requestReturnIndex
  },
  {
    path: '/RequestReceiveIndex',
    name: 'requestReceiveIndex',
    component: requestReceiveIndex
  }
]

export default RequestInfoRoutes
