var QuizTracker = {
  STORAGE_KEY: 'sasv3_quiz_history',

  getSessions: function() {
    try {
      var data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch(e) { return []; }
  },

  saveSessions: function(sessions) {
    try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions)); } catch(e) {}
  },

  recordSession: function(topic, level, questions, correct, total) {
    var sessions = this.getSessions();
    sessions.push({
      sessionId: 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      date: new Date().toISOString(),
      topic: topic,
      level: level,
      total: total,
      correct: correct,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
      questions: questions
    });
    this.saveSessions(sessions);
  },

  getStats: function() {
    var sessions = this.getSessions();
    var totalSessions = sessions.length;
    var totalQuestions = 0;
    var totalCorrect = 0;
    var topicStats = {};

    sessions.forEach(function(s) {
      totalQuestions += s.total;
      totalCorrect += s.correct;
      if (!topicStats[s.topic]) {
        topicStats[s.topic] = { attempts: 0, correct: 0, total: 0 };
      }
      topicStats[s.topic].attempts++;
      topicStats[s.topic].correct += s.correct;
      topicStats[s.topic].total += s.total;
    });

    var topics = [];
    for (var name in topicStats) {
      var t = topicStats[name];
      topics.push({
        topic: name,
        attempts: t.attempts,
        correct: t.correct,
        total: t.total,
        percentage: t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0
      });
    }
    topics.sort(function(a, b) { return b.percentage - a.percentage; });

    return {
      totalSessions: totalSessions,
      totalQuestions: totalQuestions,
      totalCorrect: totalCorrect,
      overallPercentage: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
      topics: topics,
      recentSessions: sessions.slice(-20).reverse()
    };
  },

  clearHistory: function() {
    this.saveSessions([]);
  }
};
