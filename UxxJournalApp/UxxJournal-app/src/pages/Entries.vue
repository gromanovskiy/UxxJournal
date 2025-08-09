<script setup>
import { ref, onMounted, watch } from 'vue'
import { supabase } from '../lib/supabase'

const PAGE_SIZE   = 10
const currentPage = ref(0)
const entries     = ref([])
const selected    = ref(null)
const searchTerm  = ref('')
const loading     = ref(false)
const errorMsg    = ref('')
const notes   = ref([])
const newNote = ref('')

// reusable fetch -----------------------------------------------------------
async function loadPage (page = 0) {
  loading.value = true; errorMsg.value = ''
  const from = page * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  // base query
  let q = supabase
    .from('journal_entries')
    .select('id, created_at, body_text')
    .order('created_at', { ascending: false })
    .range(from, to)

  // optional search filter (case-insensitive)
  if (searchTerm.value.trim()) {
    q = q.ilike('body_text', `%${searchTerm.value.trim()}%`)
  }

  const { data, error } = await q
  if (error) errorMsg.value = error.message
  else {
    entries.value  = data
    selected.value = data[0] ?? null
    currentPage.value = page
  }
  loading.value = false
}

async function deleteEntry (row) {
  if (!confirm('Delete this entry?')) return
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', row.id)
  if (error) alert(error.message)
  else       loadPage(currentPage.value)   // refresh
}

async function loadNotes(entryId) {
  const { data } = await supabase
    .from('entry_notes')
    .select('id, created_at, note_text')
    .eq('entry_id', entryId)
    .order('created_at', { ascending: false })
  notes.value = data ?? []
}

async function saveNote() {
  if (!newNote.value.trim() || !selected.value) return
  await supabase.from('entry_notes').insert({
    entry_id: selected.value.id,
    note_text: newNote.value,
    // user_id auto-filled by default = auth.uid()
  })
  newNote.value = ''
  loadNotes(selected.value.id)
}

watch(selected, (row) => {
  if (row) loadNotes(row.id)
})

// initial fetch
onMounted(() => loadPage(0))
</script>

<template>
  <h2 class="h4 mb-3">All entries</h2>

  <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

  <!-- search bar -->
  <div class="input-group mb-3">
    <input
      v-model="searchTerm"
      @keyup.enter="loadPage(0)"
      type="text"
      class="form-control"
      placeholder="Search text…"
    />
    <button class="btn btn-outline-secondary" @click="loadPage(0)">Search</button>
    <button
      v-if="searchTerm"
      class="btn btn-outline-secondary"
      title="Clear"
      @click="searchTerm=''; loadPage(0)"
    >×</button>
  </div>

  <!-- two-column grid -->
  <div class="row" v-if="!loading">
    <!-- list column -->
    <div class="col-md-4 border-end" style="max-height:70vh; overflow:auto">
      <ul class="list-group">
        <li
          v-for="row in entries"
          :key="row.id"
          class="list-group-item list-group-item-action d-flex justify-content-between align-items-start"
          :class="{ active: selected && selected.id===row.id }"
          @click="selected=row"
        >
          <span>{{ new Date(row.created_at).toLocaleString() }}</span>
          <button
            class="btn btn-sm btn-outline-danger"
            @click.stop="deleteEntry(row)"
          >🗑</button>
        </li>
      </ul>

      <!-- pagination -->
      <div class="d-flex justify-content-between mt-2">
        <button
          class="btn btn-outline-secondary btn-sm"
          :disabled="currentPage===0"
          @click="loadPage(currentPage-1)"
        >Prev</button>

        <button
          class="btn btn-outline-secondary btn-sm"
          :disabled="entries.length < PAGE_SIZE"
          @click="loadPage(currentPage+1)"
        >Next</button>
      </div>
    </div>

    <!-- body viewer -->
    <div class="col-md-8">
      <div v-if="selected">
        <h5>{{ new Date(selected.created_at).toLocaleString() }}</h5>
        <pre class="mt-3 p-3 bg-light border rounded">{{ selected.body_text }}</pre>
        <hr>
        <h6>Add note</h6>
        <div class="input-group mb-2">
        <textarea v-model="newNote" rows="2" class="form-control"
                    placeholder="Write a note…"/>
        </div>
        <button class="btn btn-sm btn-primary mb-3" @click="saveNote">Save note</button>

        <ul class="list-group">
        <li v-for="n in notes" :key="n.id" class="list-group-item py-1">
            <small class="text-muted">{{ new Date(n.created_at).toLocaleString() }}</small>
            <br>{{ n.note_text }}
        </li>
        </ul>

      </div>
      <p v-else class="text-muted">No entry selected.</p>
    </div>
  </div>

  <div v-else class="text-center py-5">
    <div class="spinner-border" />
  </div>
</template>
