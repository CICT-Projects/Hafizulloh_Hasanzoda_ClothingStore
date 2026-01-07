# Clothing Store E-Commerce Application

Полнофункциональное full-stack e-commerce приложение для магазина одежды с ASP.NET Core API и React frontend.

## Описание

Приложение включает:
- Аутентификацию и авторизацию пользователей (JWT)
- Управление товарами (CRUD для админа)
- Корзину покупок
- Оформление заказов
- Админ-панель для управления товарами и заказами
- Загрузка изображений товаров
- Soft delete для товаров

## Технологии

### Backend (ASP.NET Core)
- .NET 10.0
- Entity Framework Core с SQLite
- JWT аутентификация
- FluentValidation
- Serilog для логирования
- CORS для React frontend

### Frontend (React)
- React 19.2.3 с TypeScript
- Tailwind CSS для стилизации
- Axios для HTTP запросов
- Framer Motion для анимаций
- React Router для навигации

### База данных
- SQLite для разработки
- EF Core migrations

## Запуск проекта

### Предварительные требования
- .NET 10.0 SDK
- Node.js 18+
- npm или yarn

### Backend
1. Перейдите в корневую папку проекта
2. Запустите API:
   ```bash
   dotnet run
   ```
   API будет доступен на http://localhost:5255

### Frontend
1. Перейдите в папку frontend
2. Установите зависимости:
   ```bash
   npm install
   ```
3. Запустите dev server:
   ```bash
   npm start
   ```
   Frontend будет доступен на http://localhost:3000 (или 3001/3002)

### База данных
База данных SQLite создается автоматически при первом запуске с тестовыми данными (8 товаров, админ пользователь).

## API Endpoints

### Аутентификация
- `POST /api/auth/login` - Вход
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/refresh` - Обновление токена
- `POST /api/auth/logout` - Выход

### Товары
- `GET /api/products` - Получить все товары (с фильтрацией)
- `GET /api/products/{id}` - Получить товар по ID

### Корзина
- `GET /api/cart` - Получить корзину пользователя
- `POST /api/cart` - Добавить товар в корзину
- `PUT /api/cart/{id}` - Обновить количество
- `DELETE /api/cart/{id}` - Удалить из корзины

### Заказы
- `GET /api/orders` - Получить заказы пользователя
- `POST /api/orders` - Создать заказ

### Админ (требует роли Admin)
- `GET /api/admin/products` - Все товары
- `POST /api/admin/products` - Создать товар
- `PUT /api/admin/products/{id}` - Обновить товар
- `DELETE /api/admin/products/{id}` - Удалить товар (soft delete)
- `GET /api/admin/orders` - Все заказы
- `GET /api/admin/categories` - Категории
- `POST /api/admin/upload-image` - Загрузить изображение

## Структура проекта

```
ClothingStore.API/
├── Controllers/          # API контроллеры
├── Models/              # Модели данных
├── Data/                # EF Core контекст и конфигурации
├── Services/            # Бизнес-логика
├── Validators/          # Валидация запросов
├── Middleware/          # Промежуточное ПО
├── BackgroundJobs/      # Фоновые задачи
├── Migrations/          # EF миграции
├── wwwroot/images/      # Загруженные изображения
├── frontend/            # React приложение
│   ├── src/
│   │   ├── components/  # Компоненты
│   │   ├── pages/       # Страницы
│   │   └── types.ts     # Типы TypeScript
│   ├── public/
│   └── build/           # Собранное приложение
├── logs/                # Логи приложения
└── appsettings.json     # Конфигурация
```

## Тестовые данные

### Админ
- Email: admin@example.com
- Password: admin123

### Товары
Приложение создает 8 тестовых товаров с изображениями из Unsplash.

## Разработка

### Добавление новых товаров
Используйте админ-панель или API для загрузки изображений и создания товаров.

### Логи
Логи сохраняются в папку logs/ в формате JSON.

### Docker
Проект включает Dockerfile и docker-compose.yml для контейнеризации.

## Автор

Hafizulloh Hasanzoda

## Лицензия

MIT