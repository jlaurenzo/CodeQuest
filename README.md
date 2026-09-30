# CodeQuest

A mobile programming tutorial game built with **React Native, Expo, and Firebase**.

CodeQuest helps students practice programming through lessons, questions, progression, XP, and the **Weekly Boss** system.

---

# 1. Getting Started

## Install Dependencies

```bash
npm install
```

## Start the Project

```bash
npx expo start
```

You can then open the project using:

* Expo Go
* Android Emulator
* Development Build
* iOS Simulator

For a clean Expo restart:

```bash
npx expo start -c
```

The main application screens are inside the:

```text
app/
```

directory.

CodeQuest uses **Expo Router**, so routes are based on the files inside the `app` folder.

---

# 2. Project Structure

The main folders used by the project are:

```text
CodeQuest
│
├── app/
│   ├── adminWeeklyBoss.jsx
│   ├── weeklybossHome.jsx
│   ├── weeklyboss.jsx
│   ├── weeklybosswin.jsx
│   ├── weeklybossloose.jsx
│   ├── settings.jsx
│   └── ...
│
├── services/
│   └── weeklyBossService.js
│
├── assets/
│   └── ...
│
├── firebase.js
├── package.json
└── README.md
```

---

# 3. Weekly Boss System

The Weekly Boss system gives students a special programming challenge that changes by week.

Admins can:

* Choose the boss for each programming language
* Create and edit questions
* Use multiple question types
* Automatically detect the current week
* Generate 10 test questions
* Save weekly boss content to Firebase

Students can:

* View their assigned boss
* Start the boss battle
* Answer programming questions
* Lose lives when answering incorrectly
* Defeat the boss
* Earn XP after completing the battle

The same boss can return in a different week with a completely different set of questions.

---

# 4. Existing Bosses

The project currently uses these bosses:

```text
Bug King
Syntax Serpent
Loop Lord
Logic Witch
```

Boss data includes:

```text
Boss ID
Boss Name
Maximum HP
Time Limit
Concept
Difficulty
Reward XP
Badge
Description
```

Current boss examples:

```text
Bug King
Concept: Debugging / finding errors
Difficulty: Easy

Syntax Serpent
Concept: Syntax and programming terms
Difficulty: Medium

Loop Lord
Concept: Loops and iteration
Difficulty: Medium

Logic Witch
Concept: Conditionals and logical expressions
Difficulty: Hard
```

---

# 5. Supported Programming Languages

The Weekly Boss system currently supports:

```text
JavaScript
Python
Java
```

Each language can have a different boss.

Example:

```text
JavaScript → Bug King
Python     → Loop Lord
Java       → Logic Witch
```

---

# 6. Supported Question Types

The admin system currently supports:

```text
1. Multiple Choice
2. Identification
3. Enumeration
4. Fill in the Blank
5. Finish the Code
6. Predict the Output
7. True / False
```

Internal question type names:

```text
multiple_choice
identification
enumeration
fill_blank
finish_code
code_output
true_false
```

---

# 7. Weekly Boss Admin Page

Admin route:

```text
/adminWeeklyBoss
```

Main file:

```text
app/adminWeeklyBoss.jsx
```

The normal workflow is:

```text
Current Week
      ↓
Programming Language
      ↓
Choose Boss
      ↓
Generate / Edit Questions
      ↓
Save Weekly Boss
```

The admin page is intended for administrators only.

---

# 8. Current Week Detection

The Weekly Boss system automatically determines the current week.

Example:

```text
2026-W40
```

The admin page includes:

```text
SCAN
```

The `SCAN` button recalculates the current week.

Admins do not need to manually type the week ID.

---

# 9. Generate 10 Test Questions

The admin page includes:

```text
GENERATE 10 TEST QUESTIONS
```

Workflow:

```text
Select Language
      ↓
Generate 10 Test Questions
      ↓
Review Questions
      ↓
Edit Questions
      ↓
Save Weekly Boss
```

The generated questions are placed only inside the admin editor.

They are **not written to Firebase immediately**.

They are saved to Firebase only after:

```text
SAVE WEEKLY BOSS
```

This allows admins to review and edit the questions before publishing them.

---

# 10. Accepted Answers

Text-based questions use the:

```text
ACCEPTED ANSWERS
```

field.

Use one accepted answer per line.

Example:

```text
string
number
boolean
```

This is used for:

```text
Identification
Enumeration
Fill in the Blank
Finish the Code
Predict the Output
```

For **Multiple Choice**, select the correct option.

For **True / False**, select:

```text
True
```

or

```text
False
```

The system checks the student's answer against the saved accepted answers.

---

# 11. Making an Account an Admin

Admin access is controlled through the user's Firestore document.

