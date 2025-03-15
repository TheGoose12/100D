// 100 Day Discipline Challenge App

// Default challenge data structure
const defaultChallengeData = {
    startDate: new Date().toISOString().split('T')[0],
    challengeItems: [
        { name: "Run", target: 3, metric: "miles" },
        { name: "Read", target: 30, metric: "minutes" },
        { name: "Meditate", target: 10, metric: "minutes" }
    ],
    days: [],
    currentStreak: 0,
    longestStreak: 0
};

// State management
let challengeData = JSON.parse(localStorage.getItem('challengeData')) || defaultChallengeData;

// Motivational videos (YouTube embed codes)
const motivationalVideos = [
    "SuPLxQD4akQ", // "Dream" - Motivational Video by Mateusz M
    "mgmVOuLgFB0", // "Rise and Shine" by Fearless Motivation
    "ZXsQAXx_ao0", // Shia LaBeouf "Just Do It" Motivational Speech
    "hbQUa8Qyx6A", // "Prove Them Wrong" by Fearless Motivation
    "9z4Dft1zdbo", // "The Lion" Motivational Video
    "kjVxgysyLMw", // "The Journey" Motivational Video
    "hV63DbQ_qSc", // "Success is Not an Accident" by Eric Thomas
    "lsSC2vx7zFQ", // "How Bad Do You Want It" by Eric Thomas
    "26U_seo0a1g", // "Unbroken" Motivational Video
    "RNvvRERsC6A"  // "The Mind" Motivational Video
];

// Daily affirmations
const dailyAffirmations = [
    "I am disciplined, focused, and committed to becoming my best self.",
    "Every day in every way, I am getting better and better.",
    "I have the power to create change in my life through consistent daily actions.",
    "I am in control of my habits, and my habits are creating my future.",
    "I am building a foundation for success through discipline and dedication.",
    "I am stronger than my excuses and bigger than my fears.",
    "I transform challenges into opportunities for growth.",
    "I am committed to the process, knowing that small daily improvements lead to remarkable results.",
    "I am proud of myself for showing up and doing the work, even when it's difficult.",
    "I am creating a new version of myself through consistent daily discipline."
];

// DOM Elements
const navButtons = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');

// Initialize App
function initApp() {
    loadData();
    setupEventListeners();
    displayCurrentView();
    updateAllViews();
}

// Load Data from local storage
function loadData() {
    const savedData = localStorage.getItem('challengeData');
    if (savedData) {
        challengeData = JSON.parse(savedData);
    }
}

// Save Data to local storage
function saveData() {
    localStorage.setItem('challengeData', JSON.stringify(challengeData));
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const viewId = btn.id.replace('nav-', '');
            showView(viewId);
        });
    });

    // Config View
    document.getElementById('start-date').addEventListener('change', handleStartDateChange);
    document.getElementById('add-challenge-btn').addEventListener('click', addChallengeItem);
    document.getElementById('save-config-btn').addEventListener('click', saveConfiguration);
    document.getElementById('reset-challenge-btn').addEventListener('click', resetChallenge);

    // Daily View
    document.getElementById('print-daily-btn').addEventListener('click', printDailyView);
    document.getElementById('save-daily-btn').addEventListener('click', saveDailyProgress);
    document.getElementById('new-video-btn').addEventListener('click', loadRandomVideo);

    // Timeline View
    document.getElementById('prev-month').addEventListener('click', () => navigateMonth(-1));
    document.getElementById('next-month').addEventListener('click', () => navigateMonth(1));
}

// Show Current View
function showView(viewId) {
    // Update nav buttons
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.id === `nav-${viewId}`) {
            btn.classList.add('active');
        }
    });

    // Update views
    views.forEach(view => {
        view.classList.remove('active');
        if (view.id === `${viewId}-view`) {
            view.classList.add('active');
        }
    });

    // Scroll to top when changing view
    window.scrollTo(0, 0);

    // Additional updates based on the view
    if (viewId === 'progress') {
        updateProgressView();
    } else if (viewId === 'daily') {
        updateDailyView();
    } else if (viewId === 'timeline') {
        updateTimelineView();
    } else if (viewId === 'config') {
        updateConfigView();
    }
}

// Display Current View based on URL hash or default to progress
function displayCurrentView() {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['progress', 'daily', 'timeline', 'config'].includes(hash)) {
        showView(hash);
    } else {
        showView('progress');
    }
}

// Update All Views
function updateAllViews() {
    updateProgressView();
    updateDailyView();
    updateTimelineView();
    updateConfigView();
}

