<template>
  <div class="dropdown-container">
    <input
      type="text"
      v-model="search"
      :placeholder="placeholder"
      @focus="handleFocus"
      @input="handleInput"
    />
    <ul v-if="showDropdown && filteredItems.length > 0" class="dropdown-list">
      <li
        v-for="item in filteredItems"
        :key="item.id"
        @mousedown="selectItem(item)"
        :class="{ 'highlighted': item.name.toLowerCase() === search.toLowerCase() }"
      >
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<script setup generic="T extends { id: string; name: string }" lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps<{
  items: T[];
  placeholder: string;
  modelValue?: T;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: T): void;
}>();

const search = ref(props.modelValue?.name || '');
const showDropdown = ref(false);

const handleFocus = () => {
  showDropdown.value = true;
};

const handleInput = () => {
  showDropdown.value = true;
};

const filteredItems = computed(() => {
  if (!search.value) return props.items;
  const searchTerm = search.value.toLowerCase();
  return props.items.filter(item =>
    item.name.toLowerCase().includes(searchTerm)
  );
});

const selectItem = (item: T) => {
  search.value = item.name;
  showDropdown.value = false;
  emit('update:modelValue', item);
};

// Close dropdown when clicking outside
window.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.dropdown-container')) {
    showDropdown.value = false;
  }
});

// Add a watch to update search when modelValue changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    search.value = newValue.name;
  }
}, { immediate: true });
</script>

<style scoped>
.dropdown-container {
  position: relative;
  width: 100%;
}

.dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}

input[type="text"] {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--color-background);
  color: var(--color-text);
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background-color 0.3s;
  color: var(--color-text);
}

li:hover, li.highlighted {
  background-color: var(--color-background-soft);
}

li:last-child {
  border-bottom: none;
}
</style>
