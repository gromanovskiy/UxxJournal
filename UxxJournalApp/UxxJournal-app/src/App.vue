<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from './lib/supabase';
import AppShell from './components/AppShell.vue'

// reactive state
const bodyText = ref('');
const entries  = ref([]);

// 1️⃣ make sure we’re logged in (magic-link prompt if not)
async function ensureLogin () {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return;

  const email = prompt('Enter your email for a magic-link login');
  if (!email) return;
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) alert(error.message);
  else      alert('Check your email, click the link, then come back here.');
}

// 2️⃣ pull the 10 newest entries
async function fetchEntries () {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('id, created_at, body_text')
    .order('created_at', { ascending: false })
    .limit(10);
  if (!error) entries.value = data;
}

// 3️⃣ insert a new row
async function saveEntry () {
  if (!bodyText.value.trim()) return;
  const { error } = await supabase.from('journal_entries').insert({
    body_text: bodyText.value,
    tags: ['quick-test']
  });
  if (error) return alert(error.message);

  bodyText.value = '';
  fetchEntries();
}

// run on first render
onMounted(async () => {
  await ensureLogin();
  fetchEntries();
});
</script>

<template>
  <AppShell>
    <RouterView />
  </AppShell>
</template>
