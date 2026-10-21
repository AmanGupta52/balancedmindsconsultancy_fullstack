export const QUESTIONS = [
  { question: "How often do you feel anxious or stressed?", options: ["Rarely", "Sometimes", "Often", "Almost always"] },
  { question: "Do you struggle with sleep or dreams?", options: ["Never", "Occasionally", "Frequently", "Always"] },
  { question: "Do you experience mood swings or irritability?", options: ["Rarely", "Sometimes", "Often", "Almost always"] },
  { question: "Do you feel overwhelmed in social situations?", options: ["Rarely", "Sometimes", "Often", "Almost always"] },
  { question: "Do you experience panic or sudden fear?", options: ["Never", "Sometimes", "Often", "Always"] },
  { question: "Do you feel low or sad often?", options: ["Rarely", "Sometimes", "Often", "Almost always"] },
  { question: "Do you have difficulty focusing or concentrating?", options: ["Never", "Sometimes", "Often", "Always"] },
  { question: "Do you have trouble controlling anger?", options: ["Rarely", "Sometimes", "Often", "Almost always"] },
  { question: "Do you experience body aches or migraines?", options: ["Never", "Sometimes", "Often", "Always"] },
  { question: "Do you struggle with eating or body-image concerns?", options: ["Never", "Sometimes", "Often", "Always"] },
];

// Each answer is worth 0-3 points (first option = 0), so the total is 0-30.
export const MAX_SCORE = (QUESTIONS.length) * 3;

export const scoreAnswers = (answers) => answers.reduce((sum, value) => sum + value, 0);

export const BANDS = [
  { max: 9, key: "low", label: "Doing well", tone: "success", advice: "Your answers suggest low day-to-day strain. Keep up healthy routines, and reach out any time you'd like support." },
  { max: 19, key: "moderate", label: "Some strain", tone: "warning", advice: "You may be carrying a noticeable amount of stress. Talking to a counsellor can help you build coping tools early." },
  { max: MAX_SCORE, key: "high", label: "Significant strain", tone: "error", advice: "Your answers point to a lot of strain. We'd encourage you to speak with one of our experts soon." },
];

export const getBand = (score) => BANDS.find((band) => score <= band.max) || BANDS[BANDS.length - 1];
