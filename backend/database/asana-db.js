const { Pool } = require('pg');

/**
 * Asana Database Manager
 * Handles all database operations for Asana MCP integration
 */
class AsanaDatabaseManager {
    constructor() {
        this.pool = null;
        this.initializePool();
    }

    /**
     * Initialize PostgreSQL connection pool
     */
    initializePool() {
        try {
            this.pool = new Pool({
                host: process.env.DB_HOST || 'database-1.cluster-cziyo8qqeu6x.us-east-1.rds.amazonaws.com',
                port: process.env.DB_PORT || 5432,
                database: process.env.DB_NAME || 'asana_mcp',
                user: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD || '',
                ssl: {
                    rejectUnauthorized: false
                },
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            });

            console.log('[Asana DB] Connection pool initialized');
        } catch (error) {
            console.error('[Asana DB] Failed to initialize connection pool:', error);
            throw error;
        }
    }

    /**
     * Execute a query with parameters
     */
    async query(text, params = []) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(text, params);
            return result;
        } catch (error) {
            console.error('[Asana DB] Query error:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Insert Asana workspace data
     */
    async insertWorkspace(workspaceData, userId) {
        const query = `
            INSERT INTO asana_workspaces (id, name, description, is_organization, user_id, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                is_organization = EXCLUDED.is_organization,
                updated_at = EXCLUDED.updated_at
            RETURNING *
        `;
        
        const values = [
            workspaceData.id,
            workspaceData.name,
            workspaceData.description || null,
            workspaceData.is_organization || false,
            userId,
            new Date()
        ];

        const result = await this.query(query, values);
        return result.rows[0];
    }

    /**
     * Insert Asana project data
     */
    async insertProject(projectData, userId) {
        const query = `
            INSERT INTO asana_projects (id, name, description, workspace_id, team_id, status, color, due_date, user_id, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                workspace_id = EXCLUDED.workspace_id,
                team_id = EXCLUDED.team_id,
                status = EXCLUDED.status,
                color = EXCLUDED.color,
                due_date = EXCLUDED.due_date,
                updated_at = EXCLUDED.updated_at
            RETURNING *
        `;
        
        const values = [
            projectData.id,
            projectData.name,
            projectData.description || null,
            projectData.workspace?.id || null,
            projectData.team?.id || null,
            projectData.status || 'active',
            projectData.color || null,
            projectData.due_date ? new Date(projectData.due_date) : null,
            userId,
            new Date()
        ];

        const result = await this.query(query, values);
        return result.rows[0];
    }

    /**
     * Insert Asana task data
     */
    async insertTask(taskData, userId) {
        const query = `
            INSERT INTO asana_tasks (id, name, description, project_id, workspace_id, assignee_id, assignee_name, due_date, completed_at, status, priority, user_id, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                project_id = EXCLUDED.project_id,
                workspace_id = EXCLUDED.workspace_id,
                assignee_id = EXCLUDED.assignee_id,
                assignee_name = EXCLUDED.assignee_name,
                due_date = EXCLUDED.due_date,
                completed_at = EXCLUDED.completed_at,
                status = EXCLUDED.status,
                priority = EXCLUDED.priority,
                updated_at = EXCLUDED.updated_at
            RETURNING *
        `;
        
        const values = [
            taskData.id,
            taskData.name,
            taskData.description || null,
            taskData.projects?.[0]?.id || null,
            taskData.workspace?.id || null,
            taskData.assignee?.id || null,
            taskData.assignee?.name || null,
            taskData.due_date ? new Date(taskData.due_date) : null,
            taskData.completed_at ? new Date(taskData.completed_at) : null,
            taskData.completed ? 'completed' : 'incomplete',
            taskData.priority || 'normal',
            userId,
            new Date()
        ];

        const result = await this.query(query, values);
        return result.rows[0];
    }

    /**
     * Insert Asana team data
     */
    async insertTeam(teamData, userId) {
        const query = `
            INSERT INTO asana_teams (id, name, description, workspace_id, user_id, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                workspace_id = EXCLUDED.workspace_id,
                updated_at = EXCLUDED.updated_at
            RETURNING *
        `;
        
        const values = [
            teamData.id,
            teamData.name,
            teamData.description || null,
            teamData.workspace?.id || null,
            userId,
            new Date()
        ];

        const result = await this.query(query, values);
        return result.rows[0];
    }

    /**
     * Log analytics action
     */
    async logAnalytics(userId, actionType, actionData, metrics = {}, ipAddress = null, userAgent = null) {
        const query = `
            INSERT INTO asana_analytics (user_id, action_type, action_data, metrics, ip_address, user_agent)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const values = [
            userId,
            actionType,
            JSON.stringify(actionData),
            JSON.stringify(metrics),
            ipAddress,
            userAgent
        ];

        const result = await this.query(query, values);
        return result.rows[0];
    }

    /**
     * Log user activity
     */
    async logUserActivity(userId, action, resourceType = null, resourceId = null, sessionId = null, ipAddress = null, userAgent = null) {
        const query = `
            INSERT INTO asana_user_activity (user_id, session_id, action, resource_type, resource_id, ip_address, user_agent)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        
        const values = [
            userId,
            sessionId,
            action,
            resourceType,
            resourceId,
            ipAddress,
            userAgent
        ];

        const result = await this.query(query, values);
        return result.rows[0];
    }

    /**
     * Get user's Asana workspaces
     */
    async getUserWorkspaces(userId) {
        const query = `
            SELECT * FROM asana_workspaces 
            WHERE user_id = $1 
            ORDER BY created_at DESC
        `;
        
        const result = await this.query(query, [userId]);
        return result.rows;
    }

    /**
     * Get user's Asana projects
     */
    async getUserProjects(userId, workspaceId = null) {
        let query = `
            SELECT p.*, w.name as workspace_name 
            FROM asana_projects p
            LEFT JOIN asana_workspaces w ON p.workspace_id = w.id
            WHERE p.user_id = $1
        `;
        const params = [userId];
        
        if (workspaceId) {
            query += ' AND p.workspace_id = $2';
            params.push(workspaceId);
        }
        
        query += ' ORDER BY p.created_at DESC';
        
        const result = await this.query(query, params);
        return result.rows;
    }

    /**
     * Get user's Asana tasks
     */
    async getUserTasks(userId, projectId = null, status = null) {
        let query = `
            SELECT t.*, p.name as project_name, w.name as workspace_name
            FROM asana_tasks t
            LEFT JOIN asana_projects p ON t.project_id = p.id
            LEFT JOIN asana_workspaces w ON t.workspace_id = w.id
            WHERE t.user_id = $1
        `;
        const params = [userId];
        
        if (projectId) {
            query += ' AND t.project_id = $2';
            params.push(projectId);
        }
        
        if (status) {
            const paramIndex = params.length + 1;
            query += ` AND t.status = $${paramIndex}`;
            params.push(status);
        }
        
        query += ' ORDER BY t.created_at DESC';
        
        const result = await this.query(query, params);
        return result.rows;
    }

    /**
     * Get analytics data for user
     */
    async getUserAnalytics(userId, days = 30) {
        const query = `
            SELECT action_type, COUNT(*) as count, 
                   DATE_TRUNC('day', created_at) as date
            FROM asana_analytics 
            WHERE user_id = $1 
            AND created_at >= NOW() - INTERVAL '${days} days'
            GROUP BY action_type, DATE_TRUNC('day', created_at)
            ORDER BY date DESC
        `;
        
        const result = await this.query(query, [userId]);
        return result.rows;
    }

    /**
     * Close the connection pool
     */
    async close() {
        if (this.pool) {
            await this.pool.end();
            console.log('[Asana DB] Connection pool closed');
        }
    }
}

// Create singleton instance
const asanaDB = new AsanaDatabaseManager();

module.exports = asanaDB;
