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

export interface WrappedMessage {
  traceId: string;
  pageEntry: WebhookEntry;
}

export interface LogFormat {
  level: string,
  module: string,
  traceId: string,
  message: string
}