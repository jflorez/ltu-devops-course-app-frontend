<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import GameDropdown from './components/GameDropdown.vue';
import SpeedrunList from './components/SpeedrunList.vue';
import WarningBanner from './components/WarningBanner.vue';
import type { Game } from './components/data/Speedrun';
import axios from 'axios';
import AddSpeedrunModal from './components/AddSpeedrunModal.vue';

const selectedGame = ref<Game | undefined>(undefined);
const isConnectionError = ref(false);
let connectionCheckInterval: number | undefined;
const showAddModal = ref(false);

const onGameSelected = (game: Game) => {
  selectedGame.value = game;
};

const checkConnection = async () => {
  try {
    console.log(`Checking connection to base url: ${axios.defaults.baseURL}`);
    await axios.get('/api/health');
    isConnectionError.value = false;
  } catch {
    isConnectionError.value = true;
  }
};

const handleSpeedrunAdded = () => {
  if (selectedGame.value) {
    // Emit a custom event that SpeedrunList will listen to
    const event = new CustomEvent('refresh-speedruns');
    window.dispatchEvent(event);
  }
};

onMounted(() => {
  checkConnection();
  connectionCheckInterval = window.setInterval(checkConnection, 30000); // Check every 30 seconds
});

onUnmounted(() => {
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval);
  }
});
</script>

<template>
  <div class="container">
    <div class="content-box">
      <div class="header-controls">
        <GameDropdown @game-selected="onGameSelected" />
        <button class="add-button" @click="showAddModal = true">
          <span class="plus-icon">+</span>
        </button>
      </div>
      <SpeedrunList v-if="selectedGame" :game="selectedGame" />
    </div>
    <WarningBanner :show="isConnectionError" />
    <AddSpeedrunModal
      :show="showAddModal"
      :initial-game="selectedGame"
      @close="showAddModal = false"
      @speedrun-added="handleSpeedrunAdded"
    />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  min-height: 80vh;
  padding: 1rem;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
}

.content-box {
  width: 100%;
  max-width: 800px;
  padding: 2rem;
  background-color: var(--color-background-soft);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 1024px) {
  .content-box {
    max-width: 90%;
    margin: 0;
  }
}

.header-controls {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.add-button {
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0;
}

.plus-icon {
  line-height: 1;
}
</style>
