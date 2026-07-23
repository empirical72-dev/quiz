import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getDatabase, ref, onValue, push, get } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

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

// 현재 문제 표시 (세션 기반)
onValue(ref(db, "currentQuestion"), (snapshot) => {
  if (snapshot.exists()) {
    const q = snapshot.val();

    // 세션이 없거나 active:false → 대기 상태
    if (!q.sessionId || !q.active) {
      questionArea.innerHTML = "<p>관리자가 문제를 시작하면 여기에 표시됩니다.</p>";
      answerArea.style.display = "none";
      resultArea.innerHTML = "";
      winnerArea.innerHTML = "";
      submitBtn.disabled = false;
      return;
    }

    const sessionId = q.sessionId;
    const qNumber = q.number;

    // 문제 표시
    questionArea.innerHTML = `
      <div class="question-box">
        <h2>문제 ${qNumber}. ${q.text}</h2>
        <ul>${q.options.map(o => `<li>${o}</li>`).join("")}</ul>
      </div>
    `;
    answerArea.style.display = "block";
    resultArea.innerHTML = "";
    winnerArea.innerHTML = "";
    submitBtn.disabled = false;

    // 정답 표시 (세션별로만)
    onValue(ref(db, `sessions/${sessionId}/questions/${qNumber}/answer`), (ansSnap) => {
      if (ansSnap.exists()) {
        const correctAnswer = ansSnap.val();
        resultArea.innerHTML = "";

        onValue(ref(db, `sessions/${sessionId}/answers`), (answersSnap) => {
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
      } else {
        resultArea.innerHTML = ""; // 정답 공개 전에는 표시하지 않음
      }
    });

    // 당첨자 표시 (세션별로만)
    onValue(ref(db, `sessions/${sessionId}/questions/${qNumber}/winners`), (winnerSnap) => {
      if (winnerSnap.exists()) {
        const winners = Array.isArray(winnerSnap.val()) ? winnerSnap.val() : Object.values(winnerSnap.val());
        winnerArea.innerHTML = `<p>당첨자: ${winners.join(", ")}</p>`;
      }
    });

    // 답 제출 (세션별 중복 제출 방지)
    submitBtn.onclick = async () => {
      const answerNum = parseInt(answerInput.value);
      if (answerNum >= 1 && answerNum <= 4) {
        const snapshot = await get(ref(db, `sessions/${sessionId}/answers`));
        if (snapshot.exists()) {
          const answers = snapshot.val();
          const alreadySubmitted = Object.values(answers).some(
            ans => ans.name === userName && ans.question === qNumber
          );
          if (alreadySubmitted) {
            alert("이미 이 문제에 답안을 제출했습니다. 다시 제출할 수 없습니다.");
            return;
          }
        }

        // 최초 제출만 허용
        push(ref(db, `sessions/${sessionId}/answers`), {
          name: userName,
          question: qNumber,
          answer: answerNum
        });
        alert("답안이 제출되었습니다!");
        answerInput.value = "";
        submitBtn.disabled = true;
      } else {
        alert("1~4 사이의 번호를 입력하세요.");
      }
    };

  } else {
    // 데이터가 아예 없는 경우 → 대기 상태
    questionArea.innerHTML = "<p>관리자가 문제를 시작하면 여기에 표시됩니다.</p>";
    answerArea.style.display = "none";
    resultArea.innerHTML = "";
    winnerArea.innerHTML = "";
    submitBtn.disabled = false;
  }
});
