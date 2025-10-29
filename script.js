// Timer to calculate the duration of the relationship
const timerElement = document.getElementById('timer');
const startDate = new Date('2025-07-21T00:00:00'); // Start date

function updateTimer() {
    const now = new Date();
    const elapsed = now - startDate;

    const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
    const hours = Math.floor((elapsed / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((elapsed / (1000 * 60)) % 60);
    const seconds = Math.floor((elapsed / 1000) % 60);

    timerElement.textContent = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
}

setInterval(updateTimer, 1000);
updateTimer();

// Today's Story
const storyElement = document.getElementById('story');
const stories = [
    "Once upon a time, we went on a magical trip to the mountains and discovered a hidden waterfall.",
    "Remember the time we baked cookies together and ended up with a flour fight?",
    "Our first movie night was unforgettable, especially when we laughed so hard at the comedy that we cried.",
    "The day we adopted our little puppy was the happiest day of our lives.",
    "Our spontaneous road trip to the beach turned into the most romantic evening under the stars."
];

function updateStory() {
    const today = new Date().getDate();
    const storyIndex = today % stories.length;
    storyElement.textContent = stories[storyIndex];
}

updateStory();

// 【加载数据】 - 在代码开始时加载
const storedMoodData = localStorage.getItem('moodData');
const moodData = storedMoodData ? JSON.parse(storedMoodData) : {};

// Define userOptions globally to fix the ReferenceError
const userOptions = ['sp1', '62r'];

// Ensure the calendar highlights today's date and supports month navigation
const today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth();

document.getElementById('current-month').textContent = `${currentYear}年${currentMonth + 1}月`;

generateCalendar(currentYear, currentMonth);

function generateCalendar(year, month) {
    const calendarElement = document.querySelector('.calendar');
    calendarElement.innerHTML = '';

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const headers = ['日', '一', '二', '三', '四', '五', '六'];
    headers.forEach(header => {
        const headerElement = document.createElement('div');
        headerElement.classList.add('header');
        headerElement.textContent = header;
        calendarElement.appendChild(headerElement);
    });

    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        calendarElement.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        const key = `${year}-${month + 1}-${day}`;

        let content = `<div style="font-weight: bold; margin-bottom: 5px;">${day}</div>`;

        if (moodData[key]) {
            const moodMap = {};
            moodData[key].forEach(entry => {
                const [user, emoji] = entry.split(': ');
                moodMap[user.trim()] = emoji.trim();
            });

            const sp1Mood = moodMap['sp1'] || ' ';
            const _62rMood = moodMap['62r'] || ' ';

            content += `
                <div style="display: flex; justify-content: center; font-size: 1.2em;">
                    <span title="sp1">${sp1Mood}</span>
                    <span title="62r">${_62rMood}</span>
                </div>
            `;
        }

        dayCell.innerHTML = content;
        dayCell.onclick = () => openDateModal(day, year, month);

        // 【关键修正】: 使用 classList 来标记今天，让 CSS 来设置棕色背景
        if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
            dayCell.classList.add('today'); 
        }

        calendarElement.appendChild(dayCell);
    }
}

function createModalOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '999';
    document.body.appendChild(overlay);
}

function removeModalOverlay() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.remove();
    }
}

function openDateModal(day, year, month) {
    document.getElementById('user-modal')?.remove();
    document.getElementById('mood-modal')?.remove();
    document.getElementById('log-modal')?.remove();

    const userButtons = userOptions.map(user => {
        return `<button onclick="selectUser('${user}', ${day}, ${year}, ${month})">${user}</button>`;
    }).join('');

    const modalContent = `
        <div class="modal-content">
            <h3>记录 ${year}年${month + 1}月${day}日 的心情</h3>
            <p>请选择用户:</p>
            <div>${userButtons}</div>
            <button onclick="document.getElementById('user-modal').remove()" style="margin-top: 15px;">关闭</button>
        </div>
    `;

    createModal('user-modal', modalContent);

    // 打开日志模态框
    const logKey = `${year}-${month + 1}-${day}`;
    const existingLog = localStorage.getItem(`log-${logKey}`) || '';

    const logModalContent = `
        <div class="modal-content">
            <h3>${year}年${month + 1}月${day}日 日志</h3>
            <textarea id="log-input" style="width: 100%; height: 150px;">${existingLog}</textarea>
            <button onclick="saveLog('${logKey}')" style="margin-top: 15px;">保存</button>
            <button onclick="document.getElementById('log-modal').remove()" style="margin-top: 15px;">关闭</button>
        </div>
    `;

    createModal('log-modal', logModalContent);
}

