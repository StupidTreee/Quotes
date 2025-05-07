# determine os
ifeq ($(OS),Windows_NT)
    OS := Windows
else
    OS := $(shell uname)
endif

# Linux
ifeq ($(OS),Linux)
    SLEEP_CMD := sleep 5
endif

# Windows
ifeq ($(OS),Windows)
    SLEEP_CMD := timeout /t 5
endif

up:
	docker compose up -d
	$(SLEEP_CMD)
	python ./backend/postgres_init/import_quotes.py

down:
	docker compose down -v
