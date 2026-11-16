export const CHALLENGE_QUESTIONS = [
  {
    id: 'q1',
    question: 'What does the machine actually do when you show it examples on your camera?',
    options: [
      { id: 'a', text: 'It understands the object like a human mind does.' },
      { id: 'b', text: 'It extracts mathematical patterns and visual features from pixels.', correct: true },
      { id: 'c', text: 'It searches the internet for a matching image file.' },
      { id: 'd', text: 'It memorizes video recordings of your room.' }
    ],
    explanation: 'Computers do not possess human consciousness. They convert pixels into numerical values (edges, colors, and gradients) and find statistical patterns between your classes.'
  },
  {
    id: 'q2',
    question: 'Why did the machine struggle when you changed the lighting or moved further away?',
    options: [
      { id: 'a', text: 'The camera battery ran low.' },
      { id: 'b', text: 'The new lighting changed the pixel patterns beyond what was in the training data.', correct: true },
      { id: 'c', text: 'The computer forgot the model.' },
      { id: 'd', text: 'AI models cannot see in low light.' }
    ],
    explanation: 'A model only knows what it has seen. If you only train at close range under bright light, new distances and shadows create patterns the model never learned.'
  },
  {
    id: 'q3',
    question: 'If you train a model on OPEN HAND vs FIST, and then show it a water bottle, what happens?',
    options: [
      { id: 'a', text: 'It says "Water Bottle".' },
      { id: 'b', text: 'It crashes and displays an error code.' },
      { id: 'c', text: 'It still predicts either OPEN HAND or FIST, because those are the only classes it knows.', correct: true },
      { id: 'd', text: 'It asks you to type the name of the bottle.' }
    ],
    explanation: 'Closed-set classifiers can only choose among the labels they were taught. The model calculates which of the two known patterns the bottle most closely resembles.'
  },
  {
    id: 'q4',
    question: 'What is the most effective way to improve your model\'s performance in the exhibition?',
    options: [
      { id: 'a', text: 'Capture examples from varied angles, distances, and lighting conditions.', correct: true },
      { id: 'b', text: 'Keep clicking capture 1,000 times without moving your hand.' },
      { id: 'c', text: 'Use a larger computer monitor.' },
      { id: 'd', text: 'Change the font of the website.' }
    ],
    explanation: 'Varied and representative training data helps the model generalize across different real-world conditions rather than memorizing a single rigid pose.'
  },
  {
    id: 'q5',
    question: 'Which equation best describes the fundamental machine-learning workflow you experienced?',
    options: [
      { id: 'a', text: 'CAMERA + CODING = INTELLIGENCE' },
      { id: 'b', text: 'DATA + TRAINING + PATTERNS = PREDICTION', correct: true },
      { id: 'c', text: 'INTERNET + CLOUD = KNOWLEDGE' },
      { id: 'd', text: 'PIXELS × TIME = MEMORY' }
    ],
    explanation: 'Data (your camera snapshots) is fed through Training algorithms to establish decision Patterns, enabling the machine to compute Predictions on new camera frames!'
  }
];
