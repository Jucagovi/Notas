--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 17.2

-- Started on 2025-05-14 10:29:08

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3994 (class 0 OID 29851)
-- Dependencies: 298
-- Data for Name: Ciclos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Ciclos" VALUES ('2025-03-11 11:55:24.763055+00', 'Desarrollo de Aplicaciones Web', 'DAW', 'El Grado Superior en Desarrollo de Aplicaciones Web es un título oficial de Formación Profesional perteneciente a la rama de Informática. La titulación, también conocida como DAW, está acreditada por el Ministerio de Educación.En esta FP conocerás la parte front end de la programación así como aspectos fundamentales de la parte back o ámbitos transversales como los sistemas informáticos o las bases de datos. ', '36cabd1e-c173-495d-94fc-51bfe6df800d');
INSERT INTO public."Ciclos" VALUES ('2025-03-11 11:55:24.763055+00', 'Desarrollo de Aplicaciones Multiplataforma', 'DAM', 'DAM es una titulación oficial de grado superior que se encuentra dentro de la rama de FP Informática. Como Técnico Superior en Desarrollo de Aplicaciones Multiplataforma de Desarrollo de Aplicaciones Multiplataforma aprenderás todo lo que necesitas saber sobre sistemas informáticos, bases de datos y programación front y back end, adquiriendo así un aprendizaje más completo.', '5f032c9e-08f1-41de-bc4c-19a3ac2827fe');
INSERT INTO public."Ciclos" VALUES ('2025-03-11 11:55:24.763055+00', 'Desarrollo de VideoJuegos y Realidad Virtual', 'CEVRV', 'La competencia general de este curso de especialización consiste en diseñar y desarrollar videojuegos para diferentes dispositivos y plataformas, garantizando la experiencia del usuario, utilizando herramientas de última generación que permitan actuar en todas las fases de su desarrollo, así como aplicaciones interactivas de realidad virtual y aumentada.', 'a906f924-b287-4acf-a170-f743152c2aa3');
INSERT INTO public."Ciclos" VALUES ('2025-03-11 11:55:24.763055+00', 'Sistemas Microinformáticos y Redes', 'SMR', 'Sistemas Microinformáticos y Redes es una profesión que se centra en el diseño, implementación y mantenimiento de sistemas informáticos a pequeña escala, incluyendo redes de computadoras y la administración de hardware, software y servicios relacionados para garantizar su funcionamiento eficiente y seguro. La labor del Técnico SMR es importante porque gracias a ella se asegura la eficiencia y seguridad de los sistemas informáticos en empresas e instituciones.', '56951ab9-cc40-421b-84ce-730b167edbfe');
INSERT INTO public."Ciclos" VALUES ('2025-03-11 11:55:24.763055+00', 'Administración de Sistemas Informáticos en Red', 'ASIR', 'El término Administración de Sistemas Informáticos en Red hace referencia a una profesión que implica gestionar, mantener y asegurar el correcto funcionamiento de los sistemas informáticos en una red. Además es el nombre que adquiere el Grado Superior de Formación Profesional (FP) donde los alumnos se convierten en técnicos profesionales. Es importante porque garantiza la disponibilidad, seguridad y eficiencia de los recursos tecnológicos, facilitando el flujo de información y el funcionamiento de las organizaciones.', '3eb505e1-d0d0-46eb-87bb-d4cbb7ff7833');


