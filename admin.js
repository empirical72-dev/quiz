import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getDatabase, ref, set, remove } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBKduRPHfPIeqi-UpLq1zGnixaGosxxV8M",
  authDomain: "quiz-game-fa3c4.firebaseapp.com",
  databaseURL: "https://quiz-game-fa3c4-default-rtdb.firebaseio.com",
  projectId: "quiz-game-fa3c4",
  storageBucket: "quiz-game-fa3c4.appspot.com",
  messagingSenderId: "547479595488",
  appId: "1:547479595488:web:6e17f6b0f1788a4dc76385"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const questions = {
  1: { text: "문제 1 내용", options: ["1번", "2번", "3번", "4번"], answer: 2 },
  2: { text: "문제 2 내용", options: ["1번", "2번", "3번", "4번"], answer: 3 },
  3: { text: "문제 3 내용", options: ["1번", "2번", "3번", "4번"], answer: 1 }
};

function startQuestion(num) {
  const q = questions[num];
  const sessionId = Date.now();
  set(ref(db, "currentQuestion"), {
    number: num,
    text: q.text,
    options: q.options,
    active: true,
    sessionId: sessionId
  });
  set(ref(db, `sessions/${sessionId}/questions/${num}/answer`), q.answer);
}

document.getElementById("startQ1").addEventListener("click", () => startQuestion(1));
document.getElementById("startQ2").addEventListener("click", () => startQuestion(2));
document.getElementById("startQ3").addEventListener("click", () => startQuestion(3));

document.getElementById("endBtn").addEventListener("click", () => {
  remove(ref(db, "currentQuestion"));
  remove(ref(db, "sessions"));
  alert("게임이 종료되었습니다.");
});
