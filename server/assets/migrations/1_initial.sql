CREATE TABLE IF NOT EXISTS users (
    id bigserial primary key,
    name text not null,
    email text not null unique,
    password_hash text,
    profile_picture text
);

CREATE TYPE calendar_type as enum ('main', 'additional');

CREATE TABLE IF NOT EXISTS calendars (
    id bigserial primary key,
    author bigserial REFERENCES users(id) on delete cascade,
    title text not null,
    type calendar_type default 'main',
    created_at timestamp,
    status boolean default true
);

CREATE TYPE event_type as enum ('arrangement', 'reminder', 'task');
CREATE TABLE IF NOT EXISTS events (
    id bigserial primary key,
    author bigserial REFERENCES users(id) on delete cascade,
    title text not null,
    description text default '',
    start timestamp,
    finish timestamp,
    calendar_id bigserial REFERENCES calendars(id) on delete cascade,
    colour varchar(10),
    type event_type
);

CREATE TABLE IF NOT EXISTS media (
    id bigserial primary key,
    event_id bigserial REFERENCES events(id) on delete cascade,
    path text
);

CREATE TYPE user_role as enum ('admin', 'manager', 'user');
CREATE TABLE IF NOT EXISTS users_calendars (
    user_id bigserial REFERENCES users(id) on delete cascade,
    calendar_id bigserial REFERENCES calendars(id) on delete cascade,    
    role user_role
);


CREATE TABLE IF NOT EXISTS refresh_tokens (
    token varchar(256) primary key,
    owner_id bigint references users (id) on delete cascade,
    due_date timestamp
)
