let challenges = JSON.parse(localStorage.getItem('challenges')) || [];
let completedDays = JSON.parse(localStorage.getItem('completedDays')) || {};

const challengeList = document.getElementById('challengeList');
const timerDisplay = document.getElementById('timerDisplay');
const stepsContainer = document.getElementById('stepsContainer');

const timelineModal = document.getElementById('timelineModal');
const modalTitle = document.getElementById('modalTitle');
const modalTimeline = document.getElementById('modalTimeline');
const closeModal = document.getElementById('closeModal');

let currentChallenge = null;
let timerInterval = null;
const calendarModal = document.getElementById('calendarModal');
const openCalendarBtn = document.getElementById('openCalendarBtn');
const closeCalendarModal = document.getElementById('closeCalendarModal');

const timerModal = document.getElementById('timerModal');
//const closeTimerModal = document.getElementById('closeTimerModal');
const closeTimerModalBtn = document.getElementById('closeTimerModalBtn');

// Abrir modal do timer
function openTimerModal() {
    timerModal.classList.add('active');
}

// Fechar modal do timer
//closeTimerModal.addEventListener('click', () => timerModal.classList.remove('active'));
//closeTimerModalBtn.addEventListener('click', () => timerModal.classList.remove('active'));



openCalendarBtn.addEventListener('click', () => {
    renderCalendar(); // renderiza calendário atualizado
    calendarModal.classList.add('active');
});

closeCalendarModal.addEventListener('click', () => {
    calendarModal.classList.remove('active');
});


// Renderiza lista de desafios
// Renderiza lista de desafios
function renderChallenges() {
    const challengeListEl = document.getElementById('challengeList');
    challengeListEl.innerHTML = ''; // limpa a lista

    // Lista de classes de cor disponíveis
    const colorClasses = [
        'bg-primary',
        'bg-secondary',
        'bg-dark',
        'bg-gray',
        'bg-success',
        'bg-warning',
        'bg-error',
        'text-primary',
        'text-secondary',
        'text-dark',
        'text-gray',
        'text-light',
        'text-success',
        'text-warning',
        'text-error'
    ];

    challenges.forEach((ch, idx) => {
        // Escolher cor aleatória
        const randomColor = colorClasses[Math.floor(Math.random() * colorClasses.length)];

        // Criar chip do desafio
        const chip = document.createElement('div');
        chip.className = `chip ${randomColor}`;
        chip.innerHTML = `
            <span>${ch.name} (${ch.time}s)</span>
            <a href="#" class="btn btn-clear" aria-label="Close" role="button"></a>
        `;

        // Abrir modal ao clicar no chip (não no botão de remover)
        chip.querySelector('span').addEventListener('click', () => openModal(idx));

        // Remover desafio ao clicar no botão "X"
        chip.querySelector('.btn-clear').addEventListener('click', (e) => {
            e.stopPropagation();
            challenges.splice(idx, 1);
            renderChallenges();
        });

        challengeListEl.appendChild(chip);
    });

    localStorage.setItem('challenges', JSON.stringify(challenges));
}


// Adicionar campo de passo
document.getElementById('addStepBtn').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Descreva o passo';
    input.className = 'form-input';
    stepsContainer.appendChild(input);
});

// Adicionar desafio
document.getElementById('addChallengeBtn').addEventListener('click', () => {
    const name = document.getElementById('challengeName').value.trim();
    const time = parseInt(document.getElementById('challengeTime').value);
    if (!name || !time) return alert('Preencha nome e tempo');

    const stepInputs = stepsContainer.querySelectorAll('input');
    const steps = Array.from(stepInputs).map(input => input.value).filter(s => s);

    challenges.push({ name, time, steps });
    document.getElementById('challengeName').value = '';
    document.getElementById('challengeTime').value = '';
    stepsContainer.innerHTML = '';
    renderChallenges();
});

// Abrir modal com timeline
function openModal(idx) {
    currentChallenge = challenges[idx];
    modalTitle.textContent = currentChallenge.name;
    modalTimeline.innerHTML = '';
    currentChallenge.steps.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        modalTimeline.appendChild(li);
    });
    timelineModal.classList.add('active');
}

// Fechar modal
closeModal.addEventListener('click', () => timelineModal.classList.remove('active'));

// Sortear desafio aleatório e iniciar direto
document.getElementById('randomChallengeBtn').addEventListener('click', () => {
    if (challenges.length === 0) return alert('Adicione pelo menos um desafio!');
    const idx = Math.floor(Math.random() * challenges.length);
    startChallenge(idx);
});

// Iniciar desafio
function startChallenge(idx) {
    const ch = challenges[idx];
    let seconds = ch.time;
    timerDisplay.textContent = `${ch.name} — ${seconds}s`;

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        seconds--;
        timerDisplay.textContent = `${ch.name} — ${seconds}s`;
        if (seconds <= 0) {
            clearInterval(timerInterval);
            timerDisplay.textContent = `✅ ${ch.name} concluído!`;

            // Marcar no calendário
            const today = new Date().toISOString().split('T')[0];
            completedDays[today] = ch.name;
            localStorage.setItem('completedDays', JSON.stringify(completedDays));
            renderCalendar();
        }
    }, 1000);
}

