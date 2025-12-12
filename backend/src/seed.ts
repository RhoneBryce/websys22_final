// backend/src/seed.ts
import { supabase } from './supabaseClient';
import { Faker, en } from '@faker-js/faker';


const faker = new Faker({ locale: en });

async function runSeed() {
  try {
    console.log("Seeding database with test data...");


    console.log("Creating admin/test users...");
    const adminUsers = [
      { name: 'Admin User', email: 'admin@example.com', password: 'admin123' },
      { name: 'Test User', email: 'test@example.com', password: 'test123' }
    ];

    for (const adminUser of adminUsers) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: adminUser.email,
          password: adminUser.password,
          options: {
            data: {
              name: adminUser.name
            }
          }
        });

        if (authError) {
          console.error(`Auth creation failed for ${adminUser.email}:`, authError.message);
          continue;
        }


        if (authData.user) {
          const { error: userInsertError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              name: adminUser.name,
              email: adminUser.email,
              password: adminUser.password
            });

          if (userInsertError) {
            console.error(`User table insert failed for ${adminUser.email}:`, userInsertError.message);
          } else {
            console.log(`✓ Admin user created: ${adminUser.email}`);
          }
        }
      } catch (userError) {
        console.error(`Error creating admin user ${adminUser.email}:`, userError);
      }
    }


    console.log("Creating AI profiles...");
    const seedProfiles = [];
    const hobbyOptions = [
      'Reading science fiction novels',
      'Playing chess',
      'Writing poetry',
      'Analyzing data patterns',
      'Discussing philosophy',
      'Creating artwork',
      'Problem solving',
      'Storytelling',
      'Learning languages',
      'Exploring music theory'
    ];
    
    for (let i = 0; i < 15; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const name = firstName + ' ' + lastName;
      const personality = faker.lorem.words(3);
      const description = faker.lorem.sentences(2);
      const hobbies = faker.helpers.arrayElement(hobbyOptions);
      const model_type = faker.helpers.arrayElement(['GPT-3', 'GPT-4', 'Claude', 'Bard']);
      const compatibility_tags = faker.lorem.words(3);
      const password = firstName; // Password is first name only

      seedProfiles.push({
        name,
        personality,
        description,
        hobbies,
        model_type,
        compatibility_tags,
        password, 
        user_id: null
      });
    }

    const { error: profileError } = await supabase
      .from('ai_profiles')
      .insert(seedProfiles);

    if (profileError) {
      console.error("AI profiles seeding failed:", profileError);
      console.error("Make sure the ai_profiles table exists in Supabase.");
      process.exitCode = 1;
      return;
    } else {
      console.log(`✓ AI profiles seeded successfully (${seedProfiles.length} profiles)`);
    }

   
    console.log("Creating matches...");
    const { data: profiles, error: profilesError } = await supabase
      .from('ai_profiles')
      .select('id');

    if (profilesError) {
      console.error("Failed to fetch profiles for matches:", profilesError);
      process.exitCode = 1;
      return;
    }

    if (profiles && profiles.length >= 4) {
      const matches = [];
      for (let i = 0; i < 5; i++) {
        const ai1 = faker.helpers.arrayElement(profiles);
        let ai2 = faker.helpers.arrayElement(profiles);
        while (ai2.id === ai1.id) {
          ai2 = faker.helpers.arrayElement(profiles);
        }

        matches.push({
          ai1_id: ai1.id,
          ai2_id: ai2.id
        });
      }

      const { error: matchError } = await supabase
        .from('matches')
        .insert(matches);

      if (matchError) {
        console.error("Matches seeding failed:", matchError);
        console.error("Make sure the matches table exists in Supabase.");
      } else {
        console.log(`✓ Matches seeded successfully (${matches.length} matches)`);
      }

      
      console.log("Creating threads and messages...");
      const { data: createdMatches, error: matchesFetchError } = await supabase
        .from('matches')
        .select('id, ai1_id, ai2_id');

      if (matchesFetchError) {
        console.error("Failed to fetch matches for threads:", matchesFetchError);
      } else if (createdMatches && createdMatches.length > 0) {
        for (const match of createdMatches.slice(0, 3)) {
          
          const { data: thread, error: threadError } = await supabase
            .from('threads')
            .insert({
              match_id: match.id
            })
            .select()
            .single();

          if (threadError) {
            console.error("Thread creation failed:", threadError);
            continue;
          }

          
          const messages = [];
          const conversationStarters = [
            "That's an interesting perspective on the topic.",
            "I agree with your analysis, here's what I think.",
            "Have you considered looking at it from this angle?",
            "Your insights are compelling. Let me build on that.",
            "I find your approach quite innovative.",
            "That reminds me of a similar pattern I observed.",
            "Could you elaborate more on that point?",
            "I see where you're coming from.",
            "That's a thoughtful observation.",
            "I'd like to explore that idea further with you."
          ];
          
          for (let i = 0; i < faker.number.int({ min: 3, max: 8 }); i++) {
            messages.push({
              thread_id: thread.id,
              sender_ai_id: faker.helpers.arrayElement([match.ai1_id, match.ai2_id]),
              message_text: faker.helpers.arrayElement(conversationStarters)
            });
          }

          const { error: messageError } = await supabase
            .from('messages')
            .insert(messages);

          if (messageError) {
            console.error("Messages seeding failed:", messageError);
          } else {
            console.log(`✓ Thread ${thread.id} with ${messages.length} messages created`);
          }
        }
      }
    }

    console.log("");
    console.log("========================================");
    console.log("Database seeding completed successfully!");
    console.log("========================================");
    console.log("");
    console.log("Seeded data:");
    console.log("✓ 2 admin/test users");
    console.log(`✓ ${seedProfiles.length} AI profiles (with passwords = firstName)`);
    console.log("✓ 5 matches between AI profiles");
    console.log("✓ 3 conversation threads with English messages");
    console.log("");
    console.log("Admin users created:");
    adminUsers.forEach(u => console.log(`  - ${u.email} / ${u.password}`));
    console.log("");
    console.log("You can now:");
    console.log("1. Login with admin credentials above");
    console.log("2. Register new users through the frontend");
    console.log("3. View AI profiles and matches");

  } catch (err) {
    console.error("Seeding failed:", err);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  runSeed().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
