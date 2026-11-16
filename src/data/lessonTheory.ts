export interface LessonTheory {
  overview: string;
  formula: string;
  steps: string[];
}

type Row = [string, string, string];

const rows: Record<number, Row> = {
  1: [
    'La escítala es una transposición: conserva cada símbolo, pero cambia su posición al escribir el mensaje por filas sobre un rectángulo y leerlo por columnas.',
    'posición de lectura = columna · filas + fila',
    'Fijar filas y columnas|Añadir solo el relleno necesario|Escribir por filas y leer por columnas',
  ],
  2: [
    'Rail Fence coloca los símbolos sobre una trayectoria periódica que baja y sube entre varios rieles. La clave es la profundidad; el cifrado concatena los rieles.',
    'periodo = 2(profundidad − 1)',
    'Construir la trayectoria zigzag|Asignar un riel a cada índice|Concatenar rieles; al invertir, reconstruir sus longitudes',
  ],
  3: [
    'Polibio sustituye cada letra por las coordenadas de su celda en una tabla 5×5. I/J suelen compartir casilla; por eso esa normalización debe conocerse antes de cifrar.',
    'símbolo ↔ (fila, columna)',
    'Normalizar con I/J conjunta|Buscar la celda de cada letra|Emitir o interpretar pares completos de coordenadas',
  ],
  4: [
    'Uesugi amplía la idea de coordenadas a una tabla 7×7. Las 49 posiciones permiten representar los 48 símbolos del Iroha y reservar una celda.',
    '7² = 49 ≥ 48',
    'Construir el alfabeto sin duplicados|Numerar siete filas y siete columnas|Transformar símbolos y coordenadas en ambos sentidos',
  ],
  5: [
    'El straddling checkerboard asigna códigos cortos a símbolos frecuentes y códigos de dos dígitos al resto. Los prefijos indican qué fila extendida debe consultarse.',
    'código = dígito corto o prefijo || columna',
    'Identificar dígitos cortos y prefijos|Consumir un dígito o un par según el prefijo|Comprobar que el parser recorra toda la cadena',
  ],
  6: [
    'César desplaza circularmente todos los símbolos del alfabeto la misma cantidad. Su debilidad es que solo existen tantos candidatos como desplazamientos.',
    'c = (m + k) mod n; m = (c − k) mod n',
    'Convertir letras a índices|Sumar o restar k módulo n|Volver del índice al símbolo',
  ],
  7: [
    'Un nomenclátor mezcla sustituciones de letras con códigos para palabras o frases. La tokenización longest-match elige primero la entrada válida más larga.',
    'texto → secuencia de tokens → códigos',
    'Ordenar entradas por longitud|Consumir el texto de izquierda a derecha|Detectar códigos repetidos y solapamientos',
  ],
  8: [
    'Alberti usa dos discos concéntricos con alfabetos distintos. El disco interior gira periódicamente, creando una sustitución polialfabética que cambia durante el mensaje.',
    'salidaᵢ = discoInterior(entradaᵢ, giro⌊i/p⌋)',
    'Alinear ambos alfabetos|Sustituir durante un periodo|Girar el disco según incremento y dirección',
  ],
  9: [
    'Porta no suma los índices de mensaje y clave. La clave selecciona una fila que forma trece parejas entre A–M y N–Z. Son parejas recíprocas: si E se empareja con T, entonces E→T y T→E.',
    'Eₖ(Eₖ(m)) = m',
    'Expandir la clave y elegir la fila AB, CD…|Localizar la letra en cualquiera de las dos mitades|Cruzar su pareja; repetir el cruce recupera la letra inicial',
  ],
  10: [
    'Vigenère suma índices de texto y clave. En autoclave, la clave inicial se prolonga con la propia clave o con texto, reduciendo la repetición periódica.',
    'cᵢ = (mᵢ + kᵢ) mod n',
    'Normalizar texto y clave|Construir la tira de clave según la variante|Sumar al cifrar y restar al descifrar',
  ],
  11: [
    'ADFGX/ADFGVX combina fraccionamiento y transposición: primero convierte símbolos en coordenadas de Polibio y después reordena esas coordenadas por una clave columnar.',
    'C = Transposición(Polibio(M))',
    'Crear el tablero con palabra clave|Fraccionar en letras de coordenada|Aplicar la transposición; invertir el orden al descifrar',
  ],
  12: [
    'El código sindical no desplaza letras. Emisor y receptor comparten un libro de palabras ordenadas; cada palabra se sustituye por la que queda k posiciones después. Al superar el final se vuelve al principio.',
    "p' = ((p−1) ± k) mod N + 1",
    'Buscar la palabra y anotar su posición|Sumar k al cifrar o restarlo al descifrar, con retorno circular|Consultar la palabra situada en la nueva posición',
  ],
  13: [
    'Un sistema secreto necesita que cada clave defina una transformación invertible. Si dos mensajes producen el mismo criptograma, el receptor no puede decidir cuál era el original.',
    'Dₖ(Eₖ(m)) = m',
    'Definir espacios de mensajes y criptogramas|Comprobar inyectividad/biyectividad|Medir cómo cambia la salida al alterar entrada o clave',
  ],
  14: [
    'La formulación algebraica de César muestra que cifrado y descifrado son traslaciones inversas en el grupo de enteros módulo el tamaño del alfabeto.',
    'Eₖ(m)=m+k mod |A|',
    'Asignar índices|Operar módulo |A||Verificar la identidad de ida y vuelta',
  ],
  15: [
    'La cifra afín multiplica y desplaza el índice. Solo es reversible cuando a es coprimo con n, porque entonces existe a⁻¹ módulo n.',
    'c=(a·m+b) mod n; m=a⁻¹(c−b) mod n',
    'Validar gcd(a,n)=1|Calcular el inverso con Euclides|Aplicar la función afín o su inversa',
  ],
  16: [
    'La cifra de libro representa una palabra mediante su página, línea y posición. Emisor y receptor deben compartir exactamente la misma edición y tokenización.',
    'palabra ↔ página.línea.posición',
    'Dividir el libro con reglas visibles|Buscar apariciones válidas|Validar cada coordenada al descifrar',
  ],
  17: [
    'El cifrado homofónico asigna varios códigos a letras frecuentes. Elegir entre ellos reparte su frecuencia y dificulta el análisis monoalfabético.',
    'letra → uno de {h₁,…,hᵣ}',
    'Validar que los conjuntos no se solapen|Elegir código con semilla o round-robin|Invertir cada código de forma unívoca',
  ],
  18: [
    'La comparación formal de Vigenère permite observar cómo la clave periódica repite estructura mientras key-autokey y text-autokey generan tiras distintas.',
    'cᵢ=(mᵢ+kᵢ) mod n',
    'Construir las tres tiras|Calcular carácter a carácter|Comparar periodicidad y realimentación',
  ],
  19: [
    'Vernam combina mensaje y clave con XOR. Solo es OTP si la clave es aleatoria, secreta, tan larga como el mensaje y jamás se reutiliza.',
    'C=M XOR K; M=C XOR K',
    'Convertir texto a bytes|Exigir longitudes compatibles|Aplicar XOR y demostrar el riesgo C₁ XOR C₂',
  ],
  20: [
    'Playfair cifra digramas sobre una matriz 5×5. Pares en la misma fila se desplazan, en la misma columna bajan y los demás forman un rectángulo.',
    'par → regla de fila, columna o rectángulo',
    'Preparar digramas y separar dobles|Localizar las dos celdas|Aplicar la regla directa o inversa',
  ],
  21: [
    'Hill cifra bloques como vectores mediante una matriz módulo n. La matriz debe tener determinante invertible para que exista K⁻¹.',
    'C=K·M mod n; M=K⁻¹·C mod n',
    'Calcular determinante y gcd|Obtener la matriz inversa modular|Multiplicar cada bloque columna',
  ],
  22: [
    'Una pauta de barajado es una permutación explícita de posiciones. Su inversa devuelve cada elemento a su índice de origen.',
    'Cᵢ=Mπ(i); Mᵢ=Cπ⁻¹(i)',
    'Definir una ruta que visite cada celda una vez|Extraer la permutación|Construir y comprobar la inversa',
  ],
  23: [
    'Übchi aplica dos transposiciones columnares. Las letras repetidas de una clave se ordenan de forma estable usando su índice original.',
    'C=Tₖ₂(Tₖ₁(M))',
    'Numerar columnas establemente|Aplicar la primera clave|Aplicar la segunda; invertir k₂ y después k₁',
  ],
  24: [
    'La transposición columnar escribe por filas y lee columnas según el ranking de la clave. Sin padding, las columnas pueden tener longitudes diferentes.',
    'ranking = orden(letra, índice original)',
    'Construir la matriz|Determinar ranking y longitudes|Leer o reconstruir columnas en orden',
  ],
  25: [
    'La transposición interrumpida introduce huecos según el ranking de la clave. La variante II completa esos huecos con la segunda mitad del texto.',
    'longitudFilaᵣ depende del ranking r',
    'Dibujar la pauta de huecos|Colocar la primera parte|Leer columnas o rellenar huecos según la variante',
  ],
  26: [
    'Cardano escribe a través de ventanas de una rejilla que gira cuatro veces. Una rejilla válida cubre cada celda exactamente una vez.',
    'agujeros por giro = n²/4',
    'Elegir un representante de cada órbita|Escribir y rotar 90° cuatro veces|Comprobar cobertura sin solapamientos',
  ],
  27: [
    'M-209 genera un desplazamiento a partir de seis ruedas con pines y 27 barras con lugs. Las ruedas avanzan y las barras activadas determinan la clave de cada carácter.',
    'c=(k−m) mod 26/27',
    'Evaluar pines visibles|Contar barras desplazadas|Aplicar Beaufort y avanzar ruedas',
  ],
  28: [
    'Enigma M3 hace pasar la señal por clavijero, tres rotores, reflector y camino inverso. El avance previo y el double-stepping son esenciales.',
    'P→R→reflector→R⁻¹→P',
    'Avanzar rotores antes de cifrar|Recorrer cada cableado ida y vuelta|Usar la reciprocidad con el mismo estado inicial',
  ],
  29: [
    'Los modelos de criptoanálisis clasifican qué información y consultas posee el atacante. El nivel de ruptura indica cuánto logra recuperar.',
    'capacidad del ataque = datos + oráculos + objetivo',
    'Identificar la información disponible|Clasificar el modelo|Distinguir ruptura total, parcial o discriminante',
  ],
  30: [
    'El análisis de frecuencias cuenta símbolos y secuencias para compararlos con un idioma. Las sustituciones monoalfabéticas conservan aproximadamente esas distribuciones.',
    'f(x)=conteo(x)/N',
    'Normalizar conservando la información elegida|Contar n-gramas y contactos|Comparar y probar sustituciones provisionales',
  ],
  31: [
    'Kasiski busca n-gramas repetidos en un Vigenère. Las distancias entre apariciones suelen compartir factores con la longitud de clave.',
    'periodo candidato | gcd(distancias)',
    'Localizar repeticiones|Factorizar distancias|Probar periodos mediante columnas e IC',
  ],
  32: [
    'El índice de coincidencia estima la probabilidad de que dos símbolos extraídos sin reemplazo sean iguales. Textos naturales suelen superar al uniforme.',
    'IC=Σfᵢ(fᵢ−1)/(N(N−1))',
    'Contar cada símbolo|Calcular cada término fᵢ(fᵢ−1)|Sumar y dividir por N(N−1)',
  ],
  33: [
    'La superposición desplaza dos secuencias y cuenta coincidencias. Picos repetidos pueden revelar periodos o alineamientos probables.',
    'coincidencias(s)=Σ[AIᵢ=AIIᵢ₊ₛ]',
    'Elegir un desplazamiento|Comparar posiciones solapadas|Contrastar con tasas aleatoria y lingüística',
  ],
  34: [
    'El test de Kullback φ del temario usa el numerador del IC y lo compara con los valores esperados para texto aleatorio o natural.',
    'φobs=Σfᵢ(fᵢ−1)',
    'Calcular φ observado|Obtener φr y φp|Comparar distancias sin afirmar certeza',
  ],
  35: [
    'El test de solapamiento χ del temario multiplica frecuencias de dos muestras símbolo a símbolo. No es el estadístico χ² de Pearson.',
    'χobs=ΣfI,ᵢ·fII,ᵢ',
    'Alinear alfabetos de ambas muestras|Sumar productos|Comparar con κr·NI·NII y κp·NI·NII',
  ],
  36: [
    'Una red Feistel divide el bloque en dos mitades. Cada ronda copia la derecha y mezcla la izquierda con F; descifrar solo requiere invertir subclaves.',
    'Lᵢ=Rᵢ₋₁; Rᵢ=Lᵢ₋₁ XOR F(Rᵢ₋₁,Kᵢ)',
    'Separar L y R|Evaluar F y XOR|Intercambiar papeles en cada ronda',
  ],
  37: [
    'DES es una Feistel de 16 rondas con permutaciones, expansión, S-boxes y subclaves de 48 bits. Su clave efectiva de 56 bits es hoy insuficiente.',
    'Rᵢ=Lᵢ₋₁ XOR P(S(E(Rᵢ₋₁) XOR Kᵢ))',
    'Aplicar IP|Ejecutar 16 rondas y key schedule|Intercambiar mitades y aplicar FP',
  ],
  38: [
    'Los ataques a DES estudian espacios reducidos, diferencias y aproximaciones lineales. El navegador solo debe demostrar versiones reducidas, no prometer romper DES completo.',
    'sesgo=Pr[aproximación]−1/2',
    'Definir un DES reducido|Recoger pares o muestras|Medir coincidencias, sesgo y candidatos',
  ],
  39: [
    'Los modos convierten un cifrador de bloque en un esquema para mensajes largos. ECB filtra patrones; CBC encadena; CFB/OFB/CTR producen flujo.',
    'CBC: Cᵢ=Eₖ(Mᵢ XOR Cᵢ₋₁); CTR: Cᵢ=Mᵢ XOR Eₖ(contadorᵢ)',
    'Dividir y rellenar cuando proceda|Combinar IV/nonce y estado|Observar propagación de errores',
  ],
  40: [
    '2DES aplica DES dos veces. Meet-in-the-middle calcula Eₖ₁(M) y Dₖ₂(C) para buscar un estado intermedio común.',
    'Eₖ₂(Eₖ₁(M)) = C',
    'Construir tabla desde el claro|Recorrer claves desde el cifrado|Filtrar coincidencias con un segundo par',
  ],
  41: [
    '3DES-EDE cifra, descifra y cifra de nuevo. Puede usar K1,K2,K1 o tres claves, y se reduce a DES cuando todas coinciden.',
    'C=Eₖ₃(Dₖ₂(Eₖ₁(M)))',
    'Aplicar E con K1|Aplicar D con K2|Aplicar E con K3; invertir etapas al descifrar',
  ],
  42: [
    'IDEA mezcla XOR, suma módulo 2¹⁶ y multiplicación módulo 65537. Esas operaciones incompatibles proporcionan confusión.',
    '⊞ mod 2¹⁶; ⊙ mod 65537',
    'Expandir 52 subclaves|Ejecutar ocho rondas de seis subclaves|Aplicar la transformación final',
  ],
  43: [
    'Blowfish es una Feistel de 16 rondas con P-array y cuatro S-boxes dependientes de la clave. La expansión de clave es deliberadamente costosa.',
    'F(x)=((S1[a]+S2[b]) XOR S3[c])+S4[d]',
    'Inicializar con constantes de π|Mezclar la clave mediante 521 cifrados|Ejecutar las 16 rondas',
  ],
  44: [
    'AES representa 16 bytes como una matriz column-major. Cada ronda usa sustitución, desplazamiento, mezcla lineal y suma de clave; la última omite MixColumns.',
    'estado←AddRoundKey(MixColumns(ShiftRows(SubBytes(estado))))',
    'Expandir la clave|Aplicar ronda inicial y rondas completas|Ejecutar la ronda final y operaciones inversas',
  ],
  45: [
    'Un cifrador síncrono genera flujo sin depender del criptograma; uno autosincronizante incorpora bits recibidos y puede recuperar sincronía tras varios símbolos.',
    'Cᵢ=Mᵢ XOR Zᵢ',
    'Actualizar el registro|Generar el bit de flujo|Insertar, borrar o alterar bits y observar recuperación',
  ],
  46: [
    'RC4 inicializa una permutación S con KSA y genera bytes con PRGA. Sus sesgos y fallos de uso lo hacen obsoleto.',
    'Cᵢ=Mᵢ XOR S[(S[i]+S[j]) mod 256]',
    'KSA mezcla S con la clave|PRGA actualiza i, j e intercambia|Aplicar XOR con cada byte de flujo',
  ],
  47: [
    'Una función hash comprime entradas arbitrarias. La preimagen sigue una probabilidad geométrica y las colisiones aparecen antes por el efecto cumpleaños.',
    'Ppre=1−(1−2⁻ⁿ)ᵏ; Pcol≈1−e^(−k(k−1)/(2·2ⁿ))',
    'Elegir n y número de intentos|Calcular valor exacto|Comparar con la aproximación',
  ],
  48: [
    'Una construcción iterada divide el mensaje, añade padding y encadena una función de compresión. Incluir la longitud evita ambigüedades del relleno de ceros.',
    'Hᵢ=f(Hᵢ₋₁,Mᵢ)',
    'Codificar y rellenar|Separar en bloques|Actualizar el estado de encadenamiento',
  ],
  49: [
    'Un MAC autentica mensaje y origen compartido. HMAC combina una clave normalizada con ipad/opad y dos aplicaciones del hash.',
    'HMAC=H((K⊕opad)||H((K⊕ipad)||M))',
    'Normalizar la clave al bloque|Calcular hash interior|Calcular hash exterior y comparar en tiempo constante',
  ],
  50: [
    'SHA-1 y SHA-2 procesan bloques mediante una planificación de palabras y registros internos. SHA-1 está roto para colisiones; SHA-2 sigue vigente con parámetros adecuados.',
    'Hᵢ=Compress(Hᵢ₋₁,Mᵢ)',
    'Aplicar padding con longitud|Expandir palabras|Ejecutar rondas y sumar al estado',
  ],
  51: [
    'Davies–Meyer construye una compresión desde un cifrador de bloque; Merkle–Damgård la encadena sobre bloques con padding reforzado.',
    'Hᵢ=E_Mᵢ(Hᵢ₋₁) XOR Hᵢ₋₁',
    'Preparar bloques|Usar cada bloque como clave del cifrador|Realimentar el estado mediante XOR',
  ],
  52: [
    'Una esponja alterna absorción y una permutación sobre rate+capacity. Después extrae bloques de rate, permutando de nuevo cuando necesita más salida.',
    'estado=(rate||capacity); padding 10*1',
    'Aplicar padding|Absorber bloques en rate y permutar|Exprimir tantos bloques como se soliciten',
  ],
  53: [
    'La factorización prima permite enumerar divisores y calcular φ, la cantidad de residuos coprimos con n.',
    'φ(n)=∏(pᵉ−pᵉ⁻¹)=n∏(1−1/p)',
    'Dividir por primos hasta √n|Agrupar exponentes|Aplicar la fórmula multiplicativa',
  ],
  54: [
    'La aritmética modular trabaja con clases de equivalencia. Euclides calcula gcd; su versión extendida produce coeficientes y el inverso cuando el gcd es uno.',
    'ax+ny=gcd(a,n)',
    'Reducir residuos|Usar square-and-multiply para potencias|Retro-sustituir Euclides para el inverso',
  ],
  55: [
    'Fermat es el caso primo del teorema de Euler. Ambos requieren hipótesis: primalidad en Fermat y coprimalidad en Euler.',
    'a^(p−1)≡1 mod p; a^φ(n)≡1 mod n',
    'Comprobar hipótesis|Enumerar o permutar residuos|Buscar contraejemplos al quitar una condición',
  ],
  56: [
    'Miller–Rabin escribe n−1 como 2ˢd y busca si una potencia llega a 1 o −1. Un testigo demuestra composición; varias bases reducen el error probable.',
    'n−1=2ˢd; x=aᵈ mod n',
    'Separar potencias de dos|Calcular aᵈ|Elevar al cuadrado hasta n−1 o detectar testigo',
  ],
  57: [
    'La criptografía asimétrica usa una función directa eficiente y una inversión difícil salvo con información trampa. La clave pública y privada tienen papeles distintos.',
    'pública: operación directa; privada: trampa inversa',
    'Generar el par relacionado|Publicar solo la clave pública|Elegir la clave según confidencialidad o autenticidad',
  ],
  58: [
    'Una firma real calcula un resumen y aplica un esquema de firma con la clave privada. La clave pública verifica tanto firma como mensaje.',
    's=Sign(sk,H(M)); Verify(pk,H(M),s)',
    'Resumir y codificar|Firmar con la privada|Recalcular, verificar y probar alteraciones',
  ],
  59: [
    'RSA se basa en exponentiación modular y en la relación ed≡1 mod φ(n). El modo real necesita OAEP para cifrado o PSS para firma.',
    'C=Mᵉ mod n; M=Cᵈ mod n',
    'Elegir p,q y calcular n,φ|Escoger e y hallar d|Potenciar modularmente y validar 0≤M<n',
  ],
  60: [
    'ElGamal oculta el mensaje con un secreto compartido efímero. Reutilizar el nonce v relaciona criptogramas y rompe garantías.',
    '(c1,c2)=(αᵛ,M·yᵛ) mod p',
    'Construir y=αᵘ|Elegir nonce fresco v|Recuperar M con el inverso de c1ᵘ',
  ],
  61: [
    'Diffie–Hellman permite acordar un secreto a través de un canal público. Sin autenticación es vulnerable a un intermediario.',
    'K=(αˣᴮ)ˣᴬ=(αˣᴬ)ˣᴮ mod p',
    'Elegir secretos|Intercambiar potencias públicas|Elevar el valor recibido y derivar una clave',
  ],
  62: [
    'En una curva elíptica finita, sumar puntos usa una recta algebraica y el punto al infinito como identidad. Double-and-add multiplica un punto eficientemente.',
    'y²=x³+ax+b mod p',
    'Enumerar puntos válidos|Calcular pendiente e inverso modular|Doblar/sumar siguiendo los bits del escalar',
  ],
  63: [
    'El cifrado híbrido usa cifrado simétrico para los datos y asimétrico solo para proteger la clave de sesión. AES-GCM aporta además autenticidad.',
    'sobre=(RSA-OAEP(K), nonce, AES-GCM_K(M))',
    'Generar clave y nonce seguros|Cifrar datos con AES-GCM|Encapsular la clave con RSA-OAEP',
  ],
  64: [
    'PKI vincula identidades con claves públicas mediante certificados firmados y una cadena de confianza. Validar implica más que comprobar una firma.',
    'servidor → CA intermedia → raíz confiable',
    'Construir y verificar la cadena|Comprobar fechas, nombre y usos|Consultar revocación y gestionar el ciclo de vida',
  ],
};

export function getLessonTheory(order: number): LessonTheory {
  const row = rows[order];
  if (!row) throw new Error(`No existe teoría para la lección ${order}.`);
  return {
    overview: row[0],
    formula: row[1],
    steps: row[2].split('|'),
  };
}
