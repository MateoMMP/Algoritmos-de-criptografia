# Nota de seguridad

CryptoLab es software educativo. César, transposiciones, sustituciones, Enigma, M-209, DES, 2DES, 3DES, IDEA, Blowfish, RC4, SHA-1 y RSA didáctico sin padding no deben proteger información real. Las claves pequeñas demuestran matemáticas, no seguridad.

La aplicación no transmite datos. El progreso se guarda en `localStorage`; las claves y mensajes del laboratorio no se persisten. Las operaciones reales disponibles mediante Web Crypto dependen del navegador y deben usar AES-GCM, HMAC, RSA-OAEP o RSA-PSS con parámetros actuales.
