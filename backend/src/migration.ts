// backend/src/migration.ts
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

async function runMigration() {
  try {
    console.log("=== DATABASE MIGRATION STARTED ===");
    console.log("");

  
    let hasSupabaseCLI = false;
    try {
      execSync('supabase --version', { stdio: 'ignore' });
      hasSupabaseCLI = true;
      console.log("✅ Supabase CLI detected");
    } catch (error) {
      console.log("⚠️  Supabase CLI not found");
    }

    if (hasSupabaseCLI) {
      console.log("Using Supabase CLI to create tables...");
      console.log("");

      try {

        try {
          execSync('supabase status', { stdio: 'pipe' });
          console.log("Supabase project already initialized");
        } catch (error) {
          console.log("Initializing Supabase project...");
          execSync('supabase init', { stdio: 'inherit' });
        }

        const schemaPath = path.join(__dirname, '..', '..', 'database_schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');


        const migrationDir = path.join(__dirname, '..', '..', 'supabase', 'migrations');
        if (!fs.existsSync(migrationDir)) {
          fs.mkdirSync(migrationDir, { recursive: true });
        }

        const migrationFile = path.join(migrationDir, `${Date.now()}_create_tables.sql`);
        fs.writeFileSync(migrationFile, schemaSQL);

        console.log("Created migration file:", migrationFile);
        console.log("Running migration...");


        execSync('supabase db push', { stdio: 'inherit' });

        console.log("");
        console.log("=== MIGRATION COMPLETED SUCCESSFULLY ===");
        console.log("");
        console.log("Database tables have been created:");
        console.log("- users");
        console.log("- ai_profiles");
        console.log("- matches");
        console.log("- threads");
        console.log("- messages");
        console.log("");
        console.log("You can now run 'npm run seed' to populate with test data.");

      } catch (error) {
        console.error("Supabase CLI migration failed:", error.message);
        throw error;
      }

    } else {

      console.log("Supabase CLI not available. Please create tables manually:");
      console.log("");
      console.log("📋 MANUAL MIGRATION INSTRUCTIONS:");
      console.log("");
      console.log("1. Go to your Supabase project dashboard");
      console.log("2. Navigate to the SQL Editor");
      console.log("3. Copy and paste the contents of database_schema.sql");
      console.log("4. Execute the SQL to create tables");
      console.log("");
      console.log("📄 SQL Schema location: ./database_schema.sql");
      console.log("");
      console.log("After creating tables, run 'npm run seed' to populate with test data.");
      console.log("");
      console.log("💡 TIP: Install Supabase CLI globally for automatic migrations:");
      console.log("   npm install -g supabase");
      console.log("   supabase login");
      console.log("   supabase link --project-ref YOUR_PROJECT_REF");
      console.log("   Then re-run 'npm run migrate'");
    }

  } catch (error) {
    console.error("Migration failed:", error);
    console.log("");
    console.log("🔧 TROUBLESHOOTING:");
    console.log("1. Make sure you have a Supabase project set up");
    console.log("2. Check your SUPABASE_URL and SUPABASE_ANON_KEY environment variables");
    console.log("3. Install Supabase CLI: npm install -g supabase");
    console.log("4. Login to Supabase: supabase login");
    console.log("5. Link your project: supabase link --project-ref YOUR_PROJECT_REF");
    process.exit(1);
  }
}

if (require.main === module) {
  runMigration().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
