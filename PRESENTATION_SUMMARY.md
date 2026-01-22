# סקירה מקיפה - מערכת ניהול שעות עבודה
## Team 2 Time Tracker

---

## תקציר מנהלים

מערכת ניהול שעות עבודה מקיפה המיועדת לעובדים ומנהלים לניהול דיווח שעות, היעדרויות ודיווחים. המערכת בנויה בארכיטקטורה מודרנית של Full-Stack עם תמיכה מלאה בעברית (RTL), ממשק ידידותי למובייל ומנגנוני אבטחה מתקדמים.

### מאפיינים מרכזיים
- ✅ דיווח שעות עבודה (ידני + טיימר אוטומטי)
- ✅ ניהול בקשות היעדרות (חופשה, מחלה, מילואים)
- ✅ מערכת דיווחים מתקדמת למנהלים
- ✅ ניעול חודשים ומניעת עריכות רטרואקטיביות
- ✅ ניהול משימות, פרויקטים ולקוחות
- ✅ מעקב מלא אחר פעולות (Audit Log)

---

## 1. סקירת הפרויקט

### מטרת המערכת
מערכת לניהול שעות עבודה יומיומי המאפשרת:
- **לעובדים:** דיווח שעות עבודה, ניהול היעדרויות, צפייה בהיסטוריה
- **למנהלים:** ניהול משתמשים, ניהול תשתיות (לקוחות/פרויקטים/משימות), דיווחים מתקדמים

### קהל יעד
- עובדים המדווחים שעות עבודה יומיומיות
- מנהלים אדמיניסטרטיביים הזקוקים לניהול משאבי אנוש ודיווחים

### עקרונות עיצוב
- **Mobile-First:** ממשק מותאם במיוחד לשימוש במובייל
- **RTL-Ready:** תמיכה מלאה בעברית וכיווניות ימין לשמאל
- **UX ממוקד:** פחות קליקים, אינדיקציות ויזואליות ברורות
- **אבטחה מובנית:** JWT Tokens, הצפנת סיסמאות, Rate Limiting

---

## 2. ארכיטקטורת הפרויקט

### מבנה התיקיות (Monorepo)

```
team-2-time-tracker/
├── server/                    # Backend - Express.js + Prisma
│   ├── src/
│   │   ├── modules/          # פיצ'רים (auth, workday, timer, absences, etc.)
│   │   ├── shared/           # utilities משותפים (errors, logger, pagination)
│   │   ├── middlewares/      # authentication, validation, error handling
│   │   └── app.ts            # אתחול אפליקציה
│   ├── prisma/
│   │   ├── schema.prisma     # הגדרת מסד נתונים
│   │   └── migrations/       # מיגרציות
│   └── .env                  # משתני סביבה
│
├── client/                    # Frontend - React
│   ├── apps/
│   │   ├── employee/         # אפליקציית עובד
│   │   └── admin/            # אפליקציית מנהל
│   └── packages/             # ספריות משותפות
│       ├── api-client/       # HTTP client + API methods
│       ├── ui/               # קומפוננטות משותפות (Radix UI)
│       └── utils/            # פונקציות עזר (תאריכים, פורמטים)
│
├── shared/
│   └── types/                # Types + DTOs משותפים (TypeScript)
│
├── infra/                     # Docker + deployment configs
│   └── compose.yml           # Docker Compose
│
├── project-features/          # תיעוד מקיף
│   ├── projectsummery.md     # סקירה מנהלים + חוקי עסק
│   ├── stack.md              # טכנולוגיות
│   ├── endpoints.md          # תיעוד API
│   ├── schemes.md            # מבנה מסד נתונים
│   └── dtos.md               # אובייקטי העברה
│
└── openspec/                  # ארכיטקטורה וספציפיקציות
```

---

## 3. מחסנית הטכנולוגיות (Tech Stack)

### Backend
| טכנולוגיה | גרסה | שימוש |
|-----------|------|-------|
| Node.js | 18+ | סביבת ריצה |
| Express.js | 5.2 | Web Framework |
| TypeScript | 5.9 | שפת פיתוח (strict mode) |
| PostgreSQL | 16 | מסד נתונים |
| Prisma ORM | 7.2 | ניהול מסד נתונים |
| JWT | - | אימות והרשאות |
| bcrypt | - | הצפנת סיסמאות |
| Zod | - | ולידציה |
| Winston | - | Logging |
| Helmet | - | אבטחת HTTP Headers |
| AWS S3 / IDrive e2 | - | אחסון קבצים |

### Frontend
| טכנולוגיה | גרסה | שימוש |
|-----------|------|-------|
| React | 19.2 | UI Framework |
| TypeScript | 5.9 | שפת פיתוח |
| Vite | 7.3 | Build Tool |
| Zustand | - | ניהול State גלובלי |
| TanStack Query | - | ניהול Server State + Cache |
| React Hook Form | - | ניהול טפסים |
| Zod | - | ולידציית טפסים |
| React Router | 7.12 | ניתוב |
| Radix UI | - | קומפוננטות נגישות |
| Lucide React | - | אייקונים |
| TanStack Table | 8.0 | טבלאות מתקדמות |
| Axios | - | HTTP Client |

### DevOps & Infrastructure
| טכנולוגיה | שימוש |
|-----------|-------|
| Docker + Docker Compose | קונטיינריזציה |
| pnpm Workspaces | ניהול Monorepo |
| GitHub Actions | CI/CD Pipelines |
| Render | Deployment + CD |
| Vitest | Unit + Integration Tests |
| ESLint + Prettier | Code Quality |

---

## 4. פיצ'רים מרכזיים

### A. מערכת אימות ואבטחה
#### אימות משתמשים
- התחברות באמצעות אימייל וסיסמה
- חובת החלפת סיסמה בכניסה ראשונה
- JWT Access Tokens (תוקף 2 שעות)
- Refresh Tokens (תוקף 30 יום) עם Blacklisting
- אחסון Tokens ב-HTTP-only Cookies (מניעת XSS)

#### הרשאות
- 2 תפקידים: **EMPLOYEE** / **ADMIN**
- Role-based Access Control (RBAC)
- עובדים רואים רק את הנתונים שלהם
- מנהלים רואים את כל הנתונים

#### אבטחה
- הצפנת סיסמאות עם bcrypt
- Rate Limiting על נקודות קצה רגישות
- CORS מוגדר לפי סביבה
- Helmet Security Headers
- HTTPS בסביבת ייצור

---

### B. דיווח שעות עבודה (Core Feature)

#### 1. מנגנון הטיימר (Server-Side Timer)
**תכונות:**
- הפעלה/עצירה של טיימר יומי
- **שורד סגירת דפדפן** - הטיימר רץ בצד השרת
- חישוב זמן שחלף בצד השרת (דיוק גבוה)
- הצגת באנר קבוע בראש המסך (בכל העמודים)
- עצירת טיימר יוצרת אוטומטית רשומת זמן

**ממשק משתמש:**
- כרטיס טיימר בולט עם אנימציה
- צבע ירוק כשרץ, אפור כשעצר
- טקסט "פעיל" / "לא פעיל"
- כפתור Start/Stop
- ספירה חיה בפורמט שעות:דקות:שניות

#### 2. רשומות זמן (Time Entries)
**יצירה:**
- **אוטומטית:** דרך עצירת טיימר
- **ידנית:** דרך טופס עם שדות:
  - תאריך עבודה
  - שעת התחלה/שעת סיום
  - מיקום עבודה: משרד / לקוח / בית
  - **משימה נדרשת** (רק משימות שהוקצו למשתמש)
  - תיאור (10-500 תווים)

**עריכה ומחיקה:**
- ניתן לערוך רשומות בחודש פתוח
- מחיקה רכה (Soft Delete) - נשמר במערכת
- **לא ניתן לערוך חודש נעול**

