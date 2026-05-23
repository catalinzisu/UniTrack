export interface Subject {
  id: number;
  name: string;
  professor: string;
  faculty: string;
  specialization: string;
  studyYear: string;
  professorRating?: number;
  examRating?: number;
  examDate?: string;
  materials?: { name: string; url: string }[];
  comment?: string;
}
