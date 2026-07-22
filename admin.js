import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

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
  1: { text: "대한민국의 수도는 어디일까요?", options: ["1) 서울", "2) 부산", "3) 대구", "4) 인천"] },
  2: { text: "2+2는?", options: ["1) 3", "2) 4", "3) 5", "4) 6"] },
  3: { text: "바다의 색깔은?", options: ["1) 빨강", "2) 파랑", "3) 노랑", "4) 초록"] }
};

// 문제 시작 시 버튼을 감싸는 div 바로 아래에 박스 생성
function startQuestion(num) {
  const q = questions[num];
  set(ref(db, "currentQuestion"), { number: num, text: q.text, options: q.options });

  const button = document.getElementById(`startQ${num}`);
  const parentDiv = button.parentNode; // 버튼을 감싸는 div

  // 이미 박스가 있으면 중복 생성 방지
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

  // 버튼을 감싸는 div 바로 아래에 삽입 (옆이 아니라 아래로)
  parentDiv.insertAdjacentElement("afterend", questionDiv);

  // 정답 저장 이벤트
  document.getElementById(`saveAnswer${num}`).addEventListener("click", () => {
    const answerNum = parseInt(document.getElementById(`answerInput${num}`).value);
    if (answerNum >= 1 && answerNum <= 4) {
      set(ref(db, `questions/${num}/answer`), answerNum);
      alert(`문제 ${num} 정답이 저장되었습니다.`);
      checkAnswers(num, answerNum);
    } else {
      alert("1~4 사이의 번호를 입력하세요.");
    }
  });
}

// 참가자 답안 확인 및 정답자 추출
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
      } else {
        alert("올바른 숫자를 입력하거나 정답자가 부족합니다.");
      }
    });
  } else {
    resultBox.innerHTML = "<p>참가자 답안이 아직 없습니다.</p>";
  }
}

// 버튼 이벤트 연결
document.getElementById("startQ1").addEventListener("click", () => startQuestion(1));
document.getElementById("startQ2").addEventListener("click", () => startQuestion(2));
document.getElementById("startQ3").addEventListener("click", () => startQuestion(3));
