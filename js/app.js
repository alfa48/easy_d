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

openCalendarBtn.addEventListener('click', () => {
    renderCalendar(); // renderiza calendário atualizado
    calendarModal.classList.add('active');
});

closeCalendarModal.addEventListener('click', () => {
    calendarModal.classList.remove('active');
});


// Renderiza lista de desafios
function renderChallenges() {
    const challengeListEl = document.getElementById('challengeList');
    challengeListEl.innerHTML = ''; // limpa a lista

    challenges.forEach((ch, idx) => {
        // Criar chip do desafio
        const chip = document.createElement('div');
        chip.className = 'chip';
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
    if(!name || !time) return alert('Preencha nome e tempo');

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
    if(challenges.length === 0) return alert('Adicione pelo menos um desafio!');
    const idx = Math.floor(Math.random() * challenges.length);
    startChallenge(idx);
});

// Iniciar desafio
function startChallenge(idx) {
    const ch = challenges[idx];
    let seconds = ch.time;
    timerDisplay.textContent = `${ch.name} — ${seconds}s`;

    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        seconds--;
        timerDisplay.textContent = `${ch.name} — ${seconds}s`;
        if(seconds <= 0) {
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

// Renderizar calendário simples
function renderCalendar() {
    const calendarEl = document.getElementById('calendar');
    calendarEl.innerHTML = '';
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    for(let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'day';
        calendarEl.appendChild(empty);
    }

    for(let d = 1; d <= lastDate; d++) {
        const td = document.createElement('div');
        td.className = 'day';
        const dateStr = new Date(year, month, d).toISOString().split('T')[0];
        td.textContent = d;

        if(completedDays[dateStr]) {
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
        if(stepIdx > 0) icon.classList.add('icon-lg'); // exemplo para ícones maiores
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


// Inicialização
renderChallenges();
renderCalendar();