**חוקי ולידציה:**
- שעת סיום חייבת להיות אחרי שעת התחלה
- משימה חייבת להיות מוקצית למשתמש
- תיאור בין 10 ל-500 תווים
- אי אפשר ליצור רשומה בחודש נעול

#### 3. סיכום יום עבודה (Workday Summary)
**יעד יומי:** 540 דקות (9 שעות)

**חישוב:**
```
סה"כ דקות = דקות עבודה + דקות היעדרות
יתרה = סה"כ דקות - 540
```

**סטטוסים:**
- 🔴 **MISSING** - חסר (פחות מ-540)
- 🟢 **FULL** - מלא (בדיוק 540)
- 🟠 **EXCEPTION** - חריג (מעל 540)

**ויזואליזציה:**
- פס התקדמות צבעוני
- אחוזים + דקות
- אינדיקטור "חסר X דקות" / "יתר X דקות"

**שליחת יום:**
- ניתן לשלוח רק יום עם בדיוק 540 דקות
- שליחה מאפשרת הגשה למנהל
- ביטול שליחה מאפשר עריכה נוספת (עד ניעול חודש)

---

### C. ניהול היעדרויות (Absence Management)

#### סוגי היעדרות
| סוג | קוד |
|-----|-----|
| חופשה | VACATION |
| מחלה | SICK |
| מילואים | RESERVES |
| אחר | OTHER |

#### יצירת בקשת היעדרות
**שדות:**
- סוג היעדרות
- תאריך התחלה + תאריך סיום
- האם חצי יום? (270 דקות במקום 540)
- הערה אופציונלית

**אלגוריתם פיתוח תאריכים:**
1. המערכת לוקחת את טווח התאריכים
2. מסננת **רק ימי עבודה** (ראשון-חמישי בשבוע ישראלי)
3. יוצרת רשומה עבור כל יום עבודה (absence_day)
4. כל יום מקבל 270 או 540 דקות לפי "חצי יום"

**דוגמה:**
```
בקשה: 20/1/2026 - 24/1/2026 (יום מלא)
ימים שייכללו: 20/1 (ב'), 21/1 (ג'), 22/1 (ד'), 23/1 (ה'), 26/1 (א')
לא ייכללו: 24/1 (ו'), 25/1 (ש')
כל יום יקבל: 540 דקות
```

#### העלאת מסמכים
**נדרש עבור:** מחלה (SICK) ומילואים (RESERVES)

**טיפוסי קבצים:** PDF, JPG, PNG
**גודל מקסימלי:** 10MB
**אחסון:** IDrive e2 / AWS S3 (לפי הגדרות)

**סטטוסים:**
- **PENDING_DOCUMENT** - ממתין למסמך (אוטומטי אם לא הועלה)
- **SUBMITTED** - הוגש (לאחר העלאת מסמך)

**מאפיינים:**
- אפשרות להוסיף מספר מסמכים לבקשה אחת
- אפשרות להוריד מסמכים שהועלו
- **יוצא מן הכלל:** אפשר להעלות מסמכים גם בחודש נעול

---

### D. מערכת Selectors החכמה (Auto-Cascading)

#### היררכיה
```
לקוח (Client) → פרויקט (Project) → משימה (Task)
```

#### לוגיקת בחירה אוטומטית
1. אם יש רק **לקוח אחד** → נבחר אוטומטית
2. אם נבחר לקוח עם **פרויקט אחד** → נבחר אוטומטית
3. אם נבחר פרויקט עם **משימה אחת** → נבחרת אוטומטית

#### מיון פריטים
- **אלפביתי** (ברירת מחדל)
- **לפי תדירות שימוש** (המשימות הנפוצות למעלה)

#### סינון משימות
- מוצגות **רק משימות שהוקצו למשתמש**
- משימות סגורות (CLOSED) לא מוצגות
- פרויקטים לא פעילים (INACTIVE) לא מוצגים

---

### E. פאנל ניהול (Admin Panel)

#### 1. ניהול משתמשים (User Management)
**פעולות:**
- צפייה ברשימת כל המשתמשים
- יצירת משתמש חדש (שם, אימייל, סיסמה ראשונית)
- עריכת פרטי משתמש
- שינוי סטטוס: פעיל/לא פעיל
- **איפוס סיסמה** - יצירת סיסמה חדשה וחובת החלפה

**שדות:**
- שם מלא, אימייל
- תפקיד: עובד / מנהל
- סטטוס: פעיל / לא פעיל
- דרישת החלפת סיסמה בכניסה הבאה

#### 2. ניהול ישויות (Entity Management)

**לקוחות (Clients):**
- יצירה, עריכה, שינוי סטטוס (פעיל/לא פעיל)
- שם, תיאור

**פרויקטים (Projects):**
- יצירה, עריכה, שינוי סטטוס
- שיוך ללקוח
- סוג דיווח:
  - **TOTAL_HOURS** - סכום שעות בלבד
  - **ENTRY_EXIT** - כניסה/יציאה מדויקות
- תאריך התחלה/סיום אופציונליים

**משימות (Tasks):**
- יצירה, עריכה, שינוי סטטוס (פתוח/סגור)
- שיוך לפרויקט
- תאריך התחלה/סיום אופציונליים
- **ולידציה:** תאריכי המשימה חייבים להיות בטווח תאריכי הפרויקט

#### 3. הקצאת משימות (Task Assignments)

**הקצאה יחידה:**
- בחירת משתמש
- בחירת משימה
- שמירה

**הקצאה מרובה (Bulk Assignment):**
- בחירת **מספר משתמשים**
- בחירת **מספר משימות**
- המערכת יוצרת **מכפלה קרטזית**:
  ```
  3 משתמשים × 5 משימות = 15 הקצאות
  ```
- חיסכון דרמטי בזמן ניהול

**הסרת הקצאות:**
- מחיקת הקצאה מבטלת את האפשרות לבחור משימה

#### 4. מערכת דיווחים (Reports Dashboard)

**סקירת דשבורד (Dashboard Overview):**
- סטטיסטיקות חודשיות:
  - סה"כ שעות עבודה
  - סה"כ ימי היעדרות
  - ממוצע שעות ליום
  - מספר עובדים פעילים
  - מספר פרויקטים פעילים

**דוח משתמש חודשי (Monthly User Report):**
- בחירת משתמש + חודש
- פילוח מלא:
  - סה"כ ימי עבודה
  - סה"כ דקות עבודה
  - סה"כ דקות היעדרות
  - ימים שהוגשו/לא הוגשו
  - רשימת כל הרשומות

**ייצוא לקובץ CSV:**
- הורדת הדוח החודשי בפורמט CSV
- תואם לאקסל/גוגל שיטס
- כולל כל הנתונים (תאריכים, שעות, משימות, תיאורים)

#### 5. מערכת ניעול חודשים (Month Locking)

**תכלית:**
- מנע עריכות רטרואקטיביות
- סגירת חודש רשמית לאחר הסכמה

**פעולות:**
- **נעילת חודש:**
  - בחירת חודש (MM/YYYY)
  - אישור נעילה
  - מיידית - כל המשתמשים לא יכולים לערוך
- **שחרור נעילה:**
  - בחירת חודש נעול
  - שחרור מאפשר עריכה מחודשת

**השפעות:**
- **כשנעול:**
  - ❌ לא ניתן ליצור/לערוך/למחוק רשומות זמן
  - ❌ לא ניתן ליצור/לערוך/למחוק היעדרויות
  - ✅ **עדיין ניתן** להעלות מסמכים להיעדרויות (יוצא מן הכלל)

- **כששוחרר:**
  - ✅ כל הפעולות מאופשרות מחדש

#### 6. יומן ביקורת (Audit Log)

**מטרה:**
- מעקב מלא אחר כל פעולות המנהלים
- שקיפות ומתן דין וחשבון

