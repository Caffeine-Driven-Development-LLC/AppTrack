INSERT INTO applicationStates (id, name, displayOrder, initialStep) VALUES (1, 'Applied', 3, 1);
INSERT INTO applicationStates (id, name, displayOrder) VALUES (2, 'Scheduled phone screen', 4);
INSERT INTO applicationStates (id, name, displayOrder) VALUES (3, 'Completed phone screen', 5);
INSERT INTO applicationStates (id, name, displayOrder) VALUES (4, 'Passed phone screen', 6);
INSERT INTO applicationStates (id, name, displayOrder) VALUES (5, 'Scheduled interview', 7);
INSERT INTO applicationStates (id, name, displayOrder) VALUES (6, 'Completed interview', 8);
INSERT INTO applicationStates (id, name, displayOrder) VALUES (7, 'Passed interview', 9);
INSERT INTO applicationStates (id, name, displayOrder) VALUES (8, 'Received offer', 10);
INSERT INTO applicationStates (id, name, displayOrder) VALUES (9, 'Negotiation offer', 11);
INSERT INTO applicationStates (id, name, displayOrder) VALUES (10, 'Accepted offer', 12);
INSERT INTO applicationStates (id, name, displayOrder, alwaysAvailable) VALUES (11, 'Rejected', 2, 1);
INSERT INTO applicationStates (id, name, displayOrder, alwaysAvailable) VALUES (12, 'Withdrawn', 1, 1);

INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (1, 2);   -- Applied -> Phone Screen - scheduled

INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (2, 3);   -- Phone Screen - scheduled -> Phone Screen - completed

INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (3, 4);   -- Phone Screen - completed -> Phone Screen - passed

INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (4, 5);   -- Phone Screen - passed -> Interview - scheduled
INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (4, 8);  -- Phone Screen - passed -> Offer - received

INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (5, 6); -- Interview - scheduled -> Interview - completed

INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (6, 7); -- Interview - completed -> Interview - passed
INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (6, 6); -- Interview - completed -> Interview - completed

INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (7, 5); -- Interview - passed -> Interview - scheduled
INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (7, 8); -- Interview - passed -> Offer - received

INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (8, 9); -- Offer - received -> Offer - Negotiation
INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (8, 10); -- Offer - received -> Offer - Accepted

INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (9, 10); -- Offer - Negotiation -> Offer - Accepted