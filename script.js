// ===== THEME SYSTEM =====
let currentTheme = localStorage.getItem('zsc_theme') || 'dark';

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('zsc_theme', currentTheme);
    applyTheme();
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);

    const toggles = ['themeToggleMobile', 'themeToggleDesktop'];
    const sliders = ['themeSliderMobile', 'themeSliderDesktop'];

    toggles.forEach(id => {
        const toggle = document.getElementById(id);
        if (toggle) {
            if (currentTheme === 'light') {
                toggle.classList.add('light');
            } else {
                toggle.classList.remove('light');
            }
        }
    });

    sliders.forEach(id => {
        const slider = document.getElementById(id);
        if (slider) {
            slider.textContent = currentTheme === 'dark' ? '🌙' : '☀️';
        }
    });
}

// ===== LANGUAGE SYSTEM =====
let currentLang = localStorage.getItem('zsc_lang') || 'ar';

function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('zsc_lang', currentLang);
    applyLanguage();
}

function applyLanguage() {
    const html = document.documentElement;
    const isArabic = currentLang === 'ar';

    html.setAttribute('lang', currentLang);
    html.setAttribute('dir', isArabic ? 'rtl' : 'ltr');

    document.querySelectorAll('[data-ar][data-en]').forEach(el => {
        el.textContent = isArabic ? el.getAttribute('data-ar') : el.getAttribute('data-en');
    });

    const toggles = ['langToggleMobile', 'langToggleDesktop'];
    const sliders = ['langSliderMobile', 'langSliderDesktop'];

    toggles.forEach(id => {
        const toggle = document.getElementById(id);
        if (toggle) {
            if (isArabic) {
                toggle.classList.remove('ltr');
            } else {
                toggle.classList.add('ltr');
            }
        }
    });

    sliders.forEach(id => {
        const slider = document.getElementById(id);
        if (slider) {
            slider.textContent = isArabic ? 'ar' : 'EN';
        }
    });

    const currentPage = document.querySelector('[id^="page"]:not(.hidden)');
    if (currentPage) {
        const pageName = currentPage.id.replace('page', '').toLowerCase();
        if (pageName === 'home') renderHome();
        if (pageName === 'schedule') renderSchedule();
        if (pageName === 'diary') renderEntries();
        if (pageName === 'subjects') renderSubjects();
        if (pageName === 'athkar') renderAthkarPage();
        if (pageName === 'courses') renderCourses();
        if (pageName === 'settings') renderSettings();
    }
}

// ===== NAVIGATION =====
const ACTIVE_NAV = "bg-[#E30613]/10 text-[#E30613] p-3 rounded-xl font-bold cursor-pointer";
const INACTIVE_NAV = "text-secondary hover:text-primary p-3 rounded-xl transition cursor-pointer";

const ALL_PAGES = ["pageHome", "pageDiary", "pageAthkar", "pageSubjects", "pageSchedule", "pageCourses", "pageSettings"];
const ALL_NAVS = ["navHome", "navDiary", "navAthkar", "navSubjects", "navSchedule", "navCourses", "navSettings"];

// ===== SIDEBAR MOBILE =====
let isSidebarOpen = false;

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    isSidebarOpen = !isSidebarOpen;

    if (isSidebarOpen) {
        sidebar.classList.remove("translate-x-full");
        sidebar.classList.add("translate-x-0");
        overlay.classList.remove("hidden");
        setTimeout(() => overlay.classList.remove("opacity-0"), 10);
    } else {
        sidebar.classList.add("translate-x-full");
        sidebar.classList.remove("translate-x-0");
        overlay.classList.add("opacity-0");
        setTimeout(() => overlay.classList.add("hidden"), 300);
    }
}

function showPage(page) {
    ALL_PAGES.forEach((id) => document.getElementById(id).classList.add("hidden"));
    ALL_NAVS.forEach((id) => (document.getElementById(id).className = INACTIVE_NAV));

    document.getElementById("page" + page.charAt(0).toUpperCase() + page.slice(1)).classList.remove("hidden");
    document.getElementById("nav" + page.charAt(0).toUpperCase() + page.slice(1)).className = ACTIVE_NAV;

    if (page === "home") renderHome();
    if (page === "diary") renderEntries();
    if (page === "athkar") renderAthkarPage();
    if (page === "subjects") renderSubjects();
    if (page === "schedule") renderSchedule();
    if (page === "courses") renderCourses();
    if (page === "settings") renderSettings();

    if (window.innerWidth < 768 && isSidebarOpen) {
        toggleSidebar();
    }
}

// ===== DIARY =====
function saveEntry() {
    const type = document.getElementById("entryType").value;
    const subject = document.getElementById("entrySubject").value.trim();
    const done = document.getElementById("entryDone").value.trim();
    const remaining = document.getElementById("entryRemaining").value.trim();
    const notes = document.getElementById("entryNotes").value.trim();

    if (!subject || !done) {
        showToast(currentLang === 'ar' ? "اكتب اسم المادة وإيه اللي عملته!" : "Enter subject name and what you did!", "error");
        return;
    }

    const entry = {
        id: Date.now(),
        type,
        subject,
        done,
        remaining,
        notes,
        date: new Date().toLocaleDateString(currentLang === 'ar' ? "ar-EG" : "en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            numberingSystem: 'latn'
        }),
    };

    const entries = getEntries();
    entries.unshift(entry);
    localStorage.setItem("zsc_diary", JSON.stringify(entries));

    document.getElementById("entrySubject").value = "";
    document.getElementById("entryDone").value = "";
    document.getElementById("entryRemaining").value = "";
    document.getElementById("entryNotes").value = "";

    renderEntries();
    showToast(currentLang === 'ar' ? "تم حفظ الإنجاز بنجاح يا بطل! 🎉" : "Achievement saved successfully! 🎉", "success");
}

function getEntries() {
    return JSON.parse(localStorage.getItem("zsc_diary") || "[]");
}

function deleteEntry(id) {
    localStorage.setItem("zsc_diary", JSON.stringify(getEntries().filter((e) => e.id !== id)));
    renderEntries();
    showToast(currentLang === 'ar' ? "تم مسح الإنجاز." : "Entry deleted.", "success");
}

function clearAllEntries() {
    const msg = currentLang === 'ar' ? "أكيد عايز تمسح كل السجلات؟ (مش هتقدر ترجعهم تاني)" : "Delete all entries? (Cannot be undone)";
    if (confirm(msg)) {
        localStorage.removeItem("zsc_diary");
        renderEntries();
        showToast(currentLang === 'ar' ? "تم مسح كل السجلات." : "All entries deleted.", "success");
    }
}

function renderEntries() {
    const list = document.getElementById("entriesList");
    const clearBtn = document.getElementById("clearAllBtn");
    const entries = getEntries();

    if (!entries.length) {
        const emptyMsg = currentLang === 'ar' ? "مفيش سجلات لحد دلوقتي.." : "No entries yet...";
        list.innerHTML = `<div class="text-center py-12 text-tertiary"><p class="text-sm">${emptyMsg}</p></div>`;
        if (clearBtn) clearBtn.classList.add("hidden");
        return;
    }

    if (clearBtn) clearBtn.classList.remove("hidden");
    const courseLabel = currentLang === 'ar' ? "كورس خارجي" : "External Course";
    const subjectLabel = currentLang === 'ar' ? "مادة كلية" : "College Subject";
    const deleteLabel = currentLang === 'ar' ? "مسح" : "Delete";
    const subjectPrefix = currentLang === 'ar' ? "المادة:" : "Subject:";
    const remainingPrefix = currentLang === 'ar' ? "لسه:" : "Remaining:";

    list.innerHTML = entries
        .map((e) => `
    <div class="bg-secondary p-5 rounded-2xl border-t-4 border-[#E30613]">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-3">
          <span class="text-xs font-bold px-3 py-1 rounded-full ${e.type === "course" ? "bg-[#E30613]/10 text-[#E30613]" : "bg-tertiary text-secondary"}">
            ${e.type === "course" ? courseLabel : subjectLabel}
          </span>
          <span class="text-xs text-tertiary">${e.date}</span>
        </div>
        <button onclick="deleteEntry(${e.id})" class="text-tertiary hover:text-[#E30613] transition text-sm">${deleteLabel}</button>
      </div>
      <p class="text-sm text-secondary mb-1">${subjectPrefix} <span class="text-primary font-bold">${e.subject}</span></p>
      <p class="text-sm text-secondary">✅ ${e.done}</p>
      ${e.remaining ? `<p class="text-xs text-tertiary mt-2 pt-2 border-t border-custom">${remainingPrefix} ${e.remaining}</p>` : ""}
      ${e.notes ? `<p class="text-xs text-tertiary mt-1">${e.notes}</p>` : ""}
    </div>`)
        .join("");
}

// ===== SUBJECTS =====
const SUB_KEY = "zsc_subjects";
const SUB_CFG_KEY = "zsc_subjects_config";

