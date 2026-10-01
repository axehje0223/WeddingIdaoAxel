// Edit names, dates, text, and local image paths in content/wedding.json.
const contentPath = "content/wedding.json";
const sectionOrder = [
  ["welcome", "welcome"],
  ["ceremony", "ceremony"],
  ["schedule", "schedule"],
  ["transport", "transport"],
  ["accommodation", "accommodation"],
  ["dressCode", "dressCode"],
  ["guests", "guests"],
  ["gifts", "gifts"],
  ["contact", "contact"],
];

const main = document.querySelector("#site-content");
const navigation = document.querySelector("#main-navigation");
const pageStatus = document.querySelector("#page-status");
const footer = document.querySelector("#site-footer");
const wordmark = document.querySelector(".wordmark");

function element(tagName, className, text) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function addText(parent, tagName, className, text) {
  if (!text) return null;
  const node = element(tagName, className, text);
  parent.append(node);
  return node;
}

function addLink(parent, label, url, className = "text-link") {
  if (!label || !url) return;
  const link = element("a", className, label);
  link.href = url;
  parent.append(link);
}

function addImage(parent, image, className, alt) {
  if (!image?.src) return null;
  const figure = element("figure", className);
  const photo = document.createElement("img");
  photo.src = image.src;
  photo.alt = image.alt || alt || "";
  photo.loading = "lazy";
  photo.addEventListener("error", () => figure.remove(), { once: true });
  figure.append(photo);
  addText(figure, "figcaption", "", image.caption);
  parent.append(figure);
  return figure;
}

function createSection(id, content, index) {
  const section = element("section", "content-section");
  section.id = id;
  section.setAttribute("aria-labelledby", `${id}-title`);
  const inner = element("div", "section-inner");
  section.append(inner);
  const heading = element("header", "section-heading");
  addText(heading, "p", "section-kicker", `Del ${String(index + 1).padStart(2, "0")}`);
  const title = addText(heading, "h2", "section-title", content.title);
  if (title) title.id = `${id}-title`;
  inner.append(heading);
  main.append(section);
  return { section, inner };
}

function renderWelcome(data) {
  const hero = element("section", "wedding-hero");
  hero.id = "welcome";
  hero.setAttribute("aria-labelledby", "welcome-title");
  const names = element("h1", "hero-names");
  names.id = "welcome-title";
  names.textContent = data.couple.names;
  names.classList.add("visually-hidden");
  hero.append(names);

  const topRow = element("div", "hero-top");
  addImage(topRow, data.images?.hero, "hero-image", "Bröllopsaffischen med Ida och Axel och deras namn.");

  const rsvp = element("section", "rsvp-panel");
  rsvp.setAttribute("aria-label", data.rsvp?.title || "OSA");
  addImage(rsvp, data.rsvp?.image, "rsvp-artwork", "Handmålad OSA-illustration i blått och rött.");
  const buttonText = data.rsvp?.buttonText || "Anmäl här";
  if (data.rsvp?.formUrl) {
    const action = element("a", "rsvp-action", buttonText);
    action.href = data.rsvp.formUrl;
    action.target = "_blank";
    action.rel = "noopener noreferrer";
    rsvp.append(action);
  } else {
    const action = element("button", "rsvp-action", buttonText);
    action.type = "button";
    action.disabled = true;
    rsvp.append(action);
    addText(rsvp, "p", "rsvp-note", data.rsvp?.pendingText || "Formulärlänk kommer snart");
  }
  topRow.append(rsvp);
  hero.append(topRow);

  const details = element("div", "hero-details");
  const dateCopy = element("div", "hero-date-copy");
  addText(dateCopy, "p", "hero-date", data.couple.date);
  addText(dateCopy, "p", "hero-welcome", data.welcome.text);
  details.append(dateCopy);

  const countdown = element("div", "countdown");
  countdown.id = "countdown";
  countdown.setAttribute("role", "timer");
  countdown.setAttribute("aria-label", "Nedräkning till bröllopet");
  for (const [label, key] of [["Dagar", "days"], ["Timmar", "hours"], ["Minuter", "minutes"]]) {
    const item = element("div", "countdown-item");
    addText(item, "span", "countdown-value", "--").dataset.countdown = key;
    addText(item, "span", "countdown-label", label);
    countdown.append(item);
  }
  details.append(countdown);
  hero.append(details);
  main.append(hero);

  if (data.images?.gallery?.length) {
    const gallery = element("div", "gallery");
    gallery.setAttribute("aria-label", "Bildgalleri");
    for (const image of data.images.gallery) {
      addImage(gallery, image, "gallery-image", "Bild från bröllopet");
    }
    if (gallery.childElementCount) hero.after(gallery);
  }
}

