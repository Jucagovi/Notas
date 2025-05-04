--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 17.2

-- Started on 2025-05-04 10:54:05

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
-- TOC entry 3969 (class 0 OID 29851)
-- Dependencies: 272
-- Data for Name: Ciclos; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Ciclos" VALUES ('2025-03-11 11:55:24.763055+00', 'Administración de Sistemas Informáticos en Red', 'ASIR', 'El término Administración de Sistemas Informáticos en Red hace referencia a una profesión que implica gestionar, mantener y asegurar el correcto funcionamiento de los sistemas informáticos en una red. Además es el nombre que adquiere el Grado Superior de Formación Profesional (FP) donde los alumnos se convierten en técnicos profesionales. Es importante porque garantiza la disponibilidad, seguridad y eficiencia de los recursos tecnológicos, facilitando el flujo de información y el funcionamiento de las organizaciones.', '3eb505e1-d0d0-46eb-87bb-d4cbb7ff7833');
INSERT INTO public."Ciclos" VALUES ('2025-03-11 11:55:24.763055+00', 'Desarrollo de Aplicaciones Web', 'DAW', 'El Grado Superior en Desarrollo de Aplicaciones Web es un título oficial de Formación Profesional perteneciente a la rama de Informática. La titulación, también conocida como DAW, está acreditada por el Ministerio de Educación.En esta FP conocerás la parte front end de la programación así como aspectos fundamentales de la parte back o ámbitos transversales como los sistemas informáticos o las bases de datos. ', '36cabd1e-c173-495d-94fc-51bfe6df800d');
INSERT INTO public."Ciclos" VALUES ('2025-03-11 11:55:24.763055+00', 'Desarrollo de Aplicaciones Multiplataforma', 'DAM', 'DAM es una titulación oficial de grado superior que se encuentra dentro de la rama de FP Informática. Como Técnico Superior en Desarrollo de Aplicaciones Multiplataforma de Desarrollo de Aplicaciones Multiplataforma aprenderás todo lo que necesitas saber sobre sistemas informáticos, bases de datos y programación front y back end, adquiriendo así un aprendizaje más completo.', '5f032c9e-08f1-41de-bc4c-19a3ac2827fe');
INSERT INTO public."Ciclos" VALUES ('2025-03-11 11:55:24.763055+00', 'Desarrollo de VideoJuegos y Realidad Virtual', 'CEVRV', 'La competencia general de este curso de especialización consiste en diseñar y desarrollar videojuegos para diferentes dispositivos y plataformas, garantizando la experiencia del usuario, utilizando herramientas de última generación que permitan actuar en todas las fases de su desarrollo, así como aplicaciones interactivas de realidad virtual y aumentada.', 'a906f924-b287-4acf-a170-f743152c2aa3');
INSERT INTO public."Ciclos" VALUES ('2025-03-11 11:55:24.763055+00', 'Sistemas Microinformáticos y Redes', 'SMR', 'Sistemas Microinformáticos y Redes es una profesión que se centra en el diseño, implementación y mantenimiento de sistemas informáticos a pequeña escala, incluyendo redes de computadoras y la administración de hardware, software y servicios relacionados para garantizar su funcionamiento eficiente y seguro. La labor del Técnico SMR es importante porque gracias a ella se asegura la eficiencia y seguridad de los sistemas informáticos en empresas e instituciones.', '56951ab9-cc40-421b-84ce-730b167edbfe');


--
-- TOC entry 3970 (class 0 OID 29861)
-- Dependencies: 273
-- Data for Name: Cursos; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Cursos" VALUES ('2024-12-23 16:53:50.698609+00', 'IES Tecnológico', '1º DAW', 'Primer curso de Desarrollo de Aplicaciones Web', '2024-2025', '15726b48-92d4-4741-9b10-70f5181416ce');
INSERT INTO public."Cursos" VALUES ('2024-12-23 16:53:50.698609+00', 'IES Tecnológico', '2º DAW', 'Segundo curso de Desarrollo de Aplicaciones Web', '2024-2025', 'c400ed1d-2566-45a6-bfbc-40661fb7f0e8');
INSERT INTO public."Cursos" VALUES ('2024-12-23 16:53:50.698609+00', 'IES Tecnológico', '1º ASI', 'Primer curso de Administración de Sistemas Informáticos', '2024-2025', '615b047d-5bc4-44e5-97d5-6a4f395212b6');


