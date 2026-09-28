# 🎓 QGenix — AI-Powered Smart Academic & Examination Management System
> **Final Year Project Architecture, System Analysis & Standard Admin Panel Blueprint**

---

## 📌 ১. প্রজেক্ট পরিচিতি ও আর্কিটেকচার ওভারভিউ (Project Overview)

**QGenix** হলো একটি আধুনিক, ফুল-স্ট্যাক স্মার্ট একাডেমিক ও এক্সামিনেশন প্ল্যাটফর্ম। এই সিস্টেমের মূল লক্ষ্য হলো সাধারণ লার্নিং ম্যানেজমেন্ট সিস্টেমের (LMS) গণ্ডি পেরিয়ে **কৃত্রিম বুদ্ধিমত্তা (AI)** ব্যবহারের মাধ্যমে প্রশ্ন তৈরি (AI Question Generator), পরীক্ষা গ্রহণ, অটোমেটেড রেজাল্ট প্রসেসিং এবং পারফরম্যান্স অ্যানালিটিক্স সহজতর করা।

### 🛠️ টেকনোলজি স্ট্যাক (Target Technology Stack):
* **Frontend:** React 19 (Vite), React Router v7, Framer Motion, Lucide Icons, Recharts, Custom Glassmorphic Dark/Light CSS.
* **Backend:** Python + Django & Django REST Framework (DRF).
* **Database:** PostgreSQL / SQLite (Development).
* **Authentication:** JWT (JSON Web Tokens) with Role-Based Access Control (RBAC).
* **AI Engine:** Google Gemini API / OpenAI API (Question Generation, Document Parsing, AI Student Assistant).

---

## 🔍 ২. বর্তমান ফ্রন্টএন্ড কোডবেস অ্যানালিসিস (Current Codebase Analysis)

বর্তমানে প্রজেক্টটির ফ্রন্টএন্ডে ৩টি প্রধান রোল (Role) ডিফাইন করা হয়েছে:

1. **Student Portal (১৩টি সমৃদ্ধ মডিউল):**
   * Dashboard, Attendance, My Courses, Results, Assignments, Routine, Exams/Exam Center, Notices, Resources, AI Assistant, Profile, Study Room, Analytics.
2. **Teacher Portal (১৪টি সমৃদ্ধ মডিউল):**
   * Dashboard, Resource Manager, Attendance, AI Question Generator, Evaluation Center, Analytics, Courses, Students, Exams, Assignments, Results, Routine, Notices, Profile.
3. **Admin Portal (বর্তমানে আংশিক - ৩টি মৌলিক ফাইল):**
   * `Dashboard.jsx`: স্ট্যাটিক স্ট্যাটস এবং সিস্টেম অ্যালার্ট।
   * `UserManagement.jsx`: সাধারণ ৩ জন ইউজারের তালিকা এবং ডামি বাটন।
   * `Settings.jsx`: একাডেমি ইয়ার এবং এআই সেটিংস এর কিছু ফিল্ড।

### ⚠️ প্রধান পর্যবেক্ষণ ও সমস্যা (The Current Gap):
> **টিচার এবং স্টুডেন্ট পোর্টালে চমৎকার ফিচার থাকলেও অ্যাডমিন প্যানেল এখনও অপূর্ণাঙ্গ।**
> একটি বাস্তবসম্মত ইউনিভার্সিটি বা কলেজ ম্যানেজমেন্ট সিস্টেমে অ্যাডমিন প্যানেলই হলো পুরো সিস্টেমের **সেন্ট্রাল ব্যাকবোন (Central Backbone)**। ডিপার্টমেন্ট তৈরি, ব্যাচ/সেমিস্টার কনফিগারেশন, টিচারদের কোর্স অ্যাসাইন করা, সেন্ট্রাল রুটিন তৈরি, পরীক্ষার সেশন তৈরি এবং রেজাল্ট ফাইনাল পাবলিশ করার দায়িত্ব অ্যাডমিনের। অ্যাডমিন প্যানেল সমৃদ্ধ না হলে টিচার বা স্টুডেন্ট ডেটা সিস্টেমে সঠিকভাবে কাজ করতে পারবে না।

---

## 👑 ৩. একটি স্ট্যান্ডার্ড ও কমপ্লিট অ্যাডমিন প্যানেলের আবশ্যকীয় সেকশনসমূহ (Admin Panel Modules)

একটি ফাইনাল ইয়ার প্রজেক্ট হিসেবে এক্সটার্নাল ডিফেন্স এবং রিয়েল-ওয়ার্ল্ড ব্যবহারের জন্য অ্যাডমিন প্যানেলে নিচের ৮টি কোর মডিউল/সেকশন থাকা আবশ্যক:

