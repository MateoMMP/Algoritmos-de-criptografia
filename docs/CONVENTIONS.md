# Convenciones

Los alfabetos base son ES_27 (`ABCDEFGHIJKLMNÑOPQRSTUVWXYZ`), LATIN_26, PLAYFAIR_25 (I/J comparten celda), ADFGX y ADFGVX. La interfaz conserva por separado la entrada original y la normalizada. La eliminación de diacríticos, el cambio a mayúsculas y el descarte de símbolos se muestran antes de la traza.

Los índices empiezan en cero en los motores y se presentan en uno cuando representan coordenadas históricas. Los bytes se muestran en hexadecimal big-endian; texto y claves textuales se convierten explícitamente mediante UTF-8. BigInt se presenta y serializa como texto decimal. El padding nunca se retira silenciosamente.
