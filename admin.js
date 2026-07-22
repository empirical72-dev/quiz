import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Firebase 설정
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 예시 문제 데이터
const questions = {
  1: { text: "대한민국의 수도는?", options: ["서울", "부산", "대구", "인천"] },
  2: { text: "2+2=?", options: ["3", "4", "5", "6"] }
};

// 문제 시작
function startQuestion(num) {
  const q = questions[num];
  set(ref(db, "currentQuestion"), { number: num, text: q.text, options: q.options });

  const questionArea = document.getElementById("question-area");
  questionArea.innerHTML = `
    <div class="question-box">
      <h2>문제 ${num}. ${q.text}</h2>
      <ul>${q.options.map(o => `<li>${o}</li>`).join("")}</ul>
    </div>
  `;
}

// 정답 확인 및 추첨
async function checkAnswers(num, correctAnswer, count) {
  const snapshot = await get(child(ref(db), "answers"));
  if (snapshot.exists()) {
    const answers = snapshot.val();
    const correctUsers = [];
    for (const key in answers) {
      if (answers[key].question === num && answers[key].answer == correctAnswer) {
        correctUsers.push(answers[key].name);
      }
    }

    // 추첨
    const winners = [];
    const pool = [...correctUsers];
    while (winners.length < count && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      winners.push(pool.splice(idx, 1)[0]);
    }

    // DB에 저장
    set(ref(db, `questions/${num}/answer`), correctAnswer);
    set(ref(db, "winners"), winners);

    // 화면 표시
    const resultArea = document.getElementById("result-area");
    resultArea.innerHTML = `
      <p>정답: ${correctAnswer}번</p>
      <p>당첨자: ${winners.join(", ")}</p>
    `;
  }
}

// 버튼 이벤트 연결
document.getElementById("startBtn").addEventListener("click", () => {
  const num = parseInt(document.getElementById("questionNum").value);
  if (num) startQuestion(num);
});

document.getElementById("checkBtn").addEventListener("click", () => {
  const num = parseInt(document.getElementById("questionNum").value);
  const correctAnswer = parseInt(document.getElementById("correctAnswer").value);
  const count = parseInt(document.getElementById("winnerCount").value);
  if (num && correctAnswer && count) checkAnswers(num, correctAnswer, count);
});
