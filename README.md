# Quoty
Eine Angular-basierte Website zum Anzeigen und Verwalten von Zitaten der IT-Klasse der HTL Hollabrunn, Jahrgang 21/22.

## Projektübersicht
Dieses Full-Stack-Projekt demonstriert die Entwicklung einer modernen Webanwendung mit REST-API, WebSocket-Echtzeitkommunikation, Docker-Containerisierung und einer Angular-Frontend-App. Ziel ist es, Zitate zu sammeln, zu verwalten und ansprechend darzustellen.

## Features
- Zufällige Anzeige von Zitaten (Random Quote)
- Markdown-Unterstützung für Zitate (Discord-ähnlich)
- Filterung nach Lehrer- und Schüler-Zitaten
- Einstellungen (Settings-Panel)
- Responsive Design
- Verwaltungsmasken zum Hinzufügen, Bearbeiten und Löschen von Zitaten
- Echtzeit-Benachrichtigungen per WebSocket

Für weitere Features bitte [TODOs.md](./TODOs.md) ansehen.
Bitte beachten sie aber das ich dieses nach Abgabe weiterführen werde, daher kann es so wirken als wenn laut TODOs noch viel fehlt
## Projektstruktur
- `backend/` – Node.js/Express API, Datenbank, Routen, WebSocket-Server
- `frontend/` – Angular App (Standalone Components, WebSocket-Client)
- `data/` – Rohdaten und Medien

## Ausführen des Projekts

### Voraussetzungen
- [Docker](https://www.docker.com/) installiert
- Node.js & npm (nur für lokale Entwicklung)

### Schnellstart

```sh
make up
```
oder falls man `make` nicht hat
```sh
docker-compose up --build
python ./backend/postgres_init/import_quotes.py
```

Die Anwendung ist dann unter [http://localhost:4200](http://localhost:4200) erreichbar (bzw. per Domain, sobald deployed).

## Hinweise zur Abgabe
- Alle Komponenten (Backend, Frontend, Doku) sind vollständig und getestet.
- REST-API ist per SwaggerUI dokumentiert und testbar.
- WebSocket-Kommunikation ist implementiert und getestet.
- Docker-Container für Backend und Datenbank vorhanden, Express.js dient statische Angular-Dateien aus.
- README.md enthält alle relevanten Infos, Startanleitung und Projektübersicht.
- Optional: Link zu einem Demo-Video ergänzen.

## ToDo
- Quote-Tabelle/Liste
- Navbar für Navigation
- Weitere Settings

## Lizenz
MIT
