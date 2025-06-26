// DOM Elements
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const heroSignupBtn = document.getElementById('hero-signup-btn');
const demoStartBtn = document.getElementById('demo-start-btn');
const uploadPhotoBtn = document.getElementById('upload-photo-btn');
const photoInput = document.getElementById('photo-input');
const completeWorkoutBtn = document.getElementById('complete-workout-btn');

// Modal Elements
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const profileModal = document.getElementById('profile-modal');
const workoutContainer = document.getElementById('workout-container');

// Form Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const profileForm = document.getElementById('profile-form');

// Exercise Elements
const exerciseCards = document.querySelectorAll('.exercise-card');
const currentExercise = document.getElementById('current-exercise');
const currentExerciseWorkout = document.getElementById('workout-current-exercise');
const currentSet = document.getElementById('current-set');
const currentRep = document.getElementById('current-rep');
const calories = document.getElementById('calories');
const workoutTimer = document.getElementById('workout-timer');
const workoutExerciseTimer = document.getElementById('workout-exercise-timer');

// Animation Controls
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const workoutPlayBtn = document.getElementById('workout-play-btn');
const workoutPrevBtn = document.getElementById('workout-prev-btn');
const workoutNextBtn = document.getElementById('workout-next-btn');

// Three.js Variables
let animationScene, animationCamera, animationRenderer, animationModel;
let mixer, clock, currentAction;
let isPlaying = false;

// App State
let currentUser = null;
let currentDay = 1;
let totalDays = 120;
let caloriesBurned = 0;
let workoutPlan = null;
let currentWorkout = null;
let currentExerciseIndex = 0;
let timerInterval;
let currentTimerSeconds = 45;
let notificationPermission = Notification.permission;

// Exercise Data
const exercises = {
  pushups: {
    name: "Pushups",
    category: "Chest & Triceps",
    sets: 3,
    reps: 12,
    calories: 48,
    duration: 45,
    difficulty: "beginner",
    maleModel: "models/male_pushup.glb",
    femaleModel: "models/female_pushup.glb"
  },
  squats: {
    name: "Squats",
    category: "Legs & Glutes",
    sets: 3,
    reps: 15,
    calories: 52,
    duration: 60,
    difficulty: "beginner",
    maleModel: "models/male_squat.glb",
    femaleModel: "models/female_squat.glb"
  },
  pullups: {
    name: "Pullups",
    category: "Back & Biceps",
    sets: 3,
    reps: 8,
    calories: 56,
    duration: 60,
    difficulty: "advanced",
    maleModel: "models/male_pullup.glb",
    femaleModel: "models/female_pullup.glb"
  },
  lunges: {
    name: "Lunges",
    category: "Legs & Glutes",
    sets: 3,
    reps: 10,
    calories: 50,
    duration: 50,
    difficulty: "intermediate",
    maleModel: "models/male_lunge.glb",
    femaleModel: "models/female_lunge.glb"
  }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in
  const storedUser = localStorage.getItem('fitmaster_user');
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    updateAuthUI();
    
    // Load user's workout plan if it exists
    if (currentUser.workoutPlan) {
      workoutPlan = currentUser.workoutPlan;
      currentDay = currentUser.currentDay || 1;
      updateWorkoutPlanUI();
    }
  }
  
  // Initialize Three.js animation
  initAnimation();
  
  // Setup exercise selection
  setupExerciseSelection();
  
  // Request notification permission
  requestNotificationPermission();
});

// Authentication Functions
function updateAuthUI() {
  if (currentUser) {
    document.querySelectorAll('.unauth-only').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.auth-only').forEach(el => el.style.display = 'block');
    document.getElementById('user-name').textContent = currentUser.name;
    closeAllModals();
  } else {
    document.querySelectorAll('.unauth-only').forEach(el => el.style.display = 'block');
    document.querySelectorAll('.auth-only').forEach(el => el.style.display = 'none');
  }
}