function renderCeremony(data, index) {
  const { inner } = createSection("ceremony", data.ceremony, index);
  const layout = element("div", "ceremony-layout");
  const details = document.createElement("dl");
  details.className = "detail-list";
  for (const [label, value] of [["Datum", data.ceremony.date], ["Tid", data.ceremony.time], ["Plats", data.ceremony.location], ["Adress", data.ceremony.address]]) {
    if (!value) continue;
    const item = document.createElement("div");
    addText(item, "dt", "", label);
    addText(item, "dd", "", value);
    details.append(item);
  }
  const detailColumn = element("div", "");
  detailColumn.append(details);
  addText(detailColumn, "p", "section-copy", data.ceremony.description);
  addLink(detailColumn, data.ceremony.mapLabel || "Visa på karta", data.ceremony.mapUrl);
  layout.append(detailColumn);
  addImage(layout, data.ceremony.image, "section-image", data.ceremony.location);
  inner.append(layout);
}

function renderSchedule(data, index) {
  const { inner } = createSection("schedule", data.schedule, index);
  addText(inner, "p", "section-description", data.schedule.description);
  const timeline = element("ol", "timeline");
  for (const event of data.schedule.events || []) {
    const item = element("li", "timeline-item");
    addText(item, "time", "timeline-time", event.time);
    item.lastElementChild?.setAttribute("datetime", event.time || "");
    item.append(element("span", "timeline-marker"));
    const details = element("div", "");
    addText(details, "h3", "timeline-title", event.title);
    addText(details, "p", "timeline-description", event.description);
    item.append(details);
    timeline.append(item);
  }
  inner.append(timeline);
  addImage(inner, data.schedule.image, "section-image", data.schedule.title);
}

function renderOptions(id, data, index) {
  const config = data[id];
  const { inner } = createSection(id, config, index);
  addText(inner, "p", "section-description", config.description);
  const cards = element("div", "option-grid");
  for (const option of config.options || []) {
    const card = element("article", "option-card");
    addText(card, "h3", "", option.name || option.title);
    addText(card, "p", "option-meta", [option.address, option.distance, option.price].filter(Boolean).join(" · "));
    addText(card, "p", "", option.description || option.information);
    addLink(card, option.linkLabel || "Läs mer", option.url || option.mapUrl);
    cards.append(card);
  }
  if (cards.childElementCount) inner.append(cards);
  addImage(inner, config.image, "section-image", config.title);
}

function renderDressCode(data, index) {
  const { inner } = createSection("dressCode", data.dressCode, index);
  const block = element("div", "dress-code-block");
  addText(block, "p", "dress-code-name", data.dressCode.name);
  addText(block, "p", "dress-code-description", data.dressCode.description);
  inner.append(block);
  addImage(inner, data.dressCode.image, "section-image", data.dressCode.title);
}

function renderGuests(data, index) {
  const { inner } = createSection("guests", data.guests, index);
  addText(inner, "p", "guest-note", data.guests.description);
  addLink(inner, data.guests.linkLabel, data.guests.linkUrl);
  addImage(inner, data.guests.image, "section-image", data.guests.title);
}

function renderGifts(data, index) {
  const { inner } = createSection("gifts", data.gifts, index);
  const layout = element("div", "gift-layout");
  layout.append(element("div", "gift-mark", "I + A"));
  const copy = element("div", "");
  addText(copy, "p", "section-copy", data.gifts.description);
  addLink(copy, data.gifts.linkLabel, data.gifts.linkUrl);
  layout.append(copy);
  inner.append(layout);
  addImage(inner, data.gifts.image, "section-image", data.gifts.title);
}

