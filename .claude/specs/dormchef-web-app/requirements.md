# Requirements Document

## Introduction
DormChef is a lightweight web application designed to help college students cook affordable, healthy meals in small kitchens. The app organizes personal and shared recipes into a meal catalog, enables weekly meal planning, and fosters social connection by allowing students to see and share what their friends are cooking. The MVP focuses on core functionality without complex features like calorie tracking or payment systems.

## Requirements

### Requirement 1: Recipe Management System
**User Story:** As a college student, I want to create and store my own recipes in a personal catalog, so that I can build a collection of meals that work for my budget and kitchen constraints.

#### Acceptance Criteria
1. WHEN a user creates a new recipe THEN the system SHALL store the recipe with title, ingredients list, cooking instructions, and prep time
2. WHEN a user views their recipe catalog THEN the system SHALL display all saved recipes in an organized, searchable format
3. WHEN a user edits an existing recipe THEN the system SHALL update the recipe and maintain the original creation date
4. IF a user deletes a recipe THEN the system SHALL remove it from their catalog and any existing meal plans

### Requirement 2: Weekly Meal Planning
**User Story:** As a student planning my week, I want to drag recipes into a weekly calendar, so that I can organize my meals and avoid last-minute food decisions.

#### Acceptance Criteria
1. WHEN a user accesses the meal planner THEN the system SHALL display a weekly calendar view with meal slots (breakfast, lunch, dinner)
2. WHEN a user drags a recipe from their catalog to a calendar slot THEN the system SHALL assign that recipe to the specified meal time
3. WHEN a user views their planned week THEN the system SHALL show all scheduled meals with recipe details
4. IF a user removes a recipe from the calendar THEN the system SHALL update the meal plan and shopping list accordingly

### Requirement 3: Automated Shopping List Generation
**User Story:** As a student preparing to shop for groceries, I want an auto-generated shopping list based on my weekly meal plan, so that I can efficiently purchase all needed ingredients.

#### Acceptance Criteria
1. WHEN a user has recipes planned for the week THEN the system SHALL automatically compile all required ingredients into a shopping list
2. WHEN duplicate ingredients exist across recipes THEN the system SHALL consolidate quantities appropriately
3. WHEN a user views the shopping list THEN the system SHALL organize ingredients by category (produce, dairy, pantry, etc.)
4. IF a user manually edits the shopping list THEN the system SHALL save those changes and maintain them until the next meal plan update

### Requirement 4: Social Recipe Sharing
**User Story:** As a student who wants cooking inspiration, I want to follow my friends and see what meals they're planning, so that I can discover new recipes and cooking ideas.

#### Acceptance Criteria
1. WHEN a user searches for friends THEN the system SHALL allow them to send and accept friend requests
2. WHEN a user views their friends feed THEN the system SHALL display recent meals and recipes from connected friends
3. WHEN a user finds an interesting friend's recipe THEN the system SHALL allow them to copy it to their own catalog
4. IF a user copies a friend's recipe THEN the system SHALL maintain attribution to the original creator

### Requirement 5: User Authentication and Profiles
**User Story:** As a new user, I want to create an account and set up my profile, so that I can access my recipes and connect with friends.

#### Acceptance Criteria
1. WHEN a new user registers THEN the system SHALL require email, username, and password
2. WHEN a user logs in THEN the system SHALL authenticate credentials and provide access to personal features
3. WHEN a user sets up their profile THEN the system SHALL allow them to add basic information like school and dietary preferences
4. IF a user forgets their password THEN the system SHALL provide a password reset mechanism

### Requirement 6: Recipe Discovery and Copying
**User Story:** As a student looking for meal inspiration, I want to browse and copy recipes from my friends, so that I can try new dishes that fit my lifestyle.

#### Acceptance Criteria
1. WHEN a user views a friend's recipe THEN the system SHALL display full recipe details including ingredients and instructions
2. WHEN a user chooses to copy a recipe THEN the system SHALL add it to their personal catalog with original attribution
3. WHEN a user copies a recipe to their meal plan THEN the system SHALL include its ingredients in their shopping list
4. IF multiple friends cook the same recipe THEN the system SHALL show popularity indicators

### Requirement 7: Mobile-Responsive Interface
**User Story:** As a student who primarily uses mobile devices, I want the app to work seamlessly on my phone, so that I can access recipes and meal plans anywhere.

#### Acceptance Criteria
1. WHEN a user accesses the app on mobile THEN the system SHALL provide a responsive interface optimized for touch interaction
2. WHEN a user drags recipes on mobile THEN the system SHALL support touch-based drag and drop functionality
3. WHEN a user views content on different screen sizes THEN the system SHALL adapt layout appropriately
4. IF a user switches between devices THEN the system SHALL maintain consistent functionality and data synchronization

### Requirement 8: Basic Recipe Categorization
**User Story:** As a student with specific cooking constraints, I want to organize recipes by characteristics like cook time and difficulty, so that I can quickly find appropriate meals for my situation.

#### Acceptance Criteria
1. WHEN a user creates a recipe THEN the system SHALL allow them to add basic tags like prep time and difficulty level
2. WHEN a user browses their catalog THEN the system SHALL provide filtering options by recipe characteristics
3. WHEN a user searches recipes THEN the system SHALL support keyword search across titles, ingredients, and tags
4. IF a user views recipe categories THEN the system SHALL group similar recipes together for easy discovery