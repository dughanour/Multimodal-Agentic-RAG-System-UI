import { createRouter, createWebHistory } from 'vue-router'
import HomeChatView from '../views/HomeChatView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeChatView
    }
  ]
})

export default router