function closeAllModals() {
  loginModal.style.display = 'none';
  signupModal.style.display = 'none';
  profileModal.style.display = 'none';
}

// Event Listeners
loginBtn.addEventListener('click', () => {
  loginModal.style.display = 'flex';
  signupModal.style.display = 'none';
});

signupBtn.addEventListener('click', () => {
  signupModal.style.display = 'flex';
  loginModal.style.display = 'none';
});

heroSignupBtn.addEventListener('click', () => {
  signupModal.style.display = 'flex';
  loginModal.style.display = 'none';
});

document.getElementById('show-signup').addEventListener('click', (e) => {
  e.preventDefault();
  loginModal.style.display = 'none';
  signupModal.style.display = 'flex';
});

document.getElementById('show-login').addEventListener('click', (e) => {
  e.preventDefault();
  signupModal.style.display = 'none';
  loginModal.style.display = 'flex';
});

logoutBtn.addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem('fitmaster_user');
  updateAuthUI();
});

// Form Submissions
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  // In a real app, this would be an API call to your backend
  const users = JSON.parse(localStorage.getItem('fitmaster_users')) || [];
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    currentUser = user;
    localStorage.setItem('fitmaster_user', JSON.stringify(currentUser));
    updateAuthUI();
    
    // Show profile modal if profile isn't complete
    if (!user.weight || !user.height || !user.fitnessLevel) {
      profileModal.style.display = 'flex';
    }
  } else {
    alert('Invalid email or password');
  }
});

signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  
  // In a real app, this would be an API call to your backend
  const users = JSON.parse(localStorage.getItem('fitmaster_users')) || [];
  
  if (users.some(u => u.email === email)) {
    alert('Email already exists');
    return;
  }
  
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password,
    joinDate: new Date().toISOString(),
    trialEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days from now
  };
  
  users.push(newUser);
  localStorage.setItem('fitmaster_users', JSON.stringify(users));
  
  currentUser = newUser;
  localStorage.setItem('fitmaster_user', JSON.stringify(currentUser));
  
  // Show profile completion modal
  profileModal.style.display = 'flex';
  signupModal.style.display = 'none';
  updateAuthUI();
});

profileForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Collect all profile data
  currentUser = {
    ...currentUser,
    gender: document.getElementById('profile-gender').value,
    age: parseInt(document.getElementById('profile-age').value),
    weight: parseFloat(document.getElementById('profile-weight').value),
    height: parseInt(document.getElementById('profile-height').value),
    bodyFat: parseFloat(document.getElementById('profile-bodyfat').value) || null,
    fitnessLevel: document.getElementById('profile-fitness-level').value,
    equipment: Array.from(document.querySelectorAll('input[name="equipment"]:checked')).map(el => el.value),
    injuries: Array.from(document.querySelectorAll('input[name="injuries"]:checked')).map(el => el.value),
    diet: document.getElementById('profile-diet').value,
    activityLevel: document.getElementById('profile-activity').value,
    progressPhotos: [],
    currentDay: 1
  };
  
  // Generate workout plan based on profile
  currentUser.workoutPlan = generateWorkoutPlan(currentUser);
  workoutPlan = currentUser.workoutPlan;
  
  // Save updated user
  localStorage.setItem('fitmaster_user', JSON.stringify(currentUser));
  
  // Update all users array
  const users = JSON.parse(localStorage.getItem('fitmaster_users')) || [];
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  if (userIndex !== -1) {
    users[userIndex] = currentUser;
    localStorage.setItem('fitmaster_users', JSON.stringify(users));
  }
  
  // Close modal and update UI
  profileModal.style.display = 'none';
  updateAuthUI();
  updateWorkoutPlanUI();
  
  // Schedule notifications
  scheduleWorkoutNotifications();
});