**פעולות נרשמות:**
- יצירת ישויות (CREATE)
- עדכון ישויות (UPDATE)
- שינוי סטטוס (STATUS_CHANGE)
- איפוס סיסמאות (RESET_PASSWORD)
- נעילת/שחרור חודשים (LOCK_MONTH / UNLOCK_MONTH)

**מידע נשמר:**
- מי ביצע (Admin)
- מה בוצע (Action)
- על מה בוצע (Entity Type + ID)
- מתי בוצע (Timestamp)
- **ערכים לפני/אחרי** (Old/New Values בפורמט JSON)

**ממשק:**
- טבלת Audit Log עם סינון
- אפשרות חיפוש לפי סוג פעולה
- אפשרות חיפוש לפי מנהל
- הצגת Before/After Values

---

## 5. מסד הנתונים (Database Schema)

### טכנולוגיה
- **PostgreSQL 16** עם **Prisma ORM 7.2**
- UUIDs כמפתחות ראשיים
- Timestamps בפורמט UTC
- Enums מוגדרים ברמת מסד הנתונים (Type Safety)

### ישויות מרכזיות

#### users (משתמשים)
```sql
id UUID PRIMARY KEY
full_name VARCHAR NOT NULL
email VARCHAR UNIQUE NOT NULL
password_hash VARCHAR NOT NULL
role ENUM (EMPLOYEE, ADMIN)
is_active BOOLEAN DEFAULT true
force_password_change BOOLEAN DEFAULT true
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### clients (לקוחות)
```sql
id UUID PRIMARY KEY
name VARCHAR NOT NULL
description TEXT
status ENUM (ACTIVE, INACTIVE) DEFAULT ACTIVE
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### projects (פרויקטים)
```sql
id UUID PRIMARY KEY
client_id UUID FK → clients
name VARCHAR NOT NULL
description TEXT
status ENUM (ACTIVE, INACTIVE) DEFAULT ACTIVE
report_type ENUM (TOTAL_HOURS, ENTRY_EXIT) DEFAULT TOTAL_HOURS
start_date DATE OPTIONAL
end_date DATE OPTIONAL
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### tasks (משימות)
```sql
id UUID PRIMARY KEY
project_id UUID FK → projects
name VARCHAR NOT NULL
status ENUM (OPEN, CLOSED) DEFAULT OPEN
start_date DATE OPTIONAL
end_date DATE OPTIONAL
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### task_assignments (הקצאות משימות)
```sql
id UUID PRIMARY KEY
user_id UUID FK → users
task_id UUID FK → tasks
assigned_at TIMESTAMP
assigned_by_user_id UUID FK → users
UNIQUE(user_id, task_id)
```

#### time_entries (רשומות זמן)
```sql
id UUID PRIMARY KEY
user_id UUID FK → users
work_date DATE NOT NULL
start_time TIME NOT NULL
end_time TIME NOT NULL
duration_minutes INTEGER NOT NULL
location ENUM (OFFICE, CLIENT, HOME) NOT NULL
task_assignment_id UUID FK → task_assignments
description TEXT (10-500 chars)
source ENUM (MANUAL, TIMER) DEFAULT MANUAL
is_deleted BOOLEAN DEFAULT false
deleted_at TIMESTAMP OPTIONAL
deleted_by_user_id UUID FK → users OPTIONAL
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### timers (טיימרים)
```sql
id UUID PRIMARY KEY
user_id UUID FK → users
work_date DATE NOT NULL
started_at TIMESTAMP NOT NULL
stopped_at TIMESTAMP OPTIONAL
is_running BOOLEAN DEFAULT true
duration_minutes INTEGER OPTIONAL
UNIQUE(user_id, work_date)
```

#### workday_summaries (סיכומי ימי עבודה)
```sql
id UUID PRIMARY KEY
user_id UUID FK → users
work_date DATE NOT NULL
target_minutes INTEGER DEFAULT 540
work_minutes INTEGER DEFAULT 0
absence_minutes INTEGER DEFAULT 0
status ENUM (MISSING, FULL, EXCEPTION)
is_submitted BOOLEAN DEFAULT false
submitted_at TIMESTAMP OPTIONAL
is_locked BOOLEAN DEFAULT false
UNIQUE(user_id, work_date)
```

#### absence_requests (בקשות היעדרות)
```sql
id UUID PRIMARY KEY
user_id UUID FK → users
type ENUM (VACATION, SICK, RESERVES, OTHER)
start_date DATE NOT NULL
end_date DATE NOT NULL
is_half_day BOOLEAN DEFAULT false
status ENUM (PENDING_DOCUMENT, SUBMITTED)
note TEXT OPTIONAL
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### absence_days (ימי היעדרות מפוצלים)
```sql
id UUID PRIMARY KEY
user_id UUID FK → users
absence_request_id UUID FK → absence_requests
work_date DATE NOT NULL
minutes INTEGER NOT NULL
UNIQUE(user_id, work_date, absence_request_id)
```

#### absence_documents (מסמכי היעדרות)
```sql
id UUID PRIMARY KEY
absence_request_id UUID FK → absence_requests
file_url VARCHAR NOT NULL
file_name VARCHAR NOT NULL
mime_type VARCHAR NOT NULL
file_size_bytes BIGINT NOT NULL
uploaded_by_user_id UUID FK → users
uploaded_at TIMESTAMP
```

#### month_locks (ניעולי חודשים)
```sql
id UUID PRIMARY KEY
month DATE NOT NULL (stored as YYYY-MM-01)
locked_at TIMESTAMP NOT NULL
locked_by_user_id UUID FK → users
unlocked_at TIMESTAMP OPTIONAL
unlocked_by_user_id UUID FK → users OPTIONAL
is_locked BOOLEAN DEFAULT true
```

#### audit_logs (יומן ביקורת)
```sql
id UUID PRIMARY KEY
admin_user_id UUID FK → users
entity_type VARCHAR NOT NULL
entity_id UUID NOT NULL
action ENUM (CREATE, UPDATE, STATUS_CHANGE, RESET_PASSWORD, LOCK_MONTH, UNLOCK_MONTH)
old_values JSONB OPTIONAL
new_values JSONB OPTIONAL
created_at TIMESTAMP
```

#### refresh_token_blacklist (רשימה שחורה של Tokens)
```sql
id UUID PRIMARY KEY
token_hash VARCHAR UNIQUE NOT NULL
user_id UUID FK → users
blacklisted_at TIMESTAMP
expires_at TIMESTAMP
```

### אינדקסים לביצועים
- `users.email` (unique index)
- `time_entries.user_id, work_date`
- `timers.user_id, work_date`
- `workday_summaries.user_id, work_date`
- `absence_days.user_id, work_date`
- `task_assignments.user_id, task_id`
- `audit_logs.entity_type, entity_id`

---

## 6. API - נקודות קצה (Endpoints)

### מבנה כללי
- **Base URL:** `/api/v1`
- **פורמט תשובה:**
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
- **פורמט שגיאה:**
  ```json
  {
    "success": false,
    "error": {
      "code": "ERROR_CODE",
      "message": "הודעת שגיאה"
    }
  }
  ```

### קטגוריות API

#### 🔐 Authentication (6 endpoints)
```
POST   /api/v1/auth/login              התחברות
POST   /api/v1/auth/refresh            רענון טוקן
POST   /api/v1/auth/change-password    החלפת סיסמה
POST   /api/v1/auth/logout             התנתקות
GET    /api/v1/auth/me                 פרופיל משתמש נוכחי
```

#### 📅 Workday (4 endpoints)
```
GET    /api/v1/workday/:date                     סיכום יום עבודה
POST   /api/v1/workday/:date/submit              שליחת יום
POST   /api/v1/workday/:date/cancel              ביטול שליחה
GET    /api/v1/workday/calendar/:month           לוח שנה חודשי
```

