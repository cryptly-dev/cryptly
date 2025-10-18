const ADJECTIVES = [
  'happy',
  'cheerful',
  'excited',
  'playful',
  'curious',
  'energetic',
  'friendly',
  'jolly',
  'bright',
  'swift',
];

const ANIMALS = [
  'koala',
  'kangaroo',
  'capybara',
  'penguin',
  'otter',
  'panda',
  'dolphin',
  'raccoon',
  'sloth',
  'hedgehog',
];

function generateRandomDisplayName() {
  const randomAdjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${randomAdjective} ${randomAnimal}`;
}

module.exports = {
  async up(db) {
    const users = await db.collection('users').find({}).toArray();

    for (const user of users) {
      const displayName = generateRandomDisplayName();
      await db.collection('users').updateOne({ _id: user._id }, { $set: { displayName } });
    }
  },

  async down(db) {},
};
