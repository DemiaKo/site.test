// Налаштування (Ключі для фронтенду можна брати з .env, але для простоти встав URL і ANON key сюди)
// УВАГА: Тут вставляй ключ ANON (public), а не service_role!


const timelineContainer = document.getElementById('timeline-container');

async function loadHistory() {
    // 1. Беремо дані, сортуємо: спочатку нові роки, всередині року - старі події зверху
    const { data: events, error } = await supabase
        .from('history')
        .select('*')
        .order('year', { ascending: false }) // 2025, 2024, 2023...
        .order('id', { ascending: true });   // Порядок додавання всередині року

    if (error) {
        console.error('Помилка:', error);
        return;
    }

    // 2. ГРУПУВАННЯ: Перетворюємо список подій на об'єкт типу { "2024": [подія1, подія2], "2023": [подія1] }
    const groupedByYear = {};
    
    events.forEach(event => {
        if (!groupedByYear[event.year]) {
            groupedByYear[event.year] = [];
        }
        groupedByYear[event.year].push(event);
    });

    // 3. МАЛЮВАННЯ НА СТОРІНЦІ
    // Проходимось по роках (ключі об'єкта)
    Object.keys(groupedByYear).sort((a, b) => b - a).forEach(year => {
        
        const yearEvents = groupedByYear[year]; // Список подій цього року

        // Створюємо головний блок timeline-item
        const item = document.createElement('div');
        item.classList.add('timeline-item'); // Твій клас CSS

        // Блок року
        const yearBlock = document.createElement('div');
        yearBlock.classList.add('timeline-year'); // Твій клас для кружечка з роком
        yearBlock.textContent = year;

        // Блок контенту (білий прямокутник)
        const contentBlock = document.createElement('div');
        contentBlock.classList.add('timeline-content'); // Твій клас для тексту

        // Наповнюємо контент подіями
        yearEvents.forEach((event, index) => {
            // Якщо це не перша подія в цьому році - додаємо лінію
            if (index > 0) {
                const hr = document.createElement('hr');
                contentBlock.appendChild(hr);
            }

            // Заголовок
            const h3 = document.createElement('h3');
            h3.textContent = event.title;
            contentBlock.appendChild(h3);

            // Текст
            const p = document.createElement('p');
            p.textContent = event.description;
            contentBlock.appendChild(p);
        });

        // Збираємо все докупи
        item.appendChild(yearBlock);
        item.appendChild(contentBlock);
        timelineContainer.appendChild(item);
    });
}

// Запускаємо функцію при завантаженні
loadHistory();
alert("працює");