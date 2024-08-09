const axios = require('axios');

const BASE_URL = 'http://localhost:3333/api'; // Replace with your actual API base URL

async function registerUser(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      email,
      password,
    });
    console.log('User registered successfully:', response.data);
  } catch (error) {
    console.error(
      'Error registering user:',
      error.response?.data || error.message
    );
  }
}

async function loginUser(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password,
    });
    console.log('User logged in successfully:', response.data);
    return response.data.session.access_token;
  } catch (error) {
    console.error('Error logging in:', error.response?.data || error.message);
  }
}

async function getProfile(accessToken) {
  try {
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log('User profile:', response.data);
    return response.data.id; // Assuming the user ID is in the `id` field of the response
  } catch (error) {
    console.error(
      'Error fetching profile:',
      error.response?.data || error.message
    );
  }
}

async function createWorkoutSession(accessToken, userId) {
  try {
    const response = await axios.post(
      `${BASE_URL}/workout-sessions`,
      {
        userId,
        date: new Date().toISOString(),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log('Workout session created successfully:', response.data);
    return response.data.id;
  } catch (error) {
    console.error(
      'Error creating workout session:',
      error.response?.data || error.message
    );
  }
}

async function fetchAllWorkoutSessions(accessToken) {
  try {
    const response = await axios.get(`${BASE_URL}/workout-sessions`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log('All workout sessions:', response.data);
    return response.data;
  } catch (error) {
    console.error(
      'Error fetching all workout sessions:',
      error.response?.data || error.message
    );
  }
}

async function fetchWorkoutSessionById(accessToken, sessionId) {
  try {
    const response = await axios.get(
      `${BASE_URL}/workout-sessions/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log(`Workout session ${sessionId}:`, response.data);
  } catch (error) {
    console.error(
      `Error fetching workout session by ID (${sessionId}):`,
      error.response?.data || error.message
    );
  }
}

async function fetchMyWorkoutSessions(accessToken) {
  try {
    const response = await axios.get(`${BASE_URL}/workout-sessions/mine`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log('My workout sessions:', response.data);
  } catch (error) {
    console.error(
      'Error fetching my workout sessions:',
      error.response?.data || error.message
    );
  }
}

async function deleteUser(accessToken, userId) {
  try {
    const response = await axios.delete(`${BASE_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log('User deleted successfully:', response.data);
  } catch (error) {
    console.error(
      'Error deleting user:',
      error.response?.data || error.message
    );
  }
}

async function runTests() {
  const email = 'xeppen+test@gmail.com';
  const password = 'test123';

  console.log('Step 1: Registering user...');
  await registerUser(email, password);

  console.log('Step 2: Logging in user...');
  const accessToken = await loginUser(email, password);
  if (!accessToken) {
    console.error('Login failed, stopping test.');
    return;
  }

  console.log('Step 3: Verifying logged-in user profile...');
  const userId = await getProfile(accessToken);
  if (!userId) {
    console.error('Failed to fetch user profile, stopping test.');
    return;
  }

  console.log('Step 4: Creating an empty workout session...');
  const workoutSessionId = await createWorkoutSession(accessToken, userId);

  console.log('Step 5: Fetching all workout sessions...');
  await fetchAllWorkoutSessions(accessToken);

  console.log('Step 6: Fetching workout session by ID...');
  await fetchWorkoutSessionById(accessToken, workoutSessionId);

  console.log('Step 7: Fetching my workout sessions...');
  await fetchMyWorkoutSessions(accessToken);

  console.log('Step 8: Deleting the user...');
  await deleteUser(accessToken, userId);
}

runTests();
