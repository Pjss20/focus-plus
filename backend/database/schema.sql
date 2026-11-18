-- ============================================================
-- FOCUS+ DATABASE SCHEMA
-- MySQL 8.0 | utf8mb4 | InnoDB
-- ============================================================

CREATE DATABASE IF NOT EXISTS focus_plus_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE focus_plus_db;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name            VARCHAR(150)    NOT NULL,
  email           VARCHAR(255)    NOT NULL,
  password_hash   VARCHAR(255)    NOT NULL,
  avatar_url      VARCHAR(500)    NULL,
  bio             TEXT            NULL,
  level           INT             NOT NULL DEFAULT 1,
  experience_points INT           NOT NULL DEFAULT 0,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      TIMESTAMP       NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: user_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id                        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id                   BIGINT UNSIGNED NOT NULL,
  theme                     ENUM('light','dark')  NOT NULL DEFAULT 'light',
  language                  VARCHAR(10)           NOT NULL DEFAULT 'es',
  date_format               VARCHAR(20)           NULL,
  week_start                TINYINT               NOT NULL DEFAULT 1,
  notifications_enabled     TINYINT(1)            NOT NULL DEFAULT 1,
  pomodoro_work_minutes     INT                   NOT NULL DEFAULT 25,
  pomodoro_short_break      INT                   NOT NULL DEFAULT 5,
  pomodoro_long_break       INT                   NOT NULL DEFAULT 15,
  pomodoro_cycles           INT                   NOT NULL DEFAULT 4,
  created_at                TIMESTAMP             NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                TIMESTAMP             NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_settings_user_id (user_id),
  CONSTRAINT fk_user_settings_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100)    NOT NULL,
  color       VARCHAR(7)      NOT NULL,
  icon        VARCHAR(50)     NOT NULL,
  slug        VARCHAR(50)     NOT NULL,
  is_default  TINYINT(1)      NOT NULL DEFAULT 0,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug),
  KEY idx_categories_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: subjects  (declared before habits/tasks/etc. that reference it)
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  name        VARCHAR(150)    NOT NULL,
  color       VARCHAR(7)      NULL,
  icon        VARCHAR(50)     NULL,
  teacher     VARCHAR(100)    NULL,
  classroom   VARCHAR(100)    NULL,
  credits     TINYINT         NULL,
  is_active   TINYINT(1)      NOT NULL DEFAULT 1,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at  TIMESTAMP       NULL,
  PRIMARY KEY (id),
  KEY idx_subjects_user_id (user_id),
  KEY idx_subjects_is_active (is_active),
  KEY idx_subjects_deleted_at (deleted_at),
  CONSTRAINT fk_subjects_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: habits