```
                          ┌───────────────────────────┐
                          │   QGENIX ADMIN CONSOLE    │
                          └─────────────┬─────────────┘
                                        │
    ┌──────────────┬──────────────┬─────┴────────┬──────────────┬──────────────┐
    ▼              ▼              ▼              ▼              ▼              ▼
1. Executive   2. Academic    3. User        4. Exam &      5. Routine &   6. AI & System
   Dashboard      Hierarchy      Directory      Results        Schedule       Settings
```

---

### মডিউল ১: এক্সেকিউটিভ ড্যাশবোর্ড ও সিস্টেম ওভারভিউ (Executive Dashboard)
* **রিয়েল-টাইম মেট্রিক কার্ডস:** মোট শিক্ষার্থী, মোট শিক্ষক, সক্রিয় কোর্স সংখ্যা, আজ চলমান পরীক্ষা, এআই কোয়েরি/টোকেন ব্যবহার।
* **ভিজুয়াল গ্রাফ ও চার্ট:**
  * এনরোলমেন্ট ট্রেন্ড (মাসিক শিক্ষার্থী বৃদ্ধি)।
  * বিভাগভিত্তিক শিক্ষার্থী অনুপাত (Pie/Bar Chart)।
  * সিস্টেম সার্ভার রিসোর্স ও মেমোরি হেলথ ট্র্যাকিং।
* **কুইক অ্যাকশন বাটন:** এক ক্লিকে "নতুন ইউজার যোগ", "নোটিশ জারি", "জরুরি ব্রডকাস্ট", "ডাটাবেস ব্যাকআপ"।
* **রিসেন্ট অ্যাক্টিভিটি ফিড:** সাম্প্রতিক লগইন, পরীক্ষার ফলাফল এন্ট্রি, নতুন রেজিস্ট্রেশন।

---

### মডিউল ২: একাডেমি স্ট্রাকচার ও কারিকুলাম ম্যানেজমেন্ট (Academic Architecture)
* **ডিপার্টমেন্ট ম্যানেজমেন্ট (Departments/Faculties):**
  * CSE, EEE, BBA ইত্যাদি ডিপার্টমেন্ট তৈরি ও হেড অব ডিপার্টমেন্ট (HoD) নির্ধারণ।
* **প্রোগ্রাম, ব্যাচ ও সেমিস্টার (Batches & Semesters):**
  * উদাহরণ: B.Sc in CSE -> Batch 2022-26 -> Semester 6th -> Section A/B।
* **কোর্স/বিষয় ব্যবস্থাপনা (Course & Syllabus Catalog):**
  * কোর্স কোড (e.g., `CSE-301`), কোর্সের নাম, ক্রেডিট আওয়ার, সিলেবাস ফাইল আপলোড।
* **কোর্স এলোকেশন (Course Assignment):**
  * কোন টিচার কোন সেমিস্টারে কোন কোর্সের ক্লাস নিবেন এবং কোন সেকশনে পড়াবেন তা অ্যাসাইন করা।

---

### মডিউল ৩: কমপ্রিহেনসিভ ইউজার ম্যানেজমেন্ট ও আরব্যাক (User Management & RBAC)
* **স্টুডেন্ট ডিরেক্টরি (Student Directory):**
  * স্টুডেন্ট আইডি/রোল, নাম, ডিপার্টমেন্ট, ব্যাচ, রক্তের গ্রুপ, ফোন নম্বর, স্ট্যাটাস (Active / Suspended / Graduated)।
  * **বাল্ক ইমপোর্ট (Bulk CSV/Excel Upload):** এক ক্লিকে পুরো ব্যাচের ২০০ জন ছাত্রের তালিকা আপলোড করে স্বয়ংক্রিয় একাউন্ট তৈরি।
* **টিচার/ফ্যাকাল্টি ডিরেক্টরি (Faculty Management):**
  * পদবী (Professor, Lecturer), ডিপার্টমেন্ট, শিক্ষাগত যোগ্যতা, বর্তমান কোর্স ওয়ার্কলোড।
* **অ্যাডমিন ও রোল পারমিশন (Role-Based Access Control - RBAC):**
  * সুপার অ্যাডমিন (Full Access), এক্সাম কন্ট্রোলার (রেজাল্ট ও এক্সাম পারমিশন), স্টাফ/অ্যাকাডেমিক অফিসার।
* **পাসওয়ার্ড রিসেট ও ব্যান/আনব্যান অ্যাকশন:** অ্যাডমিন সরাসরি যেকোনো ইউজারের ক্রেডেনশিয়াল রিসেট বা স্ট্যাটাস ইনঅ্যাক্টিভ করতে পারবে।

---

