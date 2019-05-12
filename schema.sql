CREATE TABLE users (
  id serial PRIMARY KEY,
  email varchar(50) UNIQUE NOT NULL,
  name varchar(50),
  password varchar(128) NOT NULL
);

CREATE TABLE friends (
  userId serial NOT NULL,
  friendId serial NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (friendId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE events (
  id serial PRIMARY KEY,
  title varchar(128) NOT NULL,
  description varchar(128),
  startTime timestamp with time zone NOT NULL,
  endTime timestamp with time zone NOT NULL,
  userId serial,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE dates (
  id serial PRIMARY KEY,
  title varchar(128) NOT NULL,
  description varchar(128),
  startTime timestamp with time zone NOT NULL,
  endTime timestamp with time zone NOT NULL
);

CREATE TABLE userDates (
  userId serial NOT NULL,
  dateId serial NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (dateId) REFERENCES dates(id) ON DELETE CASCADE
);