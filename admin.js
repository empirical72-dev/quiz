import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getDatabase, ref, set, onValue, get, child, push } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBKduRPHfPIeqi-UpLq1zGnixaGosxxV8M",
  authDomain: "quiz-game-fa3c4.firebaseapp.com",
  databaseURL: "https://quiz-game-fa3c4-default-rtdb.firebaseio.com",
  projectId: "quiz-game-fa3c4",
  storageBucket: "quiz-game-fa3c4.firebasestorage.app",
  messagingSenderId: "547479595488",
  appId: "1:547479595488:web:6e17f6b0f1788a4dc76385"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentQ = null;

// 문제 등록 (하드코딩)
const questions = {
  q1: { id: "q1", text: "2+2는?", options: ["3","4","5"], answer: "4" },
  q2: { id: "q2", text: "대한민국 수도는?", options: ["서울","부산","인천"], answer: "서울" },
  q3: { id: "q3", text: "바다의 색은?", options: ["파랑","빨강","노랑"], answer: "파랑" }
};
set(ref(db, "questions"), questions);

// 문제 시작
window.startQuestion = function(qId) {
  currentQ = qId;
  set(ref(db, 'currentQuestion'), qId);
  listenAnswers(qId);
}

// 답안 현황 표시
function listenAnswers(qId) {
  onValue(ref(db, 'answers'), snapshot => {
    const ansDiv = document.getElementById('answers');
    ansDiv.innerHTML = '';
    snapshot.forEach(participantSnap => {
      const pid = participantSnap.key;
      const answer = participantSnap.child(qId).val();
      if (answer) {
        ansDiv.innerHTML += pid + " → " + answer + "<br>";
      }
    });
  });
}

// 당첨자 선정
window.pickWinners = async function() {
  const qSnap = await get(child(ref(db), 'questions/' + currentQ));
  const correct = qSnap.val().answer;
  const ansSnap = await get(ref(db, 'answers'));
  const correctParticipants = [];
  ansSnap.forEach(pSnap => {
    const pid = pSnap.key;
    const ans = pSnap.child(currentQ).val();
    if (ans === correct) {
      correctParticipants.push(pid);
    }
  });
  const count = parseInt(document.getElementById('winnerCount').value);
  const chosen = [];
  while (chosen.length < count && correctParticipants.length > 0) {
    const idx = Math.floor(Math.random() * correctParticipants.length);
    chosen.push(correctParticipants.splice(idx,1)[0]);
  }
  for (const pid of chosen) {
    const pSnap = await get(child(ref(db), 'participants/' + pid));
    push(ref(db, 'winners/' + currentQ), { name: pSnap.val().name });
  }
}
