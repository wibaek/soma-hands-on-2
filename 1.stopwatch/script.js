class Stopwatch {
  constructor() {
    this.isRunning = false;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.lapTimes = [];
    this.interval = null;

    this.initializeElements();
    this.bindEvents();
  }

  initializeElements() {
    this.hoursElement = document.getElementById("hours");
    this.minutesElement = document.getElementById("minutes");
    this.secondsElement = document.getElementById("seconds");
    this.millisecondsElement = document.getElementById("milliseconds");

    this.startBtn = document.getElementById("startBtn");
    this.pauseBtn = document.getElementById("pauseBtn");
    this.resetBtn = document.getElementById("resetBtn");
    this.lapBtn = document.getElementById("lapBtn");

    this.lapList = document.getElementById("lapList");
  }

  bindEvents() {
    this.startBtn.addEventListener("click", () => this.start());
    this.pauseBtn.addEventListener("click", () => this.pause());
    this.resetBtn.addEventListener("click", () => this.reset());
    this.lapBtn.addEventListener("click", () => this.lap());

    // 키보드 단축키
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (this.isRunning) {
          this.pause();
        } else {
          this.start();
        }
      } else if (e.code === "KeyL") {
        this.lap();
      } else if (e.code === "KeyR") {
        this.reset();
      }
    });
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.startTime = Date.now() - this.elapsedTime;
      this.interval = setInterval(() => this.updateDisplay(), 10);

      this.startBtn.disabled = true;
      this.pauseBtn.disabled = false;
      this.lapBtn.disabled = false;

      this.startBtn.textContent = "재시작";
    }
  }

  pause() {
    if (this.isRunning) {
      this.isRunning = false;
      clearInterval(this.interval);
      this.elapsedTime = Date.now() - this.startTime;

      this.startBtn.disabled = false;
      this.pauseBtn.disabled = true;
      this.lapBtn.disabled = true;

      this.startBtn.textContent = "시작";
    }
  }

  reset() {
    this.pause();
    this.elapsedTime = 0;
    this.lapTimes = [];
    this.updateDisplay();
    this.updateLapList();

    this.startBtn.textContent = "시작";
    this.lapBtn.disabled = true;
  }

  lap() {
    if (this.isRunning) {
      const currentTime = this.elapsedTime + (Date.now() - this.startTime);
      this.lapTimes.push(currentTime);
      this.updateLapList();
    }
  }

  updateDisplay() {
    const currentTime = this.elapsedTime + (Date.now() - this.startTime);
    const time = this.formatTime(currentTime);

    this.hoursElement.textContent = time.hours;
    this.minutesElement.textContent = time.minutes;
    this.secondsElement.textContent = time.seconds;
    this.millisecondsElement.textContent = time.milliseconds;
  }

  formatTime(milliseconds) {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = Math.floor((milliseconds % 1000) / 10);

    return {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
      milliseconds: ms.toString().padStart(2, "0"),
    };
  }

  updateLapList() {
    this.lapList.innerHTML = "";

    if (this.lapTimes.length === 0) {
      return;
    }

    this.lapTimes.forEach((lapTime, index) => {
      const li = document.createElement("li");
      const lapNumber = document.createElement("span");
      const lapTimeSpan = document.createElement("span");
      const lapDifference = document.createElement("span");

      lapNumber.className = "lap-number";
      lapTimeSpan.className = "lap-time";
      lapDifference.className = "lap-difference";

      const time = this.formatTime(lapTime);
      lapNumber.textContent = `#${index + 1}`;
      lapTimeSpan.textContent = `${time.hours}:${time.minutes}:${time.seconds}.${time.milliseconds}`;

      // 이전 랩과의 차이 계산
      if (index > 0) {
        const difference = lapTime - this.lapTimes[index - 1];
        const diffTime = this.formatTime(difference);
        const sign = difference >= 0 ? "+" : "-";
        lapDifference.textContent = `${sign}${diffTime.minutes}:${diffTime.seconds}.${diffTime.milliseconds}`;
        lapDifference.style.color = difference >= 0 ? "#f44336" : "#4CAF50";
      } else {
        lapDifference.textContent = "기준";
      }

      li.appendChild(lapNumber);
      li.appendChild(lapTimeSpan);
      li.appendChild(lapDifference);
      this.lapList.appendChild(li);
    });
  }
}

// 애플리케이션 초기화
document.addEventListener("DOMContentLoaded", () => {
  new Stopwatch();

  // 사용법 안내
  console.log("스탑워치 사용법:");
  console.log("- 스페이스바: 시작/일시정지");
  console.log("- L 키: 랩 기록");
  console.log("- R 키: 리셋");
});
