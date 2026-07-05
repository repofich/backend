# TODO — Revisión de Casos de Uso (CU1–CU8)

---

## CU1. Gestión de Usuarios ✅ (con mejoras)

### ✅ Funciona
- Admin crea/edita usuarios (todos los `user_type` excepto `estudiante` en create)
- Profile: editar datos, foto (jpg/png), CV (pdf)
- Admin: activar/desactivar, reset pass
- API endpoints para foto/CV por perfil y por admin

### 🔧 Mejoras pendientes
| # | Qué | Dónde | Por qué |
|---|-----|-------|---------|
| 1 | Agregar `'is_active' => 'boolean'` a `$casts` | `app/Models/User.php:33-41` | Sin cast, Eloquent lo deja como int, posible bug en lógica booleana |
| 2 | Eliminar código muerto `if (isset($data['password']))` | `app/Http/Controllers/UserController.php:68-70` | `password` no está en `UpdateUserRequest`, nunca se ejecuta |
| 3 | Agregar filtro `is_active` en AdminUsers | `resources/js/pages/AdminUsers.jsx` | Solo existe filtro por texto y rol, no por estado activo/inactivo |
| 4 | Botón "Eliminar usuario" en AdminUsers | `resources/js/pages/AdminUsers.jsx` | API tiene `DELETE /api/users/{id}` pero no hay UI |

---

## CU2. Gestión de Registro y Manuscrito ⚠️ (con bugs)

### ✅ Funciona
- Crear tesis en `borrador` con título, resumen, tutor, categoría, carrera, repo_url, demo_url, keywords
- Subir archivos en creación y edición (Inertia web)
- Campos `repo_url`, `demo_url` condicionales según `format_config` de la carrera

### ❌ Bugs / Falta
| # | Qué | Dónde | Severidad |
|---|-----|-------|-----------|
| 1 | `Inertia/ThesisController@update` **no valida el status** antes de editar | `app/Http/Controllers/Inertia/ThesisController.php:35-55` | 🔴 Alta — permite editar tesis en cualquier estado vía web |
| 2 | API `POST /api/thesis` y `PUT /api/thesis/{id}` **no soportan archivos** | `StoreThesisRequest`, `UpdateThesisRequest`, `ThesisController@store/@update` | 🟡 Media — API carece de subida de archivos |
| 3 | `ThesisFactory` desactualizada (faltan 8 campos) | `database/factories/ThesisFactory.php` | 🟡 Media — rompe tests/fábricas que usen el factory |

---

## CU3. Envío y Asignación para Revisión ✅

### ✅ Funciona completamente
- Student submit: `borrador → en_revision`, `observado → en_revision`
- Requiere: archivo adjunto + `tutor_status === 'accepted'`
- Director asigna tutor (vía `PUT /api/thesis/{id}/tutor`)
- Tutor responde accept/reject (vía `POST /api/thesis/{id}/tutor/respond`)
- Historial de tutorías (`TutorAssignmentLog`)
- Director asigna/remueve evaluador (vía `POST/DELETE /api/thesis/{id}/evaluator`)

### 🔧 Mejora opcional
| # | Qué | Dónde |
|---|-----|-------|
| 1 | Notificar al tutor cuando se le asigna una tesis | Sin implementar (no hay emails/notificaciones en el sistema) |

---

## CU4. Evaluación y Retroalimentación ✅

### ✅ Funciona completamente
- Evaluador crea/actualiza evaluación (score 0-100, recomendación, comentarios, archivo)
- Coherencia score-recomendación validada (score≥60 ⇒ aprobar, score<60 ⇒ no aprobar)
- Auto-actualización de status según recomendación: `aprobar→aprobado`, `observar→observado`, `rechazar→rechazado`
- `canTransitionTo()` verificado antes de cambiar status
- Evaluador no puede evaluar dos veces la misma tesis (UNIQUE thesis_id+evaluator_id)

---

