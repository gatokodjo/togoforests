function login() {
  fetch('/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      username: username.value,
      password: password.value
    })
  })
  .then(res => res.json())
  .then(data => {
    if (!data.token) {
      alert(data.error || "Login failed");
      return;
    }

    localStorage.setItem('token', data.token);
    window.location.href = '/admin.html';
  })
  .catch(err => {
    console.error(err);
    alert("Server error");
  });
}