#### ⏱️ Time Entries (7 endpoints)
```
POST   /api/v1/time-entries              יצירת רשומת זמן
POST   /api/v1/time-entries/batch        יצירת רשומות מרובות
GET    /api/v1/time-entries/:id          קבלת רשומת זמן
GET    /api/v1/time-entries/history      היסטוריה
PUT    /api/v1/time-entries/:id          עדכון רשומת זמן
DELETE /api/v1/time-entries/:id          מחיקת רשומת זמן
```

#### ⏲️ Timer (4 endpoints)
```
POST   /api/v1/timer/start               הפעלת טיימר
POST   /api/v1/timer/stop                עצירת טיימר
GET    /api/v1/timer/status              סטטוס טיימר נוכחי
DELETE /api/v1/timer/cancel              ביטול טיימר
```

#### 🏖️ Absences (9 endpoints)
```
POST   /api/v1/absences                              יצירת בקשת היעדרות
GET    /api/v1/absences                              רשימת היעדרויות
GET    /api/v1/absences/:id                          פרטי היעדרות
PUT    /api/v1/absences/:id                          עדכון היעדרות
DELETE /api/v1/absences/:id                          מחיקת היעדרות
POST   /api/v1/absences/:id/documents                 העלאת מסמך
GET    /api/v1/absences/:id/documents                 רשימת מסמכים
GET    /api/v1/absences/:id/documents/:docId/download הורדת מסמך
DELETE /api/v1/absences/:id/documents/:docId         מחיקת מסמך
```

#### 🎯 Selectors (5 endpoints)
```
GET    /api/v1/selectors/clients         רשימת לקוחות פעילים
GET    /api/v1/selectors/projects        רשימת פרויקטים פעילים (לפי לקוח)
GET    /api/v1/selectors/tasks           רשימת משימות פתוחות (לפי פרויקט)
GET    /api/v1/my/assignments            משימות שהוקצו למשתמש
GET    /api/v1/my/statistics/:month      סטטיסטיקות אישיות חודשיות
```

#### 👥 Admin - Users (6 endpoints)
```
GET    /admin/users                      רשימת כל המשתמשים
GET    /admin/users/:id                  פרטי משתמש
POST   /admin/users                      יצירת משתמש חדש
PUT    /admin/users/:id                  עדכון משתמש
PUT    /admin/users/:id/status           שינוי סטטוס
POST   /admin/users/:id/reset-password   איפוס סיסמה
```

#### 🏢 Admin - Entities (12 endpoints)
**Clients:**
```
GET    /admin/clients                    רשימת לקוחות
POST   /admin/clients                    יצירת לקוח
GET    /admin/clients/:id                פרטי לקוח
PUT    /admin/clients/:id                עדכון לקוח
PUT    /admin/clients/:id/status         שינוי סטטוס
```

**Projects:**
```
GET    /admin/projects                   רשימת פרויקטים
POST   /admin/projects                   יצירת פרויקט
GET    /admin/projects/:id               פרטי פרויקט
PUT    /admin/projects/:id               עדכון פרויקט
PUT    /admin/projects/:id/status        שינוי סטטוס
PUT    /admin/projects/:id/report-type   שינוי סוג דיווח
```

**Tasks:**
```
GET    /admin/tasks                      רשימת משימות
POST   /admin/tasks                      יצירת משימה
GET    /admin/tasks/:id                  פרטי משימה
PUT    /admin/tasks/:id                  עדכון משימה
PUT    /admin/tasks/:id/status           שינוי סטטוס
```

#### 🎯 Admin - Assignments (4 endpoints)
```
GET    /admin/assignments                רשימת הקצאות
POST   /admin/assignments                הקצאה יחידה
POST   /admin/assignments/bulk           הקצאה מרובה
DELETE /admin/assignments/:id           מחיקת הקצאה
```

#### 📊 Admin - Reports (4 endpoints)
```
GET    /admin/reports/dashboard                        דשבורד סטטיסטיקות
GET    /admin/reports/users/:userId/monthly/:month     דוח משתמש חודשי
GET    /admin/reports/users/:userId/monthly/:month/export  ייצוא CSV
GET    /admin/users/:userId/time-entries               כל הרשומות של משתמש
```

#### 🔒 Admin - Month Locks (3 endpoints)
```
GET    /admin/month-locks                רשימת חודשים נעולים
GET    /admin/month-locks/status/:month  סטטוס חודש ספציפי
POST   /admin/month-locks/lock           נעילת חודש
POST   /admin/month-locks/unlock         שחרור חודש
```

#### 📜 Admin - Audit Logs (2 endpoints)
```
GET    /admin/audit-logs                 רשימת לוגים
GET    /admin/audit-logs/:id             פרטי לוג ספציפי
```

**סה"כ:** 66 נקודות קצה

---

## 7. זרימת עבודה (Workflows)

### 🔵 זרימת עבודה של עובד - יום עבודה טיפוסי

```
1. התחברות למערכת
   └─> אימות JWT
   └─> אם כניסה ראשונה → מעבר לשינוי סיסמה

2. דף דיווח יומי (Daily Report)
   ├─> צפייה בסטטוס יום (חסר X דקות / מלא)
   ├─> רשימת רשומות קיימות
   └─> טיימר (אם רץ - בולט למעלה)

3. התחלת עבודה
   ├─> אופציה 1: הפעלת טיימר
   │   ├─> לחיצה על "התחל טיימר"
   │   ├─> בחירת משימה מתוך רשימה מותאמת אישית
   │   ├─> הוספת תיאור (אופציונלי בשלב זה)
   │   └─> טיימר רץ ונשאר בראש המסך
   │
   └─> אופציה 2: הזנה ידנית
       ├─> לחיצה על "הוסף רשומה"
       ├─> בחירת תאריך, שעת התחלה/סיום
       ├─> בחירת לקוח → פרויקט → משימה (אוטומטי אם יש רק 1)
       ├─> בחירת מיקום (משרד/לקוח/בית)
       ├─> תיאור (10-500 תווים)
       └─> שמירה

4. סיום עבודה
   └─> אם טיימר רץ: לחיצה על "עצור"
       ├─> טופס עריכה נפתח
       ├─> אפשרות לעדכן מיקום, תיאור
       ├─> אישור → רשומה נוצרת
       └─> הטיימר מתאפס

5. סיכום יום
   ├─> בדיקת סטטוס: האם 540 דקות?
   ├─> אם חסר: הוספת רשומות נוספות / היעדרות
   └─> אם מלא (בדיוק 540): לחיצה על "שלח יום"

6. הגשת בקשת היעדרות (במקרה צורך)
   ├─> מעבר לעמוד "היעדרויות"
   ├─> לחיצה על "בקשה חדשה"
   ├─> בחירת סוג (חופשה/מחלה/מילואים/אחר)
   ├─> בחירת תאריך התחלה/סיום
   ├─> סימון "חצי יום" אם רלוונטי
   ├─> אם מחלה/מילואים: העלאת מסמך (PDF/JPG/PNG)
   └─> שליחה → המערכת יוצרת רשומות יומיות אוטומטית
```

---

### 🟠 זרימת עבודה של מנהל - ניהול משתמש

