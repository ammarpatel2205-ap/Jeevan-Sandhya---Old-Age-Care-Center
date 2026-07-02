const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});

/* ================= SIGNUP FORM ================= */
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  const response = await fetch("http://localhost:5000/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      email,
      password,
      role: "user"   // default signup as user
    }),
  });

  const data = await response.json();
  alert(data.message);
});

/* ================= LOGIN FORM ================= */
document.getElementById("signin-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("signin-email").value;
  const password = document.getElementById("signin-password").value;

  // role selected (Admin/User)
  const role = document.querySelector('input[name="role"]:checked').value;

  const response = await fetch("http://localhost:5000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });

  const data = await response.json();

  if (data.success) {
    alert("Logged in successfully");
    localStorage.setItem("token", data.token);

    // ✅ ROLE BASED REDIRECT
    if (data.role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "home.html";
    }
  } else {
    alert(data.message);
  }
});
