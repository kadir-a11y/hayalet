export interface DiscoveredItemInput {
  externalId: string;
  title: string;
  summary: string;
  url: string;
}

export interface MonitoringAdapter {
  type: string;
  fetch(topic: MonitoredTopicData, source: MonitoringSourceData): Promise<DiscoveredItemInput[]>;
}

export interface MonitoredTopicData {
  id: string;
  userId: string;
  name: string;
  keywords: string[];
  language: string;
}

export interface MonitoringSourceData {
  id: string;
  topicId: string;
  sourceType: string;
  config: Record<string, unknown>;
}