```
1. התחברות למערכת (Admin Role)

2. ניהול משתמשים
   ├─> צפייה ברשימת כל המשתמשים
   │   ├─> סינון לפי סטטוס (פעיל/לא פעיל)
   │   ├─> חיפוש לפי שם/אימייל
   │   └─> מיון לפי תאריך יצירה
   │
   ├─> יצירת משתמש חדש
   │   ├─> מילוי שם מלא, אימייל
   │   ├─> בחירת תפקיד (עובד/מנהל)
   │   ├─> יצירת סיסמה ראשונית
   │   └─> שמירה → משתמש מקבל הודעה (אימייל/אחר)
   │
   ├─> עריכת משתמש
   │   ├─> שינוי שם/אימייל
   │   ├─> שינוי תפקיד
   │   └─> שמירה
   │
   ├─> שינוי סטטוס
   │   ├─> השבתת משתמש (לא יכול להתחבר)
   │   └─> הפעלה מחדש
   │
   └─> איפוס סיסמה
       ├─> יצירת סיסמה חדשה (אוטומטית או ידנית)
       ├─> סימון "חובת שינוי בכניסה הבאה"
       └─> משתמש מקבל הודעה
```

---

### 🟢 זרימת עבודה של מנהל - ניהול ישויות

```
1. ניהול לקוחות (Clients)
   ├─> יצירת לקוח חדש (שם, תיאור)
   ├─> עריכת פרטי לקוח
   ├─> שינוי סטטוס (פעיל ← → לא פעיל)
   └─> צפייה ברשימת לקוחות

2. ניהול פרויקטים (Projects)
   ├─> יצירת פרויקט
   │   ├─> שיוך ללקוח
   │   ├─> שם, תיאור
   │   ├─> בחירת סוג דיווח (סכום שעות / כניסה-יציאה)
   │   └─> תאריך התחלה/סיום (אופציונלי)
   │
   ├─> עריכת פרויקט
   ├─> שינוי סטטוס (פעיל/לא פעיל)
   ├─> שינוי סוג דיווח
   └─> צפייה ברשימת פרויקטים (סינון לפי לקוח)

3. ניהול משימות (Tasks)
   ├─> יצירת משימה
   │   ├─> שיוך לפרויקט
   │   ├─> שם
   │   ├─> תאריך התחלה/סיום (אופציונלי, חייב בטווח הפרויקט)
   │   └─> שמירה
   │
   ├─> עריכת משימה
   ├─> שינוי סטטוס (פתוח/סגור)
   └─> צפייה ברשימת משימות (סינון לפי פרויקט)

4. הקצאת משימות למשתמשים
   ├─> הקצאה יחידה
   │   ├─> בחירת משתמש
   │   ├─> בחירת משימה
   │   └─> שמירה
   │
   ├─> הקצאה מרובה (Bulk)
   │   ├─> בחירת 3 משתמשים
   │   ├─> בחירת 5 משימות
   │   ├─> אישור → 15 הקצאות נוצרות (3×5)
   │   └─> הודעה על הצלחה
   │
   └─> הסרת הקצאה
       ├─> מציאת ההקצאה בטבלה
       ├─> לחיצה על מחק
       └─> אישור
```

---

### 🔴 זרימת עבודה של מנהל - ניהול חודשים ודיווחים

```
1. צפייה בדשבורד
   ├─> סטטיסטיקות כלליות (חודש נוכחי):
   │   ├─> סה"כ שעות עבודה
   │   ├─> סה"כ ימי היעדרות
   │   ├─> ממוצע שעות ליום
   │   └─> מספר עובדים/פרויקטים פעילים
   │
   └─> גרפים (אופציונלי): התפלגות שעות, מגמות

2. צפייה בדוח משתמש ספציפי
   ├─> בחירת משתמש מרשימה
   ├─> בחירת חודש
   ├─> צפייה בדוח:
   │   ├─> סיכום כללי (סה"כ שעות, היעדרויות)
   │   ├─> פילוח יומי (טבלה)
   │   └─> רשימת כל הרשומות
   │
   └─> ייצוא ל-CSV
       ├─> לחיצה על "ייצוא"
       ├─> קובץ מתחיל להוריד
       └─> פתיחה באקסל/גוגל שיטס

3. ניעול חודש (Month Locking)
   ├─> מעבר לעמוד "ניעולי חודשים"
   ├─> לחיצה על "נעל חודש חדש"
   ├─> בחירת חודש (MM/YYYY)
   ├─> אישור:
   │   ├─> "האם אתה בטוח? לא ניתן לערוך רשומות!"
   │   └─> אישור
   │
   ├─> תוצאה:
   │   ├─> החודש מסומן כנעול
   │   ├─> כל העובדים מקבלים הודעה (אופציונלי)
   │   └─> רשומות החודש כבר לא ניתנות לעריכה
   │
   └─> שחרור נעילה (Unlock)
       ├─> בחירת חודש נעול
       ├─> לחיצה על "שחרר"
       ├─> אישור
       └─> העובדים יכולים לערוך שוב

4. צפייה בלוג ביקורת (Audit Log)
   ├─> מעבר לעמוד "לוג ביקורת"
   ├─> צפייה ברשימת כל הפעולות:
   │   ├─> מי ביצע (מנהל)
   │   ├─> מה בוצע (פעולה)
   │   ├─> על מה (ישות + ID)
   │   ├─> מתי (תאריך ושעה)
   │   └─> ערכים לפני/אחרי (JSON)
   │
   ├─> סינון לפי:
   │   ├─> סוג פעולה (CREATE, UPDATE, etc.)
   │   ├─> מנהל
   │   └─> טווח תאריכים
   │
   └─> הרחבת רשומה לצפייה בפירוט מלא
```

---

## 8. חוקי עסק וולידציות

### ⚠️ ולידציות חוסמות (Blocking)

#### רשומות זמן (Time Entries)
| חוק | הסבר |
|-----|------|
| שעת סיום > שעת התחלה | מונע שעות לא לוגיות |
| משימה חייבת להיות מוקצית למשתמש | מונע שיוך למשימות לא רלוונטיות |
| תיאור 10-500 תווים | אכיפת תיאור איכותי אך לא ארוך מדי |
| לא ניתן ליצור/לערוך בחודש נעול | מניעת עריכות רטרואקטיביות |

#### סיכום יום עבודה (Workday Summary)
| חוק | הסבר |
|-----|------|
| **שליחה דורשת בדיוק 540 דקות** | עבודה + היעדרות = 9 שעות |
| לא ניתן לשלוח יום בחודש נעול | מניעת שליחות מאוחרות |

#### היעדרויות (Absences)
| חוק | הסבר |
|-----|------|
| לא ניתן ליצור חפיפה בין בקשות | מניעת ספירה כפולה של אותו יום |
| מחלה/מילואים דורשים מסמך | עקרון הוכחה |
| תאריך סיום >= תאריך התחלה | לוגיקה בסיסית |
| לא ניתן ליצור היעדרות בחודש נעול | מניעת עריכות רטרואקטיביות |

#### ישויות (Entities)
| חוק | הסבר |
|-----|------|
| תאריכי משימה בטווח תאריכי פרויקט | תאימות היררכית |
| לא ניתן למחוק לקוח עם פרויקטים פעילים | שמירה על שלמות נתונים |
| לא ניתן למחוק פרויקט עם משימות פתוחות | שמירה על שלמות נתונים |

---

### ✅ אזהרות ועזרים (Non-Blocking)

#### רשומות זמן
- אזהרה אם סה"כ דקות ביום חורג מ-540 בהרבה (חריג)
- הצעת משימות שימושיות לפי תדירות

#### היעדרויות
- התראה אם לא צורף מסמך למחלה/מילואים
- סטטוס "ממתין למסמך" עד להעלאה

#### Selectors
- הדגשת משימות נפוצות למעלה
- בחירה אוטומטית של פריט יחיד

---

### 🔐 אבטחה ובקרת גישה