## CU5. Gestión Multicarrera y Configuración de Formatos ✅

### ✅ Funciona completamente
- CRUD de carreras (admin): nombre, director, áreas de conocimiento
- `format_config` por carrera (toggles: repo_url, demo_url, keywords)
- `format_config` se usa en CreateProject/EditProject para mostrar/ocultar campos
- `knowledge_areas` como JSON, mostradas como pills en AdminCareers
- Director asignado a carrera (FK `director_id`)

---

## CU6. Consulta Pública y Analítica ⚠️ (bugs de seguridad)

### ✅ Funciona
- Workflow de 6 estados con `canTransitionTo()`
- AdminTesis con filtros (título, autor, carrera, tutor, estado)
- Vista pública Home con búsqueda/filtros

### ❌ Bugs de seguridad
| # | Qué | Dónde | Severidad |
|---|-----|-------|-----------|
| 1 | `PageController@home` **no filtra por `status = 'publicado'`** | `app/Http/Controllers/Inertia/PageController.php:22` | 🔴 Alta — tesis en cualquier estado (borrador, observado, etc.) visibles al público |
| 2 | `GET /api/thesis` **retorna todas las tesis sin filtrar** | `app/Http/Controllers/ThesisController.php:22` | 🔴 Alta — API pública expone tesis no publicadas |
| 3 | `thesisDetail` **no verifica status** | `app/Http/Controllers/Inertia/PageController.php:225` | 🟡 Media — cualquiera puede ver tesis en borrador por la URL directa |
| 4 | Sin paginación en admin | AdminTesis, AdminCareers | 🟡 Media — con miles de registros, la página carga todo |

---

## CU7. Gestión de Pagos ✅ (con limitaciones)

### ✅ Funciona
- Stripe PaymentIntent + confirmCardPayment
- Contado y crédito (2 cuotas)
- Payment model con status tracking

### ❌ Limitaciones
| # | Qué | Dónde | Severidad |
|---|-----|-------|-----------|
| 1 | Solo Stripe, no PayPal | `app/Services/StripeService.php` | 🟢 Baja — según requerimientos |
| 2 | Pagos no vinculados a tesis | No hay `thesis_id` en payments | 🟡 Media — no se puede saber qué tesis pagó qué |

---

## CU8. Reportes y Estadísticas ⚠️ (sin frontend)

### ✅ Funciona
- 5 endpoints API + CSV export: tesis por carrera, por estado, por año, ingresos, usuarios por rol
- Tests completos (`ReportTest.php`)

### ❌ Falta
| # | Qué | Dónde | Severidad |
|---|-----|-------|-----------|
| 1 | **No hay página frontend de reportes** | Solo existe en API | 🟡 Media — vicedecano/director no pueden ver reportes desde la UI |
| 2 | No hay enlace en GlobalMenu para reportes | `resources/js/components/GlobalMenu.jsx` | 🟡 Media — ni siquiera hay ruta para navegar |

---

## Resumen de Prioridades

| Prioridad | Tarea | CU |
|-----------|-------|----|
| 🔴 Alta | Home público filtra solo `publicado` | CU6 |
| 🔴 Alta | API `GET /api/thesis` filtra solo `publicado` | CU6 |
| 🔴 Alta | `Inertia/ThesisController@update` valida status | CU2 |
| 🟡 Media | thesisDetail verifica status | CU6 |
| 🟡 Media | Subir archivos vía API | CU2 |
| 🟡 Media | Paginación en admin | CU6 |
| 🟡 Media | Página frontend de reportes | CU8 |
| 🟡 Media | `ThesisFactory` actualizar campos | CU2 |
| 🟢 Baja | `is_active` en casts de User | CU1 |
| 🟢 Baja | Filtro is_active en AdminUsers | CU1 |
| 🟢 Baja | Botón eliminar usuario en UI | CU1 |
| 🟢 Baja | Código muerto en UserController | CU1 |
