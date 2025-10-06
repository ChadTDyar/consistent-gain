-- Allow microblock logs without a goal by making goal_id nullable
ALTER TABLE activity_logs
ALTER COLUMN goal_id DROP NOT NULL;