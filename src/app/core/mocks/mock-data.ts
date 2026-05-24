import { Subject } from '../models/subject.model';
import { User } from '../models/user.model';

export const MOCK_SUBJECTS: Subject[] = [
  {
    id: 1,
    name: 'Programare Orientată pe Obiecte',
    professor: 'Dr. Ion Popescu',
    faculty: 'FMI',
    specialization: 'Informatica',
    studyYear: '1',
    professorRating: 4,
    examRating: 3,
    examDate: '2026-06-15'
  },
  {
    id: 2,
    name: 'Baze de Date',
    professor: 'Dr. Maria Ionescu',
    faculty: 'FMI',
    specialization: 'Informatica',
    studyYear: '2',
    professorRating: 5,
    examRating: 4,
    examDate: '2026-06-20'
  },
  {
    id: 3,
    name: 'Rețele de Calculatoare',
    professor: 'Dr. Andrei Popa',
    faculty: 'FMI',
    specialization: 'Informatica',
    studyYear: '3',
    professorRating: 3,
    examRating: 2,
    examDate: '2026-06-10'
  },
  {
    id: 4,
    name: 'Ingineria Programării',
    professor: 'Dr. Elena Georgescu',
    faculty: 'FMI',
    specialization: 'Informatica',
    studyYear: '3',
    professorRating: 5,
    examRating: 5,
    examDate: '2026-06-18'
  },
  {
    id: 5,
    name: 'Inteligență Artificială',
    professor: 'Dr. Vasile Munteanu',
    faculty: 'FMI',
    specialization: 'Informatica',
    studyYear: '3',
    professorRating: 4,
    examRating: 4,
    examDate: '2026-06-25'
  },
  {
    id: 6,
    name: 'Dezvoltare Web cu Angular',
    professor: 'Dr. Cătălin Zisu',
    faculty: 'FMI',
    specialization: 'Informatica',
    studyYear: '2',
    professorRating: 5,
    examRating: 4,
    examDate: '2026-06-28'
  },
  {
    id: 7,
    name: 'Securitate Cibernetică',
    professor: 'Dr. Alex Popescu',
    faculty: 'FMI',
    specialization: 'Informatica',
    studyYear: '2',
    professorRating: 4,
    examRating: 3,
    examDate: '2026-06-30'
  },
  {
    id: 8,
    name: 'Algoritmi Avansați',
    professor: 'Dr. Mihai Ionescu',
    faculty: 'FMI',
    specialization: 'Informatica',
    studyYear: '2',
    professorRating: 5,
    examRating: 5,
    examDate: '2026-06-12'
  },
  {
    id: 9,
    name: 'Grafică pe Calculator (Opțional)',
    professor: 'Dr. Elena Radu',
    faculty: 'FMI',
    specialization: 'Informatica',
    studyYear: '2',
    professorRating: 4,
    examRating: 4,
    examDate: '2026-06-05'
  }
];

export const MOCK_USER: User = {
  email: 'eve.holt@student.uni.ro',
  firstName: 'Eve',
  lastName: 'Holt',
  faculty: 'FMI',
  specialization: 'Informatica',
  studyYear: '3'
};
