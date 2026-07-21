import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

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

document.getElementById("joinBtn").addEventListener("click", () => {
  const nickname = document.getElementById("nickname").value;
  if (nickname) {
    push(ref(db, "participants"), { name: nickname });
    alert("참가 완료!");
  } else {
    alert("닉네임을 입력하세요.");
  }
});

// 문제 표시 기능
const questionBox = document.getElementById("questionBox");

onValue(ref(db, "currentQuestion"), (snapshot) => {
  const data = snapshot.val();
  if (data) {
    questionBox.innerText = `현재 문제: ${data.text}`;
  }
});
