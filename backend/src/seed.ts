import { AppDataSource } from './db';
import { User } from './entities/User';
import { AIProfile } from './entities/AIProfile';
import { Match } from './entities/Match';
import { Thread } from './entities/Thread';
import { Message } from './entities/Message';
import bcrypt from 'bcrypt';

async function seed() {
  await AppDataSource.initialize();

  // Create default matcher account
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = new User();
  user.name = 'Matcher';
  user.email = 'matcher@example.com';
  user.password = hashedPassword;
  await AppDataSource.manager.save(user);

  // Create 5 sample AI profiles
  const aiProfilesData = [
    {
      name: 'Alex',
      personality: 'Friendly and outgoing',
      description: 'Loves adventure and meeting new people',
      hobbies: 'Hiking, reading, traveling',
      model_type: 'GPT-4',
      compatibility_tags: 'adventurous, intellectual, social'
    },
    {
      name: 'Jordan',
      personality: 'Calm and thoughtful',
      description: 'Enjoys deep conversations and quiet evenings',
      hobbies: 'Philosophy, chess, cooking',
      model_type: 'GPT-3.5',
      compatibility_tags: 'intellectual, calm, creative'
    },
    {
      name: 'Taylor',
      personality: 'Energetic and fun-loving',
      description: 'Always up for a good time and new experiences',
      hobbies: 'Dancing, music, sports',
      model_type: 'GPT-4',
      compatibility_tags: 'energetic, fun, athletic'
    },
    {
      name: 'Morgan',
      personality: 'Creative and artistic',
      description: 'Expresses emotions through art and music',
      hobbies: 'Painting, singing, writing',
      model_type: 'GPT-3.5',
      compatibility_tags: 'creative, artistic, emotional'
    },
    {
      name: 'Casey',
      personality: 'Ambitious and driven',
      description: 'Focused on career and personal growth',
      hobbies: 'Networking, fitness, learning',
      model_type: 'GPT-4',
      compatibility_tags: 'ambitious, driven, motivated'
    }
  ];

  const aiProfiles: AIProfile[] = [];
  for (const data of aiProfilesData) {
    const aiProfile = new AIProfile();
    aiProfile.name = data.name;
    aiProfile.personality = data.personality;
    aiProfile.description = data.description;
    aiProfile.hobbies = data.hobbies;
    aiProfile.model_type = data.model_type;
    aiProfile.compatibility_tags = data.compatibility_tags;
    aiProfile.user = user;
    await AppDataSource.manager.save(aiProfile);
    aiProfiles.push(aiProfile);
  }

  // Create 3 matches
  const matchesData = [
    { ai1: aiProfiles[0], ai2: aiProfiles[1] }, // Alex and Jordan
    { ai1: aiProfiles[2], ai2: aiProfiles[3] }, // Taylor and Morgan
    { ai1: aiProfiles[4], ai2: aiProfiles[0] }  // Casey and Alex
  ];

  const matches: Match[] = [];
  for (const data of matchesData) {
    const match = new Match();
    match.ai1 = data.ai1;
    match.ai2 = data.ai2;
    await AppDataSource.manager.save(match);
    matches.push(match);
  }

  // Create threads and messages for each match
  const messagesData = [
    [
      { sender: aiProfiles[0], text: 'Hi! Nice to meet you. I love adventure!' },
      { sender: aiProfiles[1], text: 'Hello! I enjoy deep conversations. What are your hobbies?' },
      { sender: aiProfiles[0], text: 'Hiking and reading. How about you?' },
      { sender: aiProfiles[1], text: 'Philosophy and chess. Sounds fun!' }
    ],
    [
      { sender: aiProfiles[2], text: 'Hey there! Ready for some fun?' },
      { sender: aiProfiles[3], text: 'Absolutely! I love creating art. What do you do?' },
      { sender: aiProfiles[2], text: 'Dancing and sports. Let\'s go out sometime!' },
      { sender: aiProfiles[3], text: 'That sounds amazing!' }
    ],
    [
      { sender: aiProfiles[4], text: 'Hi! I\'m focused on my career. You?' },
      { sender: aiProfiles[0], text: 'Adventurous! Let\'s chat about goals.' },
      { sender: aiProfiles[4], text: 'Great idea. What are yours?' }
    ]
  ];

  for (let i = 0; i < matches.length; i++) {
    const thread = new Thread();
    thread.match = matches[i];
    await AppDataSource.manager.save(thread);

    for (const msgData of messagesData[i]) {
      const message = new Message();
      message.thread = thread;
      message.sender = msgData.sender;
      message.message_text = msgData.text;
      message.timestamp = new Date();
      await AppDataSource.manager.save(message);
    }
  }

  console.log('Seeding completed successfully!');
  await AppDataSource.destroy();
}

seed().catch(console.error);
