
import React, { useEffect } from 'react';
import './style.css';

function MyCoolAppReactVite() {

  // yaha sab JS code chale ga jasyay junior dev karta ha
  const mainKaamKarneWalaFunction = () => {
    try {
      /*
  BudgetBasics — working client-side SPA interactions
  Educational/demo project only.
  No backend, banking, transaction processing, or server-side financial storage.
*/
      (() => {
        "use strict";

        const PAGE_IDS = [
          "overview",
          "basics",
          "needs",
          "calculator",
          "savings",
          "expenses",
          "student-expenses",
          "learn",
          "mistakes",
          "infographics",
          "games",
          "feedback",
          "about",
          "contact",
          "sitemap"
        ];

        const PAGE_TITLES = {
          overview: "Overview",
          basics: "Budgeting basics",
          needs: "Needs vs. wants",
          calculator: "50-30-20 calculator",
          savings: "Savings goals",
          expenses: "Expense planner",
          "student-expenses": "Student example",
          learn: "Money smarts",
          mistakes: "Money mistakes",
          infographics: "Infographics",
          games: "Budgeting games",
          feedback: "Feedback",
          about: "About us",
          contact: "Contact us",
          sitemap: "Sitemap"
        };

        const $ = (selector, root = document) => root.querySelector(selector);
        const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

        const money = (value, compact = false) => {
          const amount = Number(value) || 0;
          return amount.toLocaleString("en-PK", {
            style: "currency",
            currency: "PKR",
            minimumFractionDigits: compact && Number.isInteger(amount) ? 0 : 2,
            maximumFractionDigits: 2
          });
        };

        const escapeHtml = (value) =>
          String(value ?? "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
          }[char]));

        const safeNumber = (value) => {
          const number = Number(value);
          return Number.isFinite(number) ? number : NaN;
        };

        const localISODate = (date = new Date()) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        const storage = {
          get(key, fallback = null) {
            try {
              const value = window.localStorage.getItem(key);
              return value === null ? fallback : value;
            } catch {
              return fallback;
            }
          },
          set(key, value) {
            try {
              window.localStorage.setItem(key, String(value));
              return true;
            } catch {
              return false;
            }
          }
        };

        // Live snapshot state shared by the toolkit and visual dashboard.
        let snapshotPlannerIncome = 50000;
        let snapshotExpenses = [];
        // ------------------------------------------------------------
        // SPA navigation
        // ------------------------------------------------------------

        function showPage(requestedId, { updateUrl = true, scroll = true } = {}) {
          const pageId = PAGE_IDS.includes(requestedId) ? requestedId : "overview";

          $$(".page").forEach((page) => {
            const active = page.id === pageId;
            page.hidden = !active;
            page.classList.toggle("active-page", active);
          });

          $$('[data-page]').forEach((link) => {
            const active = link.dataset.page === pageId;
            link.classList.toggle("active", active);

            if (active) {
              link.setAttribute("aria-current", "page");
            } else {
              link.removeAttribute("aria-current");
            }
          });

          const breadcrumb = $("#breadcrumb-title");
          if (breadcrumb) breadcrumb.textContent = PAGE_TITLES[pageId] || pageId;

          if (updateUrl) {
            const nextHash = `#${pageId}`;
            if (window.location.hash !== nextHash) {
              history.pushState({ page: pageId }, "", nextHash);
            }
          }

          closeMobileMenu();

          if (scroll) {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }

          if (pageId === "student-expenses" && typeof recordStudentPageView === "function") {
            recordStudentPageView();
          }
        }

        function navigateFromHash() {
          const requested = window.location.hash.replace(/^#/, "") || "overview";
          showPage(requested, { updateUrl: false, scroll: false });
        }

        window.addEventListener("hashchange", navigateFromHash);
        window.addEventListener("popstate", navigateFromHash);

        document.addEventListener("click", (event) => {
          const target = event.target instanceof Element ? event.target : event.target?.parentElement;
          const link = target?.closest('a[href^="#"]');

          if (!link) return;

          const targetId = link.getAttribute("href")?.slice(1);
          if (!targetId || !PAGE_IDS.includes(targetId)) return;

          event.preventDefault();
          showPage(targetId);
        });

        // ------------------------------------------------------------
        // Toast notifications
        // ------------------------------------------------------------

        // ------------------------------------------------------------
        // Toast notifications (Left-side & Global)
        // ------------------------------------------------------------

        let toastTimer = 0;
        let leftToastTimer = 0;

        function showToast(message) {
          // Show left toast for elegant notification
          showLeftToast("Notification", message);

          // Also update bottom toast element for accessibility fallback
          const toast = $("#toast");
          if (!toast) return;

          toast.textContent = message;
          toast.hidden = false;

          window.clearTimeout(toastTimer);
          toastTimer = window.setTimeout(() => {
            toast.hidden = true;
          }, 2400);
        }

        function showLeftToast(title, message, duration = 4000) {
          const toast = $("#left-toast");
          const titleEl = $("#left-toast-title");
          const msgEl = $("#left-toast-message");
          if (!toast) return;

          if (titleEl) titleEl.textContent = title || "Success";
          if (msgEl) msgEl.textContent = message || "Operation completed successfully.";

          toast.classList.add("show");
          toast.setAttribute("aria-hidden", "false");

          window.clearTimeout(leftToastTimer);
          leftToastTimer = window.setTimeout(() => {
            toast.classList.remove("show");
            toast.setAttribute("aria-hidden", "true");
          }, duration);
        }

        $("#left-toast-close")?.addEventListener("click", () => {
          const toast = $("#left-toast");
          if (toast) {
            toast.classList.remove("show");
            toast.setAttribute("aria-hidden", "true");
          }
        });

        // ------------------------------------------------------------
        // Mobile sidebar
        // ------------------------------------------------------------

        const sidebar = $("#sidebar");
        const menuButton = $("#menu-button");

        function closeMobileMenu() {
          if (sidebar) sidebar.classList.remove("open");
          if (menuButton) menuButton.setAttribute("aria-expanded", "false");
        }

        menuButton?.addEventListener("click", () => {
          if (!sidebar || !menuButton) return;
          const isOpen = sidebar.classList.toggle("open");
          menuButton.setAttribute("aria-expanded", String(isOpen));
        });

        document.addEventListener("keydown", (event) => {
          if (event.key === "Escape") {
            closeMobileMenu();
            closeChat();
          }
        });

        // ------------------------------------------------------------
        // Theme
        // ------------------------------------------------------------

        const themeButton = $("#theme-button");

        function updateThemeButton() {
          if (!themeButton) return;

          const isDark = document.body.classList.contains("dark");
          themeButton.setAttribute(
            "aria-label",
            isDark ? "Switch to light mode" : "Switch to dark mode"
          );
          themeButton.innerHTML = `<i class="icon fa-solid ${isDark ? "fa-sun" : "fa-moon"}" aria-hidden="true"></i>`;
        }

        const savedTheme = storage.get("bb_theme", "light");
        if (savedTheme === "dark") document.body.classList.add("dark");
        updateThemeButton();

        themeButton?.addEventListener("click", () => {
          const isDark = document.body.classList.toggle("dark");
          storage.set("bb_theme", isDark ? "dark" : "light");
          updateThemeButton();
        });

        // ------------------------------------------------------------
        // Date, time and automatic URL-based visitor counter
        // ------------------------------------------------------------

        const todayDate = $("#today-date");
        const liveClock = $("#live-clock");

        function updateDateTime() {
          const now = new Date();

          if (todayDate) {
            todayDate.textContent = new Intl.DateTimeFormat("en-PK", {
              weekday: "short",
              day: "2-digit",
              month: "short",
              year: "numeric"
            }).format(now);
          }

          if (liveClock) {
            liveClock.textContent = new Intl.DateTimeFormat("en-PK", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true
            }).format(now);
          }
        }

        updateDateTime();
        window.setInterval(updateDateTime, 1000);

        function animateCount(element, target, duration = 800) {
          if (!element) return;
          const start = Number(element.textContent.replace(/\D/g, "")) || 0;
          const started = performance.now();
          const tick = (now) => {
            const progress = Math.min(1, (now - started) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            element.textContent = Math.round(start + (target - start) * eased).toLocaleString("en-PK");
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }

        // URL / Link Based Visitor Counter (Loads from source, automatically increments via JS interval)
        let visitorCountValue = 1482;

        function updateVisitorDisplays(target, animate = true) {
          const visitCountEl = $("#visit-count");
          const dashCountEl = $("#dashboard-visitor-count");
          if (animate) {
            if (visitCountEl) animateCount(visitCountEl, target);
            if (dashCountEl) animateCount(dashCountEl, target);
          } else {
            if (visitCountEl) visitCountEl.textContent = target.toLocaleString("en-PK");
            if (dashCountEl) dashCountEl.textContent = target.toLocaleString("en-PK");
          }
        }

        async function initUrlBasedVisitorCounter() {
          try {
            // Load initial count from URL / API data source
            const response = await fetch("data.json", { cache: "no-store" });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            const baseFromSource = Number(data?.visitorCounter?.count);
            const storedIncrement = parseInt(storage.get("bb_auto_counter_offset", "0"), 10) || 0;

            if (Number.isFinite(baseFromSource) && baseFromSource > 0) {
              visitorCountValue = baseFromSource + storedIncrement + 1;
            } else {
              visitorCountValue = Math.max(1482, (parseInt(storage.get("bb_visit_count", "1482"), 10) || 1482) + 1);
            }
          } catch (err) {
            // Safe fallback if URL source is unavailable
            visitorCountValue = Math.max(1482, (parseInt(storage.get("bb_visit_count", "1482"), 10) || 1482) + 1);
          }

          storage.set("bb_visit_count", visitorCountValue);
          updateVisitorDisplays(visitorCountValue, true);

          // Automatic Interval Increment: Every 24 seconds, increment displayed count by 1
          window.setInterval(() => {
            visitorCountValue += 1;
            const currentOffset = (parseInt(storage.get("bb_auto_counter_offset", "0"), 10) || 0) + 1;
            storage.set("bb_auto_counter_offset", currentOffset);
            storage.set("bb_visit_count", visitorCountValue);
            updateVisitorDisplays(visitorCountValue, true);
          }, 24000);
        }

        initUrlBasedVisitorCounter();

        // ------------------------------------------------------------
        // 50-30-20 calculator
        // ------------------------------------------------------------

        function calculateSplit(income) {
          return {
            needs: income * 0.5,
            wants: income * 0.3,
            savings: income * 0.2
          };
        }

        function prepareCanvas(canvas) {
          if (!canvas) return null;
          const rect = canvas.getBoundingClientRect();
          const ratio = Math.max(1, window.devicePixelRatio || 1);
          canvas.width = Math.max(320, Math.floor(rect.width * ratio));
          canvas.height = Math.max(220, Math.floor(rect.height * ratio));
          const ctx = canvas.getContext("2d");
          ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
          return { ctx, width: rect.width, height: rect.height };
        }

        function roundedBar(ctx, x, y, width, height, radius) {
          if (width < 0) { x += width; width = Math.abs(width); }
          if (height < 0) { y += height; height = Math.abs(height); }
          const r = Math.max(0, Math.min(radius, width / 2, height / 2));
          
          if (r <= 0) {
            ctx.fillRect(x, y, width, height);
            return;
          }
          
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.arcTo(x + width, y, x + width, y + height, r);
          ctx.arcTo(x + width, y + height, x, y + height, r);
          ctx.arcTo(x, y + height, x, y, r);
          ctx.arcTo(x, y, x + width, y, r);
          ctx.closePath();
        }

        function renderBudgetMixChart(income = 50000) {
          const canvas = $("#budget-mix-chart");
          const setup = prepareCanvas(canvas);
          if (!setup) return;
          const { ctx, width, height } = setup;
          const dark = document.body.classList.contains("dark");
          const text = dark ? "#F5C75A" : "#000000";
          const muted = dark ? "#D9B650" : "#222222";
          const track = dark ? "#37313F" : "#ECECF1";
          const bars = [
            { label: "Needs", value: income * 0.5, pct: 50, fill: "#7761C9" },
            { label: "Wants", value: income * 0.3, pct: 30, fill: "#B87C0C" },
            { label: "Savings", value: income * 0.2, pct: 20, fill: "#9BC7B6" }
          ];

          ctx.clearRect(0, 0, width, height);
          ctx.font = "700 12px DM Sans, sans-serif";
          bars.forEach((bar, index) => {
            const y = 46 + index * 70;
            ctx.fillStyle = text;
            ctx.fillText(bar.label, 10, y);
            ctx.fillStyle = muted;
            ctx.font = "500 11px DM Sans, sans-serif";
            ctx.fillText(`${bar.pct}% · ${money(bar.value, true)}`, 10, y + 18);

            const x = Math.min(150, width * 0.28);
            const w = Math.max(120, width - x - 20);
            ctx.fillStyle = track;
            roundedBar(ctx, x, y - 11, w, 18, 9);
            ctx.fill();

            const fillW = w * (bar.pct / 50);
            ctx.fillStyle = bar.fill;
            roundedBar(ctx, x, y - 11, fillW, 18, 9);
            ctx.fill();
          });

          ctx.fillStyle = muted;
          ctx.font = "600 10px DM Sans, sans-serif";
          ctx.fillText(`Current income: ${money(income, true)}`, 10, height - 14);
        }

        function drawDonutChart(canvas, segments, centerLabel, centerValue, centerSubtext = "") {
          const setup = prepareCanvas(canvas);
          if (!setup) return;
          const { ctx, width, height } = setup;
          const dark = document.body.classList.contains("dark");
          const text = dark ? "#F5C75A" : "#000000";
          const muted = dark ? "#D9B650" : "#222222";
          const total = segments.reduce((sum, item) => sum + item.value, 0);
          const cx = width / 2;
          const cy = Math.max(100, height * 0.40);
          const radius = Math.min(width * 0.21, 70);

          ctx.clearRect(0, 0, width, height);
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.strokeStyle = dark ? "#37313F" : "#ECECF1";
          ctx.lineWidth = 20;
          ctx.stroke();

          let start = -Math.PI / 2;
          if (total > 0) {
            segments.forEach((segment) => {
              const angle = (segment.value / total) * Math.PI * 2;
              ctx.beginPath();
              ctx.arc(cx, cy, radius, start, start + angle);
              ctx.strokeStyle = segment.fill;
              ctx.lineWidth = 20;
              ctx.lineCap = "round";
              ctx.stroke();
              start += angle;
            });
          }

          ctx.textAlign = "center";
          ctx.fillStyle = text;
          ctx.font = "800 15px Manrope, sans-serif";
          ctx.fillText(centerValue, cx, cy + 2);
          ctx.fillStyle = muted;
          ctx.font = "600 10px DM Sans, sans-serif";
          ctx.fillText(centerLabel, cx, cy - 20);
          if (centerSubtext) ctx.fillText(centerSubtext, cx, cy + 21);

          const legendTop = Math.min(height - 54, cy + radius + 33);
          segments.forEach((segment, index) => {
            const y = legendTop + index * 17;
            const x = 12 + (index % 3) * Math.max(92, (width - 24) / 3);
            ctx.fillStyle = segment.fill;
            ctx.fillRect(x, y - 8, 8, 8);
            ctx.textAlign = "left";
            ctx.fillStyle = text;
            ctx.font = "600 9px DM Sans, sans-serif";
            ctx.fillText(`${segment.label} ${money(segment.value, true)}`, x + 13, y);
          });
          ctx.textAlign = "left";
        }

        function renderExpenseBreakdownChart() {
          const totals = {};
          snapshotExpenses.forEach((expense) => {
            const category = String(expense.category || "Other");
            totals[category] = (totals[category] || 0) + (Number(expense.amount) || 0);
          });

          const preferredOrder = ["Food", "Transport", "Bills", "Education", "Rent", "Shopping", "Entertainment", "Utilities", "Other"];
          const palette = ["#7761C9", "#B87C0C", "#9BC7B6", "#7A63CF", "#D09B58", "#A18AD9"];
          const segments = Object.entries(totals)
            .sort((a, b) => {
              const ai = preferredOrder.indexOf(a[0]);
              const bi = preferredOrder.indexOf(b[0]);
              if (ai === -1 && bi === -1) return b[1] - a[1];
              if (ai === -1) return 1;
              if (bi === -1) return -1;
              return ai - bi;
            })
            .slice(0, 6)
            .map(([label, value], index) => ({ label, value, fill: palette[index % palette.length] }));

          if (!segments.length) {
            segments.push({ label: "No expenses", value: 1, fill: "#D9D5E0" });
          }

          const total = snapshotExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
          drawDonutChart($("#expense-breakdown-chart"), segments, "Total", money(total, true));
        }

        function renderIncomeExpenseChart(income, totalExpenses, balance) {
          const canvas = $("#income-expense-chart");
          const setup = prepareCanvas(canvas);
          if (!setup) return;
          const { ctx, width, height } = setup;
          const dark = document.body.classList.contains("dark");
          const text = dark ? "#F5C75A" : "#000000";
          const muted = dark ? "#D9B650" : "#222222";
          const track = dark ? "#37313F" : "#ECECF1";
          const values = [
            { label: "Income", value: income, fill: "#7761C9" },
            { label: "Expenses", value: totalExpenses, fill: "#B87C0C" },
            { label: "Remaining", value: Math.max(balance, 0), fill: "#9BC7B6" }
          ];
          const max = Math.max(...values.map((item) => item.value), 1);
          const baseY = height - 42;
          const chartHeight = Math.max(110, height - 86);
          const barWidth = Math.min(82, Math.max(52, width / 7));
          const gap = Math.max(18, (width - values.length * barWidth) / (values.length + 1));

          ctx.clearRect(0, 0, width, height);
          values.forEach((item, index) => {
            const x = gap + index * (barWidth + gap);
            const barHeight = chartHeight * (item.value / max);

            ctx.fillStyle = track;
            roundedBar(ctx, x, baseY - chartHeight, barWidth, chartHeight, 10);
            ctx.fill();

            ctx.fillStyle = item.fill;
            roundedBar(ctx, x, baseY - barHeight, barWidth, Math.max(4, barHeight), 10);
            ctx.fill();

            ctx.textAlign = "center";
            ctx.fillStyle = text;
            ctx.font = "700 10px DM Sans, sans-serif";
            ctx.fillText(item.label, x + barWidth / 2, baseY + 17);
            ctx.font = "600 10px DM Sans, sans-serif";
            ctx.fillText(money(item.value, true), x + barWidth / 2, Math.max(22, baseY - barHeight - 10));
          });

          ctx.textAlign = "left";
          ctx.fillStyle = muted;
          ctx.font = "600 10px DM Sans, sans-serif";
          ctx.fillText(balance >= 0 ? "Positive balance remains after current expenses." : "Expenses are above income in this snapshot.", 10, 18);
        }

        function renderSavingsChart() {
          const canvas = $("#savings-chart");
          const setup = prepareCanvas(canvas);
          if (!setup) return;
          const { ctx, width, height } = setup;
          const dark = document.body.classList.contains("dark");
          const text = dark ? "#F5C75A" : "#000000";
          const muted = dark ? "#D9B650" : "#222222";
          const track = dark ? "#37313F" : "#ECECF1";
          const income = snapshotPlannerIncome;
          const totalExpenses = snapshotExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
          const balance = income - totalExpenses;
          const goalCurrent = safeNumber($("#goal-current")?.value);
          const goalSaved = Number.isFinite(goalCurrent) && goalCurrent >= 0 ? goalCurrent : 0;
          const values = [
            { label: "Income", value: income, fill: "#7761C9" },
            { label: "Remaining", value: Math.max(balance, 0), fill: "#9BC7B6" },
            { label: "Goal saved", value: goalSaved, fill: "#B87C0C" }
          ];
          const max = Math.max(...values.map((item) => item.value), 1);
          const baseY = height - 42;
          const top = 34;
          const chartHeight = height - 88;
          const slot = (width - 36) / values.length;

          ctx.clearRect(0, 0, width, height);
          values.forEach((item, index) => {
            const barW = Math.min(70, slot * 0.46);
            const x = 18 + slot * index + (slot - barW) / 2;
            const fullH = chartHeight;
            const barH = Math.max(4, fullH * (item.value / max));

            ctx.fillStyle = track;
            roundedBar(ctx, x, baseY - fullH, barW, fullH, 10);
            ctx.fill();

            ctx.fillStyle = item.fill;
            roundedBar(ctx, x, baseY - barH, barW, barH, 10);
            ctx.fill();

            ctx.textAlign = "center";
            ctx.fillStyle = text;
            ctx.font = "700 10px DM Sans, sans-serif";
            ctx.fillText(item.label, x + barW / 2, baseY + 17);
            ctx.font = "600 10px DM Sans, sans-serif";
            ctx.fillText(money(item.value, true), x + barW / 2, Math.max(top, baseY - barH - 9));
          });

          ctx.textAlign = "left";
          ctx.fillStyle = muted;
          ctx.font = "600 10px DM Sans, sans-serif";
          ctx.fillText(balance >= 0 ? `Remaining buffer: ${money(balance, true)}` : `Over budget: ${money(Math.abs(balance), true)}`, 10, 17);
        }

        function getSnapshotIncome() {
          return Number.isFinite(snapshotPlannerIncome) && snapshotPlannerIncome >= 0
            ? snapshotPlannerIncome
            : 50000;
        }

        function renderVisualCharts() {
          const income = getSnapshotIncome();
          snapshotPlannerIncome = income;
          const totalExpenses = snapshotExpenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
          const balance = income - totalExpenses;

          const snapshotIncome = $("#snapshot-income");
          const snapshotExpensesEl = $("#snapshot-expenses");
          const snapshotBalance = $("#snapshot-balance");
          const snapshotGoalSaved = $("#snapshot-goal-saved");

          if (snapshotIncome) snapshotIncome.textContent = money(income, true);
          if (snapshotExpensesEl) snapshotExpensesEl.textContent = money(totalExpenses, true);
          if (snapshotBalance) snapshotBalance.textContent = money(balance, true);
          if (snapshotGoalSaved) {
            const goalCurrent = safeNumber($("#goal-current")?.value);
            snapshotGoalSaved.textContent = money(Number.isFinite(goalCurrent) ? goalCurrent : 0, true);
          }

          renderBudgetMixChart(income);
          renderExpenseBreakdownChart();
          renderIncomeExpenseChart(income, totalExpenses, balance);
          renderSavingsChart();
        }

        window.addEventListener("resize", () => {
          window.clearTimeout(window.__bbChartResizeTimer);
          window.__bbChartResizeTimer = window.setTimeout(renderVisualCharts, 120);
        });

        $("#budget-mix-chart")?.addEventListener("click", () => {
          const income = getSnapshotIncome();
          const split = calculateSplit(income);
          showToast(`Needs ${money(split.needs, true)} · Wants ${money(split.wants, true)} · Savings ${money(split.savings, true)}`);
        });

        function validatePositiveNumber(value, label) {
          const number = safeNumber(value);
          if (!Number.isFinite(number) || number <= 0) {
            return { valid: false, value: 0, message: `${label} must be greater than 0.` };
          }
          return { valid: true, value: number, message: "" };
        }

        function renderQuickBudget(income) {
          const result = calculateSplit(income);

          const donutIncome = $("#donut-income");
          const quickNeeds = $("#quick-needs");
          const quickWants = $("#quick-wants");
          const quickSavings = $("#quick-savings");

          if (donutIncome) donutIncome.textContent = money(income, true);
          if (quickNeeds) quickNeeds.textContent = money(result.needs, true);
          if (quickWants) quickWants.textContent = money(result.wants, true);
          if (quickSavings) quickSavings.textContent = money(result.savings, true);
        }

        function renderFullBudget(income) {
          const result = calculateSplit(income);
          const output = $("#allocation-results");
          if (!output) return;

          output.innerHTML = `
      <div class="three-column">
        <article class="allocation-card">
          <div class="allocation-title">
            <div>
              <span class="icon-tile purple">
                <i class="icon fa-solid fa-house" aria-hidden="true"></i>
              </span>
              <h3>Needs · 50%</h3>
            </div>
            <strong>${money(result.needs)}</strong>
          </div>
          <p>Essential costs.</p>
          <div class="allocation-bar" aria-label="50 percent needs">
            <span style="width:50%"></span>
          </div>
        </article>

        <article class="allocation-card">
          <div class="allocation-title">
            <div>
              <span class="icon-tile peach">
                <i class="icon fa-solid fa-heart" aria-hidden="true"></i>
              </span>
              <h3>Wants · 30%</h3>
            </div>
            <strong>${money(result.wants)}</strong>
          </div>
          <p>Optional spending.</p>
          <div class="allocation-bar" aria-label="30 percent wants">
            <span style="width:30%"></span>
          </div>
        </article>

        <article class="allocation-card">
          <div class="allocation-title">
            <div>
              <span class="icon-tile green">
                <i class="icon fa-solid fa-seedling" aria-hidden="true"></i>
              </span>
              <h3>Savings · 20%</h3>
            </div>
            <strong>${money(result.savings)}</strong>
          </div>
          <p>Future goals.</p>
          <div class="allocation-bar" aria-label="20 percent savings">
            <span style="width:20%"></span>
          </div>
        </article>
      </div>
    `;
        }

        $("#quick-income")?.addEventListener("input", () => {
          const value = safeNumber($("#quick-income")?.value);
          if (Number.isFinite(value) && value >= 0) {
            renderQuickBudget(value);
            snapshotPlannerIncome = value;
            renderVisualCharts();
          }
        });

        $("#monthly-income")?.addEventListener("input", () => {
          const value = safeNumber($("#monthly-income")?.value);
          if (Number.isFinite(value) && value >= 0) {
            renderFullBudget(value);
            snapshotPlannerIncome = value;
            renderVisualCharts();
          }
        });

        $("#quick-budget-form")?.addEventListener("submit", (event) => {
          event.preventDefault();

          const check = validatePositiveNumber($("#quick-income")?.value, "Monthly income");
          const error = $("#quick-error");

          if (!check.valid) {
            if (error) error.textContent = check.message;
            return;
          }

          if (error) error.textContent = "";
          renderQuickBudget(check.value);
          renderVisualCharts();
          showToast("Budget split updated.");
        });

        $("#budget-form")?.addEventListener("submit", (event) => {
          event.preventDefault();

          const check = validatePositiveNumber($("#monthly-income")?.value, "Monthly income");
          const error = $("#budget-error");
          const output = $("#allocation-results");

          if (!check.valid) {
            if (error) error.textContent = check.message;
            if (output) output.innerHTML = "";
            return;
          }

          if (error) error.textContent = "";
          renderFullBudget(check.value);
          renderQuickBudget(check.value);
          renderVisualCharts();
          showToast("Your educational budget estimate is ready.");
        });

        const initialQuickIncome = safeNumber($("#quick-income")?.value);
        if (Number.isFinite(initialQuickIncome) && initialQuickIncome > 0) {
          renderQuickBudget(initialQuickIncome);
        }

        // ------------------------------------------------------------
        // Budgeting basics knowledge check
        // ------------------------------------------------------------

        $("#quiz-form")?.addEventListener("submit", (event) => {
          event.preventDefault();

          const fixedAnswer = $('input[name="quiz-fixed"]:checked')?.value;
          const savingsAnswer = $('input[name="quiz-savings"]:checked')?.value;
          const result = $("#quiz-result");

          if (!result) return;

          if (!fixedAnswer || !savingsAnswer) {
            result.textContent = "Choose an answer for both questions first.";
            result.dataset.state = "warning";
            return;
          }

          const score = Number(fixedAnswer === "right") + Number(savingsAnswer === "right");
          result.textContent = score === 2
            ? "Great job — both answers are correct."
            : `You got ${score} of 2 correct. Review the basics and try again.`;
          result.dataset.state = score === 2 ? "success" : "warning";
        });

        // ------------------------------------------------------------
        // ------------------------------------------------------------
        // Needs vs. wants interactive quiz
        // ------------------------------------------------------------

        const needsQuestions = [
          { emoji: "🛒", text: "Is buying groceries a Need or a Want?", context: "Basic food for regular meals is an essential household expense.", answer: "need", explanation: "Groceries provide basic food, so they are generally a need." },
          { emoji: "🎮", text: "Is buying a new gaming console a Need or a Want?", context: "You already have entertainment options and no essential need for the console.", answer: "want", explanation: "A gaming console is optional entertainment, so it is a want." },
          { emoji: "🏠", text: "Is paying rent a Need or a Want?", context: "Rent provides your basic housing.", answer: "need", explanation: "Housing is a core living cost, so regular rent is a need." },
          { emoji: "👗", text: "Is buying a designer outfit a Need or a Want?", context: "You already have suitable clothes for everyday use.", answer: "want", explanation: "A designer upgrade is optional when you already have usable clothing." },
          { emoji: "🎓", text: "Is paying a school or college fee a Need or a Want?", context: "The fee supports access to your education.", answer: "need", explanation: "Necessary education costs are needs because they support your studies." },
          { emoji: "📱", text: "Is buying a new phone when your current phone still works a Need or a Want?", context: "Your existing phone is still usable.", answer: "want", explanation: "Replacing a working phone for an upgrade is normally a want." },
          { emoji: "🚌", text: "Is paying for transportation to school or work a Need or a Want?", context: "You need a practical way to reach school or work.", answer: "need", explanation: "Necessary transportation can be a need when it helps you reach school or work." },
          { emoji: "🍔", text: "Is ordering food when you already have food at home a Need or a Want?", context: "Food is already available at home.", answer: "want", explanation: "Ordering instead of using available food is usually optional spending." },
          { emoji: "💊", text: "Is purchasing medicine a Need or a Want?", context: "The medicine is required for your health.", answer: "need", explanation: "Necessary medicine supports health and is therefore a need." },
          { emoji: "📺", text: "Is buying a streaming subscription a Need or a Want?", context: "The subscription is for optional entertainment.", answer: "want", explanation: "Streaming services are optional entertainment expenses." },
          { emoji: "💡", text: "Is paying an electricity bill a Need or a Want?", context: "The bill covers a basic household utility.", answer: "need", explanation: "Electricity is a basic utility expense, so the bill is a need." },
          { emoji: "🕶️", text: "Is buying expensive accessories just because they are trending a Need or a Want?", context: "The purchase is driven by fashion trends rather than necessity.", answer: "want", explanation: "Trend-driven accessories are optional purchases, making them wants." },
          { emoji: "✏️", text: "Is purchasing stationery for studies a Need or a Want?", context: "The stationery is needed for your coursework.", answer: "need", explanation: "Necessary study supplies support education, so they are a need." },
          { emoji: "✈️", text: "Is going on an expensive entertainment trip a Need or a Want?", context: "The trip is for leisure and is not required for basic living or study.", answer: "want", explanation: "An expensive leisure trip is optional entertainment spending." },
          { emoji: "👕", text: "Is buying basic clothing because your existing clothes are no longer usable a Need or a Want?", context: "You need usable everyday clothes and the current clothes cannot be used.", answer: "need", explanation: "Replacing unusable basic clothing is a practical need." }
        ];

        let needsQuizState = { questions: [], index: 0, score: 0, answered: false };

        function shuffleArray(items) {
          const copy = [...items];
          for (let i = copy.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
          }
          return copy;
        }

        function startNeedsQuiz() {
          needsQuizState = { questions: shuffleArray(needsQuestions), index: 0, score: 0, answered: false };
          renderNeedsQuizQuestion();
        }

        function renderNeedsQuizQuestion() {
          const current = needsQuizState.questions[needsQuizState.index];
          if (!current) return;

          const count = $("#needs-question-count");
          const type = $("#needs-question-type");
          const emoji = $("#needs-question-emoji");
          const text = $("#needs-question-text");
          const context = $("#needs-question-context");
          const score = $("#needs-score");
          const fill = $("#needs-progress-fill");
          const feedback = $("#needs-feedback");

          if (count) count.textContent = `Question ${needsQuizState.index + 1} of ${needsQuizState.questions.length}`;
          if (type) type.textContent = "Budgeting decision";
          if (emoji) emoji.textContent = current.emoji;
          if (text) text.textContent = current.text;
          if (context) context.textContent = current.context;
          if (score) score.textContent = `${needsQuizState.score} / ${needsQuizState.questions.length}`;
          if (fill) fill.style.width = `${(needsQuizState.index / needsQuizState.questions.length) * 100}%`;
          if (feedback) { feedback.textContent = ""; feedback.dataset.state = ""; }

          const next = $("#needs-next");
          const restart = $("#needs-restart");
          if (next) next.hidden = true;
          if (restart) restart.hidden = true;

          needsQuizState.answered = false;
          $$(".needs-answer").forEach((button) => {
            button.disabled = false;
            button.classList.remove("answer-correct", "answer-wrong");
            button.removeAttribute("aria-pressed");
          });
        }

        $$(".needs-answer").forEach((button) => {
          button.addEventListener("click", () => {
            if (needsQuizState.answered) return;
            const current = needsQuizState.questions[needsQuizState.index];
            const chosen = button.dataset.answer;
            const correct = chosen === current.answer;
            needsQuizState.answered = true;
            if (correct) needsQuizState.score += 1;

            $$(".needs-answer").forEach((control) => {
              control.disabled = true;
              control.setAttribute("aria-pressed", control === button ? "true" : "false");
              if (control.dataset.answer === current.answer) control.classList.add("answer-correct");
              if (control === button && !correct) control.classList.add("answer-wrong");
            });

            const feedback = $("#needs-feedback");
            if (feedback) {
              feedback.innerHTML = correct
                ? `<strong>Correct!</strong> ${escapeHtml(current.explanation)}`
                : `<strong>Not quite.</strong> The correct answer is <b>${escapeHtml(current.answer.toUpperCase())}</b>. ${escapeHtml(current.explanation)}`;
              feedback.dataset.state = correct ? "success" : "warning";
            }

            const score = $("#needs-score");
            if (score) score.textContent = `${needsQuizState.score} / ${needsQuizState.questions.length}`;

            const fill = $("#needs-progress-fill");
            if (fill) fill.style.width = `${((needsQuizState.index + 1) / needsQuizState.questions.length) * 100}%`;

            const isLast = needsQuizState.index === needsQuizState.questions.length - 1;
            if (isLast) {
              $("#needs-next") && ($("#needs-next").hidden = true);
              $("#needs-restart") && ($("#needs-restart").hidden = false);
              if (feedback) {
                feedback.innerHTML += `<div class="quiz-final-result">Final score: <strong>${needsQuizState.score} / ${needsQuizState.questions.length}</strong> — ${needsQuizState.score >= 12 ? "Excellent budgeting judgment." : needsQuizState.score >= 9 ? "Good progress. Review a few tricky cases and try again." : "Keep practicing; context helps you tell needs from wants."}</div>`;
              }
            } else {
              $("#needs-next") && ($("#needs-next").hidden = false);
            }
          });
        });

        $("#needs-next")?.addEventListener("click", () => {
          needsQuizState.index += 1;
          renderNeedsQuizQuestion();
        });
        $("#needs-restart")?.addEventListener("click", startNeedsQuiz);
        startNeedsQuiz();

        // ------------------------------------------------------------
        // Educational budgeting games
        // ------------------------------------------------------------

        const budgetGameIncomeValue = 50000;
        const budgetGameNames = ["food", "transport", "education", "entertainment", "shopping", "bills"];

        function updateBudgetGameTotals() {
          let total = 0;
          budgetGameNames.forEach((name) => {
            const selected = $(`input[name="budget-${name}"]:checked`);
            total += safeNumber(selected?.value) || 0;
          });
          const remaining = budgetGameIncomeValue - total;
          if ($("#budget-total-income")) $("#budget-total-income").textContent = money(budgetGameIncomeValue, true);
          if ($("#budget-total-spending")) $("#budget-total-spending").textContent = money(total, true);
          if ($("#budget-remaining")) $("#budget-remaining").textContent = money(remaining, true);

          const feedback = $("#budget-game-feedback");
          if (feedback) {
            feedback.textContent = total > budgetGameIncomeValue
              ? `You are ${money(total - budgetGameIncomeValue, true)} over the monthly income. Choose a more affordable combination.`
              : `${money(remaining, true)} remains. Complete all categories and check your result.`;
            feedback.dataset.state = total > budgetGameIncomeValue ? "warning" : "";
          }
          return { total, remaining };
        }

        $$('#budget-game-options input[type="radio"]').forEach((input) => input.addEventListener("change", updateBudgetGameTotals));

        $("#budget-game-check")?.addEventListener("click", () => {
          const { total, remaining } = updateBudgetGameTotals();
          const selectedCount = budgetGameNames.filter((name) => $(`input[name="budget-${name}"]:checked`)).length;
          const feedback = $("#budget-game-feedback");
          if (!feedback) return;

          if (selectedCount < budgetGameNames.length) {
            feedback.textContent = "Choose one option for each category before checking your budget.";
            feedback.dataset.state = "warning";
            return;
          }
          if (total > budgetGameIncomeValue) {
            feedback.textContent = `Over budget by ${money(total - budgetGameIncomeValue, true)}. Reduce optional spending and try again.`;
            feedback.dataset.state = "warning";
            return;
          }

          feedback.innerHTML = `<strong>Budget works!</strong> You spend ${money(total, true)} and have ${money(remaining, true)} left. ${remaining >= 10000 ? "Nice buffer for savings or future needs." : "Consider trimming a few wants so more money stays available."}`;
          feedback.dataset.state = remaining >= 10000 ? "success" : "warning";
        });

        $("#budget-game-reset")?.addEventListener("click", () => {
          $$('#budget-game-options input[type="radio"]').forEach((input) => { input.checked = false; });
          updateBudgetGameTotals();
        });
        updateBudgetGameTotals();

        // Game 2 — Need or Want Challenge
        const nwGameQuestions = [
          { text: "You already have a working smartphone, but a newer model has been released.", answer: "want", explanation: "A working phone means the upgrade is optional." },
          { text: "You need a bus pass to reach college each weekday.", answer: "need", explanation: "Necessary transport for school can be a basic need." },
          { text: "You already have enough shirts, but a trending designer shirt is on sale.", answer: "want", explanation: "A trendy upgrade is optional when usable clothing is available." },
          { text: "Your course requires a textbook you do not own.", answer: "need", explanation: "Required course material supports your education." },
          { text: "You want a subscription for a second streaming service.", answer: "want", explanation: "Extra entertainment subscriptions are optional." },
          { text: "Your only pair of everyday shoes is damaged beyond practical use.", answer: "need", explanation: "Replacing unusable everyday footwear is a practical need." },
          { text: "You are buying expensive headphones mainly because your friends have them.", answer: "want", explanation: "Social pressure does not turn an optional upgrade into a need." },
          { text: "You need prescribed medicine that a healthcare professional has instructed you to take.", answer: "need", explanation: "Necessary medicine supports health." }
        ];
        let nwGameState = { index: 0, score: 0, answered: false };

        function renderNwGame() {
          const current = nwGameQuestions[nwGameState.index];
          if (!current) return;
          if ($("#nw-game-round")) $("#nw-game-round").textContent = `Round ${nwGameState.index + 1} of ${nwGameQuestions.length}`;
          if ($("#nw-game-scenario")) $("#nw-game-scenario").textContent = current.text;
          if ($("#nw-game-score")) $("#nw-game-score").textContent = `${nwGameState.score} / ${nwGameQuestions.length}`;
          if ($("#nw-game-progress")) $("#nw-game-progress").textContent = `${Math.round((nwGameState.index / nwGameQuestions.length) * 100)}%`;
          const feedback = $("#nw-game-feedback");
          if (feedback) { feedback.textContent = ""; feedback.dataset.state = ""; }
          if ($("#nw-game-next")) $("#nw-game-next").hidden = true;
          if ($("#nw-game-restart")) $("#nw-game-restart").hidden = true;
          nwGameState.answered = false;
          $$(".nw-game-answer").forEach((button) => {
            button.disabled = false;
            button.classList.remove("answer-correct", "answer-wrong");
          });
        }

        $$(".nw-game-answer").forEach((button) => {
          button.addEventListener("click", () => {
            if (nwGameState.answered) return;
            const current = nwGameQuestions[nwGameState.index];
            const chosen = button.dataset.answer;
            const correct = chosen === current.answer;
            nwGameState.answered = true;
            if (correct) nwGameState.score += 1;

            $$(".nw-game-answer").forEach((control) => {
              control.disabled = true;
              if (control.dataset.answer === current.answer) control.classList.add("answer-correct");
              if (control === button && !correct) control.classList.add("answer-wrong");
            });

            const feedback = $("#nw-game-feedback");
            if (feedback) {
              feedback.innerHTML = correct
                ? `<strong>Correct!</strong> ${escapeHtml(current.explanation)}`
                : `<strong>Not quite.</strong> The correct answer is <b>${escapeHtml(current.answer.toUpperCase())}</b>. ${escapeHtml(current.explanation)}`;
              feedback.dataset.state = correct ? "success" : "warning";
            }

            if ($("#nw-game-score")) $("#nw-game-score").textContent = `${nwGameState.score} / ${nwGameQuestions.length}`;

            if (nwGameState.index === nwGameQuestions.length - 1) {
              if ($("#nw-game-restart")) $("#nw-game-restart").hidden = false;
              if (feedback) feedback.innerHTML += `<div class="quiz-final-result">Your Score: <strong>${nwGameState.score} / ${nwGameQuestions.length}</strong></div>`;
            } else {
              if ($("#nw-game-next")) $("#nw-game-next").hidden = false;
            }
          });
        });

        $("#nw-game-next")?.addEventListener("click", () => {
          nwGameState.index += 1;
          renderNwGame();
        });
        $("#nw-game-restart")?.addEventListener("click", () => {
          nwGameState = { index: 0, score: 0, answered: false };
          renderNwGame();
        });
        renderNwGame();

        // Game 3 — Savings Challenge
        const savingsGameRounds = [
          {
            scenario: "For transport this month, what would you choose?",
            options: [
              { label: "Use public transport and plan the route", amount: 4000, hint: "Lower-cost choice keeps more money available for your savings goal." },
              { label: "Use ride-hailing for most trips", amount: 9000, hint: "Convenient, but the higher cost reduces the amount you can save." }
            ]
          },
          {
            scenario: "For meals, what would you choose?",
            options: [
              { label: "Cook at home most days", amount: 5000, hint: "Planning meals can leave more money for your savings goal." },
              { label: "Order food regularly", amount: 11000, hint: "Frequent delivery costs can reduce your savings buffer." }
            ]
          },
          {
            scenario: "For shopping, what would you choose?",
            options: [
              { label: "Buy only planned basics", amount: 4000, hint: "Planned shopping keeps spending focused." },
              { label: "Buy several trending items", amount: 12000, hint: "Optional purchases can make your savings target harder to reach." }
            ]
          },
          {
            scenario: "For entertainment, what would you choose?",
            options: [
              { label: "Choose a low-cost activity", amount: 2500, hint: "You can enjoy free or low-cost activities while still saving." },
              { label: "Take an expensive entertainment trip", amount: 8000, hint: "A costly leisure choice uses money that could protect your savings goal." }
            ]
          }
        ];

        let savingsGameState = { index: 0, spent: 0, answered: false };

        function renderSavingsGame() {
          const round = savingsGameRounds[savingsGameState.index];
          if (!round) return;
          if ($("#savings-game-round")) $("#savings-game-round").textContent = `Round ${savingsGameState.index + 1} of ${savingsGameRounds.length}`;
          if ($("#savings-game-scenario")) $("#savings-game-scenario").textContent = round.scenario;

          const optionsBox = $("#savings-game-options");
          if (optionsBox) {
            optionsBox.innerHTML = round.options.map((option, index) => `
        <button type="button" class="savings-choice" data-savings-choice="${index}">
          <span>${escapeHtml(option.label)}</span>
          <b>${money(option.amount, true)}</b>
        </button>
      `).join("");
          }

          const currentSavings = budgetGameIncomeValue - savingsGameState.spent;
          if ($("#savings-game-spent")) $("#savings-game-spent").textContent = money(savingsGameState.spent, true);
          if ($("#savings-game-current")) $("#savings-game-current").textContent = money(currentSavings, true);
          if ($("#savings-game-progress-fill")) $("#savings-game-progress-fill").style.width = `${(savingsGameState.index / savingsGameRounds.length) * 100}%`;
          const feedback = $("#savings-game-feedback");
          if (feedback) { feedback.textContent = ""; feedback.dataset.state = ""; }
          savingsGameState.answered = false;
        }

        $("#savings-game-options")?.addEventListener("click", (event) => {
          const target = event.target instanceof Element ? event.target : event.target?.parentElement;
          const choice = target?.closest("[data-savings-choice]");
          if (!choice || savingsGameState.answered) return;

          const index = Number(choice.dataset.savingsChoice);
          const round = savingsGameRounds[savingsGameState.index];
          const selected = round?.options[index];
          if (!selected) return;

          savingsGameState.answered = true;
          savingsGameState.spent += selected.amount;

          $$("#savings-game-options .savings-choice").forEach((button) => {
            button.disabled = true;
            if (button === choice) button.classList.add("selected");
          });

          const currentSavings = budgetGameIncomeValue - savingsGameState.spent;
          const feedback = $("#savings-game-feedback");
          if (feedback) {
            feedback.innerHTML = `${escapeHtml(selected.hint)} <strong>Current savings: ${money(currentSavings, true)}</strong>`;
            feedback.dataset.state = currentSavings >= 20000 ? "success" : "warning";
          }

          if ($("#savings-game-progress-fill")) $("#savings-game-progress-fill").style.width = `${((savingsGameState.index + 1) / savingsGameRounds.length) * 100}%`;

          if (savingsGameState.index < savingsGameRounds.length - 1) {
            setTimeout(() => {
              savingsGameState.index += 1;
              renderSavingsGame();
            }, 450);
          } else {
            const finalMessage = currentSavings >= 20000
              ? `Challenge complete! You reached ${money(currentSavings, true)} in savings and met the ${money(20000, true)} goal.`
              : `Challenge complete. You finished with ${money(currentSavings, true)} in savings, below the ${money(20000, true)} goal. Review the higher-cost choices and try again.`;
            if (feedback) feedback.innerHTML += `<div class="quiz-final-result">${escapeHtml(finalMessage)}</div>`;
          }
        });

        $("#savings-game-restart")?.addEventListener("click", () => {
          savingsGameState = { index: 0, spent: 0, answered: false };
          renderSavingsGame();
        });
        renderSavingsGame();

        // ------------------------------------------------------------
        // Savings goals
        // ------------------------------------------------------------

        function calculateSavingsGoal({ target, current, monthly }) {
          const remaining = Math.max(target - current, 0);
          const months = remaining === 0 ? 0 : Math.ceil(remaining / monthly);
          const percent = Math.min(100, Math.round((current / target) * 100));
          return { remaining, months, percent };
        }

        function renderSavingsResult(name, target, current, monthly) {
          const output = $("#savings-results");
          if (!output) return;

          const result = calculateSavingsGoal({ target, current, monthly });

          output.innerHTML = `
      <span class="large-goal-icon" aria-hidden="true">🎯</span>
      <span class="badge">GOAL PLAN</span>
      <h2>${escapeHtml(name)}</h2>
      <p class="muted">
        ${money(result.remaining)} remaining at ${money(monthly)} per month.
      </p>
      <span class="months-number">${result.months}</span>
      <span class="muted">estimated month${result.months === 1 ? "" : "s"} to reach this goal</span>
      <progress max="100" value="${result.percent}" aria-label="Savings goal progress">${result.percent}%</progress>
      <p class="muted">Progress: <strong>${result.percent}%</strong></p>
    `;

          const goalName = $("#dashboard-goal-name");
          const goalTarget = $("#dashboard-target");
          const goalSaved = $("#dashboard-saved");
          const goalPercent = $("#dashboard-percent");
          const goalProgress = $("#dashboard-progress");
          const goalMonths = $("#dashboard-months");
          const goalMonthly = $("#dashboard-monthly");

          if (goalName) goalName.textContent = name;
          if (goalTarget) goalTarget.textContent = money(target, true);
          if (goalSaved) goalSaved.textContent = money(current, true);
          if (goalPercent) goalPercent.textContent = `${result.percent}%`;
          if (goalProgress) goalProgress.value = result.percent;
          if (goalMonths) goalMonths.textContent = `${result.months} month${result.months === 1 ? "" : "s"} to go`;
          if (goalMonthly) goalMonthly.textContent = `at ${money(monthly, true)} / month`;
        }

        $("#savings-form")?.addEventListener("submit", (event) => {
          event.preventDefault();

          const name = $("#goal-name")?.value.trim();
          const target = safeNumber($("#goal-target")?.value);
          const current = safeNumber($("#goal-current")?.value);
          const monthly = safeNumber($("#goal-monthly")?.value);
          const error = $("#savings-error");

          if (!name) {
            if (error) error.textContent = "Enter a name for your savings goal.";
            return;
          }

          if (!Number.isFinite(target) || target <= 0) {
            if (error) error.textContent = "Target amount must be greater than 0.";
            return;
          }

          if (!Number.isFinite(current) || current < 0) {
            if (error) error.textContent = "Current savings cannot be negative.";
            return;
          }

          if (current > target) {
            if (error) error.textContent = "Current savings cannot be greater than the target amount.";
            return;
          }

          if (!Number.isFinite(monthly) || monthly <= 0) {
            if (error) error.textContent = "Monthly contribution must be greater than 0.";
            return;
          }

          if (error) error.textContent = "";
          renderSavingsResult(name, target, current, monthly);
          renderVisualCharts();
          showToast("Savings goal updated.");
        });

        ["#goal-name", "#goal-target", "#goal-current", "#goal-monthly"].forEach((selector) => {
          $(selector)?.addEventListener("input", () => {
            const name = $("#goal-name")?.value.trim() || "Savings goal";
            const target = safeNumber($("#goal-target")?.value);
            const current = safeNumber($("#goal-current")?.value);
            const monthly = safeNumber($("#goal-monthly")?.value);

            if (name && Number.isFinite(target) && target > 0 && Number.isFinite(current) && current >= 0 && current <= target && Number.isFinite(monthly) && monthly > 0) {
              renderSavingsResult(name, target, current, monthly);
            }
            renderVisualCharts();
          });
        });

        // Render the form's default goal on first load.
        const initialGoal = {
          name: $("#goal-name")?.value.trim() || "New laptop fund",
          target: safeNumber($("#goal-target")?.value),
          current: safeNumber($("#goal-current")?.value),
          monthly: safeNumber($("#goal-monthly")?.value)
        };

        if (
          initialGoal.name &&
          Number.isFinite(initialGoal.target) && initialGoal.target > 0 &&
          Number.isFinite(initialGoal.current) && initialGoal.current >= 0 &&
          initialGoal.current <= initialGoal.target &&
          Number.isFinite(initialGoal.monthly) && initialGoal.monthly > 0
        ) {
          renderSavingsResult(initialGoal.name, initialGoal.target, initialGoal.current, initialGoal.monthly);
        }

        // ------------------------------------------------------------
        // Expense planner — Completely Independent Feature
        // ------------------------------------------------------------

        let plannerIncome = Number(localStorage.getItem('bb_planner_income')) || 50000;
        let editingExpenseId = null;

        const defaultExpenses = [
          { id: "exp-1", date: localISODate(), category: "Food", description: "Monthly groceries & canteen", amount: 10000 },
          { id: "exp-2", date: localISODate(), category: "Transport", description: "Campus bus & travel pass", amount: 5000 },
          { id: "exp-3", date: localISODate(), category: "Bills", description: "Mobile internet & room electricity", amount: 8000 },
          { id: "exp-4", date: localISODate(), category: "Education", description: "Semester books & course handouts", amount: 7000 }
        ];

        let expenses = localStorage.getItem('bb_expenses') 
          ? JSON.parse(localStorage.getItem('bb_expenses')) 
          : defaultExpenses;

        snapshotExpenses = expenses;
        snapshotPlannerIncome = plannerIncome;

        function getPlannerIncome() {
          const inputVal = safeNumber($("#planner-income-input")?.value);
          if (Number.isFinite(inputVal) && inputVal >= 0) {
            plannerIncome = inputVal;
          }
          return plannerIncome;
        }

        function getVisibleExpenses() {
          const category = $("#expense-filter")?.value || "all";
          const sort = $("#expense-sort")?.value || "newest";
          let list = [...expenses];

          if (category !== "all") {
            list = list.filter((expense) => expense.category === category);
          }

          if (sort === "newest") {
            list.sort((a, b) => b.date.localeCompare(a.date));
          } else if (sort === "highest") {
            list.sort((a, b) => b.amount - a.amount);
          } else if (sort === "lowest") {
            list.sort((a, b) => a.amount - b.amount);
          }

          return list;
        }

        function renderExpenses() {
          const table = $("#expense-table");
          const income = getPlannerIncome();
          const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
          const balance = income - total;
          const percentUsed = income > 0 ? Math.round((total / income) * 100) : 0;
          snapshotPlannerIncome = income;
          snapshotExpenses = expenses;
          localStorage.setItem('bb_planner_income', income);
          localStorage.setItem('bb_expenses', JSON.stringify(expenses));
          renderVisualCharts();

          const incomeElement = $("#expense-income");
          const totalElement = $("#expense-total");
          const balanceElement = $("#expense-balance");
          const countElement = $("#expense-entry-count");
          const balanceBadge = $("#balance-status-badge");
          const balanceIconTile = $("#balance-icon-tile");
          const progressFill = $("#planner-progress-fill");
          const progressText = $("#planner-progress-text");
          const percentChip = $("#planner-percent-chip");

          if (incomeElement) incomeElement.textContent = money(income);
          if (totalElement) totalElement.textContent = money(total);
          if (balanceElement) balanceElement.textContent = money(balance);
          if (countElement) countElement.textContent = `${expenses.length} ${expenses.length === 1 ? "entry" : "entries"}`;

          // Update status badge & progress bar
          if (balanceBadge) {
            if (balance >= 0) {
              balanceBadge.className = "badge-status-positive";
              balanceBadge.innerHTML = `<i class="icon fa-solid fa-circle-check" aria-hidden="true"></i> <span>Surplus: ${money(balance)} saved</span>`;
              if (balanceIconTile) balanceIconTile.className = "icon-tile-mini gold";
            } else {
              balanceBadge.className = "badge-status-negative";
              balanceBadge.innerHTML = `<i class="icon fa-solid fa-triangle-exclamation" aria-hidden="true"></i> <span>Deficit: Over budget by ${money(Math.abs(balance))}</span>`;
              if (balanceIconTile) balanceIconTile.className = "icon-tile-mini peach";
            }
          }

          if (progressFill) {
            const fillPct = Math.min(100, Math.max(0, percentUsed));
            progressFill.style.width = `${fillPct}%`;
            if (percentUsed > 100) {
              progressFill.style.background = "#e05252";
            } else if (percentUsed > 85) {
              progressFill.style.background = "linear-gradient(135deg, #e5a93c, #e05252)";
            } else {
              progressFill.style.background = "linear-gradient(135deg, var(--purple), var(--gold))";
            }
          }

          if (progressText) {
            progressText.textContent = `${money(total)} spent of ${money(income)} (${percentUsed}% used · ${balance >= 0 ? money(balance) + " remaining" : "Over by " + money(Math.abs(balance))})`;
          }

          if (percentChip) {
            percentChip.textContent = `${percentUsed}% Used`;
            if (percentUsed > 100) {
              percentChip.className = "percent-chip chip-danger";
            } else if (percentUsed > 85) {
              percentChip.className = "percent-chip chip-warning";
            } else {
              percentChip.className = "percent-chip";
            }
          }

          if (!table) return;

          const visible = getVisibleExpenses();
          if (!visible.length) {
            table.innerHTML = `
        <div class="empty-table">
          <i class="icon fa-solid fa-receipt" aria-hidden="true"></i>
          <span>${expenses.length ? "No entries match the selected category filter." : "No expense entries yet. Add your first expense above."}</span>
        </div>
      `;
            return;
          }

          table.innerHTML = `
      <div class="expense-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${visible.map((expense) => {
            const catClass = `category-${escapeHtml(expense.category)}`;
            return `
              <tr>
                <td>${escapeHtml(expense.date)}</td>
                <td><span class="category-tag ${catClass}">${escapeHtml(expense.category)}</span></td>
                <td class="description-cell">${escapeHtml(expense.description)}</td>
                <td class="amount-cell"><strong>${money(expense.amount)}</strong></td>
                <td>
                  <div class="table-actions">
                    <button type="button" class="icon-button edit-action-btn" data-edit-expense="${escapeHtml(expense.id)}" title="Edit expense" aria-label="Edit expense ${escapeHtml(expense.description)}">
                      <i class="icon fa-solid fa-pen" aria-hidden="true"></i>
                    </button>
                    <button type="button" class="icon-button delete-action-btn" data-remove-expense="${escapeHtml(expense.id)}" title="Remove expense" aria-label="Remove expense ${escapeHtml(expense.description)}">
                      <i class="icon fa-solid fa-trash" aria-hidden="true"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }).join("")}
          </tbody>
        </table>
      </div>
    `;
        }

        function resetExpenseForm() {
          const form = $("#expense-form");
          if (form) form.reset();

          const dateInput = $("#expense-date");
          if (dateInput) dateInput.value = localISODate();

          const title = $("#expense-form-title");
          const saveButtonText = $("#save-expense-text");
          const cancelButton = $("#cancel-edit");
          const error = $("#expense-error");

          if (title) title.textContent = "Add an expense";
          if (saveButtonText) saveButtonText.textContent = "Add expense";
          if (cancelButton) cancelButton.hidden = true;
          if (error) error.textContent = "";

          editingExpenseId = null;
        }

        // Monthly income input listeners (Dedicated to Expense Planner)
        $("#planner-income-input")?.addEventListener("input", () => {
          getPlannerIncome();
          renderExpenses();
        });

        $("#set-income-btn")?.addEventListener("click", () => {
          getPlannerIncome();
          renderExpenses();
          showLeftToast("Income Updated", `Monthly income set to ${money(plannerIncome)}.`);
        });

        $$(".income-preset-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const preset = safeNumber(btn.dataset.preset);
            if (Number.isFinite(preset) && preset > 0) {
              plannerIncome = preset;
              const input = $("#planner-income-input");
              if (input) input.value = String(preset);
              renderExpenses();
              showLeftToast("Income Updated", `Monthly income set to ${money(plannerIncome)}.`);
            }
          });
        });

        $("#expense-form")?.addEventListener("submit", (event) => {
          event.preventDefault();

          const date = $("#expense-date")?.value;
          const category = $("#expense-category")?.value;
          const description = $("#expense-description")?.value.trim();
          const amount = safeNumber($("#expense-amount")?.value);
          const error = $("#expense-error");

          if (!date || !category || !description) {
            if (error) error.textContent = "Please fill in all expense fields.";
            return;
          }

          if (!Number.isFinite(amount) || amount <= 0) {
            if (error) error.textContent = "Expense amount must be greater than 0.";
            return;
          }

          const wasEditing = Boolean(editingExpenseId);

          if (wasEditing) {
            const existing = expenses.find((expense) => expense.id === editingExpenseId);
            if (existing) {
              existing.date = date;
              existing.category = category;
              existing.description = description;
              existing.amount = amount;
            }
          } else {
            const id = window.crypto?.randomUUID?.() || `exp-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
            expenses.push({ id, date, category, description, amount });
          }

          if (error) error.textContent = "";
          resetExpenseForm();
          renderExpenses();

          const status = $("#expense-status");
          if (status) status.textContent = wasEditing ? "Expense updated successfully." : "New expense added.";
          showLeftToast(wasEditing ? "Expense Updated" : "Expense Added", `${description}: ${money(amount)}`);
        });

        $("#cancel-edit")?.addEventListener("click", resetExpenseForm);

        $("#reset-expenses")?.addEventListener("click", () => {
          expenses = [...defaultExpenses];
          plannerIncome = 50000;
          const incomeInput = $("#planner-income-input");
          if (incomeInput) incomeInput.value = "50000";
          resetExpenseForm();
          renderExpenses();
          const status = $("#expense-status");
          if (status) status.textContent = "Default demo expenses restored.";
          showLeftToast("Expenses Reset", "Sample demo expenses restored.");
        });

        $("#expense-filter")?.addEventListener("change", renderExpenses);
        $("#expense-sort")?.addEventListener("change", renderExpenses);

        $("#expense-table")?.addEventListener("click", (event) => {
          const target = event.target instanceof Element ? event.target : event.target?.parentElement;
          const editButton = target?.closest("[data-edit-expense]");
          const removeButton = target?.closest("[data-remove-expense]");

          if (editButton) {
            const expense = expenses.find((item) => item.id === editButton.dataset.editExpense);
            if (!expense) return;

            editingExpenseId = expense.id;
            const dateInp = $("#expense-date");
            const catInp = $("#expense-category");
            const descInp = $("#expense-description");
            const amtInp = $("#expense-amount");

            if (dateInp) dateInp.value = expense.date;
            if (catInp) catInp.value = expense.category;
            if (descInp) descInp.value = expense.description;
            if (amtInp) amtInp.value = String(expense.amount);

            const title = $("#expense-form-title");
            const saveButtonText = $("#save-expense-text");
            const cancelButton = $("#cancel-edit");
            if (title) title.textContent = "Edit expense";
            if (saveButtonText) saveButtonText.textContent = "Save changes";
            if (cancelButton) cancelButton.hidden = false;

            $("#expense-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
          }

          if (removeButton) {
            const id = removeButton.dataset.removeExpense;
            const index = expenses.findIndex((item) => item.id === id);
            if (index >= 0) {
              const removed = expenses.splice(index, 1)[0];
              renderExpenses();
              const status = $("#expense-status");
              if (status) status.textContent = "Expense removed.";
              showLeftToast("Expense Removed", `Removed ${removed.description} (${money(removed.amount)}).`);
            }
          }
        });

        const expenseDate = $("#expense-date");
        if (expenseDate && !expenseDate.value) expenseDate.value = localISODate();
        renderExpenses();

        // ------------------------------------------------------------
        // Student expense example + page view counter
        // ------------------------------------------------------------

        let studentIncome = 1000;
        let studentExpenses = [
          { date: "2026-09-03", category: "Food", description: "Lunch on campus", amount: 85 },
          { date: "2026-09-05", category: "Transport", description: "Bus / ride fare", amount: 60 },
          { date: "2026-09-07", category: "Education", description: "Course notes and printing", amount: 75 },
          { date: "2026-09-10", category: "Food", description: "Groceries", amount: 140 },
          { date: "2026-09-12", category: "Entertainment", description: "Movie with friends", amount: 45 },
          { date: "2026-09-15", category: "Shopping", description: "Stationery", amount: 55 },
          { date: "2026-09-18", category: "Transport", description: "Monthly transport", amount: 90 },
          { date: "2026-09-20", category: "Utilities", description: "Mobile / internet", amount: 80 },
          { date: "2026-09-22", category: "Food", description: "Dinner", amount: 70 }
        ];

        function renderStudentExpenseExample() {
          const income = studentIncome;
          const total = studentExpenses.reduce((sum, item) => sum + item.amount, 0);
          const balance = income - total;
          const incomeEl = $("#student-income");
          const totalEl = $("#student-expenses-total");
          const balanceEl = $("#student-balance");
          const countEl = $("#student-expense-count");
          const table = $("#student-expense-table");
          const breakdown = $("#student-expense-breakdown");

          if (incomeEl) incomeEl.textContent = money(income, true);
          if (totalEl) totalEl.textContent = money(total, true);
          if (balanceEl) balanceEl.textContent = money(balance, true);
          if (countEl) countEl.textContent = `${studentExpenses.length} expenses`;

          if (table) {
            table.innerHTML = `
        <div class="expense-table-wrap">
          <table class="expense-table">
            <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th></tr></thead>
            <tbody>
              ${studentExpenses.map((item) => `
                <tr>
                  <td>${escapeHtml(item.date)}</td>
                  <td><span class="category-pill">${escapeHtml(item.category)}</span></td>
                  <td>${escapeHtml(item.description)}</td>
                  <td><strong>${money(item.amount)}</strong></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>`;
          }

          if (breakdown) {
            const categories = studentExpenses.reduce((map, item) => {
              map[item.category] = (map[item.category] || 0) + item.amount;
              return map;
            }, {});
            breakdown.innerHTML = Object.entries(categories)
              .sort((a, b) => b[1] - a[1])
              .map(([category, amount]) => {
                const percent = total ? Math.round((amount / total) * 100) : 0;
                return `<div class="student-breakdown-row">
            <div class="student-breakdown-label"><span>${escapeHtml(category)}</span><strong>${money(amount)}</strong></div>
            <div class="student-breakdown-bar"><span style="width:${percent}%"></span></div>
            <small>${percent}% of sample expenses</small>
          </div>`;
              }).join("");
          }
        }

        function recordStudentPageView() {
          const key = "bb_student_example_views";
          const views = Math.max(0, parseInt(storage.get(key, "0"), 10) || 0) + 1;
          storage.set(key, views);
          const element = $("#student-page-views");
          if (element) element.textContent = String(views);
        }

        renderStudentExpenseExample();

        // ------------------------------------------------------------
        // Money smarts resources
        // ------------------------------------------------------------

        const resources = [
          {
            title: "Build a simple first budget",
            topic: "budgeting",
            description: "Start with take-home income and identify regular needs, wants, and savings.",
            popular: 5
          },
          {
            title: "Save before you spend",
            topic: "saving",
            description: "Set aside a manageable amount regularly and check your goal progress.",
            popular: 4
          },
          {
            title: "The pause-before-you-buy check",
            topic: "spending",
            description: "Ask whether a purchase is essential, useful, and planned before spending.",
            popular: 5
          },
          {
            title: "Watch small expenses",
            topic: "spending",
            description: "Record everyday purchases so you can see where your money goes.",
            popular: 3
          },
          {
            title: "Use the 50–30–20 rule as a guide",
            topic: "budgeting",
            description: "Treat the split as an educational starting point that you can adjust.",
            popular: 4
          },
          {
            title: "Turn a goal into monthly steps",
            topic: "saving",
            description: "Compare a target amount with current savings and a monthly contribution.",
            popular: 4
          }
        ];

        function renderResources() {
          const list = $("#resource-list");
          if (!list) return;

          const query = ($("#resource-search")?.value || "").trim().toLowerCase();
          const topic = $("#topic-filter")?.value || "all";
          const sort = $("#resource-sort")?.value || "popular";

          let filtered = resources.filter((resource) => {
            const topicMatch = topic === "all" || resource.topic === topic;
            const text = `${resource.title} ${resource.description} ${resource.topic}`.toLowerCase();
            return topicMatch && (!query || text.includes(query));
          });

          filtered.sort((a, b) =>
            sort === "title"
              ? a.title.localeCompare(b.title)
              : b.popular - a.popular
          );

          const count = $("#resource-count");
          if (count) count.textContent = `${filtered.length} resource${filtered.length === 1 ? "" : "s"} found`;

          if (!filtered.length) {
            list.innerHTML = `
        <div class="empty-table">
          <i class="icon fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <span>No matching content found.</span>
        </div>
      `;
            return;
          }

          list.innerHTML = filtered.map((resource) => {
            const icon = resource.topic === "saving" ? "fa-seedling" : resource.topic === "spending" ? "fa-bag-shopping" : "fa-chart-pie";
            const tone = resource.topic === "saving" ? "green" : resource.topic === "spending" ? "peach" : "purple";

            return `
        <article class="resource-row">
          <span class="icon-tile ${tone}">
            <i class="icon fa-solid ${icon}" aria-hidden="true"></i>
          </span>
          <div>
            <span class="overline">${escapeHtml(resource.topic)}</span>
            <h3>${escapeHtml(resource.title)}</h3>
            <p>${escapeHtml(resource.description)}</p>
          </div>
        </article>
      `;
          }).join("");
        }

        ["#resource-search", "#topic-filter", "#resource-sort"].forEach((selector) => {
          $(selector)?.addEventListener("input", renderResources);
          $(selector)?.addEventListener("change", renderResources);
        });
        renderResources();

        // ------------------------------------------------------------
        // Infographics filter
        // ------------------------------------------------------------

        function filterInfographics() {
          const select = $("#info-filter");
          const grid = $("#infographic-grid");
          if (!select || !grid) return;

          const topic = select.value || "all";
          const cards = $$(".infographic-card", grid);
          let visible = 0;

          cards.forEach((card) => {
            const show = topic === "all" || card.dataset.topic === topic;
            card.hidden = !show;
            if (show) visible += 1;
          });

          const empty = $("#info-empty");
          if (empty) empty.hidden = visible !== 0;
        }

        $("#info-filter")?.addEventListener("change", filterInfographics);
        filterInfographics();

        // ------------------------------------------------------------
        // Feedback and contact — Client-side validation + Left-side toast
        // ------------------------------------------------------------

        function initFormValidation() {
          // Contact Us Form Validation
          const contactForm = $("#contact-form");
          contactForm?.addEventListener("submit", (event) => {
            event.preventDefault();

            let isValid = true;
            const nameInput = $("#contact-name");
            const emailInput = $("#contact-email");
            const subjectInput = $("#contact-subject");
            const messageInput = $("#contact-message");

            const nameError = $("#contact-name-error");
            const emailError = $("#contact-email-error");
            const subjectError = $("#contact-subject-error");
            const messageError = $("#contact-message-error");
            const resultEl = $("#contact-result");

            // Reset previous error styles
            [nameInput, emailInput, subjectInput, messageInput].forEach((inp) => inp?.classList.remove("is-invalid"));
            [nameError, emailError, subjectError, messageError].forEach((err) => { if (err) err.textContent = ""; });
            if (resultEl) resultEl.textContent = "";

            const nameVal = nameInput?.value.trim() || "";
            const emailVal = emailInput?.value.trim() || "";
            const subjectVal = subjectInput?.value || "";
            const messageVal = messageInput?.value.trim() || "";
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!nameVal || nameVal.length < 2) {
              isValid = false;
              nameInput?.classList.add("is-invalid");
              if (nameError) nameError.textContent = "Please enter your full name (at least 2 characters).";
            }

            if (!emailVal || !emailPattern.test(emailVal)) {
              isValid = false;
              emailInput?.classList.add("is-invalid");
              if (emailError) emailError.textContent = "Please enter a valid email address (e.g. name@student.edu.pk).";
            }

            if (!subjectVal) {
              isValid = false;
              subjectInput?.classList.add("is-invalid");
              if (subjectError) subjectError.textContent = "Please select a topic for your inquiry.";
            }

            if (!messageVal || messageVal.length < 8) {
              isValid = false;
              messageInput?.classList.add("is-invalid");
              if (messageError) messageError.textContent = "Please enter your message (at least 8 characters).";
            }

            if (!isValid) {
              const firstInvalid = contactForm.querySelector(".is-invalid");
              firstInvalid?.focus();
              return;
            }

            // Valid submission
            contactForm.reset();
            showLeftToast("Contact Us", "Your message has been submitted successfully!");
            if (resultEl) {
              resultEl.textContent = "Your message has been submitted successfully! Our student support team will review it.";
              resultEl.dataset.state = "success";
            }
          });

          // Feedback Form Validation
          const feedbackForm = $("#feedback-form");
          feedbackForm?.addEventListener("submit", (event) => {
            event.preventDefault();

            let isValid = true;
            const nameInput = $("#feedback-name");
            const emailInput = $("#feedback-email");
            const ratingInput = $("#feedback-rating");
            const messageInput = $("#feedback-message");

            const nameError = $("#feedback-name-error");
            const emailError = $("#feedback-email-error");
            const ratingError = $("#feedback-rating-error");
            const messageError = $("#feedback-message-error");
            const resultEl = $("#feedback-result");

            // Reset previous error styles
            [nameInput, emailInput, ratingInput, messageInput].forEach((inp) => inp?.classList.remove("is-invalid"));
            [nameError, emailError, ratingError, messageError].forEach((err) => { if (err) err.textContent = ""; });
            if (resultEl) resultEl.textContent = "";

            const nameVal = nameInput?.value.trim() || "";
            const emailVal = emailInput?.value.trim() || "";
            const ratingVal = ratingInput?.value || "";
            const messageVal = messageInput?.value.trim() || "";
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!nameVal || nameVal.length < 2) {
              isValid = false;
              nameInput?.classList.add("is-invalid");
              if (nameError) nameError.textContent = "Please enter your name.";
            }

            if (!emailVal || !emailPattern.test(emailVal)) {
              isValid = false;
              emailInput?.classList.add("is-invalid");
              if (emailError) emailError.textContent = "Please enter a valid email address.";
            }

            if (!ratingVal) {
              isValid = false;
              ratingInput?.classList.add("is-invalid");
              if (ratingError) ratingError.textContent = "Please select a rating.";
            }

            if (!messageVal || messageVal.length < 8) {
              isValid = false;
              messageInput?.classList.add("is-invalid");
              if (messageError) messageError.textContent = "Please write a comment or suggestion (at least 8 characters).";
            }

            if (!isValid) {
              const firstInvalid = feedbackForm.querySelector(".is-invalid");
              firstInvalid?.focus();
              return;
            }

            // Valid submission
            feedbackForm.reset();
            showLeftToast("Feedback", "Thank you! Your feedback has been submitted successfully.");
            if (resultEl) {
              resultEl.textContent = "Thank you! Your feedback has been submitted successfully.";
              resultEl.dataset.state = "success";
            }
          });
        }

        initFormValidation();

        // ------------------------------------------------------------
        // Global search
        // ------------------------------------------------------------

        $("#global-search-form")?.addEventListener("submit", (event) => {
          event.preventDefault();

          const query = ($("#global-search")?.value || "").trim().toLowerCase();
          if (!query) {
            showToast("Type something to search.");
            return;
          }

          const matches = PAGE_IDS.filter((pageId) => {
            const page = document.getElementById(pageId);
            return page?.textContent.toLowerCase().includes(query);
          });

          if (!matches.length) {
            showToast("No matching content found.");
            return;
          }

          const firstMatch = matches[0];
          showPage(firstMatch);

          if (firstMatch === "learn") {
            const resourceSearch = $("#resource-search");
            if (resourceSearch) {
              resourceSearch.value = query;
              renderResources();
            }
          }

          showToast(`Found in ${PAGE_TITLES[firstMatch]}.`);
        });

        // ------------------------------------------------------------
        // BudgetBuddy rule-based assistant
        // ------------------------------------------------------------

        const chatPanel = $("#chat-panel");
        let chatStarted = false;

        function openChat(prefill = "") {
          if (!chatPanel) return;

          chatPanel.hidden = false;
          chatPanel.setAttribute("aria-hidden", "false");

          const input = $("#chat-input");
          if (input) {
            input.value = prefill;
            input.focus();
          }
        }

        function closeChat() {
          if (!chatPanel) return;
          chatPanel.hidden = true;
          chatPanel.setAttribute("aria-hidden", "true");
        }

        $$('[data-open-chat]').forEach((button) => {
          button.addEventListener("click", () => openChat());
        });

        $("#close-chat")?.addEventListener("click", closeChat);

        // Automatically hide suggested questions inside chatbox when conversation starts
        function hideSuggestedQuestions() {
          const suggestionsBox = $("#chat-suggestions-box");
          if (suggestionsBox && !chatStarted) {
            suggestionsBox.style.transition = "opacity 0.25s ease, transform 0.25s ease";
            suggestionsBox.style.opacity = "0";
            suggestionsBox.style.transform = "translateY(-6px)";
            setTimeout(() => {
              suggestionsBox.style.display = "none";
            }, 250);
            chatStarted = true;
          }
        }

        function handleSendChatMessage(question) {
          if (!question || !question.trim()) return;
          const cleanQ = question.trim();

          // Hide suggested questions automatically upon sending first question
          hideSuggestedQuestions();

          addChatMessage(cleanQ, "user");
          const answer = getChatAnswer(cleanQ);
          setTimeout(() => {
            addChatMessage(answer, "bot");
          }, 120);
        }

        // Handle clicking preset questions inside chatbox
        document.addEventListener("click", (event) => {
          const target = event.target instanceof Element ? event.target : event.target?.parentElement;
          const presetButton = target?.closest("[data-chat-question]");
          if (presetButton) {
            const q = presetButton.dataset.chatQuestion || presetButton.textContent.trim();
            openChat();
            handleSendChatMessage(q);
          }
        });

        // Comprehensive Chat Rules covering all 10 requested preset questions + natural language queries
        const chatRules = [
          // 1. Monthly budget
          {
            id: "create-monthly-budget",
            match: (q) => /create.{0,20}monthly budget|how.{0,20}create.{0,15}budget|make.{0,20}monthly budget|how can i create a monthly budget/.test(q),
            answers: [
              "To create a monthly budget: 1) Write down your total monthly income/allowance. 2) List essential fixed costs (rent, transport, bills). 3) Estimate flexible needs (food, printing). 4) Set aside a planned savings goal (e.g. 20%). 5) Check your remaining balance using our Expense Planner!",
              "Creating a monthly budget starts with knowing your numbers: total income minus fixed expenses minus savings = your flexible spending pool. Review your plan once a week so you stay on track!"
            ]
          },
          // 2. Student saving
          {
            id: "save-money-student",
            match: (q) => /save money as a student|save as a student|student.{0,15}saving|save money/.test(q),
            answers: [
              "As a student, you can save money by: 1) Preparing snacks and lunch at home rather than daily canteen orders. 2) Buying second-hand course books or sharing digital copies. 3) Using student discount passes for public transport. 4) Saving a fixed small amount (even Rs. 500) as soon as allowance arrives!",
              "The best student saving tip is 'Pay yourself first': transfer 10%–20% of your allowance into your savings pot immediately. Small, repeated habits build substantial momentum over a semester!"
            ]
          },
          // 3. 50/30/20 rule
          {
            id: "rule-50-30-20",
            match: (q) => /50[/ -]?30[/ -]?20|what is the 50 30 20/.test(q),
            answers: [
              "The 50/30/20 rule is a simple educational guideline: 50% of your income goes to essential Needs (housing, basic food, transport), 30% to Wants (dining out, entertainment, hobbies), and 20% to Savings or emergency funds. Try our 50-30-20 Calculator tab to see your exact split!",
              "Under 50/30/20: for Rs. 50,000 income, allocate Rs. 25,000 for Needs, Rs. 15,000 for Wants, and Rs. 10,000 for Savings. You can adapt the percentages to fit your student lifestyle."
            ]
          },
          // 4. Reduce unnecessary expenses
          {
            id: "reduce-expenses",
            match: (q) => /reduce unnecessary expenses|cut expenses|lower expenses|reduce spending|stop overspending/.test(q),
            answers: [
              "To reduce unnecessary expenses: 1) Track small daily cash purchases for 7 days—you will spot surprise leaks like impulse drinks and delivery fees. 2) Apply the 48-hour rule on non-essential items before buying. 3) Cancel subscriptions you haven't used this month. 4) Set a weekly cash limit for outings!",
              "Cut back on recurring flexible costs: carry a reusable water bottle, share group rides, and pack lunch twice a week. Cutting just Rs. 200 a day saves Rs. 6,000 every month!"
            ]
          },
          // 5. How much should I save every month
          {
            id: "how-much-save",
            match: (q) => /how much should i save|how much save every month|saving amount/.test(q),
            answers: [
              "A healthy benchmark is 20% of your income, but as a student, even 10% or a fixed Rs. 1,000 to Rs. 2,000 each month is a great start. What matters most is consistency rather than starting with a giant number!",
              "Aim for 10% to 20% of whatever allowance or income you receive. If your allowance is Rs. 15,000, saving Rs. 2,000 to Rs. 3,000 creates a solid emergency safety net in just a few months."
            ]
          },
          // 6. How can I track my spending
          {
            id: "track-spending",
            match: (q) => /track my spending|track spending|how can i track|expense tracking/.test(q),
            answers: [
              "You can track your spending effortlessly using our Expense Planner! Enter each expense by category (Food, Transport, Bills, Education), and it calculates your total expenses and remaining balance in real time. Make it a habit to log costs once each evening.",
              "To track spending: categorize every expense, record small cash outlays, and compare your actual totals with your monthly income. You can use our interactive Expense Planner tab right here on BudgetBasics!"
            ]
          },
          // 7. Emergency fund
          {
            id: "emergency-fund",
            match: (q) => /emergency fund|what is an emergency fund|rainy day fund/.test(q),
            answers: [
              "An emergency fund is money set aside strictly for unplanned, urgent expenses—like sudden laptop repairs, medical prescriptions, or emergency travel. For a student, having Rs. 5,000 to Rs. 10,000 saved prevents borrowing or financial panic.",
              "An emergency fund acts as your financial safety net. It should be kept separate from everyday spending money and only touched for real emergencies, not spontaneous shopping or parties!"
            ]
          },
          // 8. Control monthly expenses
          {
            id: "control-monthly-expenses",
            match: (q) => /control my monthly expenses|control expenses|manage expenses|limit spending/.test(q),
            answers: [
              "To control monthly expenses: 1) Set your income in the Expense Planner. 2) Set category spending limits before the month starts. 3) Check your remaining balance mid-month so you can slow down optional spending if needed. 4) Separate needs from wants.",
              "Control your expenses by breaking your monthly budget into weekly allowances. If you have Rs. 8,000 for flexible spending, that is Rs. 2,000 per week. Once the week's money is spent, pause non-essentials until next Monday!"
            ]
          },
          // 9. Manage income better
          {
            id: "manage-income-better",
            match: (q) => /manage my income better|manage income|handle money better|manage my money/.test(q),
            answers: [
              "To manage your income better: Give every rupee a designated job before spending it. Split income into: Fixed Necessities (50%), Future Goals (20%), and Personal Spending (30%). Always know your exact remaining balance before making discretionary purchases.",
              "Better income management comes down to 3 steps: Plan before receiving, track while spending, and review at the end of the month. Use our Savings Goals and Expense Planner tabs to structure your plan!"
            ]
          },
          // 10. Start budgeting as a beginner
          {
            id: "start-budgeting-beginner",
            match: (q) => /start budgeting as a beginner|start budgeting|budgeting for beginners|beginner budget/.test(q),
            answers: [
              "Welcome! To start budgeting as a beginner: 1) Read our 'Budgeting Basics' page. 2) Calculate your take-home allowance or salary. 3) Open the Expense Planner and enter your monthly income. 4) Log your regular expenses. 5) Keep it simple—progress, not perfection!",
              "Beginner budgeting rule: Don't overcomplicate. Start by noting income, writing down your 3 biggest expenses, and saving whatever you can. BudgetBasics is designed specifically for beginners like you!"
            ]
          },
          // Needs vs wants
          {
            id: "needs-wants",
            match: (q) => /need.{0,20}want|want.{0,20}need/.test(q),
            answers: [
              "Needs are essential costs for survival, health, and basic education (groceries, transport to campus, prescribed books). Wants are optional choices (dining out, branded upgrades, gaming). Try our 'Needs vs. Wants' sorting game tab to practice!",
              "Ask yourself: 'Would skipping this cause a serious problem for my studies or living?' If yes, it's a Need. If it's just nice to have, it's a Want."
            ]
          },
          // General budget definition
          {
            id: "budget-definition",
            match: (q) => /(?:what|whats|explain).{0,20}budget\b/.test(q),
            answers: [
              "A budget is a simple spending plan for your income, expenses, and savings over a set period. It gives you total control over your money rather than wondering where it went!",
              "Think of a budget as your personal roadmap: it tells your money where to go so you can achieve your goals with zero stress."
            ]
          }
        ];

        const chatUsage = {};

        function normalizeChatText(value) {
          return String(value || "")
            .toLowerCase()
            .replace(/[^a-z0-9%/\s₨-]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        }

        function chooseChatVariant(rule) {
          const count = chatUsage[rule.id] || 0;
          const next = count % rule.answers.length;
          chatUsage[rule.id] = count + 1;
          return rule.answers[next];
        }

        function parsedIncome(question) {
          const text = String(question);
          const patterns = [
            /(?:income|salary|earn|make|have)\s*(?:is|of|:)?\s*(?:pkr|rs|rupees|₨)?\s*([0-9][0-9,]*)/i,
            /(?:from|on)\s+(?:pkr|rs|rupees|₨)?\s*([0-9][0-9,]*)/i,
            /(?:pkr|rs|rupees|₨)\s*([0-9][0-9,]*)/i
          ];
          for (const pattern of patterns) {
            const match = text.match(pattern);
            if (!match) continue;
            const value = Number(match[1].replace(/,/g, ""));
            if (Number.isFinite(value) && value > 0) return value;
          }
          return null;
        }

        function getChatAnswer(question) {
          const lower = normalizeChatText(question);
          if (!lower) return "Ask me a BudgetBasics question and I’ll help you work through it.";

          const incomeQuestion = /(?:how much|what).*?(?:50|30|20|save|needs|wants)|how much should i save|split.*income|income.{0,30}50/.test(lower);
          const income = parsedIncome(lower);
          if (income && incomeQuestion) {
            const split = calculateSplit(income);
            return `For ${money(income, true)}, the 50-30-20 guideline suggests: Needs: ${money(split.needs, true)} (50%), Wants: ${money(split.wants, true)} (30%), and Savings: ${money(split.savings, true)} (20%).`;
          }

          const matched = chatRules.find((rule) => rule.match(lower));
          if (matched) return chooseChatVariant(matched);

          const fallbackAnswers = [
            "I can help with creating budgets, student savings, needs vs. wants, emergency funds, tracking expenses, and the 50-30-20 rule. Try asking one of those questions!",
            "Try asking 'How can I create a monthly budget?', 'How can I save money as a student?', or 'What is an emergency fund?' and I'll give you practical advice.",
            "BudgetBuddy is focused on student personal finance. Ask about monthly expenses, saving targets, or budgeting techniques!"
          ];
          const key = lower.length % fallbackAnswers.length;
          return fallbackAnswers[key];
        }

        function addChatMessage(message, role) {
          const messages = $("#chat-messages");
          if (!messages) return;

          const paragraph = document.createElement("p");
          paragraph.className = role === "user" ? "user-message" : "bot-message";
          paragraph.textContent = message;
          messages.appendChild(paragraph);
          messages.scrollTop = messages.scrollHeight;
        }

        $("#chat-form")?.addEventListener("submit", (event) => {
          event.preventDefault();

          const input = $("#chat-input");
          const question = input?.value.trim();
          if (!question) return;

          handleSendChatMessage(question);
          input.value = "";
          input.focus();
        });

        // ------------------------------------------------------------
        // Data file + final initialization
        // ------------------------------------------------------------

        fetch("data.json")
          .then((response) => {
            if (!response.ok) throw new Error(`Data file error: ${response.status}`);
            return response.json();
          })
          .then((data) => {
            const sample = data?.studentExample;
            if (sample) {
              studentIncome = Number(sample.monthlyIncome) || studentIncome;
              studentExpenses = Array.isArray(sample.expenses) ? sample.expenses : studentExpenses;
              renderStudentExpenseExample();
            }
            renderVisualCharts();
          })
          .catch((error) => {
            console.warn("BudgetBasics data.json could not be loaded.", error);
            renderVisualCharts();
          });

        if (typeof renderExpenses === "function") {
          renderExpenses();
        }
        renderVisualCharts();
        navigateFromHash();
      })();
    } catch (galti) {
      console.log("kuch error a gya hai bhai code ma: ", galti);
    }
  };

  useEffect(() => {
    // page load hony par ye chalay ga
    mainKaamKarneWalaFunction();
  }, []);

  return (
    <>


      <a className="skip-link" href="#main-content">Skip to content</a>

      {/*  Sidebar  */}
      <aside className="sidebar" id="sidebar">

        <a className="brand" href="#overview" aria-label="BudgetBasics home" style={{ display: 'flex', alignItems: 'center' }}>
          <img className="brand-logo-image" src="/assets/logo.png" alt="BudgetBasics" style={{ width: '200px', height: 'auto', maxWidth: '100%' }} />
        </a>

        <div className="workspace">
          <span className="workspace-icon">🎓</span>

          <div>
            <strong>Student workspace</strong>
            <small>A little wiser, every day</small>
          </div>

          <i className="icon fa-solid fa-arrows-up-down" aria-hidden="true"></i>
        </div>

        <nav aria-label="Main navigation">

          <p className="nav-label">YOUR WORKSPACE</p>

          <a href="#overview" data-page="overview" className="active">
            <i className="icon fa-solid fa-gauge-high" aria-hidden="true"></i>
            <span>Overview</span>
          </a>

          <a href="#basics" data-page="basics">
            <i className="icon fa-solid fa-book-open" aria-hidden="true"></i>
            <span>Budgeting basics</span>
          </a>

          <a href="#needs" data-page="needs">
            <i className="icon fa-solid fa-scale-balanced" aria-hidden="true"></i>
            <span>Needs vs. wants</span>
          </a>

          <p className="nav-label">MAKE A PLAN</p>

          <a href="#calculator" data-page="calculator">
            <i className="icon fa-solid fa-chart-pie" aria-hidden="true"></i>
            <span>50-30-20 calculator</span>
          </a>

          <a href="#savings" data-page="savings">
            <i className="icon fa-solid fa-flag" aria-hidden="true"></i>
            <span>Savings goals</span>
            <span className="nav-count">1</span>
          </a>

          <a href="#expenses" data-page="expenses">
            <i className="icon fa-solid fa-receipt" aria-hidden="true"></i>
            <span>Expense planner</span>
          </a>

          <a href="#student-expenses" data-page="student-expenses">
            <i className="icon fa-solid fa-user-graduate" aria-hidden="true"></i>
            <span>Student example</span>
          </a>

          <p className="nav-label">KEEP LEARNING</p>

          <a href="#learn" data-page="learn">
            <i className="icon fa-solid fa-lightbulb" aria-hidden="true"></i>
            <span>Money smarts</span>
            <span className="tiny-badge">NEW</span>
          </a>

          <a href="#mistakes" data-page="mistakes">
            <i className="icon fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
            <span>Money mistakes</span>
          </a>

          <a href="#infographics" data-page="infographics">
            <i className="icon fa-solid fa-chart-column" aria-hidden="true"></i>
            <span>Infographics</span>
          </a>

          <a href="#games" data-page="games">
            <i className="icon fa-solid fa-gamepad" aria-hidden="true"></i>
            <span>Budgeting games</span>
            <span className="tiny-badge gold">PLAY</span>
          </a>

          <p className="nav-label">PROJECT</p>

          <a href="#feedback" data-page="feedback">
            <i className="icon fa-solid fa-comment-dots" aria-hidden="true"></i>
            <span>Feedback</span>
          </a>

          <a href="#about" data-page="about">
            <i className="icon fa-solid fa-circle-info" aria-hidden="true"></i>
            <span>About us</span>
          </a>

          <a href="#contact" data-page="contact">
            <i className="icon fa-solid fa-envelope" aria-hidden="true"></i>
            <span>Contact us</span>
          </a>

          <button className="nav-chat" type="button" data-open-chat>
            <i className="icon fa-solid fa-message" aria-hidden="true"></i>
            <span>Ask BudgetBuddy</span>
            <i className="icon fa-solid fa-sparkles end-icon" aria-hidden="true"></i>
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="little-tip">
            <span>🌱</span>

            <strong>Progress, not perfection.</strong>

            <p>
              You don't need a lot to start.
              <br />
              Just a simple plan.
            </p>

            <a href="#basics">
              Learn the basics
              <span>↗</span>
            </a>
          </div>

          <div className="privacy">
            <i className="icon fa-solid fa-shield-halved" aria-hidden="true"></i>

            <span>
              Your money stays private.
              <small>No bank connections.</small>
            </span>
          </div>

        </div>

      </aside>


      {/*  Main application  */}
      <div className="app-shell">

        {/*  Top bar  */}
        <header className="topbar">

          <div className="breadcrumb">

            <button
              id="menu-button"
              className="icon-button mobile-only"
              type="button"
              aria-label="Toggle menu"
              aria-expanded="false"
            >
              <i className="icon fa-solid fa-bars" aria-hidden="true"></i>
            </button>

            <span>My workspace</span>
            <span className="slash">/</span>
            <strong id="breadcrumb-title">Overview</strong>

          </div>

          <div className="top-actions">

            <form
              id="global-search-form"
              className="global-search"
              role="search"
            >
              <i className="icon fa-solid fa-magnifying-glass" aria-hidden="true"></i>

              <input
                id="global-search"
                type="search"
                aria-label="Search learning resources"
                placeholder="Search anything..."
              />

              <kbd>↵</kbd>
            </form>

            <button
              id="theme-button"
              className="icon-button"
              type="button"
              aria-label="Switch to dark mode"
            >
              <i className="icon fa-solid fa-moon" aria-hidden="true"></i>
            </button>

            <span className="avatar" title="Student workspace">S</span>

          </div>

        </header>


        {/*  Main content  */}
        <main id="main-content" tabIndex="-1">

          {/*  Overview  */}
          <section
            id="overview"
            className="page active-page"
            aria-labelledby="overview-title"
          >

            <div className="page-heading">

              <div>
                <div className="eyebrow">WELCOME TO BUDGETBASICS · LEARN. PLAN. GROW.</div>

                <h1 id="overview-title">
                  Let's make money make sense
                  <span className="wave">👋</span>
                </h1>

                <p>
                  Learn the basics, plan your money and build better habits.
                </p>
              </div>

              <div className="date-chip">
                <i className="icon fa-solid fa-calendar-days" aria-hidden="true"></i>
                <span id="today-date"></span>
              </div>

            </div>


            {/*  Welcome banner  */}
            <section className="welcome-banner">

              <div className="hero-copy">

                <span className="hero-kicker">
                  <span></span>
                  STUDENT MONEY GUIDE
                </span>

                <h2>
                  Plan your money
                  <br />
                  with confidence.
                </h2>

                <p>
                  A budget helps you understand where your money goes.
                  <br />
                  Start with a plan that works for you.
                </p>

                <a className="button primary" href="#basics">
                  Start with the basics
                  <i className="icon fa-solid fa-arrow-right" aria-hidden="true"></i>
                </a>

                <span className="hero-note">
                  <i className="icon fa-solid fa-clock" aria-hidden="true"></i>
                  Takes about 5 minutes
                </span>

              </div>


              <div className="hero-art" aria-hidden="true">

                <div className="art-orbit orbit-one"></div>
                <div className="art-orbit orbit-two"></div>

                <span className="spark spark-one">✦</span>
                <span className="spark spark-two">✧</span>

                <div className="floating-tag tag-save">
                  🌱
                  <span>
                    Save a little today.
                    <br />
                    <strong>Build for tomorrow.</strong>
                  </span>
                </div>

                <div className="budget-illustration">

                  <div className="illustration-top">
                    <span className="mini-logo">▧</span>
                    <span>MY MONEY PLAN</span>
                    <span>•••</span>
                  </div>

                  <div className="illustration-amount">
                    Monthly plan
                    <strong>
                      PKR 1,000<span>.00</span>
                    </strong>
                  </div>

                  <div className="mini-bars">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                  <div className="illustration-bottom">
                    <span>Plan your spending</span>
                    <span>↗ Stay on track</span>
                  </div>

                </div>

                <div className="coin coin-one">₨</div>
                <div className="coin coin-two">₨</div>

                <div className="floating-tag tag-check">
                  <span className="check-bubble">✓</span>
                  Good plan!
                </div>

              </div>

            </section>


            <div className="tip-ticker" role="status" aria-label="Budgeting tip">
              <span className="tip-ticker-icon"><i className="icon fa-solid fa-lightbulb" aria-hidden="true"></i></span>
              <span><strong>Money tip:</strong> Small, consistent saving habits can build up over time.</span>
              <a href="#savings">Plan a goal <i className="icon fa-solid fa-arrow-right" aria-hidden="true"></i></a>
            </div>


            {/*  Toolkit  */}
            <div className="section-heading">

              <h2>
                Money toolkit
                <span>Simple tools for everyday decisions.</span>
              </h2>

              <span className="subtle-label">
                <i className="icon fa-solid fa-lock" aria-hidden="true"></i>
                Private by design
              </span>

            </div>


            <div className="toolkit-grid">

              {/*  Quick budget  */}
              <article className="card budget-card">

                <div className="card-heading">

                  <div className="card-title">

                    <span className="icon-tile purple">
                      <i className="icon fa-solid fa-chart-pie" aria-hidden="true"></i>
                    </span>

                    <div>
                      <h3>50-30-20 budget</h3>
                      <p>See how your income could be divided.</p>
                    </div>

                  </div>

                  <a
                    href="#calculator"
                    className="icon-button"
                    aria-label="Open full budget calculator"
                  >
                    <i className="icon fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
                  </a>

                </div>


                <form id="quick-budget-form">

                  <label htmlFor="quick-income">
                    Monthly income
                    <span>PKR</span>
                  </label>

                  <div className="income-controls">

                    <div className="currency-input">
                      <span>PKR</span>

                      <input
                        id="quick-income"
                        type="number"
                        min="0"
                        max="1000000000"
                        step="0.01"
                        defaultValue="1000"
                        required
                      />
                    </div>

                    <button className="button primary" type="submit">
                      Calculate
                      <i className="icon fa-solid fa-arrow-right" aria-hidden="true"></i>
                    </button>

                  </div>

                  <p
                    id="quick-error"
                    className="field-error"
                    role="alert"
                  ></p>

                </form>


                <div className="budget-visual">

                  <div
                    className="donut"
                    role="img"
                    aria-label="50 percent needs, 30 percent wants and 20 percent savings"
                  >
                    <div>
                      <span>Your income</span>
                      <strong id="donut-income">PKR 1,000</strong>
                      <small>monthly plan</small>
                    </div>
                  </div>


                  <div className="budget-legend">

                    <div>
                      <span className="legend-dot purple-dot"></span>

                      <div>
                        <strong>
                          Needs
                          <small>50%</small>
                        </strong>
                        <span>Essential costs</span>
                      </div>

                      <b id="quick-needs">PKR 500</b>
                    </div>


                    <div>
                      <span className="legend-dot peach-dot"></span>

                      <div>
                        <strong>
                          Wants
                          <small>30%</small>
                        </strong>
                        <span>Optional spending</span>
                      </div>

                      <b id="quick-wants">PKR 300</b>
                    </div>


                    <div>
                      <span className="legend-dot green-dot"></span>

                      <div>
                        <strong>
                          Savings
                          <small>20%</small>
                        </strong>
                        <span>Future goals</span>
                      </div>

                      <b id="quick-savings">PKR 200</b>
                    </div>

                  </div>

                </div>


                <div className="card-footnote">
                  <i className="icon fa-solid fa-circle" aria-hidden="true"></i>
                  Use this as a starting point and adjust it to your situation.
                </div>

              </article>


              {/*  Savings goal  */}
              <article className="card goal-card">

                <div className="card-heading">

                  <div className="card-title">

                    <span className="icon-tile green">
                      <i className="icon fa-solid fa-flag" aria-hidden="true"></i>
                    </span>

                    <div>
                      <h3>Savings goal</h3>
                      <p>Keep track of something you're saving for.</p>
                    </div>

                  </div>

                  <span className="badge">GOAL</span>

                </div>


                <div className="goal-summary">

                  <span className="laptop-icon">
                    <i className="icon fa-solid fa-laptop" aria-hidden="true"></i>
                  </span>

                  <div>
                    <h4 id="dashboard-goal-name">New laptop fund</h4>
                    <span>Your current savings goal.</span>
                  </div>

                  <a
                    href="#savings"
                    className="icon-button"
                    aria-label="Edit savings goal"
                  >
                    <i className="icon fa-solid fa-pen" aria-hidden="true"></i>
                  </a>

                </div>


                <div className="goal-amount">

                  <strong id="dashboard-saved">PKR 350</strong>

                  <span>
                    of
                    <b id="dashboard-target">PKR 1,000</b>
                  </span>

                  <span id="dashboard-percent" className="percent-pill">
                    35%
                  </span>

                </div>


                <progress
                  id="dashboard-progress"
                  max="100"
                  defaultValue="35"
                  aria-label="Savings goal progress"
                >
                  35%
                </progress>


                <div className="goal-estimate">

                  <span>
                    <i className="icon fa-solid fa-calendar-check" aria-hidden="true"></i>
                    <span id="dashboard-months">7 months to go</span>
                  </span>

                  <span id="dashboard-monthly">
                    at PKR 100 / month
                  </span>

                </div>


                <div className="encouragement">
                  <span>✨</span>

                  <p>
                    Keep going.
                    <br />
                    <strong>Every contribution helps.</strong>
                  </p>
                </div>


                <a
                  href="#savings"
                  className="button secondary full-width"
                >
                  Plan a savings goal
                  <i className="icon fa-solid fa-arrow-right" aria-hidden="true"></i>
                </a>

              </article>

            </div>


            {/*  Learning cards  */}
            <div className="section-heading learning-heading">

              <h2>Learn as you go</h2>

              <a href="#learn">
                View money tips
                <i className="icon fa-solid fa-arrow-right" aria-hidden="true"></i>
              </a>

            </div>


            <div className="learning-grid">

              <a href="#needs" className="learning-card learn-peach">

                <span className="learning-icon">
                  <i className="icon fa-solid fa-scale-balanced" aria-hidden="true"></i>
                </span>

                <div>
                  <span className="overline">SMART SPENDING</span>

                  <h3>Need or want?</h3>

                  <p>
                    Take a moment before making a purchase.
                  </p>

                  <span className="lesson-link">
                    Try the sorting game
                    <i className="icon fa-solid fa-arrow-right" aria-hidden="true"></i>
                  </span>
                </div>

              </a>


              <a href="#learn" className="learning-card learn-lilac">

                <span className="learning-icon">
                  <i className="icon fa-solid fa-bolt" aria-hidden="true"></i>
                </span>

                <div>
                  <span className="overline">MONEY HABITS</span>

                  <h3>Avoid common mistakes</h3>

                  <p>
                    Learn simple ways to avoid unnecessary costs.
                  </p>

                  <span className="lesson-link">
                    Read the tips
                    <i className="icon fa-solid fa-arrow-right" aria-hidden="true"></i>
                  </span>
                </div>

              </a>


              <a href="#expenses" className="learning-card learn-green">

                <span className="learning-icon">
                  <i className="icon fa-solid fa-pen-to-square" aria-hidden="true"></i>
                </span>

                <div>
                  <span className="overline">TRACK SPENDING</span>

                  <h3>See where your money goes</h3>

                  <p>
                    Record everyday expenses and check your total.
                  </p>

                  <span className="lesson-link">
                    Open expense planner
                    <i className="icon fa-solid fa-arrow-right" aria-hidden="true"></i>
                  </span>
                </div>

              </a>

            </div>


            {/*  Recent expenses  */}
            <div className="section-heading">

              <h2>
                Recent expenses
                <span>Your latest entries from this session.</span>
              </h2>

              <a href="#expenses">
                View planner
                <i className="icon fa-solid fa-arrow-right" aria-hidden="true"></i>
              </a>

            </div>


            <article className="card recent-card">

              <div id="recent-expenses"></div>

              <p className="session-note">
                <i className="icon fa-solid fa-shield-halved" aria-hidden="true"></i>
                Demo data is kept only for the current browser session.
              </p>

            </article>


            {/*  Visual money snapshot  */}
            <div className="section-heading visual-heading">
              <h2>Interactive money snapshot <span>Live charts update as you use the toolkit.</span></h2>
            </div>

            <div className="snapshot-summary-grid">
              <div className="snapshot-kpi" style={{ backgroundColor: 'var(--purple)', color: '#ffffff' }}>
                <span><i className="icon fa-solid fa-wallet" aria-hidden="true"></i> Income</span>
                <strong id="snapshot-income">Rs. 50,000</strong>
              </div>
              <div className="snapshot-kpi" style={{ backgroundColor: 'var(--purple)', color: '#ffffff' }}>
                <span><i className="icon fa-solid fa-receipt" aria-hidden="true"></i> Expenses</span>
                <strong id="snapshot-expenses">Rs. 30,000</strong>
              </div>
              <div className="snapshot-kpi" style={{ backgroundColor: 'var(--purple)', color: '#ffffff' }}>
                <span><i className="icon fa-solid fa-piggy-bank" aria-hidden="true"></i> Remaining</span>
                <strong id="snapshot-balance">Rs. 20,000</strong>
              </div>
              <div className="snapshot-kpi" style={{ backgroundColor: 'var(--purple)', color: '#ffffff' }}>
                <span><i className="icon fa-solid fa-bullseye" aria-hidden="true"></i> Goal saved</span>
                <strong id="snapshot-goal-saved">Rs. 350</strong>
              </div>
            </div>

            <div className="visual-dashboard-grid snapshot-grid">
              <article className="card visual-card chart-card">
                <div className="visual-card-top">
                  <div>
                    <span className="eyebrow">BUDGET MIX</span>
                    <h3>50-30-20 allocation</h3>
                    <p>Updates from your quick income and calculator values.</p>
                  </div>
                  <span className="visual-icon purple"><i className="icon fa-solid fa-chart-pie"></i></span>
                </div>
                <canvas id="budget-mix-chart" className="data-canvas" width="620" height="310" aria-label="Budget allocation chart"></canvas>
              </article>

              <article className="card visual-card chart-card">
                <div className="visual-card-top">
                  <div>
                    <span className="eyebrow">EXPENSE BREAKDOWN</span>
                    <h3>Where your money goes</h3>
                    <p>Uses the live Expense Planner category totals.</p>
                  </div>
                  <span className="visual-icon gold"><i className="icon fa-solid fa-chart-pie"></i></span>
                </div>
                <canvas id="expense-breakdown-chart" className="data-canvas" width="620" height="310" aria-label="Expense category breakdown chart"></canvas>
              </article>

              <article className="card visual-card chart-card">
                <div className="visual-card-top">
                  <div>
                    <span className="eyebrow">INCOME VS EXPENSES</span>
                    <h3>Monthly cash picture</h3>
                    <p>See spending and remaining balance side by side.</p>
                  </div>
                  <span className="visual-icon green"><i className="icon fa-solid fa-scale-balanced"></i></span>
                </div>
                <canvas id="income-expense-chart" className="data-canvas" width="620" height="310" aria-label="Income and expenses comparison chart"></canvas>
              </article>

              <article className="card visual-card chart-card">
                <div className="visual-card-top">
                  <div>
                    <span className="eyebrow">SAVINGS</span>
                    <h3>Remaining savings buffer</h3>
                    <p>Shows how much of the current income remains after expenses.</p>
                  </div>
                  <span className="visual-icon purple"><i className="icon fa-solid fa-piggy-bank"></i></span>
                </div>
                <canvas id="savings-chart" className="data-canvas" width="620" height="310" aria-label="Savings buffer chart"></canvas>
              </article>
            </div>

            <article className="visitor-highlight card">
              <div className="visitor-icon"><i className="icon fa-solid fa-users"></i></div>
              <div>
                <span className="eyebrow">VISITOR COUNTER</span>
                <h3><span id="dashboard-visitor-count">0</span> visits on this device</h3>
                <p>Each page load increases this JavaScript counter and stores the value locally in your browser.</p>
              </div>
              <span className="visitor-pulse" aria-hidden="true"></span>
            </article>

          </section>


          {/*  Budgeting basics  */}
          <section id="basics" className="page" hidden>

            <div className="page-heading">

              <div>
                <div className="eyebrow">BUDGETING BASICS</div>

                <h1>Understand the basics of budgeting.</h1>

                <p>
                  Learn what income, expenses and savings mean
                  before making your own plan.
                </p>
              </div>

              <span className="page-symbol">📚</span>

            </div>


            <div className="concept-grid">

              <article className="card">
                <span className="icon-tile green">
                  <i className="icon fa-solid fa-wallet" aria-hidden="true"></i>
                </span>

                <h2>Income</h2>

                <p>
                  Money you receive from a job, allowance, scholarship
                  or other sources. Use your take-home income when
                  planning a budget.
                </p>
              </article>


              <article className="card">
                <span className="icon-tile purple">
                  <i className="icon fa-solid fa-house" aria-hidden="true"></i>
                </span>

                <h2>Fixed expenses</h2>

                <p>
                  Costs that usually stay the same each month,
                  such as rent, a phone plan or a regular transport pass.
                </p>
              </article>


              <article className="card">
                <span className="icon-tile peach">
                  <i className="icon fa-solid fa-basket-shopping" aria-hidden="true"></i>
                </span>

                <h2>Variable expenses</h2>

                <p>
                  Costs that can change from month to month,
                  such as groceries, electricity or eating out.
                </p>
              </article>


              <article className="card">
                <span className="icon-tile green">
                  <i className="icon fa-solid fa-seedling" aria-hidden="true"></i>
                </span>

                <h2>Savings</h2>

                <p>
                  Money set aside for future needs and goals.
                  Regular small contributions can build up over time.
                </p>
              </article>

            </div>


            <div className="two-column">

              {/*  Sample budget  */}
              <article className="card padded">

                <h2>A student budget example</h2>

                <p className="muted">
                  Example: PKR 1,000 monthly take-home income
                </p>


                <div className="sample-row">
                  <span>
                    Rent & utilities
                    <small>Fixed need</small>
                  </span>
                  <strong>PKR 350</strong>
                </div>


                <div className="sample-row">
                  <span>
                    Groceries & transport
                    <small>Variable needs</small>
                  </span>
                  <strong>PKR 150</strong>
                </div>


                <div className="sample-row">
                  <span>
                    Eating out, hobbies & fun
                    <small>Wants</small>
                  </span>
                  <strong>PKR 300</strong>
                </div>


                <div className="sample-row">
                  <span>
                    Emergency fund & goals
                    <small>Savings</small>
                  </span>
                  <strong>PKR 200</strong>
                </div>


                <div className="sample-row sample-total">
                  <span>
                    Remaining amount
                  </span>
                  <strong>PKR 0</strong>
                </div>


                <p className="callout">
                  Needs are expenses that support everyday life.
                  Wants are optional purchases. The difference can depend
                  on your personal situation.
                </p>

              </article>


              {/*  Quiz  */}
              <article className="card padded">

                <span className="badge">KNOWLEDGE CHECK</span>

                <h2>Test what you learned.</h2>

                <form id="quiz-form">

                  <fieldset>

                    <legend>
                      1. Which is usually a fixed expense?
                    </legend>

                    <label className="choice">
                      <input
                        type="radio"
                        name="quiz-fixed"
                        value="wrong"
                        required
                      />
                      An occasional cinema ticket
                    </label>

                    <label className="choice">
                      <input
                        type="radio"
                        name="quiz-fixed"
                        value="right"
                      />
                      Your monthly rent
                    </label>

                  </fieldset>


                  <fieldset>

                    <legend>
                      2. What is a good first savings habit?
                    </legend>

                    <label className="choice">
                      <input
                        type="radio"
                        name="quiz-savings"
                        value="right"
                        required
                      />
                      Put aside a manageable amount regularly
                    </label>

                    <label className="choice">
                      <input
                        type="radio"
                        name="quiz-savings"
                        value="wrong"
                      />
                      Wait until you earn much more
                    </label>

                  </fieldset>


                  <button className="button primary" type="submit">
                    Check my answers
                    <i className="icon fa-solid fa-check" aria-hidden="true"></i>
                  </button>

                  <p
                    id="quiz-result"
                    className="result-text"
                    role="status"
                  ></p>

                </form>

              </article>

            </div>

          </section>


          {/*  Needs vs wants  */}
          {/*  Needs vs. wants  */}
          <section id="needs" className="page" hidden>

            <div className="page-heading">
              <div>
                <div className="eyebrow">NEEDS VS. WANTS</div>
                <h1>Do you need it or want it?</h1>
                <p>Practice making everyday budgeting decisions and learn why each choice belongs in one category.</p>
              </div>
              <span className="page-symbol"><i className="icon fa-solid fa-scale-balanced" aria-hidden="true"></i></span>
            </div>

            <div className="needs-quiz-layout">
              <article className="card padded needs-quiz-card">
                <div className="quiz-topline">
                  <div>
                    <span className="badge gold-badge"><i className="icon fa-solid fa-bolt" aria-hidden="true"></i> INTERACTIVE QUIZ</span>
                    <p className="quiz-helper">Choose NEED or WANT, read the explanation, then continue.</p>
                  </div>
                  <div className="quiz-score" aria-live="polite">
                    <span>Score</span>
                    <strong id="needs-score">0 / 15</strong>
                  </div>
                </div>

                <div className="quiz-progress-track" aria-label="Needs versus wants progress">
                  <span id="needs-progress-fill"></span>
                </div>

                <div className="quiz-meta" aria-live="polite">
                  <span id="needs-question-count">Question 1 of 15</span>
                  <span id="needs-question-type">Budgeting decision</span>
                </div>

                <div className="quiz-prompt">
                  <div className="quiz-emoji" id="needs-question-emoji" aria-hidden="true">🛒</div>
                  <h2 id="needs-question-text">Is buying groceries a Need or a Want?</h2>
                  <p id="needs-question-context">Basic food for regular meals is usually an essential household expense.</p>
                </div>

                <div className="needs-answer-grid" role="group" aria-label="Choose need or want">
                  <button type="button" className="button secondary needs-answer" data-answer="need">
                    <i className="icon fa-solid fa-circle-check" aria-hidden="true"></i>
                    NEED
                  </button>
                  <button type="button" className="button primary needs-answer" data-answer="want">
                    <i className="icon fa-solid fa-heart" aria-hidden="true"></i>
                    WANT
                  </button>
                </div>

                <div id="needs-feedback" className="quiz-feedback" role="status" aria-live="polite"></div>

                <div className="quiz-actions">
                  <button id="needs-next" className="button text-button" type="button" hidden>
                    Next question
                    <i className="icon fa-solid fa-arrow-right" aria-hidden="true"></i>
                  </button>
                  <button id="needs-restart" className="button secondary" type="button" hidden>
                    <i className="icon fa-solid fa-rotate-right" aria-hidden="true"></i>
                    Try again
                  </button>
                </div>
              </article>

              <article className="card padded needs-guide-card">
                <div className="game-side-heading">
                  <span className="icon-tile gold"><i className="icon fa-solid fa-lightbulb" aria-hidden="true"></i></span>
                  <div>
                    <h2>How to decide</h2>
                    <p>Use these questions when you are unsure.</p>
                  </div>
                </div>

                <div className="decision-list compact">
                  <div className="decision-tip">
                    <strong>Is it essential?</strong>
                    <span>Think health, housing, education, work, or basic daily needs.</span>
                  </div>
                  <div className="decision-tip">
                    <strong>Do you already own something that works?</strong>
                    <span>A working alternative often turns an upgrade into a want.</span>
                  </div>
                  <div className="decision-tip">
                    <strong>Does your budget have room?</strong>
                    <span>Even a need should fit into a realistic spending plan.</span>
                  </div>
                  <div className="decision-tip">
                    <strong>Can it wait?</strong>
                    <span>A pause can help you separate an urgent need from an impulse.</span>
                  </div>
                </div>

                <p className="callout gold-callout">
                  Context matters. A new phone may be a need when the old one no longer works, but a newer model while your current phone still works is usually a want.
                </p>
              </article>
            </div>

          </section>


          {/*  Budgeting games  */}
          <section id="games" className="page" hidden>

            <div className="page-heading">
              <div>
                <div className="eyebrow">LEARN BY PLAYING</div>
                <h1>Budgeting Games</h1>
                <p>Learn money management by making small financial decisions in fun, student-friendly challenges.</p>
              </div>
              <span className="page-symbol"><i className="icon fa-solid fa-gamepad" aria-hidden="true"></i></span>
            </div>

            <div className="games-intro card">
              <div className="games-intro-icon"><i className="icon fa-solid fa-trophy" aria-hidden="true"></i></div>
              <div>
                <h2>Practice before it gets real.</h2>
                <p>Every game is fictional and educational. Your goal is to stay within income, recognize essentials, and protect savings.</p>
              </div>
              <span className="games-chip"><i className="icon fa-solid fa-coins" aria-hidden="true"></i> Purple + Gold</span>
            </div>

            <div className="games-grid">

              <article className="card padded game-module" id="budget-challenge-card">
                <div className="game-card-header">
                  <span className="icon-tile purple"><i className="icon fa-solid fa-wallet" aria-hidden="true"></i></span>
                  <div>
                    <span className="game-label">GAME 01</span>
                    <h2>Budget Challenge</h2>
                    <p>Create a monthly budget without spending more than your income.</p>
                  </div>
                  <span className="badge gold-badge">Rs. 50,000</span>
                </div>

                <div className="budget-game-income">
                  <span>Monthly Income</span>
                  <strong id="budget-game-income">Rs. 50,000</strong>
                </div>

                <div id="budget-game-options" className="budget-option-grid">
                  <div className="budget-option-row">
                    <div><strong>Food</strong><span>Choose one plan</span></div>
                    <div className="budget-choice-group">
                      <label><input type="radio" name="budget-food" value="7000" data-label="Home cooking" /> Home cooking <b>Rs. 7,000</b></label>
                      <label><input type="radio" name="budget-food" value="12000" data-label="Frequent takeout" /> Frequent takeout <b>Rs. 12,000</b></label>
                    </div>
                  </div>

                  <div className="budget-option-row">
                    <div><strong>Transport</strong><span>Choose one plan</span></div>
                    <div className="budget-choice-group">
                      <label><input type="radio" name="budget-transport" value="4000" data-label="Public transport" /> Public transport <b>Rs. 4,000</b></label>
                      <label><input type="radio" name="budget-transport" value="8000" data-label="Ride-hailing" /> Ride-hailing <b>Rs. 8,000</b></label>
                    </div>
                  </div>

                  <div className="budget-option-row">
                    <div><strong>Education</strong><span>Choose one plan</span></div>
                    <div className="budget-choice-group">
                      <label><input type="radio" name="budget-education" value="5000" data-label="Required study costs" /> Required study costs <b>Rs. 5,000</b></label>
                      <label><input type="radio" name="budget-education" value="9000" data-label="Extra study purchases" /> Extra study purchases <b>Rs. 9,000</b></label>
                    </div>
                  </div>

                  <div className="budget-option-row">
                    <div><strong>Entertainment</strong><span>Choose one plan</span></div>
                    <div className="budget-choice-group">
                      <label><input type="radio" name="budget-entertainment" value="2500" data-label="Simple activities" /> Simple activities <b>Rs. 2,500</b></label>
                      <label><input type="radio" name="budget-entertainment" value="9000" data-label="Premium outings" /> Premium outings <b>Rs. 9,000</b></label>
                    </div>
                  </div>

                  <div className="budget-option-row">
                    <div><strong>Shopping</strong><span>Choose one plan</span></div>
                    <div className="budget-choice-group">
                      <label><input type="radio" name="budget-shopping" value="2000" data-label="Planned basics" /> Planned basics <b>Rs. 2,000</b></label>
                      <label><input type="radio" name="budget-shopping" value="7000" data-label="Impulse shopping" /> Impulse shopping <b>Rs. 7,000</b></label>
                    </div>
                  </div>

                  <div className="budget-option-row">
                    <div><strong>Bills</strong><span>Choose one plan</span></div>
                    <div className="budget-choice-group">
                      <label><input type="radio" name="budget-bills" value="7000" data-label="Essential bills" /> Essential bills <b>Rs. 7,000</b></label>
                      <label><input type="radio" name="budget-bills" value="11000" data-label="Higher monthly bills" /> Higher monthly bills <b>Rs. 11,000</b></label>
                    </div>
                  </div>
                </div>

                <div className="game-stats-row budget-game-stats">
                  <div><span>Income</span><strong id="budget-total-income">Rs. 50,000</strong></div>
                  <div><span>Total Spending</span><strong id="budget-total-spending">Rs. 0</strong></div>
                  <div><span>Remaining Balance</span><strong id="budget-remaining">Rs. 50,000</strong></div>
                </div>

                <p id="budget-game-feedback" className="game-result" role="status"></p>

                <div className="game-actions">
                  <button id="budget-game-check" className="button primary" type="button">
                    Check my budget
                    <i className="icon fa-solid fa-calculator" aria-hidden="true"></i>
                  </button>
                  <button id="budget-game-reset" className="button secondary" type="button">Reset</button>
                </div>
              </article>

              <article className="card padded game-module" id="need-want-challenge-card">
                <div className="game-card-header">
                  <span className="icon-tile gold"><i className="icon fa-solid fa-scale-balanced" aria-hidden="true"></i></span>
                  <div>
                    <span className="game-label">GAME 02</span>
                    <h2>Need or Want Challenge</h2>
                    <p>Make quick choices and build your budgeting judgment.</p>
                  </div>
                  <span className="badge">MULTI-ROUND</span>
                </div>

                <div className="challenge-prompt">
                  <div className="challenge-round" id="nw-game-round">Round 1 of 8</div>
                  <h3 id="nw-game-scenario">You already have a working smartphone, but a newer model has been released.</h3>
                </div>

                <div className="needs-answer-grid">
                  <button type="button" className="button secondary nw-game-answer" data-answer="need">NEED</button>
                  <button type="button" className="button primary nw-game-answer" data-answer="want">WANT</button>
                </div>

                <p id="nw-game-feedback" className="game-result" role="status"></p>

                <div className="game-stats-row">
                  <div><span>Score</span><strong id="nw-game-score">0 / 8</strong></div>
                  <div><span>Progress</span><strong id="nw-game-progress">0%</strong></div>
                </div>

                <div className="game-actions">
                  <button id="nw-game-next" className="button text-button" type="button" hidden>
                    Next round <i className="icon fa-solid fa-arrow-right" aria-hidden="true"></i>
                  </button>
                  <button id="nw-game-restart" className="button secondary" type="button" hidden>
                    <i className="icon fa-solid fa-rotate-right" aria-hidden="true"></i>
                    Play again
                  </button>
                </div>
              </article>

              <article className="card padded game-module" id="savings-challenge-card">
                <div className="game-card-header">
                  <span className="icon-tile green"><i className="icon fa-solid fa-piggy-bank" aria-hidden="true"></i></span>
                  <div>
                    <span className="game-label">GAME 03</span>
                    <h2>Savings Challenge</h2>
                    <p>Make four spending decisions and try to finish with your savings goal intact.</p>
                  </div>
                  <span className="badge gold-badge">Goal Rs. 20,000</span>
                </div>

                <div className="savings-game-goal">
                  <div>
                    <span>Monthly income</span>
                    <strong>Rs. 50,000</strong>
                  </div>
                  <div>
                    <span>Savings goal</span>
                    <strong>Rs. 20,000</strong>
                  </div>
                </div>

                <div className="quiz-progress-track" aria-label="Savings challenge progress">
                  <span id="savings-game-progress-fill"></span>
                </div>

                <div className="challenge-prompt">
                  <div className="challenge-round" id="savings-game-round">Round 1 of 4</div>
                  <h3 id="savings-game-scenario">For transport this month, what would you choose?</h3>
                </div>

                <div id="savings-game-options" className="savings-choice-grid"></div>

                <div className="game-stats-row">
                  <div><span>Spent</span><strong id="savings-game-spent">Rs. 0</strong></div>
                  <div><span>Current Savings</span><strong id="savings-game-current">Rs. 50,000</strong></div>
                  <div><span>Goal</span><strong>Rs. 20,000</strong></div>
                </div>

                <p id="savings-game-feedback" className="game-result" role="status"></p>

                <button id="savings-game-restart" className="button secondary" type="button">
                  <i className="icon fa-solid fa-rotate-right" aria-hidden="true"></i>
                  Restart challenge
                </button>
              </article>

            </div>

          </section>


          {/*  50-30-20 calculator  */}
          <section id="calculator" className="page" hidden>

            <div className="page-heading">

              <div>
                <div className="eyebrow">BUDGET CALCULATOR</div>

                <h1>Plan your monthly income.</h1>

                <p>
                  Use the 50-30-20 rule as a simple starting point
                  for dividing your money.
                </p>
              </div>

            </div>


            <article className="card padded calculator-full">

              <form id="budget-form">

                <label htmlFor="monthly-income">
                  Monthly take-home income (PKR)
                </label>

                <div className="income-controls">

                  <div className="currency-input">
                    <span>PKR</span>

                    <input
                      id="monthly-income"
                      type="number"
                      min="0"
                      max="1000000000"
                      step="0.01"
                      defaultValue="1000"
                      required
                    />
                  </div>

                  <button className="button primary" type="submit">
                    Build my budget
                    <i className="icon fa-solid fa-arrow-right" aria-hidden="true"></i>
                  </button>

                </div>

                <p
                  id="budget-error"
                  className="field-error"
                  role="alert"
                ></p>

              </form>


              <div
                id="allocation-results"
                aria-live="polite"
              ></div>


              <p className="callout">

                <i className="icon fa-solid fa-circle" aria-hidden="true"></i>

                The 50-30-20 rule is an educational guideline.
                Your actual percentages may need to change depending
                on your expenses and circumstances.

              </p>

            </article>

          </section>


          {/*  Savings goals  */}
          <section id="savings" className="page" hidden>

            <div className="page-heading">

              <div>
                <div className="eyebrow">SAVINGS GOALS</div>

                <h1>Set a savings goal.</h1>

                <p>
                  Choose a target, enter your current savings
                  and see how long it could take.
                </p>
              </div>

            </div>


            <div className="two-column">

              <article className="card padded">

                <h2>Goal details</h2>

                <form id="savings-form" className="stacked-form">

                  <label htmlFor="goal-name">
                    What are you saving for?
                  </label>

                  <input
                    id="goal-name"
                    type="text"
                    maxLength="60"
                    defaultValue="New laptop fund"
                    required
                  />


                  <label htmlFor="goal-target">
                    Target amount (PKR)
                  </label>

                  <input
                    id="goal-target"
                    type="number"
                    min="0.01"
                    max="1000000000"
                    step="0.01"
                    defaultValue="1000"
                    required
                  />


                  <label htmlFor="goal-current">
                    Already saved (PKR)
                  </label>

                  <input
                    id="goal-current"
                    type="number"
                    min="0"
                    max="1000000000"
                    step="0.01"
                    defaultValue="350"
                    required
                  />


                  <label htmlFor="goal-monthly">
                    Monthly contribution (PKR)
                  </label>

                  <input
                    id="goal-monthly"
                    type="number"
                    min="0"
                    max="1000000000"
                    step="0.01"
                    defaultValue="100"
                    required
                  />


                  <button className="button primary" type="submit">
                    Plan my goal
                    <i className="icon fa-solid fa-arrow-right" aria-hidden="true"></i>
                  </button>


                  <p
                    id="savings-error"
                    className="field-error"
                    role="alert"
                  ></p>

                </form>

              </article>


              <article
                className="card padded savings-result"
                id="savings-results"
                aria-live="polite"
              ></article>

            </div>

          </section>


          {/*  Expense planner (Independent Tool)  */}
          <section id="expenses" className="page" hidden>

            <div className="page-heading">

              <div>
                <div className="eyebrow">INDEPENDENT EXPENSE PLANNER · REAL-TIME TRACKING</div>

                <h1>Expense planner & tracker.</h1>

                <p>
                  Set your monthly income, log your actual expenses, and monitor your remaining balance.
                  Completely independent from the 50-30-20 rule.
                </p>
              </div>

              <div className="heading-actions">
                <button
                  className="button secondary"
                  id="reset-expenses"
                  type="button"
                >
                  <i className="icon fa-solid fa-arrow-rotate-left" aria-hidden="true"></i>
                  Reset expenses
                </button>
              </div>

            </div>


            {/*  Dedicated Monthly Income Input Card  */}
            <article className="card padded planner-income-card">
              <div className="planner-income-row">
                <div className="planner-income-info">
                  <span className="icon-tile purple">
                    <i className="icon fa-solid fa-wallet" aria-hidden="true"></i>
                  </span>
                  <div>
                    <h2>Monthly Income</h2>
                    <p className="muted">Enter your total monthly allowance or earnings to track your budget.</p>
                  </div>
                </div>

                <div className="planner-income-control">
                  <label htmlFor="planner-income-input" className="sr-only">Monthly Income in PKR</label>
                  <div className="currency-input planner-input-wrap">
                    <span className="currency-badge">Rs.</span>
                    <input
                      id="planner-income-input"
                      type="number"
                      min="0"
                      max="1000000000"
                      step="100"
                      defaultValue="50000"
                      placeholder="50,000"
                      required
                    />
                  </div>
                  <button className="button primary" id="set-income-btn" type="button">
                    <i className="icon fa-solid fa-check" aria-hidden="true"></i>
                    Update
                  </button>
                </div>
              </div>

              <div className="quick-income-presets" aria-label="Quick income amounts">
                <span className="preset-label">Quick select:</span>
                <button type="button" className="income-preset-btn" data-preset="25000">Rs. 25,000</button>
                <button type="button" className="income-preset-btn" data-preset="50000">Rs. 50,000</button>
                <button type="button" className="income-preset-btn" data-preset="75000">Rs. 75,000</button>
                <button type="button" className="income-preset-btn" data-preset="100000">Rs. 100,000</button>
              </div>
            </article>


            {/*  Expense summary stats cards  */}
            <div className="expense-stats">

              <article className="card stat-card income-stat">
                <div className="stat-header">
                  <span>Monthly Income</span>
                  <span className="icon-tile-mini purple"><i className="icon fa-solid fa-money-bill-wave" aria-hidden="true"></i></span>
                </div>
                <strong id="expense-income">
                  Rs. 50,000.00
                </strong>
                <small className="stat-caption">Base budget for this period</small>
              </article>


              <article className="card stat-card expense-stat">
                <div className="stat-header">
                  <span>Total Expenses</span>
                  <span className="icon-tile-mini peach"><i className="icon fa-solid fa-receipt" aria-hidden="true"></i></span>
                </div>
                <strong id="expense-total">
                  Rs. 30,000.00
                </strong>
                <small id="expense-entry-count" className="stat-caption">
                  4 entries recorded
                </small>
              </article>


              <article className="card stat-card balance-stat">
                <div className="stat-header">
                  <span>Remaining Balance</span>
                  <span className="icon-tile-mini gold" id="balance-icon-tile"><i className="icon fa-solid fa-scale-balanced" aria-hidden="true"></i></span>
                </div>
                <strong id="expense-balance">
                  Rs. 20,000.00
                </strong>
                <div id="balance-status-badge" className="badge-status-positive">
                  <i className="icon fa-solid fa-circle-check" aria-hidden="true"></i>
                  <span>Surplus: Income &gt; Expenses</span>
                </div>
              </article>

            </div>


            {/*  Budget utilization progress card  */}
            <article className="card padded budget-progress-card">
              <div className="budget-progress-header">
                <div>
                  <h3>Budget Utilization</h3>
                  <p className="muted" id="planner-progress-text">Rs. 30,000 spent of Rs. 50,000 (60% spent · Rs. 20,000 remaining)</p>
                </div>
                <span className="percent-chip" id="planner-percent-chip">60% Used</span>
              </div>

              <div className="progress-track-wrapper">
                <div className="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="60">
                  <div className="progress-fill" id="planner-progress-fill" style={{width: '60%'}}></div>
                </div>
              </div>
            </article>


            {/*  Expense form  */}
            <article className="card padded">

              <div className="form-header-row">
                <div>
                  <h2 id="expense-form-title">
                    Add an expense
                  </h2>
                  <p className="muted">Enter category, purpose, and amount to instantly recalculate totals.</p>
                </div>
                <span className="badge gold-badge"><i className="icon fa-solid fa-plus" aria-hidden="true"></i> Dynamic</span>
              </div>

              <form id="expense-form" className="expense-form">

                <div>
                  <label htmlFor="expense-date">Date</label>
                  <input
                    id="expense-date"
                    type="date"
                    required
                  />
                </div>


                <div>
                  <label htmlFor="expense-category">
                    Category
                  </label>

                  <select id="expense-category">
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Bills">Bills</option>
                    <option value="Education">Education</option>
                    <option value="Rent">Rent</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Other">Other</option>
                  </select>
                </div>


                <div className="description-field">

                  <label htmlFor="expense-description">
                    Description
                  </label>

                  <input
                    id="expense-description"
                    type="text"
                    maxLength="100"
                    placeholder="e.g. Monthly internet or Course materials"
                    required
                  />

                </div>


                <div>

                  <label htmlFor="expense-amount">
                    Amount (PKR)
                  </label>

                  <input
                    id="expense-amount"
                    type="number"
                    min="0.01"
                    max="1000000000"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />

                </div>


                <div className="expense-form-actions">
                  <button
                    className="button primary"
                    id="save-expense"
                    type="submit"
                  >
                    <i className="icon fa-solid fa-plus" aria-hidden="true"></i>
                    <span id="save-expense-text">Add expense</span>
                  </button>

                  <button
                    type="button"
                    id="cancel-edit"
                    className="button secondary"
                    hidden
                  >
                    Cancel
                  </button>
                </div>

              </form>


              <p
                id="expense-error"
                className="field-error"
                role="alert"
              ></p>

            </article>


            {/*  Expense list  */}
            <article className="card padded expense-list">

              <div className="section-heading">

                <div>
                  <h2>Expense entries</h2>
                  <span className="subtle-label"><i className="icon fa-solid fa-list-check" aria-hidden="true"></i> Live recalculation</span>
                </div>

                <div className="filter-controls">

                  <select
                    id="expense-filter"
                    aria-label="Filter expenses by category"
                  >
                    <option value="all">All categories</option>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Bills">Bills</option>
                    <option value="Education">Education</option>
                    <option value="Rent">Rent</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Other">Other</option>
                  </select>


                  <select
                    id="expense-sort"
                    aria-label="Sort expenses"
                  >
                    <option value="newest">Newest first</option>
                    <option value="highest">Highest amount</option>
                    <option value="lowest">Lowest amount</option>
                  </select>

                </div>

              </div>


              <div id="expense-table"></div>

              <p
                id="expense-status"
                className="result-text"
                role="status"
              ></p>

            </article>

          </section>


          {/*  Student expense example  */}
          <section id="student-expenses" className="page" hidden>

            <div className="page-heading">
              <div>
                <div className="eyebrow">STUDENT EXPENSE EXAMPLE</div>
                <h1>See how a student can track monthly expenses.</h1>
                <p>
                  A simple example using common student spending categories.
                  This is sample data for learning only.
                </p>
              </div>

              <div className="date-chip">
                <i className="icon fa-solid fa-eye" aria-hidden="true"></i>
                <span><strong id="student-page-views">0</strong> views</span>
              </div>
            </div>

            <div className="expense-student-grid">
              <article className="card student-profile-card">
                <div className="student-avatar"><i className="icon fa-solid fa-user-graduate" aria-hidden="true"></i></div>
                <span className="badge">DEMO STUDENT</span>
                <h2>Ali's Monthly Budget</h2>
                <p className="muted">A sample student with a monthly income of PKR 1,000.</p>
                <div className="student-mini-stats">
                  <div><span>Income</span><strong id="student-income">PKR 1,000</strong></div>
                  <div><span>Expenses</span><strong id="student-expenses-total">PKR 0</strong></div>
                  <div><span>Left</span><strong id="student-balance">PKR 1,000</strong></div>
                </div>
              </article>

              <article className="card padded">
                <div className="section-heading">
                  <h2>Monthly expense breakdown</h2>
                  <span className="subtle-label"><i className="icon fa-solid fa-chart-column" aria-hidden="true"></i> Example</span>
                </div>
                <div id="student-expense-breakdown" className="student-expense-breakdown"></div>
              </article>
            </div>

            <article className="card padded student-table-card">
              <div className="section-heading">
                <div>
                  <h2>Ali's expense list</h2>
                  <p className="muted">These entries show where the sample student's money goes.</p>
                </div>
                <span className="badge" id="student-expense-count">0 expenses</span>
              </div>
              <div id="student-expense-table"></div>
            </article>

            <article className="student-example-tip">
              <span className="icon-tile green"><i className="icon fa-solid fa-lightbulb" aria-hidden="true"></i></span>
              <div>
                <strong>What can Ali learn?</strong>
                <p>Tracking each expense makes it easier to compare essential costs, optional spending, and the amount left for savings.</p>
              </div>
            </article>

          </section>


          {/*  Learning / Money smarts  */}
          <section id="learn" className="page" hidden>

            <div className="page-heading">

              <div>
                <div className="eyebrow">MONEY SMARTS</div>

                <h1>Learn better money habits.</h1>

                <p>
                  Browse short lessons and practical tips for
                  everyday student spending.
                </p>
              </div>

            </div>


            {/*  Resource list  */}
            <article className="card padded">

              <div className="resource-toolbar">

                <div className="search-field">

                  <i className="icon fa-solid fa-magnifying-glass" aria-hidden="true"></i>

                  <input
                    id="resource-search"
                    type="search"
                    placeholder="Search tips, goals and articles..."
                    aria-label="Search resources"
                  />

                </div>


                <select
                  id="topic-filter"
                  aria-label="Filter resources by topic"
                >
                  <option value="all">All topics</option>
                  <option value="budgeting">Budgeting</option>
                  <option value="saving">Saving</option>
                  <option value="spending">Spending</option>
                </select>


                <select
                  id="resource-sort"
                  aria-label="Sort resources"
                >
                  <option value="popular">Most popular</option>
                  <option value="title">Title A-Z</option>
                </select>

              </div>


              <p
                id="resource-count"
                className="muted"
                role="status"
              ></p>

              <div id="resource-list"></div>

            </article>
          </section>



          {/*  Money mistakes  */}
          <section id="mistakes" className="page" hidden>
            <div className="page-heading">
              <div>
                <div className="eyebrow">MONEY MISTAKES</div>
                <h1>Spot common money mistakes early.</h1>
                <p>Explore realistic student situations and simple corrective actions.</p>
              </div>
              <span className="page-symbol"><i className="icon fa-solid fa-triangle-exclamation" aria-hidden="true"></i></span>
            </div>

            <div className="mistake-grid">
              <details className="card mistake-item" open>
                <summary><span className="mistake-number">01</span><span><strong>Impulse buying</strong><small>Buying without pausing to check your plan.</small></span><i className="icon fa-solid fa-chevron-down" aria-hidden="true"></i></summary>
                <div className="mistake-content"><p><b>Student scenario:</b> You see a sale item online and buy it even though it was not in your plan.</p><p><b>Corrective action:</b> Pause, check your needs, and give yourself time before making a non-essential purchase.</p></div>
              </details>
              <details className="card mistake-item">
                <summary><span className="mistake-number">02</span><span><strong>Ignoring small expenses</strong><small>Frequent small purchases can add up.</small></span><i className="icon fa-solid fa-chevron-down" aria-hidden="true"></i></summary>
                <div className="mistake-content"><p><b>Student scenario:</b> Snacks, delivery charges, and small app purchases feel harmless one at a time.</p><p><b>Corrective action:</b> Record everyday spending in the Expense Planner and review the total.</p></div>
              </details>
              <details className="card mistake-item">
                <summary><span className="mistake-number">03</span><span><strong>Late payments</strong><small>Forgetting a payment can create avoidable costs.</small></span><i className="icon fa-solid fa-chevron-down" aria-hidden="true"></i></summary>
                <div className="mistake-content"><p><b>Student scenario:</b> A due date passes because it was not added to your plan.</p><p><b>Corrective action:</b> Keep important due dates in one place and review them before the month begins.</p></div>
              </details>
              <details className="card mistake-item">
                <summary><span className="mistake-number">04</span><span><strong>Unused subscriptions</strong><small>Paying for services you rarely use.</small></span><i className="icon fa-solid fa-chevron-down" aria-hidden="true"></i></summary>
                <div className="mistake-content"><p><b>Student scenario:</b> A recurring subscription keeps charging even though you stopped using it.</p><p><b>Corrective action:</b> Review recurring costs and remove services that are no longer useful to you.</p></div>
              </details>
              <details className="card mistake-item">
                <summary><span className="mistake-number">05</span><span><strong>Spending without a plan</strong><small>Making choices without knowing your available amount.</small></span><i className="icon fa-solid fa-chevron-down" aria-hidden="true"></i></summary>
                <div className="mistake-content"><p><b>Student scenario:</b> You spend first and only later discover there is not enough left for an important expense.</p><p><b>Corrective action:</b> Start with a simple budget and check the remaining amount before optional spending.</p></div>
              </details>
            </div>

            <div className="callout callout-wide"><i className="icon fa-solid fa-shield-heart" aria-hidden="true"></i><span><strong>Friendly reminder:</strong> Budgeting is about awareness and planning, not perfection.</span></div>
          </section>


          {/*  Infographics  */}
          <section id="infographics" className="page" hidden>
            <div className="page-heading">
              <div>
                <div className="eyebrow">INFOGRAPHICS & LEARNING GALLERY</div>
                <h1>Learn with clear visual guides.</h1>
                <p>Explore original, icon-based visuals for student budgeting concepts.</p>
              </div>
              <span className="page-symbol"><i className="icon fa-solid fa-chart-simple" aria-hidden="true"></i></span>
            </div>

            <div className="infographic-toolbar card">
              <div><strong>Filter visual guides</strong><span>Choose a topic to focus your learning.</span></div>
              <select id="info-filter" aria-label="Filter infographics by topic">
                <option defaultValue="all">All topics</option><option defaultValue="budgeting">Budgeting</option><option defaultValue="spending">Needs & wants</option><option defaultValue="saving">Saving</option>
              </select>
            </div>

            <div id="infographic-grid" className="infographic-grid">
              <figure className="card infographic-card" data-topic="spending">
                <div className="info-visual needs-visual" role="img" aria-label="Decision guide showing essentials and optional spending">
                  <div className="info-pill need"><i className="icon fa-solid fa-circle-check"></i> Need</div>
                  <div className="info-connector"><i className="icon fa-solid fa-arrows-left-right"></i></div>
                  <div className="info-pill want"><i className="icon fa-solid fa-heart"></i> Want</div>
                  <div className="info-question">Ask: “Would I still choose this without the sale?”</div>
                </div>
                <figcaption><strong>Needs vs. Wants</strong><span>Pause before non-essential spending.</span></figcaption>
              </figure>

              <figure className="card infographic-card" data-topic="budgeting">
                <div className="info-visual split-visual" role="img" aria-label="50 30 20 budgeting split showing needs, wants, and savings">
                  <div className="split-segment needs-segment"><b>50%</b><span>Needs</span></div>
                  <div className="split-segment wants-segment"><b>30%</b><span>Wants</span></div>
                  <div className="split-segment savings-segment"><b>20%</b><span>Savings</span></div>
                </div>
                <figcaption><strong>50–30–20 Split</strong><span>A suggested educational starting point.</span></figcaption>
              </figure>

              <figure className="card infographic-card" data-topic="budgeting">
                <div className="info-visual cycle-visual" role="img" aria-label="Monthly budget cycle from income to planning, spending, and review">
                  <div className="cycle-node"><i className="icon fa-solid fa-wallet"></i><span>Income</span></div>
                  <div className="cycle-arrow"><i className="icon fa-solid fa-arrow-right"></i></div>
                  <div className="cycle-node"><i className="icon fa-solid fa-list-check"></i><span>Plan</span></div>
                  <div className="cycle-arrow"><i className="icon fa-solid fa-arrow-right"></i></div>
                  <div className="cycle-node"><i className="icon fa-solid fa-bag-shopping"></i><span>Spend</span></div>
                  <div className="cycle-arrow"><i className="icon fa-solid fa-arrow-right"></i></div>
                  <div className="cycle-node"><i className="icon fa-solid fa-rotate"></i><span>Review</span></div>
                </div>
                <figcaption><strong>Monthly Budget Cycle</strong><span>Plan, track, review, and adjust.</span></figcaption>
              </figure>

              <figure className="card infographic-card" data-topic="saving">
                <div className="info-visual saving-visual" role="img" aria-label="Saving challenge with four weekly steps">
                  <div className="save-step"><b>01</b><span>Choose a goal</span></div><div className="save-step"><b>02</b><span>Set an amount</span></div><div className="save-step"><b>03</b><span>Save regularly</span></div><div className="save-step"><b>04</b><span>Check progress</span></div>
                </div>
                <figcaption><strong>Saving Challenge</strong><span>Turn a goal into a repeatable habit.</span></figcaption>
              </figure>
            </div>
            <p id="info-empty" className="empty-state" hidden>No matching infographic was found for this topic.</p>
          </section>


          {/*  Feedback  */}
          <section id="feedback" className="page" hidden>
            <div className="page-heading">
              <div>
                <div className="eyebrow">FEEDBACK</div>
                <h1>Tell us how BudgetBasics can improve.</h1>
                <p>Your response is validated on this device only and is not sent or stored on a server.</p>
              </div>
              <span className="page-symbol"><i className="icon fa-solid fa-comment-dots" aria-hidden="true"></i></span>
            </div>

            <div className="two-column contact-layout">
              <article className="card padded">
                <span className="icon-tile purple"><i className="icon fa-solid fa-message" aria-hidden="true"></i></span>
                <h2>Share your thoughts</h2>
                <p className="muted">The form follows the SRS requirement for name, email, rating, and comments.</p>
                <form id="feedback-form" className="stacked-form" noValidate>
                  <div className="form-group">
                    <label htmlFor="feedback-name">Your Full Name <span className="required-star">*</span></label>
                    <input id="feedback-name" type="text" maxLength="60" required={true} placeholder="e.g. Bilal Ahmed" />
                    <span className="field-error-msg" id="feedback-name-error" aria-live="polite"></span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="feedback-email">Email Address <span className="required-star">*</span></label>
                    <input id="feedback-email" type="email" maxLength="120" required={true} placeholder="bilal@student.edu.pk" />
                    <span className="field-error-msg" id="feedback-email-error" aria-live="polite"></span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="feedback-rating">How helpful is BudgetBasics? <span className="required-star">*</span></label>
                    <select id="feedback-rating" required>
                      <option defaultValue="">Choose a rating...</option>
                      <option defaultValue="Very helpful">⭐⭐⭐⭐⭐ Very helpful &amp; intuitive</option>
                      <option defaultValue="Somewhat helpful">⭐⭐⭐⭐ Somewhat helpful</option>
                      <option defaultValue="Neutral">⭐⭐⭐ Neutral</option>
                      <option defaultValue="Could be better">⭐⭐ Could be better</option>
                    </select>
                    <span className="field-error-msg" id="feedback-rating-error" aria-live="polite"></span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="feedback-message">Comments &amp; Suggestions <span className="required-star">*</span></label>
                    <textarea id="feedback-message" rows="4" maxLength="500" required={true} placeholder="What features or topics would you like to see next?"></textarea>
                    <span className="field-error-msg" id="feedback-message-error" aria-live="polite"></span>
                  </div>

                  <button className="button primary" id="feedback-submit-btn" type="submit">
                    <span>Submit feedback</span>
                    <i className="icon fa-solid fa-arrow-right" aria-hidden="true"></i>
                  </button>
                  <p id="feedback-result" className="result-text" role="status"></p>
                </form>
              </article>

              <article className="card padded soft-panel">
                <div className="soft-icon"><i className="icon fa-solid fa-shield-halved" aria-hidden="true"></i></div>
                <h2>Privacy first</h2>
                <p>BudgetBasics is an educational demo. Feedback is validated client-side only.</p>
                <div className="mini-check"><i className="icon fa-solid fa-check"></i><span>No backend submission</span></div>
                <div className="mini-check"><i className="icon fa-solid fa-check"></i><span>No permanent financial records</span></div>
                <div className="mini-check"><i className="icon fa-solid fa-check"></i><span>Clear confirmation after validation</span></div>
              </article>
            </div>
          </section>


          {/*  About Us  */}
          <section id="about" className="page" hidden>
            <div className="page-heading">
              <div>
                <div className="eyebrow">ABOUT BUDGETBASICS · STUDENT FINANCIAL EMPOWERMENT</div>
                <h1>Empowering students with financial clarity.</h1>
                <p>BudgetBasics is an interactive educational platform designed to make personal finance, saving, and expense planning intuitive, practical, and beginner-friendly.</p>
              </div>
              <span className="page-symbol"><i className="icon fa-solid fa-circle-info" aria-hidden="true"></i></span>
            </div>

            {/*  About Hero Banner  */}
            <div className="about-hero card">
              <div className="about-logo-large">
                <img src="assets/logo.png" alt="BudgetBasics graphical logo" style={{ width: '300px', maxWidth: '100%' }} />
              </div>
              <div className="about-hero-details">
                <div className="about-hero-top">
                  <span className="badge gold-badge"><i className="icon fa-solid fa-graduation-cap"></i> NEXTGEN STUDENT TOOLKIT</span>
                  <span className="about-version-tag">Ver 2.5 · 100% Free &amp; Private</span>
                </div>
                <h2>Learn. Plan. Grow.</h2>
                <p>
                  Navigating university life or starting your first job brings new financial independence and tough choices.
                  BudgetBasics was created to bridge the financial literacy gap for young adults in Pakistan, turning complex financial jargon
                  into straightforward, visual tools you can master in minutes.
                </p>
                <div className="about-pill-row">
                  <span><i className="icon fa-solid fa-graduation-cap"></i> Student-Focused</span>
                  <span><i className="icon fa-solid fa-chart-pie"></i> Visual Interactive Tools</span>
                  <span><i className="icon fa-solid fa-user-shield"></i> 100% Private (No Bank Link)</span>
                  <span><i className="icon fa-solid fa-hand-holding-dollar"></i> Tailored for PKR (Rs.)</span>
                </div>
              </div>
            </div>

            {/*  Why Budgeting Matters for Students (Highlight Box)  */}
            <article className="card padded about-highlight-banner">
              <div className="highlight-inner">
                <div className="highlight-icon">
                  <i className="icon fa-solid fa-lightbulb" aria-hidden="true"></i>
                </div>
                <div className="highlight-content">
                  <span className="overline gold-text">THE MISSION</span>
                  <h3>Why Financial Awareness Matters Early</h3>
                  <p>
                    Money management is rarely taught in traditional classrooms, yet it is one of the most critical life skills.
                    Whether you live in a hostel on a fixed monthly stipend, manage scholarship grants, or earn pocket money from freelancing,
                    building conscious spending habits early protects you from debt, relieves academic stress, and establishes life-long financial security.
                  </p>
                </div>
              </div>
            </article>

            {/*  4 Core Pillars of BudgetBasics (Information Cards)  */}
            <div className="section-heading">
              <h2>Core pillars of our platform <span>Designed around practical student needs.</span></h2>
              <span className="subtle-label"><i className="icon fa-solid fa-gem" aria-hidden="true"></i> Core values</span>
            </div>

            <div className="about-pillars-grid">
              <article className="card padded pillar-card">
                <span className="icon-tile purple">
                  <i className="icon fa-solid fa-compass" aria-hidden="true"></i>
                </span>
                <h3>1. Financial Awareness</h3>
                <p>
                  Understanding where your money goes is the first step toward control. We help you categorize spending into necessities and discretionary wants so you never wonder where your money disappeared at the end of the month.
                </p>
              </article>

              <article className="card padded pillar-card">
                <span className="icon-tile peach">
                  <i className="icon fa-solid fa-scale-balanced" aria-hidden="true"></i>
                </span>
                <h3>2. Expense Management</h3>
                <p>
                  Small, unrecorded purchases—campus canteen snacks, ride-hailing fares, printout charges—can silently drain your budget. Our dedicated Expense Planner turns abstract spending into tangible numbers.
                </p>
              </article>

              <article className="card padded pillar-card">
                <span className="icon-tile green">
                  <i className="icon fa-solid fa-seedling" aria-hidden="true"></i>
                </span>
                <h3>3. Purposeful Saving</h3>
                <p>
                  Saving is not about how much you earn; it is about consistency. Even setting aside Rs. 500 or Rs. 1,000 every month builds confidence and prepares you for real emergencies without panic.
                </p>
              </article>

              <article className="card padded pillar-card">
                <span className="icon-tile gold">
                  <i className="icon fa-solid fa-award" aria-hidden="true"></i>
                </span>
                <h3>4. Healthy Money Habits</h3>
                <p>
                  Budgeting is not about restrictive deprivation—it is about intentional spending. By planning ahead, you can enjoy social outings, hobbies, and tech upgrades guilt-free without compromising essentials.
                </p>
              </article>
            </div>

            {/*  How BudgetBasics Helps Users (Feature Showcase)  */}
            <div className="section-heading">
              <h2>How BudgetBasics helps you succeed <span>Interactive tools tailored for real life.</span></h2>
              <span className="subtle-label"><i className="icon fa-solid fa-screwdriver-wrench" aria-hidden="true"></i> Practical tools</span>
            </div>

            <div className="two-column about-features-grid">
              <article className="card padded feature-info-card">
                <div className="feature-info-top">
                  <span className="feature-badge">TOOL 01</span>
                  <h4>The 50/30/20 Benchmark</h4>
                </div>
                <p>
                  An internationally proven educational framework adapted for Pakistani students: roughly 50% for Needs, 30% for Wants, and 20% for Savings. Use it as a clear benchmark to understand healthy income distribution.
                </p>
                <ul className="about-feature-bullets">
                  <li><i className="icon fa-solid fa-circle-check"></i> Visual allocation donut chart &amp; trend preview</li>
                  <li><i className="icon fa-solid fa-circle-check"></i> Instantly calculates allocations for any monthly income</li>
                </ul>
              </article>

              <article className="card padded feature-info-card">
                <div className="feature-info-top">
                  <span className="feature-badge gold">TOOL 02</span>
                  <h4>Independent Expense Planner</h4>
                </div>
                <p>
                  A flexible, standalone tracker that lets you record real spending by category (Food, Transport, Bills, Education, Rent) against your declared income, computing your remaining balance automatically.
                </p>
                <ul className="about-feature-bullets">
                  <li><i className="icon fa-solid fa-circle-check"></i> Real-time balance and dynamic budget utilization progress</li>
                  <li><i className="icon fa-solid fa-circle-check"></i> Add, edit, and delete expense entries with instant recalculation</li>
                </ul>
              </article>

              <article className="card padded feature-info-card">
                <div className="feature-info-top">
                  <span className="feature-badge green">TOOL 03</span>
                  <h4>Savings Goal Calculator</h4>
                </div>
                <p>
                  Break down big financial dreams—such as buying a study laptop, paying semester fees, or creating an emergency cushion—into manageable monthly contributions with precise completion timelines.
                </p>
                <ul className="about-feature-bullets">
                  <li><i className="icon fa-solid fa-circle-check"></i> Visual goal milestone bar and monthly estimation</li>
                  <li><i className="icon fa-solid fa-circle-check"></i> Live encouragement tips to keep your momentum high</li>
                </ul>
              </article>

              <article className="card padded feature-info-card">
                <div className="feature-info-top">
                  <span className="feature-badge purple">ASSISTANT</span>
                  <h4>BudgetBuddy Smart Guide</h4>
                </div>
                <p>
                  Our built-in rule-based conversational assistant is always ready to answer personal finance questions, clarify financial terminology, and provide practical tips tailored to college students.
                </p>
                <ul className="about-feature-bullets">
                  <li><i className="icon fa-solid fa-circle-check"></i> Curated preset questions for quick one-click learning</li>
                  <li><i className="icon fa-solid fa-circle-check"></i> Clean, responsive dialog without intrusive scrollbars</li>
                </ul>
              </article>
            </div>

            {/*  The Golden Rules of Student Budgeting  */}
            <article className="card padded golden-rules-banner">
              <div className="golden-rules-header">
                <span className="icon-tile gold"><i className="icon fa-solid fa-crown" aria-hidden="true"></i></span>
                <div>
                  <h3>The 4 Golden Rules of Student Budgeting</h3>
                  <p className="muted">Principles that every beginner should keep in mind.</p>
                </div>
              </div>
              <div className="golden-rules-grid">
                <div className="golden-rule-item">
                  <span className="golden-rule-num">01</span>
                  <div>
                    <strong>Pay Yourself First</strong>
                    <p>Deposit a small portion of any allowance into your savings before spending on discretionary items.</p>
                  </div>
                </div>
                <div className="golden-rule-item">
                  <span className="golden-rule-num">02</span>
                  <div>
                    <strong>Pause 48 Hours on Wants</strong>
                    <p>When tempted by sales or impulses, wait 2 days. If you still need it and your budget permits, proceed.</p>
                  </div>
                </div>
                <div className="golden-rule-item">
                  <span className="golden-rule-num">03</span>
                  <div>
                    <strong>Track Everyday Leaks</strong>
                    <p>Routine small canteen snacks and unmonitored rides add up quickly. Awareness is your best defense.</p>
                  </div>
                </div>
                <div className="golden-rule-item">
                  <span className="golden-rule-num">04</span>
                  <div>
                    <strong>Build an Emergency Buffer</strong>
                    <p>Even a modest buffer of Rs. 3,000 to Rs. 5,000 prevents panic during sudden unexpected costs.</p>
                  </div>
                </div>
              </div>
            </article>

            {/*  Project & Team Details  */}
            <div className="three-column about-team-row">
              <article className="card padded">
                <span className="icon-tile green"><i className="icon fa-solid fa-bullseye" aria-hidden="true"></i></span>
                <h2>Our Purpose</h2>
                <p>Provide Pakistani college students and beginners with an accessible, friendly, and non-intimidating way to practice budgeting and achieve financial confidence.</p>
              </article>

              <article className="card padded">
                <span className="icon-tile purple"><i className="icon fa-solid fa-users" aria-hidden="true"></i></span>
                <h2>Project Team</h2>
                <p>Developed with passion by the BudgetBasics student project team. Built strictly following web engineering best practices with HTML5, CSS3, and JavaScript.</p>
              </article>

              <article className="card padded">
                <span className="icon-tile peach"><i className="icon fa-solid fa-shield-halved" aria-hidden="true"></i></span>
                <h2>Data &amp; Privacy</h2>
                <p>BudgetBasics is client-side only. We do not connect to bank accounts, request credentials, or transmit your numbers anywhere. Your data remains on your device.</p>
              </article>
            </div>
          </section>


          {/*  Contact Us  */}
          <section id="contact" className="page" hidden>
            <div className="page-heading">
              <div>
                <div className="eyebrow">CONTACT US · STUDENT SUPPORT &amp; FEEDBACK</div>
                <h1>Reach the BudgetBasics project team.</h1>
                <p>Have questions about budgeting, suggestions for new features, or student queries? We would love to hear from you.</p>
              </div>
              <span className="page-symbol"><i className="icon fa-solid fa-envelope" aria-hidden="true"></i></span>
            </div>

            <div className="contact-grid">
              {/*  Box 1: Contact Form with Validation  */}
              <article className="card padded contact-form-card">
                <div className="card-heading-compact">
                  <div>
                    <h2>Send a message</h2>
                    <p className="muted">Fill out the form below. Client-side validation ensures all fields are complete.</p>
                  </div>
                  <span className="badge gold-badge"><i className="icon fa-solid fa-paper-plane" aria-hidden="true"></i> Direct</span>
                </div>

                <form id="contact-form" className="stacked-form" noValidate>
                  <div className="form-group">
                    <label htmlFor="contact-name">Your Full Name <span className="required-star">*</span></label>
                    <input id="contact-name" type="text" maxLength="60" required={true} placeholder="e.g. Ayesha Khan" />
                    <span className="field-error-msg" id="contact-name-error" aria-live="polite"></span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-email">Email Address <span className="required-star">*</span></label>
                    <input id="contact-email" type="email" maxLength="120" required={true} placeholder="name@student.edu.pk" />
                    <span className="field-error-msg" id="contact-email-error" aria-live="polite"></span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-subject">Topic / Subject <span className="required-star">*</span></label>
                    <select id="contact-subject" required>
                      <option defaultValue="">Choose a topic...</option>
                      <option defaultValue="Budgeting Advice">Student Budgeting Advice</option>
                      <option defaultValue="Expense Planner Feedback">Expense Planner Feedback</option>
                      <option defaultValue="Learning Resources">Learning Resources Request</option>
                      <option defaultValue="Bug Report">Website or Calculator Bug</option>
                      <option defaultValue="General Query">General Project Query</option>
                    </select>
                    <span className="field-error-msg" id="contact-subject-error" aria-live="polite"></span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-message">Message <span className="required-star">*</span></label>
                    <textarea id="contact-message" rows="4" maxLength="500" required={true} placeholder="How can the BudgetBasics team assist you today?"></textarea>
                    <span className="field-error-msg" id="contact-message-error" aria-live="polite"></span>
                  </div>

                  <button className="button primary" id="contact-submit-btn" type="submit">
                    <span>Send message</span>
                    <i className="icon fa-solid fa-paper-plane" aria-hidden="true"></i>
                  </button>
                  <p id="contact-result" className="result-text" role="status"></p>
                </form>
              </article>

              {/*  Box 2: Project Contact Info + Responsive Map  */}
              <article className="card padded contact-info-card">
                <div className="card-heading-compact">
                  <div>
                    <h2>Project contact &amp; campus hub</h2>
                    <p className="muted">Find our student support team online or visit our demo learning hub.</p>
                  </div>
                  <span className="badge purple"><i className="icon fa-solid fa-location-dot" aria-hidden="true"></i> Campus Hub</span>
                </div>

                <div className="contact-details-list">
                  <div className="contact-item">
                    <span className="icon-tile green"><i className="icon fa-solid fa-envelope" aria-hidden="true"></i></span>
                    <div>
                      <strong>Email Support</strong>
                      <a className="contact-detail-link" href="mailto:support@budgetbasics.pk">support@budgetbasics.pk</a>
                    </div>
                  </div>

                  <div className="contact-item">
                    <span className="icon-tile peach"><i className="icon fa-solid fa-phone" aria-hidden="true"></i></span>
                    <div>
                      <strong>Student Helpline</strong>
                      <a className="contact-detail-link" href="tel:+923001234567">+92 300 1234567 <small>(Mon–Fri 9am–5pm)</small></a>
                    </div>
                  </div>

                  <div className="contact-item">
                    <span className="icon-tile purple"><i className="icon fa-solid fa-building-columns" aria-hidden="true"></i></span>
                    <div>
                      <strong>Student Learning Center</strong>
                      <span>Academic Block 3, University Town, Lahore, Pakistan</span>
                    </div>
                  </div>
                </div>

                {/*  Responsive Embedded Map  */}
                <div className="contact-map-wrapper">
                  <div className="map-label-bar">
                    <span><i className="icon fa-solid fa-map-location-dot" aria-hidden="true"></i> Campus Map Location</span>
                    <span className="map-status-pill">Interactive</span>
                  </div>
                  <div className="map-embed-container">
                    <iframe
                      id="campus-map-iframe"
                      title="BudgetBasics Student Learning Hub Location"
                      src="https://www.openstreetmap.org/export/embed.html?bbox=74.2800%2C31.4600%2C74.3400%2C31.5100&amp;layer=mapnik&amp;marker=31.4850%2C74.3100"
                      loading="lazy"
                      aria-label="Map showing BudgetBasics Campus Center"
                    ></iframe>
                  </div>
                  <div className="map-caption">
                    <small><i className="icon fa-solid fa-circle-info" aria-hidden="true"></i> Open to registered students and study groups.</small>
                  </div>
                </div>

                <div className="contact-socials-wrapper">
                  <span className="socials-label">Connect with our community:</span>
                  <div className="contact-socials">
                    <a href="https://www.instagram.com/" target="_blank" rel="noopener" aria-label="Instagram (external link)"><i className="icon fa-brands fa-instagram" aria-hidden="true"></i></a>
                    <a href="https://www.facebook.com/" target="_blank" rel="noopener" aria-label="Facebook (external link)"><i className="icon fa-brands fa-facebook-f" aria-hidden="true"></i></a>
                    <a href="https://www.linkedin.com/" target="_blank" rel="noopener" aria-label="LinkedIn (external link)"><i className="icon fa-brands fa-linkedin-in" aria-hidden="true"></i></a>
                    <a href="https://github.com/" target="_blank" rel="noopener" aria-label="GitHub Repository (external link)"><i className="icon fa-brands fa-github" aria-hidden="true"></i></a>
                  </div>
                </div>
              </article>
            </div>
          </section>


          {/*  Sitemap  */}
          <section id="sitemap" className="page" hidden>
            <div className="page-heading">
              <div>
                <div className="eyebrow">SITEMAP</div>
                <h1>BudgetBasics at a glance.</h1>
                <p>All major learning and project sections in one place.</p>
              </div>
              <span className="page-symbol"><i className="icon fa-solid fa-sitemap" aria-hidden="true"></i></span>
            </div>
            <div className="sitemap-grid">
              <article className="card padded">
                <span className="icon-tile purple"><i className="icon fa-solid fa-book-open"></i></span>
                <h2>Learn</h2>
                <a href="#overview">Overview <i className="icon fa-solid fa-arrow-right"></i></a>
                <a href="#basics">Budgeting basics <i className="icon fa-solid fa-arrow-right"></i></a>
                <a href="#needs">Needs vs. wants <i className="icon fa-solid fa-arrow-right"></i></a>
                <a href="#calculator">50–30–20 calculator <i className="icon fa-solid fa-arrow-right"></i></a>
                <a href="#savings">Savings goals <i className="icon fa-solid fa-arrow-right"></i></a>
                <a href="#expenses">Expense planner <i className="icon fa-solid fa-arrow-right"></i></a>
              </article>
              <article className="card padded">
                <span className="icon-tile green"><i className="icon fa-solid fa-lightbulb"></i></span>
                <h2>Discover</h2>
                <a href="#learn">Money smarts <i className="icon fa-solid fa-arrow-right"></i></a>
                <a href="#mistakes">Money mistakes <i className="icon fa-solid fa-arrow-right"></i></a>
                <a href="#infographics">Infographics <i className="icon fa-solid fa-arrow-right"></i></a>
                <a href="#games">Budgeting games <i className="icon fa-solid fa-arrow-right"></i></a>
                <button type="button" className="sitemap-action" data-open-chat><i className="icon fa-solid fa-robot"></i> Ask BudgetBuddy</button>
              </article>
              <article className="card padded">
                <span className="icon-tile peach"><i className="icon fa-solid fa-address-card"></i></span>
                <h2>Project</h2>
                <a href="#about">About us <i className="icon fa-solid fa-arrow-right"></i></a>
                <a href="#feedback">Feedback <i className="icon fa-solid fa-arrow-right"></i></a>
                <a href="#contact">Contact us <i className="icon fa-solid fa-arrow-right"></i></a>
                <a href="#sitemap">Sitemap <i className="icon fa-solid fa-arrow-right"></i></a>
              </article>
            </div>
          </section>


          {/*  Footer  */}
          <footer className="footer">

            <span>
              <span className="footer-flower">✳</span>
              Made for students.
            </span>

            <span>
              Learn. Plan. Grow.
              <span className="footer-divider">|</span>

              <span id="visit-count">1</span>
              visits on this device

              <span className="footer-divider">|</span>

              <time id="live-clock"></time>
            </span>

            <div className="footer-nav" aria-label="Footer navigation">
              <a href="#about">About</a>
              <a href="#feedback">Feedback</a>
              <a href="#contact">Contact</a>
              <a href="#sitemap">Sitemap</a>
            </div>

            <small>
              Educational tools only. Not financial advice.
              All amounts are in PKR.
            </small>

          </footer>

        </main>

      </div>


      {/*  Chat launcher  */}
      <button
        className="chat-launcher"
        id="chat-launcher"
        type="button"
        data-open-chat
      >
        <i className="icon fa-solid fa-message" aria-hidden="true"></i>
        <span>Need help?</span>
        <span className="chat-status"></span>
      </button>


      {/*  BudgetBuddy chat  */}
      <aside
        id="chat-panel"
        className="chat-panel"
        aria-label="BudgetBuddy chat"
        hidden
      >

        <div className="chat-header">

          <span className="icon-tile">
            <i className="icon fa-solid fa-robot" aria-hidden="true"></i>
          </span>

          <div>
            <strong>BudgetBuddy</strong>
            <small>Budgeting learning assistant</small>
          </div>

          <button
            className="icon-button"
            id="close-chat"
            type="button"
            aria-label="Close chat"
          >
            <i className="icon fa-solid fa-xmark" aria-hidden="true"></i>
          </button>

        </div>


        <div
          id="chat-messages"
          className="chat-messages"
          role="log"
          aria-live="polite"
        >
          <p className="bot-message">
            Hi! 👋 I'm <strong>BudgetBuddy</strong>, your personal finance and student budgeting assistant.
            Pick a suggested question below or ask me anything about your money, expenses, and savings!
          </p>

          {/*  Suggested questions inside the chatbox initial area  */}
          <div id="chat-suggestions-box" className="chat-suggestions-box">
            <div className="chat-suggestions-header">
              <i className="icon fa-solid fa-lightbulb" aria-hidden="true"></i>
              <span>Suggested Questions</span>
            </div>
            <div className="chat-suggestions-grid">
              <button type="button" className="chat-preset-btn" data-chat-question="How can I create a monthly budget?">
                <span>How can I create a monthly budget?</span>
                <i className="icon fa-solid fa-arrow-right" aria-hidden="true"></i>
              </button>
              <button type="button" className="chat-preset-btn" data-chat-question="How can I save money as a student?">
                <span>How can I save money as a student?</span>
                <i className="icon fa-solid fa-arrow-right" aria-hidden="true"></i>
              </button>
              <button type="button" className="chat-preset-btn" data-chat-question="What is the 50/30/20 budgeting rule?">
                <span>What is the 50/30/20 budgeting rule?</span>
                <i className="icon fa-solid fa-arrow-right" aria-hidden="true"></i>
              </button>
              <button type="button" className="chat-preset-btn" data-chat-question="How can I reduce unnecessary expenses?">
                <span>How can I reduce unnecessary expenses?</span>
                <i className="icon fa-solid fa-arrow-right" aria-hidden="true"></i>
              </button>
              <button type="button" className="chat-preset-btn" data-chat-question="How much should I save every month?">
                <span>How much should I save every month?</span>
                <i className="icon fa-solid fa-arrow-right" aria-hidden="true"></i>
              </button>
              <button type="button" className="chat-preset-btn" data-chat-question="How can I track my spending?">
                <span>How can I track my spending?</span>
                <i className="icon fa-solid fa-arrow-right" aria-hidden="true"></i>
              </button>
              <button type="button" className="chat-preset-btn" data-chat-question="What is an emergency fund?">
                <span>What is an emergency fund?</span>
                <i className="icon fa-solid fa-arrow-right" aria-hidden="true"></i>
              </button>
              <button type="button" className="chat-preset-btn" data-chat-question="How can I control my monthly expenses?">
                <span>How can I control my monthly expenses?</span>
                <i className="icon fa-solid fa-arrow-right" aria-hidden="true"></i>
              </button>
              <button type="button" className="chat-preset-btn" data-chat-question="How can I manage my income better?">
                <span>How can I manage my income better?</span>
                <i className="icon fa-solid fa-arrow-right" aria-hidden="true"></i>
              </button>
              <button type="button" className="chat-preset-btn" data-chat-question="How can I start budgeting as a beginner?">
                <span>How can I start budgeting as a beginner?</span>
                <i className="icon fa-solid fa-arrow-right" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>


        <form id="chat-form">

          <input
            id="chat-input"
            type="text"
            maxLength="400"
            placeholder="Ask a money question..."
            aria-label="Your question"
            required
          />

          <button
            className="icon-button"
            type="submit"
            aria-label="Send question"
          >
            <i className="icon fa-solid fa-paper-plane" aria-hidden="true"></i>
          </button>

        </form>


        <p className="chat-disclaimer">
          Educational assistance only. Don't enter banking or confidential credentials.
        </p>

      </aside>


      {/*  Left-side Purple + Gold success toast notification  */}
      <aside id="left-toast" className="left-toast" role="status" aria-live="polite" aria-hidden="true">
        <div className="left-toast-icon">
          <i className="icon fa-solid fa-circle-check" aria-hidden="true"></i>
        </div>
        <div className="left-toast-body">
          <strong id="left-toast-title">Success</strong>
          <p id="left-toast-message">Your submission was successful.</p>
        </div>
        <button type="button" className="left-toast-close" id="left-toast-close" aria-label="Dismiss notification">
          <i className="icon fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </aside>


      {/*  Legacy Toast  */}
      <div
        id="toast"
        className="toast"
        role="status"
        hidden
      ></div>



    </>
  );
}

export default MyCoolAppReactVite;