function getSubConfig() {
    const def = [{
            name: "داتا بيز",
            lectures: 12
        },
        {
            name: "داتا كوم",
            lectures: 12
        },
        {
            name: "جرافيك",
            lectures: 12
        },
        {
            name: "الكترونكس",
            lectures: 12
        },
        {
            name: "احتمالات 2",
            lectures: 12
        },
    ];
    return JSON.parse(localStorage.getItem(SUB_CFG_KEY) || JSON.stringify(def));
}

function saveSubConfig(cfg) {
    localStorage.setItem(SUB_CFG_KEY, JSON.stringify(cfg));
}

function getSubData() {
    return JSON.parse(localStorage.getItem(SUB_KEY) || "{}");
}

function saveSubData(data) {
    localStorage.setItem(SUB_KEY, JSON.stringify(data));
}

function getPriorityTagStyle(priority) {
    const isAr = currentLang === 'ar';
    let tagClasses = '',
        tagContent = '',
        lectureBgClass = '',
        lectureItemClass = '';

    switch (priority) {
        case 'must':
            tagClasses = 'bg-[#E30613]/20 text-[#E30613] border-[#E30613]/30 hover:bg-[#E30613]/30';
            tagContent = isAr ? 'لازم ⭐' : 'Must Do ⭐';
            lectureBgClass = 'bg-[#E30613]/5';
            break;
        case 'will':
            tagClasses = 'bg-blue-500/20 text-blue-500 border-blue-500/30 hover:bg-blue-500/30';
            tagContent = isAr ? 'هعمله 📌' : 'Will Do 📌';
            lectureBgClass = 'bg-blue-500/5';
            break;
        case 'done':
            tagClasses = 'bg-green-500/20 text-green-500 border-green-500/30 hover:bg-green-500/30';
            tagContent = isAr ? 'تم ✅' : 'Done ✅';
            lectureBgClass = 'bg-green-500/5';
            break;
        case 'cancelled':
            tagClasses = 'bg-gray-500/20 text-gray-500 border-gray-500/30 hover:bg-gray-500/30';
            tagContent = isAr ? 'ملغية ❌' : 'Cancelled ❌';
            lectureBgClass = 'bg-gray-500/5';
            lectureItemClass = 'line-through opacity-60';
            break;
        default: // 'none'
            tagClasses = 'bg-tertiary text-tertiary border-custom hover:text-secondary hover:border-[#E30613]/50 opacity-50 hover:opacity-100';
            tagContent = isAr ? 'تحديد +' : 'Tag +';
            break;
    }
    return {
        tagClasses,
        tagContent,
        lectureBgClass,
        lectureItemClass
    };
}

function renderSubjects() {
    const cfg = getSubConfig();
    const data = getSubData();
    const lectureLabel = currentLang === 'ar' ? "محاضرة" : "Lecture";

    document.getElementById("subjectsList").innerHTML = cfg
        .map((sub, si) => {
            const {
                name,
                lectures: LCOUNT
            } = sub;

            // Normalize data to ensure it's an array of objects { done: boolean, date: string }
            const rawData = data[name] || Array(LCOUNT).fill(false);
            const lectures = rawData.map(item => (typeof item === 'object' ? item : {
                done: item,
                date: ''
            }));

            const done = lectures.filter(l => l.done).length;
            const percent = Math.round((done / LCOUNT) * 100);
            const slug = "sub-" + si;

            const lectureItems = lectures.map((lec, i) => {
                const priority = lec.priority || 'none';
                const {
                    tagClasses,
                    tagContent,
                    lectureBgClass,
                    lectureItemClass
                } = getPriorityTagStyle(priority);
                const commonClasses = "text-[10px] font-bold px-2 py-1 rounded cursor-pointer select-none transition border";
                const priorityHtml = `<span onclick="event.stopPropagation(); cyclePriority(this, '${name}', ${i})" class="${commonClasses} ${tagClasses}">${tagContent}</span>`;

                const lectureNumber = lec.displayLecNum || (i + 1);
                const lectureTag = `<span id="${slug}-lec-tag-${i}" onclick="event.stopPropagation(); cycleLectureNumber('${name}', ${i}, ${LCOUNT})" class="text-[10px] font-bold px-2 py-1 rounded bg-[#E30613]/10 text-[#E30613] border border-[#E30613]/20 select-none whitespace-nowrap cursor-pointer">Lecture ${lectureNumber}</span>`;
                const separator = `<span class="text-tertiary/30 text-xs select-none">|</span>`;

                return `
      <div class="rounded-xl border border-custom overflow-hidden mb-2 ${lectureBgClass} ${lectureItemClass}" data-lecture-item>
        <div class="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-tertiary/50 transition"
        onclick="toggleLecture('${name}', ${i}, ${si})">
          <span id="${slug}-lec-${i}" class="text-sm ${lec.done ? "text-primary font-bold" : "text-secondary"} whitespace-nowrap">${lectureLabel} ${i + 1}</span>
          <div class="flex items-center justify-center gap-3 flex-1 flex-wrap px-2">
            ${priorityHtml}
            ${separator}
            <input type="date" value="${lec.date || ''}"
                onclick="event.stopPropagation()"
                onchange="updateLectureDate('${name}', ${i}, this.value)"
                class="bg-transparent text-xs text-tertiary border border-custom rounded px-2 py-1 focus:outline-none focus:border-[#E30613] transition">
            ${separator}
            ${lectureTag}
          </div>
          <input type="checkbox" ${lec.done ? "checked" : ""}
            id="${slug}-chk-${i}"
            onclick="event.stopPropagation()"
            onchange="toggleLecture('${name}', ${i}, ${si})"
            class="w-4 h-4 accent-[#E30613] cursor-pointer">
        </div>
      </div>`;
            }).join("");

            return `
      <div class="bg-secondary rounded-2xl border-t-4 border-[#E30613] overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
        <div onclick="toggleAccordion('${slug}')" class="p-6 cursor-pointer flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span id="${slug}-arrow" class="arrow text-[#E30613] text-xs">▼</span>
            <div>
              <h3 class="text-xl font-bold text-primary">${name}</h3>
              <p id="${slug}-meta" class="text-xs text-tertiary mt-1">${done} / ${LCOUNT} ${lectureLabel} — ${percent}%</p>
            </div>
          </div>
          <div class="w-32">
            <div class="w-full bg-tertiary h-2 rounded-full overflow-hidden">
              <div id="${slug}-bar" class="bg-[#E30613] h-full transition-all duration-300" style="width:${percent}%"></div>
            </div>
          </div>
        </div>
        <div id="${slug}-panel" class="lectures-panel">
          <div class="px-6 pb-6">${lectureItems}</div>
        </div>
      </div>`;
        })
        .join("");

    renderCalendar();
}

// ===== CALENDAR =====
let calCurrentDate = new Date();

function changeCalMonth(delta) {
    calCurrentDate.setMonth(calCurrentDate.getMonth() + delta);
    renderCalendar();
}

function renderCalendar() {
    const container = document.getElementById("subjectsCalendar");
    if (!container) return;

    const year = calCurrentDate.getFullYear();
    const month = calCurrentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Prepare events
    const cfg = getSubConfig();
    const subData = getSubData();
    const events = {}; // "day" -> [colors]

    // Get all dates from all subjects
    const subNames = cfg.map(s => s.name);
    subNames.forEach(name => {
        const lectures = subData[name];
        if (!lectures || !Array.isArray(lectures)) return;

        lectures.forEach(lec => {
            // Check if it's an object with a date
            if (typeof lec !== 'object' || !lec.date) return;

            const lDate = new Date(lec.date);
            // Check if this lecture is in current view month/year
            if (lDate.getFullYear() === year && lDate.getMonth() === month) {
                const d = lDate.getDate();
                if (!events[d]) events[d] = [];
                events[d].push(lec.done ? "#10B981" : "#E30613"); // Green if done, Red if pending
            }
        });
    });

    const monthNamesAr = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    const monthNamesEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysAr = ["ح", "ن", "ث", "ر", "خ", "ج", "س"];
    const daysEn = ["S", "M", "T", "W", "T", "F", "S"];

    const isAr = currentLang === 'ar';
    const monthName = isAr ? monthNamesAr[month] : monthNamesEn[month];
    const daysHeader = (isAr ? daysAr : daysEn).map(d => `<div class="text-center text-xs text-tertiary font-bold py-2">${d}</div>`).join("");

    let daysHtml = "";
    // Empty slots
    for (let i = 0; i < firstDay; i++) {
        daysHtml += `<div></div>`;
    }
    // Days
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const dayEvents = events[i] || [];

        let dots = "";
        if (dayEvents.length > 0) {
            dots = `<div class="flex gap-0.5 justify-center mt-1">
                ${dayEvents.slice(0, 3).map(c => `<div class="w-1 h-1 rounded-full" style="background:${c}"></div>`).join('')}
            </div>`;
        }

        daysHtml += `
        <div class="h-10 flex flex-col items-center justify-center rounded-lg relative ${isToday ? 'bg-tertiary border border-[#E30613]' : 'hover:bg-tertiary/50'} transition cursor-default">
            <span class="text-sm ${isToday ? 'text-[#E30613] font-bold' : 'text-secondary'}">${i}</span>
            ${dots}
        </div>`;
    }

    container.innerHTML = `
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-primary">${monthName} <span class="text-sm text-tertiary">${year}</span></h3>
            <div class="flex gap-2">
                <button onclick="changeCalMonth(-1)" class="w-8 h-8 flex items-center justify-center rounded-full bg-tertiary hover:bg-[#E30613] hover:text-white transition text-secondary">‹</button>
                <button onclick="changeCalMonth(1)" class="w-8 h-8 flex items-center justify-center rounded-full bg-tertiary hover:bg-[#E30613] hover:text-white transition text-secondary">›</button>
            </div>
        </div>
        <div class="grid grid-cols-7 gap-1 mb-2">
            ${daysHeader}
        </div>
        <div class="grid grid-cols-7 gap-1">
            ${daysHtml}
        </div>
        <div class="mt-4 pt-4 border-t border-custom flex gap-4 justify-center text-xs">
             <div class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-[#E30613]"></div><span class="text-tertiary">${isAr ? 'محاضرة قادمة' : 'Pending'}</span></div>
             <div class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-[#10B981]"></div><span class="text-tertiary">${isAr ? 'تم الحضور' : 'Done'}</span></div>
        </div>
    `;
}

