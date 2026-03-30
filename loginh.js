// 페이지가 로드될 때 기본 권한을 0으로 설정
sessionStorage.setItem('userRole', 0);

// 구글 웹 앱 URL
const API_URL = "https://script.google.com/macros/s/AKfycbwEIBKkR6Wt4hq0-6kzD8Wjhwm_GmZ-6shbYdpIxt3F6R-Zi-DplK3CaFoEZGPj2F4hzg/exec"; 

function attemptLogin() {
  const userId = document.getElementById('userId').value;
  if (!userId) { 
    alert('학번을 입력해주세요.'); 
    return; 
  }

  document.getElementById('loading-msg').style.display = 'block';

  // 표준 fetch API 사용
  fetch(`${API_URL}?action=login&id=${userId}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        sessionStorage.setItem('userRole', data.role);
        sessionStorage.setItem('userId', data.id); 
        sessionStorage.setItem('userName', data.name);
        
        // 로그인 성공 시 main.html 파일로 이동
        window.location.href = 'main.html';
      } else {
        document.getElementById('loading-msg').style.display = 'none';
        alert('일치하는 학번이 없습니다.');
      }
    })
    .catch(error => {
      document.getElementById('loading-msg').style.display = 'none';
      alert('서버 오류가 발생했습니다: ' + error.message);
    });
}