### মডিউল ৪: সেন্ট্রাল এক্সামিনেশন ও রেজাল্ট কন্ট্রোল (Exams & Results Center)
* **টার্ম/সেমিস্টার এক্সাম শিডিউলার:**
  * মিড-টার্ম, ফাইনাল, কুইজ সেশন তৈরি এবং পরীক্ষার সময়সীমা লক করা।
* **কোয়েশ্চন ব্যাংক ও এআই জেনারেশন অডিট:**
  * টিচারদের তৈরি করা এআই প্রশ্নগুলো পর্যালোচনা ও অনুমোদন (Approve/Reject) করার অপশন।
* **গ্রেডিং স্কেল ও পলিসি কনফিগারেশন:**
  * জিপিএ স্কেল (GPA 4.0), লেটার গ্রেড (A+, A, B...) এবং পাস মার্কস নির্ধারণ।
* **রেজাল্ট অ্যাপ্রুভাল ও পাবলিকেশন পাইপলাইন (Approval Workflow):**
  * ধাপ ১: টিচার মার্কস সাবমিট করবেন।
  * ধাপ ২: অ্যাডমিন/এক্সাম কন্ট্রোলার ট্যাবুলেশন শিট ভেরিফাই করবেন।
  * ধাপ ৩: "Publish Results" বাটনে ক্লিক করলে স্টুডেন্ট পোর্টালে তাদের রেজাল্ট লাইভ হবে।
* **মার্কশিট ও ট্রান্সক্রিপ্ট এক্সপোর্ট:** এক ক্লিকে সেমিস্টার ট্যাবুলেশন শিট PDF আকারে ডাউনলোড।

---

### মডিউল ৫: সেন্ট্রাল একাডেমিক রুটিন ও অ্যাটেনডেন্স মনিটর (Routine & Attendance Hub)
* **মাস্টার ক্লাস রুটিন বিল্ডার (Master Schedule Generator):**
  * বার (Day), সময় (Time Slot), রুম নাম্বার (Room Allocation), শিক্ষক ও বিষয়ের ম্যাপিং।
  * ক্লাস ক্ল্যাশ ডিটেকশন (একই রুমে বা একই শিক্ষকের একই সময়ে দুটি ক্লাস রোধ করা)।
* **অ্যাটেনডেন্স নজরদারি (Attendance Compliance):**
  * ডিপার্টমেন্ট বা ব্যাচভিত্তিক সামগ্রিক উপস্থিতির হার দেখা।
  * ৭৫% এর কম উপস্থিত থাকা শিক্ষার্থীদের "Defaulter List" তৈরি করা।

---

### মডিউল ৬: নোটিশ বোর্ড ও কমিউনিকেশন হাব (Notice & Announcements)
* **সেন্ট্রাল নোটিশ প্রকাশনা:**
  * টার্গেটেড অডিয়েন্স নির্বাচন: (১) সবার জন্য (২) শুধু শিক্ষক (৩) শুধু নির্দিষ্ট ব্যাচের শিক্ষার্থী।
  * নোটিশ ক্যাটাগরি: একাডেমিক, পরীক্ষা, ছুটির নোটিশ, জরুরি সতর্কতা।
  * PDF সার্কুলার এটাচমেন্ট সাপোর্ট।

---

### মডিউল ৭: এআই ইঞ্জিন কনফিগারেশন (AI Infrastructure & Model Settings)
> *এটি QGenix প্রজেক্টের প্রধান ইউএসপি (Unique Selling Proposition)।*
* **এআই প্রোভাইডার সেটিংস:**
  * Gemini API / OpenAI API কী কনফিগারেশন।
  * মডেল চয়েস: Gemini 1.5 Flash / Pro, GPT-4o, অথবা লোকাল মডেল।
* **টোকেন ও ব্যবহার লিমিট (Rate Limiting & Quotas):**
  * প্রতি টিচার প্রতিদিন কয়টি প্রশ্নপত্র জেনারেট করতে পারবেন তার কোটা সেট করা।
* **AI গার্ডরেল ও প্রম্পট প্রি-সেট:**
  * ডিফল্ট ডিফিকাল্টি লেভেল (Easy, Medium, Hard) এবং প্ল্যাজিয়ারিজম থ্রেশহোল্ড সেট করা।

---

### মডিউল ৮: সিস্টেম হেলথ, সিকিউরিটি ও ডাটাবেস ব্যাকআপ (System Administration)
* **অডিট ট্রেইল (Audit Logs):**
  * কে কখন লগইন করেছে, কে কোন রেজাল্ট মডিফাই করেছে তার টাইমস্ট্যাম্প লগ।
* **ডাটাবেস ব্যাকআপ ও রিস্টোর:**
  * ওয়ান-ক্লিক ডাটাবেস ব্যাকআপ (JSON/SQL ডাম্প ডাউনলোড)।
