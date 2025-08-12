<template>
    <nav class="navbar navbar-expand-md navbar-light bg-light border-bottom sticky-top">
      <div class="container-fluid px-3">
        <a class="navbar-brand fw-semibold" href="#">UxxJournal</a>
  
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav"
                aria-controls="nav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
  
        <div id="nav" class="collapse navbar-collapse">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <RouterLink to="/" custom v-slot="{ href, navigate, isActive }">
                <a :href="href" @click="navigate" class="nav-link" :class="{ active: isActive }">Home</a>
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/entries" custom v-slot="{ href, navigate, isActive }">
                <a :href="href" @click="navigate" class="nav-link" :class="{ active: isActive }">Entries</a>
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/summaries" custom v-slot="{ href, navigate, isActive }">
                <a :href="href" @click="navigate" class="nav-link" :class="{ active: isActive }">Summaries</a>
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </template>
  