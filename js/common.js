document.addEventListener('DOMContentLoaded', function() {
  // Quiz button handler
  document.querySelectorAll('.quiz-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var answerId = this.getAttribute('data-answer');
      var answer = document.getElementById(answerId);
      if (!answer) return;
      var parent = this.closest('.quiz-q');
      parent.querySelectorAll('.quiz-answer').forEach(function(a) { a.classList.remove('show'); });
      answer.classList.toggle('show');
    });
  });

  // Fix Plotly charts in accordion: relayout when section opens
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
