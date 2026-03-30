const API_URL = "https://script.google.com/macros/s/AKfycbwEIBKkR6Wt4hq0-6kzD8Wjhwm_GmZ-6shbYdpIxt3F6R-Zi-DplK3CaFoEZGPj2F4hzg/exec"; 

const roleNames = {
  1: "재학생",
  2: "1-1. 반장", 3: "1-1. 부반장", 4: "1-2. 반장", 5: "1-2. 부반장", 
  6: "1-3. 반장", 7: "1-3. 부반장", 8: "1-4. 반장", 9: "1-4. 부반장", 
  10: "1-5. 반장", 11: "1-5. 부반장",
  12: "2-1. 반장", 13: "2-1. 부반장", 14: "2-2. 반장", 15: "2-2. 부반장", 
  16: "2-3. 반장", 17: "2-3. 부반장", 18: "2-4. 반장", 19: "2-4. 부반장", 
  20: "2-5. 반장", 21: "2-5. 부반장",
  22: "3-1. 반장", 23: "3-1. 부반장", 24: "3-2. 반장", 25: "3-2. 부반장", 
  26: "3-3. 반장", 27: "3-3. 부반장", 28: "3-4. 반장", 29: "3-4. 부반장", 
  30: "3-5. 반장", 31: "3-5. 부반장",
  32: "콘텐츠소통부 부장", 33: "콘텐츠소통부",
  34: "문화소통부 부장", 35: "문화소통부",
  36: "건강활동부 부장", 37: "건강활동부",
  38: "학술문예부 부장", 39: "학술문예부",
  40: "생활안전부 부장", 41: "생활안전부",
  42: "전교 회장", 43: "전교 부회장", 44: "전교 부회장(2)",
  45: "선생님", 46: "관리자"
};

const calendarAdmins = [42, 43, 44, 45, 46];

let currentRole = 0;
let savedEvents = {}; 
let displayYear = new Date().getFullYear();
let displayMonth = new Date().getMonth(); 

function initMain() {
  // 값이 없으면 자동으로 0(비회원)으로 설정합니다.
  currentRole = Number(sessionStorage.getItem('userRole')) || 0; 
  
  const displayId = document.getElementById('display-id');
  const roleDisplay = document.getElementById('display-role');
  const menuContainer = document.getElementById('menu-list-container');
  const actionBtn = document.getElementById('action-btn');

  // ★ 비회원(로그인 안 한 상태)일 때 사이드바 설정
  if (currentRole === 0) {
    displayId.innerText = "로그인이 필요합니다.";
    displayId.style.fontSize = "16px";
    roleDisplay.innerText = "비회원";
    roleDisplay.style.backgroundColor = "#A0AEC0";
    
    // 메뉴 숨기고 안내문 띄우기 // 비로그인 메뉴 바 설정
    menuContainer.innerHTML = `
      <div class="menu-item" onclick="goToPage('main')"> 메인 화면</div>
      <div class="menu-item" onclick="goToPage('scint')"> 학생회 소개</div>
      <div style="padding: 30px 20px; text-align: center; color: #A0AEC0; font-size: 13px; line-height: 1.5;">더 많은 기능을<br>이용하시려면 로그인해주세요.</div>
    `;
    
    // 하단 버튼을 '로그인 하러가기'로 변경
    actionBtn.innerText = "로그인";
    actionBtn.style.backgroundColor = "#7BA4DB";
    actionBtn.onclick = function() { window.location.href = 'loginh.html'; };
  } 
  // ★ 로그인 한 상태일 때 사이드바 설정
  else {
    displayId.innerText = sessionStorage.getItem('userId') + (sessionStorage.getItem('userName') ? ` (${sessionStorage.getItem('userName')})` : "");
    roleDisplay.innerText = roleNames[currentRole] || "권한 미상";

    if (currentRole === 1) roleDisplay.style.backgroundColor = "#82CA9D"; 
    else if (currentRole >= 2 && currentRole <= 31) roleDisplay.style.backgroundColor = "#F6AD55"; 
    else if (currentRole >= 32 && currentRole <= 41) roleDisplay.style.backgroundColor = "#B794F4"; 
    else if (currentRole >= 42 && currentRole <= 44) roleDisplay.style.backgroundColor = "#F687B3"; 
    else if (currentRole >= 45 && currentRole <= 46) roleDisplay.style.backgroundColor = "#F19C99"; 

    // 정상적인 메뉴 보여주기
    menuContainer.innerHTML = `
      <div class="menu-item" onclick="goToPage('main')">메인 화면</div>
      <div class="menu-item" onclick="goToPage('scint')">학생회 소개</div>
      <div class="menu-item" onclick="toggleSubMenu('studentCouncilMenu')">학생회 ▼</div>
      <div id="studentCouncilMenu" class="sub-menu">
        <div class="menu-item" onclick="checkPinAndGo('sp1')">- 회장단</div>
        <div class="menu-item" onclick="goToPage('A2')">- 카테고리 2</div>
        <div class="menu-item" onclick="goToPage('A3')">- 카테고리 3</div>
      </div>
      <div class="menu-item" onclick="goToPage('fage1')">Fage1 메뉴로 이동</div>
    `;
    
    // 하단 버튼을 '로그아웃'으로 변경
    actionBtn.innerText = "로그아웃";
    actionBtn.style.backgroundColor = "#F19C99";
    actionBtn.onclick = logout;
  }

  // 달력 데이터 로딩
  const cachedData = localStorage.getItem('cachedCalendar');
  if (cachedData) {
    savedEvents = JSON.parse(cachedData);
    renderCalendar();
  }

  fetch(`${API_URL}?action=getCalendar`, { redirect: 'follow' })
    .then(res => res.text())
    .then(text => {
      try {
        savedEvents = JSON.parse(text); 
        localStorage.setItem('cachedCalendar', JSON.stringify(savedEvents)); 
        renderCalendar(); 
      } catch (e) { console.error("데이터 로딩 오류"); }
    });
}

