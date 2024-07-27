CREATE TABLE IF NOT EXISTS applicationStates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    displayOrder INTEGER NOT NULL,
    initialStep BOOLEAN NOT NULL DEFAULT 0,
    alwaysAvailable BOOLEAN NOT NULL DEFAULT 0,
    isDeleted BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS applicationFlow (
    applicationStateId INTEGER NOT NULL,
    nextApplicationStateId INTEGER NOT NULL,
    FOREIGN KEY (applicationStateId) REFERENCES applicationStates(id),
    FOREIGN KEY (nextApplicationStateId) REFERENCES applicationStates(id)
);

CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    homePage TEXT,
    careerPage TEXT,
    notes TEXT,
    logoPath TEXT,
    isFavorite BOOLEAN NOT NULL DEFAULT 0,
    isDeleted BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    companyId TEXT NOT NULL,
    role TEXT NOT NULL,
    postUrl TEXT,
    salaryRangeHigh INTEGER,
    salaryRangeLow INTEGER,
    isDeleted BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (companyId) REFERENCES companies(id)
);

CREATE INDEX idx_applications_companyId ON applications(companyId);

CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    applicationId TEXT NOT NULL,
    applicationStateId INTEGER,
    date TEXT NOT NULL,
    notes TEXT,
    isDeleted BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (applicationId) REFERENCES applications(id),
    FOREIGN KEY (applicationStateId) REFERENCES applicationStates(id)
);

CREATE INDEX idx_events_applicationId ON events(applicationId);