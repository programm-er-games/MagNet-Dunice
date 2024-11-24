document.getElementById("login-button").addEventListener("click", async function (event) {
  event.preventDefault(); // Prevent form submission

  const email = document.getElementById("mail").value;
  const password = document.getElementById("password").value;
  const notice = document.getElementById("notice");
  const noticeText = document.getElementById("notice-text");

  const result = await window.db_api.read("users", is_auth = true);
  window.debug_api.out("result: " + result, "script.js");
  let users_list = {};
  for (const record in result) {
    window.debug_api.out(result[record], "script.js");
    users_list[decodeURI(result[record]['name'])] = {
      login: decodeURI(result[record]['login']),
      password: decodeURI(result[record]['password'])
    };
  }
  const result1 = await window.db_api.read("admins", is_auth = true);
  window.debug_api.out("result1: " + result1, "script.js");
  let admins_list = {};
  for (const record in result1) {
    window.debug_api.out(result1[record], "script.js");
    admins_list[decodeURI(result1[record]['name'])] = {
      login: decodeURI(result1[record]['login']),
      password: decodeURI(result1[record]['password'])
    };
  }

  function check_user() {
    // window.debug_api.out(users_list, "script.js");
    for (const user in users_list) {
      if (email === users_list[user]['login'] && password === users_list[user]['password'])
        return [true, "staff"];
      else if (email === admins_list[user]['login'] && password === admins_list[user]['password'])
        return [true, "admin"];
    }
    return false;
  }

  let check = check_user();
  // window.debug_api.out(check, "script.js");

  // if (!email || !password) {
  //   // Show warning notification for empty fields
  //   showNotification(notice, noticeText, "warning", "Незаполненные поля");
  // } else if (email === "user@example.com" && password === "userpass") {
  //   // Show success notification for correct login and redirect
  //   showNotification(notice, noticeText, "success", "Успешный вход в систему, пользователь");
  //   setTimeout(() => {
  //     window.location.href = "../page/base.html"; // Redirect after a delay
  //   }, 2000);
  // } else if (email === "admin@example.com" && password === "password") {
  //   // Show success notification for correct login and redirect to another page
  //   showNotification(notice, noticeText, "success", "Успешный вход в систему, админ");
  //   setTimeout(() => {
  //     window.location.href = "../admin_page/base.html"; // Redirect to a different page after a delay
  //   }, 2000);
  // } else {
  //   // Show error notification for incorrect login
  //   showNotification(notice, noticeText, "error", "Ошибка: неправильный логин или пароль");
  // }


  if (!email || !password) {
    // Show warning notification for empty fields
    showNotification(notice, noticeText, "warning", "Незаполненные поля");
  }
  else if (check === false) {
    if (email !== "admin@example.com" && password !== "password") {
      // Show error notification for incorrect login
      showNotification(notice, noticeText, "error", "Ошибка: неправильный логин или пароль");
    }
    else {
      showNotification(notice, noticeText, "success", "Успешный вход в систему, админ");
      setTimeout(() => {
        window.location.href = "../admin_page/base.html"; // Redirect after a delay
      }, 2000);
    }
  }
  // else {
  //   if (check[1] === 'staff' || check[1] === 'teacher') {
  //     
  //   }
  //   else if (check[1] === 'admin') {
  //     showNotification(notice, noticeText, "success", "Успешный вход в систему, админ");
  //       setTimeout(() => {
  //         window.location.href = "../admin_page/base.html"; // Redirect to a different page after a delay
  //       }, 2000);
  //   }
  // }

});

function showNotification(notice, noticeText, type, message) {
  notice.className = `notice ${type}`;
  noticeText.textContent = message;
  notice.style.display = "flex";

  setTimeout(() => {
    notice.style.display = "none";
  }, 3000);
}
// 
