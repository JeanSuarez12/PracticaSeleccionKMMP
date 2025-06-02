--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

-- Started on 2025-06-02 15:34:12

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 859 (class 1247 OID 18782)
-- Name: enum_orders_stage; Type: TYPE; Schema: public; Owner: os_user
--

CREATE TYPE public.enum_orders_stage AS ENUM (
    'Desarme',
    'Armado'
);


ALTER TYPE public.enum_orders_stage OWNER TO os_user;

--
-- TOC entry 856 (class 1247 OID 18775)
-- Name: enum_orders_status; Type: TYPE; Schema: public; Owner: os_user
--

CREATE TYPE public.enum_orders_status AS ENUM (
    'TO-DO',
    'IN-PROCESS',
    'DONE'
);


ALTER TYPE public.enum_orders_status OWNER TO os_user;

--
-- TOC entry 847 (class 1247 OID 18746)
-- Name: enum_roles_name; Type: TYPE; Schema: public; Owner: os_user
--

CREATE TYPE public.enum_roles_name AS ENUM (
    'admin',
    'technician'
);


ALTER TYPE public.enum_roles_name OWNER TO os_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 18824)
-- Name: distribution_lists; Type: TABLE; Schema: public; Owner: os_user
--

CREATE TABLE public.distribution_lists (
    id integer NOT NULL,
    reason character varying(100) NOT NULL,
    emails text NOT NULL
);


ALTER TABLE public.distribution_lists OWNER TO os_user;

--
-- TOC entry 221 (class 1259 OID 18823)
-- Name: distribution_lists_id_seq; Type: SEQUENCE; Schema: public; Owner: os_user
--

CREATE SEQUENCE public.distribution_lists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.distribution_lists_id_seq OWNER TO os_user;

--
-- TOC entry 4842 (class 0 OID 0)
-- Dependencies: 221
-- Name: distribution_lists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: os_user
--

ALTER SEQUENCE public.distribution_lists_id_seq OWNED BY public.distribution_lists.id;


--
-- TOC entry 218 (class 1259 OID 18787)
-- Name: orders; Type: TABLE; Schema: public; Owner: os_user
--

CREATE TABLE public.orders (
    id character varying(9) NOT NULL,
    "astApproved" boolean DEFAULT false,
    status public.enum_orders_status DEFAULT 'TO-DO'::public.enum_orders_status NOT NULL,
    "isStopped" boolean DEFAULT false,
    "stopReason" text,
    stage public.enum_orders_stage DEFAULT 'Desarme'::public.enum_orders_stage NOT NULL,
    "reprogramReason" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.orders OWNER TO os_user;

--
-- TOC entry 220 (class 1259 OID 18811)
-- Name: reprogram_logs; Type: TABLE; Schema: public; Owner: os_user
--

CREATE TABLE public.reprogram_logs (
    id uuid NOT NULL,
    reason text NOT NULL,
    "reprogrammedAt" timestamp with time zone NOT NULL,
    "orderId" character varying(9) NOT NULL
);


ALTER TABLE public.reprogram_logs OWNER TO os_user;

--
-- TOC entry 216 (class 1259 OID 18752)
-- Name: roles; Type: TABLE; Schema: public; Owner: os_user
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name public.enum_roles_name NOT NULL
);


ALTER TABLE public.roles OWNER TO os_user;

--
-- TOC entry 215 (class 1259 OID 18751)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: os_user
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO os_user;

--
-- TOC entry 4843 (class 0 OID 0)
-- Dependencies: 215
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: os_user
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 219 (class 1259 OID 18798)
-- Name: stop_logs; Type: TABLE; Schema: public; Owner: os_user
--

CREATE TABLE public.stop_logs (
    id uuid NOT NULL,
    reason text NOT NULL,
    "startTime" timestamp with time zone NOT NULL,
    "endTime" timestamp with time zone,
    "isPlanned" boolean DEFAULT false,
    "orderId" character varying(9) NOT NULL
);


ALTER TABLE public.stop_logs OWNER TO os_user;

--
-- TOC entry 217 (class 1259 OID 18760)
-- Name: users; Type: TABLE; Schema: public; Owner: os_user
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "roleId" integer NOT NULL
);


ALTER TABLE public.users OWNER TO os_user;

--
-- TOC entry 4670 (class 2604 OID 18827)
-- Name: distribution_lists id; Type: DEFAULT; Schema: public; Owner: os_user
--

ALTER TABLE ONLY public.distribution_lists ALTER COLUMN id SET DEFAULT nextval('public.distribution_lists_id_seq'::regclass);


--
-- TOC entry 4664 (class 2604 OID 18755)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: os_user
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 4688 (class 2606 OID 18831)
-- Name: distribution_lists distribution_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: os_user
--

ALTER TABLE ONLY public.distribution_lists
    ADD CONSTRAINT distribution_lists_pkey PRIMARY KEY (id);


--
-- TOC entry 4690 (class 2606 OID 18833)
-- Name: distribution_lists distribution_lists_reason_key; Type: CONSTRAINT; Schema: public; Owner: os_user
--

ALTER TABLE ONLY public.distribution_lists
    ADD CONSTRAINT distribution_lists_reason_key UNIQUE (reason);


--
-- TOC entry 4682 (class 2606 OID 18797)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: os_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4686 (class 2606 OID 18817)
-- Name: reprogram_logs reprogram_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: os_user
--

ALTER TABLE ONLY public.reprogram_logs
    ADD CONSTRAINT reprogram_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4672 (class 2606 OID 18759)
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: os_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- TOC entry 4674 (class 2606 OID 18757)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: os_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 4684 (class 2606 OID 18805)
-- Name: stop_logs stop_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: os_user
--

ALTER TABLE ONLY public.stop_logs
    ADD CONSTRAINT stop_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4676 (class 2606 OID 18768)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: os_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4678 (class 2606 OID 18764)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: os_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4680 (class 2606 OID 18766)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: os_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4693 (class 2606 OID 18818)
-- Name: reprogram_logs reprogram_logs_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: os_user
--

ALTER TABLE ONLY public.reprogram_logs
    ADD CONSTRAINT "reprogram_logs_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE;


--
-- TOC entry 4692 (class 2606 OID 18806)
-- Name: stop_logs stop_logs_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: os_user
--

ALTER TABLE ONLY public.stop_logs
    ADD CONSTRAINT "stop_logs_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE;


--
-- TOC entry 4691 (class 2606 OID 18769)
-- Name: users users_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: os_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE;


-- Completed on 2025-06-02 15:34:12

--
-- PostgreSQL database dump complete
--