function changeMonth(direction) {
  displayMonth += direction;
  if (displayMonth < 0) { displayMonth = 11; displayYear--; }
  else if (displayMonth > 11) { displayMonth = 0; displayYear++; }
  renderCalendar();
}

function renderCalendar() {
  const today = new Date();
  document.getElementById('calendar-month-title').innerText = `📅 ${displayYear}년 ${displayMonth + 1}월`;

  const firstDay = new Date(displayYear, displayMonth, 1).getDay(); 
  const lastDate = new Date(displayYear, displayMonth + 1, 0).getDate(); 
  const daysGrid = document.getElementById('calendar-days');
  daysGrid.innerHTML = ''; 

  for (let i = 0; i < firstDay; i++) {
    daysGrid.innerHTML += `<div class="cal-day empty"></div>`;
  }

  for (let i = 1; i <= lastDate; i++) {
    let isTodayClass = (displayYear === today.getFullYear() && displayMonth === today.getMonth() && i === today.getDate()) ? "today" : ""; 
    let dateString = `${displayYear}-${displayMonth + 1}-${i}`;
    
    let eventHtml = '';
    if (savedEvents[dateString]) {
      // ★ 수정됨: 달력 네모 칸 안에서 쉼표(,)를 줄바꿈(<br>)으로 변경
      let formattedText = savedEvents[dateString][0].replace(/,/g, '<br>');
      eventHtml = `<div class="event-dot"></div><div class="event-text">${formattedText}</div>`;
    }

    daysGrid.innerHTML += `
      <div class="cal-day ${isTodayClass}" onclick="dayClicked(${displayYear}, ${displayMonth + 1}, ${i})">
        ${i}
        ${eventHtml}
      </div>`;
  }
}

let selectedDateStr = "";