// Workout Plan Generation
function generateWorkoutPlan(user) {
  // This is a simplified version - in a real app this would be more sophisticated
  const plan = {
    duration: 120, // days
    restDays: [3, 6], // rest on Wednesdays and Saturdays
    workouts: []
  };
  
  // Generate workouts for each day
  for (let day = 1; day <= plan.duration; day++) {
    if (plan.restDays.includes(day % 7)) {
      plan.workouts.push({ type: 'rest' });
    } else {
      // Determine workout based on user's fitness level and available equipment
      let workout = {
        type: 'workout',
        day,
        exercises: [],
        cardio: {
          type: 'jumping_jacks',
          duration: 5 // minutes
        }
      };
      
      // Add exercises based on user's level and equipment
      if (user.fitnessLevel === 'beginner') {
        workout.exercises.push(
          { ...exercises.pushups, sets: 2, reps: 8 },
          { ...exercises.squats, sets: 2, reps: 10 }
        );
      } else if (user.fitnessLevel === 'intermediate') {
        workout.exercises.push(
          { ...exercises.pushups, sets: 3, reps: 12 },
          { ...exercises.squats, sets: 3, reps: 15 },
          { ...exercises.lunges, sets: 2, reps: 10 }
        );
      } else { // advanced
        workout.exercises.push(
          { ...exercises.pushups, sets: 4, reps: 15 },
          { ...exercises.squats, sets: 4, reps: 20 },
          { ...exercises.lunges, sets: 3, reps: 12 },
          { ...exercises.pullups, sets: 3, reps: 8 }
        );
      }
      
      // Adjust based on equipment
      if (!user.equipment.includes('pullup-bar') && user.fitnessLevel === 'advanced') {
        // Replace pullups with something else
        workout.exercises = workout.exercises.filter(ex => ex.name !== 'Pullups');
        workout.exercises.push({
          name: "Incline Pushups",
          category: "Chest & Triceps",
          sets: 3,
          reps: 12,
          calories: 45,
          duration: 45,
          difficulty: "intermediate"
        });
      }
      
      // Adjust for injuries
      workout.exercises = workout.exercises.filter(ex => isExerciseSafe(ex, user));
      
      plan.workouts.push(workout);
    }
  }
  
  return plan;
}

function isExerciseSafe(exercise, user) {
  const backProblems = user.injuries.includes('back');
  const kneeProblems = user.injuries.includes('knee');
  const shoulderProblems = user.injuries.includes('shoulder');
  const wristProblems = user.injuries.includes('wrist');
  
  if (backProblems && exercise.category.includes('Back')) {
    return false;
  }
  
  if (kneeProblems && (exercise.name.includes('Squat') || exercise.name.includes('Lunge'))) {
    return false;
  }
  
  if (shoulderProblems && exercise.category.includes('Shoulder')) {
    return false;
  }
  
  if (wristProblems && (exercise.name.includes('Pushup') || exercise.name.includes('Press'))) {
    return false;
  }
  
  return true;
}

