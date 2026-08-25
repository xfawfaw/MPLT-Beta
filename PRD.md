PRD — My Personal Life Tracker (MPLT Zero)
==========================================

1\. Overview
------------

MPLT Zero adalah aplikasi produktivitas dan pelacakan kehidupan pribadi (_personal life tracker_) berbasis web yang dirancang dengan pendekatan gamifikasi. Masalah utama yang diselesaikan adalah hilangnya motivasi dan rasa _burnout_ dalam mengelola rutinitas, di mana kehidupan nyata seringkali tidak memberikan umpan balik visual (_visual progress_) terhadap pencapaian harian.

Tujuan aplikasi ini adalah mengubah manajemen hidup menjadi sistem yang adiktif layaknya sebuah _game_. Sistem akan mengonversi aktivitas pengguna menjadi metrik visual (poin, _progress bar_, kenaikan level) dengan menggabungkan lima pilar utama: Goal Tracker, Habit Builder, Task Manager, Weekly To-Do's, dan Money Tracker. Mengingat skala penggunaan sangat terbatas (maksimal 5 pengguna), aplikasi ini dirancang secara pragmatis dan ringan tanpa infrastruktur yang berlebihan (_over-engineered_).

2\. Requirements
----------------

Berikut adalah persyaratan tingkat tinggi untuk pengembangan sistem MPLT Zero:

*   **Platform:** Aplikasi Berbasis Web (Responsif untuk Desktop, Tablet, dan Mobile).
    
*   **Target Pengguna:** Lingkup privat atau _closed-group_ (1 hingga maksimal 5 pengguna aktif).
    
*   **Skala & Infrastruktur:** Menghindari _over-engineering_. Sistem direkomendasikan menggunakan arsitektur monolitik ringan atau _Backend-as-a-Service_ (BaaS) seperti Supabase atau Firebase untuk meminimalkan beban pemeliharaan _server_.
    
*   **Gamification Engine:** Sistem harus memiliki _backend logic_ dasar untuk melacak poin dari setiap "Habit" yang dicentang dan menghitung _Experience Points_ (EXP)/Level dari setiap "Task" yang diselesaikan.
    
*   **Visualisasi Data:** Mewajibkan penggunaan _charting library_ (Pie chart, Bar chart, Line chart) pada antarmuka pengguna untuk meniru akurasi visual _dashboard spreadsheet_ asli.
    

3\. Core Features
-----------------

Sistem akan dibagi menjadi fitur inti berikut untuk mencapai _Minimum Viable Product_ (MVP):

1.  **Gamification & Dashboard Layer**
    
    *   _Progress bar_ utama untuk level pengguna dan akumulasi poin harian.
        
    *   Ringkasan harian: persentase habit harian, tugas tertunda, dan _overview budget_.
        
2.  **Goal Tracker**
    
    *   Manajemen _Area of Life_ (Health, Work, Money, Family, Personal Growth, Spirituality).
        
    *   _Goal setting_ dengan parameter: Target, Visualisasi/Reward, Deadline, dan Status Pencapaian (Tercapai/Belum).
        
    *   Statistik rasio _goals_ yang tercapai dalam setahun.
        
3.  **Habit Builder**
    
    *   Kalender visual (grid) untuk mencentang kebiasaan harian (_Daily Percentage Progress_).
        
    *   Analitik habit mingguan dan bulanan.
        
    *   Sistem poin: Setiap habit yang selesai memberikan poin langsung.
        
4.  **Task Manager**
    
    *   Manajemen tugas berdasarkan _project category_, _priority_, dan _deadlines_.
        
    *   Filter "Due Today", "Upcoming", dan deteksi "Days Left".
        
    *   _Pie chart_ analitik untuk mendistribusikan persentase tugas yang selesai per kategori.
        
    *   Kenaikan level otomatis setelah akumulasi penyelesaian tugas tertentu.
        
5.  **Weekly To-Do's**
    
    *   _Time-blocking_ dan jadwal tugas dalam rentang mingguan (Senin-Minggu).
        
    *   _Progress bar_ otomatis per hari (contoh: Senin 120%, Selasa 86%).
        
    *   Indikator "Tasks Today" dan analitik konsistensi mingguan.
        
6.  **Customizable Money Tracker**
    
    *   Input _Income Goal_ dan _Start Balance_.
        
    *   **Custom Budgeting System:** Pengguna dapat mengatur alokasi rasio keuangan melalui dua opsi:
        
        *   _Preset options:_ (mis. 50/30/20, 60/20/20, 80/20).
            
        *   _Custom inputs:_ Pengguna menentukan persentase alokasi secara mandiri (total harus 100%).
            
    *   Pencatatan transaksi (_Cash Flow_ masuk dan keluar).
        
    *   Indikator _Under/Over Budget_ yang beradaptasi secara dinamis dengan persentase _budget_ yang telah diatur.
        