// Progress View Functions
function updateProgressView() {
    try {
        // Display start date - using proper timezone handling
        const startDateStr = challengeData.startDate;
        const startDateParts = startDateStr.split('-');
        
        // Create date using year, month (0-based), and day to avoid timezone issues
        const startDate = new Date(
            parseInt(startDateParts[0]), 
            parseInt(startDateParts[1]) - 1, // Month is 0-based in JS Date
            parseInt(startDateParts[2])
        );
        
        document.getElementById('display-start-date').textContent = startDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Calculate and display end date (start date + 99 days = 100 day challenge)
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 99);
        document.getElementById('display-end-date').textContent = endDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Calculate days completed
        const daysCompleted = challengeData.days.filter(day => 
            day.challengeItems.every(item => item.completed)).length;
        
        // Update days counter
        document.getElementById('days-completed').textContent = daysCompleted;
        document.getElementById('total-days').textContent = '100';
        
        // Update progress bar
        const progressPercentage = (daysCompleted / 100) * 100;
        document.getElementById('days-progress-bar').style.width = `${progressPercentage}%`;
        
        // Update progress circle animation
        document.documentElement.style.setProperty('--final-percentage', `${progressPercentage}%`);
        
        // Calculate total points
        const totalPoints = calculateTotalPoints();
        document.getElementById('total-points').textContent = totalPoints;
        
        // Update challenge progress
        updateChallengeProgress();
        
        // Update streaks
        document.getElementById('current-streak').textContent = challengeData.currentStreak;
        document.getElementById('longest-streak').textContent = challengeData.longestStreak;
    } catch (e) {
        console.error("Error updating progress view:", e);
    }
}

function updateChallengeProgress() {
    const challengeProgressContainer = document.getElementById('challenge-items-progress');
    challengeProgressContainer.innerHTML = '';
    
    challengeData.challengeItems.forEach(item => {
        // Calculate total for this challenge
        const totalForChallenge = calculateTotalForChallenge(item.name);
        
        const progressItem = document.createElement('div');
        progressItem.className = 'challenge-progress-item';
        progressItem.innerHTML = `
            <h4>${item.name} <span class="challenge-total">${totalForChallenge} ${item.metric}</span></h4>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${Math.min((totalForChallenge / (item.target * 100)) * 100, 100)}%"></div>
            </div>
        `;
        
        challengeProgressContainer.appendChild(progressItem);
    });
}

function calculateTotalPoints() {
    let totalPoints = 0;
    
    challengeData.days.forEach(day => {
        day.challengeItems.forEach(item => {
            if (item.completed) {
                totalPoints += 1;
            }
        });
    });
    
    return totalPoints;
}

function calculateTotalForChallenge(challengeName) {
    let total = 0;
    
    challengeData.days.forEach(day => {
        const challenge = day.challengeItems.find(item => item.name === challengeName);
        if (challenge && challenge.completed) {
            // Get the target from the main challenge configuration
            const challengeConfig = challengeData.challengeItems.find(item => item.name === challengeName);
            if (challengeConfig) {
                total += challengeConfig.target;
            }
        }
    });
    
    return total;
}

// Daily View Functions
function updateDailyView() {
    try {
        // Get current day number based on start date
        const currentDayNumber = getCurrentDayNumber();
        
        // Day number should be between 1 and 100
        const adjustedDayNumber = Math.min(currentDayNumber, 100);
        
        document.getElementById('current-day-number').textContent = adjustedDayNumber;
        
        // Set current date
        const today = new Date();
        document.getElementById('current-date').textContent = today.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Update checklist
        updateDailyChecklist(adjustedDayNumber);
        
        // Set random affirmation
        const randomIndex = Math.floor(Math.random() * dailyAffirmations.length);
        document.getElementById('affirmation-text').textContent = dailyAffirmations[randomIndex];
        
        // Load random motivational video
        loadRandomVideo();
    } catch (e) {
        console.error("Error updating daily view:", e);
    }
}

function updateDailyChecklist(dayNumber) {
    const form = document.getElementById('daily-challenges-form');
    form.innerHTML = '';
    
    // Check if this day already exists in data
    let dayData = challengeData.days.find(day => day.dayNumber === dayNumber);
    
    // If not, create it
    if (!dayData) {
        dayData = {
            dayNumber: dayNumber,
            date: new Date().toISOString().split('T')[0],
            challengeItems: challengeData.challengeItems.map(item => ({
                name: item.name,
                completed: false
            }))
        };
    }
    
    // Create checklist items
    challengeData.challengeItems.forEach((challengeItem, index) => {
        const dayChallenge = dayData.challengeItems.find(item => item.name === challengeItem.name) || 
            { name: challengeItem.name, completed: false };
        
        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'challenge-checkbox';
        checkboxDiv.innerHTML = `
            <label for="challenge-${index}">
                <input type="checkbox" id="challenge-${index}" 
                    data-challenge="${challengeItem.name}" 
                    ${dayChallenge.completed ? 'checked' : ''}>
                ${challengeItem.name}
            </label>
            <span class="challenge-qty">${challengeItem.target} ${challengeItem.metric}</span>
        `;
        
        form.appendChild(checkboxDiv);
    });
}

