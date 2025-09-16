export interface AgnoRunResponse {
  content: string;
  metadata?: {
    agent_id?: string;
    model?: string;
    user_id?: string;
    session_id?: string;
    processing_time?: number;
  };
}

export interface AgnoKnowledgeLoadResponse {
  message: string;
}

export interface AgnoHealthResponse {
  status: string;
  agents: string[];
}

export interface AgnoAgent {
  id: string;
  name: string;
  description?: string;
}
