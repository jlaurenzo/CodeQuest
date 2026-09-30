import {
    useEffect,
    useState,
} from "react";

import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { useRouter } from "expo-router";

import {
    FALLBACK_BOSSES,
    LANGUAGES,
    QUESTION_TYPES,
    getWeekId,
    loadAdminBossContent,
    saveWeeklyBossContent,
} from "../services/weeklyBossService";

const LANGUAGE_KEYS = [
  "javascript",
  "python",
  "java",
];

const BOSS_KEYS = Object.keys(
  FALLBACK_BOSSES,
);

const QUESTION_TYPE_LABELS = {
  [QUESTION_TYPES.MULTIPLE_CHOICE]:
    "Multiple Choice",

  [QUESTION_TYPES.IDENTIFICATION]:
    "Identification",

  [QUESTION_TYPES.ENUMERATION]:
    "Enumeration",

  [QUESTION_TYPES.FILL_BLANK]:
    "Fill in the Blank",

  [QUESTION_TYPES.FINISH_CODE]:
    "Finish the Code",

  [QUESTION_TYPES.CODE_OUTPUT]:
    "Predict Output",

  [QUESTION_TYPES.TRUE_FALSE]:
    "True / False",
};

function createEmptyQuestion() {
  return {
    type:
      QUESTION_TYPES.MULTIPLE_CHOICE,

    question: "",

    code: "",

    options: [
      "",
      "",
      "",
      "",
    ],

    correctAnswer: 0,

    answersText: "",

    explanation: "",
  };
}

