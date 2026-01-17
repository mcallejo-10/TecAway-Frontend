export interface UserInfoResponse {
    code: number;
    message: string;
    data: {
      id: number;
      name: string;
      email: string;
      title: string;
      description: string;
      town?: string;              // 📍 Opcional si hay country
      country: string;            // 📍 Código ISO país (ES, AR, etc)
      can_move: boolean;
      photo?: string;
      latitude?: number;          // 📍 Generado automáticamente desde backend
      longitude?: number;         // 📍 Generado automáticamente desde backend
      sections: {
        section_name: string;
        section_knowledges: {
          knowledge_name: string;
        }[];
      }[];
    };
  }