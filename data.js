// Fake data for the app. There is no server, so everything lives in memory.

// the people you can chat with
export const users = [
  { id: '1', name: 'Rahul' },
  { id: '2', name: 'Priya' },
  { id: '3', name: 'Aman' },
  { id: '4', name: 'Neha' },
];

// all chats are stored here, example: { '1': [message, message], '2': [...] }
const chats = {};

// get all messages of one user
export function getMessages(userId) {
  return chats[userId] || [];
}

// add a message to a user's chat
export function addMessage(userId, message) {
  if (!chats[userId]) {
    chats[userId] = [];
  }
  chats[userId].push(message);
}
