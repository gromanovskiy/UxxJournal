<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const isRecording = ref(false)
const isBusy      = ref(false)
const err         = ref('')
let mediaStream   = null
let recorder      = null
let chunks        = []

const emit = defineEmits(['text'])

async function start() {
  err.value = ''
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm'
    recorder = new MediaRecorder(mediaStream, { mimeType: mime })
    chunks = []
    recorder.ondataavailable = e => e.data?.size && chunks.push(e.data)
    recorder.onstop = onStop
    recorder.start()
    isRecording.value = true
  } catch (e) {
    err.value = e?.message || 'Microphone access denied'
  }
}

async function stop() {
  try { recorder && recorder.state === 'recording' && recorder.stop() } catch {}
  try { mediaStream && mediaStream.getTracks().forEach(t => t.stop()) } catch {}
  isRecording.value = false
}

async function onStop() {
  const blob = new Blob(chunks, { type: recorder?.mimeType || 'audio/webm' })
  chunks = []
  isBusy.value = true
  err.value = ''

  try {
    // require sign-in
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { throw new Error('Please sign in first.'); }

    const form = new FormData()
    form.append('file', blob, 'note.webm')

    // Call Edge Function using Supabase client (handles URL/headers/CORS)
    const { data, error } = await supabase.functions.invoke('transcribe', {
      body: form,
      headers: { Authorization: `Bearer ${session.access_token}` }, // extra-safe
    })

    if (error) throw error
    emit('text', data?.text || '')
  } catch (e) {
    err.value = e?.message || 'Transcription failed.'
  } finally {
    isBusy.value = false
  }
}
</script>

<template>
  <div class="d-inline-block">
    <button
      v-if="!isRecording"
      class="btn btn-outline-secondary"
      :disabled="isBusy"
      @click="start"
      title="Dictate with microphone"
    >🎙️ Dictate</button>

    <button
      v-else
      class="btn btn-danger"
      :disabled="isBusy"
      @click="stop"
      title="Stop & Transcribe"
    >■ Stop & Transcribe</button>

    <div v-if="isRecording" class="ms-2 d-inline text-danger">● Recording…</div>
    <div v-if="isBusy" class="ms-2 d-inline text-muted">Transcribing…</div>
    <div v-if="err" class="small text-danger mt-1">{{ err }}</div>
  </div>
</template>
