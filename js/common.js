document.addEventListener('DOMContentLoaded', function() {
  setupQuizCards();
  setupQuizSelection();
  addHistoryLink();

  // Quiz button selection (radio-style)
  function setupQuizSelection() {
    document.addEventListener('click', function(e) {
      var btn = e.target.closest('.quiz-btn');
      if (!btn) return;
      var q = btn.closest('.quiz-q');
      if (!q || q.classList.contains('submitted')) return;
      q.querySelectorAll('.quiz-btn').forEach(function(b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
    });
  }

  function setupQuizCards() {
    document.querySelectorAll('.quiz-card').forEach(function(card) {
      if (card.querySelector('.quiz-actions')) return;
      var actions = document.createElement('div');
      actions.className = 'quiz-actions';

      var submitBtn = document.createElement('button');
      submitBtn.className = 'quiz-submit-btn';
      submitBtn.textContent = '📝 Check Answers';

      var scoreDiv = document.createElement('div');
      scoreDiv.className = 'quiz-score';
      scoreDiv.style.display = 'none';

      actions.appendChild(submitBtn);
      actions.appendChild(scoreDiv);

      var backDiv = card.querySelector('div:last-child a[href*="../topics/"]');
      if (backDiv) {
        backDiv.closest('div').parentNode.insertBefore(actions, backDiv.closest('div'));
      } else {
        card.appendChild(actions);
      }

      submitBtn.addEventListener('click', function() {
        if (submitBtn.dataset.mode === 'reset') {
          resetQuiz(card, submitBtn, scoreDiv);
          return;
        }
        submitQuiz(card, submitBtn, scoreDiv);
      });
    });
  }

  function submitQuiz(card, btn, scoreDiv) {
    var questions = card.querySelectorAll('.quiz-q');
    var unanswered = [];

    questions.forEach(function(q, i) {
      if (!q.querySelector('.quiz-btn.selected')) unanswered.push(i + 1);
    });

    if (unanswered.length > 0) {
      alert('Please answer all questions before submitting.\nUnanswered: Q' + unanswered.join(', Q'));
      return;
    }

    var correct = 0;
    var total = questions.length;
    var sessionQuestions = [];
    var topic = extractTopic(card);
    var level = extractLevel(card);

    questions.forEach(function(q) {
      q.classList.add('submitted');
      var selected = q.querySelector('.quiz-btn.selected');
      var selectedText = selected ? selected.textContent.trim() : '';
      var wasCorrect = selected && selected.hasAttribute('data-correct');
      var answerId = selected ? selected.getAttribute('data-answer') : '';

      q.querySelectorAll('.quiz-btn').forEach(function(b) {
        b.disabled = true;
        if (b.hasAttribute('data-correct')) {
          b.classList.add('correct');
          if (b === selected) b.classList.add('selected-correct');
        }
        if (b === selected && !wasCorrect) {
          b.classList.add('wrong');
        }
      });

      if (answerId) {
        var answer = document.getElementById(answerId);
        if (answer) answer.classList.add('show');
      }

      if (wasCorrect) correct++;
      var qText = q.querySelector('p') ? q.querySelector('p').textContent.trim() : '';
      sessionQuestions.push({
        qId: answerId,
        text: qText,
        selected: selectedText,
        correct: !!wasCorrect
      });
    });

    var pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    scoreDiv.style.display = 'block';
    scoreDiv.className = 'quiz-score ' + (pct >= 70 ? 'score-good' : (pct >= 40 ? 'score-ok' : 'score-bad'));
    scoreDiv.textContent = 'Score: ' + correct + '/' + total + ' (' + pct + '%)';

    btn.textContent = '🔄 Reset Quiz';
    btn.dataset.mode = 'reset';

    QuizTracker.recordSession(topic, level, sessionQuestions, correct, total);
  }

  function resetQuiz(card, btn, scoreDiv) {
    card.querySelectorAll('.quiz-q').forEach(function(q) {
      q.classList.remove('submitted');
      q.querySelectorAll('.quiz-btn').forEach(function(b) {
        b.disabled = false;
        b.classList.remove('selected', 'correct', 'wrong', 'selected-correct');
      });
      var answer = q.querySelector('.quiz-answer');
      if (answer) answer.classList.remove('show');
    });
    scoreDiv.style.display = 'none';
    btn.textContent = '📝 Check Answers';
    btn.dataset.mode = '';
  }

  function extractTopic(card) {
    var id = card.getAttribute('id') || '';
    var match = id.match(/^quiz-(.+?)-\w+$/);
    if (match) return match[1];
    match = id.match(/^quiz-(.+)$/);
    if (match) return match[1];
    var h3 = card.querySelector('h3');
    if (h3) return h3.textContent.replace(/[^a-zA-Z\s]/g, '').trim();
    return 'unknown';
  }

  function extractLevel(card) {
    var id = card.getAttribute('id') || '';
    var match = id.match(/-(\w+)$/);
    if (match) {
      var lvl = match[1];
      if (lvl === 'basic' || lvl === 'advanced') return lvl;
    }
    return 'general';
  }

  function addHistoryLink() {
    var nav = document.querySelector('.nav-bar');
    if (!nav || nav.querySelector('.nav-history-link')) return;
    var link = document.createElement('a');
    link.href = 'history.html';
    link.className = 'nav-btn nav-history-link';
    link.textContent = '📊 History';
    var indexLink = nav.querySelector('a[href*="index.html"]');
    if (indexLink && indexLink.parentNode === nav) {
      nav.insertBefore(link, indexLink.nextSibling);
    } else {
      nav.appendChild(link);
    }
  }

  // Fix Plotly charts in accordion (unchanged)
  document.querySelectorAll('.topic').forEach(function(topic) {
    topic.addEventListener('toggle', function() {
      if (this.open) {
        var plotDivs = this.querySelectorAll('[id^="chart-"], [id^="scatter-"], [id^="bubble-"]');
        plotDivs.forEach(function(div) {
          if (div.data && div.layout) {
            Plotly.relayout(div, {width: div.clientWidth, height: div.clientHeight});
          }
        });
      }
    });
  });
});
