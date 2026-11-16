# Cobertura de algoritmos

La navegación se genera exclusivamente desde `src/data/syllabus.ts`. Todas las rutas componen el mismo shell accesible, normalización explícita, motor seleccionable, traza, inversión cuando procede, comparación y persistencia de progreso.

| # | Lección | Ruta/motor | Estado |
|---:|---|---|---|
| 1 | Escítala estricta | `01-escitala…` / scytale | complete |
| 2 | Rail Fence | `02-escitala-general…` / railFence | complete |
| 3 | Polibio | `03-cuadrado…` / polybius | complete |
| 4 | Uesugi | `04-cifrado-uesugi` / coordinates-7 | complete |
| 5 | CT-46 | `05-straddling…` / lesson-5 | complete |
| 6 | César histórico | `06-cesar-historico` / caesar | complete |
| 7 | Nomenclátores | `07-nomenclatores…` / lesson-7 | complete |
| 8 | Alberti | `08-discos-de-alberti` / lesson-8 | complete |
| 9 | Porta/Bellaso | `09-porta-bellaso` / vigenere-family | complete |
| 10 | Vigenère/autoclave | `10-vigenere…` / vigenere | complete |
| 11 | ADFGX/ADFGVX | `11-adfgx-y-adfgvx` / columnar-pipeline | complete |
| 12 | Código sindical | `12-codigo-sindical…` / lesson-12 | complete |
| 13 | Sistema secreto | `13-sistema-secreto…` / lesson-13 | complete |
| 14 | César formal | `14-cesar-formal` / caesar | complete |
| 15 | Afín | `15-sustitucion-afin…` / affine | complete |
| 16 | Cifra de libro | `16-cifra-de-arnold…` / lesson-16 | complete |
| 17 | Homofónico | `17-cifrado-homofonico` / lesson-17 | complete |
| 18 | Vigenère formal | `18-vigenere…` / vigenere | complete |
| 19 | Vernam/OTP | `19-vernam…` / xor | complete |
| 20 | Playfair | `20-playfair` / lesson-20 | complete |
| 21 | Hill | `21-hill` / lesson-21 | complete |
| 22 | Barajado | `22-pautas…` / lesson-22 | complete |
| 23 | Übchi | `23-ubchi…` / columnar | complete |
| 24 | Columnar | `24-transposicion…` / columnar | complete |
| 25 | Interrumpida | `25-transposicion-interrumpida…` / columnar | complete |
| 26 | Cardano | `26-rejilla-de-cardano…` / lesson-26 | complete |
| 27 | M-209 | `27-m-209` / lesson-27 | complete |
| 28 | Enigma M3 | `28-enigma-m3` / lesson-28 | complete |
| 29 | Modelos de ataque | `29-modelos…` / lesson-29 | complete |
| 30 | Frecuencias | `30-analisis…` / frequency | complete |
| 31 | Kasiski | `31-metodo-kasiski` / kasiski | complete |
| 32 | IC | `32-indice…` / coincidence | complete |
| 33 | Kerckhoffs | `33-superposicion…` / lesson-33 | complete |
| 34 | Kullback φ | `34-test-de-kullback…` / coincidence | complete |
| 35 | Solapamiento χ | `35-test-de-solapamiento…` / lesson-35 | complete |
| 36 | Feistel | `36-difusion…` / feistel | complete |
| 37 | DES | `37-des` / lesson-37 | complete |
| 38 | Ataques DES | `38-ataques-a-des` / lesson-38 | complete |
| 39 | Modos de bloque | `39-modos-ecb…` / lesson-39 | complete |
| 40 | 2DES/MITM | `40-2des…` / lesson-40 | complete |
| 41 | 3DES | `41-3des` / lesson-41 | complete |
| 42 | IDEA | `42-idea` / lesson-42 | complete |
| 43 | Blowfish | `43-blowfish` / lesson-43 | complete |
| 44 | AES | `44-aes` / lesson-44 | complete |
| 45 | Sincronización | `45-cifradores-sincronos…` / lesson-45 | complete |
| 46 | RC4 | `46-rc4` / rc4 | complete (vector) |
| 47 | Hash y probabilidad | `47-hash…` / lesson-47 | complete |
| 48 | Padding iterado | `48-construccion…` / lesson-48 | complete |
| 49 | MAC/HMAC | `49-mac…` / lesson-49 | complete |
| 50 | SHA-1/SHA-2 | `50-sha-1…` / lesson-50 | complete |
| 51 | Davies–Meyer | `51-davies-meyer…` / lesson-51 | complete |
| 52 | Esponja | `52-esponja…` / lesson-52 | complete |
| 53 | Factores/φ | `53-factores…` / factors | complete |
| 54 | Modular | `54-aritmetica-modular` / modular | complete |
| 55 | Fermat/Euler | `55-fermat-y-euler` / modular | complete |
| 56 | Miller–Rabin | `56-primalidad…` / primality | complete |
| 57 | Sentido único | `57-funciones…` / lesson-57 | complete |
| 58 | Firma digital | `58-firma-digital` / lesson-58 | complete |
| 59 | RSA | `59-rsa` / rsa | complete (vector) |
| 60 | ElGamal | `60-elgamal` / elgamal | complete (vector) |
| 61 | Diffie–Hellman | `61-diffie-hellman` / dh | complete (vector) |
| 62 | Curvas elípticas | `62-curvas-elipticas` / lesson-62 | complete |
| 63 | Cifrado híbrido | `63-cifrado-hibrido` / lesson-63 | complete |
| 64 | PKI | `64-pki…` / lesson-64 | complete |

Los tests automatizados fijan cobertura de registro, round-trip de los motores reutilizados, aritmética e indicadores, además de los vectores RC4, RSA, ElGamal y DH. Los recorridos de navegador verifican navegación, cálculo, tema adaptable y persistencia.