function generateTestQuestions(
  language,
) {
  if (language === "javascript") {
    return [
      {
        type:
          QUESTION_TYPES.MULTIPLE_CHOICE,

        question:
          "Which keyword declares a block-scoped variable in JavaScript?",

        code: "",

        options: [
          "let",
          "int",
          "define",
          "varType",
        ],

        correctAnswer: 0,

        answersText: "",

        explanation:
          "The let keyword declares a block-scoped variable.",
      },

      {
        type:
          QUESTION_TYPES.TRUE_FALSE,

        question:
          "The === operator checks both value and type.",

        code: "",

        options: [
          "True",
          "False",
        ],

        correctAnswer: 0,

        answersText: "",

        explanation:
          "Strict equality checks both value and type.",
      },

      {
        type:
          QUESTION_TYPES.IDENTIFICATION,

        question:
          "What keyword is used to declare a function in JavaScript?",

        code: "",

        options: [
          "",
          "",
          "",
          "",
        ],

        correctAnswer: 0,

        answersText:
          "function",

        explanation:
          "The function keyword is used to declare a function.",
      },

      {
        type:
          QUESTION_TYPES.FILL_BLANK,

        question:
          "Complete the expression: console.log(2 + 3) prints ____.",

        code:
          "console.log(2 + 3);",

        options: [
          "",
          "",
          "",
          "",
        ],

        correctAnswer: 0,

        answersText:
          "5",

        explanation:
          "2 + 3 evaluates to 5.",
      },

      {
        type:
          QUESTION_TYPES.FINISH_CODE,

        question:
          "Complete the function so it returns the sum.",

        code:
          "function add(a, b) {\n    ______\n}",

        options: [
          "",
          "",
          "",
          "",
        ],

        correctAnswer: 0,

        answersText:
          "return a + b;",

        explanation:
          "The function must return a + b.",
      },

      {
        type:
          QUESTION_TYPES.CODE_OUTPUT,

        question:
          "What is the output?",

        code:
          "for (let i = 0; i < 3; i++) {\n    console.log(i);\n}",

        options: [
          "",
          "",
          "",
          "",
        ],

        correctAnswer: 0,

        answersText:
          "0\n1\n2",

        explanation:
          "The loop prints 0, 1, and 2.",
      },

      {
        type:
          QUESTION_TYPES.ENUMERATION,

        question:
          "Name these three JavaScript primitive data types.",

        code: "",

        options: [
          "",
          "",
          "",
          "",
        ],

        correctAnswer: 0,

        answersText:
          "string\nnumber\nboolean",

        explanation:
          "String, number, and boolean are JavaScript primitive types.",
      },

      {
        type:
          QUESTION_TYPES.MULTIPLE_CHOICE,

        question:
          "What is the first index of a JavaScript array?",

        code:
          "const fruits = ['Apple', 'Banana', 'Mango'];",

        options: [
          "0",
          "1",
          "-1",
          "3",
        ],

        correctAnswer: 0,

        answersText: "",

        explanation:
          "JavaScript arrays use zero-based indexing.",
      },

      {
        type:
          QUESTION_TYPES.FILL_BLANK,

        question:
          "The strict equality operator in JavaScript is ____.",

        code:
          "if (x ___ 10) { }",

        options: [
          "",
          "",
          "",
          "",
        ],

        correctAnswer: 0,

        answersText:
          "===",

        explanation:
          "=== performs strict equality comparison.",
      },

      {
        type:
          QUESTION_TYPES.TRUE_FALSE,

        question:
          "A variable declared with const can be reassigned to another value.",

        code: "",

        options: [
          "True",
          "False",
        ],

        correctAnswer: 1,

        answersText: "",

        explanation:
          "A const variable cannot be reassigned after initialization.",
      },
    ].map(
      (
        question,
        index,
      ) => ({
        ...question,

        questionNumber:
          index + 1,

        active: true,
      }),
    );
  }

  if (language === "python") {
    return [
      {
        type:
          QUESTION_TYPES.MULTIPLE_CHOICE,

        question:
          "Which keyword is used to define a function in Python?",

        code: "",

        options: [
          "def",
          "function",
          "func",
          "define",
        ],

        correctAnswer: 0,

        answersText: "",

        explanation:
          "Python uses the def keyword to define functions.",
      },

      {
        type:
          QUESTION_TYPES.TRUE_FALSE,

        question:
          "Python lists are mutable.",

        code: "",

        options: [
          "True",
          "False",
        ],

        correctAnswer: 0,

        answersText: "",

        explanation:
          "List elements can be changed after the list is created.",
      },

      {
        type:
          QUESTION_TYPES.IDENTIFICATION,

        question:
          "What is used to define code blocks in Python?",

        code: "",

        options: [
          "",
          "",
          "",
          "",
        ],

        correctAnswer: 0,

        answersText:
          "indentation",

        explanation:
          "Python uses indentation to define blocks of code.",
      },

      {
        type:
          QUESTION_TYPES.FILL_BLANK,

        question:
          "Complete the statement used to display text.",

        code:
          "_____('Hello World')",

        options: [
          "",
          "",
          "",
          "",
        ],

        correctAnswer: 0,

        answersText:
          "print",

        explanation:
          "The print() function displays output.",
      },

      {
        type:
          QUESTION_TYPES.FINISH_CODE,

        question:
          "Complete the function so it returns the sum.",

        code:
          "def add(a, b):\n    ______",

        options: [
          "",
          "",
          "",
          "",
        ],

        correctAnswer: 0,

        answersText:
          "return a + b",

        explanation:
          "The function returns a + b.",
      },

      {
        type:
          QUESTION_TYPES.CODE_OUTPUT,

        question:
          "What will this code print?",

        code:
          "for i in range(3):\n    print(i)",

        options: [
          "",
          "",
          "",
          "",
        ],

        correctAnswer: 0,

        answersText:
          "0\n1\n2",

        explanation:
          "range(3) produces 0, 1, and 2.",
      },

      {
        type:
          QUESTION_TYPES.ENUMERATION,

        question:
          "Name these three Python collection types.",

        code: "",

        options: [
          "",
          "",
          "",
          "",
        ],

        correctAnswer: 0,

        answersText:
          "list\ntuple\ndictionary",

        explanation:
          "List, tuple, and dictionary are common Python collection types.",
      },

      {
        type:
          QUESTION_TYPES.MULTIPLE_CHOICE,

        question:
          "What is the result of len('Code')?",

        code:
          "len('Code')",

        options: [
          "3",
          "4",
          "5",
          "0",
        ],

        correctAnswer: 1,

        answersText: "",

        explanation:
          "The word Code contains four characters.",
      },

      {
        type:
          QUESTION_TYPES.FILL_BLANK,

        question:
          "Which operator checks whether two values are equal?",

        code:
          "if x ___ 10:",

        options: [
          "",
          "",
          "",
          "",
        ],

        correctAnswer: 0,

        answersText:
          "==",

        explanation:
          "The == operator checks equality.",
      },

      {
        type:
          QUESTION_TYPES.TRUE_FALSE,

        question:
          "Python requires curly braces to define a code block.",

        code: "",

        options: [
          "True",
          "False",
        ],

        correctAnswer: 1,

        answersText: "",

        explanation:
          "Python uses indentation instead of curly braces.",
      },
    ].map(
      (
        question,
        index,
      ) => ({
        ...question,

        questionNumber:
          index + 1,

        active: true,
      }),
    );
  }

  return [
    {
      type:
        QUESTION_TYPES.MULTIPLE_CHOICE,

      question:
        "Which keyword declares an integer variable in Java?",

      code: "",

      options: [
        "int",
        "integer",
        "num",
        "number",
      ],

      correctAnswer: 0,

      answersText: "",

      explanation:
        "The int keyword declares an integer variable.",
    },

    {
      type:
        QUESTION_TYPES.TRUE_FALSE,

      question:
        "In Java, == can compare primitive values.",

      code: "",

      options: [
        "True",
        "False",
      ],

      correctAnswer: 0,

      answersText: "",

      explanation:
        "The == operator compares primitive values.",
    },

    {
      type:
        QUESTION_TYPES.IDENTIFICATION,

      question:
        "What must a constructor have the same name as?",

      code: "",

      options: [
        "",
        "",
        "",
        "",
      ],

      correctAnswer: 0,

      answersText:
        "class",

      explanation:
        "A Java constructor has the same name as its class.",
    },

    {
      type:
        QUESTION_TYPES.FILL_BLANK,

      question:
        "Complete the Java output statement.",

      code:
        "System.out.____(\"Hello World\");",

      options: [
        "",
        "",
        "",
        "",
      ],

      correctAnswer: 0,

      answersText:
        "println",

      explanation:
        "println prints text followed by a new line.",
    },

    {
      type:
        QUESTION_TYPES.FINISH_CODE,

      question:
        "Complete the method so it returns the sum.",

      code:
        "static int add(int a, int b) {\n    ______\n}",

      options: [
        "",
        "",
        "",
        "",
      ],

      correctAnswer: 0,

      answersText:
        "return a + b;",

      explanation:
        "The method must return a + b.",
    },

    {
      type:
        QUESTION_TYPES.CODE_OUTPUT,

      question:
        "What will this program print?",

      code:
        "for (int i = 0; i < 3; i++) {\n    System.out.println(i);\n}",

      options: [
        "",
        "",
        "",
        "",
      ],

      correctAnswer: 0,

      answersText:
        "0\n1\n2",

      explanation:
        "The loop prints 0, 1, and 2.",
    },

    {
      type:
        QUESTION_TYPES.ENUMERATION,

      question:
        "Name the three Java access modifiers.",

      code: "",

      options: [
        "",
        "",
        "",
        "",
      ],

      correctAnswer: 0,

      answersText:
        "public\nprivate\nprotected",

      explanation:
        "Java provides public, private, and protected access modifiers.",
    },

    {
      type:
        QUESTION_TYPES.MULTIPLE_CHOICE,

      question:
        "Which of these is NOT a primitive data type in Java?",

      code: "",

      options: [
        "int",
        "double",
        "boolean",
        "String",
      ],

      correctAnswer: 3,

      answersText: "",

      explanation:
        "String is a class, not a primitive type.",
    },

    {
      type:
        QUESTION_TYPES.FILL_BLANK,

      question:
        "Which operator means greater than in Java?",

      code:
        "if (x ___ 10) { }",

      options: [
        "",
        "",
        "",
        "",
      ],

      correctAnswer: 0,

      answersText:
        ">",

      explanation:
        "The > operator checks whether the left value is greater.",
    },

    {
      type:
        QUESTION_TYPES.TRUE_FALSE,

      question:
        "A semicolon is commonly used to terminate Java statements.",

      code: "",

      options: [
        "True",
        "False",
      ],

      correctAnswer: 0,

      answersText: "",

      explanation:
        "Most Java statements end with a semicolon.",
    },
  ].map(
    (
      question,
      index,
    ) => ({
      ...question,

      questionNumber:
        index + 1,

      active: true,
    }),
  );
}