function toggleAccordion(slug) {
    const panel = document.getElementById(slug + "-panel");
    const arrow = document.getElementById(slug + "-arrow");
    const isOpen = panel.classList.contains("open");
    panel.classList.toggle("open", !isOpen);
    arrow.classList.toggle("open", !isOpen);
}

function toggleLecture(name, index, si) {
    const cfg = getSubConfig();
    const LCOUNT = cfg[si].lectures;
    const data = getSubData();

    // Normalize data
    let lectures = data[name] || Array(LCOUNT).fill(false);
    lectures = lectures.map(item => (typeof item === 'object' ? item : {
        done: item,
        date: ''
    }));

    const slug = "sub-" + si;
    const chk = document.getElementById(`${slug}-chk-${index}`);

    if (document.activeElement !== chk) {
        lectures[index].done = !lectures[index].done;
        chk.checked = lectures[index].done;
    } else {
        lectures[index].done = chk.checked;
    }

    data[name] = lectures;
    saveSubData(data);

    const done = lectures.filter(l => l.done).length;
    const percent = Math.round((done / LCOUNT) * 100);
    const lectureLabel = currentLang === 'ar' ? "محاضرة" : "Lecture";

    document.getElementById(`${slug}-bar`).style.width = percent + "%";
    document.getElementById(`${slug}-meta`).textContent = `${done} / ${LCOUNT} ${lectureLabel} — ${percent}%`;
    document.getElementById(`${slug}-lec-${index}`).className = `text-sm ${lectures[index].done ? "text-primary font-bold" : "text-secondary"} whitespace-nowrap`;

    renderCalendar(); // Update calendar colors
}

function cyclePriority(element, name, index) {
    const data = getSubData();
    if (!data[name]) return;

    // Normalize data if needed
    if (typeof data[name][index] !== 'object') {
        data[name] = data[name].map(item => (typeof item === 'object' ? item : {
            done: item,
            date: '',
            priority: 'none'
        }));
    }

    const current = data[name][index].priority || 'none';
    let next;
    if (current === 'none') next = 'must';
    else if (current === 'must') next = 'will';
    else if (current === 'will') next = 'done';
    else if (current === 'done') next = 'cancelled';
    else if (current === 'cancelled') next = 'none';
    else next = 'none'; // Fallback

    data[name][index].priority = next;
    saveSubData(data);

    // BUG FIX: Update only the clicked tag instead of re-rendering the whole list
    const {
        tagClasses,
        tagContent
    } = getPriorityTagStyle(next);
    const commonClasses = "text-[10px] font-bold px-2 py-1 rounded cursor-pointer select-none transition border";

    element.className = `${commonClasses} ${tagClasses}`;
    element.innerHTML = tagContent;

    // Update the parent lecture item's background and style
    const lectureItem = element.closest('[data-lecture-item]');
    if (lectureItem) {
        // List of all possible classes to remove
        const priorityBgClasses = ['bg-[#E30613]/5', 'bg-blue-500/5', 'bg-green-500/5', 'bg-gray-500/5'];
        const priorityStyleClasses = ['line-through', 'opacity-60'];
        lectureItem.classList.remove(...priorityBgClasses, ...priorityStyleClasses);

        // Get new styles and apply them
        const {
            lectureBgClass,
            lectureItemClass
        } = getPriorityTagStyle(next);
        if (lectureBgClass) lectureItem.classList.add(lectureBgClass);
        if (lectureItemClass) {
            lectureItemClass.split(' ').forEach(c => c && lectureItem.classList.add(c));
        }
    }
}

function updateLectureDate(name, index, date) {
    const data = getSubData();
    // Ensure structure exists
    if (!data[name]) return;
    // Normalize if needed (though render handles it, we need to save safely)
    if (!Array.isArray(data[name])) return;

    // Convert old boolean format if present
    if (typeof data[name][index] !== 'object') {
        data[name] = data[name].map(item => (typeof item === 'object' ? item : {
            done: item,
            date: ''
        }));
    }

    data[name][index].date = date;
    saveSubData(data);
    renderCalendar();
}

function cycleLectureNumber(name, index, totalLectures) {
    const data = getSubData();
    if (!data[name] || data[name][index] === undefined) return;

    // Ensure object structure
    if (typeof data[name][index] !== 'object') {
        data[name][index] = {
            done: data[name][index],
            date: '',
            priority: 'none'
        };
    }

    let currentLecNum = data[name][index].displayLecNum || (index + 1);
    let nextLecNum = currentLecNum + 1;

    if (nextLecNum > totalLectures) {
        nextLecNum = 1;
    }

    data[name][index].displayLecNum = nextLecNum;
    saveSubData(data);

    // Update UI directly to avoid full re-render
    const cfg = getSubConfig();
    const si = cfg.findIndex(s => s.name === name);
    const slug = "sub-" + si;
    const tagElement = document.getElementById(`${slug}-lec-tag-${index}`);
    if (tagElement) {
        tagElement.innerHTML = `Lecture ${nextLecNum}`;
    }
}

// ===== COURSES =====
const CRS_KEY = "zsc_courses";
const CRS_CFG_KEY = "zsc_courses_config";

function getCrsConfig() {
    const def = [{
            name: "JavaScript Masterclass",
            totalVideos: 120
        },
        {
            name: "React Complete Guide",
            totalVideos: 95
        },
        {
            name: "Next.js & TypeScript",
            totalVideos: 80
        },
        {
            name: "Advanced CSS & Tailwind",
            totalVideos: 60
        },
        {
            name: "Node.js Backend",
            totalVideos: 110
        },
    ];
    return JSON.parse(localStorage.getItem(CRS_CFG_KEY) || JSON.stringify(def));
}

function saveCrsConfig(cfg) {
    localStorage.setItem(CRS_CFG_KEY, JSON.stringify(cfg));
}

function getCrsData() {
    return JSON.parse(localStorage.getItem(CRS_KEY) || "{}");
}

function saveCrsData(data) {
    localStorage.setItem(CRS_KEY, JSON.stringify(data));
}

function renderCourses() {
    const cfg = getCrsConfig();
    const data = getCrsData();
    const videosLabel = currentLang === 'ar' ? "فيديوهات" : "videos";
    const fromLabel = currentLang === 'ar' ? "من" : "of";

    document.getElementById("coursesList").innerHTML = cfg
        .map((c, ci) => {
            const courseData = data[c.name] || {
                completed: 0
            };
            const completed = courseData.completed || 0;
            const total = c.totalVideos;
            const percent = Math.round((completed / total) * 100);

            return `
      <div class="bg-secondary p-6 rounded-2xl border-t-4 border-[#E30613] shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
        <h3 class="text-xl font-bold mb-4 text-primary">${c.name}</h3>

        <div class="flex items-center justify-between mb-4">
          <div class="relative w-24 h-24">
            <svg class="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="var(--border-color)" stroke-width="8" fill="none"/>
              <circle cx="48" cy="48" r="40" stroke="#E30613" stroke-width="8" fill="none"
                stroke-dasharray="${2 * Math.PI * 40}"
                stroke-dashoffset="${2 * Math.PI * 40 * (1 - percent / 100)}"
                class="transition-all duration-500"/>
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-2xl font-bold text-[#E30613]">${percent}%</span>
            </div>
          </div>

          <div class="text-right">
            <p class="text-3xl font-black text-primary">${completed}</p>
            <p class="text-xs text-tertiary">${fromLabel} ${total} ${videosLabel}</p>
          </div>
        </div>

        <div class="w-full bg-tertiary h-2 rounded-full overflow-hidden mb-4">
          <div id="crs-bar-${ci}" class="bg-[#E30613] h-full transition-all duration-300" style="width:${percent}%"></div>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <button onclick="updateCourseVideos(${ci}, '${c.name}', -5)"
              class="bg-tertiary hover:bg-custom text-secondary hover:text-primary text-sm py-2 rounded-lg transition">-5</button>
          <button onclick="updateCourseVideos(${ci}, '${c.name}', 1)"
              class="bg-[#E30613]/10 hover:bg-[#E30613]/20 text-[#E30613] text-sm py-2 rounded-lg transition font-bold">+1</button>
          <button onclick="updateCourseVideos(${ci}, '${c.name}', 5)"
              class="bg-[#E30613]/10 hover:bg-[#E30613]/20 text-[#E30613] text-sm py-2 rounded-lg transition font-bold">+5</button>
        </div>

        <button onclick="resetCourse(${ci}, '${c.name}')"
            class="w-full mt-2 bg-tertiary hover:bg-custom text-tertiary hover:text-secondary text-xs py-2 rounded-lg transition">Reset</button>
      </div>`;
        })
        .join("");
}