/// Renderizar calendário com dias da semana e destaque no dia atual
function renderCalendar() {
    const calendarEl = document.getElementById('calendar');
    calendarEl.innerHTML = '';

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    // --- Cabeçalho com nome do mês e ano ---
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.textContent = `${monthNames[month]} ${year}`;
    calendarEl.appendChild(header);

    // --- Nomes dos dias da semana ---
    dayNames.forEach(name => {
        const dayNameEl = document.createElement('div');
        dayNameEl.className = 'day-name';
        dayNameEl.textContent = name;
        calendarEl.appendChild(dayNameEl);
    });

    // --- Espaços vazios antes do primeiro dia ---
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
        const empty = document.createElement('div');
        empty.className = 'day empty';
        calendarEl.appendChild(empty);
    }

    // --- Dias do mês ---
    for (let d = 1; d <= lastDate; d++) {
        const td = document.createElement('div');
        td.className = 'day';
        const dateStr = new Date(year, month, d).toISOString().split('T')[0];
        td.textContent = d;

        // Dia atual
        if (d === today) td.classList.add('today');

        // Dias completados
        if (completedDays[dateStr]) {
            td.classList.add('completed');
            const span = document.createElement('span');
            span.textContent = completedDays[dateStr];
            td.appendChild(span);
        }

        calendarEl.appendChild(td);
    }
}



// Abrir modal com timeline
function openModal(idx) {
    currentChallenge = challenges[idx];
    modalTitle.textContent = currentChallenge.name;
    const timelineContainer = document.getElementById('modalTimeline');
    timelineContainer.innerHTML = '';

    currentChallenge.steps.forEach((step, stepIdx) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.id = `timeline-step-${stepIdx}`;

        const left = document.createElement('div');
        left.className = 'timeline-left';

        const icon = document.createElement('a');
        icon.className = 'timeline-icon';
        icon.href = `#timeline-step-${stepIdx}`;
        if (stepIdx > 0) icon.classList.add('icon-lg'); // exemplo para ícones maiores
        const iTag = document.createElement('i');
        iTag.className = 'icon icon-check';
        icon.appendChild(iTag);
        left.appendChild(icon);

        const content = document.createElement('div');
        content.className = 'timeline-content';
        content.textContent = step;

        item.appendChild(left);
        item.appendChild(content);
        timelineContainer.appendChild(item);
    });

    timelineModal.classList.add('active');
}

function startChallenge(idx) {
    const ch = challenges[idx];
    let seconds = ch.time;

    // Abrir modal
    openTimerModal();
    const timerDisplay = document.getElementById('timerDisplay');

    timerDisplay.textContent = `${ch.name} — ${seconds}s`;

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        seconds--;
        timerDisplay.textContent = `${ch.name} — ${seconds}s`;
        if (seconds <= 0) {
            clearInterval(timerInterval);
            timerDisplay.textContent = `✅ ${ch.name} concluído!`;
            // Marcar no calendário
            const today = new Date().toISOString().split('T')[0];
            completedDays[today] = ch.name;
            localStorage.setItem('completedDays', JSON.stringify(completedDays));
            renderCalendar();
        }
    }, 1000);
}


function openTimerModal(challenge) {
    const timerModal = document.getElementById('timerModal');
    const timerDisplay = document.getElementById('timerDisplay');
    const timelineContainer = document.getElementById('timerModalTimeline');

    // Abrir modal
    timerModal.classList.add('active');

    // Reset timer display
    timerDisplay.textContent = `${challenge.name} — ${challenge.time}s`;

    // Preencher timeline se existir
    timelineContainer.innerHTML = '';
    if (challenge.steps && challenge.steps.length > 0) {
        challenge.steps.forEach((step, idx) => {
            const li = document.createElement('li');
            li.textContent = step;
            timelineContainer.appendChild(li);
        });
    }
}


function startChallenge(idx) {
    const ch = challenges[idx];
    let seconds = ch.time;

    // Abrir modal do timer com timeline
    openTimerModal(ch);

    // Atualizar timer a cada segundo
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        seconds--;
        document.getElementById('timerDisplay').textContent = `${ch.name} — ${seconds}s`;

        if (seconds <= 0) {
            clearInterval(timerInterval);
            document.getElementById('timerDisplay').textContent = `✅ ${ch.name} concluído!`;

            // Marcar no calendário
            const today = new Date().toISOString().split('T')[0];
            completedDays[today] = ch.name;
            localStorage.setItem('completedDays', JSON.stringify(completedDays));
            renderCalendar();

            // Fechar modal ao final do desafio
            document.getElementById('timerModal').classList.remove('active');
        }
    }, 1000);
}



// Inicialização
renderChallenges();
renderCalendar();