--
-- TOC entry 3995 (class 0 OID 29861)
-- Dependencies: 299
-- Data for Name: Cursos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Cursos" VALUES ('2024-12-23 16:53:50.698609+00', 'IES Tecnológico', 'Curso 2022/2023', 'Primer curso de Administración de Sistemas Informáticos', '2022', '615b047d-5bc4-44e5-97d5-6a4f395212b6');
INSERT INTO public."Cursos" VALUES ('2025-05-10 07:34:50+00', 'IES Tecnológico', 'Curso 2024/2025', 'Primer curso de Desarrollo de Aplicaciones Web', '2024', '15726b48-92d4-4741-9b10-70f5181416ce');
INSERT INTO public."Cursos" VALUES ('2025-01-13 16:53:50+00', 'IES Tecnológico', 'Curso 2023/2024', 'Segundo curso de Desarrollo de Aplicaciones Web', '2023', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8');


--
-- TOC entry 3996 (class 0 OID 29872)
-- Dependencies: 300
-- Data for Name: Discentes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Discentes" VALUES ('María', 'López García', 'mlopez@example.com', '2002-06-15', 'Petrer', 'c168177d-04c3-4fcb-8d62-9239391e9933', NULL, '2025-05-10 08:23:58.551275+00');
INSERT INTO public."Discentes" VALUES ('Juan', 'Pérez Martínez', 'jperez@example.com', '2003-02-20', 'Petrer', '2284f4c8-c81d-4e9a-adec-53a08cd5c307', NULL, '2025-05-10 08:23:58.551275+00');
INSERT INTO public."Discentes" VALUES ('Ana', 'González Ruiz', 'agonzalez@example.com', '2001-12-10', 'Novelda', '187d730d-9fa3-40db-bdd0-e2bc5848effd', NULL, '2025-05-10 08:23:58.551275+00');
INSERT INTO public."Discentes" VALUES ('Carlos', 'Fernández Soto', 'cfernandez@example.com', '2002-03-05', 'Aspe', '61459399-ff3e-4c65-ac3f-990a02378022', NULL, '2025-05-10 08:23:58.551275+00');
INSERT INTO public."Discentes" VALUES ('Laura', 'Ramírez Torres', 'lramirez@example.com', '2003-07-22', 'Elda', 'bed3e57a-9aff-4025-8177-aeb842762706', NULL, '2025-05-10 08:23:58.551275+00');
INSERT INTO public."Discentes" VALUES ('Aarón', 'Carpena Rodríguez', 'agonzalez@example.com', '2001-12-10', 'Novelda', '65b50401-bfdc-4b80-bf4c-f038817cb71a', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Pablo ', 'Espinosa Mira', 'jperez@example.com', '2003-02-20', 'Petrer', '9fdc796f-d217-48fa-9e43-9dc87dac827d', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('María José', 'Grau Vidal', 'cfernandez@example.com', '2002-03-05', 'Aspe', '352a5fd1-bac6-43eb-a8e7-53f24d9d04c2', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Miguel Ángel', 'Grimal López', 'lramirez@example.com', '2003-07-22', 'Elda', '865ad2cc-fb3c-47b1-8ff8-a02f3c449853', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Miguel ', 'Hernández Monllor', 'mlopez@example.com', '2002-06-15', 'Petrer', '109837f4-f954-4e01-9b33-4016ee36aa6c', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Jessica Alexandra', 'López Franco', 'agonzalez@example.com', '2001-12-10', 'Novelda', '799756dc-bd28-4ad0-b9e5-604ca2c619c0', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Alberto', 'López Gil', 'jperez@example.com', '2003-02-20', 'Petrer', 'c55fc30c-b6b4-43b1-87a7-ea6b77adc8b6', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Manuel', 'Martínez Santos', 'cfernandez@example.com', '2002-03-05', 'Aspe', '9d3bc0b6-288b-4dd7-ae30-0f44875f647e', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Nathália Cristina', 'Michalowski Rosa', 'lramirez@example.com', '2003-07-22', 'Elda', '7cf1cfca-7699-420a-baaf-8d952d4ee98c', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Ian', 'Miguel Soler', 'mlopez@example.com', '2002-06-15', 'Petrer', '771943e9-3614-47d3-bc1a-e6bdb675ddc8', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Adrián', 'Pareja Morote', 'agonzalez@example.com', '2001-12-10', 'Novelda', 'e50e69df-421b-41a0-89d9-f3491ec99af8', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Carlos', 'Villaescusa Martínez', 'jperez@example.com', '2003-02-20', 'Petrer', '65f6e800-af07-447a-a92a-27ea5f6ac33d', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Adrián', 'Iborra Poveda', 'agonzalez@example.com', '2001-12-10', 'Petrer', 'f114a27d-5f48-456f-a915-32226f319a35', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Alexis', 'Maíquez Murcia', 'jperez@example.com', '2003-02-20', 'Aspe', '2203157e-0148-4ee9-8f87-f68cc81f1058', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Eduardo', 'De La Cotera Martínez', 'cfernandez@example.com', '2002-03-05', 'Elda', 'ccdb9b8e-c8b8-4ba2-b176-61405c2912c9', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Francisco', 'Murillo Pérez', 'lramirez@example.com', '2003-07-22', 'Petrer', '1f3b1f48-aff7-4dfb-8b12-a4639bf3ddf1', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Héctor', 'Valenzuela García', 'mlopez@example.com', '2002-06-15', 'Novelda', '5dd63601-d47d-4e53-8223-f2126876c8c0', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Isaac Julián', 'Pavón Ruiz', 'agonzalez@example.com', '2001-12-10', 'Petrer', '30243064-9913-4722-8f8c-e1836e08819c', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Iván ', 'Garrido Mora', 'jperez@example.com', '2003-02-20', 'Aspe', '433c9c9f-3db8-4314-8f99-c9e141233718', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Jose Luis', 'Morillo González', 'cfernandez@example.com', '2002-03-05', 'Elda', 'b96059e0-3b46-4f2d-84e0-4564202400ff', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Juan Manuel', 'Blanco Araujo', 'lramirez@example.com', '2003-07-22', 'Petrer', '58879483-8572-4d66-a0e1-9c334d8e9b6e', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Kingsley Shyne', 'Mattis Sogorb', 'mlopez@example.com', '2002-06-15', 'Novelda', '4526735b-936a-4425-bbfc-f1c135467d7e', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Luis ', 'Gutiérrez García', 'agonzalez@example.com', '2001-12-10', 'Petrer', 'bc5552ac-9079-4760-88e8-ff48c6462401', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Nuria', 'Vera Díaz', 'jperez@example.com', '2003-02-20', 'Aspe', '05f24207-4bb9-4943-8a14-523139d26a11', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Pablo ', 'Ruiz Muñoz', 'cfernandez@example.com', '2001-12-10', 'Elda', '03f98759-f7c1-43da-b061-58e2f7c12c1e', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Pedro', 'Martín Del Olmo Cuenca', 'lramirez@example.com', '2003-02-20', 'Petrer', '2b60b5e8-31c5-4395-a982-993e6b1a9329', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Pol', 'Aran Serrano', 'mlopez@example.com', '2002-03-05', 'Novelda', '81138c09-2ce6-47ef-a950-ccb6bb9e9dfd', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Tomás', 'Soler Linares', 'agonzalez@example.com', '2003-07-22', 'Petrer', '67791e51-bebc-4a96-ac91-c34d1ae49ae3', NULL, '2025-05-12 15:16:02.558789+00');
INSERT INTO public."Discentes" VALUES ('Feo', 'Muy Feo', 'jperez@example.com', '2002-06-15', 'Aspe', '46245dea-f574-4e85-b00b-51537eee5d5d', NULL, '2025-05-12 15:16:02.558789+00');


--
-- TOC entry 3997 (class 0 OID 29877)
-- Dependencies: 301
-- Data for Name: Evaluaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Evaluaciones" VALUES ('2024-12-23 16:57:35.875658+00', 'Evaluación Final', '2025-04-01', '2025-06-20', 'Evaluación final', 3, '024a3941-68fd-4037-8ec3-45be8ba27a4a', '15726b48-92d4-4741-9b10-70f5181416ce');
INSERT INTO public."Evaluaciones" VALUES ('2024-12-23 16:57:35.875658+00', 'Primera Evaluación', '2024-10-01', '2024-12-20', 'Evaluación inicial', 1, '60aac5f9-be85-4247-9ba5-7d507a316a17', '15726b48-92d4-4741-9b10-70f5181416ce');
INSERT INTO public."Evaluaciones" VALUES ('2024-12-23 16:57:35.875658+00', 'Segunda Evaluación', '2025-01-15', '2025-03-30', 'Evaluación intermedia', 2, 'b4d1a473-948e-4e54-8467-5db73c296d7d', '15726b48-92d4-4741-9b10-70f5181416ce');
INSERT INTO public."Evaluaciones" VALUES ('2025-05-10 07:42:35.777493+00', 'Primera evaluación 2024/25', NULL, NULL, 'Evaluación primera', 1, '941df919-2132-44bf-90b2-b6062f4f0498', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8');
INSERT INTO public."Evaluaciones" VALUES ('2025-05-10 07:43:36.408724+00', 'Segunda Evaluación', NULL, NULL, 'Evaluación segunda', 4, 'de2bed9f-0999-4e43-a600-3101c2958fb9', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8');
INSERT INTO public."Evaluaciones" VALUES ('2025-05-10 07:48:08.664212+00', 'Evaluación global', NULL, NULL, '', 2, 'e8ce2635-764f-43db-a361-dfc227e84572', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8');
INSERT INTO public."Evaluaciones" VALUES ('2025-05-13 10:32:00.56001+00', 'Primera evaluación Blender', NULL, NULL, '', NULL, '5d5644fd-82d0-494e-97ee-6bcac2bf6dff', '15726b48-92d4-4741-9b10-70f5181416ce');
INSERT INTO public."Evaluaciones" VALUES ('2025-05-13 10:32:54.270265+00', 'Segunda evaluación Blender', NULL, NULL, '', NULL, '2a8cba13-1661-40ac-8aae-3f260d1f110e', '15726b48-92d4-4741-9b10-70f5181416ce');
INSERT INTO public."Evaluaciones" VALUES ('2025-05-13 10:33:34.536737+00', 'Evaluación final Blender', NULL, NULL, '', NULL, 'b45abef5-2bdf-4cef-8f7a-5583d25a83dc', '15726b48-92d4-4741-9b10-70f5181416ce');
INSERT INTO public."Evaluaciones" VALUES ('2025-05-13 10:37:59.793326+00', 'Evaluación segunda DIW', NULL, NULL, '', NULL, '2ba2a765-654c-4e99-b0b6-52a0076bbae9', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8');
INSERT INTO public."Evaluaciones" VALUES ('2025-05-13 10:40:03.006666+00', 'Evaluación Final DIW', NULL, NULL, '', NULL, '5801183e-3dd3-46e7-b770-08c96982a12d', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8');
INSERT INTO public."Evaluaciones" VALUES ('2025-05-13 10:37:17.121586+00', 'Evaluación primera DIW', NULL, NULL, '', NULL, '5e95a54a-6da9-45c7-a217-a2fe0b069ac0', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8');


--
-- TOC entry 3998 (class 0 OID 29886)
-- Dependencies: 302
-- Data for Name: Modulos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Modulos" VALUES ('2025-03-11 12:24:31.301724+00', 'Montaje y mantenimiento de equipos', 'MME', 'En este módulo se aprende a ensamblar y mantener equipos informáticos, identificando y solucionando posibles fallos de hardware.', '3e0d4355-eca3-4fc4-954b-6342b6a99c9d', '56951ab9-cc40-421b-84ce-730b167edbfe');
INSERT INTO public."Modulos" VALUES ('2025-03-11 12:24:31.301724+00', 'Sistemas operativos monopuesto', 'SOM', 'Se centra en la instalación, configuración y administración de sistemas operativos en equipos individuales, asegurando su correcto funcionamiento.', '02617676-b7aa-4b2d-b913-f902097183a7', '56951ab9-cc40-421b-84ce-730b167edbfe');
INSERT INTO public."Modulos" VALUES ('2025-03-11 12:24:31.301724+00', 'Sistemas operativos en red', 'SOR', 'Este módulo aborda la instalación y gestión de sistemas operativos diseñados para funcionar en entornos de red, facilitando la comunicación y el intercambio de recursos entre equipos.', '0fff16bd-b8bb-4746-b574-29eda9e04d45', '56951ab9-cc40-421b-84ce-730b167edbfe');
INSERT INTO public."Modulos" VALUES ('2025-03-11 12:24:31.301724+00', 'Aplicaciones ofimáticas', 'AOF', 'Se adquieren habilidades en el uso de herramientas ofimáticas, como procesadores de texto, hojas de cálculo y software de presentaciones, esenciales para el entorno empresarial.', '451f9f42-25b8-42b5-a2f1-a70fe92563ef', '56951ab9-cc40-421b-84ce-730b167edbfe');
INSERT INTO public."Modulos" VALUES ('2025-03-11 12:24:31.301724+00', 'Administración de sistemas operativos', 'ASO', 'Se profundiza en la gestión avanzada de sistemas operativos, incluyendo la administración de servicios, la optimización del rendimiento y la implementación de políticas de seguridad para proteger la integridad del sistema.', 'ebc4d0ed-1bfc-4427-bd04-3d8620063220', '3eb505e1-d0d0-46eb-87bb-d4cbb7ff7833');
INSERT INTO public."Modulos" VALUES ('2025-03-11 12:24:31.301724+00', 'Fundamentos de hardware', 'FHW', 'Este módulo proporciona conocimientos sobre los componentes físicos de los sistemas informáticos, enseñando a identificar, montar y mantener hardware, así como a diagnosticar y solucionar problemas relacionados.', 'ab9e5c22-8a0f-421a-82ba-2d0d4fa6fbeb', '3eb505e1-d0d0-46eb-87bb-d4cbb7ff7833');
INSERT INTO public."Modulos" VALUES ('2025-03-11 12:24:31.301724+00', 'Desarrollo de Interfaces', 'DIN', 'Se aprende a diseñar y programar interfaces de usuario intuitivas y funcionales, considerando aspectos de usabilidad y experiencia del usuario (UX).', '38039f93-d31d-4e2e-a213-dd3113f282ae', '5f032c9e-08f1-41de-bc4c-19a3ac2827fe');
INSERT INTO public."Modulos" VALUES ('2025-03-11 12:24:31.301724+00', 'Implantación de sistemas operativos', 'ISO', 'Este módulo se centra en la instalación, configuración y administración de sistemas operativos, tanto en entornos monopuesto como en red. Los estudiantes aprenden a gestionar recursos, usuarios y permisos, asegurando el correcto funcionamiento del sistema.', '81ac77a1-5ec1-4462-ab3c-f11887ad37c1', '3eb505e1-d0d0-46eb-87bb-d4cbb7ff7833');
INSERT INTO public."Modulos" VALUES ('2025-03-11 12:24:31.301724+00', 'Diseño de Interfaces Web', 'DIW', 'Se trabajan principios de usabilidad, accesibilidad, experiencia de usuario (UX/UI) y diseño responsivo con CSS y frameworks como Bootstrap o Tailwind CSS. Se estudian herramientas de diseño como Figma.', '2122f6ea-9294-4e24-87cd-b2e8dbc14e1a', '36cabd1e-c173-495d-94fc-51bfe6df800d');
INSERT INTO public."Modulos" VALUES ('2025-03-11 12:24:31.301724+00', 'Desarrollo Web en Entorno Cliente', 'DWC', 'Se aprende a desarrollar la parte visual y dinámica de las aplicaciones web utilizando HTML, CSS y JavaScript. Se profundiza en frameworks y librerías como React, Vue.js o Angular, así como en la manipulación del DOM y AJAX para mejorar la experiencia del usuario.', '0cacc34d-36b1-435b-b51d-318d9c55d21c', '36cabd1e-c173-495d-94fc-51bfe6df800d');
INSERT INTO public."Modulos" VALUES ('2025-03-11 12:24:31.301724+00', 'Sistemas informáticos (DAW)', 'SIW', 'Se aprende a instalar, configurar y administrar sistemas operativos en entornos de servidor y cliente. Se abordan conceptos de hardware, redes, gestión de usuarios y permisos, virtualización y seguridad informática.', 'd6cde104-7477-4ec4-a2d5-488a779fbfeb', '36cabd1e-c173-495d-94fc-51bfe6df800d');
INSERT INTO public."Modulos" VALUES ('2025-03-11 12:24:31.301724+00', 'Sistemas de Gestión Empresarial', 'SGE', 'Una introducción al desarrollo y adaptación de soluciones informáticas para la gestión empresarial, incluyendo sistemas ERP y CRM, que optimizan procesos internos de las organizaciones.', '7e9898d4-5623-4e4c-99bb-f0d64b2ddf0f', '5f032c9e-08f1-41de-bc4c-19a3ac2827fe');
INSERT INTO public."Modulos" VALUES ('2025-03-11 12:24:31.301724+00', 'Programación de Servicios y Procesos', 'PSP', 'Se estudian técnicas para desarrollar servicios y procesos en segundo plano que permitan a las aplicaciones realizar tareas de manera eficiente, garantizando una adecuada gestión de recursos.', '6eda6257-1c5b-4e77-8c8c-64dbeabdba4b', '5f032c9e-08f1-41de-bc4c-19a3ac2827fe');
INSERT INTO public."Modulos" VALUES ('2025-03-11 12:24:31.301724+00', 'Sistemas informáticos (DAM)', 'SIM', 'Se aprende a instalar, configurar y administrar sistemas operativos en entornos de servidor y cliente. Se abordan conceptos de hardware, redes, gestión de usuarios y permisos, virtualización y seguridad informática.', '13b0ec2f-2c41-4574-baf5-44c113856983', '5f032c9e-08f1-41de-bc4c-19a3ac2827fe');
INSERT INTO public."Modulos" VALUES ('2025-03-11 12:24:31.301724+00', 'Programación y motores de videojuegos', 'PMV', 'Se centra en el uso de lenguajes de programación y motores gráficos para el desarrollo de videojuegos. Los estudiantes aprenden a implementar funcionalidades, físicas y lógica de juego, optimizando el rendimiento en diferentes plataformas.', '4b93ccc8-e684-4b4f-95d7-6c147c12ff56', 'a906f924-b287-4acf-a170-f743152c2aa3');
INSERT INTO public."Modulos" VALUES ('2025-03-11 12:24:31.301724+00', 'Diseño, gestión, publicación y producción', 'DGP', 'Este módulo aborda las fases de creación de un videojuego, desde la conceptualización de la idea hasta su implementación. Se estudian aspectos como mecánicas de juego, narrativa, diseño de niveles y experiencia del usuario.', 'a4a00b5e-c0f4-4361-80dd-76cd7d071f5b', 'a906f924-b287-4acf-a170-f743152c2aa3');
INSERT INTO public."Modulos" VALUES ('2025-03-11 12:24:31.301724+00', 'Diseño gráfico 2D y 3D', 'D23', 'Se enfoca en la creación de modelos tridimensionales y su animación para su uso en videojuegos y aplicaciones de realidad virtual. Los estudiantes aprenden técnicas de modelado, texturizado y rigging.', 'a453dc0e-5a1f-4a88-b6dd-7a0f666ab763', 'a906f924-b287-4acf-a170-f743152c2aa3');
INSERT INTO public."Modulos" VALUES ('2025-03-11 12:24:31.301724+00', 'Realidad virtual y realidad aumentada', 'RVA', 'Este módulo introduce a las tecnologías de realidad virtual (VR) y realidad aumentada (AR), enseñando a desarrollar aplicaciones inmersivas que integren elementos virtuales en entornos reales o completamente digitales.', '9959ed1a-40b6-48ee-9e19-770ae926853d', 'a906f924-b287-4acf-a170-f743152c2aa3');
INSERT INTO public."Modulos" VALUES ('2025-03-11 12:24:31.301724+00', 'Programación en red e inteligencia artificial', 'PRI', 'Está diseñado para que los estudiantes adquieran competencias en el desarrollo de aplicaciones que operan en entornos de red y que incorporan técnicas de inteligencia artificial (IA)', '786bbf7d-619f-4715-b423-fde00bbe47dd', 'a906f924-b287-4acf-a170-f743152c2aa3');


--
-- TOC entry 3999 (class 0 OID 29896)
-- Dependencies: 303
-- Data for Name: Practicas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Practicas" VALUES ('2024-12-23 16:55:03.734992+00', 'Práctica 2', '2.02', 'Diseño de una base de datos', 'Práctica intermedia', '2', 'Unidad 2', '34aa470d-9603-4c20-9630-18552f737374', '0cacc34d-36b1-435b-b51d-318d9c55d21c');
INSERT INTO public."Practicas" VALUES ('2024-12-23 16:55:52.895551+00', 'Práctica 2', '2.01', 'Diseño de una base de datos', 'Práctica intermedia', '2', 'Unidad 2', '4f9fce57-1519-4a3b-a41b-9a8b03aaa350', '0cacc34d-36b1-435b-b51d-318d9c55d21c');
INSERT INTO public."Practicas" VALUES ('2024-12-23 16:55:52.895551+00', 'Práctica 1', '1.01', 'Resolver ejercicios básicos de programación', 'Práctica introductoria', '1', 'Unidad 1', '78cda6f1-29dd-439e-9581-6252226dd457', '0cacc34d-36b1-435b-b51d-318d9c55d21c');
INSERT INTO public."Practicas" VALUES ('2024-12-23 16:55:03.734992+00', 'Práctica 4.01', '4.01', 'Desarrollar una página web interactiva chula', 'Práctica avanzada', '3', 'Unidad 3', '8c05faff-cff6-40ae-a6a9-d0f97fb3168b', '0cacc34d-36b1-435b-b51d-318d9c55d21c');
INSERT INTO public."Practicas" VALUES ('2024-12-23 16:55:03.734992+00', 'Práctica 1', '1.02', 'Resolver ejercicios básicos de programación', 'Práctica introductoria', '1', 'Unidad 1', 'bef77cbb-4232-474b-8b8a-fa4b5ec980d1', '0cacc34d-36b1-435b-b51d-318d9c55d21c');
INSERT INTO public."Practicas" VALUES ('2024-12-23 16:55:52.895551+00', 'Práctica 3', '3.01', 'Desarrollar una página web interactiva', 'Práctica avanzada', '3', 'Unidad 3', 'dab273c3-5f11-4df7-9098-5eec77503741', '0cacc34d-36b1-435b-b51d-318d9c55d21c');
INSERT INTO public."Practicas" VALUES ('2025-05-12 15:31:06.171574+00', 'Práctica 1', '1.02', 'HTML 5.0 rápido', 'Práctica introductoria', '1', 'Unidad 1', '0560b5ff-0990-46c9-8da3-721853080531', '2122f6ea-9294-4e24-87cd-b2e8dbc14e1a');
INSERT INTO public."Practicas" VALUES ('2025-05-12 15:31:06.171574+00', 'Práctica 2', '3.03', 'Composición con Blender', 'Práctica intermedia', '2', 'Unidad 2', '255af85a-79b3-4895-a3f2-666c634e6a6d', 'a453dc0e-5a1f-4a88-b6dd-7a0f666ab763');
INSERT INTO public."Practicas" VALUES ('2025-05-12 15:31:06.171574+00', 'Práctica 3', '2.02', 'Texturas con Blender', 'Práctica avanzada', '3', 'Unidad 3', '2a88b755-5eac-4091-b1ea-ac98086c40cb', 'a453dc0e-5a1f-4a88-b6dd-7a0f666ab763');
INSERT INTO public."Practicas" VALUES ('2025-05-12 15:31:06.171574+00', 'Práctica 2', '2.04', 'Media Quieries en CSS 3.0', 'Práctica intermedia', '2', 'Unidad 2', '36bc742f-7111-46e7-926f-650caac77f44', '2122f6ea-9294-4e24-87cd-b2e8dbc14e1a');
INSERT INTO public."Practicas" VALUES ('2025-05-12 15:31:06.171574+00', 'Práctica 2', '1.02', 'Primeros pasos con Blender', 'Práctica intermedia', '2', 'Unidad 2', '3e040224-2228-476b-ab74-1970f1613ce3', 'a453dc0e-5a1f-4a88-b6dd-7a0f666ab763');
INSERT INTO public."Practicas" VALUES ('2025-05-12 15:31:06.171574+00', 'Práctica 3', '3.01', 'Grease Pencil con Blender', 'Práctica avanzada', '3', 'Unidad 3', '424de016-3e13-42dd-b6aa-3d5bca27aee4', 'a453dc0e-5a1f-4a88-b6dd-7a0f666ab763');
INSERT INTO public."Practicas" VALUES ('2025-05-12 15:31:06.171574+00', 'Práctica 2', '1.01', 'Introducción al diseño 3D', 'Práctica intermedia', '2', 'Unidad 2', '46bbc8a7-08bf-47e7-874f-5d994c9c6cad', 'a453dc0e-5a1f-4a88-b6dd-7a0f666ab763');
INSERT INTO public."Practicas" VALUES ('2025-05-12 15:31:06.171574+00', 'Práctica 2', '2.01', 'Introducción a CSS 3.0', 'Práctica intermedia', '2', 'Unidad 2', '4f0df88c-fa92-41fe-b8c6-5e96bda71579', '2122f6ea-9294-4e24-87cd-b2e8dbc14e1a');
INSERT INTO public."Practicas" VALUES ('2025-05-12 15:31:06.171574+00', 'Práctica 3', '3.01', 'Introducción a la maquetación', 'Práctica avanzada', '3', 'Unidad 3', '6f58595c-b631-4f7e-8be1-86bd9c33a967', '2122f6ea-9294-4e24-87cd-b2e8dbc14e1a');
INSERT INTO public."Practicas" VALUES ('2025-05-12 15:31:06.171574+00', 'Práctica 2', '3.02', 'Precedures con Blender', 'Práctica intermedia', '2', 'Unidad 2', '8436a151-ac7e-444a-8237-07e5ec5a10e2', 'a453dc0e-5a1f-4a88-b6dd-7a0f666ab763');
INSERT INTO public."Practicas" VALUES ('2025-05-12 15:31:06.171574+00', 'Práctica 1', '1.01', 'Introducción al diseño de interfaces', 'Práctica introductoria', '1', 'Unidad 1', '85e9b6bc-f7f7-4f99-81d7-df7cb8b139f1', '2122f6ea-9294-4e24-87cd-b2e8dbc14e1a');
INSERT INTO public."Practicas" VALUES ('2025-05-12 15:31:06.171574+00', 'Práctica 1', '2.01', 'Modelado con Blender', 'Práctica introductoria', '1', 'Unidad 1', '8fa3542a-2225-4ba3-a5e3-1907a9553551', 'a453dc0e-5a1f-4a88-b6dd-7a0f666ab763');
INSERT INTO public."Practicas" VALUES ('2025-05-12 15:31:06.171574+00', 'Práctica 3', '3.02', 'Maquetación avanzada', 'Práctica avanzada', '3', 'Unidad 3', 'bc4d3f14-d969-485b-b665-374e780fc378', '2122f6ea-9294-4e24-87cd-b2e8dbc14e1a');
INSERT INTO public."Practicas" VALUES ('2025-05-12 15:31:06.171574+00', 'Práctica 2', '2.02', 'CSS 3.0 intermedio', 'Práctica intermedia', '2', 'Unidad 2', 'c332d5ea-a589-480d-a839-315bd8a20522', '2122f6ea-9294-4e24-87cd-b2e8dbc14e1a');
INSERT INTO public."Practicas" VALUES ('2025-05-12 15:31:06.171574+00', 'Práctica 2', '2.03', 'Posicionamiento en CSS 3.0', 'Práctica intermedia', '2', 'Unidad 2', 'c98776fe-e0fc-4292-9b33-e687a4cb5214', '2122f6ea-9294-4e24-87cd-b2e8dbc14e1a');
INSERT INTO public."Practicas" VALUES ('2025-05-12 15:31:06.171574+00', 'Práctica 1', '2.03', 'Animaciones con Blender', 'Práctica introductoria', '1', 'Unidad 1', 'f9a91ca9-f61b-47d9-95b5-4e0d4a6efc10', 'a453dc0e-5a1f-4a88-b6dd-7a0f666ab763');


--
-- TOC entry 4000 (class 0 OID 29908)
-- Dependencies: 304
-- Data for Name: TipoEvaluacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."TipoEvaluacion" VALUES (1, '2024-12-23 16:57:35.875658+00', 'Parcial', 'Evaluación parcial de contenidos');
INSERT INTO public."TipoEvaluacion" VALUES (2, '2024-12-23 16:57:35.875658+00', 'Global', 'Evaluación global del módulo');
INSERT INTO public."TipoEvaluacion" VALUES (3, '2024-12-23 16:57:35.875658+00', 'Extraordinaria', 'Evaluación para recuperación');
INSERT INTO public."TipoEvaluacion" VALUES (4, '2025-02-13 15:41:43.932251+00', 'Final', 'Evaluación final del módulo');


--
-- TOC entry 4002 (class 0 OID 29917)
-- Dependencies: 306
-- Data for Name: TipoPracticas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."TipoPracticas" VALUES (1, '2024-12-23 16:50:56.799831+00', 'Individual', 'Práctica realizada de forma individual');
INSERT INTO public."TipoPracticas" VALUES (2, '2024-12-23 16:50:56.799831+00', 'Grupal', 'Práctica realizada en equipo');
INSERT INTO public."TipoPracticas" VALUES (3, '2024-12-23 16:50:56.799831+00', 'Proyecto', 'Proyecto complejo integrador');
INSERT INTO public."TipoPracticas" VALUES (4, '2024-12-23 16:58:25.454745+00', 'Individual', 'Práctica realizada de forma individual');
INSERT INTO public."TipoPracticas" VALUES (5, '2024-12-23 16:58:25.454745+00', 'Grupal', 'Práctica realizada en equipo');
INSERT INTO public."TipoPracticas" VALUES (6, '2024-12-23 16:58:25.454745+00', 'Proyecto', 'Proyecto complejo integrador');


--
-- TOC entry 4010 (class 0 OID 62653)
-- Dependencies: 324
-- Data for Name: disponen; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.disponen VALUES ('7918e91d-d382-4aa8-a276-909f4ce5b20c', '2025-05-13 10:42:44.024703+00', NULL, '78cda6f1-29dd-439e-9581-6252226dd457', '024a3941-68fd-4037-8ec3-45be8ba27a4a');
INSERT INTO public.disponen VALUES ('94d95003-1c01-47ee-adde-6a7d5a5e2caa', '2025-05-13 10:42:44.024703+00', NULL, '8c05faff-cff6-40ae-a6a9-d0f97fb3168b', '024a3941-68fd-4037-8ec3-45be8ba27a4a');
INSERT INTO public.disponen VALUES ('14821eb5-46dc-4987-81c5-9a4469643ec3', '2025-05-13 10:42:44.024703+00', NULL, '4f9fce57-1519-4a3b-a41b-9a8b03aaa350', '024a3941-68fd-4037-8ec3-45be8ba27a4a');
INSERT INTO public.disponen VALUES ('6efb69bd-36eb-4b80-96b5-7e8ec6a14236', '2025-05-13 10:42:44.024703+00', NULL, 'bef77cbb-4232-474b-8b8a-fa4b5ec980d1', '024a3941-68fd-4037-8ec3-45be8ba27a4a');
INSERT INTO public.disponen VALUES ('28d0a7c3-a2b2-456d-a022-a5952044ca62', '2025-05-13 10:42:44.024703+00', NULL, 'dab273c3-5f11-4df7-9098-5eec77503741', '024a3941-68fd-4037-8ec3-45be8ba27a4a');
INSERT INTO public.disponen VALUES ('b41db179-9707-4fa1-b5a3-14fefd2252d7', '2025-05-13 10:42:44.024703+00', NULL, '78cda6f1-29dd-439e-9581-6252226dd457', '60aac5f9-be85-4247-9ba5-7d507a316a17');
INSERT INTO public.disponen VALUES ('5f253ab8-57e6-415b-af9f-2cdcbc9d7f68', '2025-05-13 10:42:44.024703+00', NULL, '8c05faff-cff6-40ae-a6a9-d0f97fb3168b', '60aac5f9-be85-4247-9ba5-7d507a316a17');
INSERT INTO public.disponen VALUES ('48781f45-d51f-4572-9819-b606cf19d8ce', '2025-05-13 10:42:44.024703+00', NULL, '4f9fce57-1519-4a3b-a41b-9a8b03aaa350', '60aac5f9-be85-4247-9ba5-7d507a316a17');
INSERT INTO public.disponen VALUES ('fe8a4845-d1cd-4f08-a829-b498166e56a3', '2025-05-13 10:42:44.024703+00', NULL, 'bef77cbb-4232-474b-8b8a-fa4b5ec980d1', '60aac5f9-be85-4247-9ba5-7d507a316a17');
INSERT INTO public.disponen VALUES ('e2f99972-e564-4c03-a8a9-c7b8aac2a491', '2025-05-13 10:42:44.024703+00', NULL, 'dab273c3-5f11-4df7-9098-5eec77503741', '60aac5f9-be85-4247-9ba5-7d507a316a17');
INSERT INTO public.disponen VALUES ('00d29ef7-c47d-4226-8d0a-49c8a61499e5', '2025-05-13 10:42:44.024703+00', NULL, '78cda6f1-29dd-439e-9581-6252226dd457', 'b4d1a473-948e-4e54-8467-5db73c296d7d');
INSERT INTO public.disponen VALUES ('8d6bea59-1d87-4815-8642-e50f201669fd', '2025-05-13 10:42:44.024703+00', NULL, '8c05faff-cff6-40ae-a6a9-d0f97fb3168b', 'b4d1a473-948e-4e54-8467-5db73c296d7d');
INSERT INTO public.disponen VALUES ('7561f269-cb85-4a29-816f-13114000b498', '2025-05-13 10:42:44.024703+00', NULL, '4f9fce57-1519-4a3b-a41b-9a8b03aaa350', 'b4d1a473-948e-4e54-8467-5db73c296d7d');
INSERT INTO public.disponen VALUES ('1a7e4dc7-74db-4bc7-b9d1-b59531efefab', '2025-05-13 10:42:44.024703+00', NULL, 'bef77cbb-4232-474b-8b8a-fa4b5ec980d1', 'b4d1a473-948e-4e54-8467-5db73c296d7d');
INSERT INTO public.disponen VALUES ('59111b02-f859-4c89-b53d-9a0ee67ebafc', '2025-05-13 10:42:44.024703+00', NULL, 'dab273c3-5f11-4df7-9098-5eec77503741', 'b4d1a473-948e-4e54-8467-5db73c296d7d');
INSERT INTO public.disponen VALUES ('4d3ed54e-d654-4de7-b60c-bd9a0d526ba2', '2025-05-13 10:42:44.024703+00', NULL, '78cda6f1-29dd-439e-9581-6252226dd457', '941df919-2132-44bf-90b2-b6062f4f0498');
INSERT INTO public.disponen VALUES ('c73216cc-47ca-4de9-b51b-b1bd317c7356', '2025-05-13 10:42:44.024703+00', NULL, '8c05faff-cff6-40ae-a6a9-d0f97fb3168b', '941df919-2132-44bf-90b2-b6062f4f0498');
INSERT INTO public.disponen VALUES ('71c93fc4-2c7d-49c2-ab0f-985af65ddb9a', '2025-05-13 10:42:44.024703+00', NULL, '4f9fce57-1519-4a3b-a41b-9a8b03aaa350', '941df919-2132-44bf-90b2-b6062f4f0498');
INSERT INTO public.disponen VALUES ('3e8490d4-bf14-47fd-83ff-f4f750cbd3cf', '2025-05-13 10:42:44.024703+00', NULL, 'bef77cbb-4232-474b-8b8a-fa4b5ec980d1', '941df919-2132-44bf-90b2-b6062f4f0498');
INSERT INTO public.disponen VALUES ('ca184900-5318-40b7-99a0-adb69f66e321', '2025-05-13 10:42:44.024703+00', NULL, 'dab273c3-5f11-4df7-9098-5eec77503741', '941df919-2132-44bf-90b2-b6062f4f0498');
INSERT INTO public.disponen VALUES ('679087ed-f62b-4f75-a2e7-b7eb8d31290b', '2025-05-13 10:42:44.024703+00', NULL, '78cda6f1-29dd-439e-9581-6252226dd457', 'de2bed9f-0999-4e43-a600-3101c2958fb9');
INSERT INTO public.disponen VALUES ('5d2c9d38-69cd-4cc2-97f1-a85085f22bbf', '2025-05-13 10:42:44.024703+00', NULL, '8c05faff-cff6-40ae-a6a9-d0f97fb3168b', 'de2bed9f-0999-4e43-a600-3101c2958fb9');
INSERT INTO public.disponen VALUES ('8fd0a90b-e291-4409-9ce3-a6d310c5cb27', '2025-05-13 10:42:44.024703+00', NULL, '4f9fce57-1519-4a3b-a41b-9a8b03aaa350', 'de2bed9f-0999-4e43-a600-3101c2958fb9');
INSERT INTO public.disponen VALUES ('20283f98-45cf-44c9-92d7-f2694d2e4c35', '2025-05-13 10:42:44.024703+00', NULL, 'bef77cbb-4232-474b-8b8a-fa4b5ec980d1', 'de2bed9f-0999-4e43-a600-3101c2958fb9');
INSERT INTO public.disponen VALUES ('b01c40e2-858e-492c-80a0-c978ae129242', '2025-05-13 10:42:44.024703+00', NULL, 'dab273c3-5f11-4df7-9098-5eec77503741', 'de2bed9f-0999-4e43-a600-3101c2958fb9');
INSERT INTO public.disponen VALUES ('5c3f19fd-6101-4029-8ea0-ea1f6961bae9', '2025-05-13 10:42:44.024703+00', NULL, '78cda6f1-29dd-439e-9581-6252226dd457', 'e8ce2635-764f-43db-a361-dfc227e84572');
INSERT INTO public.disponen VALUES ('af3b1598-a1b9-4a22-a25c-71d212536f66', '2025-05-13 10:42:44.024703+00', NULL, '8c05faff-cff6-40ae-a6a9-d0f97fb3168b', 'e8ce2635-764f-43db-a361-dfc227e84572');
INSERT INTO public.disponen VALUES ('d2c6a6ba-ea6a-4d73-bd85-8a4f7c9a9ab0', '2025-05-13 10:42:44.024703+00', NULL, '4f9fce57-1519-4a3b-a41b-9a8b03aaa350', 'e8ce2635-764f-43db-a361-dfc227e84572');
INSERT INTO public.disponen VALUES ('17503718-d000-4af6-9e0f-f82354e02fa0', '2025-05-13 10:42:44.024703+00', NULL, 'bef77cbb-4232-474b-8b8a-fa4b5ec980d1', 'e8ce2635-764f-43db-a361-dfc227e84572');
INSERT INTO public.disponen VALUES ('a54842d1-4393-4a95-b30d-53b82f438498', '2025-05-13 10:42:44.024703+00', NULL, 'dab273c3-5f11-4df7-9098-5eec77503741', 'e8ce2635-764f-43db-a361-dfc227e84572');
INSERT INTO public.disponen VALUES ('33c8a562-13e8-442f-9592-2692b5801631', '2025-05-13 10:42:44.024703+00', NULL, '255af85a-79b3-4895-a3f2-666c634e6a6d', '5d5644fd-82d0-494e-97ee-6bcac2bf6dff');
INSERT INTO public.disponen VALUES ('bf69c332-976c-4178-8474-3bb6afa6f0b0', '2025-05-13 10:42:44.024703+00', NULL, '2a88b755-5eac-4091-b1ea-ac98086c40cb', '5d5644fd-82d0-494e-97ee-6bcac2bf6dff');
INSERT INTO public.disponen VALUES ('943b2953-5942-488e-a0b0-7c19a5c39f11', '2025-05-13 10:42:44.024703+00', NULL, '3e040224-2228-476b-ab74-1970f1613ce3', '5d5644fd-82d0-494e-97ee-6bcac2bf6dff');
INSERT INTO public.disponen VALUES ('9f52895c-a95e-4717-99c2-9560cba3e816', '2025-05-13 10:42:44.024703+00', NULL, '424de016-3e13-42dd-b6aa-3d5bca27aee4', '5d5644fd-82d0-494e-97ee-6bcac2bf6dff');
INSERT INTO public.disponen VALUES ('9a92db05-ed5f-4c06-8fef-443311bf4328', '2025-05-13 10:42:44.024703+00', NULL, '46bbc8a7-08bf-47e7-874f-5d994c9c6cad', '2a8cba13-1661-40ac-8aae-3f260d1f110e');
INSERT INTO public.disponen VALUES ('57e6f2e7-d83d-4fb2-937f-7307d0a73249', '2025-05-13 10:42:44.024703+00', NULL, '8436a151-ac7e-444a-8237-07e5ec5a10e2', '2a8cba13-1661-40ac-8aae-3f260d1f110e');
INSERT INTO public.disponen VALUES ('19f44db2-d17f-468b-b4e0-b62a43d3337d', '2025-05-13 10:42:44.024703+00', NULL, '8fa3542a-2225-4ba3-a5e3-1907a9553551', '2a8cba13-1661-40ac-8aae-3f260d1f110e');
INSERT INTO public.disponen VALUES ('ec267b8c-34a3-4bd0-8675-590a50bf9abe', '2025-05-13 10:42:44.024703+00', NULL, 'f9a91ca9-f61b-47d9-95b5-4e0d4a6efc10', '2a8cba13-1661-40ac-8aae-3f260d1f110e');
INSERT INTO public.disponen VALUES ('b558d315-1671-4f02-a0a6-e6afcba38415', '2025-05-13 10:42:44.024703+00', NULL, '255af85a-79b3-4895-a3f2-666c634e6a6d', 'b45abef5-2bdf-4cef-8f7a-5583d25a83dc');
INSERT INTO public.disponen VALUES ('3c30ef47-cea4-4f65-b3a1-154ac31f8f6f', '2025-05-13 10:42:44.024703+00', NULL, '2a88b755-5eac-4091-b1ea-ac98086c40cb', 'b45abef5-2bdf-4cef-8f7a-5583d25a83dc');
INSERT INTO public.disponen VALUES ('9c646c5a-976c-46fc-b879-a6fa1e62dcec', '2025-05-13 10:42:44.024703+00', NULL, '3e040224-2228-476b-ab74-1970f1613ce3', 'b45abef5-2bdf-4cef-8f7a-5583d25a83dc');
INSERT INTO public.disponen VALUES ('ca3ea4ad-056f-4a86-8be3-2a8466975a1e', '2025-05-13 10:42:44.024703+00', NULL, '424de016-3e13-42dd-b6aa-3d5bca27aee4', 'b45abef5-2bdf-4cef-8f7a-5583d25a83dc');
INSERT INTO public.disponen VALUES ('f43aad59-c4b5-4f24-ae66-34409db806e1', '2025-05-13 10:42:44.024703+00', NULL, '46bbc8a7-08bf-47e7-874f-5d994c9c6cad', 'b45abef5-2bdf-4cef-8f7a-5583d25a83dc');
INSERT INTO public.disponen VALUES ('051554be-0796-43e5-91c7-05de08056158', '2025-05-13 10:42:44.024703+00', NULL, '8436a151-ac7e-444a-8237-07e5ec5a10e2', 'b45abef5-2bdf-4cef-8f7a-5583d25a83dc');
INSERT INTO public.disponen VALUES ('50f4f8d2-9181-4f82-aa51-316cbbf676ff', '2025-05-13 10:42:44.024703+00', NULL, '8fa3542a-2225-4ba3-a5e3-1907a9553551', 'b45abef5-2bdf-4cef-8f7a-5583d25a83dc');
INSERT INTO public.disponen VALUES ('e07e4428-d03b-4e1c-9865-adae9edcfcae', '2025-05-13 10:42:44.024703+00', NULL, 'f9a91ca9-f61b-47d9-95b5-4e0d4a6efc10', 'b45abef5-2bdf-4cef-8f7a-5583d25a83dc');
INSERT INTO public.disponen VALUES ('d3607628-72ff-4038-8d9a-1e40358ff39d', '2025-05-13 10:42:44.024703+00', NULL, '0560b5ff-0990-46c9-8da3-721853080531', '5e95a54a-6da9-45c7-a217-a2fe0b069ac0');
INSERT INTO public.disponen VALUES ('b5551edd-05ef-4179-b7ad-7c411dbcd888', '2025-05-13 10:42:44.024703+00', NULL, '36bc742f-7111-46e7-926f-650caac77f44', '5e95a54a-6da9-45c7-a217-a2fe0b069ac0');
INSERT INTO public.disponen VALUES ('6075a64d-fe72-402c-bd4b-7c6e758c342d', '2025-05-13 10:42:44.024703+00', NULL, '4f0df88c-fa92-41fe-b8c6-5e96bda71579', '5e95a54a-6da9-45c7-a217-a2fe0b069ac0');
INSERT INTO public.disponen VALUES ('e6594aa8-8e02-4a29-b066-a7d7b3bffd4c', '2025-05-13 10:42:44.024703+00', NULL, '6f58595c-b631-4f7e-8be1-86bd9c33a967', '5e95a54a-6da9-45c7-a217-a2fe0b069ac0');
INSERT INTO public.disponen VALUES ('d4451c01-8e01-41c8-8e39-2d356af50a32', '2025-05-13 10:42:44.024703+00', NULL, '85e9b6bc-f7f7-4f99-81d7-df7cb8b139f1', '2ba2a765-654c-4e99-b0b6-52a0076bbae9');
INSERT INTO public.disponen VALUES ('d4b44209-94b2-4a6b-a270-87a0deeb160e', '2025-05-13 10:42:44.024703+00', NULL, 'bc4d3f14-d969-485b-b665-374e780fc378', '2ba2a765-654c-4e99-b0b6-52a0076bbae9');
INSERT INTO public.disponen VALUES ('771a6e8c-7dc9-4dba-912c-a045121b3f4c', '2025-05-13 10:42:44.024703+00', NULL, 'c332d5ea-a589-480d-a839-315bd8a20522', '2ba2a765-654c-4e99-b0b6-52a0076bbae9');
INSERT INTO public.disponen VALUES ('18916235-e7fc-4ee0-952f-e96639ea9cab', '2025-05-13 10:42:44.024703+00', NULL, 'c98776fe-e0fc-4292-9b33-e687a4cb5214', '2ba2a765-654c-4e99-b0b6-52a0076bbae9');
INSERT INTO public.disponen VALUES ('aedd063e-26d5-4ee7-bba5-27761d63c0b9', '2025-05-13 10:42:44.024703+00', NULL, '0560b5ff-0990-46c9-8da3-721853080531', '5801183e-3dd3-46e7-b770-08c96982a12d');
INSERT INTO public.disponen VALUES ('8ddf36a0-372d-4309-844a-326d234a2c76', '2025-05-13 10:42:44.024703+00', NULL, '36bc742f-7111-46e7-926f-650caac77f44', '5801183e-3dd3-46e7-b770-08c96982a12d');
INSERT INTO public.disponen VALUES ('40b9e99f-7780-4508-823e-2640ffb38a06', '2025-05-13 10:42:44.024703+00', NULL, '4f0df88c-fa92-41fe-b8c6-5e96bda71579', '5801183e-3dd3-46e7-b770-08c96982a12d');
INSERT INTO public.disponen VALUES ('e341c748-4fad-4c7c-b11f-add6be3cf47d', '2025-05-13 10:42:44.024703+00', NULL, '6f58595c-b631-4f7e-8be1-86bd9c33a967', '5801183e-3dd3-46e7-b770-08c96982a12d');
INSERT INTO public.disponen VALUES ('96333ae9-ce52-469d-80c5-816e9c0b5ae6', '2025-05-13 10:42:44.024703+00', NULL, '85e9b6bc-f7f7-4f99-81d7-df7cb8b139f1', '5801183e-3dd3-46e7-b770-08c96982a12d');
INSERT INTO public.disponen VALUES ('5c06da99-7449-4a9a-ba85-913eb34dac2d', '2025-05-13 10:42:44.024703+00', NULL, 'bc4d3f14-d969-485b-b665-374e780fc378', '5801183e-3dd3-46e7-b770-08c96982a12d');
INSERT INTO public.disponen VALUES ('1129d0af-d041-4442-9b1b-14240285920f', '2025-05-13 10:42:44.024703+00', NULL, 'c332d5ea-a589-480d-a839-315bd8a20522', '5801183e-3dd3-46e7-b770-08c96982a12d');
INSERT INTO public.disponen VALUES ('b7ee0deb-4bef-46a5-bbaa-233d148c6100', '2025-05-13 10:42:44.024703+00', NULL, 'c98776fe-e0fc-4292-9b33-e687a4cb5214', '5801183e-3dd3-46e7-b770-08c96982a12d');


--
-- TOC entry 4004 (class 0 OID 29936)
-- Dependencies: 308
-- Data for Name: evaluan; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.evaluan VALUES ('2025-05-05 08:38:49.032179+00', 10, '78cc6a2d-8c2e-4b70-83a3-71077eed5ae8', '78cda6f1-29dd-439e-9581-6252226dd457', '60aac5f9-be85-4247-9ba5-7d507a316a17', 'c168177d-04c3-4fcb-8d62-9239391e9933', 85);
INSERT INTO public.evaluan VALUES ('2025-05-05 08:38:49.032179+00', 20, '7ad13ee4-a961-4aa9-816d-5e4065e7393b', '4f9fce57-1519-4a3b-a41b-9a8b03aaa350', '60aac5f9-be85-4247-9ba5-7d507a316a17', 'c168177d-04c3-4fcb-8d62-9239391e9933', 15);
INSERT INTO public.evaluan VALUES ('2025-05-05 08:38:49.032179+00', 10, '318f655a-a7da-49ba-8c88-110de81b5850', '78cda6f1-29dd-439e-9581-6252226dd457', '60aac5f9-be85-4247-9ba5-7d507a316a17', 'c168177d-04c3-4fcb-8d62-9239391e9933', 25);
INSERT INTO public.evaluan VALUES ('2025-05-05 08:38:49.032179+00', 10, 'de777f2e-3cab-4ffe-bd0a-0c57e3558b4e', '8c05faff-cff6-40ae-a6a9-d0f97fb3168b', '60aac5f9-be85-4247-9ba5-7d507a316a17', 'c168177d-04c3-4fcb-8d62-9239391e9933', 45);
INSERT INTO public.evaluan VALUES ('2025-05-05 08:38:49.032179+00', 20, 'e04f4e46-534a-44f3-bb76-e4293efaead7', 'bef77cbb-4232-474b-8b8a-fa4b5ec980d1', '60aac5f9-be85-4247-9ba5-7d507a316a17', 'c168177d-04c3-4fcb-8d62-9239391e9933', 50);
INSERT INTO public.evaluan VALUES ('2025-05-05 08:38:49.032179+00', 30, '315aeb4a-42af-406d-9ca6-f1380ec8c81d', 'dab273c3-5f11-4df7-9098-5eec77503741', '60aac5f9-be85-4247-9ba5-7d507a316a17', 'c168177d-04c3-4fcb-8d62-9239391e9933', 20);
INSERT INTO public.evaluan VALUES ('2025-05-05 08:38:49.032179+00', 10, 'fc814e90-6516-4cbd-bff2-db3a341bb933', '78cda6f1-29dd-439e-9581-6252226dd457', '60aac5f9-be85-4247-9ba5-7d507a316a17', 'bed3e57a-9aff-4025-8177-aeb842762706', 15);
INSERT INTO public.evaluan VALUES ('2025-05-05 08:38:49.032179+00', 20, '9ceda7f3-9d8e-4ebf-8392-cc8b8b38f248', '4f9fce57-1519-4a3b-a41b-9a8b03aaa350', '60aac5f9-be85-4247-9ba5-7d507a316a17', 'bed3e57a-9aff-4025-8177-aeb842762706', 25);
INSERT INTO public.evaluan VALUES ('2025-05-05 08:38:49.032179+00', 10, 'f7227c9c-453f-4522-a2b2-72ba840fc0f3', '78cda6f1-29dd-439e-9581-6252226dd457', '60aac5f9-be85-4247-9ba5-7d507a316a17', 'bed3e57a-9aff-4025-8177-aeb842762706', 85);
INSERT INTO public.evaluan VALUES ('2025-05-05 08:38:49.032179+00', 10, '22cbe999-9df2-432d-8884-553b76c0f99b', '8c05faff-cff6-40ae-a6a9-d0f97fb3168b', '60aac5f9-be85-4247-9ba5-7d507a316a17', 'bed3e57a-9aff-4025-8177-aeb842762706', 75);
INSERT INTO public.evaluan VALUES ('2025-05-05 08:38:49.032179+00', 20, '39970822-3a40-4c15-8bb1-96e327d345fd', 'bef77cbb-4232-474b-8b8a-fa4b5ec980d1', '60aac5f9-be85-4247-9ba5-7d507a316a17', 'bed3e57a-9aff-4025-8177-aeb842762706', 90);
INSERT INTO public.evaluan VALUES ('2025-05-05 08:38:49.032179+00', 30, '5184a8df-7182-4de4-8d51-2cbdbb8bed0e', 'dab273c3-5f11-4df7-9098-5eec77503741', '60aac5f9-be85-4247-9ba5-7d507a316a17', 'bed3e57a-9aff-4025-8177-aeb842762706', 10);
INSERT INTO public.evaluan VALUES ('2025-05-05 08:38:49.032179+00', 10, '76c58d20-1473-4bd0-be35-cb0cd1186be9', '78cda6f1-29dd-439e-9581-6252226dd457', '60aac5f9-be85-4247-9ba5-7d507a316a17', '61459399-ff3e-4c65-ac3f-990a02378022', 100);
INSERT INTO public.evaluan VALUES ('2025-05-05 08:38:49.032179+00', 20, '477e2a6f-6353-445e-8042-d73cd953f8a0', '4f9fce57-1519-4a3b-a41b-9a8b03aaa350', '60aac5f9-be85-4247-9ba5-7d507a316a17', '61459399-ff3e-4c65-ac3f-990a02378022', 15);
INSERT INTO public.evaluan VALUES ('2025-05-05 08:38:49.032179+00', 10, '1cde9486-2e95-489b-9736-8a1e1e01b1d8', '78cda6f1-29dd-439e-9581-6252226dd457', '60aac5f9-be85-4247-9ba5-7d507a316a17', '61459399-ff3e-4c65-ac3f-990a02378022', 25);
INSERT INTO public.evaluan VALUES ('2025-05-05 08:38:49.032179+00', 10, 'eefa22b0-6f36-44dd-b090-ba8074b43393', '8c05faff-cff6-40ae-a6a9-d0f97fb3168b', '60aac5f9-be85-4247-9ba5-7d507a316a17', '61459399-ff3e-4c65-ac3f-990a02378022', 25);
INSERT INTO public.evaluan VALUES ('2025-05-05 08:38:49.032179+00', 20, '7b431c9b-31c1-44c6-be19-9594790e8e42', 'bef77cbb-4232-474b-8b8a-fa4b5ec980d1', '60aac5f9-be85-4247-9ba5-7d507a316a17', '61459399-ff3e-4c65-ac3f-990a02378022', 50);
INSERT INTO public.evaluan VALUES ('2025-05-05 08:38:49.032179+00', 30, 'f7c22b57-3c4b-4f66-af6f-e77597492390', 'dab273c3-5f11-4df7-9098-5eec77503741', '60aac5f9-be85-4247-9ba5-7d507a316a17', '61459399-ff3e-4c65-ac3f-990a02378022', 65);
INSERT INTO public.evaluan VALUES ('2025-05-05 08:38:49.032179+00', 10, 'c2116eb3-1d0b-4c59-95d3-ba1141643d42', '78cda6f1-29dd-439e-9581-6252226dd457', '60aac5f9-be85-4247-9ba5-7d507a316a17', '2284f4c8-c81d-4e9a-adec-53a08cd5c307', 100);
INSERT INTO public.evaluan VALUES ('2025-05-05 08:38:49.032179+00', 20, '3608f1a4-625c-4622-82bc-e0b12fc68f81', '4f9fce57-1519-4a3b-a41b-9a8b03aaa350', '60aac5f9-be85-4247-9ba5-7d507a316a17', '2284f4c8-c81d-4e9a-adec-53a08cd5c307', 15);
INSERT INTO public.evaluan VALUES ('2025-05-05 08:38:49.032179+00', 10, 'b26484d2-988d-460f-bf51-527d26e13bd8', '78cda6f1-29dd-439e-9581-6252226dd457', '60aac5f9-be85-4247-9ba5-7d507a316a17', '2284f4c8-c81d-4e9a-adec-53a08cd5c307', 35);
INSERT INTO public.evaluan VALUES ('2025-05-05 08:38:49.032179+00', 10, '5b63a389-2cb0-4d2e-92ae-791a9d679857', '8c05faff-cff6-40ae-a6a9-d0f97fb3168b', '60aac5f9-be85-4247-9ba5-7d507a316a17', '2284f4c8-c81d-4e9a-adec-53a08cd5c307', 45);
INSERT INTO public.evaluan VALUES ('2025-05-05 08:38:49.032179+00', 20, 'd4c1a599-7814-4c8f-a68e-5065418ce266', 'bef77cbb-4232-474b-8b8a-fa4b5ec980d1', '60aac5f9-be85-4247-9ba5-7d507a316a17', '2284f4c8-c81d-4e9a-adec-53a08cd5c307', 50);
INSERT INTO public.evaluan VALUES ('2025-05-05 08:38:49.032179+00', 30, '0b272957-028d-4979-91b5-eaac9f103fb6', 'dab273c3-5f11-4df7-9098-5eec77503741', '60aac5f9-be85-4247-9ba5-7d507a316a17', '2284f4c8-c81d-4e9a-adec-53a08cd5c307', 65);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:25:01.930263+00', 10, 'a5b93133-86dd-48e4-8282-4e893286e707', '78cda6f1-29dd-439e-9581-6252226dd457', 'b4d1a473-948e-4e54-8467-5db73c296d7d', 'c168177d-04c3-4fcb-8d62-9239391e9933', 55);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:25:01.930263+00', 20, 'c735aa83-f79c-4288-88e6-e78e102ee66d', '4f9fce57-1519-4a3b-a41b-9a8b03aaa350', 'b4d1a473-948e-4e54-8467-5db73c296d7d', 'c168177d-04c3-4fcb-8d62-9239391e9933', 35);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:25:01.930263+00', 10, '2379fd0c-0631-4e39-8043-b833d741ed4f', '78cda6f1-29dd-439e-9581-6252226dd457', 'b4d1a473-948e-4e54-8467-5db73c296d7d', 'c168177d-04c3-4fcb-8d62-9239391e9933', 25);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:25:01.930263+00', 10, '146baf7d-8241-44c9-b61a-d283f9ce429f', '8c05faff-cff6-40ae-a6a9-d0f97fb3168b', 'b4d1a473-948e-4e54-8467-5db73c296d7d', 'c168177d-04c3-4fcb-8d62-9239391e9933', 45);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:25:01.930263+00', 20, 'ae5b91b3-2714-4b86-943c-7ea248be55cd', 'bef77cbb-4232-474b-8b8a-fa4b5ec980d1', 'b4d1a473-948e-4e54-8467-5db73c296d7d', 'c168177d-04c3-4fcb-8d62-9239391e9933', 75);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:25:01.930263+00', 30, '284a464f-01e6-453f-a74b-412733dd68e4', 'dab273c3-5f11-4df7-9098-5eec77503741', 'b4d1a473-948e-4e54-8467-5db73c296d7d', 'c168177d-04c3-4fcb-8d62-9239391e9933', 20);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:25:01.930263+00', 10, '1bf90eb5-81bb-4e3c-8fdf-edaf3484f135', '78cda6f1-29dd-439e-9581-6252226dd457', 'b4d1a473-948e-4e54-8467-5db73c296d7d', 'bed3e57a-9aff-4025-8177-aeb842762706', 15);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:25:01.930263+00', 20, 'e115079e-4ab7-4cd9-95ab-1377f2102bcc', '4f9fce57-1519-4a3b-a41b-9a8b03aaa350', 'b4d1a473-948e-4e54-8467-5db73c296d7d', 'bed3e57a-9aff-4025-8177-aeb842762706', 25);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:25:01.930263+00', 10, '4016cbf2-829a-4315-aa95-565819e9e9a1', '78cda6f1-29dd-439e-9581-6252226dd457', 'b4d1a473-948e-4e54-8467-5db73c296d7d', 'bed3e57a-9aff-4025-8177-aeb842762706', 80);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:25:01.930263+00', 10, 'a3339929-73c0-4a5b-8a33-1b8f9507bbb3', '8c05faff-cff6-40ae-a6a9-d0f97fb3168b', 'b4d1a473-948e-4e54-8467-5db73c296d7d', 'bed3e57a-9aff-4025-8177-aeb842762706', 50);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:25:01.930263+00', 20, '8e3b05e5-8327-4d35-a8fa-ef00cd13aecd', 'bef77cbb-4232-474b-8b8a-fa4b5ec980d1', 'b4d1a473-948e-4e54-8467-5db73c296d7d', 'bed3e57a-9aff-4025-8177-aeb842762706', 90);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:25:01.930263+00', 30, '10e01ca2-9946-4149-a902-80636188888c', 'dab273c3-5f11-4df7-9098-5eec77503741', 'b4d1a473-948e-4e54-8467-5db73c296d7d', 'bed3e57a-9aff-4025-8177-aeb842762706', 25);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:25:01.930263+00', 10, 'f5a5dd55-c019-43d2-ac02-d6b3d9e2cdbc', '78cda6f1-29dd-439e-9581-6252226dd457', 'b4d1a473-948e-4e54-8467-5db73c296d7d', '61459399-ff3e-4c65-ac3f-990a02378022', 90);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:25:01.930263+00', 20, 'ec7261fe-88cd-441a-8233-57c862623dbb', '4f9fce57-1519-4a3b-a41b-9a8b03aaa350', 'b4d1a473-948e-4e54-8467-5db73c296d7d', '61459399-ff3e-4c65-ac3f-990a02378022', 15);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:25:01.930263+00', 10, '2326401d-7d40-4b6c-af9b-32627d7d42e9', '78cda6f1-29dd-439e-9581-6252226dd457', 'b4d1a473-948e-4e54-8467-5db73c296d7d', '61459399-ff3e-4c65-ac3f-990a02378022', 25);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:25:01.930263+00', 10, '708750a4-3893-412c-9616-1456593e0a44', '8c05faff-cff6-40ae-a6a9-d0f97fb3168b', 'b4d1a473-948e-4e54-8467-5db73c296d7d', '61459399-ff3e-4c65-ac3f-990a02378022', 35);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:25:01.930263+00', 20, '54a5e746-05ee-4c57-9c5f-f70b5badf51b', 'bef77cbb-4232-474b-8b8a-fa4b5ec980d1', 'b4d1a473-948e-4e54-8467-5db73c296d7d', '61459399-ff3e-4c65-ac3f-990a02378022', 40);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:25:01.930263+00', 30, 'e89a3560-5a11-4736-89f2-4024561dbe87', 'dab273c3-5f11-4df7-9098-5eec77503741', 'b4d1a473-948e-4e54-8467-5db73c296d7d', '61459399-ff3e-4c65-ac3f-990a02378022', 65);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:25:01.930263+00', 10, 'bc1c73cc-3d4e-4229-9d23-9fd4342e3063', '78cda6f1-29dd-439e-9581-6252226dd457', 'b4d1a473-948e-4e54-8467-5db73c296d7d', '2284f4c8-c81d-4e9a-adec-53a08cd5c307', 85);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:25:01.930263+00', 20, '6acd0c81-8dc3-48bf-84d2-dc016ec86919', '4f9fce57-1519-4a3b-a41b-9a8b03aaa350', 'b4d1a473-948e-4e54-8467-5db73c296d7d', '2284f4c8-c81d-4e9a-adec-53a08cd5c307', 25);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:25:01.930263+00', 10, '30334ba5-dc2e-4b2e-91ec-5c89c9c40c3d', '78cda6f1-29dd-439e-9581-6252226dd457', 'b4d1a473-948e-4e54-8467-5db73c296d7d', '2284f4c8-c81d-4e9a-adec-53a08cd5c307', 15);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:25:01.930263+00', 10, '9810ce0a-ee68-4ecf-ad5e-e6c69d6f9f58', '8c05faff-cff6-40ae-a6a9-d0f97fb3168b', 'b4d1a473-948e-4e54-8467-5db73c296d7d', '2284f4c8-c81d-4e9a-adec-53a08cd5c307', 75);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:25:01.930263+00', 20, '109cf102-461e-4105-95ef-aac46f0debd4', 'bef77cbb-4232-474b-8b8a-fa4b5ec980d1', 'b4d1a473-948e-4e54-8467-5db73c296d7d', '2284f4c8-c81d-4e9a-adec-53a08cd5c307', 60);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:25:01.930263+00', 30, 'd0d1a8ee-0d02-46cc-9818-11afe80babb8', 'dab273c3-5f11-4df7-9098-5eec77503741', 'b4d1a473-948e-4e54-8467-5db73c296d7d', '2284f4c8-c81d-4e9a-adec-53a08cd5c307', 65);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:26:35.485391+00', 10, 'aa45cf6e-a339-4886-8e2e-737f2c4da901', '78cda6f1-29dd-439e-9581-6252226dd457', '024a3941-68fd-4037-8ec3-45be8ba27a4a', 'c168177d-04c3-4fcb-8d62-9239391e9933', 10);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:26:35.485391+00', 20, 'cc7113ff-f665-4846-bd10-f28b8292d01f', '4f9fce57-1519-4a3b-a41b-9a8b03aaa350', '024a3941-68fd-4037-8ec3-45be8ba27a4a', 'c168177d-04c3-4fcb-8d62-9239391e9933', 15);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:26:35.485391+00', 10, '7595e065-2f04-414b-9feb-21a961602be6', '78cda6f1-29dd-439e-9581-6252226dd457', '024a3941-68fd-4037-8ec3-45be8ba27a4a', 'c168177d-04c3-4fcb-8d62-9239391e9933', 25);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:26:35.485391+00', 10, '1899d580-b06b-431a-9e7c-5a155e098165', '8c05faff-cff6-40ae-a6a9-d0f97fb3168b', '024a3941-68fd-4037-8ec3-45be8ba27a4a', 'c168177d-04c3-4fcb-8d62-9239391e9933', 45);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:26:35.485391+00', 20, 'fd3705a6-8045-4fda-85d2-a73ba3cee111', 'bef77cbb-4232-474b-8b8a-fa4b5ec980d1', '024a3941-68fd-4037-8ec3-45be8ba27a4a', 'c168177d-04c3-4fcb-8d62-9239391e9933', 55);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:26:35.485391+00', 30, '79a45076-5467-46a4-b175-595ec1549e91', 'dab273c3-5f11-4df7-9098-5eec77503741', '024a3941-68fd-4037-8ec3-45be8ba27a4a', 'c168177d-04c3-4fcb-8d62-9239391e9933', 20);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:26:35.485391+00', 10, '4f103d4a-2ae2-4a98-b0b5-710b53176a00', '78cda6f1-29dd-439e-9581-6252226dd457', '024a3941-68fd-4037-8ec3-45be8ba27a4a', 'bed3e57a-9aff-4025-8177-aeb842762706', 15);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:26:35.485391+00', 20, 'ea0f4026-da2e-4b1f-94f1-9d4bbd561377', '4f9fce57-1519-4a3b-a41b-9a8b03aaa350', '024a3941-68fd-4037-8ec3-45be8ba27a4a', 'bed3e57a-9aff-4025-8177-aeb842762706', 65);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:26:35.485391+00', 10, 'a548b53b-6037-47cf-91a1-b1080d42a34c', '78cda6f1-29dd-439e-9581-6252226dd457', '024a3941-68fd-4037-8ec3-45be8ba27a4a', 'bed3e57a-9aff-4025-8177-aeb842762706', 60);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:26:35.485391+00', 10, '0dea5a5c-0aca-45d4-9673-c84a87ecf33f', '8c05faff-cff6-40ae-a6a9-d0f97fb3168b', '024a3941-68fd-4037-8ec3-45be8ba27a4a', 'bed3e57a-9aff-4025-8177-aeb842762706', 50);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:26:35.485391+00', 20, '8f972871-98f8-4ab9-8a01-a29403883327', 'bef77cbb-4232-474b-8b8a-fa4b5ec980d1', '024a3941-68fd-4037-8ec3-45be8ba27a4a', 'bed3e57a-9aff-4025-8177-aeb842762706', 45);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:26:35.485391+00', 30, 'e591b152-1b7f-4641-8d38-0a5d25eaee8d', 'dab273c3-5f11-4df7-9098-5eec77503741', '024a3941-68fd-4037-8ec3-45be8ba27a4a', 'bed3e57a-9aff-4025-8177-aeb842762706', 25);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:26:35.485391+00', 10, '1a21206b-f123-48ec-a8d3-759d8a6f6d6d', '78cda6f1-29dd-439e-9581-6252226dd457', '024a3941-68fd-4037-8ec3-45be8ba27a4a', '61459399-ff3e-4c65-ac3f-990a02378022', 70);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:26:35.485391+00', 20, 'f40a6c36-28a5-46ee-aec0-a80d1ca0d343', '4f9fce57-1519-4a3b-a41b-9a8b03aaa350', '024a3941-68fd-4037-8ec3-45be8ba27a4a', '61459399-ff3e-4c65-ac3f-990a02378022', 15);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:26:35.485391+00', 10, '06284468-70ae-45ef-8f72-40e247cb6d7b', '78cda6f1-29dd-439e-9581-6252226dd457', '024a3941-68fd-4037-8ec3-45be8ba27a4a', '61459399-ff3e-4c65-ac3f-990a02378022', 25);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:26:35.485391+00', 10, '9942098a-0a3f-4398-a159-77bc6ec7b50d', '8c05faff-cff6-40ae-a6a9-d0f97fb3168b', '024a3941-68fd-4037-8ec3-45be8ba27a4a', '61459399-ff3e-4c65-ac3f-990a02378022', 85);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:26:35.485391+00', 20, '62ad325f-c82a-4a11-8749-0a5f783822d1', 'bef77cbb-4232-474b-8b8a-fa4b5ec980d1', '024a3941-68fd-4037-8ec3-45be8ba27a4a', '61459399-ff3e-4c65-ac3f-990a02378022', 40);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:26:35.485391+00', 30, '748139d6-649d-4c11-88db-c65137b43ca6', 'dab273c3-5f11-4df7-9098-5eec77503741', '024a3941-68fd-4037-8ec3-45be8ba27a4a', '61459399-ff3e-4c65-ac3f-990a02378022', 50);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:26:35.485391+00', 10, 'b114a746-b6fa-4a2a-ab6f-0ccea3355b06', '78cda6f1-29dd-439e-9581-6252226dd457', '024a3941-68fd-4037-8ec3-45be8ba27a4a', '2284f4c8-c81d-4e9a-adec-53a08cd5c307', 15);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:26:35.485391+00', 20, '0f9ede39-06d4-474a-a78c-2c6102dc61b3', '4f9fce57-1519-4a3b-a41b-9a8b03aaa350', '024a3941-68fd-4037-8ec3-45be8ba27a4a', '2284f4c8-c81d-4e9a-adec-53a08cd5c307', 25);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:26:35.485391+00', 10, '52e4b58b-6bcf-4c91-b0a4-c183eefe284a', '78cda6f1-29dd-439e-9581-6252226dd457', '024a3941-68fd-4037-8ec3-45be8ba27a4a', '2284f4c8-c81d-4e9a-adec-53a08cd5c307', 60);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:26:35.485391+00', 10, '4e2d53fd-aa8f-44f8-b490-edd9111edef4', '8c05faff-cff6-40ae-a6a9-d0f97fb3168b', '024a3941-68fd-4037-8ec3-45be8ba27a4a', '2284f4c8-c81d-4e9a-adec-53a08cd5c307', 50);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:26:35.485391+00', 20, '43909772-72ae-436c-9c7c-6d2e495d94c0', 'bef77cbb-4232-474b-8b8a-fa4b5ec980d1', '024a3941-68fd-4037-8ec3-45be8ba27a4a', '2284f4c8-c81d-4e9a-adec-53a08cd5c307', 45);
INSERT INTO public.evaluan VALUES ('2025-05-06 08:26:35.485391+00', 30, 'e89696d5-62c9-4651-8b25-2d3b180585a6', 'dab273c3-5f11-4df7-9098-5eec77503741', '024a3941-68fd-4037-8ec3-45be8ba27a4a', '2284f4c8-c81d-4e9a-adec-53a08cd5c307', 35);