--
-- TOC entry 3971 (class 0 OID 29872)
-- Dependencies: 274
-- Data for Name: Discentes; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Discentes" VALUES ('María', 'López García', 'mlopez@example.com', '2002-06-15', 'Petrer', 'c168177d-04c3-4fcb-8d62-9239391e9933', NULL);
INSERT INTO public."Discentes" VALUES ('Juan', 'Pérez Martínez', 'jperez@example.com', '2003-02-20', 'Petrer', '2284f4c8-c81d-4e9a-adec-53a08cd5c307', NULL);
INSERT INTO public."Discentes" VALUES ('Ana', 'González Ruiz', 'agonzalez@example.com', '2001-12-10', 'Novelda', '187d730d-9fa3-40db-bdd0-e2bc5848effd', NULL);
INSERT INTO public."Discentes" VALUES ('Carlos', 'Fernández Soto', 'cfernandez@example.com', '2002-03-05', 'Aspe', '61459399-ff3e-4c65-ac3f-990a02378022', NULL);
INSERT INTO public."Discentes" VALUES ('Laura', 'Ramírez Torres', 'lramirez@example.com', '2003-07-22', 'Elda', 'bed3e57a-9aff-4025-8177-aeb842762706', NULL);


--
-- TOC entry 3972 (class 0 OID 29877)
-- Dependencies: 275
-- Data for Name: Evaluaciones; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Evaluaciones" VALUES ('2024-12-23 16:57:35.875658+00', 'Primera Evaluación', '2024-10-01', '2024-12-20', 'Evaluación inicial', 1, '60aac5f9-be85-4247-9ba5-7d507a316a17', NULL);
INSERT INTO public."Evaluaciones" VALUES ('2024-12-23 16:57:35.875658+00', 'Segunda Evaluación', '2025-01-15', '2025-03-30', 'Evaluación intermedia', 2, 'b4d1a473-948e-4e54-8467-5db73c296d7d', NULL);
INSERT INTO public."Evaluaciones" VALUES ('2024-12-23 16:57:35.875658+00', 'Evaluación Final', '2025-04-01', '2025-06-20', 'Evaluación final', 3, '024a3941-68fd-4037-8ec3-45be8ba27a4a', NULL);


--
-- TOC entry 3973 (class 0 OID 29886)
-- Dependencies: 276
-- Data for Name: Modulos; Type: TABLE DATA; Schema: public; Owner: -
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
-- TOC entry 3974 (class 0 OID 29896)
-- Dependencies: 277
-- Data for Name: Practicas; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Practicas" VALUES ('2024-12-23 16:55:03.734992+00', 'Práctica 2', 'P2', 'Diseño de una base de datos', 'Práctica intermedia', 2, 'Unidad 2', '34aa470d-9603-4c20-9630-18552f737374', NULL);
INSERT INTO public."Practicas" VALUES ('2024-12-23 16:55:52.895551+00', 'Práctica 2', 'P2', 'Diseño de una base de datos', 'Práctica intermedia', 2, 'Unidad 2', '4f9fce57-1519-4a3b-a41b-9a8b03aaa350', NULL);
INSERT INTO public."Practicas" VALUES ('2024-12-23 16:55:52.895551+00', 'Práctica 1', 'P1', 'Resolver ejercicios básicos de programación', 'Práctica introductoria', 1, 'Unidad 1', '78cda6f1-29dd-439e-9581-6252226dd457', NULL);
INSERT INTO public."Practicas" VALUES ('2024-12-23 16:55:03.734992+00', 'Práctica 4', 'P4', 'Desarrollar una página web interactiva chula', 'Práctica avanzada', 3, 'Unidad 3', '8c05faff-cff6-40ae-a6a9-d0f97fb3168b', NULL);
INSERT INTO public."Practicas" VALUES ('2024-12-23 16:55:03.734992+00', 'Práctica 1', 'P133', 'Resolver ejercicios básicos de programación', 'Práctica introductoria', 1, 'Unidad 1', 'bef77cbb-4232-474b-8b8a-fa4b5ec980d1', NULL);
INSERT INTO public."Practicas" VALUES ('2024-12-23 16:55:52.895551+00', 'Práctica 3', 'P3', 'Desarrollar una página web interactiva', 'Práctica avanzada', 3, 'Unidad 3', 'dab273c3-5f11-4df7-9098-5eec77503741', NULL);


