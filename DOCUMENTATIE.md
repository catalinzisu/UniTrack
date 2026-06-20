# UniTrack - Documentatie Proiect

## Despre proiect

UniTrack este o aplicatie web destinata studentilor care doresc sa isi organizeze parcursul academic. Aplicatia le ofera posibilitatea de a-si vedea materiile intr-un singur loc, de a evalua profesorii si examenele si de a partaja materiale utile cu colegii.

Proiectul a fost dezvoltat in Angular 20 si foloseste libraria NgZorro pentru componente de UI. Ca backend, am optat pentru json-server care simuleaza un API REST local pe baza unui fisier db.json, combinat cu un apel HTTP real catre reqres.in pentru autentificare.

## Structura aplicatiei

Aplicatia este organizata pe module logice, respectand conventiile Angular:

- **core/** -- serviciile principale (AuthService, SubjectService), guard-urile de navigatie (authGuard, guestGuard), modelele de date (User, Subject) si datele mock.
- **features/** -- paginile propriu-zise, grupate pe functionalitate:
  - **auth/** -- Login si Register, cu formularele aferente.
  - **dashboard/** -- Layout-ul principal cu sidebar si header, care inglobeaza sub-paginile de materii (subjects) si profil (profile).
- **shared/** -- elemente reutilizabile: componenta de rating cu stelute, validatoare custom si un pipe personalizat.

Intreaga aplicatie este lazy loaded prin `loadChildren` si `loadComponent`, astfel incat browser-ul descarca doar codul necesar paginii curente.

## Functionalitati implementate

### Autentificare

Formularul de login contine campuri de email, parola si un checkbox "Remember me". Daca este bifat, sesiunea se salveaza in localStorage si ramane activa la inchiderea browser-ului; altfel se foloseste sessionStorage.

Formularul de register solicita email, parola, confirmarea parolei, prenumele, numele, facultatea, specializarea si anul de studiu. Parola trebuie sa contina minim 6 caractere, cel putin o litera mare, o litera mica, o cifra si un caracter special, validat prin validatorul custom strongPassword. Exista si un validator care verifica daca parola si confirmarea coincid.

Autentificarea face un apel HTTP catre reqres.in. Deoarece acest API nu suporta utilizatori arbitrari, raspunsul de eroare este interceptat si se valideaza local pe baza datelor din localStorage. Paginile de login si register sunt protejate cu guestGuard care redirecteaza utilizatorii autentificati catre dashboard.

### Tabelul de materii

Pagina principala contine un tabel cu 7 coloane: numele materiei, profesorul, materialele atasate, ratingul profesorului, ratingul examenului, data examenului si butoanele de actiuni.

Tabelul suporta sortare pe fiecare coloana si filtrare prin searchbar dupa nume sau profesor. Adaugarea se face printr-un modal cu doua moduri: selectare din catalogul global sau creare manuala cu validari. Editarea permite modificarea materialelor, comentariului personal si rating-urilor. Materialele pot fi vizualizate direct in aplicatie printr-un iframe.

### Componenta de rating

Rating-ul este implementat ca o componenta separata (AppRatingComponent) cu noua sintaxa Angular (input/output signals). Afiseaza 5 stelute interactive si este reutilizata in tabel pentru ratingul profesorului si al examenului.

### Profilul utilizatorului

Pagina de profil afiseaza datele contului si permite editarea numelui, prenumelui, facultatii, specializarii si anului de studiu. Email-ul este read-only.

### Pipe-ul DaysUntil

Un pipe custom care calculeaza cate zile mai sunt pana la examen, folosind libraria date-fns. Afiseaza "Astazi", "Maine", "In X zile" sau "Examen sustinut".

## Tehnologii si librarii

- **Angular 20** -- framework principal cu componente standalone, signals, computed, effects.
- **NgZorro (ng-zorro-antd)** -- librarie UI bazata pe Ant Design.
- **date-fns** -- manipularea datelor calendaristice.
- **json-server** -- backend REST simulat pe baza fisierului db.json.
- **reqres.in** -- API public pentru apelul HTTP de autentificare.
- **SCSS** -- preprocessor CSS pentru stilizare.

## Cum se ruleaza

1. Se instaleaza dependintele: `npm install`
2. Se porneste serverul de date: `npm run server` (json-server pe portul 3000)
3. Se porneste aplicatia Angular: `npm start` (ng serve pe portul 4200)
4. Se acceseaza in browser: `http://localhost:4200`

La prima utilizare, trebuie creat un cont prin pagina de Register, dupa care autentificarea se face prin Login.
