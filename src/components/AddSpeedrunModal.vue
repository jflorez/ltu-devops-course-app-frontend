<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <h2>Add New Speedrun</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="game">Game:</label>
          <BaseDropdown
            v-model="selectedGame"
            :items="games"
            placeholder="Select a game"
          />
        </div>

        <div class="form-group">
          <label for="runner">Runner:</label>
          <BaseDropdown
            v-model="selectedRunner"
            :items="runners"
            placeholder="Select a runner"
          />
        </div>

        <div class="form-group">
          <label for="category">Category:</label>
          <BaseDropdown
            v-model="selectedCategory"
            :items="categories"
            placeholder="Select a category"
          />
        </div>

        <div class="form-group">
          <label for="time">Time (milliseconds):</label>
          <input
            type="number"
            id="time"
            v-model="timeMs"
            required
            min="0"
          />
        </div>

        <div class="modal-actions">
          <button type="button" class="cancel-button" @click="$emit('close')">Cancel</button>
          <button type="submit" class="submit-button">Save Speedrun</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import type { Game, User, Category, Speedrun } from './data/Speedrun';
import BaseDropdown from './BaseDropdown.vue';
import axios from 'axios';

const props = defineProps<{
  show: boolean;
  initialGame?: Game;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'speedrun-added'): void;
}>();

const games = ref<Game[]>([]);
const runners = ref<User[]>([]);
const selectedGame = ref<Game | undefined>(undefined);
const selectedRunner = ref<User | undefined>(undefined);
const timeMs = ref<number>(0);
const categories = ref<Category[]>([]);
const selectedCategory = ref<Category | undefined>(undefined);

const fetchGames = async () => {
  try {
    const response = await axios.get('/api/games');
    games.value = response.data.details;
  } catch (error) {
    console.error('Error fetching games:', error);
  }
};

const fetchRunners = async () => {
  try {
    const response = await axios.get('/api/users');
    runners.value = response.data.details;
  } catch (error) {
    console.error('Error fetching runners:', error);
  }
};

const fetchCategories = async () => {
  try {
    const response = await axios.get('/api/categories');
    categories.value = response.data.details;
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

const handleSubmit = async () => {
  if (!selectedGame.value || !selectedRunner.value || !timeMs.value || !selectedCategory.value) return;

  const speedrun: Omit<Speedrun, 'id'> = {
    game: selectedGame.value,
    runner: selectedRunner.value,
    time_ms: timeMs.value,
    date: new Date(),
    category: selectedCategory.value
  };

  try {
    await axios.post('/api/speedruns', speedrun);
    emit('speedrun-added');
    emit('close');
  } catch (error) {
    console.error('Error saving speedrun:', error);
  }
};

watch(() => props.initialGame, (newGame) => {
  selectedGame.value = newGame;
}, { immediate: true });

onMounted(() => {
  fetchGames();
  fetchRunners();
  fetchCategories();
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--color-background);
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

select {
  display: none;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button {
  background-color: var(--color-primary);
  color: white;
  border: none;
}

.cancel-button {
  background-color: transparent;
  border: 1px solid var(--color-border);
}
</style>
