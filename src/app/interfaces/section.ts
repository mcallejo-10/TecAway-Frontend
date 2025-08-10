export interface Section {
    id_section?: number;
    section: string;
}

export interface SectionListResponse {
    code: number;
    message: string;
    data: Section[];
}
