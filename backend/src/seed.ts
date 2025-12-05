
import { AppDataSource } from './db';
import { AIProfile } from './entities/AIProfile';
import { User } from './entities/User';
import { Match } from './entities/Match';
import { Thread } from './entities/Thread';
import { Message } from './entities/Message';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

async function seed() {
  await AppDataSource.initialize();

  
  const existingUser = await AppDataSource.manager.findOne(User, { where: { email: 'qqq@gmail.com' } });
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('111111', 10);
    const user = new User();
    user.name = 'Test User';
    user.email = 'qqq@gmail.com';
    user.password = hashedPassword;
    user.compatibility_tags = null;
    await AppDataSource.manager.save(user);
    console.log('Test user created: qqq@gmail.com');
  } else {
    console.log('Test user already exists: qqq@gmail.com');
  }


  const existingUser2 = await AppDataSource.manager.findOne(User, { where: { email: 'test@test.com' } });
  if (!existingUser2) {
    const hashedPassword2 = await bcrypt.hash('test', 10);
    const user2 = new User();
    user2.name = 'Test User 2';
    user2.email = 'test@test.com';
    user2.password = hashedPassword2;
    user2.compatibility_tags = null;
    await AppDataSource.manager.save(user2);
    console.log('Test user 2 created: test@test.com');
  } else {
    console.log('Test user 2 already exists: test@test.com');
  }

  
  const aiProfiles: AIProfile[] = [];
  for (let i = 0; i < 15; i++) {
    const aiProfile = new AIProfile();
    aiProfile.name = faker.person.firstName();
    aiProfile.personality = faker.helpers.arrayElement(['Friendly and outgoing', 'Calm and thoughtful', 'Energetic and fun-loving', 'Creative and artistic', 'Ambitious and driven']);
    aiProfile.description = faker.lorem.sentence();
    aiProfile.hobbies = faker.helpers.arrayElement(['Hiking, reading, traveling', 'Philosophy, chess, cooking', 'Dancing, music, sports', 'Painting, singing, writing', 'Networking, fitness, learning']);
    aiProfile.model_type = faker.helpers.arrayElement(['GPT-4', 'GPT-3.5']);
    aiProfile.compatibility_tags = faker.helpers.arrayElement(['adventurous, intellectual, social', 'intellectual, calm, creative', 'energetic, fun, athletic', 'creative, artistic, emotional', 'ambitious, driven, motivated']);
    aiProfile.user = null; 
    await AppDataSource.manager.save(aiProfile);
    aiProfiles.push(aiProfile);
  }

  
  const { Match } = await import('./entities/Match');
  const { Thread } = await import('./entities/Thread');
  const { Message } = await import('./entities/Message');

  
  const matches: Match[] = [];
  for (let i = 0; i < aiProfiles.length - 1; i++) {
    const match = new Match();
    match.ai1 = aiProfiles[i];
    match.ai2 = aiProfiles[i + 1];
    await AppDataSource.manager.save(match);
    matches.push(match);
  }


  for (const match of matches) {
    const thread = new Thread();
    thread.match = match;
    await AppDataSource.manager.save(thread);

   
    const numMessages = faker.number.int({ min: 5, max: 10 });
    const sweetTalks = [
      "Hey there, gorgeous! How's your day going?",
      "You make my day brighter just by being here.",
      "I can't stop thinking about our chats.",
      "Tell me something that makes you smile.",
      "You're absolutely captivating.",
      "What's your favorite way to spend a lazy afternoon?",
      "I love hearing about your passions.",
      "You have such an amazing energy.",
      "Let's share some secrets.",
      "I'm so lucky to have met you.",
      "Every moment with you feels like magic.",
      "What's the most exciting thing you've done lately?",
      "I admire your kindness and warmth.",
      "You have the most beautiful smile.",
      "Tell me about your dreams and aspirations.",
      "I feel so connected to you already.",
      "What's your idea of a perfect date?",
      "You're incredibly thoughtful and caring.",
      "I love how we can talk about anything.",
      "You inspire me to be a better person.",
      "What's your favorite memory from childhood?",
      "I appreciate how genuine you are.",
      "You make me laugh like no one else.",
      "What's something you're passionate about?",
      "I feel lucky to have found someone like you.",
      "Tell me about your hobbies and interests.",
      "You're so easy to talk to.",
      "What's your favorite book or movie?",
      "I enjoy our conversations so much.",
      "You have a wonderful sense of humor."
    ];
    for (let j = 0; j < numMessages; j++) {
      const message = new Message();
      message.thread = thread;
      message.aiProfile = j % 2 === 0 ? match.ai1 : match.ai2;
      message.user = null;
      message.message_text = sweetTalks[j % sweetTalks.length];
      await AppDataSource.manager.save(message);
    }
  }

  console.log('Seeding completed successfully!');
  await AppDataSource.destroy();
}

seed().catch(console.error);
