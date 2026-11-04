const API = "/api";

function readCookie(name) {
  const cookie = document.cookie.split("; ").find((part) => part.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "";
}

async function postApi(path, payload) {
  let csrfToken = readCookie("csrftoken");
  if (!csrfToken) {
    const accountResponse = await fetch(`${API}/account/`, { credentials: "same-origin" });
    const accountData = await accountResponse.json();
    csrfToken = accountData.csrfToken || readCookie("csrftoken");
  }
  return fetch(`${API}${path}`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
    body: JSON.stringify(payload),
  });
}

export { API, postApi };
