export interface WebhookEvent {
  object: 'page';
  entry: WebhookEntry[];
}

export interface WebhookEntry {
  id: string;
  time: number;
  messaging?: any;
  changes?: any;
}