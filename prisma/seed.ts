import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alex@dormchef.com' },
      update: {},
      create: {
        email: 'alex@dormchef.com',
        username: 'alex_chef',
        displayName: 'Alex Martinez',
        school: 'University of California',
        dietaryRestrictions: ['Vegetarian'],
        image: hashedPassword, // Temporary password storage
      },
    }),
    prisma.user.upsert({
      where: { email: 'jordan@dormchef.com' },
      update: {},
      create: {
        email: 'jordan@dormchef.com',
        username: 'jordan_cook',
        displayName: 'Jordan Smith',
        school: 'Stanford University',
        dietaryRestrictions: ['Gluten-free', 'Dairy-free'],
        image: hashedPassword,
      },
    }),
    prisma.user.upsert({
      where: { email: 'sam@dormchef.com' },
      update: {},
      create: {
        email: 'sam@dormchef.com',
        username: 'sam_eats',
        displayName: 'Sam Johnson',
        school: 'UCLA',
        dietaryRestrictions: [],
        image: hashedPassword,
      },
    }),
  ]);

  console.log('✅ Created sample users');

  // Create sample recipes
  const recipes = await Promise.all([
    prisma.recipe.upsert({
      where: { id: 'recipe-1' },
      update: {},
      create: {
        id: 'recipe-1',
        title: 'Ultimate Dorm Room Ramen',
        description: 'Transform instant ramen into a gourmet meal with simple additions that fit in any dorm kitchen.',
        ingredients: [
          { name: 'Instant ramen noodles', amount: 1, unit: 'package', category: 'Pantry' },
          { name: 'Egg', amount: 1, unit: 'piece', category: 'Dairy' },
          { name: 'Green onions', amount: 2, unit: 'stalks', category: 'Produce' },
          { name: 'Sriracha sauce', amount: 1, unit: 'tablespoon', category: 'Condiments' },
          { name: 'Soy sauce', amount: 1, unit: 'teaspoon', category: 'Condiments' },
          { name: 'Sesame oil', amount: 0.5, unit: 'teaspoon', category: 'Condiments' }
        ],
        instructions: [
          'Boil water in a small pot or electric kettle',
          'Add ramen noodles and cook for 2 minutes',
          'Crack egg directly into the pot and stir gently',
          'Add flavor packet, soy sauce, and sriracha',
          'Cook for another minute until egg is set',
          'Remove from heat, add sesame oil and chopped green onions',
          'Serve hot and enjoy your upgraded ramen!'
        ],
        prepTime: 5,
        cookTime: 5,
        servings: 1,
        difficulty: 'Easy',
        tags: ['Quick', 'Cheap', 'Protein', 'Comfort Food'],
        authorId: users[0].id,
        isPublic: true,
      },
    }),
    prisma.recipe.upsert({
      where: { id: 'recipe-2' },
      update: {},
      create: {
        id: 'recipe-2',
        title: 'Microwave Mac and Cheese Upgrade',
        description: 'Turn boxed mac and cheese into a creamy, veggie-packed meal using only a microwave.',
        ingredients: [
          { name: 'Boxed mac and cheese', amount: 1, unit: 'box', category: 'Pantry' },
          { name: 'Frozen broccoli florets', amount: 0.5, unit: 'cup', category: 'Frozen' },
          { name: 'Greek yogurt', amount: 2, unit: 'tablespoons', category: 'Dairy' },
          { name: 'Shredded cheddar cheese', amount: 0.25, unit: 'cup', category: 'Dairy' },
          { name: 'Garlic powder', amount: 0.25, unit: 'teaspoon', category: 'Spices' },
          { name: 'Black pepper', amount: 1, unit: 'pinch', category: 'Spices' }
        ],
        instructions: [
          'Cook mac and cheese according to box directions in microwave',
          'Steam broccoli in microwave for 2 minutes in a covered bowl',
          'Mix cooked mac and cheese with Greek yogurt',
          'Add steamed broccoli and extra shredded cheese',
          'Season with garlic powder and black pepper',
          'Microwave for 30 seconds to melt cheese',
          'Stir well and serve immediately'
        ],
        prepTime: 3,
        cookTime: 8,
        servings: 2,
        difficulty: 'Easy',
        tags: ['Vegetarian', 'Microwave', 'Comfort Food', 'Quick'],
        authorId: users[0].id,
        isPublic: true,
      },
    }),
    prisma.recipe.upsert({
      where: { id: 'recipe-3' },
      update: {},
      create: {
        id: 'recipe-3',
        title: 'No-Cook Chickpea Salad Wrap',
        description: 'A protein-packed, no-cooking-required meal perfect for busy students.',
        ingredients: [
          { name: 'Canned chickpeas', amount: 1, unit: 'can', category: 'Pantry' },
          { name: 'Whole wheat tortilla', amount: 2, unit: 'pieces', category: 'Bread' },
          { name: 'Cucumber', amount: 0.5, unit: 'medium', category: 'Produce' },
          { name: 'Tomato', amount: 1, unit: 'medium', category: 'Produce' },
          { name: 'Red onion', amount: 0.25, unit: 'small', category: 'Produce' },
          { name: 'Lemon juice', amount: 2, unit: 'tablespoons', category: 'Produce' },
          { name: 'Olive oil', amount: 1, unit: 'tablespoon', category: 'Condiments' },
          { name: 'Hummus', amount: 4, unit: 'tablespoons', category: 'Condiments' }
        ],
        instructions: [
          'Drain and rinse chickpeas, then mash lightly with a fork',
          'Dice cucumber, tomato, and red onion',
          'Mix chickpeas with vegetables, lemon juice, and olive oil',
          'Season with salt and pepper to taste',
          'Spread hummus on tortillas',
          'Add chickpea mixture to center of each tortilla',
          'Wrap tightly and slice in half to serve'
        ],
        prepTime: 10,
        cookTime: 0,
        servings: 2,
        difficulty: 'Easy',
        tags: ['Vegetarian', 'No-Cook', 'Healthy', 'Protein', 'Quick'],
        authorId: users[1].id,
        isPublic: true,
      },
    }),
    prisma.recipe.upsert({
      where: { id: 'recipe-4' },
      update: {},
      create: {
        id: 'recipe-4',
        title: 'Simple Protein Smoothie Bowl',
        description: 'A nutritious breakfast that requires no cooking and provides energy for the whole morning.',
        ingredients: [
          { name: 'Frozen banana', amount: 1, unit: 'medium', category: 'Frozen' },
          { name: 'Greek yogurt', amount: 0.75, unit: 'cup', category: 'Dairy' },
          { name: 'Protein powder', amount: 1, unit: 'scoop', category: 'Pantry' },
          { name: 'Milk of choice', amount: 0.25, unit: 'cup', category: 'Dairy' },
          { name: 'Granola', amount: 0.25, unit: 'cup', category: 'Pantry' },
          { name: 'Fresh berries', amount: 0.5, unit: 'cup', category: 'Produce' },
          { name: 'Honey', amount: 1, unit: 'tablespoon', category: 'Condiments' }
        ],
        instructions: [
          'Blend frozen banana, Greek yogurt, protein powder, and milk until smooth',
          'Pour smoothie mixture into a bowl',
          'Top with granola, fresh berries, and a drizzle of honey',
          'Add any other desired toppings like nuts or seeds',
          'Serve immediately with a spoon'
        ],
        prepTime: 5,
        cookTime: 0,
        servings: 1,
        difficulty: 'Easy',
        tags: ['Healthy', 'Breakfast', 'Protein', 'No-Cook', 'Quick'],
        authorId: users[1].id,
        isPublic: true,
      },
    }),
    prisma.recipe.upsert({
      where: { id: 'recipe-5' },
      update: {},
      create: {
        id: 'recipe-5',
        title: 'Dorm-Friendly Quesadilla',
        description: 'Crispy, cheesy quesadillas made with minimal equipment and maximum flavor.',
        ingredients: [
          { name: 'Flour tortillas', amount: 2, unit: 'large', category: 'Bread' },
          { name: 'Shredded cheese', amount: 1, unit: 'cup', category: 'Dairy' },
          { name: 'Canned black beans', amount: 0.5, unit: 'cup', category: 'Pantry' },
          { name: 'Salsa', amount: 0.25, unit: 'cup', category: 'Condiments' },
          { name: 'Frozen corn', amount: 0.25, unit: 'cup', category: 'Frozen' },
          { name: 'Cumin', amount: 0.25, unit: 'teaspoon', category: 'Spices' },
          { name: 'Sour cream', amount: 2, unit: 'tablespoons', category: 'Dairy' }
        ],
        instructions: [
          'Drain and rinse black beans, mix with corn and cumin',
          'Place filling on one half of each tortilla',
          'Add cheese and a spoonful of salsa',
          'Fold tortilla in half to create half-moon shape',
          'Cook in a pan or panini press for 2-3 minutes per side',
          'Cut into triangles and serve with sour cream',
          'Can also be made in a toaster oven!'
        ],
        prepTime: 5,
        cookTime: 6,
        servings: 2,
        difficulty: 'Easy',
        tags: ['Vegetarian', 'Quick', 'Cheese', 'Comfort Food'],
        authorId: users[2].id,
        isPublic: true,
      },
    }),
  ]);

  console.log('✅ Created sample recipes');

  // Create a sample meal plan
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of current week

  const mealPlan = await prisma.mealPlan.upsert({
    where: {
      userId_weekStartDate: {
        userId: users[0].id,
        weekStartDate: weekStart,
      },
    },
    update: {},
    create: {
      userId: users[0].id,
      weekStartDate: weekStart,
      meals: {
        create: [
          {
            day: 1, // Monday
            mealType: 'breakfast',
            recipeId: recipes[3].id, // Smoothie Bowl
          },
          {
            day: 1, // Monday
            mealType: 'lunch',
            recipeId: recipes[2].id, // Chickpea Wrap
          },
          {
            day: 1, // Monday
            mealType: 'dinner',
            recipeId: recipes[0].id, // Ramen
          },
          {
            day: 2, // Tuesday
            mealType: 'lunch',
            recipeId: recipes[4].id, // Quesadilla
          },
          {
            day: 2, // Tuesday
            mealType: 'dinner',
            recipeId: recipes[1].id, // Mac and Cheese
          },
        ],
      },
    },
  });

  console.log('✅ Created sample meal plan');

  // Create sample friendships
  const friendships = await Promise.all([
    prisma.friendship.upsert({
      where: {
        requesterId_addresseeId: {
          requesterId: users[0].id,
          addresseeId: users[1].id,
        },
      },
      update: {},
      create: {
        requesterId: users[0].id,
        addresseeId: users[1].id,
        status: 'accepted',
      },
    }),
    prisma.friendship.upsert({
      where: {
        requesterId_addresseeId: {
          requesterId: users[1].id,
          addresseeId: users[2].id,
        },
      },
      update: {},
      create: {
        requesterId: users[1].id,
        addresseeId: users[2].id,
        status: 'accepted',
      },
    }),
    prisma.friendship.upsert({
      where: {
        requesterId_addresseeId: {
          requesterId: users[0].id,
          addresseeId: users[2].id,
        },
      },
      update: {},
      create: {
        requesterId: users[0].id,
        addresseeId: users[2].id,
        status: 'pending',
      },
    }),
  ]);

  console.log('✅ Created sample friendships');

  console.log('🎉 Database seed completed successfully!');
  console.log(`Created ${users.length} users, ${recipes.length} recipes, 1 meal plan, and ${friendships.length} friendships`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });