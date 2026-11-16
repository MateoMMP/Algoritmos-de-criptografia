# Protocolo de trazas

Cada motor devuelve `output`, `normalizedInput`, `warnings`, métricas opcionales y una secuencia estable de `TraceStep`. Cada paso posee identificador único, fase, título y explicación; puede incluir fórmula, sustituciones, valores anterior/posterior y resaltados semánticos.

El reproductor consume únicamente estos pasos: no fabrica operaciones visuales. Permite teclado (flechas y espacio), reproducción, acceso directo y lectura no intrusiva mediante `aria-live`.
