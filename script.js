// Edit names, dates, text, and local image paths in content/wedding.json.
const contentPath = "content/wedding.json";
const main = document.querySelector("#site-content");
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

function createSection(id, content, index, parent = main) {
  const section = element("section", "content-section");
  section.id = id;
  section.setAttribute("aria-labelledby", `${id}-title`);
  const inner = element("div", "section-inner");
  section.append(inner);
  const heading = element("header", "section-heading");
  if (index >= 0) addText(heading, "p", "section-kicker", `Del ${String(index + 1).padStart(2, "0")}`);
  const title = addText(heading, "h2", "section-title", content.title);
  if (title) title.id = `${id}-title`;
  inner.append(heading);
  parent.append(section);
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

  const layout = element("div", "hero-layout");
  const tiles = [
    { id: "rsvp", label: "OSA här", image: "images/Osa_har.png", alt: "Handmålad av Ida" },
    { id: "ceremony", label: "Plats och tid", image: data.ceremony.image, alt: "Starrkärrs kyrka." },
    { id: "gifts", label: "Presenter", image: "images/Present.png", alt: "Ida och Axel på sin bröllopsaffisch." },
    { id: "dressCode", label: "Klädkod", image: "images/Kladkod.png", alt: "Broderat Ida och Axel-motiv." },
    { id: "questions", label: "Frågor på det?", image: "images/Fragor_Pa_det.png", alt: "Ida och Axel." },
  ];

  const dialog = createInfoDialog();
  const dialogBody = dialog.querySelector(".info-dialog-body");
  const dialogTitle = dialog.querySelector("#info-dialog-title");
  let countdownTimer = null;
  dialog.addEventListener("close", () => {
    if (countdownTimer !== null) {
      window.clearInterval(countdownTimer);
      countdownTimer = null;
    }
  });
  for (const tile of tiles) {
    const button = element("button", `image-tile tile-${tile.id}`);
    button.type = "button";
    button.dataset.panel = tile.id;
    button.setAttribute("aria-label", tile.label);
    button.setAttribute("aria-haspopup", "dialog");
    const image = document.createElement("img");
    image.src = tile.image;
    image.alt = "";
    image.loading = "lazy";
    image.addEventListener("error", () => image.remove(), { once: true });
    button.append(image);
    button.addEventListener("click", () => openInfoDialog(data, tile, dialog, dialogBody, dialogTitle));
    layout.append(button);
  }

  const heroImage = addImage(layout, data.images?.hero, "hero-image", "Bröllopsaffischen med Ida och Axel och deras namn.");
  if (heroImage) {
    heroImage.setAttribute("role", "button");
    heroImage.setAttribute("tabindex", "0");
    heroImage.setAttribute("aria-label", "Visa nedräkning till bröllopet");
    heroImage.setAttribute("aria-haspopup", "dialog");
    const openCountdown = () => {
      dialogBody.replaceChildren();
      dialogTitle.textContent = "Nedräkning till bröllopet";
      const countdown = element("div", "countdown countdown-dialog");
      for (const [key, label] of [["days", "Dagar"], ["hours", "Timmar"], ["minutes", "Minuter"], ["seconds", "Sekunder"]]) {
        const item = element("div", "countdown-item");
        const value = element("span", "countdown-value", "00");
        value.dataset.countdown = key;
        item.append(value, element("span", "countdown-label", label));
        countdown.append(item);
      }
      dialogBody.append(countdown);
      countdownTimer = startCountdown(data.couple.dateISO, countdown);
      dialog.showModal();
    };
    heroImage.addEventListener("click", openCountdown);
    heroImage.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openCountdown();
      }
    });
  }
  main.append(hero);
  hero.append(layout);
  hero.append(dialog);

  if (data.images?.gallery?.length) renderGallery(data, hero);
}

function createInfoDialog() {
  const dialog = element("dialog", "info-dialog");
  dialog.setAttribute("aria-labelledby", "info-dialog-title");
  const card = element("div", "info-dialog-card");
  const header = element("header", "info-dialog-header");
  addText(header, "h2", "", "Information").id = "info-dialog-title";
  const close = element("button", "dialog-close", "×");
  close.type = "button";
  close.setAttribute("aria-label", "Stäng informationen");
  close.addEventListener("click", () => dialog.close());
  header.append(close);
  const body = element("div", "info-dialog-body");
  card.append(header, body);
  dialog.append(card);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  return dialog;
}

function openInfoDialog(data, tile, dialog, body, title) {
  body.replaceChildren();
  title.textContent = tile.label;
  dialog.setAttribute("aria-label", tile.label);
  if (tile.id === "ceremony") {
    renderCeremony(data, -1, body);
    renderOptions("transport", data, -1, body);
  } else if (tile.id === "gifts") {
    renderGifts(data, -1, body);
  } else if (tile.id === "rsvp") {
    renderRsvpInfo(data, body);
  } else if (tile.id === "dressCode") {
    renderDressCode(data, -1, body);
  } else {
    renderContact(data, -1, body);
  }
  dialog.showModal();
}