// Workout Plan UI
function updateWorkoutPlanUI() {
  // 1. First validate all required data exists
  if (!workoutPlan || !currentUser || !workoutPlan.workouts) {
    console.error("Missing workout plan or user data");
    document.getElementById('workout-plan').innerHTML = `
      <div class="error-message" style="padding: 20px; text-align: center; color: white;">
        <h3>Workout Data Missing</h3>
        <p>Please complete your profile to generate a workout plan</p>
        <button class="btn btn-primary" onclick="document.getElementById('profile-modal').style.display='flex'">
          Complete Profile
        </button>
      </div>
    `;
    return;
  }

  // 2. Validate currentDay is within bounds
  if (currentDay < 1 || currentDay > workoutPlan.workouts.length) {
    console.error(`Invalid currentDay: ${currentDay}`);
    currentDay = Math.max(1, Math.min(currentDay, workoutPlan.workouts.length));
  }

  // 3. Update progress display
  document.getElementById('day-counter').textContent = `Day ${currentDay} of ${totalDays}`;
  document.getElementById('workout-progress').style.width = `${(currentDay / totalDays) * 100}%`;
  
  const workoutPlanElement = document.getElementById('workout-plan');
  workoutPlanElement.innerHTML = '';
  
  const todayWorkout = workoutPlan.workouts[currentDay - 1];

  // 4. Additional safety check for today's workout
  if (!todayWorkout) {
    console.error("No workout found for current day");
    workoutPlanElement.innerHTML = `
      <div class="error-message">
        <h3>Workout Not Found</h3>
        <p>Please regenerate your workout plan</p>
        <button class="btn btn-primary" onclick="generateWorkoutPlan(currentUser)">
          Regenerate Plan
        </button>
      </div>
    `;
    return;
  }

  // 5. Rest day handling
  if (todayWorkout.type === 'rest') {
    workoutPlanElement.innerHTML = `
      <div class="rest-day">
        <h3>Rest Day</h3>
        <p>Today is a recovery day. Your body needs rest to rebuild and get stronger.</p>
        <p>Consider doing some light stretching or yoga.</p>
      </div>
    `;
    return;
  }

  // 6. Workout day handling (with exercise validation)
  if (!todayWorkout.cardio || !todayWorkout.exercises) {
    console.error("Invalid workout structure");
    workoutPlanElement.innerHTML = `
      <div class="error-message">
        <h3>Invalid Workout</h3>
        <p>This workout contains invalid data</p>
      </div>
    `;
    return;
  }

  // 7. Safe exercise list generation
  const exerciseHTML = todayWorkout.exercises
    .filter(ex => ex && ex.name) // Filter out invalid exercises
    .map(ex => `
      <div class="workout-card" data-exercise="${ex.name.toLowerCase().replace(/ /g, '_')}">
        <h4>${ex.name}</h4>
        <p>${ex.sets || 0} sets × ${ex.reps || 0} reps</p>
        <p>${ex.category || 'General'} • ${ex.difficulty || 'Medium'}</p>
      </div>
    `)
    .join('');

  // 8. Final workout day display
  workoutPlanElement.innerHTML = `
    <div class="workout-day">
      <h3>Day ${currentDay} Workout</h3>
      <div class="workout-card">
        <h4>Cardio Warm-up</h4>
        <p>${(todayWorkout.cardio.type || 'General cardio').replace(/_/g, ' ')} for ${todayWorkout.cardio.duration || 5} minutes</p>
      </div>
      ${exerciseHTML}
      <button id="start-workout-btn" class="btn btn-primary">
        <i class="fas fa-play"></i> Start Workout
      </button>
    </div>
  `;
  
  // 9. Safe event listener attachment
  const startBtn = document.getElementById('start-workout-btn');
  if (startBtn) {
    startBtn.addEventListener('click', startWorkout);
  } else {
    console.error("Start workout button not found");
  }
}

// Workout Execution
function startWorkout() {
  if (!workoutPlan || !currentUser) return;
  
  currentWorkout = workoutPlan.workouts[currentDay - 1];
  currentExerciseIndex = 0;
  caloriesBurned = 0;
  
  // Update UI
  workoutContainer.style.display = 'block';
  document.getElementById('workout-day-title').textContent = `Day ${currentDay} Workout`;
  
  // Start with cardio
  startCardio();
}

function startCardio() {
  const cardio = currentWorkout.cardio;
  
  document.getElementById('workout-summary').innerHTML = `
    <h4>Cardio Warm-up</h4>
    <p>${cardio.type.replace(/_/g, ' ')} for ${cardio.duration} minutes</p>
    <p>Get your heart rate up and muscles warmed up before strength training.</p>
  `;
  
  // In a real app, you might have a cardio timer here
  // For now we'll just proceed to first exercise after a delay
  setTimeout(startNextExercise, 2000);
}

