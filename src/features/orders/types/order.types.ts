export type DeliveryResult = 'delivered' | 'failed';

export type QueueStatus = 'pending' | 'error';

export interface OrderRecord {
  orderNumber: string;
  customer: string;
  address: string;
  result: DeliveryResult;
  reason: string;
  comment: string;
  recordedAt: string;
  userId: string;
  userName: string;
}

export interface EvidencePhoto {
  id: string;
  blob: Blob;
  name: string;
}

export interface QueueItem {
  id: string;
  record: OrderRecord;
  photos: EvidencePhoto[];
  status: QueueStatus;
  attempts: number;
  createdAt: string;
  lastError: string | null;
}

export interface OrdersService {
  send(item: QueueItem): Promise<void>;
}