function loadRandomVideo() {
    const videoContainer = document.getElementById('video-container');
    const randomIndex = Math.floor(Math.random() * motivationalVideos.length);
    const videoId = motivationalVideos[randomIndex];
    
    videoContainer.innerHTML = `
        <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen></iframe>
    `;
}

function saveDailyProgress() {
    const dayNumber = getCurrentDayNumber();
    const checkboxes = document.querySelectorAll('#daily-challenges-form input[type="checkbox"]');
    
    // Find or create the day data
    let dayIndex = challengeData.days.findIndex(day => day.dayNumber === dayNumber);
    let dayData;
    
    if (dayIndex === -1) {
        // Create new day
        dayData = {
            dayNumber: dayNumber,
            date: new Date().toISOString().split('T')[0],
            challengeItems: []
        };
        challengeData.days.push(dayData);
        dayIndex = challengeData.days.length - 1;
    } else {
        dayData = challengeData.days[dayIndex];
    }
    
    // Update challenge items
    checkboxes.forEach(checkbox => {
        const challengeName = checkbox.dataset.challenge;
        const completed = checkbox.checked;
        
        const challengeItemIndex = dayData.challengeItems.findIndex(item => item.name === challengeName);
        
        if (challengeItemIndex === -1) {
            dayData.challengeItems.push({
                name: challengeName,
                completed: completed
            });
        } else {
            dayData.challengeItems[challengeItemIndex].completed = completed;
        }
    });
    
    // Update streaks
    updateStreaks();
    
    // Save data
    saveData();
    
    // Update views
    updateAllViews();
    
    // Show confirmation
    alert('Progress saved successfully!');
}

function updateStreaks() {
    // Sort days by number
    const sortedDays = [...challengeData.days].sort((a, b) => a.dayNumber - b.dayNumber);
    
    let currentStreak = 0;
    let maxStreak = 0;
    
    // Count consecutive completed days
    for (let i = 0; i < sortedDays.length; i++) {
        const day = sortedDays[i];
        const allCompleted = day.challengeItems.every(item => item.completed);
        
        if (allCompleted) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            // Check if this is today or a future day
            const dayNumber = day.dayNumber;
            const currentDayNumber = getCurrentDayNumber();
            
            if (dayNumber >= currentDayNumber) {
                // Don't break streak for today or future days
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                // Past incomplete day breaks the streak
                currentStreak = 0;
            }
        }
    }
    
    challengeData.currentStreak = currentStreak;
    challengeData.longestStreak = Math.max(challengeData.longestStreak, maxStreak);
}

function printDailyView() {
    // Populate print template
    const dayNumber = getCurrentDayNumber();
    document.getElementById('print-day-number').textContent = dayNumber;
    
    const today = new Date();
    document.getElementById('print-date').textContent = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const printChallenges = document.getElementById('print-challenges');
    printChallenges.innerHTML = '';
    
    challengeData.challengeItems.forEach(item => {
        const challengeItem = document.createElement('div');
        challengeItem.className = 'print-checklist-item';
        challengeItem.innerHTML = `
            <span class="print-checkbox"></span>
            ${item.name} (${item.target} ${item.metric})
        `;
        printChallenges.appendChild(challengeItem);
    });
    
    document.getElementById('print-affirmation').textContent = 
        document.getElementById('affirmation-text').textContent;
    
    // Print
    window.print();
}

// Timeline View Functions
function updateTimelineView() {
    // Set current month and year for display
    const currentDate = new Date();
    updateTimelineMonthDisplay(currentDate);
    
    // Generate timeline
    generateTimeline(currentDate);
}

function updateTimelineMonthDisplay(date) {
    const monthYearText = date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });
    document.getElementById('timeline-month-year').textContent = monthYearText;
}