-- ============================================================
CREATE TABLE IF NOT EXISTS habits (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id         BIGINT UNSIGNED NOT NULL,
  category_id     BIGINT UNSIGNED NULL,
  name            VARCHAR(150)    NOT NULL,
  description     TEXT            NULL,
  frequency       ENUM('daily','custom') NOT NULL DEFAULT 'daily',
  custom_days     JSON            NULL,
  reminder_time   TIME            NULL,
  color           VARCHAR(7)      NULL,
  icon            VARCHAR(50)     NULL,
  is_active       TINYINT(1)      NOT NULL DEFAULT 1,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      TIMESTAMP       NULL,
  PRIMARY KEY (id),
  KEY idx_habits_user_id (user_id),
  KEY idx_habits_category_id (category_id),
  KEY idx_habits_is_active (is_active),
  KEY idx_habits_deleted_at (deleted_at),
  CONSTRAINT fk_habits_user     FOREIGN KEY (user_id)     REFERENCES users       (id) ON DELETE CASCADE,
  CONSTRAINT fk_habits_category FOREIGN KEY (category_id) REFERENCES categories  (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: habit_schedules
-- ============================================================
CREATE TABLE IF NOT EXISTS habit_schedules (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  habit_id    BIGINT UNSIGNED NOT NULL,
  day_of_week TINYINT         NOT NULL COMMENT '0=Sunday … 6=Saturday',
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_habit_schedules_habit_id (habit_id),
  CONSTRAINT fk_habit_schedules_habit FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: habit_completions
-- ============================================================
CREATE TABLE IF NOT EXISTS habit_completions (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  habit_id       BIGINT UNSIGNED NOT NULL,
  user_id        BIGINT UNSIGNED NOT NULL,
  completed_date DATE            NOT NULL,
  notes          TEXT            NULL,
  created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_completion (habit_id, completed_date),
  KEY idx_habit_completions_user_id (user_id),
  KEY idx_habit_completions_completed_date (completed_date),
  CONSTRAINT fk_habit_completions_habit FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
  CONSTRAINT fk_habit_completions_user  FOREIGN KEY (user_id)  REFERENCES users  (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: tasks
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      BIGINT UNSIGNED NOT NULL,
  category_id  BIGINT UNSIGNED NULL,
  subject_id   BIGINT UNSIGNED NULL,
  title        VARCHAR(255)    NOT NULL,
  description  TEXT            NULL,
  priority     ENUM('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  status       ENUM('pending','in_progress','completed','archived') NOT NULL DEFAULT 'pending',
  due_date     DATETIME        NULL,
  completed_at DATETIME        NULL,
  sort_order   INT             NOT NULL DEFAULT 0,
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at   TIMESTAMP       NULL,
  PRIMARY KEY (id),
  KEY idx_tasks_user_id (user_id),
  KEY idx_tasks_category_id (category_id),
  KEY idx_tasks_subject_id (subject_id),
  KEY idx_tasks_status (status),
  KEY idx_tasks_priority (priority),
  KEY idx_tasks_due_date (due_date),
  KEY idx_tasks_deleted_at (deleted_at),
  CONSTRAINT fk_tasks_user     FOREIGN KEY (user_id)     REFERENCES users      (id) ON DELETE CASCADE,
  CONSTRAINT fk_tasks_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
  CONSTRAINT fk_tasks_subject  FOREIGN KEY (subject_id)  REFERENCES subjects   (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: subtasks
-- ============================================================
CREATE TABLE IF NOT EXISTS subtasks (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  task_id      BIGINT UNSIGNED NOT NULL,
  title        VARCHAR(255)    NOT NULL,
  is_completed TINYINT(1)      NOT NULL DEFAULT 0,
  sort_order   INT             NOT NULL DEFAULT 0,
  created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_subtasks_task_id (task_id),
  CONSTRAINT fk_subtasks_task FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: goals
-- ============================================================
CREATE TABLE IF NOT EXISTS goals (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL,
  category_id   BIGINT UNSIGNED NULL,
  title         VARCHAR(255)    NOT NULL,
  description   TEXT            NULL,
  type          ENUM('quantifiable','habit','project') NOT NULL,
  current_value DECIMAL(10,2)   NOT NULL DEFAULT 0,
  target_value  DECIMAL(10,2)   NULL,
  unit          VARCHAR(50)     NULL,
  status        ENUM('active','completed','paused','abandoned') NOT NULL DEFAULT 'active',
  start_date    DATE            NOT NULL,
  end_date      DATE            NULL,
  color         VARCHAR(7)      NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    TIMESTAMP       NULL,
  PRIMARY KEY (id),
  KEY idx_goals_user_id (user_id),
  KEY idx_goals_category_id (category_id),
  KEY idx_goals_status (status),
  KEY idx_goals_deleted_at (deleted_at),
  CONSTRAINT fk_goals_user     FOREIGN KEY (user_id)     REFERENCES users      (id) ON DELETE CASCADE,
  CONSTRAINT fk_goals_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: goal_progress
-- ============================================================
CREATE TABLE IF NOT EXISTS goal_progress (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  goal_id     BIGINT UNSIGNED NOT NULL,
  user_id     BIGINT UNSIGNED NOT NULL,
  value       DECIMAL(10,2)   NOT NULL,
  notes       TEXT            NULL,
  recorded_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_goal_progress_goal_id (goal_id),
  KEY idx_goal_progress_user_id (user_id),
  KEY idx_goal_progress_recorded_at (recorded_at),
  CONSTRAINT fk_goal_progress_goal FOREIGN KEY (goal_id)  REFERENCES goals (id) ON DELETE CASCADE,
  CONSTRAINT fk_goal_progress_user FOREIGN KEY (user_id)  REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: exams
-- ============================================================
CREATE TABLE IF NOT EXISTS exams (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  subject_id  BIGINT UNSIGNED NOT NULL,
  title       VARCHAR(255)    NOT NULL,
  description TEXT            NULL,
  exam_date   DATETIME        NOT NULL,
  location    VARCHAR(200)    NULL,
  weight      DECIMAL(5,2)    NULL,
  score       DECIMAL(5,2)    NULL,
  status      ENUM('upcoming','completed','cancelled') NOT NULL DEFAULT 'upcoming',
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_exams_user_id (user_id),
  KEY idx_exams_subject_id (subject_id),
  KEY idx_exams_exam_date (exam_date),
  KEY idx_exams_status (status),
  CONSTRAINT fk_exams_user    FOREIGN KEY (user_id)    REFERENCES users    (id) ON DELETE CASCADE,
  CONSTRAINT fk_exams_subject FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: assignments
-- ============================================================
CREATE TABLE IF NOT EXISTS assignments (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  subject_id  BIGINT UNSIGNED NOT NULL,
  title       VARCHAR(255)    NOT NULL,
  description TEXT            NULL,
  due_date    DATETIME        NOT NULL,
  weight      DECIMAL(5,2)    NULL,
  score       DECIMAL(5,2)    NULL,
  status      ENUM('pending','submitted','graded','late') NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_assignments_user_id (user_id),
  KEY idx_assignments_subject_id (subject_id),
  KEY idx_assignments_due_date (due_date),
  KEY idx_assignments_status (status),
  CONSTRAINT fk_assignments_user    FOREIGN KEY (user_id)    REFERENCES users    (id) ON DELETE CASCADE,
  CONSTRAINT fk_assignments_subject FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: study_notes
-- ============================================================
CREATE TABLE IF NOT EXISTS study_notes (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  subject_id  BIGINT UNSIGNED NULL,
  title       VARCHAR(255)    NOT NULL,
  content     LONGTEXT        NULL,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at  TIMESTAMP       NULL,
  PRIMARY KEY (id),
  KEY idx_study_notes_user_id (user_id),
  KEY idx_study_notes_subject_id (subject_id),
  KEY idx_study_notes_deleted_at (deleted_at),
  CONSTRAINT fk_study_notes_user    FOREIGN KEY (user_id)    REFERENCES users    (id) ON DELETE CASCADE,
  CONSTRAINT fk_study_notes_subject FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: calendar_events
-- ============================================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id          BIGINT UNSIGNED NOT NULL,
  title            VARCHAR(255)    NOT NULL,
  description      TEXT            NULL,
  start_datetime   DATETIME        NOT NULL,
  end_datetime     DATETIME        NOT NULL,
  all_day          TINYINT(1)      NOT NULL DEFAULT 0,
  color            VARCHAR(7)      NULL,
  event_type       ENUM('habit','task','exam','assignment','custom','focus') NOT NULL DEFAULT 'custom',
  ref_id           INT             NULL COMMENT 'FK to source table row id',
  is_recurring     TINYINT(1)      NOT NULL DEFAULT 0,
  recurrence_rule  VARCHAR(200)    NULL,
  created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_calendar_events_user_id (user_id),
  KEY idx_calendar_events_start_datetime (start_datetime),
  KEY idx_calendar_events_event_type (event_type),
  CONSTRAINT fk_calendar_events_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: planner_events
-- ============================================================
CREATE TABLE IF NOT EXISTS planner_events (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL,
  task_id       BIGINT UNSIGNED NULL,
  subject_id    BIGINT UNSIGNED NULL,
  title         VARCHAR(255)    NOT NULL,
  start_time    TIME            NOT NULL,
  end_time      TIME            NOT NULL,
  day_of_week   TINYINT         NULL COMMENT '0=Sunday … 6=Saturday',
  specific_date DATE            NULL,
  color         VARCHAR(7)      NULL,
  is_recurring  TINYINT(1)      NOT NULL DEFAULT 0,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_planner_events_user_id (user_id),
  KEY idx_planner_events_task_id (task_id),
  KEY idx_planner_events_subject_id (subject_id),
  KEY idx_planner_events_specific_date (specific_date),
  CONSTRAINT fk_planner_events_user    FOREIGN KEY (user_id)    REFERENCES users    (id) ON DELETE CASCADE,
  CONSTRAINT fk_planner_events_task    FOREIGN KEY (task_id)    REFERENCES tasks    (id) ON DELETE SET NULL,
  CONSTRAINT fk_planner_events_subject FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: focus_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS focus_sessions (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id          BIGINT UNSIGNED NOT NULL,
  task_id          BIGINT UNSIGNED NULL,
  duration_minutes INT             NOT NULL,
  type             ENUM('focus','short_break','long_break') NOT NULL DEFAULT 'focus',
  started_at       DATETIME        NOT NULL,
  ended_at         DATETIME        NULL,
  is_completed     TINYINT(1)      NOT NULL DEFAULT 0,
  notes            TEXT            NULL,
  created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_focus_sessions_user_id (user_id),
  KEY idx_focus_sessions_task_id (task_id),
  KEY idx_focus_sessions_started_at (started_at),
  KEY idx_focus_sessions_type (type),
  CONSTRAINT fk_focus_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_focus_sessions_task FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: achievements
-- ============================================================
CREATE TABLE IF NOT EXISTS achievements (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug             VARCHAR(100)    NOT NULL,
  name             VARCHAR(150)    NOT NULL,
  description      TEXT            NULL,
  icon             VARCHAR(100)    NULL,
  points           INT             NOT NULL DEFAULT 10,
  condition_type   VARCHAR(50)     NOT NULL,
  condition_value  INT             NOT NULL,
  rarity           ENUM('common','rare','epic','legendary') NOT NULL DEFAULT 'common',
  created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_achievements_slug (slug),
  KEY idx_achievements_rarity (rarity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: user_achievements
-- ============================================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id        BIGINT UNSIGNED NOT NULL,
  achievement_id BIGINT UNSIGNED NOT NULL,
  unlocked_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_user_achievement (user_id, achievement_id),
  KEY idx_user_achievements_achievement_id (achievement_id),
  CONSTRAINT fk_user_achievements_user        FOREIGN KEY (user_id)        REFERENCES users        (id) ON DELETE CASCADE,
  CONSTRAINT fk_user_achievements_achievement FOREIGN KEY (achievement_id) REFERENCES achievements (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  title      VARCHAR(255)    NOT NULL,
  body       TEXT            NULL,
  type       VARCHAR(50)     NOT NULL,
  ref_table  VARCHAR(50)     NULL,
  ref_id     INT             NULL,
  is_read    TINYINT(1)      NOT NULL DEFAULT 0,
  created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notifications_user_id (user_id),
  KEY idx_notifications_is_read (is_read),
  KEY idx_notifications_type (type),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: notes
-- ============================================================
CREATE TABLE IF NOT EXISTS notes (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  title      VARCHAR(255)    NOT NULL,
  content    LONGTEXT        NULL,
  color      VARCHAR(7)      NOT NULL DEFAULT '#FFFFFF',
  is_pinned  TINYINT(1)      NOT NULL DEFAULT 0,
  created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP       NULL,
  PRIMARY KEY (id),
  KEY idx_notes_user_id (user_id),
  KEY idx_notes_is_pinned (is_pinned),
  KEY idx_notes_deleted_at (deleted_at),
  CONSTRAINT fk_notes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: tags
-- ============================================================
CREATE TABLE IF NOT EXISTS tags (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  name       VARCHAR(80)     NOT NULL,
  color      VARCHAR(7)      NULL,
  created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tags_user_id (user_id),
  CONSTRAINT fk_tags_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: note_tags  (pivot)
-- ============================================================
CREATE TABLE IF NOT EXISTS note_tags (
  note_id BIGINT UNSIGNED NOT NULL,
  tag_id  BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (note_id, tag_id),
  KEY idx_note_tags_tag_id (tag_id),
  CONSTRAINT fk_note_tags_note FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE,
  CONSTRAINT fk_note_tags_tag  FOREIGN KEY (tag_id)  REFERENCES tags  (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: password_reset_tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  token      VARCHAR(255)    NOT NULL,
  expires_at DATETIME        NOT NULL,
  used_at    DATETIME        NULL,
  created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_password_reset_tokens_token (token),
  KEY idx_password_reset_tokens_user_id (user_id),
  KEY idx_password_reset_tokens_expires_at (expires_at),
  CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- SEED DATA: categories
-- ============================================================
INSERT INTO categories (name, color, icon, slug, is_default) VALUES
  ('Académicas',           '#6366F1', 'BookOpen',  'academicas',         1),
  ('Hábitos y Bienestar',  '#10B981', 'Heart',      'habitos-bienestar',  1),
  ('Productividad y Trabajo', '#F59E0B', 'Briefcase', 'productividad',   1),
  ('Finanzas y Ahorro',    '#3B82F6', 'PiggyBank',  'finanzas',           1);

-- ============================================================
-- SEED DATA: achievements (25)
-- ============================================================
INSERT INTO achievements (slug, name, description, icon, points, condition_type, condition_value, rarity) VALUES
  -- Habits
  ('first_habit',     'Primer Hábito',        'Crea tu primer hábito',                           '🌱', 10,  'habits_created',     1,   'common'),
  ('week_streak',     'Racha Semanal',         'Completa hábitos 7 días seguidos',                '🔥', 25,  'habit_streak_days',  7,   'common'),
  ('month_streak',    'Racha Mensual',         'Completa hábitos 30 días seguidos',               '🔥', 100, 'habit_streak_days',  30,  'rare'),
  ('hundred_days',    'Cien Días',             'Mantén una racha de 100 días consecutivos',       '💯', 500, 'habit_streak_days',  100, 'epic'),
  ('consistent',      'Constante',             'Completa 50 hábitos en total',                    '⚡', 50,  'habits_completed',   50,  'common'),
  ('perfectionist',   'Perfeccionista',        'Completa todos los hábitos del día 10 veces',     '✨', 150, 'perfect_days',       10,  'rare'),
  -- Tasks
  ('first_task',      'Primera Tarea',         'Completa tu primera tarea',                       '✅', 10,  'tasks_completed',    1,   'common'),
  ('task_master',     'Maestro de Tareas',     'Completa 100 tareas',                             '🏆', 200, 'tasks_completed',    100, 'rare'),
  ('multitasker',     'Multitarea',            'Completa 5 tareas en un mismo día',               '⚡', 50,  'tasks_in_day',       5,   'common'),
  -- Goals
  ('first_goal',      'Primera Meta',          'Crea tu primera meta',                            '🎯', 10,  'goals_created',      1,   'common'),
  ('goal_crusher',    'Aplastametas',          'Completa 10 metas',                               '💪', 300, 'goals_completed',    10,  'epic'),
  -- Focus
  ('first_focus',     'Primera Sesión',        'Completa tu primera sesión de enfoque',           '⏱️', 10,  'focus_sessions',     1,   'common'),
  ('focus_master',    'Maestro del Enfoque',   'Acumula 100 horas de enfoque total',              '🧠', 500, 'focus_hours',        100, 'legendary'),
  ('deep_work',       'Trabajo Profundo',      'Completa 10 sesiones de Pomodoro en un día',      '🔬', 75,  'pomodoros_in_day',   10,  'rare'),
  -- Time-based
  ('early_bird',      'Madrugador',            'Inicia una sesión antes de las 7:00 AM',          '🌅', 25,  'session_hour_start', 7,   'common'),
  ('night_owl',       'Búho Nocturno',         'Completa una sesión después de las 23:00',        '🦉', 25,  'session_hour_end',   23,  'common'),
  -- Notes / Study
  ('first_note',      'Primera Nota',          'Crea tu primera nota',                            '📝', 10,  'notes_created',      1,   'common'),
  ('bookworm',        'Ratón de Biblioteca',   'Crea 50 notas de estudio',                        '📚', 150, 'study_notes_created',50,  'rare'),
  -- Academic
  ('student',         'Estudiante',            'Registra tu primera asignatura',                  '🎓', 10,  'subjects_created',   1,   'common'),
  ('scholar',         'Erudito',               'Obtén una calificación perfecta en un examen',    '🏅', 200, 'exam_perfect_score', 1,   'epic'),
  -- Exploration / Progress
  ('explorer',        'Explorador',            'Usa todas las secciones de la app al menos una vez','🗺️', 50,  'sections_visited',  6,   'common'),
  ('level_up',        'Nivel Superior',        'Alcanza el nivel 5',                              '⬆️', 100, 'user_level',         5,   'rare'),
  ('legend',          'Leyenda',               'Alcanza el nivel 50',                             '👑', 1000,'user_level',         50,  'legendary'),
  -- Social / Extra
  ('profile_complete','Perfil Completo',       'Completa todos los campos de tu perfil',          '👤', 20,  'profile_fields',     1,   'common'),
  ('comeback_kid',    'De Vuelta',             'Vuelve a la app después de 7 días de inactividad','🔄', 30,  'days_inactive',      7,   'common');

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
SHOW TABLES;
SELECT COUNT(*) AS total_achievements FROM achievements;
DESC users;
