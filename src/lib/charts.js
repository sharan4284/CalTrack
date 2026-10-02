// CalTrack — Interactive Chart.js Visualizer
// High-fidelity fitness analytics: Weight trend, Calorie history, Macro split, Activity

import Chart from 'chart.js/auto';

const activeCharts = new Map();

function destroyChart(canvasId) {
  if (activeCharts.has(canvasId)) {
    activeCharts.get(canvasId).destroy();
    activeCharts.delete(canvasId);
  }
}

// ─── 1. Weight Trend Chart ───
export function renderWeightChart(canvasId, weightLogs, targetWeight = null) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  destroyChart(canvasId);

  const ctx = canvas.getContext('2d');
  const isDark = document.documentElement.dataset.theme !== 'light';

  // Prepare data sorted by date
  const sorted = [...weightLogs].sort((a, b) => a.date.localeCompare(b.date));
  const labels = sorted.map(d => {
    const parts = d.date.split('-');
    return `${parts[1]}/${parts[2]}`;
  });
  const data = sorted.map(d => Number(d.weight));

  // Gradient fill
  const gradient = ctx.createLinearGradient(0, 0, 0, 260);
  gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
  gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

  const datasets = [
    {
      label: 'Weight (kg)',
      data: data,
      borderColor: '#10b981',
      borderWidth: 3,
      backgroundColor: gradient,
      fill: true,
      tension: 0.35,
      pointBackgroundColor: '#10b981',
      pointBorderColor: isDark ? '#070a08' : '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }
  ];

  if (targetWeight && data.length > 0) {
    datasets.push({
      label: 'Target Weight',
      data: new Array(data.length).fill(targetWeight),
      borderColor: '#3b82f6',
      borderWidth: 2,
      borderDash: [6, 6],
      pointRadius: 0,
      fill: false
    });
  }

  const chart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: isDark ? '#94a398' : '#2f533c', font: { family: 'Inter', size: 11 } }
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(18, 26, 21, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: isDark ? '#f0fdf4' : '#081a10',
          bodyColor: isDark ? '#94a398' : '#2f533c',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} kg`
          }
        }
      },
      scales: {
        x: {
          grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
          ticks: { color: isDark ? '#526659' : '#6b8a76', font: { size: 10 } }
        },
        y: {
          grid: { color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
          ticks: { color: isDark ? '#526659' : '#6b8a76', font: { size: 10 } }
        }
      }
    }
  });

  activeCharts.set(canvasId, chart);
  return chart;
}

// ─── 2. Calorie History Bar Chart ───
export function renderCalorieChart(canvasId, dailySummaries, targetCalories = 2200) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  destroyChart(canvasId);

  const ctx = canvas.getContext('2d');
  const isDark = document.documentElement.dataset.theme !== 'light';

  const labels = dailySummaries.map(d => {
    const parts = d.date.split('-');
    return `${parts[1]}/${parts[2]}`;
  });
  const calories = dailySummaries.map(d => d.calories || 0);

  const backgroundColors = calories.map(c => {
    if (c === 0) return isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    if (c > targetCalories + 200) return 'rgba(239, 68, 68, 0.75)'; // over
    return 'rgba(16, 185, 129, 0.75)'; // within target
  });

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Calories Consumed',
          data: calories,
          backgroundColor: backgroundColors,
          borderRadius: 6,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? 'rgba(18, 26, 21, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: isDark ? '#f0fdf4' : '#081a10',
          bodyColor: isDark ? '#94a398' : '#2f533c',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: (ctx) => `${ctx.parsed.y} kcal (Target: ${targetCalories})`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: isDark ? '#526659' : '#6b8a76', font: { size: 10 } }
        },
        y: {
          grid: { color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
          ticks: { color: isDark ? '#526659' : '#6b8a76', font: { size: 10 } }
        }
      }
    }
  });

  activeCharts.set(canvasId, chart);
  return chart;
}

// ─── 3. Macronutrient Doughnut ───
export function renderMacroDoughnut(canvasId, totals) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  destroyChart(canvasId);

  const ctx = canvas.getContext('2d');
  const isDark = document.documentElement.dataset.theme !== 'light';

  const protCals = (totals.protein || 0) * 4;
  const carbsCals = (totals.carbs || 0) * 4;
  const fatCals = (totals.fat || 0) * 9;
  const totalCal = protCals + carbsCals + fatCals;

  const data = totalCal > 0 ? [protCals, carbsCals, fatCals] : [1, 1, 1];
  const colors = totalCal > 0
    ? ['#3b82f6', '#f97316', '#ec4899']
    : [isDark ? '#1a271f' : '#e2e8f0', isDark ? '#1a271f' : '#e2e8f0', isDark ? '#1a271f' : '#e2e8f0'];

  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Protein (kcal)', 'Carbs (kcal)', 'Fat (kcal)'],
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: isDark ? '#94a398' : '#2f533c', font: { family: 'Inter', size: 11 }, padding: 12 }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              if (totalCal === 0) return 'No macros logged today';
              const val = ctx.parsed;
              const pct = Math.round((val / totalCal) * 100);
              return `${ctx.label}: ${val} kcal (${pct}%)`;
            }
          }
        }
      }
    }
  });

  activeCharts.set(canvasId, chart);
  return chart;
}

// ─── 4. Steps & Activity Chart ───
export function renderStepsChart(canvasId, stepLogs, stepGoal = 10000) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  destroyChart(canvasId);

  const ctx = canvas.getContext('2d');
  const isDark = document.documentElement.dataset.theme !== 'light';

  const labels = stepLogs.map(s => {
    const parts = s.date.split('-');
    return `${parts[1]}/${parts[2]}`;
  });
  const steps = stepLogs.map(s => s.steps || 0);

  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Steps',
          data: steps,
          backgroundColor: steps.map(v => v >= stepGoal ? '#06b6d4' : 'rgba(6, 182, 212, 0.4)'),
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: isDark ? '#526659' : '#6b8a76', font: { size: 10 } }
        },
        y: {
          grid: { color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
          ticks: { color: isDark ? '#526659' : '#6b8a76', font: { size: 10 } }
        }
      }
    }
  });

  activeCharts.set(canvasId, chart);
  return chart;
}
