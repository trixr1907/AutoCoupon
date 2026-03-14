import {
  defaultSettings,
  getLastRunSummary,
  getSettings,
  setLastRunSummary,
  updateSettings,
} from '../../src/platform/storage/settings-store';
import { getChromeMockControls } from '../test-utils';

describe('settings-store', () => {
  it('returns defaults when nothing is stored', async () => {
    await expect(getSettings()).resolves.toEqual(defaultSettings);
  });

  it('merges stored values and persists updates', async () => {
    const controls = getChromeMockControls();
    controls.storageState.settings = {
      overlayEnabled: false,
    };

    await expect(getSettings()).resolves.toMatchObject({
      overlayEnabled: false,
      preferredMode: 'normal',
    });

    const updated = await updateSettings({
      preferredMode: 'turbo',
    });

    expect(updated).toMatchObject({
      overlayEnabled: false,
      preferredMode: 'turbo',
    });
    expect(controls.storageState.settings).toMatchObject({
      overlayEnabled: false,
      preferredMode: 'turbo',
    });
  });

  it('stores and retrieves the last run summary', async () => {
    await setLastRunSummary({
      activated: 2,
      alreadyActive: 1,
      unavailable: 0,
      failed: 0,
      processed: 3,
      totalSeen: 3,
      aborted: false,
      durationMs: 1000,
    });

    await expect(getLastRunSummary()).resolves.toMatchObject({
      activated: 2,
      processed: 3,
    });
  });
});