function dayClicked(year, month, day) {
  selectedDateStr = `${year}-${month}-${day}`;
  
  // 권한 체크 (0번 비회원도 보기만 가능하도록 처리됨)
  if (!calendarAdmins.includes(currentRole)) {
    if(savedEvents[selectedDateStr] && savedEvents[selectedDateStr].length > 0) {
        // ★ 수정됨: 일반 사용자용 알림창에서 쉼표(,)를 줄바꿈(\n)으로 변경
        let alertEvents = savedEvents[selectedDateStr].map(ev => ev.replace(/,/g, '\n'));
        alert(`[ ${month}월 ${day}일 일정 ]\n\n` + alertEvents.join('\n\n'));
    }
    return; 
  }

  document.getElementById('modal-title').innerText = `${month}월 ${day}일 일정 관리`;
  
  let existingHtml = '';
  if(savedEvents[selectedDateStr]) {
    savedEvents[selectedDateStr].forEach(ev => {
      let safeText = ev.replace(/'/g, "\\'").replace(/"/g, '&quot;');
      // ★ 수정됨: 관리자용 모달창에서 쉼표(,)를 줄바꿈(<br>)으로 변경
      let displayText = ev.replace(/,/g, '<br>').replace(/\n/g, '<br>');
      existingHtml += `
        <div class="event-list-item">
          <span style="flex-grow:1; margin-right:10px;">${displayText}</span>
          <button class="del-btn" onclick="deleteEvent('${safeText}')">삭제</button>
        </div>`;
    });
  }
  document.getElementById('existing-events-box').innerHTML = existingHtml;
  document.getElementById('newEventText').value = ""; 
  document.getElementById('eventModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('eventModal').style.display = 'none';
}

function saveEvent() {
  let eventText = document.getElementById('newEventText').value;
  if (!eventText.trim()) { alert('내용을 입력하세요.'); return; }
  document.getElementById('modal-title').innerText = "저장 중... ⏳";
  fetch(`${API_URL}?action=addEvent&date=${selectedDateStr}&text=${encodeURIComponent(eventText)}`, { redirect: 'follow' })
    .then(res => res.json())
    .then(data => {
      if(data.success) {
        savedEvents = data.events; 
        localStorage.setItem('cachedCalendar', JSON.stringify(savedEvents));
        renderCalendar(); 
        closeModal();
      }
    });
}

function deleteEvent(eventText) {
  if(!confirm('이 일정을 삭제하시겠습니까?')) return;
  document.getElementById('modal-title').innerText = "삭제 중... 🗑️";
  fetch(`${API_URL}?action=deleteEvent&date=${selectedDateStr}&text=${encodeURIComponent(eventText)}`, { redirect: 'follow' })
    .then(res => res.json())
    .then(data => {
      if(data.success) {
        savedEvents = data.events;
        localStorage.setItem('cachedCalendar', JSON.stringify(savedEvents));
        renderCalendar();
        closeModal();
      }
    });
}

function toggleMenu() {
  const sidebar = document.getElementById("mySidebar");
  sidebar.style.left = sidebar.style.left === "0px" ? "-280px" : "0px";
}

function toggleSubMenu(menuId) { //토글메뉴
  const subMenu = document.getElementById(menuId);
  subMenu.classList.toggle('show');
}

function checkPinAndGo(pageName) {
  // 1. 자바스크립트 내부에 인증번호를 설정해 둡니다. (원하는 대로 숫자를 바꾸세요!)
  const pins = {
    'sp1': '1234', // A1 페이지의 인증번호
    'A2': '5678'  // A2 페이지의 인증번호
  };

  const correctPin = pins[pageName];
  
  // 2. 인증번호가 설정된 페이지인지 확인
  if (correctPin) {
    // 알림창을 띄워 입력을 받습니다
    const userInput = prompt("접근 권한이 필요합니다.\n인증번호를 입력해주세요:");
    
    // 입력한 번호가 맞으면 페이지 이동
    if (userInput === correctPin) {
      goToPage(pageName);
    } 
    // 취소 버튼을 누르지 않았는데 틀린 경우
    else if (userInput !== null) { 
      alert("인증번호가 일치하지 않습니다.");
    }
  } else {
    // 만약 pins에 설정해두지 않은 페이지라면 그냥 바로 넘어갑니다
    goToPage(pageName);
  }
}

function logout() {
  if(confirm('로그아웃 하시겠습니까?')) {
    sessionStorage.clear(); 
    window.location.reload(); // 로그아웃 시 메인화면 새로고침으로 비회원 전환
  }
}

function goToPage(pageName) { window.location.href = pageName + '.html'; }
