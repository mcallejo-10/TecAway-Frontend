export interface UserInfoResponse {
    code: number;
    message: string;
    data: {
      id: number;
      name: string;
      email: string;
      title: string;
      description: string;
      town: string;
      can_move: number;
      photo?: string;
      sections: {
        section_name: string;
        section_knowledges: {
          knowledge_name: string;
        }[];
      }[];
    };
  }