function updateCourseVideos(ci, name, delta) {
    const cfg = getCrsConfig();
    const course = cfg[ci];
    const data = getCrsData();
    const courseData = data[name] || {
        completed: 0
    };

    const newCompleted = Math.min(course.totalVideos, Math.max(0, courseData.completed + delta));

    data[name] = {
        completed: newCompleted
    };
    saveCrsData(data);

    const percent = Math.round((newCompleted / course.totalVideos) * 100);
    document.getElementById(`crs-bar-${ci}`).style.width = percent + "%";

    renderCourses();
}

function resetCourse(ci, name) {
    const data = getCrsData();
    data[name] = {
        completed: 0
    };
    saveCrsData(data);
    renderCourses();
}

const QUOTES = [{
        ar: "كل ما تحس إنك بتجيب آخرك .. إفتكر إنت ليه بدأت",
        en: "Whenever you feel like giving up, remember why you started"
    },
    {
        ar: "الشخص الوحيد اللي لازم تحاول تكون أحسن منه هو أنت إمبارح",
        en: "The only person you should try to be better than is the person you were yesterday"
    },
    {
        ar: "النجاح مش صدفة، النجاح شغل وتعب واستمرار",
        en: "Success is no accident. It is hard work, perseverance, and consistency"
    },
    {
        ar: "مفيش طريق مختصر لأي مكان يستاهل تروحه",
        en: "There are no shortcuts to any place worth going"
    },
    {
        ar: "لو كانت سهلة كان أي حد عملها .. تميز",
        en: "If it was easy, everyone would do it. Be distinct."
    },
    {
        ar: "متوقفش لما تتعب، وقف لما تخلص",
        en: "Don't stop when you're tired, stop when you're done"
    },
    {
        ar: "حلمك يستاهل إنك تعافر عشانه",
        en: "Your dream is worth the fight"
    },
    {
        ar: "الانضباط هو إنك تختار بين اللي عايزه دلوقتي واللي عايزه قدام",
        en: "Discipline is choosing between what you want now and what you want most"
    },
    {
        ar: "ابدأ من مكانك، استخدم اللي معاك، اعمل اللي تقدر عليه",
        en: "Start where you are. Use what you have. Do what you can"
    },
    {
        ar: "كل إنجاز كبير بيبدأ بقرار إنك تجرب",
        en: "Every great achievement begins with the decision to try"
    }
];

// Store the current quote to keep it consistent during the session
let currentQuote = null;

function getDailyQuote() {
    // If no quote yet, pick a random one
    if (!currentQuote) {
        const randomIndex = Math.floor(Math.random() * QUOTES.length);
        currentQuote = QUOTES[randomIndex];
    }
    return currentQuote;
}

function renderDailyQuote() {
    const quoteContainer = document.getElementById('dailyQuote');
    if (!quoteContainer) return;

    const quote = getDailyQuote();
    const isAr = currentLang === 'ar';

    // Animate text change
    quoteContainer.classList.add('fade-out');

    setTimeout(() => {
        const textContent = isAr ? `< ${quote.ar} >` : `< ${quote.en} >`;
        quoteContainer.textContent = textContent;

        // Set text direction and alignment
        quoteContainer.style.direction = isAr ? 'rtl' : 'ltr';
        quoteContainer.style.textAlign = isAr ? 'right' : 'left';

        // Switch border position based on language
        if (isAr) {
            // Arabic - border on right
            quoteContainer.style.borderRight = '3px solid #ef4444';
            quoteContainer.style.borderLeft = 'none';
            quoteContainer.style.paddingRight = '16px';
            quoteContainer.style.paddingLeft = '0';
        } else {
            // English - border on left
            quoteContainer.style.borderLeft = '3px solid #ef4444';
            quoteContainer.style.borderRight = 'none';
            quoteContainer.style.paddingLeft = '16px';
            quoteContainer.style.paddingRight = '0';
        }

        // Remove fade-out and add fade-in
        quoteContainer.classList.remove('fade-out');
        quoteContainer.classList.add('fade-in');

        // Remove fade-in after animation completes
        setTimeout(() => {
            quoteContainer.classList.remove('fade-in');
        }, 300);
    }, 200);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    applyLanguage();
    renderDailyQuote();
});


//--------------------------------

// ===== HOME STATS - ENHANCED VERSION =====
function renderHome() {
    const subCfg = getSubConfig();
    const subData = getSubData();
    const crsData = getCrsData();
    const crsCfg = getCrsConfig();

    renderDailyQuote();

    let totalLec = 0,
        doneLec = 0;
    subCfg.forEach((sub) => {
        const raw = subData[sub.name] || Array(sub.lectures).fill(false);
        // Count done whether it's boolean true or object {done: true}
        const doneCount = raw.filter(x => (typeof x === 'object' ? x.done : x)).length;

        totalLec += sub.lectures;
        doneLec += doneCount;
    });

    const lecturesLabel = currentLang === 'ar' ? "محاضرة" : "lectures";
    const fromLabel = currentLang === 'ar' ? "من" : "of";

    document.getElementById("statLecDone").textContent = doneLec;
    document.getElementById("statLecTotal").textContent = `${fromLabel} ${totalLec} ${lecturesLabel}`;

    let subTotal = 0;
    subCfg.forEach((sub) => {
        const raw = subData[sub.name] || Array(sub.lectures).fill(false);
        const doneCount = raw.filter(x => (typeof x === 'object' ? x.done : x)).length;
        subTotal += Math.round((doneCount / sub.lectures) * 100);
    });
    document.getElementById("statSubAvg").textContent = subCfg.length ? Math.round(subTotal / subCfg.length) + "%" : "0%";

    let crsTotal = 0;
    crsCfg.forEach((c) => {
        const courseData = crsData[c.name] || {
            completed: 0
        };
        const percent = Math.round((courseData.completed / c.totalVideos) * 100);
        crsTotal += percent;
    });
    document.getElementById("statCrsAvg").textContent = crsCfg.length ? Math.round(crsTotal / crsCfg.length) + "%" : "0%";

    // ===== MODERN SUBJECTS CARDS =====
    document.getElementById("homeSubjects").innerHTML = subCfg
        .map((sub, i) => {
            const raw = subData[sub.name] || Array(sub.lectures).fill(false);
            const done = raw.filter(x => (typeof x === 'object' ? x.done : x)).length;
            const percent = Math.round((done / sub.lectures) * 100);

            return `
      <div class="relative bg-secondary p-5 rounded-2xl border border-custom hover:border-[#E30613]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#E30613]/10 hover:-translate-y-1 cursor-pointer group overflow-hidden">
        <!-- Animated background gradient -->
        <div class="absolute inset-0 bg-gradient-to-br from-[#E30613]/0 to-[#E30613]/0 group-hover:from-[#E30613]/5 group-hover:to-transparent transition-all duration-500"></div>

        <div class="relative z-10">
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <h3 class="text-base font-bold text-primary group-hover:text-[#E30613] transition-colors duration-300 mb-1">${sub.name}</h3>
              <p class="text-xs text-tertiary group-hover:text-[#E30613]/70 transition-colors duration-300">${done} ${fromLabel} ${sub.lectures} ${lecturesLabel}</p>
            </div>
            <div class="flex flex-col items-end gap-1">
              <span class="text-2xl font-bold text-[#E30613] group-hover:scale-110 transition-transform duration-300">${percent}%</span>
            </div>
          </div>

          <!-- Enhanced glowing progress bar -->
          <div class="relative w-full bg-tertiary/30 h-3 rounded-full overflow-hidden backdrop-blur-sm">
            <div class="absolute inset-0 bg-gradient-to-r from-[#E30613] via-[#ff2635] to-[#E30613] h-full transition-all duration-500 rounded-full shadow-lg shadow-[#E30613]/50 animate-pulse" style="width:${percent}%">
              <!-- Shimmer effect -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              <!-- Inner glow -->
              <div class="absolute inset-0 bg-gradient-to-t from-[#E30613]/50 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>`;
        })
        .join("");

    // ===== MODERN COURSES CARDS =====
    const videosLabel = currentLang === 'ar' ? "فيديو" : "videos";
    document.getElementById("homeCourses").innerHTML = crsCfg
        .map((c, i) => {
            const courseData = crsData[c.name] || {
                completed: 0
            };
            const percent = Math.round((courseData.completed / c.totalVideos) * 100);

            return `
      <div class="relative bg-secondary p-5 rounded-2xl border border-custom hover:border-[#E30613]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#E30613]/10 hover:-translate-y-1 cursor-pointer group overflow-hidden">
        <!-- Animated background gradient -->
        <div class="absolute inset-0 bg-gradient-to-br from-[#E30613]/0 to-[#E30613]/0 group-hover:from-[#E30613]/5 group-hover:to-transparent transition-all duration-500"></div>

        <div class="relative z-10">
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <h3 class="text-base font-bold text-primary group-hover:text-[#E30613] transition-colors duration-300 mb-1">${c.name}</h3>
              <p class="text-xs text-tertiary group-hover:text-[#E30613]/70 transition-colors duration-300">${courseData.completed} ${fromLabel} ${c.totalVideos} ${videosLabel}</p>
            </div>
            <div class="flex flex-col items-end gap-1">
              <span class="text-2xl font-bold text-[#E30613] group-hover:scale-110 transition-transform duration-300">${percent}%</span>
            </div>
          </div>

          <!-- Enhanced glowing progress bar -->
          <div class="relative w-full bg-tertiary/30 h-3 rounded-full overflow-hidden backdrop-blur-sm">
            <div class="absolute inset-0 bg-gradient-to-r from-[#E30613] via-[#ff2635] to-[#E30613] h-full transition-all duration-500 rounded-full shadow-lg shadow-[#E30613]/50 animate-pulse" style="width:${percent}%">
              <!-- Shimmer effect -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              <!-- Inner glow -->
              <div class="absolute inset-0 bg-gradient-to-t from-[#E30613]/50 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>`;
        })
        .join("");
}

