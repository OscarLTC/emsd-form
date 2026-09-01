import { env } from '../../../config/env';
import { createPersistentStore } from '../../../core/storage/persistentStore';
import type { AuthSession } from '../types/auth.types';

export const sessionStore = createPersistentStore<AuthSession>(
  env.session.storageKey,
  env.session.ttlMs,
);
