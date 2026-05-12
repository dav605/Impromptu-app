export const speechPrompts = [
  "If you had to invent a new holiday, what would it celebrate and how would people observe it?",
  "What is the most useless superpower you can think of, and how would you use it?",
  "Persuade the audience that hot dogs are actually a type of sandwich.",
  "Describe a world where humans only need 1 hour of sleep per night.",
  "You've just been elected President of the Internet. What is your first decree?",
  "Explain the internet to someone from the 1800s.",
  "If animals could talk, which species would be the rudest and why?",
  "What is the best piece of advice you've ever received from a stranger?",
  "You have 2 minutes to convince us to move to Mars.",
  "Discuss the pros and cons of having a personal theme song that plays whenever you enter a room."
];

export const getRandomPrompt = () => {
  const index = Math.floor(Math.random() * speechPrompts.length);
  return speechPrompts[index];
};
