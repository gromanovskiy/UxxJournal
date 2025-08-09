<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'   // ← adjust the path if needed

// reactive state
const bodyText = ref('')
const entries  = ref([])

// --- auth helper -----------------------------------------------------------
async function ensureLogin () {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) return                        // already logged in

  const email = prompt('Enter your email for a magic-link login')
  if (!email) return
  const { error } = await supabase.auth.signInWithOtp({ email })
  if (error) alert(error.message)
  else       alert('Check your email, click the link, then return here.')
}

// --- DB helpers ------------------------------------------------------------
async function fetchEntries () {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('id, created_at, body_text')
    .order('created_at', { ascending: false })
    .limit(10)
  if (!error) entries.value = data
}

async function saveEntry () {
  if (!bodyText.value.trim()) return
  const { error } = await supabase.from('journal_entries').insert({
    body_text: bodyText.value,
    tags: ['quick-test']
  })
  if (error) { alert(error.message); return }

  bodyText.value = ''
  fetchEntries()
}

// kick off login + first pull
onMounted(async () => {
  await ensureLogin()
  fetchEntries()
})
</script>

<template>
  <h1 class="display-4 mb-4 text-center">My Journal</h1>

  <div class="mb-3">
    <textarea
      v-model="bodyText"
      class="form-control"
      rows="4"
      placeholder="Write something…"
    />
  </div>

  <button class="btn btn-primary" @click="saveEntry">Save</button>

  <h2 class="h4 mt-5">Last 10 entries</h2>
  <ul class="list-group">
    <li
      v-for="e in entries"
      :key="e.id"
      class="list-group-item"
    >
      <strong>{{ new Date(e.created_at).toLocaleString() }}:</strong>
      {{ e.body_text.slice(0, 120) }}<span v-if="e.body_text.length > 120">…</span>
    </li>
  </ul>
</template>

<style scoped>
/* optional tweaks */
</style>