// ===== SETTINGS =====
function renderSettings() {
    const subCfg = getSubConfig();
    const crsCfg = getCrsConfig();
    const lectureLabel = currentLang === 'ar' ? "محاضرة" : "lecture";
    const videosLabel = currentLang === 'ar' ? "فيديوهات" : "videos";
    const deleteLabel = currentLang === 'ar' ? "مسح" : "Delete";

    document.getElementById("settingsSubjectsList").innerHTML = subCfg
        .map((sub, i) => `
    <div class="flex items-center justify-between bg-tertiary px-4 py-3 rounded-xl hover:bg-custom transition">
      <div>

          <div class="text-sm text-primary font-bold">${sub.name}</div>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs text-tertiary">${sub.lectures} ${lectureLabel}</span>
        <button onclick="removeSubject(${i})" class="text-tertiary hover:text-[#E30613] transition text-xs">${deleteLabel}</button>
      </div>
    </div>`)
        .join("");

    document.getElementById("settingsCoursesList").innerHTML = crsCfg
        .map((c, i) => `
    <div class="flex items-center justify-between bg-tertiary px-4 py-3 rounded-xl hover:bg-custom transition">
      <span class="text-sm text-primary">${c.name}</span>
      <div class="flex items-center gap-3">
        <span class="text-xs text-tertiary">${c.totalVideos} ${videosLabel}</span>
        <button onclick="removeCourse(${i})" class="text-tertiary hover:text-[#E30613] transition text-xs">${deleteLabel}</button>
      </div>
    </div>`)
        .join("");

    loadPrayerSettings();
}

function addSubject() {
    const name = document.getElementById("newSubjectName").value.trim();
    const lectures = parseInt(document.getElementById("newSubjectLectures").value) || 12;
    if (!name) {
        showToast(currentLang === 'ar' ? "اكتب اسم المادة!" : "Enter subject name!", "error");
        return;
    }

    const cfg = getSubConfig();
    if (cfg.find((s) => s.name === name)) {
        showToast(currentLang === 'ar' ? "المادة موجودة بالفعل!" : "Subject already exists!", "error");
        return;
    }
    cfg.push({
        name,
        lectures
    });
    saveSubConfig(cfg);

    document.getElementById("newSubjectName").value = "";
    document.getElementById("newSubjectLectures").value = "12";
    renderSettings();
    showToast(currentLang === 'ar' ? "تمت الإضافة بنجاح ✓" : "Added successfully ✓", "success");
}

function removeSubject(index) {
    const msg = currentLang === 'ar' ? "متأكد من المسح؟" : "Are you sure?";
    if (!confirm(msg)) return;
    const cfg = getSubConfig();
    const name = cfg[index].name;
    cfg.splice(index, 1);
    saveSubConfig(cfg);

    const data = getSubData();
    delete data[name];
    saveSubData(data);
    renderSettings();
    showToast(currentLang === 'ar' ? "تم المسح" : "Deleted", "success");
}

function addCourse() {
    const name = document.getElementById("newCourseName").value.trim();
    const totalVideos = parseInt(document.getElementById("newCourseVideos").value) || 50;

    if (!name) {
        showToast(currentLang === 'ar' ? "اكتب اسم الكورس!" : "Enter course name!", "error");
        return;
    }

    const cfg = getCrsConfig();
    if (cfg.find((c) => c.name === name)) {
        showToast(currentLang === 'ar' ? "الكورس موجود بالفعل!" : "Course already exists!", "error");
        return;
    }
    cfg.push({
        name,
        totalVideos
    });
    saveCrsConfig(cfg);

    document.getElementById("newCourseName").value = "";
    document.getElementById("newCourseVideos").value = "50";
    renderSettings();
    showToast(currentLang === 'ar' ? "تمت الإضافة بنجاح ✓" : "Added successfully ✓", "success");
}

function removeCourse(index) {
    const msg = currentLang === 'ar' ? "متأكد من المسح؟" : "Are you sure?";
    if (!confirm(msg)) return;
    const cfg = getCrsConfig();
    const name = cfg[index].name;
    cfg.splice(index, 1);
    saveCrsConfig(cfg);

    const data = getCrsData();
    delete data[name];
    saveCrsData(data);
    renderSettings();
    showToast(currentLang === 'ar' ? "تم المسح" : "Deleted", "success");
}

// ===== ATHKAR PAGE (ENHANCED) =====
const WIRD_KEY = 'zdd_wirdData';
const DAILY_ATHKAR_KEY = 'zdd_dailyAthkarStatus';
const DAILY_ATHKAR_DATE_KEY = 'zdd_lastAthkarDate';
const PRAYER_SETTINGS_KEY = 'zdd_prayerSettings';
const PRAYER_CACHE_KEY = 'zdd_prayerCache';

function renderAthkarPage() {
    loadWirdData();
    loadDailyAthkarStatus();
    renderAthkarAccordions();
    fetchAndRenderPrayerTimes();
}

// --- Quran Wird Logic ---
function saveWirdData() {
    const data = {
        page: document.getElementById('quranPageInput').value || 0,
        surah: document.getElementById('quranSurahInput').value || ''
    };
    localStorage.setItem(WIRD_KEY, JSON.stringify(data));
    loadWirdData(); // Re-render progress
    showToast(currentLang === 'ar' ? 'تم حفظ تقدم الورد' : 'Wird progress saved', 'success');
}

function loadWirdData() {
    const data = JSON.parse(localStorage.getItem(WIRD_KEY) || '{"page":0, "surah":""}');
    const page = parseInt(data.page) || 0;
    const totalPages = 604;

    document.getElementById('quranPageInput').value = page;
    document.getElementById('quranSurahInput').value = data.surah;

    const percent = Math.min(100, Math.max(0, (page / totalPages) * 100));
    document.getElementById('wirdProgressBar').style.width = `${percent}%`;

    const statsEl = document.getElementById('wirdStats');
    const pagesRead = currentLang === 'ar' ? `قرأت ${page} صفحة` : `${page} pages read`;
    const pagesLeft = currentLang === 'ar' ? `باقي ${totalPages - page} صفحة` : `${totalPages - page} pages left`;
    statsEl.textContent = `${pagesRead} - ${pagesLeft}`;
}

// --- Daily Athkar Checkbox Logic ---
function saveDailyAthkarStatus() {
    const status = {
        morning: document.getElementById('chkMorning').checked,
        evening: document.getElementById('chkEvening').checked,
        sleep: document.getElementById('chkSleep').checked,
    };
    localStorage.setItem(DAILY_ATHKAR_KEY, JSON.stringify(status));
}