#### הרשאות משתמשים
| פעולה | עובד (EMPLOYEE) | מנהל (ADMIN) |
|-------|----------------|--------------|
| צפייה ברשומות זמן שלי | ✅ | ✅ |
| צפייה ברשומות זמן של אחרים | ❌ | ✅ |
| יצירת רשומות זמן | ✅ (רק שלי) | ✅ (כולל אחרים) |
| עריכת רשומות זמן | ✅ (רק שלי, חודש פתוח) | ✅ (כולל אחרים) |
| מחיקת רשומות זמן | ✅ (רק שלי, חודש פתוח) | ✅ (כולל אחרים) |
| ניהול משתמשים | ❌ | ✅ |
| ניהול לקוחות/פרויקטים/משימות | ❌ | ✅ |
| הקצאת משימות | ❌ | ✅ |
| ניעול חודשים | ❌ | ✅ |
| צפייה בדיווחים מתקדמים | ❌ (רק שלי) | ✅ (כולם) |
| צפייה בלוג ביקורת | ❌ | ✅ |

---

## 9. תשתיות ואינטגרציות

### סביבות פיתוח

#### Development (Local)
```bash
# Docker Compose
docker-compose -f infra/compose.yml up

# סביבת PostgreSQL מקומית
# 4 שירותים:
- postgres:5432
- server:3000
- employee:5174
- admin:5173
```

#### Production (Render)
- Deployment אוטומטי מ-GitHub (branch: main)
- PostgreSQL Managed Database
- Build + Deploy של 3 שירותים:
  - Backend (Express)
  - Employee Frontend (React)
  - Admin Frontend (React)

---

### אחסון קבצים (File Storage)

#### IDrive e2 (S3-Compatible)
```env
IDRIVE_ACCESS_KEY=your-access-key
IDRIVE_SECRET_KEY=your-secret-key
IDRIVE_BUCKET=your-bucket-name
IDRIVE_ENDPOINT=https://endpoint.idrivee2.com
```

**תכונות:**
- אחסון מסמכי היעדרות (PDF, JPG, PNG)
- גודל מקסימלי: 10MB
- Presigned URLs להורדה מאובטחת
- גיבוי אוטומטי

#### Fallback: Local Storage
- במקרה שלא מוגדר IDrive
- אחסון בתיקייה: `/server/uploads/`
- לא מומלץ לפרודקשן

---

### CI/CD Pipeline

#### GitHub Actions - CI (Continuous Integration)
**Trigger:** כל Push או Pull Request

**שלבים:**
1. Checkout קוד
2. Setup Node.js (matrix: 16, 18, 20)
3. התקנת dependencies (pnpm install)
4. הרצת Linter (ESLint)
5. הרצת Tests (Vitest)
6. חישוב Coverage
7. העלאת Coverage ל-Codecov

**תוצאה:**
- ✅ הצלחה → PR ניתן למיזוג
- ❌ כשלון → חסימת מיזוג

#### GitHub Actions - CD (Continuous Deployment)
**Trigger:** מיזוג ל-main branch

**שלבים:**
1. Build Docker Images
2. Push ל-Container Registry
3. Deploy ל-Render:
   - Backend Service
   - Employee Frontend
   - Admin Frontend
4. הרצת Migrations (Prisma Migrate)
5. Health Checks
6. Rollback במקרה כשל

**תוצאה:**
- Deployment אוטומטי תוך 3-5 דקות
- Zero-downtime deployment

---

### מעקב ולוגינג

#### Winston Logger
```typescript
logger.info('User logged in', { userId, email });
logger.error('Database connection failed', { error });
logger.warn('High memory usage', { memory: '85%' });
```

**רמות לוגינג:**
- **error:** שגיאות קריטיות
- **warn:** אזהרות
- **info:** מידע כללי
- **debug:** פרטי debug (רק development)

**פורמט:**
```json
{
  "timestamp": "2026-01-21T10:30:00.000Z",
  "level": "info",
  "message": "User logged in",
  "userId": "uuid-here",
  "email": "user@example.com"
}
```

---

### Monitoring & Health Checks

#### Health Check Endpoint
```
GET /health
→ { "status": "ok", "database": "connected" }
```

#### Metrics (אופציונלי - לא מומש כרגע)
- Request duration
- Error rate
- Active users
- Database connection pool status

---

## 10. קריטריוני איכות ובדיקות

### Coverage יעד
| רכיב | Target |
|------|--------|
| Backend Services | 70%+ |
| Backend Controllers | 60%+ |
| Frontend Components | 50%+ |
| Critical Paths | 90%+ |

### סוגי בדיקות

#### Unit Tests (Vitest)
- פונקציות עזר
- לוגיקה עסקית
- ולידטורים

#### Integration Tests
- API Endpoints (end-to-end)
- Database interactions
- Authentication flows

#### Component Tests (React)
- UI Components עם React Testing Library
- User interactions
- State management

---

## 11. נקודות חוזק של הפרויקט

### ✅ ארכיטקטורה מתקדמת
- **Monorepo** עם pnpm workspaces - שיתוף קוד יעיל
- **Layered Architecture** - separation of concerns
- **TypeScript Strict Mode** - type safety מלא
- **Prisma ORM** - type-safe database access

### ✅ אבטחה מובנית
- JWT with refresh tokens
- bcrypt password hashing
- Rate limiting
- HTTP-only cookies
- CORS protection
- Helmet security headers

### ✅ UX מתקדם
- Mobile-first design
- RTL support (Hebrew)
- Real-time timer display
- Auto-cascading selectors
- Smart validation messages
- Visual progress indicators

### ✅ ניהול מתקדם
- Audit logging לכל פעולה
- Month locking למניעת עריכות
- Bulk assignments
- CSV export
- Comprehensive reports

### ✅ Scalability
- Docker containerization
- Horizontal scaling ready
- Database indexing
- API pagination
- Server-side timer (stateless)

### ✅ Developer Experience
- Comprehensive documentation
- Consistent code style
- Automated testing
- CI/CD pipelines
- Clear error messages

---

## 12. אתגרים שנפתרו

### 🎯 איך מנענו עריכות רטרואקטיביות?
**פתרון:** מערכת ניעול חודשים
- מנהל נועל חודש
- כל הרשומות בחודש נעשות read-only
- **יוצא מן הכלל:** העלאת מסמכי היעדרות (כדי לאפשר השלמת תיעוד)

### 🎯 איך טיפלנו בטיימר שעובד גם כשהדפדפן סגור?
**פתרון:** Server-side timer
- הטיימר רץ בצד השרת (לא בצד הלקוח)
- מאוחסן במסד נתונים עם `started_at`
- חישוב elapsed time בצד השרת
- הלקוח רק מציג את הזמן (polling כל X שניות)

### 🎯 איך הבטחנו שעובד ידווח בדיוק 9 שעות?
**פתרון:** Workday Summary Validation
- חישוב אוטומטי: `work_minutes + absence_minutes`
- שליחה חסומה אם לא בדיוק 540
- אינדיקטורים ויזואליים ברורים (חסר/יתר)
- צבע אדום/ירוק לפי סטטוס

### 🎯 איך התמודדנו עם שבוע עבודה ישראלי (א'-ה')?
**פתרון:** Absence Days Expansion
- אלגוריתם שמסנן ימי סוף שבוע (ו'-ש')
- יצירת `absence_day` רק לימים א'-ה'
- תמיכה בחצי יום (270 דקות)
- Hebrew locale date picker

### 🎯 איך הפכנו את בחירת המשימות לקלה?
**פתרון:** Smart Selectors
- Auto-cascading: Client → Project → Task
- Single-item auto-selection
- Frequency-based sorting
- Only user-assigned tasks shown

### 🎯 איך שמרנו שקיפות ומעקב?
**פתרון:** Comprehensive Audit Logging
- כל פעולת מנהל נרשמת
- Before/After values (JSONB)
- Filterable audit log UI
- Non-editable history

---

## 13. מסלולי שיפור עתידיים (Future Enhancements)

### 🚀 Phase 2 (אפשרי)
- 📧 **Email Notifications:**
  - התראות על ניעול חודש
  - תזכורות לשליחת ימים חסרים
  - אישורי היעדרויות