function startNextExercise() {
  if (currentExerciseIndex >= currentWorkout.exercises.length) {
    // Workout complete
    completeWorkout();
    return;
  }
  
  const exercise = currentWorkout.exercises[currentExerciseIndex];
  currentExerciseWorkout.textContent = exercise.name;
  document.getElementById('workout-current-set').textContent = '1';
  document.getElementById('workout-current-rep').textContent = exercise.reps;
  document.getElementById('workout-calories').textContent = exercise.calories;
  currentTimerSeconds = exercise.duration;
  updateWorkoutTimer();
  
  // Update workout summary
  document.getElementById('workout-summary').innerHTML = `
    <h4>${exercise.name}</h4>
    <p>${exercise.sets} sets × ${exercise.reps} reps</p>
    <p>${exercise.category}</p>
    <p>Estimated calories: ${exercise.calories}</p>
    <div class="progress-container" style="margin-top: 1rem;">
      <div class="progress-bar" style="width: ${(currentExerciseIndex / currentWorkout.exercises.length) * 100}%; height: 5px; background: var(--accent);"></div>
    </div>
    <p>Exercise ${currentExerciseIndex + 1} of ${currentWorkout.exercises.length}</p>
  `;
  
  // Load the appropriate 3D animation
  loadExerciseAnimation(exercise.name.toLowerCase().replace(/ /g, '_'));
  
  // Start timer
  startExerciseTimer();
}

function startExerciseTimer() {
  if (timerInterval) clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    currentTimerSeconds--;
    updateWorkoutTimer();
    
    if (currentTimerSeconds <= 0) {
      clearInterval(timerInterval);
      exerciseTimerComplete();
    }
  }, 1000);
}

