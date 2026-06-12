const CSRF_COOKIE_NAME = "csrftoken";
let csrfToken = "";

export const getApiBaseUrl = () =>
    process.env.REACT_APP_API_BASE_URL ||
    (() => {
        if (process.env.NODE_ENV === "production") {
            throw new Error("REACT_APP_API_BASE_URL is required for production.");
        }
        return "http://localhost:8000";
    })();

const getCookie = (name) => {
    const cookies = document.cookie ? document.cookie.split(";") : [];
    for (const cookie of cookies) {
        const [rawKey, ...rawValue] = cookie.trim().split("=");
        if (rawKey === name) {
            return decodeURIComponent(rawValue.join("="));
        }
    }
    return "";
};

export const ensureCsrfToken = async (apiBaseUrl = getApiBaseUrl()) => {
    const existingToken = csrfToken || getCookie(CSRF_COOKIE_NAME);
    if (existingToken) {
        return existingToken;
    }

    const response = await fetch(`${apiBaseUrl}/api/occurrence/csrf/`, {
        method: "GET",
        credentials: "include",
    });
    const data = await response.json().catch(() => ({}));
    csrfToken = data.csrfToken || getCookie(CSRF_COOKIE_NAME);
    return csrfToken;
};

export const csrfFetch = async (url, options = {}) => {
    const method = (options.method || "GET").toUpperCase();
    const shouldAddCsrf = !["GET", "HEAD", "OPTIONS", "TRACE"].includes(method);

    const headers = new Headers(options.headers || {});
    if (shouldAddCsrf && !headers.has("X-CSRFToken")) {
        const token = await ensureCsrfToken();
        if (token) {
            headers.set("X-CSRFToken", token);
        }
    }

    return fetch(url, {
        ...options,
        headers,
        credentials: options.credentials || "include",
    });
};
