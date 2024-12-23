<template>
  <BaseDropdown
    :items="games"
    placeholder="Search games..."
    @update:modelValue="(item: Game) => selectGame(item)"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Game } from './data/Speedrun'
import BaseDropdown from './BaseDropdown.vue'
import axios from 'axios'

const games = ref<Game[]>([])

const emit = defineEmits<{
  (e: 'game-selected', game: Game): void
}>()

const fetchGames = async () => {
  try {
    const response = await axios.get('/api/games')
    games.value = response.data.details
  } catch (error) {
    console.error('Error fetching games:', error)
  }
}

const selectGame = (game: Game) => {
  emit('game-selected', game)
}

onMounted(() => {
  fetchGames()
})
</script>
