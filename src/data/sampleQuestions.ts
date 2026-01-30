export interface Question {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export const sampleQuestions: Question[] = [
  {
    id: 1,
    category: "JavaScript",
    question: "What is the output of: console.log(typeof null)?",
    options: ["null", "undefined", "object", "number"],
    correctAnswer: 2,
    explanation: "In JavaScript, typeof null returns 'object' due to a historical bug that has been kept for backward compatibility."
  },
  {
    id: 2,
    category: "React",
    question: "Which hook is used to perform side effects in functional components?",
    options: ["useState", "useEffect", "useContext", "useReducer"],
    correctAnswer: 1,
    explanation: "useEffect is the React hook designed to handle side effects like data fetching, subscriptions, or manually changing the DOM."
  },
  {
    id: 3,
    category: "JavaScript",
    question: "What is the difference between '==' and '===' in JavaScript?",
    options: [
      "They are the same",
      "'==' checks type and value, '===' checks only value",
      "'===' checks type and value, '==' checks only value",
      "Neither checks type"
    ],
    correctAnswer: 2,
    explanation: "'===' is the strict equality operator that checks both type and value, while '==' performs type coercion before comparison."
  },
  {
    id: 4,
    category: "HTML/CSS",
    question: "Which CSS property is used to change the text color?",
    options: ["font-color", "text-color", "color", "foreground-color"],
    correctAnswer: 2,
    explanation: "The 'color' property is used to set the text color in CSS."
  },
  {
    id: 5,
    category: "React",
    question: "What is the purpose of keys in React lists?",
    options: [
      "To style list items",
      "To help React identify which items have changed",
      "To sort the list",
      "To encrypt data"
    ],
    correctAnswer: 1,
    explanation: "Keys help React identify which items have changed, are added, or are removed, improving rendering performance."
  },
  {
    id: 6,
    category: "JavaScript",
    question: "What will [1, 2, 3].map(x => x * 2) return?",
    options: ["[1, 2, 3]", "[2, 4, 6]", "[3, 6, 9]", "undefined"],
    correctAnswer: 1,
    explanation: "The map function multiplies each element by 2, resulting in [2, 4, 6]."
  },
  {
    id: 7,
    category: "TypeScript",
    question: "What is TypeScript?",
    options: [
      "A JavaScript runtime",
      "A superset of JavaScript with static typing",
      "A CSS preprocessor",
      "A database"
    ],
    correctAnswer: 1,
    explanation: "TypeScript is a superset of JavaScript that adds optional static typing and other features."
  },
  {
    id: 8,
    category: "React",
    question: "What is JSX?",
    options: [
      "A database query language",
      "JavaScript XML - a syntax extension for JavaScript",
      "A CSS framework",
      "A Node.js module"
    ],
    correctAnswer: 1,
    explanation: "JSX stands for JavaScript XML and allows you to write HTML-like code in JavaScript."
  }
];
