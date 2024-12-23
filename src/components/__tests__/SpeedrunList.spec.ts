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
import SpeedrunList from '@/components/SpeedrunList.vue';

describe('SpeedrunList', () => {
  it('displays and sorts speedruns', async () => {
    const mockGame = {
      id: '1',
      name: 'Super Mario 64',
      description: 'Classic 3D platformer',
      console: 'Nintendo 64',
      releaseDate: new Date('1996-06-23')
    };

    const mockSpeedruns = [
      { id: '1', runner: { name: 'Runner1' }, time_ms: 1000, date: new Date('2023-01-01') },
      { id: '2', runner: { name: 'Runner2' }, time_ms: 900, date: new Date('2023-01-02') }
    ];

    mockAxios.get.mockResolvedValueOnce({ data: { details: mockSpeedruns } });

    const { findByText, getByText } = render(SpeedrunList, {
      props: { game: mockGame }
    });

    // Wait for data to load
    await waitFor(() => {
      expect(mockAxios.get).toHaveBeenCalledWith('/api/speedruns?gameId=1');
    });

    // Verify speedruns are displayed
    expect(await findByText('Runner1')).toBeTruthy();
    expect(await findByText('Runner2')).toBeTruthy();
    expect(await findByText('1000')).toBeTruthy();
    expect(await findByText('900')).toBeTruthy();

    // Test sorting
    const timeHeader = getByText('Time (ms)');
    await fireEvent.click(timeHeader); // First click for ascending

    // Verify sort order (ascending)
    const cells = document.querySelectorAll('td');
    expect(cells[4].textContent).toBe('900');    // Second row, time column (3 cells per row)
    expect(cells[1].textContent).toBe('1000');   // First row, time column
  });
});