function renderRsvpInfo(data, parent) {
  const section = element("section", "info-section rsvp-info");
  addText(section, "p", "section-description", data.rsvp?.description || "Fyll i formuläret nedan!");
  if (data.rsvp?.formUrl) {
    const action = element("a", "rsvp-action", data.rsvp.buttonText || "Anmäl här");
    action.href = data.rsvp.formUrl;
    action.target = "_blank";
    action.rel = "noopener noreferrer";
    section.append(action);
  } else {
    addText(section, "p", "rsvp-note", data.rsvp?.pendingText || "Länk: https://docs.google.com/forms/d/e/1FAIpQLSeGX8Yl3qdoKPPmyGZMZsEmGhWhQhze_zQrT9RzMHolZJFtVw/viewform");
  }
  parent.append(section);
}

function renderGallery(data, hero) {
  const gallery = element("div", "gallery");
  gallery.setAttribute("aria-label", "Bildgalleri");
  for (const image of data.images.gallery) addImage(gallery, image, "gallery-image", "Bild från bröllopet");
  if (gallery.childElementCount) hero.after(gallery);
}

function renderCeremony(data, index, parent = main) {
  const { inner } = createSection("ceremony", data.ceremony, index, parent);
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

function renderSchedule(data) {
  const section = element("section", "schedule-section");
  const toggle = element("button", "image-tile schedule-toggle");
  toggle.type = "button";
  toggle.setAttribute("aria-label", data.schedule.navTitle || data.schedule.title);
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", "schedule-panel");
  const image = document.createElement("img");
  image.src = "images/Schema.png";
  image.alt = "";
  toggle.append(image);
  const panel = element("div", "schedule-panel");
  panel.id = "schedule-panel";
  panel.hidden = true;
  panel.setAttribute("aria-labelledby", "schedule-title");
  addText(panel, "h2", "schedule-title", data.schedule.title).id = "schedule-title";
  addText(panel, "p", "section-description", data.schedule.description);
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
  panel.append(timeline);
  addImage(panel, data.schedule.image, "section-image", data.schedule.title);
  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    panel.hidden = expanded;
  });
  section.append(toggle, panel);
  main.append(section);
}

function renderOptions(id, data, index, parent = main) {
  const config = data[id];
  const { inner } = createSection(id, config, index, parent);
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

function renderDressCode(data, index, parent = main) {
  const { inner } = createSection("dressCode", data.dressCode, index, parent);
  const block = element("div", "dress-code-block");
  addImage(inner, { src: "images\\vimplar.png" }, "section-image", data.dressCode.title);
  addText(block, "p", "dress-code-name", data.dressCode.name);
  addText(block, "p", "dress-code-description", data.dressCode.description);
  inner.append(block);
  
}

function renderGuests(data, index, parent = main) {
  const { inner } = createSection("guests", data.guests, index, parent);
  addText(inner, "p", "guest-note", data.guests.description);
  addLink(inner, data.guests.linkLabel, data.guests.linkUrl);
  addImage(inner, data.guests.image, "section-image", data.guests.title);
}

function renderGifts(data, index, parent = main) {
  const { inner } = createSection("gifts", data.gifts, index, parent);
  const layout = element("div", "gift-layout");
  //layout.append(element("div", "gift-mark", "I + A"));
  const copy = element("div", "");
  addText(copy, "p", "section-copy", data.gifts.description);
  addLink(copy, data.gifts.linkLabel, data.gifts.linkUrl);
  layout.append(copy);
  inner.append(layout);
  addImage(inner, { src: "images\\1000006547.jpg" }, "section-image", data.gifts.title);
}

function renderContact(data, index, parent = main) {
  const { inner } = createSection("contact", data.contact, index, parent);
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

function startCountdown(dateISO, countdown) {
  const target = new Date(dateISO).getTime();
  if (!Number.isFinite(target)) throw new Error("Ogiltigt datum för nedräkningen.");
  const update = () => {
    const difference = target - Date.now();
    if (difference <= 0) {
      countdown.replaceChildren(element("p", "hero-welcome", "Idag firar vi tillsammans!"));
      return false;
    }
    const values = {
      days: Math.floor(difference / 86_400_000),
      hours: Math.floor((difference % 86_400_000) / 3_600_000),
      minutes: Math.floor((difference % 3_600_000) / 60_000),
      seconds: Math.floor((difference % 60_000) / 1_000),
    };
    for (const [key, value] of Object.entries(values)) {
      const counter = countdown.querySelector(`[data-countdown="${key}"]`);
      if (counter) counter.textContent = String(value).padStart(2, "0");
    }
    return true;
  };
  if (!update()) return null;
  let timer;
  timer = window.setInterval(() => {
    if (!update()) window.clearInterval(timer);
  }, 1_000);
  return timer;
}

async function loadWeddingPage() {
  try {
    const response = await fetch(contentPath);
    if (!response.ok) throw new Error(`Kunde inte läsa innehållet (${response.status}).`);
    const data = await response.json();
    if (!data.couple?.names || !data.couple?.dateISO) throw new Error("Kontrollera couple.names och couple.dateISO i wedding.json.");

    renderMetadata(data);
    renderWelcome(data);
    renderSchedule(data);
    renderFooter(data);
    pageStatus.remove();
    main.setAttribute("aria-busy", "false");
  } catch (error) {
    console.error("Kunde inte visa bröllopssidan:", error);
    main.replaceChildren(element("p", "load-error", "Vi kunde inte läsa bröllopsinformationen. Kontrollera att wedding.json finns och att sidan öppnas via en webbserver."));
    main.setAttribute("aria-busy", "false");
  }
}

loadWeddingPage();
