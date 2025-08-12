<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import DictationButton from '../components/DictationButton.vue'

const bodyText = ref('')
const entries  = ref([])

async function fetchEntries () {
  const { data } = await supabase
    .from('journal_entries')
    .select('id, created_at, body_text')
    .order('created_at', { ascending: false })
    .limit(10)
  entries.value = data ?? []
}

async function saveEntry () {
  if (!bodyText.value.trim()) return
  const { error } = await supabase
    .from('journal_entries')
    .insert({ body_text: bodyText.value, tags: ['manual-or-voice'] })
  if (error) return alert(error.message)
  bodyText.value = ''
  fetchEntries()
}

function appendFromDictation(text) {
  if (!text) return
  bodyText.value += (bodyText.value ? '\n' : '') + text
}

onMounted(fetchEntries)
</script>

<template>
  <h1 class="display-4 mb-4 text-center">My Journal</h1>

  <div class="mb-3">
    <textarea v-model="bodyText" class="form-control" rows="4"
              placeholder="Write something… or use Dictate"/>
  </div>

  <div class="d-flex gap-2">
    <button class="btn btn-primary" @click="saveEntry">Save</button>
    <DictationButton @text="appendFromDictation" />
    <RouterLink to="/conversation" class="btn btn-outline-secondary">🗣️ Conversation</RouterLink>
  </div>

  <h2 class="h4 mt-5">Last 10 entries</h2>
  <ul class="list-group">
    <li v-for="e in entries" :key="e.id" class="list-group-item">
      <strong>{{ new Date(e.created_at).toLocaleString() }}:</strong>
      {{ e.body_text.slice(0, 120) }}<span v-if="e.body_text.length>120">…</span>
    </li>
  </ul>
</template>