--
-- TOC entry 4005 (class 0 OID 29943)
-- Dependencies: 309
-- Data for Name: hacen; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4007 (class 0 OID 29951)
-- Dependencies: 311
-- Data for Name: imparte; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '17eb5029-614d-48b2-ae01-c11c3272513b', '15726b48-92d4-4741-9b10-70f5181416ce', 'a4a00b5e-c0f4-4361-80dd-76cd7d071f5b', '03f98759-f7c1-43da-b061-58e2f7c12c1e');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, 'bebd59c5-a13a-44b4-8986-60317c3918e3', '15726b48-92d4-4741-9b10-70f5181416ce', 'a4a00b5e-c0f4-4361-80dd-76cd7d071f5b', '05f24207-4bb9-4943-8a14-523139d26a11');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '87616567-1c1c-4fdf-8631-ddff170a0c26', '15726b48-92d4-4741-9b10-70f5181416ce', 'a4a00b5e-c0f4-4361-80dd-76cd7d071f5b', '109837f4-f954-4e01-9b33-4016ee36aa6c');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '60fe5bde-c168-45eb-a8c3-c11daa3b0797', '15726b48-92d4-4741-9b10-70f5181416ce', 'a4a00b5e-c0f4-4361-80dd-76cd7d071f5b', '187d730d-9fa3-40db-bdd0-e2bc5848effd');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '45a1a3da-0e9d-42fb-bcb8-75af3bec58b0', '15726b48-92d4-4741-9b10-70f5181416ce', 'a4a00b5e-c0f4-4361-80dd-76cd7d071f5b', '1f3b1f48-aff7-4dfb-8b12-a4639bf3ddf1');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, 'b29a53e2-6e15-4e11-b637-7fd22f1c1731', '15726b48-92d4-4741-9b10-70f5181416ce', 'a4a00b5e-c0f4-4361-80dd-76cd7d071f5b', '2203157e-0148-4ee9-8f87-f68cc81f1058');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '283ae9ef-1cc7-44e6-ba27-c30a75ee69cd', '15726b48-92d4-4741-9b10-70f5181416ce', 'a4a00b5e-c0f4-4361-80dd-76cd7d071f5b', '2284f4c8-c81d-4e9a-adec-53a08cd5c307');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '3ca8de05-9b9d-4bba-9a6c-cdc165896086', '15726b48-92d4-4741-9b10-70f5181416ce', 'a4a00b5e-c0f4-4361-80dd-76cd7d071f5b', '2b60b5e8-31c5-4395-a982-993e6b1a9329');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '37af69bf-7387-4123-bf4c-41d482728faf', '15726b48-92d4-4741-9b10-70f5181416ce', 'a4a00b5e-c0f4-4361-80dd-76cd7d071f5b', '30243064-9913-4722-8f8c-e1836e08819c');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '801c95af-1755-4443-916d-93c08ac22e51', '15726b48-92d4-4741-9b10-70f5181416ce', 'a4a00b5e-c0f4-4361-80dd-76cd7d071f5b', '352a5fd1-bac6-43eb-a8e7-53f24d9d04c2');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, 'b13ed8ef-0fae-4d52-bb15-ba24b597fd56', '15726b48-92d4-4741-9b10-70f5181416ce', 'a4a00b5e-c0f4-4361-80dd-76cd7d071f5b', '433c9c9f-3db8-4314-8f99-c9e141233718');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, 'b5c9bb3c-912c-4326-8884-f53db5e41b05', '15726b48-92d4-4741-9b10-70f5181416ce', 'a4a00b5e-c0f4-4361-80dd-76cd7d071f5b', '4526735b-936a-4425-bbfc-f1c135467d7e');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '1a17c200-5e7f-449f-bffa-89b53e267166', '15726b48-92d4-4741-9b10-70f5181416ce', 'a4a00b5e-c0f4-4361-80dd-76cd7d071f5b', '46245dea-f574-4e85-b00b-51537eee5d5d');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '08cd5481-8974-4f29-85f2-429d718bec6f', '15726b48-92d4-4741-9b10-70f5181416ce', 'a4a00b5e-c0f4-4361-80dd-76cd7d071f5b', '58879483-8572-4d66-a0e1-9c334d8e9b6e');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, 'bac5f9fb-82f9-4ef1-b214-fa2174347e6c', '15726b48-92d4-4741-9b10-70f5181416ce', 'a4a00b5e-c0f4-4361-80dd-76cd7d071f5b', '5dd63601-d47d-4e53-8223-f2126876c8c0');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, 'ce2ab9a2-2e54-42f8-9c0e-6a191ba5d2c2', '15726b48-92d4-4741-9b10-70f5181416ce', 'a453dc0e-5a1f-4a88-b6dd-7a0f666ab763', '03f98759-f7c1-43da-b061-58e2f7c12c1e');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, 'af78038e-c81c-4569-b48b-678a7d64f7e0', '15726b48-92d4-4741-9b10-70f5181416ce', 'a453dc0e-5a1f-4a88-b6dd-7a0f666ab763', '05f24207-4bb9-4943-8a14-523139d26a11');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '48d34b01-4be3-49a4-9a65-ebea4cc38850', '15726b48-92d4-4741-9b10-70f5181416ce', 'a453dc0e-5a1f-4a88-b6dd-7a0f666ab763', '109837f4-f954-4e01-9b33-4016ee36aa6c');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, 'f973caff-7fa8-4d22-b8db-6d47a3e77003', '15726b48-92d4-4741-9b10-70f5181416ce', 'a453dc0e-5a1f-4a88-b6dd-7a0f666ab763', '187d730d-9fa3-40db-bdd0-e2bc5848effd');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '8f2e73cd-2e8a-400a-b9b3-f24c5723e3cd', '15726b48-92d4-4741-9b10-70f5181416ce', 'a453dc0e-5a1f-4a88-b6dd-7a0f666ab763', '1f3b1f48-aff7-4dfb-8b12-a4639bf3ddf1');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, 'efedca9f-718a-4c3e-9e20-21e2cff354af', '15726b48-92d4-4741-9b10-70f5181416ce', 'a453dc0e-5a1f-4a88-b6dd-7a0f666ab763', '2203157e-0148-4ee9-8f87-f68cc81f1058');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, 'c8a1879b-29d6-4915-b1b8-bd60c7a5f5a2', '15726b48-92d4-4741-9b10-70f5181416ce', 'a453dc0e-5a1f-4a88-b6dd-7a0f666ab763', '2284f4c8-c81d-4e9a-adec-53a08cd5c307');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '4e6557e8-3791-4e26-bf87-57a4bca38d3e', '15726b48-92d4-4741-9b10-70f5181416ce', 'a453dc0e-5a1f-4a88-b6dd-7a0f666ab763', '2b60b5e8-31c5-4395-a982-993e6b1a9329');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '65868a22-97eb-4e11-889a-3e677a71ff9d', '15726b48-92d4-4741-9b10-70f5181416ce', 'a453dc0e-5a1f-4a88-b6dd-7a0f666ab763', '30243064-9913-4722-8f8c-e1836e08819c');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '24d92917-cff6-4494-89ef-07113e96c3c5', '15726b48-92d4-4741-9b10-70f5181416ce', 'a453dc0e-5a1f-4a88-b6dd-7a0f666ab763', '352a5fd1-bac6-43eb-a8e7-53f24d9d04c2');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, 'ee962f99-224f-4038-877d-00fe7d4e08dd', '15726b48-92d4-4741-9b10-70f5181416ce', 'a453dc0e-5a1f-4a88-b6dd-7a0f666ab763', '433c9c9f-3db8-4314-8f99-c9e141233718');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, 'c23b3aee-8cb3-4bd9-a3f4-b10eaefdb8e4', '15726b48-92d4-4741-9b10-70f5181416ce', 'a453dc0e-5a1f-4a88-b6dd-7a0f666ab763', '4526735b-936a-4425-bbfc-f1c135467d7e');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, 'b1ab6b7c-3583-4382-8977-0f61aada4f15', '15726b48-92d4-4741-9b10-70f5181416ce', 'a453dc0e-5a1f-4a88-b6dd-7a0f666ab763', '46245dea-f574-4e85-b00b-51537eee5d5d');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '162ed5ca-1be1-4b96-bce1-05aff7d2d1db', '15726b48-92d4-4741-9b10-70f5181416ce', 'a453dc0e-5a1f-4a88-b6dd-7a0f666ab763', '58879483-8572-4d66-a0e1-9c334d8e9b6e');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '7378eb90-bfc5-428f-ab28-b07e5a08250d', '15726b48-92d4-4741-9b10-70f5181416ce', 'a453dc0e-5a1f-4a88-b6dd-7a0f666ab763', '5dd63601-d47d-4e53-8223-f2126876c8c0');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '737d5ef2-579f-4d85-af20-d37fd6593484', '15726b48-92d4-4741-9b10-70f5181416ce', '0cacc34d-36b1-435b-b51d-318d9c55d21c', '61459399-ff3e-4c65-ac3f-990a02378022');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '6d2b5b6b-39e1-470a-9184-1d9f812cca8f', '15726b48-92d4-4741-9b10-70f5181416ce', '0cacc34d-36b1-435b-b51d-318d9c55d21c', '65b50401-bfdc-4b80-bf4c-f038817cb71a');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '627502c6-e0c9-4c6b-8ca6-442a5f319c72', '15726b48-92d4-4741-9b10-70f5181416ce', '0cacc34d-36b1-435b-b51d-318d9c55d21c', '65f6e800-af07-447a-a92a-27ea5f6ac33d');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '5e887a74-dc88-4aad-ad4a-b6d556905da0', '15726b48-92d4-4741-9b10-70f5181416ce', '0cacc34d-36b1-435b-b51d-318d9c55d21c', '67791e51-bebc-4a96-ac91-c34d1ae49ae3');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '9d0ed762-f193-4fce-8d56-01f60c0d6e72', '15726b48-92d4-4741-9b10-70f5181416ce', '0cacc34d-36b1-435b-b51d-318d9c55d21c', '771943e9-3614-47d3-bc1a-e6bdb675ddc8');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '85c6e361-0e11-4aa1-b192-0f453ab13359', '15726b48-92d4-4741-9b10-70f5181416ce', '0cacc34d-36b1-435b-b51d-318d9c55d21c', '799756dc-bd28-4ad0-b9e5-604ca2c619c0');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '54feec7b-26a2-4342-852a-302d785585a3', '15726b48-92d4-4741-9b10-70f5181416ce', '0cacc34d-36b1-435b-b51d-318d9c55d21c', '7cf1cfca-7699-420a-baaf-8d952d4ee98c');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, 'fdeb1825-6a98-4437-bf05-1bf9842202e5', '15726b48-92d4-4741-9b10-70f5181416ce', '0cacc34d-36b1-435b-b51d-318d9c55d21c', '81138c09-2ce6-47ef-a950-ccb6bb9e9dfd');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '202a3a66-4817-450c-bdb4-986e73f28699', '15726b48-92d4-4741-9b10-70f5181416ce', '0cacc34d-36b1-435b-b51d-318d9c55d21c', '865ad2cc-fb3c-47b1-8ff8-a02f3c449853');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '42ecdaca-c9d2-4526-9137-e1cbcab4969a', '15726b48-92d4-4741-9b10-70f5181416ce', '0cacc34d-36b1-435b-b51d-318d9c55d21c', '9d3bc0b6-288b-4dd7-ae30-0f44875f647e');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '76702ffe-8db6-4778-89c1-21a7f51a4435', '15726b48-92d4-4741-9b10-70f5181416ce', '0cacc34d-36b1-435b-b51d-318d9c55d21c', '9fdc796f-d217-48fa-9e43-9dc87dac827d');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '91f3a7de-2d1d-46eb-8bac-f7fd8bc40dae', '15726b48-92d4-4741-9b10-70f5181416ce', '0cacc34d-36b1-435b-b51d-318d9c55d21c', 'b96059e0-3b46-4f2d-84e0-4564202400ff');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, 'f91dea1d-5235-4a2d-bcc6-69a8e58ec2a3', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8', '2122f6ea-9294-4e24-87cd-b2e8dbc14e1a', '61459399-ff3e-4c65-ac3f-990a02378022');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '0610ec34-649a-4187-850f-628d53e20207', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8', '2122f6ea-9294-4e24-87cd-b2e8dbc14e1a', '65b50401-bfdc-4b80-bf4c-f038817cb71a');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, 'f497518f-cb67-4d52-ad43-c2e13b90f516', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8', '2122f6ea-9294-4e24-87cd-b2e8dbc14e1a', '65f6e800-af07-447a-a92a-27ea5f6ac33d');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, 'a5451b4f-e2ad-46e8-9aee-c162021c72d7', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8', '2122f6ea-9294-4e24-87cd-b2e8dbc14e1a', '67791e51-bebc-4a96-ac91-c34d1ae49ae3');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '4723dc9b-5cc8-4f55-a879-b5ff35bba91d', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8', '2122f6ea-9294-4e24-87cd-b2e8dbc14e1a', '771943e9-3614-47d3-bc1a-e6bdb675ddc8');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '84312b3d-d243-4484-9f4f-13caec67134d', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8', '2122f6ea-9294-4e24-87cd-b2e8dbc14e1a', '799756dc-bd28-4ad0-b9e5-604ca2c619c0');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '31f5e0ea-0cbf-4235-b1ef-49a55604c844', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8', '2122f6ea-9294-4e24-87cd-b2e8dbc14e1a', '7cf1cfca-7699-420a-baaf-8d952d4ee98c');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '91356f85-8b30-4b64-8993-7382cf6e1c89', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8', '2122f6ea-9294-4e24-87cd-b2e8dbc14e1a', '81138c09-2ce6-47ef-a950-ccb6bb9e9dfd');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '1c3c8656-c980-4c85-82d2-ff0a13ea3581', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8', '2122f6ea-9294-4e24-87cd-b2e8dbc14e1a', '865ad2cc-fb3c-47b1-8ff8-a02f3c449853');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '8cb0043d-7fa5-4ab5-8d50-08213071dc12', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8', '2122f6ea-9294-4e24-87cd-b2e8dbc14e1a', '9d3bc0b6-288b-4dd7-ae30-0f44875f647e');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '4974217b-8ae5-4d26-bfef-d491f2187dfa', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8', '2122f6ea-9294-4e24-87cd-b2e8dbc14e1a', '9fdc796f-d217-48fa-9e43-9dc87dac827d');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '5bf976dc-9e17-4fef-80d7-508111dd3534', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8', '2122f6ea-9294-4e24-87cd-b2e8dbc14e1a', 'b96059e0-3b46-4f2d-84e0-4564202400ff');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '9d493dd4-0e65-4e28-8ce0-59a8d9737c01', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8', '0cacc34d-36b1-435b-b51d-318d9c55d21c', '61459399-ff3e-4c65-ac3f-990a02378022');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '8358b134-36d7-4db3-a0b7-3f3916c61eea', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8', '0cacc34d-36b1-435b-b51d-318d9c55d21c', '65b50401-bfdc-4b80-bf4c-f038817cb71a');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '80620d01-4f1b-444a-bd9e-10dc9b68d605', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8', '0cacc34d-36b1-435b-b51d-318d9c55d21c', '65f6e800-af07-447a-a92a-27ea5f6ac33d');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '7ad45767-a6e6-46f0-b9ab-4b3627965b60', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8', '0cacc34d-36b1-435b-b51d-318d9c55d21c', '67791e51-bebc-4a96-ac91-c34d1ae49ae3');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '9f65dfcb-66b5-4db1-9a0f-c1f5dfb37550', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8', '0cacc34d-36b1-435b-b51d-318d9c55d21c', '771943e9-3614-47d3-bc1a-e6bdb675ddc8');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, 'c6cb670b-d409-4cca-957b-c272bbf0f8a4', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8', '0cacc34d-36b1-435b-b51d-318d9c55d21c', '799756dc-bd28-4ad0-b9e5-604ca2c619c0');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '9d027599-97c9-4d0f-b33a-b1d76c8a2101', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8', '0cacc34d-36b1-435b-b51d-318d9c55d21c', '7cf1cfca-7699-420a-baaf-8d952d4ee98c');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '0cdfdefb-1d36-4733-ae88-881513d42b30', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8', '0cacc34d-36b1-435b-b51d-318d9c55d21c', '81138c09-2ce6-47ef-a950-ccb6bb9e9dfd');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, 'ea1e3238-c12d-46b8-8493-73f66f7b1a05', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8', '0cacc34d-36b1-435b-b51d-318d9c55d21c', '865ad2cc-fb3c-47b1-8ff8-a02f3c449853');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '0be8d8ef-f09e-4902-b29b-de6684c5ec36', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8', '0cacc34d-36b1-435b-b51d-318d9c55d21c', '9d3bc0b6-288b-4dd7-ae30-0f44875f647e');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, 'f09ea25d-3a05-4e24-8632-29ad32466686', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8', '0cacc34d-36b1-435b-b51d-318d9c55d21c', '9fdc796f-d217-48fa-9e43-9dc87dac827d');
INSERT INTO public.imparte VALUES ('2025-05-13 10:15:01.395427+00', NULL, '5be4676a-96c3-4deb-92dd-d4b588c5be4b', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8', '0cacc34d-36b1-435b-b51d-318d9c55d21c', 'b96059e0-3b46-4f2d-84e0-4564202400ff');


--
-- TOC entry 4008 (class 0 OID 29959)
-- Dependencies: 312
-- Data for Name: matricula; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4009 (class 0 OID 29968)
-- Dependencies: 313
-- Data for Name: poseen; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4037 (class 0 OID 0)
-- Dependencies: 305
-- Name: TipoEvaluacion_id_tipoevaluacion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TipoEvaluacion_id_tipoevaluacion_seq"', 4, true);


--
-- TOC entry 4038 (class 0 OID 0)
-- Dependencies: 307
-- Name: TipoPracticas_id_tipopractica_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."TipoPracticas_id_tipopractica_seq"', 6, true);


--
-- TOC entry 4039 (class 0 OID 0)
-- Dependencies: 310
-- Name: hacen_id_hacen_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hacen_id_hacen_seq', 1, false);


-- Completed on 2025-05-14 10:29:16

--
-- PostgreSQL database dump complete
--

