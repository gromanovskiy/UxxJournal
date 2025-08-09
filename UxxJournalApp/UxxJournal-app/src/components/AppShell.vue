<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { supabase } from '../lib/supabase'

const session = ref(null)

// sign-in / sign-out helpers
const signIn  = () => supabase.auth.signInWithOAuth({ provider: 'google' })
const signOut = () => supabase.auth.signOut()

// keep session reactive
onMounted(async () => {
  const { data: { session: s } } = await supabase.auth.getSession()
  session.value = s
  supabase.auth.onAuthStateChange((_evt, newSession) => {
    session.value = newSession
  })
})
</script>

<template>
  <!-- dark navbar -->
  <nav class="navbar navbar-expand navbar-dark bg-dark">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">UxxJournal</a>

      <ul class="navbar-nav flex-row me-auto">
        <li class="nav-item me-3">
          <RouterLink class="nav-link" :to="{ name: 'home' }">Home</RouterLink>
        </li>
        <li class="nav-item me-3">
          <RouterLink class="nav-link" :to="{ name: 'entries' }">Entries</RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink class="nav-link" :to="{ name: 'summaries' }">AI Summaries</RouterLink>
        </li>
      </ul>

      <!-- auth controls -->
      <div class="d-flex">
        <button
          v-if="!session"
          class="btn btn-outline-light btn-sm"
          @click="signIn"
        >Sign in with Google</button>

        <div v-else class="d-flex align-items-center">
          <span class="text-light me-2">{{ session.user.email }}</span>
          <button
            class="btn btn-outline-light btn-sm"
            @click="signOut"
          >Sign out</button>
        </div>
      </div>
    </div>
  </nav>

  <!-- routed page body -->
  <div class="container py-4">
    <slot />
  </div>
</template>
