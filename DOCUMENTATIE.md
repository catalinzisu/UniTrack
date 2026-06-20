# UniTrack - Documentatie Proiect

## Despre proiect

UniTrack este o aplicatie web destinata studentilor care doresc sa isi organizeze parcursul academic intr-un mod centralizat. Ideea a plecat de la o nevoie reala: atunci cand esti student si ai de gestionat mai multe materii in paralel, cu date de examen diferite, profesori diferiti si materiale imprastiate peste tot, e usor sa pierzi evidenta lucrurilor. Aplicatia le ofera studentilor posibilitatea de a-si vedea materiile intr-un singur loc, de a evalua profesorii si examenele si de a partaja materiale utile cu ceilalti colegi.

Proiectul a fost dezvoltat in Angular (versiunea 20) si foloseste libraria NgZorro pentru componente de UI. Ca "backend", am optat pentru json-server, care simuleaza un API REST local pe baza unui fisier db.json, combinat cu un apel HTTP real catre reqres.in pentru autentificare.

## Structura aplicatiei

Aplicatia este organizata pe module logice, respectand conventiile Angular:

- **core/** -- contine serviciile principale (AuthService, SubjectService), guard-urile de navigatie (authGuard, guestGuard), modelele de date (User, Subject) si datele mock.
- **features/** -- contine paginile propriu-zise, grupate pe functionalitate:
  - **auth/** -- Login si Register, cu formularele aferente.
  - **dashboard/** -- Layout-ul principal cu sidebar si header, care inglobeaza sub-paginile de materii (subjects) si profil (profile).
- **shared/** -- contine elemente reutilizabile: componenta de rating cu stelute, validatoare custom si un pipe personalizat.

Intreaga aplicatie este lazy loaded. Rutele principale incarca modulele cu `loadChildren` si `loadComponent`, ceea ce inseamna ca browser-ul descarca doar codul necesar paginii curente.

## Functionalitati implementate

### Autentificare

Formularul de login contine campurile de email, parola si un checkbox "Remember me". Daca acesta din urma este bifat, sesiunea utilizatorului este salvata in localStorage si ramane activa chiar daca se inchide browser-ul. In caz contrar, sesiunea se salveaza in sessionStorage si se pierde la inchiderea tab-ului.

Formularul de register solicita email, parola, confirmarea parolei, prenumele, numele, facultatea, specializarea si anul de studiu. Parola trebuie sa aiba minim 6 caractere si sa contina cel putin o litera mare, o litera mica, o cifra si un caracter special. Aceasta validare este implementata printr-un validator custom (strongPassword) din fisierul custom-validators.ts. Exista de asemenea un validator care verifica daca parola si confirmarea coincid.

Autentificarea face un apel HTTP real catre API-ul reqres.in. Deoarece reqres.in nu suporta utilizatori arbitrari, raspunsul de eroare este interceptat si se valideaza local contul pe baza datelor salvate in localStorage la momentul inregistrarii.

Paginile de login si register sunt protejate cu un guestGuard care redirecteaza utilizatorii deja autentificati catre dashboard.

### Tabelul de materii

Pagina principala contine un tabel cu urmatoarele 7 coloane: numele materiei, profesorul, materialele atasate, ratingul profesorului, ratingul examenului, data examenului si butoanele de actiuni.

Tabelul poate fi sortat dupa fiecare coloana prin click pe header. Exista un searchbar care filtreaza materiile dupa nume sau profesor. Fiecare intrare are un buton de editare (care deschide un modal) si un buton de stergere (cu confirmare prin popconfirm).

Adaugarea se face printr-un modal cu doua moduri: fie selectezi o materie din catalogul global, fie creezi una complet noua completand un formular cu validari. Editarea permite modificarea materialelor atasate, a comentariului personal si a rating-urilor.

Materialele pot fi vizualizate direct in aplicatie printr-un iframe (de exemplu, documente Google Drive), fara a parasi pagina.

### Componenta de rating

Rating-ul este implementat ca o componenta separata (AppRatingComponent) care foloseste noua sintaxa Angular cu input() si output(). Aceasta afiseaza 5 stelute pe care utilizatorul le poate seta prin click sau hover. Componenta este reutilizata in tabel pentru ratingul profesorului si al examenului.

### Profilul utilizatorului

Pagina de profil afiseaza datele contului si permite editarea numelui, prenumelui, facultatii, specializarii si anului de studiu. Email-ul este afisat read-only.

### Pipe-ul DaysUntil

Un pipe custom (daysUntil) calculeaza si afiseaza intr-un format prietenos cate zile mai sunt pana la examen. Foloseste libraria date-fns pentru calcule de diferente intre date. Afiseaza "Astazi", "Maine", "In X zile" sau "Examen sustinut" in functie de situatie.

## Tehnologii si librarii

- **Angular 20** -- framework-ul principal, cu componente standalone, signals, computed, effects.
- **NgZorro (ng-zorro-antd)** -- libraria de UI bazata pe Ant Design, folosita pentru tabele, modale, formulare, butoane, carduri, rate, tag-uri, layout-uri etc.
- **date-fns** -- librarie utilitara pentru manipularea datelor calendaristice, folosita in pipe-ul DaysUntil.
- **json-server** -- simuleaza un backend REST pe baza fisierului db.json, oferind operatii CRUD complete pe resurse.
- **reqres.in** -- API public folosit pentru apelul HTTP de autentificare, conform cerintei de conectare la un Fake API.
- **SCSS** -- preprocessor CSS folosit pentru stilizarea componentelor.

## Cum se ruleaza

1. Se instaleaza dependintele: `npm install`
2. Se porneste serverul de date: `npm run server` (json-server pe portul 3000)
3. Se porneste aplicatia Angular: `npm start` (ng serve pe portul 4200)
4. Se acceseaza in browser: `http://localhost:4200`

La prima utilizare, trebuie creat un cont prin pagina de Register, dupa care autentificarea se face prin Login.
