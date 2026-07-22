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

// 참가자 이름 (간단히 프롬프트로 입력받음)
const userName = prompt("이름을 입력하세요:") || "참가자";

// 관리자 문제 표시 실시간 반영
onValue(ref(db, "currentQuestion"), (snapshot) => {
  if (snapshot.exists()) {
    const q = snapshot.val();
    questionArea.innerHTML = `
      <h2>문제 ${q.number}. ${q.text}</h2>
      <ul>${q.options.map(o => `<li>${o}</li>`).join("")}</ul>
    `;
    answerArea.style.display = "block";
  } else {
    questionArea.innerHTML = "<p>관리자가 문제를 시작하면 여기에 표시됩니다.</p>";
    answerArea.style.display = "none";
  }
});

// 답 제출
submitBtn.addEventListener("click", () => {
  const answerNum = parseInt(answerInput.value);
  if (answerNum >= 1 && answerNum <= 4) {
    push(ref(db, "answers"), {
      name: userName,
      question: parseInt(document.querySelector("h2").textContent.match(/\d+/)[0]),
      answer: answerNum
    });
    alert("답안이 제출되었습니다!");
    answerInput.value = "";
  } else {
    alert("1~4 사이의 번호를 입력하세요.");
  }
});
