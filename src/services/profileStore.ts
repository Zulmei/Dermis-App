// src/services/profileStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultProfile, UserProfile } from '../data/mockData';

const key = (userId: string) => `@dermis/profile/${userId}`;

export interface PersistedUserData {
  profile:            UserProfile;
  onboardingComplete: boolean;
}

export async function saveProfile(
  userId: string,
  data: PersistedUserData,
): Promise<void> {
  try {
    const json = JSON.stringify(data);
    await AsyncStorage.setItem(key(userId), json);
    console.log('[profileStore] SAVED for', userId, JSON.stringify({
      skinType:           data.profile.skinType,
      defaultSpf:         data.profile.defaultSpf,
      onboardingComplete: data.onboardingComplete,
    }));
  } catch (err) {
    console.error('[profileStore] saveProfile error:', err);
  }
}

export async function loadProfile(
  userId: string,
): Promise<PersistedUserData | null> {
  try {
    const raw = await AsyncStorage.getItem(key(userId));
    if (!raw) {
      console.log('[profileStore] LOAD: nothing found for', userId);
      return null;
    }
    const data = JSON.parse(raw) as PersistedUserData;
    console.log('[profileStore] LOADED for', userId, JSON.stringify({
      skinType:           data.profile.skinType,
      defaultSpf:         data.profile.defaultSpf,
      onboardingComplete: data.onboardingComplete,
    }));
    return data;
  } catch (err) {
    console.error('[profileStore] loadProfile error:', err);
    return null;
  }
}

export async function deleteProfile(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key(userId));
    console.log('[profileStore] DELETED for', userId);
  } catch (err) {
    console.error('[profileStore] deleteProfile error:', err);
  }
}
