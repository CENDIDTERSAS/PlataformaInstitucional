-- Esquema para el Módulo de Aula Virtual (LMS)

-- 1. Tabla de Cursos
CREATE TABLE IF NOT EXISTS cursos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    imagen_url TEXT,
    categoria VARCHAR(100),
    docente_id UUID REFERENCES perfiles(id),
    estado VARCHAR(50) DEFAULT 'Borrador', -- Borrador, Publicado, Cerrado
    fecha_inicio TIMESTAMP WITH TIME ZONE,
    fecha_fin TIMESTAMP WITH TIME ZONE,
    puntaje_minimo_aprobacion NUMERIC(4,2) DEFAULT 60.00, -- Porcentaje mínimo para aprobar (0-100)
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Lecciones
CREATE TABLE IF NOT EXISTS lecciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT, -- Contenido en texto/markdown
    tipo VARCHAR(50) NOT NULL, -- video, pdf, texto, pre-test, post-test
    recurso_url TEXT, -- URL de video o PDF
    orden INTEGER NOT NULL,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de Preguntas para Tests
CREATE TABLE IF NOT EXISTS preguntas_test (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    leccion_id UUID REFERENCES lecciones(id) ON DELETE CASCADE,
    pregunta TEXT NOT NULL,
    opciones JSONB NOT NULL, -- Array de opciones
    respuesta_correcta INTEGER NOT NULL, -- Índice de la opción correcta
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de Inscripciones / Enrolamiento
CREATE TABLE IF NOT EXISTS inscripciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
    perfil_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    progreso INTEGER DEFAULT 0, -- 0 a 100
    estado VARCHAR(50) DEFAULT 'En curso', -- En curso, Finalizado, Expirado
    calificacion_pre NUMERIC(4,2), -- Calificación Pre-test
    calificacion_post NUMERIC(4,2), -- Calificación Post-test
    intentos_post INTEGER DEFAULT 0, -- Contador de intentos del post-test
    fecha_inscripcion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_finalizacion TIMESTAMP WITH TIME ZONE,
    UNIQUE(curso_id, perfil_id)
);

-- 5. Tabla de Respuestas de Usuarios (para auditoría y revisión)
CREATE TABLE IF NOT EXISTS lms_respuestas_usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inscripcion_id UUID REFERENCES inscripciones(id) ON DELETE CASCADE,
    pregunta_id UUID REFERENCES preguntas_test(id) ON DELETE CASCADE,
    respuesta_seleccionada INTEGER,
    es_correcta BOOLEAN,
    tipo_test VARCHAR(20), -- 'pre' o 'post'
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabla de Certificados e Insignias
CREATE TABLE IF NOT EXISTS certificados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inscripcion_id UUID REFERENCES inscripciones(id) ON DELETE CASCADE,
    codigo_verificacion VARCHAR(50) UNIQUE NOT NULL,
    fecha_emision TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    url_pdf TEXT
);

-- Habilitar RLS
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE preguntas_test ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_respuestas_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificados ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (Select público/autenticado, Insert/Update para docentes/admin)
-- Nombre del Módulo: Aula Virtual.
-- Flujo: Pre-test -> Contenido -> Post-test.

-- Cursos
CREATE POLICY "Cursos visibles para todos" ON cursos FOR SELECT USING (true);
CREATE POLICY "Docentes gestionan sus cursos" ON cursos FOR ALL USING (auth.uid() = docente_id);

-- Lecciones
CREATE POLICY "Lectura de lecciones" ON lecciones FOR SELECT 
USING (
    EXISTS (SELECT 1 FROM inscripciones WHERE curso_id = lecciones.curso_id AND perfil_id = auth.uid())
    OR EXISTS (SELECT 1 FROM cursos WHERE id = lecciones.curso_id AND docente_id = auth.uid())
);

CREATE POLICY "Docentes gestionan lecciones" ON lecciones FOR ALL 
USING (EXISTS (SELECT 1 FROM cursos WHERE id = lecciones.curso_id AND docente_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM cursos WHERE id = lecciones.curso_id AND docente_id = auth.uid()));

-- Inscripciones
CREATE POLICY "Usuarios ven su propia inscripción" ON inscripciones FOR SELECT USING (perfil_id = auth.uid());
CREATE POLICY "Usuarios pueden inscribirse" ON inscripciones FOR INSERT WITH CHECK (perfil_id = auth.uid());
CREATE POLICY "Usuarios actualizan su progreso" ON inscripciones FOR UPDATE USING (perfil_id = auth.uid());

-- Respuestas
CREATE POLICY "Usuarios ven sus respuestas" ON lms_respuestas_usuarios FOR SELECT 
USING (EXISTS (SELECT 1 FROM inscripciones WHERE id = lms_respuestas_usuarios.inscripcion_id AND perfil_id = auth.uid()));
CREATE POLICY "Usuarios guardan sus respuestas" ON lms_respuestas_usuarios FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM inscripciones WHERE id = lms_respuestas_usuarios.inscripcion_id AND perfil_id = auth.uid()));

-- Preguntas de Test
CREATE POLICY "Lectura de preguntas" ON preguntas_test FOR SELECT 
USING (
    EXISTS (SELECT 1 FROM lecciones L JOIN inscripciones I ON L.curso_id = I.curso_id WHERE L.id = preguntas_test.leccion_id AND I.perfil_id = auth.uid())
    OR EXISTS (SELECT 1 FROM lecciones L JOIN cursos C ON L.curso_id = C.id WHERE L.id = preguntas_test.leccion_id AND C.docente_id = auth.uid())
);

CREATE POLICY "Docentes gestionan preguntas" ON preguntas_test FOR ALL 
USING (EXISTS (SELECT 1 FROM lecciones L JOIN cursos C ON L.curso_id = C.id WHERE L.id = preguntas_test.leccion_id AND C.docente_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM lecciones L JOIN cursos C ON L.curso_id = C.id WHERE L.id = preguntas_test.leccion_id AND C.docente_id = auth.uid()));

-- Certificados
CREATE POLICY "Usuarios ven sus certificados" ON certificados FOR SELECT 
USING (EXISTS (SELECT 1 FROM inscripciones WHERE id = certificados.inscripcion_id AND perfil_id = auth.uid()));
CREATE POLICY "Sistema genera certificados" ON certificados FOR INSERT WITH CHECK (true);