function loadDailyAthkarStatus() {
    const lastDate = localStorage.getItem(DAILY_ATHKAR_DATE_KEY);
    const today = new Date().toDateString();

    if (lastDate !== today) {
        localStorage.setItem(DAILY_ATHKAR_DATE_KEY, today);
        localStorage.setItem(DAILY_ATHKAR_KEY, '{}');
        document.getElementById('chkMorning').checked = false;
        document.getElementById('chkEvening').checked = false;
        document.getElementById('chkSleep').checked = false;
    } else {
        const status = JSON.parse(localStorage.getItem(DAILY_ATHKAR_KEY) || '{}');
        const chkMorning = document.getElementById('chkMorning');
        const chkEvening = document.getElementById('chkEvening');
        const chkSleep = document.getElementById('chkSleep');

        if (chkMorning && status.morning) chkMorning.checked = true;
        if (chkEvening && status.evening) chkEvening.checked = true;
        if (chkSleep && status.sleep) chkSleep.checked = true;
    }
}

// --- Adhkar Accordion Logic ---
async function renderAthkarAccordions() {
    const container = document.getElementById('athkarContainer');
    if (!container) return;

    container.innerHTML = `<div class="text-tertiary text-center text-sm">${currentLang === 'ar' ? 'جاري تحميل الأذكار...' : 'Loading Adhkar...'}</div>`;

    try {
        const response = await fetch('./adkar.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        // Filter Adhkar by category from the Array
        const morningAdhkar = data.filter(item => item.category === "أذكار الصباح");
        const eveningAdhkar = data.filter(item => item.category === "أذكار المساء");
        const sleepAdhkar = data.filter(item => item.category === "أذكار النوم");

        container.innerHTML = ''; // Clear loading

        // Generate Accordions
        container.innerHTML += createAthkarAccordion('athkar-morning',
            currentLang === 'ar' ? 'أذكار الصباح' : 'Morning Adhkar', morningAdhkar);

        container.innerHTML += createAthkarAccordion('athkar-evening',
            currentLang === 'ar' ? 'أذكار المساء' : 'Evening Adhkar', eveningAdhkar);

        container.innerHTML += createAthkarAccordion('athkar-sleep',
            currentLang === 'ar' ? 'أذكار النوم' : 'Sleep Adhkar', sleepAdhkar);

        // Restore checkbox states
        loadDailyAthkarStatus();

    } catch (error) {
        console.error("Failed to fetch adkar.json:", error);
        container.innerHTML = `<div class="text-red-500 text-sm text-center">${currentLang === 'ar' ? 'فشل تحميل الأذكار.' : 'Failed to load Adhkar.'}</div>`;
    }
}

function createAthkarAccordion(slug, title, items) {
    const countLabel = currentLang === 'ar' ? 'مرات' : 'times';

    const itemsHtml = items.map((item, idx) => {
        const count = item.count ? item.count : 1;
        const uniqueId = `${slug}-btn-${idx}`;
        return `
        <div class="bg-tertiary/50 p-3 rounded-lg border border-custom mb-2 last:mb-0">
            <p class="text-sm text-primary leading-relaxed mb-2">${item.text}</p>
            <div class="flex justify-end">
                 <button id="${uniqueId}" onclick="this.querySelector('span').textContent = Math.max(0, parseInt(this.querySelector('span').textContent) - 1); if (parseInt(this.querySelector('span').textContent) === 0) { this.disabled = true; this.classList.add('opacity-50', 'bg-green-600'); }"
                    class="bg-[#E30613] hover:bg-[#c30510] text-white px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5">
                    <span class="font-mono text-sm">${count}</span> ${countLabel}
                </button>
            </div>
        </div>`;
    }).join('');

    return `
    <div class="bg-tertiary rounded-xl border border-custom overflow-hidden transition-all duration-300">
        <div onclick="toggleAccordion('${slug}')" class="p-3 cursor-pointer flex items-center justify-between hover:bg-secondary/50 transition">
            <div class="flex items-center gap-3">
                <span class="font-bold text-primary text-base select-none">${title}</span>
            </div>
            <span id="${slug}-arrow" class="arrow text-[#E30613] text-xs transition-transform duration-300">▼</span>
        </div>
        <div id="${slug}-panel" class="lectures-panel border-t border-custom bg-secondary">
            <div class="p-3 space-y-2 max-h-80 overflow-y-auto custom-scrollbar">${itemsHtml}</div>
        </div>
    </div>`;
}

// --- Prayer Times Logic ---
function getPrayerSettings() {
    return JSON.parse(localStorage.getItem(PRAYER_SETTINGS_KEY) || '{"country": "Egypt", "city": "Cairo"}');
}

function savePrayerSettings() {
    const country = document.getElementById('prayerCountry').value.trim();
    const city = document.getElementById('prayerCity').value.trim();
    if (!country || !city) {
        showToast(currentLang === 'ar' ? 'يرجى إدخال البلد والمدينة' : 'Please enter country and city', 'error');
        return;
    }
    localStorage.setItem(PRAYER_SETTINGS_KEY, JSON.stringify({
        country,
        city
    }));
    showToast(currentLang === 'ar' ? 'تم حفظ الإعدادات' : 'Settings saved', 'success');
    fetchAndRenderPrayerTimes(true); // Force refresh
}

function loadPrayerSettings() {
    const settings = getPrayerSettings();
    document.getElementById('prayerCountry').value = settings.country;
    document.getElementById('prayerCity').value = settings.city;
}

async function fetchAndRenderPrayerTimes(forceRefresh = false) {
    const listEl = document.getElementById('prayerTimesList');
    const locationEl = document.getElementById('prayerLocation');
    if (!listEl) return;

    const today = new Date().toDateString();
    const cache = JSON.parse(localStorage.getItem(PRAYER_CACHE_KEY) || '{}');

    if (!forceRefresh && cache.date === today) {
        renderPrayerTimes(cache.data);
        return;
    }

    const settings = getPrayerSettings();
    locationEl.textContent = `${settings.city}, ${settings.country}`;
    const url = `https://api.aladhan.com/v1/timingsByCity?city=${settings.city}&country=${settings.country}&method=5`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();

        if (data.code === 200) {
            const timings = data.data.timings;
            const relevantTimings = {
                Fajr: timings.Fajr,
                Dhuhr: timings.Dhuhr,
                Asr: timings.Asr,
                Maghrib: timings.Maghrib,
                Isha: timings.Isha,
            };
            localStorage.setItem(PRAYER_CACHE_KEY, JSON.stringify({
                date: today,
                data: relevantTimings
            }));
            renderPrayerTimes(relevantTimings);
        } else {
            throw new Error(data.data || 'Unknown API error');
        }
    } catch (error) {
        console.error("Prayer API Error:", error);
        const errorMsg = currentLang === 'ar' ? 'فشل جلب المواقيت. تحقق من الإعدادات أو اتصالك بالإنترنت.' : 'Failed to get timings. Check settings or connection.';
        listEl.innerHTML = `<div class="col-span-full text-red-500 text-sm">${errorMsg}</div>`;
    }
}

