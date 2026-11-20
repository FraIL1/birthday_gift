(() => {
  "use strict";

  const questions = [
    {
      label: "НАЧНЁМ С ПРОСТОГО",
      title: "Какое настроение у тебя бывает чаще всего?",
      hint: "Выбери то, что сейчас ближе всего.",
      options: ["Злюка и нервная", "Миленькая и добренькая", "Миленькая злюка"],
    },
    {
      label: "НЕМНОГО ВОЛШЕБСТВА",
      title: "Какую суперсилу выбрала бы на один день?",
      hint: "Здесь можно всё — это же твоя история.",
      options: ["Понимать язык животных", "Получать 1 000 $ за каждый час сна", "В любой момент оказываться рядом со мной"],
    },
    {
      label: "МЕЧТАТЬ РАЗРЕШАЕТСЯ",
      title: "Куда бы ты отправилась прямо сейчас?",
      hint: "Представь, что билет уже у тебя в руках.",
      options: ["К морю и тёплому ветру", "В город с красивыми улицами", "В уютное место среди гор и леса"],
    },
    {
      label: "НОВАЯ ГЛАВА",
      title: "Чего тебе хочется больше в новом году жизни?",
      hint: "Первое, что пришло в голову, и есть верный ответ.",
      options: ["Моментов, которые хочется разделить с кем-то особенным", "Спокойствия и времени для себя", "Тёплых моментов с близкими"],
    },
    {
      label: "МАЛЕНЬКИЕ РАДОСТИ",
      title: "Что почти всегда заставляет тебя улыбнуться?",
      hint: "Даже когда день начался не идеально.",
      options: ["Котики", "Что-нибудь вкусное", "Неожиданное сообщение", "Объятия и нежные поцелуи"],
    },
    {
      label: "КОГДА НУЖНО ЧУТЬ БОЛЬШЕ ТЕПЛА",
      title: "Что помогает тебе, когда день не задался и грустно?",
      hint: "",
      options: ["Чтобы меня выслушали", "Немного побыть одной", "Прогулка и смена обстановки", "Рассмешить и отвлечь"],
    },
    {
      label: "О ТОМ, ЧТО ВАЖНО",
      title: "Что ты больше всего ценишь в человеке рядом?",
      hint: "",
      options: ["Искренность", "Чувство юмора", "Заботу в мелочах", "Умение слушать"],
    },
    {
      label: "И ПОСЛЕДНИЙ ВОПРОС",
      title: "Какое желание ты загадала бы сегодня?",
      hint: "",
      type: "text",
    },
  ];

  const $ = (selector) => document.querySelector(selector);
  const screens = ["intro", "quiz", "send", "finale"];
  const state = { index: 0, answers: Array(questions.length).fill(""), sending: false, sent: false };
  const endpoint = String(window.GIFT_CONFIG?.formEndpoint || "").trim();
  const isConfigured = /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint);
  let wiping = false;

  function pressThen(button, callback) {
    button.classList.remove("is-hopping");
    void button.offsetWidth;
    button.classList.add("is-hopping");
    setTimeout(() => { button.classList.remove("is-hopping"); callback(); }, 430);
  }

  function runWipe(callback) {
    if (wiping) return;
    wiping = true;
    const wipe = $("#scene-wipe");
    wipe.classList.remove("play");
    void wipe.offsetWidth;
    wipe.classList.add("play");
    setTimeout(callback, 425);
    setTimeout(() => { wipe.classList.remove("play"); wiping = false; }, 900);
  }

  function transitionTo(name) { runWipe(() => showScreen(name)); }

  function showScreen(name) {
    screens.forEach((id) => { $("#" + id).hidden = id !== name; });
    $("#topbar-note").textContent = name === "intro" ? "маленькая история" : name === "finale" ? "с днём рождения" : "для тебя, с теплом";
    window.scrollTo({ top: 0, behavior: "smooth" });
    const heading = $("#" + name + " h1, #" + name + " h2");
    if (heading) { heading.setAttribute("tabindex", "-1"); heading.focus({ preventScroll: true }); }
    if (name === "finale") celebrate();
  }

  function updateNext() {
    const q = questions[state.index];
    const filled = q.type === "text" || Boolean(state.answers[state.index]);
    $("#next-button").disabled = !filled;
    $("#next-button").innerHTML = `${state.index === questions.length - 1 ? "К поздравлению" : "Дальше"} <img class="button-pet" src="./assets/cat-cream.svg" alt="" />`;
  }

  function renderQuestion() {
    const q = questions[state.index];
    $("#question-counter").textContent = `ВОПРОС ${String(state.index + 1).padStart(2, "0")} / ${String(questions.length).padStart(2, "0")}`;
    $("#progress-fill").style.width = `${(state.index + 1) / questions.length * 100}%`;
    $("#question-label").textContent = q.label;
    $("#question-title").textContent = q.title;
    $("#question-hint").textContent = q.hint;
    $("#question-hint").hidden = !q.hint;
    $("#back-button").textContent = state.index === 0 ? "На главную" : "Назад";
    const area = $("#answer-area");
    area.replaceChildren();

    if (q.type === "text") {
      const textarea = document.createElement("textarea");
      textarea.className = "answer-textarea";
      textarea.placeholder = "Моё желание...";
      textarea.setAttribute("aria-label", "Твоё желание");
      textarea.maxLength = 500;
      textarea.value = state.answers[state.index];
      textarea.addEventListener("input", () => { state.answers[state.index] = textarea.value.trim(); });
      area.append(textarea);
    } else {
      const answers = document.createElement("div");
      answers.className = "answers";
      q.options.forEach((option, i) => {
        const button = document.createElement("button");
        button.className = "answer-option";
        button.style.setProperty("--i", i);
        button.type = "button";
        button.setAttribute("aria-pressed", String(state.answers[state.index] === option));
        button.innerHTML = `<span class="option-glyph" aria-hidden="true">${["✦", "✧", "✦", "♡"][i]}</span><span></span>`;
        button.lastElementChild.textContent = option;
        button.addEventListener("click", () => {
          state.answers[state.index] = option;
          answers.querySelectorAll(".answer-option").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
          button.classList.remove("is-hopping");
          void button.offsetWidth;
          button.classList.add("is-hopping");
          setTimeout(() => button.classList.remove("is-hopping"), 520);
          [$("#quiz-cat"), $("#quiz-bunny")].forEach((pet) => {
            pet.classList.remove("celebrating");
            void pet.offsetWidth;
            pet.classList.add("celebrating");
            setTimeout(() => pet.classList.remove("celebrating"), 700);
          });
          updateNext();
        });
        answers.append(button);
      });
      area.append(answers);
    }
    updateNext();
  }

  function changeQuestion(nextIndex) {
    runWipe(() => {
      state.index = nextIndex;
      renderQuestion();
      const card = $("#question-card");
      card.classList.remove("reveal");
      void card.offsetWidth;
      card.classList.add("reveal");
      $("#question-title").setAttribute("tabindex", "-1");
      $("#question-title").focus({ preventScroll: true });
    });
  }

  function setSendMode() {
    if (!isConfigured) {
      $("#privacy-note").textContent = "Это предпросмотр: отправка ответов пока не настроена.";
    }
  }

  async function sendAnswers() {
    if (!isConfigured) { $("#send-status").textContent = "Отправка ответов не настроена."; return; }
    if (state.sending || state.sent) return;
    state.sending = true;
    $("#retry-button").hidden = true;
    $("#send-status").textContent = "Ответы отправляются...";
    const data = new FormData();
    questions.forEach((q, i) => data.append(`Вопрос ${i + 1}: ${q.title}`, state.answers[i] || "Оставлено без ответа"));
    data.append("_subject", "Ответы на открытку ко дню рождения");
    try {
      const response = await fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" }, keepalive: true });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      state.sent = true;
      $("#send-status").textContent = "Ответы отправлены ✦";
    } catch (error) {
      $("#send-status").textContent = "Ответы пока не отправились. Попробуй ещё раз.";
      $("#retry-button").hidden = false;
      console.error("Ошибка отправки ответов:", error);
    } finally { state.sending = false; }
  }

  function decorate() {
    const field = $("#sparkle-field");
    const positions = [[8,12],[17,78],[27,32],[35,87],[43,9],[51,63],[63,18],[72,79],[84,38],[92,7],[96,88],[5,55],[57,92],[78,5]];
    positions.forEach(([x,y],i) => {
      const star = document.createElement("i");
      star.className = "sparkle";
      star.style.cssText = `left:${x}%;top:${y}%;--d:${3 + i % 4}s;--delay:${i * -.53}s`;
      field.append(star);
    });
  }

  function celebrate() {
    const tray = $("#confetti");
    tray.replaceChildren();
    const colors = ["#f5c8e4", "#e8c994", "#caa8f1", "#ffffff", "#f2aeb7"];
    for (let i = 0; i < 75; i++) {
      const piece = document.createElement("i");
      piece.className = "confetti-piece";
      const x = (i * 61.8) % 100;
      const drift = ((i * 37) % 220) - 110;
      piece.style.cssText = `--x:${x}%;--s:${5 + i % 6}px;--c:${colors[i % colors.length]};--r:${i * 57}deg;--t:${4 + i % 4}s;--delay:${(i % 13) * .12}s;--drift:${drift}px`;
      tray.append(piece);
    }
    setTimeout(() => tray.replaceChildren(), 9000);
  }

  $("#start-button").addEventListener("click", () => pressThen($("#start-button"), () => { state.index = 0; renderQuestion(); transitionTo("quiz"); }));
  $("#back-button").addEventListener("click", () => { if (state.index === 0) transitionTo("intro"); else changeQuestion(state.index - 1); });
  $("#next-button").addEventListener("click", () => pressThen($("#next-button"), () => {
    if (state.index === questions.length - 1) {
      transitionTo("send");
      sendAnswers();
    } else changeQuestion(state.index + 1);
  }));
  $("#open-button").addEventListener("click", () => pressThen($("#open-button"), () => transitionTo("finale")));
  $("#retry-button").addEventListener("click", sendAnswers);
  $("#replay-button").addEventListener("click", () => { state.index = 0; state.answers.fill(""); state.sent = false; $("#send-status").textContent = ""; $("#retry-button").hidden = true; transitionTo("intro"); });
  setSendMode();
  decorate();
})();