- 📱 **Push Notifications:**
  - תזכורת לעצור טיימר בסוף היום
  - התראה כשחודש נעול

- 📊 **Advanced Analytics:**
  - Dashboard עם גרפים (Chart.js / Recharts)
  - Heatmap של שעות עבודה
  - ניתוח מגמות לאורך זמן

- 🎨 **Theming:**
  - Light/Dark mode
  - Custom color schemes

- 🌐 **Internationalization (i18n):**
  - תמיכה באנגלית
  - ממשק רב-לשוני

- 📄 **Advanced Reporting:**
  - ייצוא PDF עם לוגו ארגוני
  - דוחות מרובי משתמשים
  - השוואות בין תקופות

### 🚀 Phase 3 (מתקדם)
- 🔗 **Integrations:**
  - Google Calendar sync
  - Slack notifications
  - Jira task import

- 🤖 **Automation:**
  - Auto-fill משימות לפי דפוסים
  - ML-based task suggestions

- 📱 **Mobile Apps:**
  - React Native mobile app
  - Offline support

- 🔐 **SSO (Single Sign-On):**
  - OAuth2 (Google, Microsoft)
  - SAML support

---

## שאלות נפוצות (FAQ)

### כללי

**ש: מהו Time Tracker?**
ת: מערכת לניהול דיווח שעות עבודה יומיומיות, ניהול היעדרויות ודיווחים מתקדמים לעובדים ומנהלים.

**ש: מי יכול להשתמש במערכת?**
ת: 2 סוגי משתמשים:
- **עובדים** - דיווח שעות והיעדרויות
- **מנהלים** - ניהול משתמשים, ישויות ודיווחים

**ש: האם המערכת תומכת בעברית?**
ת: כן, מלאה! תמיכה ב-RTL, לוח שנה עברי, ושבוע עבודה ישראלי (א'-ה').

---

### אימות והרשאות

**ש: איך אני מתחבר למערכת?**
ת: באמצעות אימייל וסיסמה. בכניסה ראשונה תידרש להחליף סיסמה.

**ש: מה קורה אם שכחתי סיסמה?**
ת: פנה למנהל שלך - הוא יכול לאפס את הסיסמה ולשלוח לך סיסמה חדשה.

**ש: כמה זמן הטוקן תקף?**
ת: Access Token - 2 שעות, Refresh Token - 30 יום. המערכת מרעננת אוטומטית.

**ש: האם המערכת מאובטחת?**
ת: כן מאוד:
- הצפנת סיסמאות עם bcrypt
- JWT tokens ב-HTTP-only cookies
- Rate limiting
- HTTPS בפרודקשן
- Helmet security headers

---

### דיווח שעות

**ש: איך אני מדווח שעות עבודה?**
ת: 2 דרכים:
1. **טיימר:** לחיצה על "התחל טיימר" → עבודה → "עצור"
2. **ידני:** מילוי טופס עם תאריך, שעות, משימה ותיאור

**ש: האם הטיימר ממשיך לרוץ כשאני סוגר את הדפדפן?**
ת: **כן!** הטיימר רץ בצד השרת, לא בדפדפן. אפילו אם תכבה את המחשב, הטיימר ימשיך.

**ש: כמה שעות אני חייב לדווח ביום?**
ת: **9 שעות (540 דקות)** - שילוב של עבודה + היעדרות.

**ש: מה קורה אם עבדתי פחות או יותר מ-9 שעות?**
ת:
- **פחות:** המערכת תציג "חסר X דקות" ותחסום שליחה
- **בדיוק 9:** המערכת תציג "מלא" ותאפשר שליחה
- **יותר:** המערכת תציג "יתר X דקות" (חריג) ותחסום שליחה

**ש: איך אני בוחר משימה לעבודה?**
ת: המערכת מציגה **רק משימות שהוקצו לך** במערכת Selectors:
1. בחר לקוח
2. המערכת תציג פרויקטים רלוונטיים
3. המערכת תציג משימות רלוונטיות
- **אם יש רק אחד בכל שלב → בחירה אוטומטית!**

**ש: מה הוא תיאור ולמה זה חובה?**
ת: תיאור הוא הסבר קצר של מה עשית (10-500 תווים). לדוגמה:
- "פיתוח עמוד ניהול משתמשים"
- "ישיבת תכנון עם הצוות"
- "תיקון באגים בממשק מנהל"

**ש: האם אני יכול לערוך רשומה לאחר שיצרתי אותה?**
ת: **כן**, אבל רק אם החודש עדיין לא נעול. אם החודש נעול - אי אפשר.

**ש: האם אני יכול למחוק רשומה?**
ת: **כן**, מחיקה "רכה" - הרשומה לא נמחקת לגמרי (למעקב), אבל לא תופיע במסך שלך.

---

### טיימר

**ש: איך מפעילים את הטיימר?**
ת:
1. לחץ על "התחל טיימר"
2. בחר משימה
3. (אופציונלי) הוסף תיאור
4. לחץ "התחל"

**ש: איפה רואים את הטיימר?**
ת: **בבאנר קבוע למעלה** בכל דף באפליקציה. הוא תמיד נראה.

**ש: איך עוצרים את הטיימר?**
ת:
1. לחץ על "עצור" בבאנר הטיימר
2. טופס עריכה יפתח
3. ערוך מיקום/תיאור אם צריך
4. לחץ "שמור"
5. רשומת הזמן תיווצר אוטומטית

**ש: מה קורה אם שכחתי לעצור טיימר?**
ת: הטיימר ימשיך לרוץ עד שתעצור אותו. תוכל לעצור למחרת ולערוך את הרשומה.

**ש: האם יכול להיות יותר מטיימר אחד פעיל?**
ת: **לא**. רק טיימר אחד ליום ליוזר.

---

### היעדרויות

**ש: איך מגישים בקשת היעדרות?**
ת:
1. לחץ על "היעדרויות" בתפריט
2. לחץ "בקשה חדשה"
3. בחר סוג (חופשה/מחלה/מילואים/אחר)
4. בחר תאריך התחלה וסיום
5. אם חצי יום - סמן
6. הוסף הערה (אופציונלי)
7. העלה מסמך (חובה למחלה/מילואים)
8. שלח

**ש: אילו סוגי היעדרויות יש?**
ת:
- 🏖️ **חופשה (VACATION)** - לא דורש מסמך
- 🤒 **מחלה (SICK)** - דורש מסמך
- 🪖 **מילואים (RESERVES)** - דורש מסמך
- ❓ **אחר (OTHER)** - לא דורש מסמך

**ש: מה זה "חצי יום"?**
ת: במקום 540 דקות (9 שעות), היעדרות של 270 דקות (4.5 שעות).

**ש: איך המערכת מחשבת ימי היעדרות?**
ת: המערכת:
1. לוקחת את טווח התאריכים שלך
2. מסננת **רק ימי עבודה** (א'-ה', לא ו'-ש')
3. יוצרת רשומה לכל יום עבודה
4. כל יום מקבל 270 או 540 דקות

**דוגמה:**
```
בקשה: 20/1 - 26/1 (שבוע מלא)
ימים שייספרו: 20/1, 21/1, 22/1, 23/1, 26/1 (5 ימים)
ימים שלא ייספרו: 24/1 (ו'), 25/1 (ש')
```

**ש: מה קורה אם לא העלתי מסמך למחלה/מילואים?**
ת: הסטטוס יהיה **"ממתין למסמך" (PENDING_DOCUMENT)** עד שתעלה.

**ש: איך מעלים מסמך?**
ת:
1. כנס לפרטי ההיעדרות
2. לחץ "העלה מסמך"
3. בחר קובץ (PDF, JPG, PNG, עד 10MB)
4. שמור
5. הסטטוס ישתנה ל-**"הוגש" (SUBMITTED)**