function updateWorkoutTimer() {
  const minutes = Math.floor(currentTimerSeconds / 60);
  const seconds = currentTimerSeconds % 60;
  workoutExerciseTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function exerciseTimerComplete() {
  const exercise = currentWorkout.exercises[currentExerciseIndex];
  
  // Update calories burned
  caloriesBurned += exercise.calories;
  document.getElementById('calorie-counter').textContent = caloriesBurned;
  
  // Move to next set or next exercise
  const currentSet = parseInt(document.getElementById('workout-current-set').textContent);
  if (currentSet < exercise.sets) {
    // Next set
    document.getElementById('workout-current-set').textContent = currentSet + 1;
    currentTimerSeconds = exercise.duration;
    updateWorkoutTimer();
    startExerciseTimer();
  } else {
    // Next exercise
    currentExerciseIndex++;
    startNextExercise();
  }
}

function completeWorkout() {
  // Update user progress
  currentDay++;
  currentUser.currentDay = currentDay;
  
  // Save user
  localStorage.setItem('fitmaster_user', JSON.stringify(currentUser));
  
  // Update all users array
  const users = JSON.parse(localStorage.getItem('fitmaster_users')) || [];
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  if (userIndex !== -1) {
    users[userIndex] = currentUser;
    localStorage.setItem('fitmaster_users', JSON.stringify(users));
  }
  
  // Close workout and update UI
  workoutContainer.style.display = 'none';
  updateWorkoutPlanUI();
  
  // Show completion message
  alert(`Great job! You've completed Day ${currentDay - 1}. You burned ${caloriesBurned} calories today.`);
}

completeWorkoutBtn.addEventListener('click', completeWorkout);

// Exercise Selection
function setupExerciseSelection() {
  exerciseCards.forEach(card => {
    card.addEventListener('click', () => {
      exerciseCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      
      const exercise = card.dataset.exercise;
      const exerciseData = exercises[exercise];
      
      currentExercise.textContent = exerciseData.name;
      document.getElementById('current-set').textContent = '1';
      document.getElementById('current-rep').textContent = exerciseData.reps;
      document.getElementById('calories').textContent = exerciseData.calories;
      currentTimerSeconds = exerciseData.duration;
      workoutTimer.textContent = `${Math.floor(currentTimerSeconds / 60).toString().padStart(2, '0')}:${(currentTimerSeconds % 60).toString().padStart(2, '0')}`;
      
      // Load the appropriate 3D animation
      loadExerciseAnimation(exercise);
    });
  });
}

// Three.js Animation System
function initAnimation() {
  // Setup scene
  animationScene = new THREE.Scene();
  animationScene.background = new THREE.Color(0x1e1e2d);
  
  // Setup camera
  animationCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  animationCamera.position.z = 5;
  
  // Setup renderer
  const animationContainer = document.getElementById('exercise-animation') || document.getElementById('workout-animation');
  animationRenderer = new THREE.WebGLRenderer({ antialias: true });
  animationRenderer.setSize(animationContainer.clientWidth, animationContainer.clientHeight);
  animationContainer.appendChild(animationRenderer.domElement);
  
  // Add lights
  const ambientLight = new THREE.AmbientLight(0x404040);
  animationScene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  animationScene.add(directionalLight);
  
  // Clock for animations
  clock = new THREE.Clock();
  
  // Handle window resize
  window.addEventListener('resize', () => {
    animationCamera.aspect = animationContainer.clientWidth / animationContainer.clientHeight;
    animationCamera.updateProjectionMatrix();
    animationRenderer.setSize(animationContainer.clientWidth, animationContainer.clientHeight);
  });
  
  // Start with default exercise
  loadExerciseAnimation('pushups');
}

function loadExerciseAnimation(exerciseKey) {
  // Clear previous model
  if (animationModel) {
    animationScene.remove(animationModel);
    if (mixer) {
      mixer.stopAllAction();
    }
  }
  
  const exercise = exercises[exerciseKey];
  if (!exercise) return;
  
  // Create a simple humanoid figure
  const bodyGeometry = new THREE.BoxGeometry(1, 2, 0.5);
  const armGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
  const legGeometry = new THREE.BoxGeometry(0.4, 1, 0.4);
  
  const material = new THREE.MeshPhongMaterial({ 
    color: 0x4cc9f0,
    skinning: true
  });
  
  // Create body parts
  const body = new THREE.Mesh(bodyGeometry, material);
  const leftArm = new THREE.Mesh(armGeometry, material);
  const rightArm = new THREE.Mesh(armGeometry, material);
  const leftLeg = new THREE.Mesh(legGeometry, material);
  const rightLeg = new THREE.Mesh(legGeometry, material);
  
  // Position body parts
  leftArm.position.set(-0.8, 0.5, 0);
  rightArm.position.set(0.8, 0.5, 0);
  leftLeg.position.set(-0.3, -1.5, 0);
  rightLeg.position.set(0.3, -1.5, 0);
  
  // Create a group for the model
  animationModel = new THREE.Group();
  animationModel.add(body);
  animationModel.add(leftArm);
  animationModel.add(rightArm);
  animationModel.add(leftLeg);
  animationModel.add(rightLeg);
  
  animationScene.add(animationModel);
  
  // Create simple animation based on exercise
  createExerciseAnimation(exerciseKey);
  
  // Start animation loop
  animate();
}

function createExerciseAnimation(exerciseKey) {
  if (!animationModel) return;
  
  // Clear any existing animation
  if (mixer) {
    mixer.stopAllAction();
  }
  
  mixer = new THREE.AnimationMixer(animationModel);
  
  // Create simple keyframe animations for each exercise type
  const times = [0, 1, 2, 3];
  const positions = [];
  
  switch(exerciseKey) {
    case 'pushups':
      // Pushup animation - arms move up and down
      positions[0] = { x: -0.8, y: 0.5, z: 0 };
      positions[1] = { x: -0.8, y: -0.5, z: 0 };
      positions[2] = { x: -0.8, y: 0.5, z: 0 };
      positions[3] = { x: -0.8, y: -0.5, z: 0 };
      break;
    case 'squats':
      // Squat animation - legs bend
      positions[0] = { x: -0.3, y: -1.5, z: 0 };
      positions[1] = { x: -0.3, y: -1.0, z: 0 };
      positions[2] = { x: -0.3, y: -1.5, z: 0 };
      positions[3] = { x: -0.3, y: -1.0, z: 0 };
      break;
    case 'pullups':
      // Pullup animation - arms move up
      positions[0] = { x: -0.8, y: 0.5, z: 0 };
      positions[1] = { x: -0.8, y: 1.0, z: 0 };
      positions[2] = { x: -0.8, y: 0.5, z: 0 };
      positions[3] = { x: -0.8, y: 1.0, z: 0 };
      break;
    case 'lunges':
      // Lunge animation - one leg moves forward
      positions[0] = { x: -0.3, y: -1.5, z: 0 };
      positions[1] = { x: -0.6, y: -1.5, z: 0.5 };
      positions[2] = { x: -0.3, y: -1.5, z: 0 };
      positions[3] = { x: -0.6, y: -1.5, z: 0.5 };
      break;
    default:
      // Default idle animation
      positions[0] = { x: -0.8, y: 0.5, z: 0 };
      positions[1] = { x: -0.8, y: 0.5, z: 0 };
      positions[2] = { x: -0.8, y: 0.5, z: 0 };
      positions[3] = { x: -0.8, y: 0.5, z: 0 };
  }
  
  // Create animation tracks
  const tracks = [];
  
  // Left arm animation
  tracks.push(new THREE.VectorKeyframeTrack(
    '.leftArm.position', 
    times,
    [positions[0].x, positions[0].y, positions[0].z,
     positions[1].x, positions[1].y, positions[1].z,
     positions[2].x, positions[2].y, positions[2].z,
     positions[3].x, positions[3].y, positions[3].z]
  ));
  
  // Right arm animation (mirror left arm for pushups)
  if (exerciseKey === 'pushups') {
    tracks.push(new THREE.VectorKeyframeTrack(
      '.rightArm.position', 
      times,
      [0.8, positions[0].y, positions[0].z,
       0.8, positions[1].y, positions[1].z,
       0.8, positions[2].y, positions[2].z,
       0.8, positions[3].y, positions[3].z]
    ));
  }
  
  // Leg animations for squats and lunges
  if (exerciseKey === 'squats' || exerciseKey === 'lunges') {
    tracks.push(new THREE.VectorKeyframeTrack(
      '.leftLeg.position', 
      times,
      [positions[0].x, positions[0].y, positions[0].z,
       positions[1].x, positions[1].y, positions[1].z,
       positions[2].x, positions[2].y, positions[2].z,
       positions[3].x, positions[3].y, positions[3].z]
    ));
    
    // For lunges, move right leg back
    if (exerciseKey === 'lunges') {
      tracks.push(new THREE.VectorKeyframeTrack(
        '.rightLeg.position', 
        times,
        [0.3, -1.5, 0,
         0.6, -1.5, -0.5,
         0.3, -1.5, 0,
         0.6, -1.5, -0.5]
      ));
    }
  }
  
  // Create animation clip
  const clip = new THREE.AnimationClip(exerciseKey, 3, tracks);
  
  // Play animation
  currentAction = mixer.clipAction(clip);
  currentAction.setLoop(THREE.LoopRepeat);
  currentAction.play();
}

function animate() {
  requestAnimationFrame(animate);
  
  if (mixer) {
    mixer.update(clock.getDelta());
  }
  
  animationRenderer.render(animationScene, animationCamera);
}

// Animation Controls
playBtn.addEventListener('click', toggleAnimation);
workoutPlayBtn.addEventListener('click', toggleAnimation);

function toggleAnimation() {
  if (!currentAction) return;
  
  isPlaying = !isPlaying;
  
  if (isPlaying) {
    currentAction.play();
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    workoutPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
  } else {
    currentAction.pause();
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    workoutPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
  }
}

prevBtn.addEventListener('click', () => {
  // Move to previous exercise
  const currentCard = document.querySelector('.exercise-card.active');
  const prevCard = currentCard.previousElementSibling || exerciseCards[exerciseCards.length - 1];
  prevCard.click();
});

nextBtn.addEventListener('click', () => {
  // Move to next exercise
  const currentCard = document.querySelector('.exercise-card.active');
  const nextCard = currentCard.nextElementSibling || exerciseCards[0];
  nextCard.click();
});

// Progress Photos
uploadPhotoBtn.addEventListener('click', () => {
  photoInput.click();
});

photoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  // In a real app, you would upload this to a server
  // For this demo, we'll create a local URL
  const photoUrl = URL.createObjectURL(file);
  
  // Add to user's progress photos
  currentUser.progressPhotos.push({
    date: new Date().toISOString(),
    imageUrl: photoUrl
  });
  
  // Save user
  localStorage.setItem('fitmaster_user', JSON.stringify(currentUser));
  
  // Update all users array
  const users = JSON.parse(localStorage.getItem('fitmaster_users')) || [];
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  if (userIndex !== -1) {
    users[userIndex] = currentUser;
    localStorage.setItem('fitmaster_users', JSON.stringify(users));
  }
  
  // Update UI
  updateProgressPhotos();
});

