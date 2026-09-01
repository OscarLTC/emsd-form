import { env } from '../../../config/env';
import { createPersistentStore } from '../../../core/storage/persistentStore';
import type { Sesion } from '../types/auth.types';

export const sessionStore = createPersistentStore<Sesion>(env.session.storageKey, env.session.ttlMs);
