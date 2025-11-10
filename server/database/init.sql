CREATE TABLE
  IF NOT EXISTS users (
    user_id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(60) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

CREATE TABLE
  IF NOT EXISTS events (
    event_id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
    creator_id uuid NOT NULL REFERENCES users (user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    title TEXT UNIQUE NOT NULL,
    description TEXT,
    total_seats INT,
    planned_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

CREATE TABLE
  IF NOT EXISTS bookings (
    booking_id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
    event_id uuid NOT NULL REFERENCES events (event_id) ON DELETE CASCADE ON UPDATE CASCADE,
    user_id uuid NOT NULL REFERENCES users (user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE (event_id, user_id)
  );
