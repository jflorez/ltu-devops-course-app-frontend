// Mock axios before imports
const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
  defaults: {
    baseURL: null,
    headers: { common: {} }
  },
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
};

jest.mock('axios', () => ({
  __esModule: true,
  default: mockAxios
}));

import { render, fireEvent, waitFor } from '@testing-library/vue';
import AddSpeedrunModal from '@/components/AddSpeedrunModal.vue';

describe('AddSpeedrunModal', () => {
  it('submits speedrun data', async () => {
    const mockGame = { id: '1', name: 'Super Mario 64' };
    const mockRunner = { id: '1', name: 'Runner1' };
    const mockCategory = { id: '1', name: 'Any%' };

    mockAxios.get
      .mockResolvedValueOnce({ data: { details: [mockGame] } })  // games
      .mockResolvedValueOnce({ data: { details: [mockRunner] } }) // runners
      .mockResolvedValueOnce({ data: { details: [mockCategory] } }); // categories

    mockAxios.post.mockResolvedValueOnce({});

    const { getByText, getByPlaceholderText, emitted, findByText } = render(AddSpeedrunModal, {
      props: { show: true }
    });

    // Wait for data to load
    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledTimes(3);
    });

    // Select game
    const gameInput = getByPlaceholderText('Select a game');
    await fireEvent.focus(gameInput);
    const gameOption = await findByText('Super Mario 64');
    await fireEvent.mouseDown(gameOption);

    // Select runner
    const runnerInput = getByPlaceholderText('Select a runner');
    await fireEvent.focus(runnerInput);
    const runnerOption = await findByText('Runner1');
    await fireEvent.mouseDown(runnerOption);

    // Select category
    const categoryInput = getByPlaceholderText('Select a category');
    await fireEvent.focus(categoryInput);
    const categoryOption = await findByText('Any%');
    await fireEvent.mouseDown(categoryOption);

    // Enter time
    const timeInput = getByText('Time (milliseconds):').nextElementSibling as HTMLInputElement;
    await fireEvent.update(timeInput, '1000');

    // Submit form
    const submitButton = getByText('Save Speedrun');
    await fireEvent.click(submitButton);

    // Verify API call and events
    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith('/api/speedruns', expect.any(Object));
      const events = emitted();
      expect(events).toHaveProperty('speedrun-added');
      expect(events).toHaveProperty('close');
    });
  });
});
