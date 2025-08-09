// src/router.js
import { createRouter, createWebHistory } from 'vue-router'

// temporary stub pages (we’ll create files for these next)
import Home      from './pages/Home.vue'
import Entries   from './pages/Entries.vue'
import Summaries from './pages/Summaries.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',          name: 'home',      component: Home },
    { path: '/entries',   name: 'entries',   component: Entries },
    { path: '/summaries', name: 'summaries', component: Summaries }
  ]
})
