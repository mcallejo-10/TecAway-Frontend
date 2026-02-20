export interface UserInfoResponse {
    code: number;
    message: string;
    data: {
      id: number;
      name: string;
      email: string;
      title: string;
      description: string;
      city: string;
      country: string;
      can_move: boolean;
      photo?: string;
      latitude: number;
      longitude: number;
      sections: {
        section_name: string;
        section_knowledges: {
          knowledge_name: string;
        }[];
      }[];
    };
  }