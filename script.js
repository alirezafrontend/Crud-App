const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const extraForm = document.getElementById("extraForm");
const userInfoDiv = document.getElementById("userInfo");
const userTableBody = document.getElementById("userTableBody");
const switchFormBtn = document.getElementById("switchFormBtn");
const goBackBtn = document.getElementById("goBackBtn");
const adminPanel = document.getElementById("adminPanel");
const adminTableBody = document.getElementById("adminTableBody");
const adminBackBtn = document.getElementById("adminBackBtn");
const loadingOverlay = document.getElementById("loadingOverlay");

let userData = {};
let isEditing = false;

function togglePassword(icon) {
  const passwordInput = icon.previousElementSibling;
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

function validateFullName(input) {
  input.value = input.value
    .replace(/[^\u0600-\u06FFa-zA-Z\s]/g, "")
    .substring(0, 16);
}

function validateAge(input) {
  input.value = input.value.replace(/[^0-9]/g, "").substring(0, 2);
}

function validateJobCity(input) {
  input.value = input.value
    .replace(/[^\u0600-\u06FFa-zA-Z\s]/g, "")
    .substring(0, 16);
}

function validatePassword(input) {
  input.value = input.value
    .replace(/[^a-zA-Z0-9!@#$%^&*]/g, "")
    .substring(0, 14);
}

document.querySelectorAll('input[name="FullName"]').forEach((input) => {
  input.addEventListener("input", () => validateFullName(input));
});

document.querySelectorAll('input[name="Age"]').forEach((input) => {
  input.addEventListener("input", () => validateAge(input));
});

document.querySelectorAll('input[name="Job"]').forEach((input) => {
  input.addEventListener("input", () => validateJobCity(input));
});

document.querySelectorAll('input[name="City"]').forEach((input) => {
  input.addEventListener("input", () => validateJobCity(input));
});

document.querySelectorAll('input[name="Password"]').forEach((input) => {
  input.addEventListener("input", () => validatePassword(input));
});

function fillAdminCredentials() {
  const adminCheck = document.getElementById("adminCheck");
  const emailInput = loginForm.querySelector('input[name="Email"]');
  const passwordInput = loginForm.querySelector('input[name="Password"]');

  if (adminCheck.checked) {
    emailInput.value = "admin@example.com";
    passwordInput.value = "admin";
  } else {
    emailInput.value = "";
    passwordInput.value = "";
  }
}

function showLoading() {
  loadingOverlay.style.display = "flex";
}

function hideLoading() {
  loadingOverlay.style.display = "none";
}

switchFormBtn.addEventListener("click", () => {
  if (signupForm.classList.contains("hidden")) {
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    switchFormBtn.textContent = "Already have an account? Login";
    signupForm.reset();
    loginForm.reset();
  } else {
    signupForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
    switchFormBtn.textContent = "Don't have an account? Sign up";
    signupForm.reset();
    loginForm.reset();
  }
});

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showLoading();

  userData = {
    FullName: signupForm.querySelector('input[name="FullName"]').value,
    Email: signupForm.querySelector('input[name="Email"]').value,
    Password: signupForm.querySelector('input[name="Password"]').value,
  };

  try {
    const res = await fetch(
      "https://6800c30ab72e9cfaf7289da7.mockapi.io/users/users",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      }
    );

    const data = await res.json();
    userData.id = data.id;

    signupForm.classList.add("hidden");
    extraForm.classList.remove("hidden");
    switchFormBtn.classList.add("hidden");
    signupForm.reset();
    renderUserTable();
  } finally {
    hideLoading();
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showLoading();

  try {
    const email = loginForm.querySelector('input[name="Email"]').value;
    const password = loginForm.querySelector('input[name="Password"]').value;

    const res = await fetch(
      "https://6800c30ab72e9cfaf7289da7.mockapi.io/users/users"
    );
    const users = await res.json();

    const foundUser = users.find(
      (user) => user.Email === email && user.Password === password
    );

    if (email === "admin@example.com" && password === "admin") {
      loginForm.classList.add("hidden");
      switchFormBtn.classList.add("hidden");
      adminPanel.classList.remove("hidden");
      loginForm.reset();
      renderAdminTable();
      return;
    }

    if (foundUser) {
      userData = foundUser;

      loginForm.classList.add("hidden");
      userInfoDiv.classList.remove("hidden");
      switchFormBtn.classList.add("hidden");
      goBackBtn.classList.remove("hidden");
      loginForm.reset();

      renderUserTable();
    } else {
      alert("User not found. Please check your email and password.");
      loginForm.reset();
    }
  } finally {
    hideLoading();
  }
});

extraForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showLoading();

  try {
    Object.assign(userData, {
      Age: extraForm.querySelector('input[name="Age"]').value,
      Job: extraForm.querySelector('input[name="Job"]').value,
      City: extraForm.querySelector('input[name="City"]').value,
    });

    const res = await fetch(
      `https://6800c30ab72e9cfaf7289da7.mockapi.io/users/users/${userData.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      }
    );

    const updated = await res.json();
    userData = updated;

    extraForm.classList.add("hidden");
    userInfoDiv.classList.remove("hidden");
    goBackBtn.classList.remove("hidden");
    extraForm.reset();
    renderUserTable();
  } finally {
    hideLoading();
  }
});

goBackBtn.addEventListener("click", () => {
  userInfoDiv.classList.add("hidden");
  loginForm.classList.remove("hidden");
  switchFormBtn.classList.remove("hidden");
  goBackBtn.classList.add("hidden");
  loginForm.reset();
});

async function renderAdminTable() {
  showLoading();
  try {
    const res = await fetch(
      "https://6800c30ab72e9cfaf7289da7.mockapi.io/users/users"
    );
    const users = await res.json();

    adminTableBody.innerHTML = "";

    users.forEach((user) => {
      const row = document.createElement("tr");
      row.innerHTML = `
      <td class="p-2">${editableField(
        user.FullName,
        user.id,
        "FullName",
        false,
        "^[\u0600-\u06FFa-zA-Z\\s]{1,16}$"
      )}</td>
      <td class="p-2">${editableField(user.Email, user.id, "Email", true)}</td>
      <td class="p-2">${editableField(
        user.Age,
        user.id,
        "Age",
        false,
        "^[0-9]{1,2}$"
      )}</td>
      <td class="p-2">${editableField(
        user.Job,
        user.id,
        "Job",
        false,
        "^[\u0600-\u06FFa-zA-Z\\s]{1,16}$"
      )}</td>
      <td class="p-2">${editableField(
        user.City,
        user.id,
        "City",
        false,
        "^[\u0600-\u06FFa-zA-Z\\s]{1,16}$"
      )}</td>
      <td class="p-2 space-x-2">
      <button onclick="toggleEditSave('${user.id}')" id="editSaveBtn-${
        user.id
      }" class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-sm">Edit</button>
      <button onclick="deleteUser('${
        user.id
      }')" class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm">Delete</button>
      </td>
       `;
      adminTableBody.appendChild(row);
    });
  } finally {
    hideLoading();
  }
}

function editableField(
  value,
  userId,
  fieldName,
  alwaysDisabled = false,
  pattern = ""
) {
  return `
<input 
type="text" 
id="${fieldName}-${userId}" 
value="${value || ""}" 
class="w-full p-2 border rounded" 
disabled
${alwaysDisabled ? 'data-always-disabled="true"' : ""}
${pattern ? `pattern="${pattern}"` : ""}
oninput="validateField(this, '${fieldName}')"
/>
`;
}

function validateField(input, fieldName) {
  if (fieldName === "FullName" || fieldName === "Job" || fieldName === "City") {
    validateJobCity(input);
  } else if (fieldName === "Age") {
    validateAge(input);
  }
}

function toggleEditSave(userId) {
  const fields = ["FullName", "Email", "Age", "Job", "City"];
  const editSaveBtn = document.getElementById(`editSaveBtn-${userId}`);

  if (editSaveBtn.textContent === "Edit") {
    fields.forEach((field) => {
      const inputField = document.getElementById(`${field}-${userId}`);
      if (!inputField.dataset.alwaysDisabled) {
        inputField.disabled = false;
      }
    });
    editSaveBtn.textContent = "Save";
  } else {
    showLoading();
    const updatedUser = {
      FullName: document.getElementById(`FullName-${userId}`).value,
      Email: document.getElementById(`Email-${userId}`).value,
      Age: document.getElementById(`Age-${userId}`).value,
      Job: document.getElementById(`Job-${userId}`).value,
      City: document.getElementById(`City-${userId}`).value,
    };

    fetch(`https://6800c30ab72e9cfaf7289da7.mockapi.io/users/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    })
      .then(() => {
        renderAdminTable();
      })
      .finally(() => {
        hideLoading();
      });

    fields.forEach((field) => {
      const inputField = document.getElementById(`${field}-${userId}`);
      inputField.disabled = true;
    });
    editSaveBtn.textContent = "Edit";
  }
}

