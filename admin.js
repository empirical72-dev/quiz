import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

const firebaseConfig = { /* ... 동일 ... */ };

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const questions = {
  1: { text: "대한민국의 수도는 어디일까요?", options: ["1) 서울", "2) 부산", "3) 대구", "4) 인천"] },
  2: { text: "2+2는?", options: ["1) 3", "2) 4", "3) 5", "4) 6"] },
  3: { text: "바다의 색깔은?", options: ["1) 빨강", "2) 파랑", "3) 노랑", "4) 초록"] }
};

let currentSessionId = null;

function generateSessionId() {
  return "session_" + Date.now();
}

// 문제 시작
function startQuestion(num) {
  const q = questions[num];
  if (!currentSessionId) currentSessionId = generateSessionId();

  set(ref(db, "currentQuestion"), {
    sessionId: currentSessionId,
    number: num,
    text: q.text,
    options: q.options,
    active: true
  });

  // UI 생성 및 정답 저장 로직 동일...
}

// 문제 종료 → active만 false
function endQuestion() {
  if (currentSessionId) {
    set(ref(db, "currentQuestion"), { sessionId: currentSessionId, active: false });
  }
}

// 테스트 종료 → currentQuestion 초기화
function resetTest() {
  currentSessionId = null;
  set(ref(db, "currentQuestion"), {}); // 완전히 초기화
}

// 정답 확인 및 추첨
async function checkAnswers(num, correctAnswer) {
  const snapshot = await get(child(ref(db), `sessions/${currentSessionId}/answers`));
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

    document.getElementById(`pickWinners${num}`).addEventListener("click", async () => {
      const count = parseInt(document.getElementById(`winnerCount${num}`).value);

      const snapshotWinners = await get(child(ref(db), `sessions/${currentSessionId}/allWinners`));
      const alreadyWon = snapshotWinners.exists() ? snapshotWinners.val() : [];
      const pool = correctUsers.filter(u => !alreadyWon.includes(u));

      if (count > 0 && pool.length >= count) {
        const winners = [];
        while (winners.length < count) {
          const idx = Math.floor(Math.random() * pool.length);
          winners.push(pool.splice(idx, 1)[0]);
        }

        resultBox.innerHTML += `<p>당첨자: ${winners.join(", ")}</p>`;

        // 문제별 winners 저장
        set(ref(db, `sessions/${currentSessionId}/questions/${num}/winners`), winners);

        // 전체 누적 winners 저장 (중복 제거)
        set(ref(db, `sessions/${currentSessionId}/allWinners`), [...new Set([...alreadyWon, ...winners])]);
      } else {
        alert("추첨 인원이 부족하거나 이미 당첨된 사람이 많습니다.");
      }
    });
  }
}

// 버튼 이벤트 연결
document.getElementById("startQ1").addEventListener("click", () => startQuestion(1));
document.getElementById("startQ2").addEventListener("click", () => startQuestion(2));
document.getElementById("startQ3").addEventListener("click", () => startQuestion(3));
document.getElementById("resetBtn").addEventListener("click", resetTest);