function getAcceptedAnswers(question) {
  const answers = [];

  if (
    typeof question.answersText ===
    "string"
  ) {
    answers.push(
      ...question.answersText
        .split("\n")
        .map(
          (answer) =>
            answer.trim(),
        )
        .filter(Boolean),
    );
  }

  if (
    Array.isArray(
      question.answers,
    )
  ) {
    answers.push(
      ...question.answers
        .map(
          (answer) =>
            String(
              answer ?? "",
            ).trim(),
        )
        .filter(Boolean),
    );
  }

  if (
    typeof question.expectedOutput ===
      "string" &&
    question.expectedOutput.trim()
  ) {
    answers.push(
      question.expectedOutput.trim(),
    );
  }

  return [
    ...new Set(answers),
  ];
}

export default function AdminWeeklyBoss() {
  const router = useRouter();

  const [weekId, setWeekId] =
    useState(
      getWeekId(),
    );

  const [language, setLanguage] =
    useState("javascript");

  const [
    selectedBossId,
    setSelectedBossId,
  ] = useState(
    "bugKing",
  );

  const [questions, setQuestions] =
    useState([
      createEmptyQuestion(),
    ]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [testing, setTesting] =
    useState(false);

  const selectedBoss =
    FALLBACK_BOSSES[
      selectedBossId
    ];

  useEffect(() => {
    const currentWeek =
      getWeekId();

    setWeekId(
      currentWeek,
    );

    loadContent(
      currentWeek,
      language,
    );
  }, []);

  useEffect(() => {
    if (!loading) {
      loadContent(
        weekId,
        language,
      );
    }
  }, [language]);

  const loadContent = async (
    currentWeek,
    currentLanguage,
  ) => {
    try {
      setLoading(true);

      const result =
        await loadAdminBossContent(
          currentWeek,
          currentLanguage,
        );

      if (result.boss) {
        setSelectedBossId(
          result.boss.id ||
            "bugKing",
        );
      } else {
        setSelectedBossId(
          "bugKing",
        );
      }

      if (
        result.questions &&
        result.questions.length >
          0
      ) {
        setQuestions(
          result.questions.map(
            (question) => {
              const answers =
                getAcceptedAnswers(
                  question,
                );

              return {
                ...question,

                type:
                  question.type ||
                  QUESTION_TYPES.MULTIPLE_CHOICE,

                question:
                  question.question ||
                  "",

                code:
                  question.code ||
                  "",

                options:
                  Array.isArray(
                    question.options,
                  )
                    ? [
                        ...question.options,
                        "",
                        "",
                        "",
                        "",
                      ].slice(0, 4)
                    : [
                        "",
                        "",
                        "",
                        "",
                      ],

                correctAnswer:
                  Number.isFinite(
                    Number(
                      question.correctAnswer,
                    ),
                  )
                    ? Number(
                        question.correctAnswer,
                      )
                    : 0,

                answersText:
                  answers.join("\n"),

                explanation:
                  question.explanation ||
                  "",
              };
            },
          ),
        );
      } else {
        setQuestions([
          createEmptyQuestion(),
        ]);
      }
    } catch (error) {
      console.log(
        "Admin load error:",
        error,
      );

      Alert.alert(
        "Admin Error",
        error.message ||
          "Could not load weekly boss data.",
      );
    } finally {
      setLoading(false);
    }
  };

  const scanCurrentWeek =
    async () => {
      const currentWeek =
        getWeekId();

      setWeekId(
        currentWeek,
      );

      await loadContent(
        currentWeek,
        language,
      );
    };

  const handleTestQuestions =
    () => {
      try {
        setTesting(true);

        const generated =
          generateTestQuestions(
            language,
          );

        setQuestions(
          generated,
        );

        Alert.alert(
          "Test Questions",
          `10 ${LANGUAGES[language]} test questions were generated. Review them before saving.`,
        );
      } catch (error) {
        console.log(
          "Test question error:",
          error,
        );

        Alert.alert(
          "Error",
          "Could not generate test questions.",
        );
      } finally {
        setTesting(false);
      }
    };

  const handleLanguageChange =
    (newLanguage) => {
      setLanguage(
        newLanguage,
      );
    };

  const handleBossChange =
    (bossId) => {
      setSelectedBossId(
        bossId,
      );

      setQuestions([
        createEmptyQuestion(),
      ]);
    };

  const updateQuestion = (
    index,
    changes,
  ) => {
    setQuestions(
      (current) =>
        current.map(
          (
            question,
            questionIndex,
          ) =>
            questionIndex ===
            index
              ? {
                  ...question,
                  ...changes,
                }
              : question,
        ),
    );
  };

  const updateQuestionType =
    (
      index,
      type,
    ) => {
      if (
        type ===
        QUESTION_TYPES.TRUE_FALSE
      ) {
        updateQuestion(
          index,
          {
            type,

            options: [
              "True",
              "False",
            ],

            correctAnswer: 0,
          },
        );

        return;
      }

      if (
        type ===
        QUESTION_TYPES.MULTIPLE_CHOICE
      ) {
        updateQuestion(
          index,
          {
            type,

            options: [
              "",
              "",
              "",
              "",
            ],

            correctAnswer: 0,
          },
        );

        return;
      }

      updateQuestion(
        index,
        {
          type,
        },
      );
    };

  const updateOption = (
    questionIndex,
    optionIndex,
    value,
  ) => {
    setQuestions(
      (current) =>
        current.map(
          (
            question,
            index,
          ) => {
            if (
              index !==
              questionIndex
            ) {
              return question;
            }

            const options = [
              ...(question.options ||
                [
                  "",
                  "",
                  "",
                  "",
                ]),
            ];

            options[
              optionIndex
            ] = value;

            return {
              ...question,
              options,
            };
          },
        ),
    );
  };

  const addQuestion = () => {
    setQuestions(
      (current) => [
        ...current,
        createEmptyQuestion(),
      ],
    );
  };

  const removeQuestion =
    (index) => {
      if (
        questions.length <=
        1
      ) {
        Alert.alert(
          "Question Required",
          "At least one question is required.",
        );

        return;
      }

      setQuestions(
        (current) =>
          current.filter(
            (_, i) =>
              i !== index,
          ),
      );
    };

  const validateQuestion =
    (
      question,
      index,
    ) => {
      if (
        !question.question?.trim()
      ) {
        return `Question ${
          index + 1
        } needs a question.`;
      }

      if (
        question.type ===
        QUESTION_TYPES.MULTIPLE_CHOICE
      ) {
        const options =
          Array.isArray(
            question.options,
          )
            ? question.options
            : [];

        const validOptions =
          options.filter(
            (option) =>
              String(
                option ?? "",
              ).trim(),
          );

        if (
          validOptions.length !==
          4
        ) {
          return `Question ${
            index + 1
          } needs exactly 4 options.`;
        }

        const correctIndex =
          Number(
            question.correctAnswer,
          );

        if (
          !Number.isInteger(
            correctIndex,
          ) ||
          correctIndex < 0 ||
          correctIndex > 3
        ) {
          return `Question ${
            index + 1
          } needs a correct answer selected.`;
        }

        return null;
      }

      if (
        question.type ===
        QUESTION_TYPES.TRUE_FALSE
      ) {
        const correctIndex =
          Number(
            question.correctAnswer,
          );

        if (
          correctIndex !== 0 &&
          correctIndex !== 1
        ) {
          return `Question ${
            index + 1
          } needs a True or False answer selected.`;
        }

        return null;
      }

      const answers =
        getAcceptedAnswers(
          question,
        );

      if (
        answers.length ===
        0
      ) {
        return `Question ${
          index + 1
        } needs at least one accepted answer.`;
      }

      return null;
    };

  const saveBoss = async () => {
    if (!selectedBoss) {
      Alert.alert(
        "No Boss",
        "Please choose a boss.",
      );

      return;
    }

    if (
      questions.length <
      10
    ) {
      Alert.alert(
        "Not Enough Questions",
        "A weekly boss needs at least 10 questions.",
      );

      return;
    }

    for (
      let i = 0;
      i < questions.length;
      i++
    ) {
      const error =
        validateQuestion(
          questions[i],
          i,
        );

      if (error) {
        Alert.alert(
          "Invalid Question",
          error,
        );

        return;
      }
    }

    try {
      setSaving(true);

      await saveWeeklyBossContent({
        weekId,

        language,

        bossId:
          selectedBossId,

        questions,
      });

      Alert.alert(
        "Weekly Boss Saved",
        `${LANGUAGES[language]} will use ${selectedBoss.name} for ${weekId}.`,
      );

      await loadContent(
        weekId,
        language,
      );
    } catch (error) {
      console.log(
        "Save error:",
        error,
      );

      Alert.alert(
        "Save Failed",
        error.message ||
          "Could not save the weekly boss.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color="#A72BFF"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading Weekly Boss Admin...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={
        styles.container
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <TouchableOpacity
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.back
            }
          >
            ← Back
          </Text>
        </TouchableOpacity>

        <Text
          style={
            styles.title
          }
        >
          Weekly Boss Admin
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          Configure this week's boss and
          questions.
        </Text>

        {/* CURRENT WEEK */}

        <View
          style={
            styles.weekCard
          }
        >
          <View>
            <Text
              style={
                styles.weekLabel
              }
            >
              CURRENT WEEK
            </Text>

            <Text
              style={
                styles.weekValue
              }
            >
              {weekId}
            </Text>

            <Text
              style={
                styles.weekHint
              }
            >
              Automatically detected
              from today's date
            </Text>
          </View>

          <TouchableOpacity
            style={
              styles.scanButton
            }
            onPress={
              scanCurrentWeek
            }
          >
            <Text
              style={
                styles.scanButtonText
              }
            >
              SCAN
            </Text>
          </TouchableOpacity>
        </View>

        {/* LANGUAGE */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          PROGRAMMING LANGUAGE
        </Text>

        <View
          style={
            styles.languageRow
          }
        >
          {LANGUAGE_KEYS.map(
            (key) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.languageButton,
                  language ===
                    key &&
                    styles.languageButtonActive,
                ]}
                onPress={() =>
                  handleLanguageChange(
                    key,
                  )
                }
              >
                <Text
                  style={[
                    styles.languageText,
                    language ===
                      key &&
                      styles.languageTextActive,
                  ]}
                >
                  {
                    LANGUAGES[
                      key
                    ]
                  }
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>

        {/* TEST QUESTIONS */}

        <TouchableOpacity
          style={
            styles.testButton
          }
          onPress={
            handleTestQuestions
          }
          disabled={
            testing
          }
        >
          <Text
            style={
              styles.testButtonText
            }
          >
            {testing
              ? "CREATING..."
              : "GENERATE 10 TEST QUESTIONS"}
          </Text>

          <Text
            style={
              styles.testButtonSubtext
            }
          >
            Creates sample{" "}
            {
              LANGUAGES[
                language
              ]
            }{" "}
            questions
          </Text>
        </TouchableOpacity>

        <Text
          style={
            styles.testNote
          }
        >
          Generated questions are only added
          to this editor. Firebase is not
          changed until you save.
        </Text>

        {/* BOSS */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          CHOOSE BOSS
        </Text>

        <View
          style={
            styles.bossList
          }
        >
          {BOSS_KEYS.map(
            (bossId) => {
              const boss =
                FALLBACK_BOSSES[
                  bossId
                ];

              const selected =
                selectedBossId ===
                bossId;

              return (
                <TouchableOpacity
                  key={
                    bossId
                  }
                  style={[
                    styles.bossCard,
                    selected &&
                      styles.bossCardSelected,
                  ]}
                  onPress={() =>
                    handleBossChange(
                      bossId,
                    )
                  }
                >
                  <View
                    style={
                      styles.bossTitleRow
                    }
                  >
                    <Text
                      style={[
                        styles.bossName,
                        selected &&
                          styles.bossNameSelected,
                      ]}
                    >
                      {
                        boss.name
                      }
                    </Text>

                    <Text
                      style={[
                        styles.check,
                        selected &&
                          styles.checkActive,
                      ]}
                    >
                      {selected
                        ? "✓"
                        : ""}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.bossDescription
                    }
                  >
                    {
                      boss.description
                    }
                  </Text>

                  <View
                    style={
                      styles.statRow
                    }
                  >
                    <Text
                      style={
                        styles.stat
                      }
                    >
                      HP{" "}
                      {
                        boss.maxHP
                      }
                    </Text>

                    <Text
                      style={
                        styles.stat
                      }
                    >
                      {
                        boss.timeLimit
                      }
                      s
                    </Text>

                    <Text
                      style={
                        styles.stat
                      }
                    >
                      {
                        boss.difficulty
                      }
                    </Text>

                    <Text
                      style={
                        styles.stat
                      }
                    >
                      +
                      {
                        boss.rewardXP
                      }{" "}
                      XP
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            },
          )}
        </View>

        {/* QUESTIONS */}

        <View
          style={
            styles.questionSectionHeader
          }
        >
          <Text
            style={
              styles.sectionTitleNoMargin
            }
          >
            QUESTIONS
          </Text>

          <Text
            style={
              styles.questionCount
            }
          >
            {
              questions.length
            }{" "}
            total
          </Text>
        </View>

        {questions.map(
          (
            question,
            index,
          ) => (
            <View
              key={
                `question-${index}`
              }
              style={
                styles.questionCard
              }
            >
              <View
                style={
                  styles.questionHeader
                }
              >
                <Text
                  style={
                    styles.questionNumber
                  }
                >
                  QUESTION{" "}
                  {
                    index +
                    1
                  }
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    removeQuestion(
                      index,
                    )
                  }
                >
                  <Text
                    style={
                      styles.removeText
                    }
                  >
                    REMOVE
                  </Text>
                </TouchableOpacity>
              </View>

              {/* TYPE */}

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                style={
                  styles.typeScroll
                }
              >
                {Object.entries(
                  QUESTION_TYPE_LABELS,
                ).map(
                  ([
                    type,
                    label,
                  ]) => (
                    <TouchableOpacity
                      key={
                        type
                      }
                      style={[
                        styles.typeButton,
                        question.type ===
                          type &&
                          styles.typeButtonActive,
                      ]}
                      onPress={() =>
                        updateQuestionType(
                          index,
                          type,
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.typeText,
                          question.type ===
                            type &&
                            styles.typeTextActive,
                        ]}
                      >
                        {
                          label
                        }
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </ScrollView>

              {/* QUESTION */}

              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                ]}
                value={
                  question.question
                }
                onChangeText={(
                  value,
                ) =>
                  updateQuestion(
                    index,
                    {
                      question:
                        value,
                    },
                  )
                }
                placeholder="Enter question"
                placeholderTextColor="#999999"
                multiline
              />

              {/* CODE */}

              {question.type !==
                QUESTION_TYPES.TRUE_FALSE && (
                <>
                  <Text
                    style={
                      styles.label
                    }
                  >
                    CODE / EXAMPLE
                  </Text>

                  <TextInput
                    style={[
                      styles.codeInput,
                      styles.textArea,
                    ]}
                    value={
                      question.code
                    }
                    onChangeText={(
                      value,
                    ) =>
                      updateQuestion(
                        index,
                        {
                          code:
                            value,
                        },
                      )
                    }
                    placeholder="Optional code or example"
                    placeholderTextColor="#999999"
                    multiline
                  />
                </>
              )}

              {/* MULTIPLE CHOICE */}

              {question.type ===
                QUESTION_TYPES.MULTIPLE_CHOICE && (
                <>
                  <Text
                    style={
                      styles.label
                    }
                  >
                    OPTIONS
                  </Text>

                  {question.options.map(
                    (
                      option,
                      optionIndex,
                    ) => (
                      <View
                        key={`option-${optionIndex}`}
                        style={
                          styles.optionRow
                        }
                      >
                        <TouchableOpacity
                          onPress={() =>
                            updateQuestion(
                              index,
                              {
                                correctAnswer:
                                  optionIndex,
                              },
                            )
                          }
                        >
                          <Text
                            style={[
                              styles.optionCircle,
                              question.correctAnswer ===
                                optionIndex &&
                                styles.optionCircleActive,
                            ]}
                          >
                            {question.correctAnswer ===
                            optionIndex
                              ? "●"
                              : "○"}
                          </Text>
                        </TouchableOpacity>

                        <TextInput
                          style={
                            styles.optionInput
                          }
                          value={
                            option
                          }
                          onChangeText={(
                            value,
                          ) =>
                            updateOption(
                              index,
                              optionIndex,
                              value,
                            )
                          }
                          placeholder={`Option ${
                            optionIndex +
                            1
                          }`}
                          placeholderTextColor="#999999"
                        />
                      </View>
                    ),
                  )}
                </>
              )}

              {/* TRUE / FALSE */}

              {question.type ===
                QUESTION_TYPES.TRUE_FALSE && (
                <>
                  <Text
                    style={
                      styles.label
                    }
                  >
                    CORRECT ANSWER
                  </Text>

                  <View
                    style={
                      styles.trueFalseRow
                    }
                  >
                    {[
                      "True",
                      "False",
                    ].map(
                      (
                        answer,
                        answerIndex,
                      ) => (
                        <TouchableOpacity
                          key={
                            answer
                          }
                          style={[
                            styles.trueFalseButton,
                            question.correctAnswer ===
                              answerIndex &&
                              styles.trueFalseButtonActive,
                          ]}
                          onPress={() =>
                            updateQuestion(
                              index,
                              {
                                options:
                                  [
                                    "True",
                                    "False",
                                  ],

                                correctAnswer:
                                  answerIndex,
                              },
                            )
                          }
                        >
                          <Text
                            style={[
                              styles.trueFalseText,
                              question.correctAnswer ===
                                answerIndex &&
                                styles.trueFalseTextActive,
                            ]}
                          >
                            {
                              answer
                            }
                          </Text>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                </>
              )}

              {/* ACCEPTED ANSWERS */}

              {question.type !==
                QUESTION_TYPES.MULTIPLE_CHOICE &&
                question.type !==
                  QUESTION_TYPES.TRUE_FALSE && (
                <>
                  <Text
                    style={
                      styles.label
                    }
                  >
                    ACCEPTED ANSWERS
                  </Text>

                  <Text
                    style={
                      styles.acceptedAnswerHint
                    }
                  >
                    Put one accepted answer on
                    each line.
                  </Text>

                  <TextInput
                    style={[
                      styles.input,
                      styles.textArea,
                      styles.acceptedAnswerInput,
                    ]}
                    value={
                      question.answersText
                    }
                    onChangeText={(
                      value,
                    ) =>
                      updateQuestion(
                        index,
                        {
                          answersText:
                            value,
                        },
                      )
                    }
                    placeholder={
                      "Example:\nfunction"
                    }
                    placeholderTextColor="#999999"
                    multiline
                  />
                </>
              )}

              {/* EXPLANATION */}

              <Text
                style={
                  styles.label
                }
              >
                EXPLANATION
              </Text>

              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                ]}
                value={
                  question.explanation
                }
                onChangeText={(
                  value,
                ) =>
                  updateQuestion(
                    index,
                    {
                      explanation:
                        value,
                    },
                  )
                }
                placeholder="Explain the correct answer"
                placeholderTextColor="#999999"
                multiline
              />
            </View>
          ),
        )}

        <TouchableOpacity
          style={
            styles.addButton
          }
          onPress={
            addQuestion
          }
        >
          <Text
            style={
              styles.addButtonText
            }
          >
            + ADD QUESTION
          </Text>
        </TouchableOpacity>

        <View
          style={
            styles.saveButtonBase
          }
        >
          <Pressable
            disabled={
              saving
            }
            onPress={
              saveBoss
            }
            style={({ pressed }) => [
              styles.saveButton,
              pressed &&
                styles.saveButtonPressed,
            ]}
          >
            <Text
              style={
                styles.saveButtonText
              }
            >
              {saving
                ? "SAVING..."
                : "SAVE WEEKLY BOSS"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#FFFFFF",
    },

    content: {
      padding: 24,
      paddingTop: 50,
      paddingBottom: 80,
    },

    loadingContainer: {
      flex: 1,
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    loadingText: {
      marginTop: 12,
      color: "#666666",
      fontSize: 15,
    },

    back: {
      color: "#555555",
      fontSize: 15,
      marginBottom: 20,
    },

    title: {
      color: "#202020",
      fontSize: 30,
      fontWeight: "900",
    },

    subtitle: {
      color: "#777777",
      marginTop: 8,
      marginBottom: 20,
      lineHeight: 20,
    },

    weekCard: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      borderWidth: 2,
      borderColor:
        "#E1E1E1",
      backgroundColor:
        "#FAFAFA",
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
    },

    weekLabel: {
      fontSize: 10,
      fontWeight: "900",
      color: "#777777",
    },

    weekValue: {
      marginTop: 4,
      fontSize: 26,
      fontWeight: "900",
      color: "#A72BFF",
    },

    weekHint: {
      marginTop: 3,
      color: "#888888",
      fontSize: 10,
    },

    scanButton: {
      borderWidth: 1,
      borderColor:
        "#A72BFF",
      backgroundColor:
        "#F3E2FF",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },

    scanButtonText: {
      color: "#A72BFF",
      fontSize: 11,
      fontWeight: "900",
    },

    sectionTitle: {
      color: "#555555",
      fontSize: 13,
      fontWeight: "900",
      marginTop: 24,
      marginBottom: 10,
    },

    languageRow: {
      flexDirection:
        "row",
      gap: 8,
    },

    languageButton: {
      borderWidth: 2,
      borderColor:
        "#E3E3E3",
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },

    languageButtonActive: {
      borderColor:
        "#A72BFF",
      backgroundColor:
        "#F3E2FF",
    },

    languageText: {
      color: "#555555",
      fontSize: 13,
      fontWeight: "800",
    },

    languageTextActive: {
      color: "#A72BFF",
    },

    testButton: {
      marginTop: 18,
      width: "100%",
      minHeight: 68,
      borderRadius: 14,
      backgroundColor:
        "#A72BFF",
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal: 18,
    },

    testButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "900",
      textAlign:
        "center",
    },

    testButtonSubtext: {
      color: "#F4E9FF",
      fontSize: 11,
      marginTop: 4,
    },

    testNote: {
      color: "#888888",
      fontSize: 11,
      lineHeight: 16,
      marginTop: 7,
      textAlign:
        "center",
    },

    bossList: {
      gap: 10,
    },

    bossCard: {
      borderWidth: 2,
      borderColor:
        "#E4E4E4",
      borderRadius: 14,
      padding: 15,
      backgroundColor:
        "#FFFFFF",
    },

    bossCardSelected: {
      borderColor:
        "#A72BFF",
      backgroundColor:
        "#F8F0FF",
    },

    bossTitleRow: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
    },

    bossName: {
      color: "#222222",
      fontSize: 18,
      fontWeight: "900",
    },

    bossNameSelected: {
      color: "#A72BFF",
    },

    check: {
      color: "#FFFFFF",
      fontSize: 22,
      fontWeight: "900",
    },

    checkActive: {
      color: "#A72BFF",
    },

    bossDescription: {
      color: "#777777",
      fontSize: 12,
      lineHeight: 17,
      marginTop: 6,
    },

    statRow: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 7,
      marginTop: 12,
    },

    stat: {
      backgroundColor:
        "#F0F0F0",
      borderRadius: 6,
      color: "#666666",
      fontSize: 10,
      fontWeight: "800",
      paddingHorizontal: 8,
      paddingVertical: 5,
    },

    questionSectionHeader: {
      marginTop: 28,
      marginBottom: 12,
    },

    sectionTitleNoMargin: {
      color: "#555555",
      fontSize: 13,
      fontWeight: "900",
    },

    questionCount: {
      color: "#888888",
      fontSize: 11,
      marginTop: 3,
    },

    questionCard: {
      borderWidth: 2,
      borderColor:
        "#E5E5E5",
      borderRadius: 14,
      padding: 14,
      marginBottom: 14,
    },

    questionHeader: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      marginBottom: 10,
    },

    questionNumber: {
      color: "#A72BFF",
      fontSize: 12,
      fontWeight: "900",
    },

    removeText: {
      color: "#D71920",
      fontSize: 11,
      fontWeight: "900",
    },

    typeScroll: {
      marginBottom: 10,
    },

    typeButton: {
      borderWidth: 1,
      borderColor:
        "#D9D9D9",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      marginRight: 7,
    },

    typeButtonActive: {
      borderColor:
        "#A72BFF",
      backgroundColor:
        "#F3E2FF",
    },

    typeText: {
      color: "#666666",
      fontSize: 11,
      fontWeight: "700",
    },

    typeTextActive: {
      color: "#A72BFF",
    },

    label: {
      color: "#666666",
      fontSize: 11,
      fontWeight: "900",
      marginBottom: 6,
      marginTop: 4,
    },

    acceptedAnswerHint: {
      color: "#888888",
      fontSize: 10,
      marginBottom: 6,
    },

    acceptedAnswerInput: {
      borderColor:
        "#A72BFF",
      backgroundColor:
        "#FCF8FF",
    },

    input: {
      width: "100%",
      minHeight: 50,
      borderWidth: 1,
      borderColor:
        "#D9D9D9",
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: "#202020",
      backgroundColor:
        "#FFFFFF",
      marginBottom: 10,
    },

    textArea: {
      minHeight: 85,
      textAlignVertical:
        "top",
    },

    codeInput: {
      width: "100%",
      minHeight: 80,
      borderWidth: 1,
      borderColor:
        "#CFCFCF",
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: "#202020",
      backgroundColor:
        "#F7F7F7",
      marginBottom: 10,
      fontFamily:
        "monospace",
    },

    optionRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginBottom: 8,
    },

    optionCircle: {
      width: 28,
      textAlign:
        "center",
      fontSize: 20,
      color: "#999999",
    },

    optionCircleActive: {
      color: "#A72BFF",
    },

    optionInput: {
      flex: 1,
      minHeight: 44,
      borderWidth: 1,
      borderColor:
        "#D9D9D9",
      borderRadius: 8,
      paddingHorizontal: 12,
      color: "#202020",
    },

    trueFalseRow: {
      flexDirection:
        "row",
      gap: 10,
      marginBottom: 10,
    },

    trueFalseButton: {
      flex: 1,
      borderWidth: 2,
      borderColor:
        "#E0E0E0",
      borderRadius: 10,
      paddingVertical: 12,
      alignItems:
        "center",
    },

    trueFalseButtonActive: {
      borderColor:
        "#A72BFF",
      backgroundColor:
        "#F3E2FF",
    },

    trueFalseText: {
      color: "#555555",
      fontWeight: "800",
    },

    trueFalseTextActive: {
      color: "#A72BFF",
    },

    addButton: {
      minHeight: 55,
      borderWidth: 2,
      borderStyle:
        "dashed",
      borderColor:
        "#A72BFF",
      borderRadius: 12,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    addButtonText: {
      color: "#A72BFF",
      fontWeight: "900",
    },

    saveButtonBase: {
      marginTop: 18,
      height: 60,
      borderRadius: 16,
      backgroundColor:
        "#7200B8",
      justifyContent:
        "flex-end",
      overflow:
        "hidden",
    },

    saveButton: {
      height: 54,
      borderRadius: 16,
      backgroundColor:
        "#B42CFF",
      alignItems:
        "center",
      justifyContent:
        "center",
      transform: [
        {
          translateY: -6,
        },
      ],
    },

    saveButtonPressed: {
      backgroundColor:
        "#9D20E8",
      transform: [
        {
          translateY: 0,
        },
      ],
    },

    saveButtonText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "900",
    },
  });