function generateTimeline(date) {
    const timelineContainer = document.getElementById('timeline-container');
    timelineContainer.innerHTML = '';
    
    // Get the first day of challenge
    const startDateStr = challengeData.startDate;
    if (!startDateStr) return;
    
    const startDateParts = startDateStr.split('-');
    if (startDateParts.length !== 3) return;
    
    // Create date using year, month (0-based), and day to avoid timezone issues
    const startDate = new Date(
        parseInt(startDateParts[0]), 
        parseInt(startDateParts[1]) - 1, // Month is 0-based in JS Date
        parseInt(startDateParts[2])
    );
    
    // Get the first day of the month and the number of days in the month
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    // Calculate days from start of challenge to first day of displayed month
    const daysBetween = Math.floor((firstDayOfMonth - startDate) / (1000 * 60 * 60 * 24));
    
    // Track completed days for connector styling
    let hasCompletedDayBefore = false;
    
    // For each day in the month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const currentDate = new Date(date.getFullYear(), date.getMonth(), i);
        const dayNumber = daysBetween + i;
        
        // Skip days outside the challenge period
        if (dayNumber <= 0 || dayNumber > 100) {
            continue;
        }
        
        // Determine day status
        let status = 'future';
        let statusText = 'Upcoming';
        
        // Find if this day has data
        const dayData = challengeData.days.find(day => day.dayNumber === dayNumber);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const isToday = currentDate.toDateString() === today.toDateString();
        
        if (currentDate > today) {
            status = 'future';
            statusText = 'Upcoming';
        } else if (dayData) {
            const allCompleted = dayData.challengeItems.every(item => item.completed);
            if (allCompleted) {
                status = 'completed';
                statusText = 'Completed';
            } else {
                status = 'missed';
                statusText = 'Incomplete';
            }
        } else if (isToday) {
            status = 'today';
            statusText = 'Today';
        } else {
            status = 'missed';
            statusText = 'Missed';
        }
        
        // Create day element
        const dayElement = document.createElement('div');
        dayElement.className = 'timeline-day';
        
        // Create connector line
        const connector = document.createElement('div');
        connector.className = 'timeline-connector';
        
        // Make connector active if this day and the previous day are both completed
        if (status === 'completed' && hasCompletedDayBefore) {
            connector.classList.add('active');
        }
        
        // Update the completed day tracker
        hasCompletedDayBefore = (status === 'completed');
        
        // Create dot
        const dot = document.createElement('div');
        dot.className = `day-dot ${status}`;
        
        // Create info container
        const infoContainer = document.createElement('div');
        infoContainer.className = 'day-info';
        
        // Left side with day number and date
        const leftInfo = document.createElement('div');
        
        const dayNumberSpan = document.createElement('div');
        dayNumberSpan.className = 'day-number';
        dayNumberSpan.textContent = `Day ${dayNumber}`;
        
        const dayDateSpan = document.createElement('div');
        dayDateSpan.className = 'day-date';
        dayDateSpan.textContent = currentDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        
        leftInfo.appendChild(dayNumberSpan);
        leftInfo.appendChild(dayDateSpan);
        
        // Right side with status
        const rightInfo = document.createElement('div');
        rightInfo.className = `day-status ${status}`;
        rightInfo.textContent = statusText;
        
        // Add to info container
        infoContainer.appendChild(leftInfo);
        infoContainer.appendChild(rightInfo);
        
        // Add all elements to day container
        dayElement.appendChild(connector);
        dayElement.appendChild(dot);
        dayElement.appendChild(infoContainer);
        
        timelineContainer.appendChild(dayElement);
    }
}

function navigateMonth(direction) {
    // Get current displayed month
    const monthYearText = document.getElementById('timeline-month-year').textContent;
    const [month, year] = monthYearText.split(' ');
    
    // Create date object
    const date = new Date(`${month} 1, ${year}`);
    
    // Navigate to new month
    date.setMonth(date.getMonth() + direction);
    
    // Update timeline
    updateTimelineMonthDisplay(date);
    generateTimeline(date);
}

// Config View Functions
function updateConfigView() {
    // Set start date
    document.getElementById('start-date').value = challengeData.startDate;
    
    // Update challenge items
    updateChallengeItemsConfig();
}

function updateChallengeItemsConfig() {
    const container = document.getElementById('challenge-items-config');
    container.innerHTML = '';
    
    challengeData.challengeItems.forEach((item, index) => {
        const itemForm = document.createElement('div');
        itemForm.className = 'challenge-item-form';
        itemForm.innerHTML = `
            <div class="form-group">
                <label for="challenge-name-${index}">Challenge Name</label>
                <input type="text" id="challenge-name-${index}" value="${item.name}" required>
            </div>
            <div class="form-group">
                <label for="challenge-target-${index}">Daily Target</label>
                <input type="number" id="challenge-target-${index}" value="${item.target}" min="1" required>
            </div>
            <div class="form-group">
                <label for="challenge-metric-${index}">Metric (e.g., miles, minutes, pages)</label>
                <input type="text" id="challenge-metric-${index}" value="${item.metric}" required>
            </div>
            <div class="challenge-item-actions">
                <button type="button" class="remove-challenge-btn" data-index="${index}">Remove</button>
            </div>
        `;
        
        container.appendChild(itemForm);
    });
    
    // Add event listeners for remove buttons
    document.querySelectorAll('.remove-challenge-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            removeChallengeItem(index);
        });
    });
}