4\. User Flow
-------------

Alur utama pengguna dalam mengoperasikan MPLT Zero:

1.  **Onboarding & Setup:** Pengguna mendaftar, mengatur _Income Goal_, memilih/menyesuaikan **rasio budget**, mengkategorikan _Areas of Life_, dan menentukan _Goals_ tahunan.
    
2.  **Weekly Planning (Awal Minggu):** Pengguna masuk ke modul **Weekly To-Do's** untuk mendistribusikan tugas-tugas terpenting dari **Task Manager** ke hari-hari spesifik.
    
3.  **Daily Execution (Harian):**
    
    *   Pengguna membuka aplikasi, melihat _Tasks Today_.
        
    *   Pengguna mencentang rutinitas di **Habit Builder** (Sistem memicu penambahan Poin).
        
    *   Pengguna menyelesaikan tugas di **Task Manager** (Sistem memicu penambahan EXP/Level).
        
4.  **Financial Tracking (Insidental):** Pengguna memasukkan pengeluaran/pemasukan harian. Sistem langsung memperbarui indikator berdasarkan persentase _budget_ kustom untuk menunjukkan status kesehatan keuangan.
    
5.  **Review:** Pengguna meninjau _Dashboard_ dan _Analytics_ untuk merasakan kepuasan visual dari _progress bar_ yang penuh.
    

5\. Architecture
----------------

Mengingat aplikasi ini ditujukan untuk maksimal 5 pengguna, arsitektur yang disarankan adalah **Monolithic** atau **Backend-as-a-Service (BaaS)** untuk kesederhanaan, kecepatan pengembangan, dan biaya pemeliharaan yang hampir nol.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   sequenceDiagram      participant User      participant App as Frontend (React/Next.js)      participant BaaS as Backend / DB (e.g., Supabase)      Note over User, BaaS: Alur Sederhana Gamifikasi & Tracking      User->>App: Klik "Mark as Done" pada Task / Habit      App->>App: Update UI Optimis (Progress Bar Naik Instan)      App->>BaaS: POST / RPC kalkulasi Poin/EXP      BaaS->>BaaS: Update Row User & Task/Habit Status      BaaS-->>App: Konfirmasi Sukses & Data Terbaru      App-->>User: Tampilkan Animasi Level Up (Jika Relevan)   `

6\. Database Schema
-------------------

Skema relasional di bawah ini telah disesuaikan dengan penambahan pengaturan _budget_ kustom pada tabel users.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   erDiagram      users {          uuid id PK          string email          string password_hash          int current_level          int total_points          int budget_needs_ratio "e.g., 50"          int budget_wants_ratio "e.g., 30"          int budget_savings_ratio "e.g., 20"          datetime created_at      }      goals {          uuid id PK          uuid user_id FK          string area_of_life          string title          date deadline          string status          datetime created_at      }      habits {          uuid id PK          uuid user_id FK          string title          string frequency          datetime created_at      }      habit_logs {          uuid id PK          uuid habit_id FK          date log_date          boolean is_completed          int points_earned      }      tasks {          uuid id PK          uuid user_id FK          string title          string category          string priority          date due_date          string status          int exp_reward          datetime created_at      }      transactions {          uuid id PK          uuid user_id FK          string type          string budget_category "needs, wants, or savings"          decimal amount          date transaction_date          string notes      }      users ||--o{ goals : "sets"      users ||--o{ habits : "builds"      users ||--o{ tasks : "manages"      users ||--o{ transactions : "tracks"      habits ||--o{ habit_logs : "records daily"   `

7\. Design & Technical Constraints
----------------------------------

*   Antarmuka pengguna harus mengonfigurasi _font_ persis sesuai aturan berikut:
    
    *   Sans: Geist Mono, ui-monospace, monospace
        
    *   Serif: serif
        
    *   Mono: JetBrains Mono, monospace
        
*   **Simplicity Over Scalability:** Sistem tidak boleh dirancang dengan abstraksi berlebihan (seperti arsitektur _microservices_ atau _message queues_). Penggunaan SQLite, Supabase, atau Firebase sangat dianjurkan.
    
*   **Charting & Visualizations:** Menggunakan pustaka visualisasi data ringan (seperti Recharts) untuk mereplikasi _donut charts_, _bar charts_, dan kalender (_grid_) secara interaktif.
    
*   **Gamification State Management:** Perubahan pada poin atau persentase harian harus instan menggunakan _optimistic UI updates_. Pengguna tidak boleh mengalami jeda (_loading_) yang merusak pengalaman "kecanduan" saat mencentang progres.
    
*   **Dynamic Calculation:** Perhitungan status keuangan (_over/under budget_) harus dinamis berdasarkan input kolom budget\_needs\_ratio, budget\_wants\_ratio, dan budget\_savings\_ratio milik masing-masing _user_, bukan nilai statis.