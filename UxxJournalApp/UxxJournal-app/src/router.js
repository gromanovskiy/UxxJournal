// src/router.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import EntriesView from '@/views/EntriesView.vue'
import SummariesView from '@/views/SummariesView.vue'
import ConversationView from '@/views/ConversationView.vue'  // <-- add this

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/entries', name: 'entries', component: EntriesView },
    { path: '/summaries', name: 'summaries', component: SummariesView },
    { path: '/conversation', name: 'conversation', component: ConversationView }, // <-- add this
  ],
  scrollBehavior: () => ({ top: 0 }),
})