--
-- TOC entry 3975 (class 0 OID 29908)
-- Dependencies: 278
-- Data for Name: TipoEvaluacion; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TipoEvaluacion" VALUES (1, '2024-12-23 16:57:35.875658+00', 'Parcial', 'Evaluación parcial de contenidos');
INSERT INTO public."TipoEvaluacion" VALUES (2, '2024-12-23 16:57:35.875658+00', 'Global', 'Evaluación global del módulo');
INSERT INTO public."TipoEvaluacion" VALUES (3, '2024-12-23 16:57:35.875658+00', 'Extraordinaria', 'Evaluación para recuperación');
INSERT INTO public."TipoEvaluacion" VALUES (4, '2025-02-13 15:41:43.932251+00', 'Final', 'Evaluación final del módulo');


--
-- TOC entry 3977 (class 0 OID 29917)
-- Dependencies: 280
-- Data for Name: TipoPracticas; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TipoPracticas" VALUES (1, '2024-12-23 16:50:56.799831+00', 'Individual', 'Práctica realizada de forma individual');
INSERT INTO public."TipoPracticas" VALUES (2, '2024-12-23 16:50:56.799831+00', 'Grupal', 'Práctica realizada en equipo');
INSERT INTO public."TipoPracticas" VALUES (3, '2024-12-23 16:50:56.799831+00', 'Proyecto', 'Proyecto complejo integrador');
INSERT INTO public."TipoPracticas" VALUES (4, '2024-12-23 16:58:25.454745+00', 'Individual', 'Práctica realizada de forma individual');
INSERT INTO public."TipoPracticas" VALUES (5, '2024-12-23 16:58:25.454745+00', 'Grupal', 'Práctica realizada en equipo');
INSERT INTO public."TipoPracticas" VALUES (6, '2024-12-23 16:58:25.454745+00', 'Proyecto', 'Proyecto complejo integrador');


--
-- TOC entry 3979 (class 0 OID 29926)
-- Dependencies: 282
-- Data for Name: Versiones; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Versiones" VALUES (7, '2024-12-23 16:56:50.536362+00', '2024-2025', 'Versión inicial', 'Primera iteración de la práctica', 7);
INSERT INTO public."Versiones" VALUES (8, '2024-12-23 16:56:50.536362+00', '2024-2025', 'Versión revisada', 'Actualización basada en feedback', 7);
INSERT INTO public."Versiones" VALUES (9, '2024-12-23 16:56:50.536362+00', '2024-2025', 'Versión inicial', 'Primera iteración de la práctica', 8);
INSERT INTO public."Versiones" VALUES (10, '2024-12-23 16:56:50.536362+00', '2024-2025', 'Versión revisada', 'Actualización basada en feedback', 8);
INSERT INTO public."Versiones" VALUES (11, '2024-12-23 16:56:50.536362+00', '2024-2025', 'Versión inicial', 'Primera iteración de la práctica', 9);
INSERT INTO public."Versiones" VALUES (12, '2024-12-23 16:56:50.536362+00', '2024-2025', 'Versión revisada', 'Actualización basada en feedback', 9);


--
-- TOC entry 3988 (class 0 OID 62653)
-- Dependencies: 301
-- Data for Name: disponen; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 3981 (class 0 OID 29936)
-- Dependencies: 284
-- Data for Name: evaluan; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 3982 (class 0 OID 29943)
-- Dependencies: 285
-- Data for Name: hacen; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 3984 (class 0 OID 29951)
-- Dependencies: 287
-- Data for Name: imparte; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 3985 (class 0 OID 29959)
-- Dependencies: 288
-- Data for Name: matricula; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 3986 (class 0 OID 29968)
-- Dependencies: 289
-- Data for Name: poseen; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 3995 (class 0 OID 0)
-- Dependencies: 279
-- Name: TipoEvaluacion_id_tipoevaluacion_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."TipoEvaluacion_id_tipoevaluacion_seq"', 4, true);


--
-- TOC entry 3996 (class 0 OID 0)
-- Dependencies: 281
-- Name: TipoPracticas_id_tipopractica_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."TipoPracticas_id_tipopractica_seq"', 6, true);


--
-- TOC entry 3997 (class 0 OID 0)
-- Dependencies: 283
-- Name: Versiones_id_version_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Versiones_id_version_seq"', 12, true);


--
-- TOC entry 3998 (class 0 OID 0)
-- Dependencies: 286
-- Name: hacen_id_hacen_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.hacen_id_hacen_seq', 1, false);


--
-- TOC entry 3999 (class 0 OID 0)
-- Dependencies: 290
-- Name: poseen_id_poseen_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.poseen_id_poseen_seq', 1, false);


-- Completed on 2025-05-04 10:54:13

--
-- PostgreSQL database dump complete
--