function renderContact(data, index) {
  const { inner } = createSection("contact", data.contact, index);
  const layout = element("div", "contact-layout");
  addText(layout, "p", "section-copy", data.contact.description);
  const methods = element("div", "contact-methods");
  if (data.contact.email) {
    const email = element("a", "", data.contact.email);
    email.href = `mailto:${data.contact.email}`;
    methods.append(email);
  }
  if (data.contact.phone) {
    const phone = element("a", "", data.contact.phone);
    phone.href = `tel:${data.contact.phone.replace(/[^+\d]/g, "")}`;
    methods.append(phone);
  }
  addText(methods, "p", "contact-person", data.contact.person);
  layout.append(methods);
  inner.append(layout);
  addImage(inner, data.contact.image, "section-image", data.contact.title);
}

function renderNavigation(data) {
  navigation.replaceChildren();
  for (const [id, key] of sectionOrder) {
    const link = element("a", "", data[key].navTitle || data[key].title);
    link.href = `#${id}`;
    navigation.append(link);
  }
}

function renderFooter(data) {
  addText(footer, "p", "", data.footer?.text || `${data.couple.names} · ${data.couple.date}`);
  addText(footer, "p", "", data.footer?.note);
}

function renderMetadata(data) {
  document.title = data.site?.title || `${data.couple.names} | Vårt bröllop`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", data.site?.description || data.welcome.text);
  if (!wordmark) return;

  const names = data.couple.names.split(/\s*&\s*/).filter(Boolean);
  wordmark.replaceChildren(document.createTextNode(names[0] || data.couple.names));
  if (names.length > 1) {
    wordmark.append(document.createTextNode(" "), element("span", "", "&"), document.createTextNode(` ${names.slice(1).join(" & ")}`));
  }
  wordmark.setAttribute("aria-label", `${data.couple.names} bröllop`);
}

function startCountdown(dateISO) {
  const countdown = document.querySelector("#countdown");
  const target = new Date(dateISO).getTime();
  if (!Number.isFinite(target)) {
    countdown.hidden = true;
    return;
  }
  const update = () => {
    const difference = target - Date.now();
    if (difference <= 0) {
      countdown.replaceChildren(element("p", "hero-welcome", "Idag firar vi tillsammans!"));
      window.clearInterval(timer);
      return;
    }
    const values = {
      days: Math.floor(difference / 86_400_000),
      hours: Math.floor((difference % 86_400_000) / 3_600_000),
      minutes: Math.floor((difference % 3_600_000) / 60_000),
    };
    for (const [key, value] of Object.entries(values)) {
      const counter = countdown.querySelector(`[data-countdown="${key}"]`);
      if (counter) counter.textContent = String(value).padStart(2, "0");
    }
  };
  update();
  const timer = window.setInterval(update, 60_000);
}

async function loadWeddingPage() {
  try {
    const response = await fetch(contentPath);
    if (!response.ok) throw new Error(`Kunde inte läsa innehållet (${response.status}).`);
    const data = await response.json();
    if (!data.couple?.names || !data.couple?.dateISO) throw new Error("Kontrollera couple.names och couple.dateISO i wedding.json.");

    renderMetadata(data);
    renderWelcome(data);
    renderNavigation(data);
    renderCeremony(data, 1);
    renderSchedule(data, 2);
    renderOptions("transport", data, 3);
    renderOptions("accommodation", data, 4);
    renderDressCode(data, 5);
    renderGuests(data, 6);
    renderGifts(data, 7);
    renderContact(data, 8);
    renderFooter(data);
    startCountdown(data.couple.dateISO);
    pageStatus.remove();
    main.setAttribute("aria-busy", "false");
  } catch (error) {
    console.error("Kunde inte visa bröllopssidan:", error);
    main.replaceChildren(element("p", "load-error", "Vi kunde inte läsa bröllopsinformationen. Kontrollera att wedding.json finns och att sidan öppnas via en webbserver."));
    main.setAttribute("aria-busy", "false");
  }
}

loadWeddingPage();
