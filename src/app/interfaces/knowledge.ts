export interface Knowledge {
    id_knowledge?: number;
    knowledge: string;
    section_id: number;
}

export interface KnowledgeListResponse {
    code: number;
    message: string;
    data: Knowledge[];
}