function updateProgressPhotos() {
  const progressPhotosContainer = document.getElementById('progress-photos');
  progressPhotosContainer.innerHTML = '';
  
  currentUser.progressPhotos.forEach((photo, index) => {
    const photoElement = document.createElement('div');
    photoElement.className = 'progress-photo';
    photoElement.innerHTML = `
      <img src="${photo.imageUrl}" alt="Progress photo day ${index + 1}">
      <div class="photo-info">
        <span>Day ${index + 1}</span>
        <span>${new Date(photo.date).toLocaleDateString()}</span>
      </div>
    `;
    progressPhotosContainer.appendChild(photoElement);
  });
}

// Notifications
function requestNotificationPermission() {
  if (notificationPermission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      notificationPermission = permission;
      if (permission === 'granted') {
        scheduleWorkoutNotifications();
      }
    });
  } else if (notificationPermission === 'granted') {
    scheduleWorkoutNotifications();
  }
}

function scheduleWorkoutNotifications() {
  if (!currentUser || !workoutPlan || notificationPermission !== 'granted') return;
  
  // Clear any existing notifications
  if (window.workoutNotificationInterval) {
    clearInterval(window.workoutNotificationInterval);
  }
  
  // Schedule notifications for workout days at 7am
  window.workoutNotificationInterval = setInterval(() => {
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Check if today is a workout day (not a rest day)
    const isWorkoutDay = !workoutPlan.restDays.includes(currentDayOfWeek);
    
    if (isWorkoutDay && now.getHours() === 7 && now.getMinutes() === 0) {
      new Notification('FitMaster Pro Reminder', {
        body: `It's time for your Day ${currentUser.currentDay} workout! Let's get moving!`,
        icon: 'https://yourwebsite.com/logo.png'
      });
    }
  }, 60000); // Check every minute
}

// Demo Start Button
demoStartBtn.addEventListener('click', () => {
  if (!currentUser) {
    signupModal.style.display = 'flex';
    return;
  }
  
  // Create a demo workout
  currentWorkout = {
    type: 'workout',
    day: 0,
    exercises: [
      { ...exercises.pushups, sets: 2, reps: 8 },
      { ...exercises.squats, sets: 2, reps: 10 }
    ],
    cardio: {
      type: 'jumping_jacks',
      duration: 3
    }
  };
  
  currentExerciseIndex = 0;
  caloriesBurned = 0;
  
  // Update UI
  workoutContainer.style.display = 'block';
  document.getElementById('workout-day-title').textContent = 'Demo Workout';
  
  // Start with cardio
  startCardio();
});