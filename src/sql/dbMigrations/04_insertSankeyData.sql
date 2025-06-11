INSERT INTO sankeyNodes (id, name, color) VALUES (1, 'Ghosted', '#ccc2c2');
INSERT INTO sankeyNodes (id, name, color) VALUES (2, 'In Progress', '#559651');
INSERT INTO sankeyNodes (id, name, color) VALUES (3, 'Applied', '#559651');
INSERT INTO sankeyNodes (id, name, color) VALUES (4, 'Phone Screen', '#69b3a2');
INSERT INTO sankeyNodes (id, name, color) VALUES (5, 'Interviewed', '#69b3a2');
INSERT INTO sankeyNodes (id, name, color) VALUES (6, 'Offer', '#69b3a2');
INSERT INTO sankeyNodes (id, name, color) VALUES (7, 'Accepted offer', '#69b3a2');
INSERT INTO sankeyNodes (id, name, color) VALUES (8, 'Rejected', '#a10808');
INSERT INTO sankeyNodes (id, name, color) VALUES (9, 'Withdrawn', '#04399b');

INSERT INTO sankeyLinks (sankeyNodeId, applicationStateId) VALUES (3, 1);
INSERT INTO sankeyLinks (sankeyNodeId, applicationStateId) VALUES (4, 3);
INSERT INTO sankeyLinks (sankeyNodeId, applicationStateId) VALUES (5, 6);
INSERT INTO sankeyLinks (sankeyNodeId, applicationStateId) VALUES (6, 8);
INSERT INTO sankeyLinks (sankeyNodeId, applicationStateId) VALUES (7, 10);
INSERT INTO sankeyLinks (sankeyNodeId, applicationStateId) VALUES (8, 11);
INSERT INTO sankeyLinks (sankeyNodeId, applicationStateId) VALUES (9, 12);
