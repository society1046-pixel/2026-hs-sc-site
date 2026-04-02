// 페이지가 로드될 때 기본 권한을 0으로 설정
sessionStorage.setItem('userRole', 0);

// 구글 웹 앱 URL (사용자님의 API URL 유지)
const API_URL = "https://script.google.com/macros/s/AKfycbwEIBKkR6Wt4hq0-6kzD8Wjhwm_GmZ-6shbYdpIxt3F6R-Zi-DplK3CaFoEZGPj2F4hzg/exec"; 

// 1. 로그인 시도 함수
function attemptLogin() {
  const userId = document.getElementById('userId').value;
  const userPw = document.getElementById('userPw').value;

  if (!userId || !userPw) { 
    alert('학번과 비밀번호를 모두 입력해주세요.'); 
    return; 
  }

  document.getElementById('loading-msg').style.display = 'block';

  // ID와 PW 모두 전송
  fetch(`${API_URL}?action=login&id=${encodeURIComponent(userId)}&pw=${encodeURIComponent(userPw)}`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('loading-msg').style.display = 'none';
      if (data.success) {
        sessionStorage.setItem('userRole', data.role);
        sessionStorage.setItem('userId', data.id); 
        sessionStorage.setItem('userName', data.name);
        
        // 로그인 성공 시 main.html 파일로 이동
        window.location.href = 'main.html';
      } else {
        alert(data.message); // 서버에서 보낸 에러 메시지 출력 (비밀번호 오류 등)
      }
    })
    .catch(error => {
      document.getElementById('loading-msg').style.display = 'none';
      alert('서버 오류가 발생했습니다: ' + error.message);
    });
}

// 2. 화면 전환 함수 (로그인 폼 <-> 비밀번호 변경 폼)
function toggleView(viewType) {
  const loginView = document.getElementById('view-login');
  const changePwView = document.getElementById('view-change-pw');
  const loadingMsg = document.getElementById('loading-msg');
  
  loadingMsg.style.display = 'none'; // 전환 시 로딩 메시지 숨기기

  if (viewType === 'change') {
    loginView.style.display = 'none';
    changePwView.style.display = 'block';
  } else {
    loginView.style.display = 'block';
    changePwView.style.display = 'none';
  }
}

// 3. 비밀번호 변경 시도 함수
function attemptChangePw() {
  const changeId = document.getElementById('changeId').value;
  const oldPw = document.getElementById('oldPw').value;
  const newPw = document.getElementById('newPw').value;

  if (!changeId || !oldPw || !newPw) {
    alert('모든 항목을 입력해주세요.');
    return;
  }
  
  if (oldPw === newPw) {
    alert('새 비밀번호는 기존 비밀번호와 다르게 설정해주세요.');
    return;
  }

  document.getElementById('loading-msg').style.display = 'block';

  // 비밀번호 변경 API 호출
  fetch(`${API_URL}?action=changePw&id=${encodeURIComponent(changeId)}&oldPw=${encodeURIComponent(oldPw)}&newPw=${encodeURIComponent(newPw)}`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('loading-msg').style.display = 'none';
      if (data.success) {
        alert(data.message); // "비밀번호가 성공적으로 변경되었습니다."
        
        // 입력창 비우고 로그인 화면으로 복귀
        document.getElementById('changeId').value = '';
        document.getElementById('oldPw').value = '';
        document.getElementById('newPw').value = '';
        toggleView('login');
      } else {
        alert(data.message); // "기존 비밀번호가 일치하지 않습니다" 등
      }
    })
    .catch(error => {
      document.getElementById('loading-msg').style.display = 'none';
      alert('서버 오류가 발생했습니다: ' + error.message);
    });
}
