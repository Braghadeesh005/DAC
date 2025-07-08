const BASE_URL = 'http://localhost:4000';

export const apiPost = async (endpoint, body = {}, withCredentials = true) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: withCredentials ? 'include' : 'same-origin',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Something went wrong');
  }

  return response.json();
};