function saveLog(logKey) {
    const logInput = document.getElementById('log-input');
    if (logInput) {
        localStorage.setItem(`log-${logKey}`, logInput.value);
        document.getElementById('log-modal')?.remove();
        generateCalendar(currentYear, currentMonth);
    }
}

function selectUser(user, day, year, month) {
    document.getElementById('user-modal')?.remove();

    const moodOptions = [
        { emoji: '😊', label: '开心' },
        { emoji: '😢', label: '难过' },
        { emoji: '😡', label: '生气' },
        { emoji: '😴', label: '困困' },
        { emoji: '❤️', label: '幸福' },
        { emoji: '🔥', label: '屁股着火' },
    ];

    const moodButtons = moodOptions.map(option => {
        return `<button onclick="selectMood('${user}', ${day}, ${year}, ${month}, '${option.emoji}')">${option.emoji} ${option.label}</button>`;
    }).join('');

    const clearButton = `
        <button onclick="selectMood('${user}', ${day}, ${year}, ${month}, '')" style="background-color: #e74c3c; color: white; border-color: #e74c3c;">
            &#10005; 清除心情
        </button>
    `;

    const modalContent = `
        <div class="modal-content">
            <h3>${user} 的心情记录</h3>
            <p>选择您的心情:</p>
            <div>${moodButtons}</div>
            <div style="margin-top: 15px;">${clearButton}</div>
            <button onclick="document.getElementById('mood-modal').remove()" style="margin-top: 15px;">关闭</button>
        </div>
    `;

    createModal('mood-modal', modalContent);
}

function selectMood(user, day, year, month, emoji) {
    document.getElementById('mood-modal')?.remove();

    const key = `${year}-${month + 1}-${day}`;
    if (!moodData[key]) {
        moodData[key] = [];
    }

    const entryPrefix = `${user}:`;
    const existingIndex = moodData[key].findIndex(entry => entry.startsWith(entryPrefix));

    if (emoji === '') {
        if (existingIndex !== -1) {
            moodData[key].splice(existingIndex, 1);
        }
        if (moodData[key].length === 0) {
            delete moodData[key];
        }
    } else {
        if (existingIndex !== -1) {
            moodData[key][existingIndex] = `${user}: ${emoji}`;
        } else {
            moodData[key].push(`${user}: ${emoji}`);
        }
    }

    localStorage.setItem('moodData', JSON.stringify(moodData));

    generateCalendar(currentYear, currentMonth);
}

function changeMonth(direction) {
    currentMonth += direction;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    document.getElementById('current-month').textContent = `${currentYear}年${currentMonth + 1}月`;
    generateCalendar(currentYear, currentMonth);
}

function createModal(id, htmlContent) {
    // Create modal
    const modal = document.createElement('div');
    modal.id = id;
    modal.innerHTML = htmlContent;
    modal.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
        background-color: #fff; padding: 25px; border-radius: 10px; 
        z-index: 1000; min-width: 300px; text-align: center;
    `;

    // Prevent clicks inside modal from closing it
    modal.onclick = (e) => e.stopPropagation();

    document.body.appendChild(modal);
}

function saveLogForToday() {
    const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const logInput = document.getElementById('log-input');
    if (logInput) {
        localStorage.setItem(`log-${todayKey}`, logInput.value);
        alert('Log saved successfully!');
    }
}

function updateStoryAndLog() {
    const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const existingLog = localStorage.getItem(`log-${todayKey}`) || '';
    const logInput = document.getElementById('log-input');
    if (logInput) {
        logInput.value = existingLog;
    }
}

updateStoryAndLog();
