# Determine OS
ifeq ($(OS),Windows_NT)
    OS := Windows
else
    OS := $(shell uname)
endif

# Linux
ifeq ($(OS),Linux)
    SLEEP_CMD := sleep 5
    EXECUTABLE := ./backend/postgres_init/dist/import_quotes/import_quotes
endif

# Windows
ifeq ($(OS),Windows)
    SLEEP_CMD := timeout /t 5
    EXECUTABLE := .\backend\postgres_init\dist\import_quotes_win\import_quotes.exe
endif

up:
	docker compose up -d
	$(SLEEP_CMD)
	$(EXECUTABLE)

down:
	docker compose down -v

reb:
	docker compose restart
	$(SLEEP_CMD)
	$(EXECUTABLE)

build:
	docker compose build
	docker compose up -d
	$(SLEEP_CMD)
	$(EXECUTABLE)