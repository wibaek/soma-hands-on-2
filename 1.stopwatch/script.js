// 스탑워치 클래스 정의
class Stopwatch {
  constructor() {
    // 시간 관련 변수들
    this.startTime = 0; // 시작 시간
    this.elapsedTime = 0; // 경과 시간
    this.isRunning = false; // 실행 상태
    this.intervalId = null; // 인터벌 ID
    this.lapTimes = []; // 랩 타임 배열

    // DOM 요소들
    this.hoursElement = document.getElementById("hours");
    this.minutesElement = document.getElementById("minutes");
    this.secondsElement = document.getElementById("seconds");
    this.millisecondsElement = document.getElementById("milliseconds");

    this.startBtn = document.getElementById("startBtn");
    this.stopBtn = document.getElementById("stopBtn");
    this.resetBtn = document.getElementById("resetBtn");
    this.lapBtn = document.getElementById("lapBtn");
    this.lapList = document.getElementById("lapList");

    // 이벤트 리스너 등록
    this.initializeEventListeners();
  }

  // 이벤트 리스너 초기화
  initializeEventListeners() {
    this.startBtn.addEventListener("click", () => this.start());
    this.stopBtn.addEventListener("click", () => this.stop());
    this.resetBtn.addEventListener("click", () => this.reset());
    this.lapBtn.addEventListener("click", () => this.recordLap());
  }

  // 스탑워치 시작
  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.startTime = Date.now() - this.elapsedTime;
      this.intervalId = setInterval(() => this.updateDisplay(), 10);

      // 버튼 상태 변경
      this.startBtn.disabled = true;
      this.stopBtn.disabled = false;
      this.lapBtn.disabled = false;
    }
  }

  // 스탑워치 정지
  stop() {
    if (this.isRunning) {
      this.isRunning = false;
      clearInterval(this.intervalId);
      this.elapsedTime = Date.now() - this.startTime;

      // 버튼 상태 변경
      this.startBtn.disabled = false;
      this.stopBtn.disabled = true;
      this.lapBtn.disabled = true;
    }
  }

  // 스탑워치 리셋
  reset() {
    this.stop();
    this.elapsedTime = 0;
    this.lapTimes = [];
    this.updateDisplay();
    this.clearLapList();

    // 버튼 상태 초기화
    this.startBtn.disabled = false;
    this.stopBtn.disabled = true;
    this.lapBtn.disabled = true;
  }

  // 랩 타임 기록
  recordLap() {
    if (this.isRunning) {
      const currentTime = this.getCurrentTime();
      this.lapTimes.push(currentTime);
      this.addLapToList(this.lapTimes.length, currentTime);
    }
  }

  // 현재 시간 계산
  getCurrentTime() {
    return Date.now() - this.startTime;
  }

  // 시간 표시 업데이트
  updateDisplay() {
    const time = this.isRunning ? this.getCurrentTime() : this.elapsedTime;
    const timeComponents = this.formatTime(time);

    this.hoursElement.textContent = timeComponents.hours;
    this.minutesElement.textContent = timeComponents.minutes;
    this.secondsElement.textContent = timeComponents.seconds;
    this.millisecondsElement.textContent = timeComponents.milliseconds;
  }

  // 시간 포맷팅 (시:분:초.밀리초)
  formatTime(milliseconds) {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    const ms = Math.floor((milliseconds % 1000) / 10);

    return {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
      milliseconds: ms.toString().padStart(2, "0"),
    };
  }

  // 랩 타임을 리스트에 추가
  addLapToList(lapNumber, time) {
    const timeComponents = this.formatTime(time);
    const timeString = `${timeComponents.hours}:${timeComponents.minutes}:${timeComponents.seconds}.${timeComponents.milliseconds}`;

    const lapItem = document.createElement("div");
    lapItem.className = "lap-item";
    lapItem.innerHTML = `
            <span class="lap-number">#${lapNumber}</span>
            <span class="lap-time">${timeString}</span>
        `;

    this.lapList.appendChild(lapItem);

    // 스크롤을 맨 아래로 이동
    this.lapList.scrollTop = this.lapList.scrollHeight;
  }

  // 랩 리스트 초기화
  clearLapList() {
    this.lapList.innerHTML = "";
  }
}

// 페이지 로드 시 스탑워치 초기화
document.addEventListener("DOMContentLoaded", () => {
  new Stopwatch();
});
