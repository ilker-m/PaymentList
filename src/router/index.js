import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import PaymentList from '../components/PaymentList.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: PaymentList,
    meta: { requiresAuth: true }
  },
  {
    path: '/payment-list',
    name: 'PaymentList',
    component: PaymentList,
    meta: { requiresAuth: true }
  },
  {
    path: '/create-payment-list',
    name: 'CreatePaymentList',
    component: () => import('../components/CreatePaymentList.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null')
  
  if (to.meta.requiresAuth && !user) {
    next('/login')
  } else if (to.path === '/login' && user) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router 