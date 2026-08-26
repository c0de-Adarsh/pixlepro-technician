import axios from "axios";
const ConstantsUrl = process.env.NEXT_PUBLIC_API_URL || "https://pixle-technician.onrender.com/";


// const Constants = "https://pixle-technician.onrender.com/"
// const ConstantsUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3009/";

let cachedApiKey = "";

async function getOrFetchApiKey() {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("apiKey") || process.env.NEXT_PUBLIC_X_API_KEY;
    if (stored) return stored;
  }
  if (cachedApiKey) return cachedApiKey;

  try {
    const res = await axios.get(ConstantsUrl + "setup/pixlpro-mobile");
    if (res.data?.data?.apiKey) {
      cachedApiKey = res.data.data.apiKey;
      if (typeof window !== "undefined") {
        localStorage.setItem("apiKey", cachedApiKey);
      }
      return cachedApiKey;
    }
  } catch (e) {
    // Fail silently if setup endpoint is unavailable
  }
  return "";
}

async function Api(method, url, data, router) {
  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage?.getItem("token") || "";
  }
  const apiKey = await getOrFetchApiKey();

  const headers = { Authorization: `Bearer ${token}` };
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  try {
    const res = await axios({
      method,
      url: ConstantsUrl + url,
      data,
      headers,
    });
    return res.data;
  } catch (err) {
    console.log(err);
    if (err.response) {
      if (err.response.status === 401 && String(err.response.data?.error || "").includes("JWT")) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("userDetail");
          localStorage.removeItem("token");
          if (router?.push) router.push("/auth/login");
        }
      }
      throw err.response.data || err.response;
    }
    throw err;
  }
}

async function ApiFormData(method, url, data, router) {
  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage?.getItem("token") || "";
  }
  const apiKey = await getOrFetchApiKey();

  const headers = { Authorization: `Bearer ${token}` };
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  try {
    const res = await axios({
      method,
      url: ConstantsUrl + url,
      data,
      headers,
    });
    return res.data;
  } catch (err) {
    console.log(err);
    if (err.response) {
      if (err.response.status === 401 && String(err.response.data?.error || "").includes("JWT")) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("userDetail");
          localStorage.removeItem("token");
          if (router?.push) router.push("/auth/login");
        }
      }
      throw err.response.data || err.response;
    }
    throw err;
  }
}

const timeSince = (date) => {
  date = new Date(date);
  const diff = new Date().valueOf() - date.valueOf();
  const seconds = Math.floor(diff / 1000);
  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " Years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return (
      Math.floor(interval) +
      (Math.floor(interval) > 1 ? " Months" : " Month") +
      " ago"
    );
  }
  interval = seconds / 604800;
  if (interval > 1) {
    return (
      Math.floor(interval) +
      (Math.floor(interval) > 1 ? " Weeks" : " Week") +
      " ago"
    );
  }

  interval = seconds / 86400;
  if (interval > 1) {
    return (
      Math.floor(interval) +
      (Math.floor(interval) > 1 ? " Days" : " Day") +
      " ago"
    );
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return (
      Math.floor(interval) +
      (Math.floor(interval) > 1 ? " Hours" : " Hour") +
      " ago"
    );
  }
  interval = seconds / 60;
  if (interval > 1) {
    return (
      Math.floor(interval) +
      (Math.floor(interval) > 1 ? " Min" : " min") +
      " ago"
    );
  }
  return "Just now";
};

export { Api, timeSince, ApiFormData };