**ש: האם אפשר להוסיף מספר מסמכים לאותה בקשה?**
ת: **כן!** אפשר להעלות כמה מסמכים שרוצים.

**ש: האם אפשר לערוך/למחוק בקשת היעדרות?**
ת: **כן**, אבל רק אם החודש לא נעול.

**ש: האם אפשר להעלות מסמך גם בחודש נעול?**
ת: **כן!** זה **יוצא מן הכלל** - כדי לאפשר השלמת תיעוד רפואי.

---

### חודשים נעולים

**ש: מה זה "חודש נעול"?**
ת: חודש שהמנהל סגר רשמית, ולא ניתן יותר לערוך בו רשומות.

**ש: למה נועלים חודשים?**
ת: כדי למנוע עריכות רטרואקטיביות לאחר שהחודש אושר.

**ש: מה אני יכול/לא יכול לעשות בחודש נעול?**
ת:
- ❌ **לא ניתן:** ליצור/לערוך/למחוק רשומות זמן
- ❌ **לא ניתן:** ליצור/לערוך/למחוק היעדרויות
- ✅ **ניתן:** להעלות מסמכים להיעדרויות קיימות
- ✅ **ניתן:** לצפות בכל הנתונים

**ש: איך אדע אם חודש נעול?**
ת: המערכת תציג הודעה ברורה כש תנסה לערוך, וסמל "נעול" יופיע בלוח השנה.

**ש: האם המנהל יכול לשחרר נעילה?**
ת: **כן**, המנהל יכול לשחרר נעילה ולאפשר עריכה מחדש.

---

### פאנל ניהול (למנהלים)

**ש: איך יוצרים משתמש חדש?**
ת:
1. כנס ל"ניהול משתמשים"
2. לחץ "משתמש חדש"
3. מלא: שם, אימייל, תפקיד (עובד/מנהל)
4. המערכת יוצרת סיסמה אוטומטית
5. המשתמש יקבל הודעה ויצטרך להחליף סיסמה בכניסה ראשונה

**ש: איך מאפסים סיסמה למשתמש?**
ת:
1. כנס לפרטי המשתמש
2. לחץ "אפס סיסמה"
3. המערכת תיצור סיסמה חדשה
4. העתק והעבר למשתמש
5. המשתמש יצטרך להחליף בכניסה הבאה

**ש: איך יוצרים לקוח/פרויקט/משימה?**
ת:
1. כנס לעמוד הרלוונטי (לקוחות/פרויקטים/משימות)
2. לחץ "חדש"
3. מלא פרטים
4. שמור

**ש: מה זה הקצאת משימות?**
ת: שיוך משתמשים למשימות ספציפיות. רק משתמשים שמשימה הוקצתה להם יכולים לדווח עליה.

**ש: איך עושים הקצאה מרובה (Bulk)?**
ת:
1. כנס ל"הקצאות משימות"
2. לחץ "הקצאה מרובה"
3. בחר מספר משתמשים (למשל: 3)
4. בחר מספר משימות (למשל: 5)
5. לחץ "שמור"
6. המערכת יוצרת **15 הקצאות (3×5)**

**ש: איך נועלים חודש?**
ת:
1. כנס ל"ניעולי חודשים"
2. לחץ "נעל חודש"
3. בחר חודש (MM/YYYY)
4. אשר
5. כל העובדים מיידית לא יכולים לערוך את החודש

**ש: איך מייצאים דוח ל-CSV?**
ת:
1. כנס ל"דוחות"
2. בחר משתמש + חודש
3. צפה בדוח
4. לחץ "ייצוא ל-CSV"
5. קובץ יורד אוטומטית

**ש: מה זה לוג ביקורת (Audit Log)?**
ת: רישום מלא של כל פעולות המנהלים:
- מי ביצע
- מה בוצע
- מתי
- ערכים לפני/אחרי

מאפשר שקיפות מלאה ומעקב.

---

### טכני

**ש: באילו טכנולוגיות בנויה המערכת?**
ת:
- **Backend:** Node.js + Express + TypeScript + PostgreSQL + Prisma
- **Frontend:** React + TypeScript + Vite + Zustand + TanStack Query
- **DevOps:** Docker + GitHub Actions + Render

**ש: האם המערכת תומכת במובייל?**
ת: **כן מלא!** המערכת בנויה Mobile-First ומתאימה לכל מכשיר.

**ש: היכן מאוחסנים הקבצים (מסמכי היעדרות)?**
ת: באחסון ענן (IDrive e2 / AWS S3) - מאובטח ומגובה.

**ש: האם המערכת מגובה?**
ת:
- מסד נתונים: Backup יומי אוטומטי (Render Managed DB)
- קבצים: Redundancy באחסון הענן
- קוד: Git repository עם היסטוריה מלאה

**ש: איך מתבצעים עדכונים למערכת?**
ת: Deployment אוטומטי:
1. מפתח דוחף קוד ל-GitHub
2. GitHub Actions רצים (Tests + Linting)
3. אם הכל עבר → Deployment אוטומטי ל-Render
4. Zero-downtime deployment

---

### בעיות נפוצות

**ש: הטיימר לא מופיע / לא עובד**
ת: בדוק:
1. האם רענת דף? (F5)
2. האם אתה מחובר למערכת?
3. האם הטיימר הופעל היום?
4. נסה logout + login

**ש: לא יכול לשלוח יום - חסרים דקות**
ת: בדוק:
1. סה"כ דקות עבודה + היעדרות חייבות להיות **בדיוק 540**
2. הוסף רשומות זמן או בקשת היעדרות
3. ודא שכל הרשומות נשמרו

**ש: לא רואה משימה מסוימת ב-Selectors**
ת: סיבות אפשריות:
1. המשימה לא הוקצתה לך - פנה למנהל
2. המשימה סגורה (CLOSED)
3. הפרויקט לא פעיל (INACTIVE)

**ש: קיבלתי שגיאה "לא ניתן לערוך חודש נעול"**
ת: החודש נעול על ידי מנהל. פנה למנהל אם יש צורך בעריכה.

**ש: לא מצליח להעלות מסמך - קובץ גדול מדי**
ת: גודל מקסימלי: **10MB**. נסה:
1. לדחוס את הקובץ
2. להמיר ל-PDF
3. לפצל למספר קבצים

**ש: קיבלתי שגיאה "תיאור קצר מדי"**
ת: תיאור חייב להכיל **לפחות 10 תווים**. כתוב תיאור ברור יותר.

---

### תמיכה

**ש: איך מקבלים עזרה?**
ת:
1. בדוק את ה-FAQ (מסמך זה)
2. פנה למנהל שלך
3. פנה לתמיכה טכנית: support@example.com

**ש: איפה מוצאים תיעוד נוסף?**
ת: בתיקייה `/project-features/` במערכת:
- `projectsummery.md` - סקירה כללית
- `endpoints.md` - תיעוד API
- `stack.md` - טכנולוגיות

**ש: איך מדווחים על באג?**
ת:
1. רשום מה עשית לפני השגיאה
2. צלם צילום מסך
3. העתק הודעת שגיאה (אם יש)
4. פנה לתמיכה

---

## סיכום

מערכת ניהול שעות עבודה מתקדמת, מאובטחת וידידותית למשתמש, בנויה בטכנולוגיות מודרניות עם דגש על UX, אבטחה וניהול מתקדם. המערכת מספקת פתרון מקיף לארגונים המעוניינים בניהול שעות עבודה יעיל ושקוף.

---

**גרסה:** 1.0
**תאריך עדכון אחרון:** 21/01/2026
**מפתח:** Team 2
**Branch:** development → main

---

*מסמך זה נוצר עבור הצגת הפרויקט ומכיל את כל המידע הדרוש להבנת המערכת, השימוש בה והארכיטקטורה שלה.*