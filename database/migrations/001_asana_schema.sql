-- Asana MCP Integration Database Schema
-- This migration creates tables for Asana project management analytics

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Asana Workspaces table
CREATE TABLE IF NOT EXISTS asana_workspaces (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_organization BOOLEAN DEFAULT FALSE,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asana Projects table
CREATE TABLE IF NOT EXISTS asana_projects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workspace_id VARCHAR(50) NOT NULL,
    team_id VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    color VARCHAR(7),
    due_date TIMESTAMP,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES asana_workspaces(id) ON DELETE CASCADE
);

-- Asana Tasks table
CREATE TABLE IF NOT EXISTS asana_tasks (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_id VARCHAR(50),
    workspace_id VARCHAR(50) NOT NULL,
    assignee_id VARCHAR(50),
    assignee_name VARCHAR(255),
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'incomplete',
    priority VARCHAR(20) DEFAULT 'normal',
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES asana_projects(id) ON DELETE SET NULL,
    FOREIGN KEY (workspace_id) REFERENCES asana_workspaces(id) ON DELETE CASCADE
);

-- Asana Teams table
CREATE TABLE IF NOT EXISTS asana_teams (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workspace_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES asana_workspaces(id) ON DELETE CASCADE
);

-- Asana Comments table
CREATE TABLE IF NOT EXISTS asana_comments (
    id VARCHAR(50) PRIMARY KEY,
    text TEXT NOT NULL,
    task_id VARCHAR(50),
    project_id VARCHAR(50),
    author_id VARCHAR(50),
    author_name VARCHAR(255),
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES asana_tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES asana_projects(id) ON DELETE CASCADE
);

-- Asana Analytics table for tracking user actions and metrics
CREATE TABLE IF NOT EXISTS asana_analytics (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    workspace_id VARCHAR(50),
    project_id VARCHAR(50),
    task_id VARCHAR(50),
    action_type VARCHAR(50) NOT NULL,
    action_data JSONB,
    metrics JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES asana_workspaces(id) ON DELETE SET NULL,
    FOREIGN KEY (project_id) REFERENCES asana_projects(id) ON DELETE SET NULL,
    FOREIGN KEY (task_id) REFERENCES asana_tasks(id) ON DELETE SET NULL
);

-- Asana User Activity audit trail
CREATE TABLE IF NOT EXISTS asana_user_activity (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(50),
    workspace_id VARCHAR(50),
    project_id VARCHAR(50),
    task_id VARCHAR(50),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES asana_workspaces(id) ON DELETE SET NULL,
    FOREIGN KEY (project_id) REFERENCES asana_projects(id) ON DELETE SET NULL,
    FOREIGN KEY (task_id) REFERENCES asana_tasks(id) ON DELETE SET NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_asana_workspaces_user_id ON asana_workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_asana_workspaces_created_at ON asana_workspaces(created_at);

CREATE INDEX IF NOT EXISTS idx_asana_projects_workspace_id ON asana_projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_asana_projects_user_id ON asana_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_asana_projects_status ON asana_projects(status);
CREATE INDEX IF NOT EXISTS idx_asana_projects_due_date ON asana_projects(due_date);

CREATE INDEX IF NOT EXISTS idx_asana_tasks_project_id ON asana_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_asana_tasks_workspace_id ON asana_tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_asana_tasks_user_id ON asana_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_asana_tasks_assignee_id ON asana_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_asana_tasks_status ON asana_tasks(status);
CREATE INDEX IF NOT EXISTS idx_asana_tasks_due_date ON asana_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_asana_tasks_completed_at ON asana_tasks(completed_at);

CREATE INDEX IF NOT EXISTS idx_asana_teams_workspace_id ON asana_teams(workspace_id);
CREATE INDEX IF NOT EXISTS idx_asana_teams_user_id ON asana_teams(user_id);

CREATE INDEX IF NOT EXISTS idx_asana_comments_task_id ON asana_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_asana_comments_project_id ON asana_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_asana_comments_user_id ON asana_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_asana_comments_created_at ON asana_comments(created_at);

CREATE INDEX IF NOT EXISTS idx_asana_analytics_user_id ON asana_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_asana_analytics_action_type ON asana_analytics(action_type);
CREATE INDEX IF NOT EXISTS idx_asana_analytics_created_at ON asana_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_asana_analytics_action_data ON asana_analytics USING GIN(action_data);

CREATE INDEX IF NOT EXISTS idx_asana_user_activity_user_id ON asana_user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_asana_user_activity_session_id ON asana_user_activity(session_id);
CREATE INDEX IF NOT EXISTS idx_asana_user_activity_action ON asana_user_activity(action);
CREATE INDEX IF NOT EXISTS idx_asana_user_activity_created_at ON asana_user_activity(created_at);

-- Add comments for documentation
COMMENT ON TABLE asana_workspaces IS 'Stores Asana workspace information and metadata';
COMMENT ON TABLE asana_projects IS 'Stores Asana project information linked to workspaces';
COMMENT ON TABLE asana_tasks IS 'Stores Asana task information linked to projects and workspaces';
COMMENT ON TABLE asana_teams IS 'Stores Asana team information linked to workspaces';
COMMENT ON TABLE asana_comments IS 'Stores Asana comments linked to tasks and projects';
COMMENT ON TABLE asana_analytics IS 'Stores analytics data and metrics for Asana operations';
COMMENT ON TABLE asana_user_activity IS 'Audit trail for user actions and system access';

-- Insert initial data for schema tracking
INSERT INTO asana_analytics (user_id, action_type, action_data, metrics) 
VALUES ('system', 'schema_created', '{"version": "1.0.0", "migration": "001_asana_schema", "tables": ["asana_workspaces", "asana_projects", "asana_tasks", "asana_teams", "asana_comments", "asana_analytics", "asana_user_activity"]}', '{"tables_created": 7, "indexes_created": 20}')
ON CONFLICT DO NOTHING;
