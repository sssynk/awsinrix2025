// Simple database connection test script
require('dotenv').config();
const { initializeDatabase, seedConnections, query } = require('./db');

async function testDatabase() {
    console.log('Testing database connection...\n');
    
    try {
        // Test connection
        console.log('1. Testing connection...');
        await initializeDatabase();
        console.log('✓ Database initialized\n');

        // Seed connections
        console.log('2. Seeding connections...');
        await seedConnections();
        console.log('✓ Connections seeded\n');

        // Query connections
        console.log('3. Querying connections...');
        const result = await query('SELECT name, display_name, category, auth_type FROM connections ORDER BY category, name');
        console.log(`✓ Found ${result.rows.length} connections:\n`);
        
        result.rows.forEach(conn => {
            console.log(`   - ${conn.display_name} (${conn.name})`);
            console.log(`     Category: ${conn.category} | Auth: ${conn.auth_type}`);
        });

        console.log('\n✓ Database test completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('✗ Database test failed:', err);
        process.exit(1);
    }
}

testDatabase();

