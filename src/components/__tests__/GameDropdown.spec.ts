// Mock axios before imports
const mockAxios = {
  get: jest.fn(),
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
import GameDropdown from '@/components/GameDropdown.vue';

describe('GameDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and displays games, allows selection', async () => {
    const mockGames = [
      { id: '1', name: 'Super Mario 64' },
      { id: '2', name: 'The Legend of Zelda' }
    ];

    // Mock the API response
    mockAxios.get.mockResolvedValueOnce({ data: { details: mockGames } });

    const { getByPlaceholderText, emitted, findByText } = render(GameDropdown, {
      global: {
        stubs: {
          BaseDropdown: false
        }
      }
    });

    // Wait for games to be fetched and component to update
    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith('/api/games');
    });

    // Verify placeholder is shown
    const input = getByPlaceholderText('Search games...');
    expect(input).toBeTruthy();

    // Focus to show dropdown
    await fireEvent.focus(input);

    // Wait for and verify games are displayed
    const game1 = await findByText('Super Mario 64');
    expect(game1).toBeTruthy();

    // Select a game
    await fireEvent.mouseDown(game1);

    // Wait for the event to be emitted
    await waitFor(() => {
      const events = emitted();
      expect(events).toHaveProperty('game-selected');
      expect(events['game-selected'][0]).toEqual([mockGames[0]]);
    });
  });
});
