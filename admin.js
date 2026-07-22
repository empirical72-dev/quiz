import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

// ✅ Firebase 설정
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

// ✅ 문제 데이터
const questions = {
  1: { text: "대한민국의 수도는 어디일까요?", options: ["1) 서울", "2) 부산", "3) 대구", "4) 인천"] },
  2: { text: "2+2는?", options: ["1) 3", "2) 4", "3) 5", "4) 6"] },
  3: { text: "바다의 색깔은?", options: ["1) 빨강", "2) 파랑", "3) 노랑", "4) 초록"] }
};

// ✅ 문제 시작
function startQuestion(num) {
  const q = questions[num];
  set(ref(db, "currentQuestion"), { number: num, text: q.text, options: q.options });

  const parentDiv = document.getElementById(`startQ${num}`).parentNode;
  if (document.getElementById(`questionBox${num}`)) return;

  const questionDiv = document.createElement("div");
  questionDiv.className = "question-item";
  questionDiv.id = `questionBox${num}`;
  questionDiv.innerHTML = `
    <h3>문제 ${num}. ${q.text}</h3>
    <ul>${q.options.map(o => `<li>${o}</li>`).join("")}</ul>
    <div>
      <label>정답 입력 (번호): </label>
      <input id="answerInput${num}" type="number" min="1" max="4">
      <button id="saveAnswer${num}">정답 저장</button>
    </div>
    <div id="resultBox${num}" class="result-box"></div>
  `;
  parentDiv.insertAdjacentElement("afterend", questionDiv);

  // ✅ 정답 저장 버튼 이벤트
  document.getElementById(`saveAnswer${num}`).addEventListener("click", () => {
    const answerNum = parseInt(document.getElementById(`answerInput${num}`).value);
    if (answerNum >= 1 && answerNum <= 4) {
      set(ref(db, `questions/${num}/answer`), answerNum);
      alert(`문제 ${num} 정답이 저장되었습니다.`);
      checkAnswers(num, answerNum);
    }
  });
}

// ✅ 정답 확인 및 추첨
async function checkAnswers(num, correctAnswer) {
  const snapshot = await get(child(ref(db), "answers"));
  const resultBox = document.getElementById(`resultBox${num}`);
  if (snapshot.exists()) {
    const answers = snapshot.val();
    const correctUsers = [];
    for (const key in answers) {
      if (answers[key].question === num && answers[key].answer === correctAnswer) {
        correctUsers.push(answers[key].name);
      }
    }

    resultBox.innerHTML = `
      <p>정답자: ${correctUsers.length > 0 ? correctUsers.join(", ") : "없음"}</p>
      <label>당첨자 수: </label>
      <input id="winnerCount${num}" type="number" min="1">
      <button id="pickWinners${num}">추첨</button>
    `;

    // ✅ 추첨 버튼 이벤트
    document.getElementById(`pickWinners${num}`).addEventListener("click", () => {
      const count = parseInt(document.getElementById(`winnerCount${num}`).value);
      if (count > 0 && correctUsers.length >= count) {
        const winners = [];
        const pool = [...correctUsers];
        while (winners.length < count) {
          const idx = Math.floor(Math.random() * pool.length);
          winners.push(pool.splice(idx, 1)[0]);
        }
        resultBox.innerHTML += `<p>당첨자: ${winners.join(", ")}</p>`;

        // ✅ 참가자 모드에서 표시되도록 배열 형태로 저장
        set(ref(db, "winners"), winners);
      }
    });
  }
}

// ✅ 버튼 이벤트 연결
document.getElementById("startQ1").addEventListener("click", () => startQuestion(1));
document.getElementById("startQ2").addEventListener("click", () => startQuestion(2));
document.getElementById("startQ3").addEventListener("click", () => startQuestion(3));