* **মেইনটেনেন্স মোড:**
  * সাইট আপডেটের সময় সাধারণ ইউজারদের জন্য সিস্টেম টেম্পোরারি অফ রাখা।

---

## 🗄️ ৪. জ্যাঙ্গো ব্যাকএন্ড ডাটাবেস স্কিমা ও এপিআই আর্কিটেকচার (Django Backend Blueprint)

জ্যাঙ্গোতে কাজ করার সময় প্রজেক্টটিকে নিচের মতো মডুলার অ্যাপসে (Apps) ভাগ করতে হবে:

```
backend/
├── manage.py
├── qgenix_core/                # Settings, ASGI, WSGI, Root URLs
│   ├── settings.py
│   └── urls.py
└── apps/
    ├── accounts/               # Custom User, Authentication, Profiles, JWT
    ├── academics/              # Departments, Batches, Courses, Enrollments
    ├── examinations/           # Exams, Questions, QuestionBank, Submissions
    ├── results/                # Marks, Grading Scales, Transcripts
    ├── routines/               # Routine, Room Allocation, Time Slots
    ├── attendance/             # Daily Attendance, Reports
    ├── notices/                # Notices, Circulars, Attachments
    └── ai_engine/              # LLM Integration, Prompt Handlers, Logs
```

### প্রধান মডেল রিলেশনশিপ (Core Models ERD Concept):
1. **User (AbstractUser):** `role` [ADMIN, TEACHER, STUDENT], `avatar`, `phone`, `is_active`.
2. **Department:** `name`, `code`, `head_of_department` (FK to Teacher).
3. **Batch:** `department` (FK), `academic_year`, `section`.
4. **Course:** `code`, `title`, `credits`, `department` (FK).
5. **CourseAssignment:** `course` (FK), `teacher` (FK), `batch` (FK), `semester`.
6. **Exam:** `title`, `course` (FK), `exam_type` [MID, FINAL, QUIZ], `exam_date`, `is_published`.
7. **Result:** `exam` (FK), `student` (FK), `marks_obtained`, `grade`, `status` [DRAFT, APPROVED, PUBLISHED].

### প্রধান এপিআই এন্ডপয়েন্টস (Key REST Endpoints):
* `POST /api/auth/login/` — JWT টোকেন ও রোল রেসপন্স।
* `GET/POST /api/admin/analytics/overview/` — ড্যাশবোর্ড স্ট্যাটস।
* `CRUD /api/admin/users/` — ইউজার তৈরি, লিস্ট, এডিট, ডিলিট।
* `POST /api/admin/users/bulk-upload/` — CSV ফাইল আপলোড প্রসেসিং।
* `CRUD /api/admin/academics/departments/` & `courses/` — একাডেমি সেটআপ।
* `POST /api/admin/results/publish/` — রেজাল্ট ভ্যালিডেশন ও স্টুডেন্টদের জন্য উন্মুক্তকরণ।
* `POST /api/ai/generate-questions/` — ফাইল থেকে এআই প্রশ্ন জেনারেশন।

---

## 🚀 ৫. বাস্তবায়ন রোডম্যাপ (Implementation Roadmap)

1. **ফেজ ১: জ্যাঙ্গো ব্যাকএন্ড ফাউন্ডেশন তৈরি**
   * Django & Django REST Framework ইনস্টলেশন, `CustomUser` মডেল এবং JWT অথেন্টিকেশন সেটআপ।
2. **ফেজ ২: একাডেমি ও ইউজার মডেল তৈরি**
   * ডিপার্টমেন্ট, ব্যাচ, কোর্স এবং কোর্স অ্যাসাইনমেন্ট মডেল ও এপিআই তৈরি।
3. **ফেজ ৩: রিঅ্যাক্ট অ্যাডমিন প্যানেল UI এক্সপ্যানশন**
   * অ্যাডমিন সাইডবারে প্রয়োজনীয় নতুন রুট এবং পেজসমূহ যুক্ত করা (`Departments`, `Courses`, `ExamsControl`, `RoutineBuilder`, `AuditLogs`)।
4. **ফেজ ৪: ফ্রন্টএন্ড-ব্যাকএন্ড এপিআই ইন্টিগ্রেশন**
   * রিঅ্যাক্ট পেজগুলোর সাথে জ্যাঙ্গো এন্ডপয়েন্ট কানেক্ট করে লাইভ ডেটা হ্যান্ডলিং করা।
5. **ফেজ ৫: এআই প্রশ্ন জেনারেটর পাইপলাইন ও ফাইনাল টেস্ট**
   * টিচার প্যানেলের এআই কোয়েশ্চন জেনারেটর সার্ভিস ব্যাকএন্ডে Gemini/OpenAI API এর সাথে যুক্ত করা।

---
*Created for QGenix Final Year Project Documentation.*