Go to:

```text
Firebase Console
→ Firestore Database
→ users
```

Find the user's document.

The document ID must match the user's Firebase Authentication UID.

Add:

```text
role: "admin"
```

Example:

```text
users
└── USER_UID
    ├── name: "Josh"
    ├── programmingLanguage: "JavaScript"
    └── role: "admin"
```

The application also supports:

```text
isAdmin: true
```

However, for the team, use:

```text
role: "admin"
```

as the standard method.

---

# 12. Finding a User UID

Go to:

```text
Firebase Console
→ Authentication
→ Users
```

Find the user's account and copy the:

```text
User UID
```

Then go to:

```text
Firestore Database
→ users
```

Create or open the document using that UID.

Example:

```text
users
└── ABC123456
```

Then add:

```text
role: "admin"
```

---

# 13. Accessing the Admin Page

After giving the account admin access:

```text
role: "admin"
```

the user should:

```text
1. Log out
2. Log back in
3. Open Settings
```

The Settings page should show:

```text
Administration
```

Then open:

```text
Administration
→ Weekly Boss Administration
```

This opens:

```text
/adminWeeklyBoss
```

---

# 14. Firestore Security Rules

The application admin check and Firestore permissions are separate.

The application checks whether the user is an admin, but Firebase Security Rules must also allow the correct access.

Go to:

```text
Firebase Console
→ Firestore Database
→ Rules
```

Use:

```javascript
rules_version = '2';

service cloud.firestore {

  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn()
        && (
          get(
            /databases/$(database)/documents/users/$(request.auth.uid)
          ).data.role == "admin"
          ||
          get(
            /databases/$(database)/documents/users/$(request.auth.uid)
          ).data.isAdmin == true
        );
    }

    function isOwner(userId) {
      return isSignedIn()
        && request.auth.uid == userId;
    }

    match /users/{userId} {

      allow read: if isOwner(userId) || isAdmin();

      allow create: if isOwner(userId);

      allow update: if isOwner(userId) || isAdmin();

      allow delete: if isOwner(userId) || isAdmin();

      match /weeklyBoss/{weekId} {

        allow read: if isOwner(userId) || isAdmin();

        allow create: if isOwner(userId) || isAdmin();

        allow update: if isOwner(userId) || isAdmin();

        allow delete: if isOwner(userId) || isAdmin();
      }
    }

    match /weeklyChallenges/{weekId} {

      allow read: if isSignedIn();

      allow create, update, delete: if isAdmin();
    }

    match /questions/{questionId} {

      allow read: if isSignedIn()
        && (
          isAdmin()
          || resource.data.active == true
        );

      allow create, update, delete: if isAdmin();
    }

    match /bosses/{bossId} {

      allow read: if isSignedIn();

      allow create, update, delete: if isAdmin();
    }
  }
}
```

After changing the rules, click:

```text
Publish
```

---

# 15. Firestore Collections

The Weekly Boss system uses these main collections:

```text
users
weeklyChallenges
questions
bosses
```

## Weekly Challenge

Example:

```text
weeklyChallenges
└── 2026-W40
    ├── weekId: "2026-W40"
    ├── active: true
    └── bosses
        ├── javascript: "bugKing"
        ├── python: "loopLord"
        └── java: "logicWitch"
```

## Questions

Questions contain information such as:

```text
bossId
weekId
language
questionNumber
type
active
```

Depending on the question type, they may also contain:

```text
options
correctAnswer
answers
expectedOutput
```

## Student Weekly Boss Attempt

A student's attempt is stored under:

```text
users
└── USER_UID
    └── weeklyBoss
        └── CURRENT_WEEK_ID
```

Example:

```text
users
└── ABC123
    └── weeklyBoss
        └── 2026-W40
```

The attempt stores battle-related information such as:

```text
status
currentHP
maxHP
lives
combo
highestCombo
correctAnswers
wrongAnswers
questionIds
xpAwarded
startedAt
```

Active attempts use:

```text
status: "active"
```

Older data may use:

```text
status: "in_progress"
```

The battle screens support both values.

---

# 16. Student Weekly Boss Flow

A normal student flow is:

```text
Home
   ↓
Weekly Boss
   ↓
View Assigned Boss
   ↓
Start Battle
   ↓
Answer Questions
   ↓
Boss HP Reaches 0
   ↓
Weekly Boss Win
   ↓
XP Reward
```

If the student loses all available lives:

```text
Answer Questions
      ↓
Lives Reach 0
      ↓
Weekly Boss Lose
```

---

# 17. Testing the Weekly Boss

## Admin Testing

Go to:

```text
Settings
→ Administration
→ Weekly Boss Administration
```

Then:

