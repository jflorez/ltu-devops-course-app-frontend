import { render } from '@testing-library/vue';
import WarningBanner from '@/components/WarningBanner.vue';

describe('WarningBanner', () => {
  it('shows and hides based on prop', async () => {
    const { queryByText, rerender } = render(WarningBanner, {
      props: { show: true }
    });

    // Banner should be visible
    expect(queryByText('⚠️ Unable to connect to server. Please check your connection.')).toBeTruthy();

    // Rerender with show=false
    await rerender({ show: false });

    // Banner should be hidden
    expect(queryByText('⚠️ Unable to connect to server. Please check your connection.')).toBeNull();
  });
});
