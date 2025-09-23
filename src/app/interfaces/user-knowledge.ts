export interface UserKnowledge {
    user_id: number;
    knowledge_id: number;
}

export interface UserKnowledgeListResponse {
    code: number;
    message: string;
    data: UserKnowledge[];
}


