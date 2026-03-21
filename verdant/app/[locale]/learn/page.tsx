"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { BookOpen, CheckCircle, ChevronDown, ChevronUp, Award, Trophy, Clock } from "lucide-react";
import {
  MULTILINGUAL_LESSONS,
  MultilingualLesson,
  getText,
  resolveLocale,
  getLocalizedText,
} from "@/lib/i18n-content";

interface QuizState {
  answers: (number | null)[];
  submitted: boolean;
}

const STORAGE_KEY = "verdant_learn_progress";

function loadProgress(): Record<string, { completed: boolean; score: number }> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress: Record<string, { completed: boolean; score: number }>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {}
}

export default function LearnPage() {
  const params = useParams();
  const locale = resolveLocale(params?.locale as string);

  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [quizStates, setQuizStates] = useState<Record<string, QuizState>>({});
  const [progress, setProgress] = useState<Record<string, { completed: boolean; score: number }>>({});

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  function toggleLesson(id: string) {
    setExpandedLesson(prev => prev === id ? null : id);
    if (!quizStates[id]) {
      const lesson = MULTILINGUAL_LESSONS.find(l => l.id === id)!;
      setQuizStates(prev => ({
        ...prev,
        [id]: { answers: Array(lesson.quiz.length).fill(null), submitted: false },
      }));
    }
  }

  function selectAnswer(lessonId: string, qIdx: number, aIdx: number) {
    if (quizStates[lessonId]?.submitted) return;
    setQuizStates(prev => ({
      ...prev,
      [lessonId]: {
        ...prev[lessonId],
        answers: prev[lessonId].answers.map((a, i) => i === qIdx ? aIdx : a),
      },
    }));
  }

  function submitQuiz(lesson: MultilingualLesson) {
    const state = quizStates[lesson.id];
    if (!state || state.answers.some(a => a === null)) return;
    const correct = state.answers.filter((a, i) => a === lesson.quiz[i].correct).length;
    const score = Math.round((correct / lesson.quiz.length) * 100);
    setQuizStates(prev => ({ ...prev, [lesson.id]: { ...prev[lesson.id], submitted: true } }));
    const newProgress = { ...progress, [lesson.id]: { completed: true, score } };
    setProgress(newProgress);
    saveProgress(newProgress);
  }

  const completedCount = Object.values(progress).filter(p => p.completed).length;
  const totalLessons = MULTILINGUAL_LESSONS.length;
  const overallScore = completedCount > 0
    ? Math.round(Object.values(progress).filter(p => p.completed).reduce((s, p) => s + p.score, 0) / completedCount)
    : 0;

  // Localized UI labels
  const t = {
    hub_title: getLocalizedText("quiz_label_correct", locale) === "quiz_label_correct"
      ? { en: "Financial Literacy Hub", es: "Centro de Educación Financiera", fr: "Centre de Littératie Financière" }[locale]
      : undefined,
    hub_subtitle: { en: "5 lessons to transform how you think about money. Quiz yourself to lock in the knowledge.", es: "5 lecciones para transformar tu relación con el dinero. Haz los cuestionarios para fijar los conocimientos.", fr: "5 leçons pour transformer votre façon de penser l'argent. Testez-vous pour consolider vos connaissances." }[locale],
    your_progress: { en: "Your progress", es: "Tu progreso", fr: "Votre progression" }[locale],
    complete: { en: "complete", es: "completas", fr: "terminées" }[locale],
    all_complete: { en: "All lessons complete! Avg score:", es: "¡Todas las lecciones completadas! Puntuación media:", fr: "Toutes les leçons terminées ! Score moyen :" }[locale],
    quick_quiz: { en: "Quick Quiz", es: "Cuestionario rápido", fr: "Quiz rapide" }[locale],
    questions: { en: "questions", es: "preguntas", fr: "questions" }[locale],
    submit_quiz: { en: "Submit Quiz", es: "Enviar cuestionario", fr: "Soumettre le quiz" }[locale],
    correct_label: { en: "Correct!", es: "¡Correcto!", fr: "Correct !" }[locale],
    incorrect_label: { en: "Not quite.", es: "No exactamente.", fr: "Pas tout à fait." }[locale],
    score_label: { en: "Score:", es: "Puntuación:", fr: "Score :" }[locale],
    perfect: { en: "— Perfect! 🎉", es: "— ¡Perfecto! 🎉", fr: "— Parfait ! 🎉" }[locale],
    keep_learning: { en: "— Keep learning!", es: "— ¡Sigue aprendiendo!", fr: "— Continuez à apprendre !" }[locale],
    footer_cta: { en: "Put your knowledge to work — see how every purchase affects your goals.", es: "Pon tus conocimientos en práctica — mira cómo cada compra afecta a tus objetivos.", fr: "Mettez vos connaissances en pratique — voyez comment chaque achat affecte vos objectifs." }[locale],
    view_dashboard: { en: "View my dashboard →", es: "Ver mi panel →", fr: "Voir mon tableau de bord →" }[locale],
  };

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 max-w-3xl" style={{ paddingTop: "6rem", paddingBottom: "4rem" }}>

        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "var(--color-accent-subtle)", border: "1px solid var(--color-accent-dim)" }}
          >
            <BookOpen size={24} style={{ color: "var(--color-accent)" }} aria-hidden />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
            {t.hub_title ?? "Financial Literacy Hub"}
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
            {t.hub_subtitle}
          </p>

          {/* Progress bar */}
          {completedCount > 0 && (
            <div className="card p-4 max-w-sm mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {t.your_progress}
                </span>
                <span className="text-xs font-bold" style={{ color: "var(--color-accent)" }}>
                  {completedCount}/{totalLessons} {t.complete}
                </span>
              </div>
              <div className="progress-track mb-2">
                <div className="progress-fill" style={{ width: `${(completedCount / totalLessons) * 100}%` }} />
              </div>
              {completedCount === totalLessons && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Trophy size={16} style={{ color: "#f59e0b" }} aria-hidden />
                  <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    {t.all_complete} {overallScore}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lesson list */}
        <div className="flex flex-col gap-4">
          {MULTILINGUAL_LESSONS.map((lesson) => {
            const isOpen = expandedLesson === lesson.id;
            const lessonProgress = progress[lesson.id];
            const quizState = quizStates[lesson.id];
            const lessonTitle = getText(lesson.title, locale);
            const lessonDescription = getText(lesson.description, locale);

            return (
              <div
                key={lesson.id}
                className="card"
                style={{
                  overflow: "hidden",
                  borderColor: isOpen ? lesson.color + "40" : undefined,
                  transition: "border-color 0.2s ease",
                }}
              >
                {/* Lesson header (always visible) */}
                <button
                  onClick={() => toggleLesson(lesson.id)}
                  className="w-full text-left"
                  style={{ padding: "1.25rem 1.5rem", background: "none", border: "none", cursor: "pointer" }}
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: "1.5rem" }} aria-hidden>{lesson.emoji}</span>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h2 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                            {lessonTitle}
                          </h2>
                          {lessonProgress?.completed && (
                            <span className="badge badge-green" style={{ fontSize: "0.6875rem", padding: "0.125rem 0.5rem" }}>
                              {lessonProgress.score}% ✓
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{lessonDescription}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs flex items-center gap-1" style={{ color: "var(--color-text-muted)" }}>
                        <Clock size={11} aria-hidden /> {lesson.readTime}
                      </span>
                      {isOpen
                        ? <ChevronUp size={16} style={{ color: "var(--color-text-muted)" }} aria-hidden />
                        : <ChevronDown size={16} style={{ color: "var(--color-text-muted)" }} aria-hidden />
                      }
                    </div>
                  </div>
                </button>

                {/* Expanded content */}
                {isOpen && (
                  <div style={{ borderTop: "1px solid var(--color-border)", padding: "1.5rem" }}>
                    {/* Lesson text */}
                    <div className="flex flex-col gap-4 mb-8">
                      {lesson.content.map((paragraph, i) => (
                        <p key={i} className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)", lineHeight: "1.75" }}>
                          {getText(paragraph, locale)}
                        </p>
                      ))}
                    </div>

                    {/* Quiz section */}
                    <div>
                      <div className="flex items-center gap-2 mb-5">
                        <Award size={16} style={{ color: lesson.color }} aria-hidden />
                        <h3 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                          {t.quick_quiz}
                        </h3>
                        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                          — {lesson.quiz.length} {t.questions}
                        </span>
                      </div>

                      <div className="flex flex-col gap-6">
                        {lesson.quiz.map((q, qIdx) => {
                          const selectedAnswer = quizState?.answers[qIdx] ?? null;
                          const isSubmitted = quizState?.submitted ?? false;
                          const isCorrect = isSubmitted && selectedAnswer === q.correct;

                          return (
                            <div key={qIdx}>
                              <p className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
                                {qIdx + 1}. {getText(q.question, locale)}
                              </p>
                              <div className="flex flex-col gap-2">
                                {q.options.map((option, aIdx) => {
                                  const isSelected = selectedAnswer === aIdx;
                                  const isCorrectOption = aIdx === q.correct;
                                  let bg = "var(--color-surface-raised)";
                                  let border = "var(--color-border)";
                                  let textColor = "var(--color-text-secondary)";

                                  if (isSubmitted) {
                                    if (isCorrectOption) {
                                      bg = "rgba(0,211,127,0.08)";
                                      border = "#00d37f40";
                                      textColor = "#00d37f";
                                    } else if (isSelected && !isCorrectOption) {
                                      bg = "rgba(239,68,68,0.08)";
                                      border = "rgba(239,68,68,0.3)";
                                      textColor = "#ef4444";
                                    }
                                  } else if (isSelected) {
                                    bg = `${lesson.color}12`;
                                    border = `${lesson.color}50`;
                                    textColor = "var(--color-text-primary)";
                                  }

                                  return (
                                    <button
                                      key={aIdx}
                                      onClick={() => selectAnswer(lesson.id, qIdx, aIdx)}
                                      disabled={isSubmitted}
                                      style={{
                                        background: bg,
                                        border: `1px solid ${border}`,
                                        borderRadius: "8px",
                                        padding: "0.625rem 1rem",
                                        textAlign: "left",
                                        cursor: isSubmitted ? "default" : "pointer",
                                        fontSize: "0.875rem",
                                        color: textColor,
                                        transition: "all 0.15s ease",
                                        fontFamily: "inherit",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.625rem",
                                      }}
                                      aria-pressed={isSelected}
                                    >
                                      <span
                                        style={{
                                          width: "20px",
                                          height: "20px",
                                          borderRadius: "50%",
                                          border: `1.5px solid ${isSubmitted && isCorrectOption ? "#00d37f" : isSubmitted && isSelected ? "#ef4444" : isSelected ? lesson.color : "var(--color-border-strong)"}`,
                                          background: isSelected ? (isSubmitted && !isCorrectOption ? "rgba(239,68,68,0.2)" : isSubmitted ? "rgba(0,211,127,0.2)" : `${lesson.color}20`) : "transparent",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          flexShrink: 0,
                                          fontSize: "0.625rem",
                                          fontWeight: 700,
                                        }}
                                        aria-hidden
                                      >
                                        {String.fromCharCode(65 + aIdx)}
                                      </span>
                                      {getText(option, locale)}
                                      {isSubmitted && isCorrectOption && (
                                        <CheckCircle size={14} style={{ color: "#00d37f", marginLeft: "auto", flexShrink: 0 }} aria-hidden />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Explanation after submit */}
                              {isSubmitted && (
                                <div
                                  className="mt-3 text-xs rounded-lg px-3 py-2.5"
                                  style={{
                                    background: isCorrect ? "rgba(0,211,127,0.06)" : "rgba(239,68,68,0.06)",
                                    border: `1px solid ${isCorrect ? "rgba(0,211,127,0.2)" : "rgba(239,68,68,0.2)"}`,
                                    color: "var(--color-text-secondary)",
                                    lineHeight: "1.6",
                                  }}
                                >
                                  <span className="font-semibold" style={{ color: isCorrect ? "#00d37f" : "#ef4444" }}>
                                    {isCorrect ? t.correct_label : t.incorrect_label}{" "}
                                  </span>
                                  {getText(q.explanation, locale)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Submit / Score */}
                      {!quizState?.submitted ? (
                        <button
                          onClick={() => submitQuiz(lesson)}
                          disabled={quizState?.answers.some(a => a === null)}
                          className="btn btn-primary mt-6"
                          style={{ width: "100%", justifyContent: "center" }}
                        >
                          {t.submit_quiz}
                        </button>
                      ) : (
                        <div
                          className="mt-6 text-center py-4 rounded-xl"
                          style={{
                            background: "var(--color-accent-subtle)",
                            border: "1px solid var(--color-accent-dim)",
                          }}
                        >
                          <p className="text-lg font-bold mb-1" style={{ color: "var(--color-accent)" }}>
                            {quizState.answers.filter((a, i) => a === lesson.quiz[i].correct).length}/{lesson.quiz.length} {getLocalizedText("quiz_label_correct", locale) !== "quiz_label_correct" ? getLocalizedText("quiz_label_correct", locale) : { en: "correct", es: "correctas", fr: "correctes" }[locale]}
                          </p>
                          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                            {t.score_label} {progress[lesson.id]?.score ?? 0}%
                            {(progress[lesson.id]?.score ?? 0) === 100 ? ` ${t.perfect}` : ` ${t.keep_learning}`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-12">
          <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
            {t.footer_cta}
          </p>
          <a href={`/${locale}/dashboard`} className="btn btn-sm btn-ghost">
            {t.view_dashboard}
          </a>
        </div>
      </main>
    </div>
  );
}