function formatTime12(time24) {
    if (!time24) return '';
    let [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? (currentLang === 'ar' ? 'PM' : 'PM') : (currentLang === 'ar' ? 'AM' : 'AM');
    h = h % 12;
    h = h ? h : 12; // Handle 0 as 12
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
}

let prayerCountdownInterval = null;

function startPrayerCountdown(timings) {
    if (prayerCountdownInterval) clearInterval(prayerCountdownInterval);

    const timerEl = document.getElementById('nextPrayerTimer');
    if (!timerEl) return;

    timerEl.classList.remove('hidden');

    const update = () => {
        const now = new Date();
        const prayerNames = {
            Fajr: "الفجر",
            Dhuhr: "الظهر",
            Asr: "العصر",
            Maghrib: "المغرب",
            Isha: "العشاء"
        };

        let nextPrayer = null;
        let minDiff = Infinity;
        let nextPrayerName = "";

        for (const [name, timeStr] of Object.entries(timings)) {
            const [h, m] = timeStr.split(':').map(Number);
            const prayerDate = new Date();
            prayerDate.setHours(h, m, 0, 0);

            let diff = prayerDate - now;
            if (diff > 0 && diff < minDiff) {
                minDiff = diff;
                nextPrayer = prayerDate;
                nextPrayerName = name;
            }
        }

        // If all prayers passed today, target Fajr tomorrow
        if (!nextPrayer) {
            const [h, m] = timings.Fajr.split(':').map(Number);
            const fajrTomorrow = new Date();
            fajrTomorrow.setDate(fajrTomorrow.getDate() + 1);
            fajrTomorrow.setHours(h, m, 0, 0);
            minDiff = fajrTomorrow - now;
            nextPrayer = fajrTomorrow;
            nextPrayerName = "Fajr";
        }

        const h = Math.floor(minDiff / (1000 * 60 * 60));
        const m = Math.floor((minDiff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((minDiff % (1000 * 60)) / 1000);

        const name = currentLang === 'ar' ? prayerNames[nextPrayerName] : nextPrayerName;
        const label = currentLang === 'ar' ? `باقي على ${name}` : `Time until ${name}`;
        timerEl.innerHTML = `<span class="opacity-80">${label}</span> <span class="font-mono text-lg font-bold mx-1" dir="ltr">${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}</span>`;
    };

    update();
    prayerCountdownInterval = setInterval(update, 1000);
}

function renderPrayerTimes(timings) {
    const listEl = document.getElementById('prayerTimesList');
    const prayerNames = {
        Fajr: "الفجر",
        Dhuhr: "الظهر",
        Asr: "العصر",
        Maghrib: "المغرب",
        Isha: "العشاء"
    };

    listEl.innerHTML = Object.entries(timings).map(([name, time]) => `
        <div class="bg-tertiary p-2.5 rounded-lg">
            <p class="text-xs font-bold text-primary">${currentLang === 'ar' ? prayerNames[name] : name}</p>
            <p class="text-base font-mono font-bold text-[#E30613] mt-1" dir="ltr">${formatTime12(time)}</p>
        </div>
    `).join('');
    startPrayerCountdown(timings);
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    let bgColor, textColor, border, icon;

    switch (type) {
        case 'error':
            bgColor = 'bg-secondary';
            textColor = 'text-[#E30613]';
            border = 'border-l-4 border-[#E30613]';
            icon = '<span>⚠️</span>';
            break;
        case 'info':
            bgColor = 'bg-secondary';
            textColor = 'text-blue-500';
            border = 'border-l-4 border-blue-500';
            icon = '<span>🔔</span>';
            break;
        default: // success
            bgColor = 'bg-[#E30613]';
            textColor = 'text-white';
            border = '';
            icon = '<span>✓</span>';
            break;
    }

    toast.className = `flex items-center gap-4 px-6 py-3 rounded-lg shadow-lg text-sm font-bold ${bgColor} ${textColor} ${border} transform translate-y-10 opacity-0 transition-all duration-300`;
    toast.innerHTML = `${icon}<span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove("translate-y-10", "opacity-0");
        toast.classList.add("translate-y-0", "opacity-100");
    }, 10);

    const timeout = type === 'info' ? 6000 : 3000;
    setTimeout(() => {
        toast.classList.remove("translate-y-0", "opacity-100");
        toast.classList.add("translate-y-10", "opacity-0");
        setTimeout(() => {
            if (toast.parentNode === container) container.removeChild(toast);
        }, 300);
    }, timeout);
}

// Helper to get today's date as YYYY-MM-DD string
function getTodayDateString() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// ===== NOTIFICATION SYSTEM =====
function checkUpcomingEvents() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const schedule = getScheduleData();
    const shownKey = 'zsc_shown_notifications';
    const todayStr = getTodayDateString();

    let shownLog = JSON.parse(localStorage.getItem(shownKey) || '{}');

    // If the log is for a previous day, reset it for today.
    if (!shownLog[todayStr]) {
        shownLog = {
            [todayStr]: []
        };
    }

    schedule.forEach(item => {
        if ((item.type === 'exam' || item.type === 'deadline') && item.date) {
            // Check if already notified today
            if (shownLog[todayStr].includes(item.id)) {
                return;
            }

            const eventDate = new Date(item.date);
            eventDate.setHours(0, 0, 0, 0);

            const diffTime = eventDate.getTime() - today.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                const message = currentLang === 'ar' ? `تذكير: عندك "${item.name}" بكرة!` : `Reminder: You have "${item.name}" tomorrow!`;
                showToast(message, 'info');
                shownLog[todayStr].push(item.id);
            }
        }
    });
    localStorage.setItem(shownKey, JSON.stringify(shownLog));
}

// ===== SCHEDULE SYSTEM =====
const SCHEDULE_KEY = 'zsc_schedule';
let scheduleFilter = 'all'; // all, exams, lectures
let editingScheduleId = null;

function getScheduleData() {
    return JSON.parse(localStorage.getItem(SCHEDULE_KEY) || '[]');
}

function saveScheduleData(data) {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(data));
}

function toggleScheduleInputs() {
    const type = document.getElementById('schType').value;
    const dateGroup = document.getElementById('schDateGroup');
    const dayGroup = document.getElementById('schDayGroup');
    const daySelect = document.getElementById('schDay');

    // Populate days if empty
    if (daySelect.options.length === 0) {
        const daysAr = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
        const daysEn = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        const days = currentLang === 'ar' ? daysAr : daysEn;
        days.forEach((d, i) => {
            const opt = document.createElement('option');
            opt.value = i; // 0 = Saturday as per array index for simplicity in logic
            opt.text = d;
            daySelect.add(opt);
        });
    }

    if (type === 'exam' || type === 'deadline') {
        dateGroup.classList.remove('hidden');
        dayGroup.classList.add('hidden');
    } else {
        dateGroup.classList.add('hidden');
        dayGroup.classList.remove('hidden');
    }
}

function handleScheduleSubmit() {
    const type = document.getElementById('schType').value;
    const name = document.getElementById('schName').value.trim();
    const time = document.getElementById('schTime').value.trim();

    let dateVal = '';
    let dayVal = '';

    if (type === 'exam' || type === 'deadline') {
        dateVal = document.getElementById('schDate').value;
        if (!dateVal) {
            showToast(currentLang === 'ar' ? 'اختر التاريخ!' : 'Select a date!', 'error');
            return;
        }
    } else {
        dayVal = document.getElementById('schDay').value;
    }

    if (!name) {
        showToast(currentLang === 'ar' ? 'اكتب اسم الحدث!' : 'Enter event name!', 'error');
        return;
    }
    if (!time) {
        showToast(currentLang === 'ar' ? 'اختر الوقت!' : 'Select a time!', 'error');
        return;
    }

    let data = getScheduleData();

    if (editingScheduleId) {
        // Edit Mode
        const index = data.findIndex(item => item.id === editingScheduleId);
        if (index !== -1) {
            data[index] = {
                ...data[index],
                type,
                name,
                time,
                date: dateVal,
                day: dayVal
            };
            showToast(currentLang === 'ar' ? 'تم التعديل' : 'Updated', 'success');
        }
    } else {
        // Add Mode
        data.push({
            id: Date.now(),
            type,
            name,
            time,
            date: dateVal,
            day: dayVal
        });
        showToast(currentLang === 'ar' ? 'تمت الإضافة' : 'Added', 'success');
    }

    saveScheduleData(data);
    resetScheduleForm();
    renderSchedule();
}

function editScheduleItem(id) {
    const data = getScheduleData();
    const item = data.find(i => i.id === id);
    if (!item) return;

    editingScheduleId = id;

    document.getElementById('schType').value = item.type;
    toggleScheduleInputs(); // Show correct inputs

    document.getElementById('schName').value = item.name;
    document.getElementById('schTime').value = item.time;

    if (item.type === 'exam' || item.type === 'deadline') {
        document.getElementById('schDate').value = item.date;
    } else {
        document.getElementById('schDay').value = item.day;
    }

    // UI Updates
    const btnSpan = document.querySelector('#schBtn span');
    btnSpan.textContent = currentLang === 'ar' ? 'حفظ التعديل' : 'Save Changes';
    document.getElementById('schBtn').classList.replace('bg-[#E30613]', 'bg-blue-600');
    document.getElementById('schBtn').classList.replace('hover:bg-[#c30510]', 'hover:bg-blue-700');

    document.getElementById('schFormTitle').textContent = currentLang === 'ar' ? 'تعديل الموعد' : 'Edit Event';
    document.getElementById('schCancelBtn').classList.remove('hidden');

    document.getElementById('schName').focus();
}

function resetScheduleForm() {
    editingScheduleId = null;
    document.getElementById('schId').value = '';
    document.getElementById('schName').value = '';
    document.getElementById('schDate').value = '';
    document.getElementById('schTime').value = '';
    // Reset Type to default or keep? Let's keep default
    document.getElementById('schType').value = 'exam';
    toggleScheduleInputs();

    // UI Reset
    const btnSpan = document.querySelector('#schBtn span');
    btnSpan.textContent = currentLang === 'ar' ? 'إضافة' : 'Add';
    document.getElementById('schBtn').classList.replace('bg-blue-600', 'bg-[#E30613]');
    document.getElementById('schBtn').classList.replace('hover:bg-blue-700', 'hover:bg-[#c30510]');

    document.getElementById('schFormTitle').textContent = currentLang === 'ar' ? 'إضافة موعد جديد' : 'Add New Event';
    document.getElementById('schCancelBtn').classList.add('hidden');
}

function setScheduleFilter(filter) {
    scheduleFilter = filter;

    // Update active button state
    ['all', 'exams', 'lectures'].forEach(f => {
        const btn = document.getElementById(`filter-${f}`);
        if (f === filter) {
            btn.className = "px-5 py-2 rounded-xl font-bold text-sm transition bg-[#E30613] text-white shadow-lg shadow-[#E30613]/20";
        } else {
            btn.className = "px-5 py-2 rounded-xl font-bold text-sm transition bg-tertiary text-secondary hover:text-primary";
        }
    });

    renderSchedule();
}

function removeScheduleItem(id) {
    if (!confirm(currentLang === 'ar' ? 'مسح هذا الموعد؟' : 'Delete this item?')) return;
    let data = getScheduleData();
    data = data.filter(item => item.id !== id);
    saveScheduleData(data);
    renderSchedule();
}

function renderSchedule() {
    const list = document.getElementById('scheduleList');
    if (!list) return;
    const data = getScheduleData();

    // Filter Data
    const filteredData = data.filter(item => {
        if (scheduleFilter === 'all') return true;
        if (scheduleFilter === 'exams') return item.type === 'exam' || item.type === 'deadline';
        if (scheduleFilter === 'lectures') return item.type === 'lecture' || item.type === 'section';
        return true;
    });

    // SORTING: Nearest upcoming event first
    filteredData.sort((a, b) => {
        const getTimestamp = (item) => {
            const now = new Date();
            if (item.type === 'exam' || item.type === 'deadline') {
                if (!item.date) return 9999999999999; // Invalid dates go last
                return new Date(`${item.date}T${item.time || '00:00'}`).getTime();
            } else {
                // Recurring (Lectures/Sections)
                if (item.day === undefined) return 9999999999999;

                // Map App Day (0=Sat) to JS Day (0=Sun...6=Sat)
                // App: 0(Sat), 1(Sun)... -> JS: 6(Sat), 0(Sun)...
                const targetJsDay = (parseInt(item.day) + 6) % 7;
                const [h, m] = (item.time || '00:00').split(':');

                const nextDate = new Date(now);
                nextDate.setHours(h, m, 0, 0);

                const currentJsDay = now.getDay();
                let daysUntil = targetJsDay - currentJsDay;

                if (daysUntil < 0) daysUntil += 7;
                else if (daysUntil === 0 && nextDate < now) daysUntil = 7; // If time passed today, move to next week

                nextDate.setDate(now.getDate() + daysUntil);
                return nextDate.getTime();
            }
        };
        return getTimestamp(a) - getTimestamp(b);
    });

    if (filteredData.length === 0) {
        list.innerHTML = `<tr><td class="p-6 text-center text-tertiary" colspan="6">${currentLang === 'ar' ? 'الجدول فاضي، ضيف مواعيدك!' : 'Schedule is empty.'}</td></tr>`;
        return;
    }

    const daysMap = currentLang === 'ar' ? ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"] : ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    list.innerHTML = filteredData.map(item => {
        let typeLabel = '';
        let typeClass = '';

        if (item.type === 'exam') {
            typeLabel = currentLang === 'ar' ? 'امتحان' : 'Exam';
            typeClass = 'text-[#E30613] bg-[#E30613]/10';
        } else if (item.type === 'section') {
            typeLabel = currentLang === 'ar' ? 'سكشن' : 'Section';
            typeClass = 'text-blue-500 bg-blue-500/10';
        } else if (item.type === 'lecture') {
            typeLabel = currentLang === 'ar' ? 'محاضرة' : 'Lecture';
            typeClass = 'text-yellow-500 bg-yellow-500/10';
        } else {
            typeLabel = currentLang === 'ar' ? 'تسليم' : 'Deadline';
            typeClass = 'text-purple-500 bg-purple-500/10';
        }

        // Format Time/Date
        let timeDisplay = '';
        let countdownHtml = '';
        if (item.type === 'exam' || item.type === 'deadline') {
            const dateObj = new Date(item.date);
            const dateStr = dateObj.toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US', {
                month: 'short',
                day: 'numeric',
                numberingSystem: 'latn'
            });
            // Format time 12h
            const [h, m] = item.time.split(':');
            const timeObj = new Date(0, 0, 0, h, m);
            const timeStr = timeObj.toLocaleTimeString(currentLang === 'ar' ? 'ar-EG' : 'en-US', {
                hour: 'numeric',
                minute: '2-digit',
                numberingSystem: 'latn'
            });

            // Countdown Logic
            const now = new Date();
            const eventDate = new Date(`${item.date}T${item.time}`);
            const diff = eventDate - now;

            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const dLabel = currentLang === 'ar' ? 'يوم' : 'd';
                const hLabel = currentLang === 'ar' ? 'ساعة' : 'h';
                const remLabel = currentLang === 'ar' ? 'باقي' : 'Left';
                countdownHtml = `<span class="text-[10px] font-bold text-[#E30613] bg-[#E30613]/10 px-2 py-0.5 rounded inline-block w-fit">🔥 ${remLabel}: ${days}${dLabel} ${hours}${hLabel}</span>`;
            } else {
                const endedLabel = currentLang === 'ar' ? 'انتهى' : 'Ended';
                countdownHtml = `<span class="text-[10px] font-bold text-tertiary bg-tertiary/50 px-2 py-0.5 rounded inline-block w-fit">${endedLabel}</span>`;
            }

            timeDisplay = `<div class="flex flex-col items-center"><span class="font-bold text-primary">${dateStr}</span><span class="text-xs text-tertiary">${timeStr}</span></div>`;
        } else {
            const dayName = daysMap[item.day] || '';
            const [h, m] = item.time.split(':');
            const timeObj = new Date(0, 0, 0, h, m);
            const timeStr = timeObj.toLocaleTimeString(currentLang === 'ar' ? 'ar-EG' : 'en-US', {
                hour: 'numeric',
                minute: '2-digit',
                numberingSystem: 'latn'
            });
            timeDisplay = `<div class="flex flex-col items-center"><span class="font-bold text-primary">${dayName}</span><span class="text-xs text-tertiary">${timeStr}</span></div>`;
        }

        const editLabel = currentLang === 'ar' ? 'تعديل' : 'Edit';
        const deleteLabel = currentLang === 'ar' ? 'حذف' : 'Delete';

        return `
        <tr class="hover:bg-tertiary/50 transition group">
            <td class="p-4">
                <span class="text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${typeClass}">
                    ${typeLabel}
                </span>
            </td>
            <td class="p-4">
                <div class="font-bold text-primary">${item.name}</div>
            </td>
            <td class="p-4 text-secondary text-sm">
                ${timeDisplay}
            </td>
            <td class="p-4">
                ${countdownHtml}
            </td>
            <td class="p-4">
                <button onclick="editScheduleItem(${item.id})" class="text-blue-500 hover:text-blue-400 border border-blue-500/30 hover:bg-blue-500/10 transition font-bold text-xs px-3 py-1 rounded-lg">${editLabel}</button>
            </td>
            <td class="p-4">
                <button onclick="removeScheduleItem(${item.id})" class="text-[#E30613] hover:text-red-500 border border-[#E30613]/30 hover:bg-[#E30613]/10 transition font-bold text-xs px-3 py-1 rounded-lg">${deleteLabel}</button>
            </td>
        </tr>
        `;
    }).join('');
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    applyLanguage();
    showPage("home");
    toggleScheduleInputs();
    checkUpcomingEvents();

    // Enhanced Cursor Glow Effect - Brighter Version
    const cursorGlow = document.getElementById('cursor-glow');
    if (cursorGlow) {
        // Elegant, Realistic Glow with More Brightness
        cursorGlow.style.position = 'fixed';
        cursorGlow.style.width = '210px';
        cursorGlow.style.height = '100px';
        cursorGlow.style.borderRadius = '50%';
        cursorGlow.style.background = 'radial-gradient(circle, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.1) 35%, rgba(255, 255, 255, 0.03) 60%, rgba(255, 255, 255, 0) 80%)';
        cursorGlow.style.pointerEvents = 'none';
        cursorGlow.style.transform = 'translate(-50%, -50%)';
        cursorGlow.style.zIndex = '9999';
        cursorGlow.style.mixBlendMode = 'screen';
        cursorGlow.style.transition = 'opacity 0.3s ease, transform 0.15s ease-out';
        cursorGlow.style.opacity = '0';
        cursorGlow.style.filter = 'blur(35px)';
        cursorGlow.style.boxShadow = '0 0 80px rgba(255, 255, 255, 0.3), 0 0 40px rgba(255, 255, 255, 0.2)';

        let mouseX = 0,
            mouseY = 0;
        let glowX = 0,
            glowY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorGlow.style.opacity = '1';
        });

        // Smooth animation loop for natural movement
        function animateGlow() {
            const dx = mouseX - glowX;
            const dy = mouseY - glowY;

            glowX += dx * 0.15;
            glowY += dy * 0.15;

            cursorGlow.style.left = glowX + 'px';
            cursorGlow.style.top = glowY + 'px';

            requestAnimationFrame(animateGlow);
        }
        animateGlow();

        // Hide glow when mouse leaves window
        document.addEventListener('mouseleave', () => {
            cursorGlow.style.opacity = '0';
        });

        document.addEventListener('mouseenter', () => {
            cursorGlow.style.opacity = '1';
        });
    }
});
