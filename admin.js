import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBKduRPHfPIeqi-UpLq1zGnixaGosxxV8M",
  authDomain: "quiz-game-fa3c4.firebaseapp.com",
  databaseURL: "https://quiz-game-fa3c4-default-rtdb.firebaseio.com",
  projectId: "quiz-game-fa3c4",
  storageBucket: "quiz-game-fa3c4.appspot.com", // ✅ 수정된 값
  messagingSenderId: "547479595488",
  appId: "1:547479595488:web:6e17f6b0f1788a4dc76385"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 문제 데이터 예시
const questions = {
  1: "문제 1: 대한민국의 수도는 어디일까요?",
  2: "문제 2: 2+2는?",
  3: "문제 3: 바다의 색깔은?"
};

const adminQuestionBox = document.getElementById("adminQuestionBox");

function startQuestion(num) {
  const text = questions[num];
  // DB에 기록
  set(ref(db, "currentQuestion"), { number: num, text: text });
  // 관리자 화면에 표시
  adminQuestionBox.innerText = `현재 문제: ${text}`;
}

document.getElementById("startQ1").addEventListener("click", () => startQuestion(1));
document.getElementById("startQ2").addEventListener("click", () => startQuestion(2));
document.getElementById("startQ3").addEventListener("click", () => startQuestion(3));
