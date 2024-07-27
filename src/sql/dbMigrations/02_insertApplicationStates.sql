INSERT INTO applicationStates (id, name, displayOrder, initialStep) VALUES (1, 'Applied', 3, 1);
INSERT INTO applicationStates (id, name, displayOrder) VALUES (2, 'Scheduled phone screen', 4);
INSERT INTO applicationStates (id, name, displayOrder) VALUES (3, 'Completed phone screen', 5);
INSERT INTO applicationStates (id, name, displayOrder) VALUES (4, 'Passed phone screen', 6);
INSERT INTO applicationStates (id, name, displayOrder) VALUES (5, 'Take home project', 7);
INSERT INTO applicationStates (id, name, displayOrder) VALUES (6, 'Submitted take home project', 8);
INSERT INTO applicationStates (id, name, displayOrder) VALUES (7, 'Passed take home project', 9);
INSERT INTO applicationStates (id, name, displayOrder) VALUES (8, 'Scheduled interview', 10);
INSERT INTO applicationStates (id, name, displayOrder) VALUES (9, 'Completed interview', 11);
INSERT INTO applicationStates (id, name, displayOrder) VALUES (10, 'Passed interview', 12);
INSERT INTO applicationStates (id, name, displayOrder) VALUES (11, 'Received offer', 13);
INSERT INTO applicationStates (id, name, displayOrder) VALUES (12, 'Negotiation offer', 14);
INSERT INTO applicationStates (id, name, displayOrder) VALUES (13, 'Accepted offer', 15);
INSERT INTO applicationStates (id, name, displayOrder, alwaysAvailable) VALUES (14, 'Rejected', 2, 1);
INSERT INTO applicationStates (id, name, displayOrder, alwaysAvailable) VALUES (15, 'Withdrawn', 1, 1);

INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (1, 2);   -- Applied -> Phone Screen - scheduled

INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (2, 3);   -- Phone Screen - scheduled -> Phone Screen - completed

INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (3, 4);   -- Phone Screen - completed -> Phone Screen - passed

INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (4, 5);   -- Phone Screen - passed -> Take home project
INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (4, 8);   -- Phone Screen - passed -> Interview - scheduled
INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (4, 11);  -- Phone Screen - passed -> Offer - received

INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (5, 6);   -- Take home project -> Take home project - submitted

INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (6, 7);   -- Take home project - submitted -> Take home project - passed

INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (7, 8);   -- Take home project - passed -> Interview - scheduled
INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (7, 5);   -- Take home project - passed -> Take home project
INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (7, 11);  -- Take home project - passed -> Offer - received

INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (8, 9); -- Interview - scheduled -> Interview - completed

INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (9, 10); -- Interview - completed -> Interview - passed
INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (9, 9); -- Interview - completed -> Interview - completed

INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (10, 8); -- Interview - passed -> Offer - Interview - scheduled
INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (10, 5); -- Interview - passed -> Offer - Take home project
INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (10, 11); -- Interview - passed -> Offer - received

INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (11, 12); -- Offer - received -> Offer - Negotiation
INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (11, 13); -- Offer - received -> Offer - Accepted

INSERT INTO applicationFlow (applicationStateId, nextApplicationStateId) VALUES (12, 13); -- Offer - Negotiation -> Offer - Accepted