```text
1. Check the current week
2. Select a programming language
3. Select a boss
4. Press GENERATE 10 TEST QUESTIONS
5. Review the generated questions
6. Edit anything necessary
7. Press SAVE WEEKLY BOSS
```

## Student Testing

Log in using a normal student account.

Make sure the account has a programming language:

```text
JavaScript
Python
Java
```

Then go to:

```text
Home
→ Weekly Boss
```

The student should see the boss assigned to their selected programming language.

---

# 18. Reset Weekly Boss for Testing

For testing, the Weekly Boss Home page includes a:

```text
RESET WEEKLY BOSS FOR TESTING
```

button.

This deletes only the current student's Weekly Boss attempt for the current week.

It does **not** delete:

```text
weeklyChallenges
questions
bosses
```

It only removes:

```text
users/{USER_UID}/weeklyBoss/{CURRENT_WEEK_ID}
```

After resetting, the student can start a fresh Weekly Boss attempt.

You can also manually delete the attempt from Firebase:

```text
Firebase Console
→ Firestore Database
→ users
→ USER_UID
→ weeklyBoss
→ CURRENT_WEEK_ID
```

Delete only the current week's attempt document.

---

# 19. Important Testing Notes

A Weekly Boss attempt stores the IDs of the questions it is using.

Because of this, avoid replacing the question set while a student is actively testing an existing attempt.

For clean testing, use:

```text
Reset Student Attempt
        ↓
Save New Weekly Boss Questions
        ↓
Start Weekly Boss Again
```

If questions were replaced and the student still has an old attempt, reset the attempt before starting again.

---

# 20. Possible Firestore Index Requirement

Some Weekly Boss queries may require a Firebase composite index.

If Firebase shows an error saying that an index is required, Firebase normally provides a link to create the required index.

Follow the Firebase-provided link and create the index.

This may happen when querying questions using multiple fields such as:

```text
bossId
weekId
language
active
```

---

# 21. Main Weekly Boss Files

The main Weekly Boss files are:

```text
app/adminWeeklyBoss.jsx
app/weeklybossHome.jsx
app/weeklyboss.jsx
app/weeklybosswin.jsx
app/weeklybossloose.jsx
services/weeklyBossService.js
```

Admin access is also connected to:

```text
app/settings.jsx
```

---

# 22. Responsibilities

## Admin

Admins can:

```text
Configure Weekly Bosses
Choose bosses
Create questions
Edit questions
Generate test questions
Save weekly content
Manage the Weekly Boss configuration
```

## Student

Students can:

```text
View the active Weekly Boss
View active questions
Start the battle
Answer questions
Lose lives
Defeat the boss
Receive XP rewards
```

Students cannot modify Weekly Boss configuration.

---

# 23. Quick Setup for Team Members

After cloning the project:

```text
1. Install dependencies

2. Connect the project to the correct Firebase project

3. Make sure Firebase Authentication is configured

4. Make sure the team member's Firebase account exists

5. Create or find users/{UID}

6. Add role: "admin" if administrative access is needed

7. Publish the Firestore Security Rules

8. Start the application

9. Open Settings

10. Open Administration

11. Open Weekly Boss Administration
```

Run the project with:

```bash
npm install
npx expo start
```

For a clean restart:

```bash
npx expo start -c
```

---

# 24. Weekly Boss Workflow

The complete system flow is:

```text
ADMIN
  ↓
Detect Current Week
  ↓
Choose Language
  ↓
Choose Existing Boss
  ↓
Generate or Create Questions
  ↓
Edit Questions
  ↓
Save Weekly Boss
  ↓
FIREBASE
  ↓
STUDENT
  ↓
Open Weekly Boss
  ↓
Load Assigned Boss
  ↓
Load Questions
  ↓
Start Battle
  ↓
Answer Questions
  ↓
WIN / LOSE
  ↓
XP Reward
```

---

# 25. Current Weekly Boss Design

The Weekly Boss system is designed so that:

```text
Same Boss
    +
New Week
    +
New Questions
    =
New Weekly Challenge
```

For example:

```text
Week 40
JavaScript → Bug King
Questions Set A

Week 41
JavaScript → Bug King
Questions Set B
```

The boss can remain the same while the questions change every week.

---

# 26. Notes for the Team

When working on Weekly Boss features:

```text
Do not replace another teammate's UI unnecessarily.

Do not change the Firebase collection structure without informing the team.

Reset the student's current Weekly Boss attempt when testing a new question set.

Use role: "admin" for standard admin accounts.

Use npx expo start -c when testing after major route or caching changes.
```

---

# End of README

CodeQuest is an Expo + React Native programming learning game with Firebase backend services and a configurable Weekly Boss system for recurring programming challenges.
