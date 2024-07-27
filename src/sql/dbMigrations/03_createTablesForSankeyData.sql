CREATE TABLE IF NOT EXISTS sankeyNodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sankeyLinks (
    sankeyNodeId INTEGER NOT NULL,
    applicationStateId INTEGER NOT NULL,
    FOREIGN KEY (sankeyNodeId) REFERENCES sankeyNodes(id),
    FOREIGN KEY (applicationStateId) REFERENCES applicationStates(id)
);