# ORIGIN AI — Android-ready starter

Це стартовий проєкт ORIGIN AI з темним сучасним інтерфейсом, адаптивною навігацією, демо-чатом та екранами AI Image / AI Video / AI Code.

## Важливо
Зараз це **інтерфейсний прототип**. Реальні відповіді AI, генерація картинок і відео, реєстрація, синхронізація та система платежів ще не підключені. Для цього потрібні облікові записи провайдерів, серверні API та безпечне зберігання ключів. Не вставляйте секретні API-ключі у `www/main.js`.

## Запуск на Windows
1. Встановіть Node.js LTS та Android Studio.
2. Розпакуйте ZIP.
3. Відкрийте PowerShell у папці проєкту.
4. Виконайте:
   ```bash
   npm install
   npm run build
   npx cap add android
   npx cap sync android
   npx cap open android
   ```
5. В Android Studio дочекайтеся синхронізації Gradle.
6. Для тесту натисніть Run. Для APK: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

Якщо `android` папка вже існує, не виконуйте повторно `npx cap add android`; використовуйте `npx cap sync android`.

## Структура
- `www/main.js` — логіка інтерфейсу
- `www/style.css` — дизайн
- `index.html` — точка входу Vite
- `capacitor.config.json` — налаштування Android-застосунку