function addChallengeItem() {
    challengeData.challengeItems.push({
        name: "New Challenge",
        target: 1,
        metric: "times"
    });
    
    updateChallengeItemsConfig();
}

function removeChallengeItem(index) {
    if (challengeData.challengeItems.length <= 1) {
        alert("You must have at least one challenge item.");
        return;
    }
    
    challengeData.challengeItems.splice(index, 1);
    updateChallengeItemsConfig();
}

function saveConfiguration() {
    // Update start date
    challengeData.startDate = document.getElementById('start-date').value;
    
    // Update challenge items
    const forms = document.querySelectorAll('.challenge-item-form');
    const newChallengeItems = [];
    
    forms.forEach((form, index) => {
        const name = document.getElementById(`challenge-name-${index}`).value;
        const target = parseInt(document.getElementById(`challenge-target-${index}`).value);
        const metric = document.getElementById(`challenge-metric-${index}`).value;
        
        if (name && target && metric) {
            newChallengeItems.push({ name, target, metric });
        }
    });
    
    if (newChallengeItems.length === 0) {
        alert("You must have at least one challenge item.");
        return;
    }
    
    // Update challenge items
    challengeData.challengeItems = newChallengeItems;
    
    // Update days data to match new challenge items
    challengeData.days.forEach(day => {
        // Keep existing items that are still in the challenge
        const updatedItems = day.challengeItems.filter(item => 
            newChallengeItems.some(newItem => newItem.name === item.name)
        );
        
        // Add new items
        newChallengeItems.forEach(newItem => {
            if (!updatedItems.some(item => item.name === newItem.name)) {
                updatedItems.push({
                    name: newItem.name,
                    completed: false
                });
            }
        });
        
        day.challengeItems = updatedItems;
    });
    
    // Save data
    saveData();
    
    // Update all views
    updateAllViews();
    
    // Show confirmation
    alert("Configuration saved successfully!");
}

function resetChallenge() {
    if (confirm("Are you sure you want to reset the challenge? All progress will be lost.")) {
        // Reset to default but keep challenge items
        const challengeItems = [...challengeData.challengeItems];
        challengeData = {
            startDate: new Date().toISOString().split('T')[0],
            challengeItems: challengeItems,
            days: [],
            currentStreak: 0,
            longestStreak: 0
        };
        
        // Save data
        saveData();
        
        // Update all views
        updateAllViews();
        
        // Show confirmation
        alert("Challenge has been reset!");
    }
}

function handleStartDateChange() {
    // Update days data when start date changes
    const newStartDate = new Date(document.getElementById('start-date').value);
    const oldStartDate = new Date(challengeData.startDate);
    
    // Calculate day difference
    const dayDifference = Math.floor((newStartDate - oldStartDate) / (1000 * 60 * 60 * 24));
    
    if (dayDifference !== 0) {
        // Adjust all day numbers
        challengeData.days.forEach(day => {
            day.dayNumber -= dayDifference;
        });
        
        // Remove days that are now negative
        challengeData.days = challengeData.days.filter(day => day.dayNumber > 0);
    }
}

// Helper Functions
function getCurrentDayNumber() {
    try {
        const startDateStr = challengeData.startDate;
        if (!startDateStr) return 1; // Default to day 1 if no start date
        
        const startDateParts = startDateStr.split('-');
        if (startDateParts.length !== 3) return 1; // Default to day 1 if invalid format
        
        // Create date using year, month (0-based), and day to avoid timezone issues
        const startDate = new Date(
            parseInt(startDateParts[0]), 
            parseInt(startDateParts[1]) - 1, // Month is 0-based in JS Date
            parseInt(startDateParts[2])
        );
        
        if (isNaN(startDate.getTime())) return 1; // Default to day 1 if invalid date
        
        const today = new Date();
        
        // Reset time part for accurate day calculation
        startDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        // Calculate difference in days
        const diffTime = today - startDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // Day numbers start from 1
        return Math.max(1, diffDays + 1);
    } catch (e) {
        console.error("Error calculating day number:", e);
        return 1; // Default to day 1 if any error occurs
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', initApp);

// Handle hash changes
window.addEventListener('hashchange', displayCurrentView);