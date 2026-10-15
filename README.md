# SayIt

Entrenador personal de inglés para hispanohablantes, pensado para usarse desde el celular (Chrome en Android).

## Qué hace

- **Diagnóstico de nivel adaptativo** (unos 12 minutos): gramática, vocabulario, lectura, comprensión auditiva, pronunciación, expresión oral y escrita. Resultado según el MCER (A1 a C1) con subnivel inicial, medio o alto.
- **Programa de 12 semanas**, cada una con un tema, un punto de gramática, 10 expresiones útiles, un sonido difícil y una conversación.
- **Sesión diaria** de 10 a 30 minutos: palabras con repetición espaciada, gramática, escucha, sonido de la semana, pronunciación y conversación con el coach.
- **Chequeo semanal** para medir lo aprendido y pasar de semana.
- **Pronunciación**: 12 sonidos que cuestan a quien habla español (ship/sheep, b/v, th, -ed, acento...), con juego de pares mínimos, "Repetí conmigo" con reconocimiento de voz, grabación propia para comparar con el modelo y análisis opcional con IA.
- **Juegos**: memoria, armar frases, dictado y repaso de palabras.
- **Progreso**: racha, minutos, evolución del nivel, chequeos por semana, aciertos por sonido y cuaderno de errores.
- Funciona sin conexión (salvo el coach con IA) y se puede instalar como app.

## Configuración en Netlify

1. En **Site configuration → Environment variables**, agregá `OPENAI_API_KEY` con tu clave de OpenAI.
2. Opcional: `COACH_MODEL` (por defecto `gpt-5.4-mini`) y `AUDIO_MODEL` (por defecto `gpt-audio-mini`, se usa para analizar la pronunciación).
3. Publicá. La función queda en `/api/coach`, con un límite de 40 pedidos por minuto por dispositivo.

Sin la clave, la app funciona igual: el diagnóstico estima la parte oral y escrita sin IA, y la conversación se reemplaza por ejercicios de repetición.

## Datos

Todo se guarda en el teléfono (localStorage). Desde **Ajustes** se puede guardar y restaurar una copia de seguridad.

## Publicar una versión nueva

Cambiá el número de `CACHE` en `sw.js` para que los teléfonos descarguen la versión nueva.