async function deleteUser(id) {
  const confirmDelete = confirm("Are you sure you want to delete this user?");
  if (!confirmDelete) return;

  showLoading();
  try {
    await fetch(
      `https://6800c30ab72e9cfaf7289da7.mockapi.io/users/users/${id}`,
      {
        method: "DELETE",
      }
    );

    renderAdminTable();
  } finally {
    hideLoading();
  }
}

adminBackBtn.addEventListener("click", () => {
  adminPanel.classList.add("hidden");
  loginForm.classList.remove("hidden");
  switchFormBtn.classList.remove("hidden");
  loginForm.reset();
});

function renderUserTable() {
  const table = document.getElementById("userTableBody");
  table.innerHTML = "";

  const row = document.createElement("tr");
  row.innerHTML = `
<td class="p-2">${editableField(
    userData.FullName,
    userData.id,
    "FullName",
    false,
    "^[\u0600-\u06FFa-zA-Z\\s]{1,16}$"
  )}</td>
<td class="p-2">${editableField(
    userData.Email,
    userData.id,
    "Email",
    true
  )}</td>
<td class="p-2">${editableField(
    userData.Age,
    userData.id,
    "Age",
    false,
    "^[0-9]{1,2}$"
  )}</td>
<td class="p-2">${editableField(
    userData.Job,
    userData.id,
    "Job",
    false,
    "^[\u0600-\u06FFa-zA-Z\\s]{1,16}$"
  )}</td>
<td class="p-2">${editableField(
    userData.City,
    userData.id,
    "City",
    false,
    "^[\u0600-\u06FFa-zA-Z\\s]{1,16}$"
  )}</td>
<td class="p-2 space-x-2">
<button onclick="toggleEditSave('${userData.id}')" id="editSaveBtn-${
    userData.id
  }" class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-sm">Edit</button>
</td>
`;
  table.appendChild(row);
}
