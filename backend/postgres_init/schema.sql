-- ENUM-Typen
CREATE TYPE rolle AS ENUM ('schueler', 'lehrer');
CREATE TYPE dev_rating_enum AS ENUM ('waste', 'refining', 'separating', 'ok');
CREATE TYPE rating_tag_enum AS ENUM ('good', 'bad', 'neutral');

-- Tabelle: personen
CREATE TABLE personen (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    rolle rolle NOT NULL,
    tag TEXT UNIQUE NOT NULL
);

-- Tabelle: schueler_quotes
CREATE TABLE schueler_quotes (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    rating dev_rating_enum,
    score INTEGER CHECK (score >= 0 AND score <= 10),
    tag rating_tag_enum
);

-- Tabelle: lehrer_quotes
CREATE TABLE lehrer_quotes (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    rating dev_rating_enum,
    score INTEGER CHECK (score >= 0 AND score <= 10),
    tag rating_tag_enum
);

-- Tabelle: schueler_quotes_personen (Many-to-Many für Erwähnungen)
CREATE TABLE schueler_quotes_personen (
    quote_id INTEGER REFERENCES schueler_quotes(id) ON DELETE CASCADE,
    person_id INTEGER REFERENCES personen(id) ON DELETE CASCADE,
    PRIMARY KEY (quote_id, person_id)
);

-- Tabelle: lehrer_quotes_personen (Many-to-Many für Erwähnungen)
CREATE TABLE lehrer_quotes_personen (
    quote_id INTEGER REFERENCES lehrer_quotes(id) ON DELETE CASCADE,
    person_id INTEGER REFERENCES personen(id) ON DELETE CASCADE,
    PRIMARY KEY (quote_id, person_id)
);
