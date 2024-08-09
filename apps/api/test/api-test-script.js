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
  } catch (error) {
    console.error(
      'Error creating workout session:',
      error.response?.data || error.message
    );
  }
}

async function runTests() {
  const email = 'xeppen@gmail.com';
  const password = 'test123';

  //   console.log('Step 1: Registering user...');
  //   await registerUser(email, password);

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
  await createWorkoutSession(accessToken, userId);
}

runTests();
