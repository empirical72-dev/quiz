import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getDatabase, ref, onValue, push } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

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

const questionArea = document.getElementById("questionArea");
const answerArea = document.getElementById("answerArea");
const answerInput = document.getElementById("answerInput");
const submitBtn = document.getElementById("submitAnswer");
const resultArea = document.getElementById("resultArea");
const winnerArea = document.getElementById("winnerArea");

const userName = prompt("이름을 입력하세요:") || "참가자";

// ✅ 문제 표시
onValue(ref(db, "currentQuestion"), (snapshot) => {
  if (snapshot.exists()) {
    const q = snapshot.val();
    questionArea.innerHTML = `
      <h2>문제 ${q.number}. ${q.text}</h2>
      <ul>${q.options.map(o => `<li>${o}</li>`).join("")}</ul>
    `;
    answerArea.style.display = "block";
    resultArea.innerHTML = "";
    winnerArea.innerHTML = "";
  } else {
    questionArea.innerHTML = "<p>관리자가 문제를 시작하면 여기에 표시됩니다.</p>";
    answerArea.style.display = "none";
  }
});

// ✅ 답 제출
submitBtn.addEventListener("click", () => {
  const answerNum = parseInt(answerInput.value);
  const qNumber = parseInt(document.querySelector("h2").textContent.match(/\d+/)[0]);
  if (answerNum >= 1 && answerNum <= 4) {
    push(ref(db, "answers"), {
      name: userName,
      question: qNumber,
      answer: answerNum
    });
    alert("답안이 제출되었습니다!");
    answerInput.value = "";
  } else {
    alert("1~4 사이의 번호를 입력하세요.");
  }
});

// ✅ 정답 + 당첨자 표시
onValue(ref(db, "currentQuestion"), (snapshot) => {
  if (snapshot.exists()) {
    const currentQ = snapshot.val();
    const qNumber = currentQ.number;

    onValue(ref(db, `questions/${qNumber}/answer`), (ansSnap) => {
      if (ansSnap.exists()) {
        const correctAnswer = ansSnap.val();

        onValue(ref(db, "answers"), (answersSnap) => {
          if (answersSnap.exists()) {
            const answers = answersSnap.val();
            for (const key in answers) {
              if (answers[key].name === userName && answers[key].question === qNumber) {
                if (answers[key].answer === correctAnswer) {
                  resultArea.innerHTML = `⭕ 정답! (정답은 ${correctAnswer}번)`;
                } else {
                  resultArea.innerHTML = `❌ 오답! (정답은 ${correctAnswer}번)`;
                }
              }
            }
          }
        });
      }
    });
  }
});

// ✅ 당첨자 표시 (정답 결과 아래에 붙여서 표시)
onValue(ref(db, "winners"), (snapshot) => {
  if (snapshot.exists()) {
    const winners = snapshot.val();
    const list = Array.isArray(winners) ? winners : Object.values(winners);
    winnerArea.innerHTML = `<p>당첨자 ${list.join(", ")}</p>`;
  }
});
