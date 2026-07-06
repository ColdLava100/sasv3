document.addEventListener('DOMContentLoaded', function() {
  renderStats();
  document.getElementById('clear-history-btn').addEventListener('click', function() {
    if (confirm('Clear all quiz history? This cannot be undone.')) {
      QuizTracker.clearHistory();
      renderStats();
    }
  });
});

function renderStats() {
  var stats = QuizTracker.getStats();
  var container = document.getElementById('stats-container');

  if (stats.totalSessions === 0) {
    container.innerHTML = '<div class="empty-state"><p style="color:var(--text2);text-align:center;padding:40px;">No quiz history yet. Complete a quiz to see your results here!</p></div>';
    return;
  }

  var html = '';

  // Summary cards
  html += '<div class="stat-cards">';
  html += statCard('Total Sessions', stats.totalSessions, '#74b9ff');
  html += statCard('Questions Answered', stats.totalQuestions, '#55efc4');
  html += statCard('Correct Answers', stats.totalCorrect, '#ffd93d');
  html += statCard('Overall Accuracy', stats.overallPercentage + '%', accuracyColor(stats.overallPercentage));
  html += '</div>';

  // Per-topic breakdown
  if (stats.topics.length > 0) {
    html += '<h3 style="margin-top:24px;">Per-Topic Breakdown</h3>';
    html += '<table class="data-table" style="margin-top:8px;">';
    html += '<tr><th>Topic</th><th>Attempts</th><th>Correct</th><th>Total</th><th>Accuracy</th></tr>';
    stats.topics.forEach(function(t) {
      html += '<tr>';
      html += '<td style="text-transform:capitalize;">' + t.topic.replace(/-/g, ' ') + '</td>';
      html += '<td>' + t.attempts + '</td>';
      html += '<td>' + t.correct + '</td>';
      html += '<td>' + t.total + '</td>';
      html += '<td style="color:' + accuracyColor(t.percentage) + ';font-weight:700;">' + t.percentage + '%</td>';
      html += '</tr>';
    });
    html += '</table>';
  }

  // Recent sessions
  if (stats.recentSessions.length > 0) {
    html += '<h3 style="margin-top:24px;">Recent Sessions</h3>';
    stats.recentSessions.forEach(function(s) {
      var date = new Date(s.date);
      var dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
      var color = accuracyColor(s.percentage);
      html += '<div class="session-card" onclick="toggleSession(\'' + s.sessionId + '\')">';
      html += '<div class="session-summary">';
      html += '<span class="session-topic">' + s.topic.replace(/-/g, ' ') + ' (' + s.level + ')</span>';
      html += '<span class="session-date">' + dateStr + '</span>';
      html += '<span class="session-score" style="color:' + color + ';">' + s.correct + '/' + s.total + ' (' + s.percentage + '%)</span>';
      html += '<span class="session-toggle">▶</span>';
      html += '</div>';
      html += '<div class="session-detail" id="detail-' + s.sessionId + '" style="display:none;">';
      html += '<table class="data-table" style="margin:4px 0;">';
      html += '<tr><th>#</th><th>Question</th><th>Your Answer</th><th>Correct Answer</th><th>Result</th></tr>';
      s.questions.forEach(function(q, i) {
        html += '<tr>';
        html += '<td>' + (i + 1) + '</td>';
        html += '<td style="text-align:left;font-size:0.78rem;">' + q.text.substring(0, 60) + (q.text.length > 60 ? '...' : '') + '</td>';
        html += '<td>' + q.selected + '</td>';
        html += '<td>' + (q.correctAnswer || (q.correct ? q.selected : '')) + '</td>';
        html += '<td>' + (q.correct ? '✅' : '❌') + '</td>';
        html += '</tr>';
      });
      html += '</table>';
      html += '</div>';
      html += '</div>';
    });
  }

  container.innerHTML = html;
}

function statCard(label, value, color) {
  return '<div class="stat-card"><div class="stat-value" style="color:' + color + ';">' + value + '</div><div class="stat-label">' + label + '</div></div>';
}

function accuracyColor(pct) {
  if (pct >= 70) return '#55efc4';
  if (pct >= 40) return '#ffd93d';
  return '#ff6b6b';
}

function toggleSession(id) {
  var detail = document.getElementById('detail-' + id);
  if (!detail) return;
  var isOpen = detail.style.display !== 'none';
  detail.style.display = isOpen ? 'none' : 'block';
  var toggle = detail.closest('.session-card').querySelector('.session-toggle');
  if (toggle) toggle.textContent = isOpen ? '▶' : '▼';
}
