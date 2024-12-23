import { render, fireEvent, waitFor } from '@testing-library/vue';
import BaseDropdown from '@/components/BaseDropdown.vue';

describe('BaseDropdown', () => {
  it('filters and selects items', async () => {
    const mockItems = [
      { id: '1', name: 'Item One' },
      { id: '2', name: 'Item Two' },
      { id: '3', name: 'Different Item' }
    ];

    const { getByPlaceholderText, findByText, emitted } = render(BaseDropdown, {
      props: {
        items: mockItems,
        placeholder: 'Search items...'
      }
    });

    const input = getByPlaceholderText('Search items...');
    expect(input).toBeTruthy();

    // Focus and type to filter
    await fireEvent.focus(input);
    await fireEvent.update(input, 'Item');

    // Check filtered items
    const item1 = await findByText('Item One');
    const item2 = await findByText('Item Two');
    expect(item1).toBeTruthy();
    expect(item2).toBeTruthy();

    // Select an item
    await fireEvent.mouseDown(item1);

    // Verify correct item was emitted
    await waitFor(() => {
      const events = emitted();
      expect(events).toHaveProperty('update:modelValue');
      expect(events['update:modelValue'][0]).toEqual([mockItems[0]]);
    });
  });
});
