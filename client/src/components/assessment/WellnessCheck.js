import { useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { QUESTIONS, MAX_SCORE, scoreAnswers, getBand } from "../../utils/assessment";

export default function WellnessCheck() {
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState([]);

  const step = answers.length;
  const done = step >= QUESTIONS.length;
  const score = scoreAnswers(answers);
  const band = getBand(score);

  const answer = (value) => setAnswers((a) => [...a, value]);
  const back = () => setAnswers((a) => a.slice(0, -1));
  const restart = () => {
    setAnswers([]);
    setStarted(false);
  };

  if (!started) {
    return (
      <div className="check">
        <span className="badge badge--accent"><FiHeart aria-hidden="true" /> 2-minute check-in</span>
        <h2 style={{ marginTop: "var(--sp-3)" }}>How are you feeling lately?</h2>
        <p className="text-muted">
          Answer 10 quick questions to get a gentle snapshot of your recent stress levels. Your answers stay in your browser and are not stored.
        </p>
        <button type="button" className="btn btn--primary btn--block" onClick={() => setStarted(true)}>Start the check-in</button>
        <p className="check__disclaimer mb-0">This is a self-reflection tool, not a medical or diagnostic test.</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="check check__result" aria-live="polite">
        <div className="check__score">{score}<small style={{ fontSize: "1rem", color: "var(--muted)" }}> / {MAX_SCORE}</small></div>
        <span className={`badge badge--${band.key === "low" ? "accepted" : band.key === "moderate" ? "pending" : "rejected"} check__band`}>{band.label}</span>
        <p>{band.advice}</p>
        <div className="stack">
          <Link to="/experts" className="btn btn--primary btn--block">Book a session</Link>
          <button type="button" className="btn btn--ghost btn--block" onClick={restart}>Take it again</button>
        </div>
        <p className="check__disclaimer">
          This check-in is not a diagnosis. If you are in crisis or thinking of harming yourself, call Tele-MANAS at 14416 (India, 24x7, free) or your local emergency number.
        </p>
      </div>
    );
  }

  const q = QUESTIONS[step];
  return (
    <div className="check">
      <div className="row row--between text-small text-muted">
        <span>Question {step + 1} of {QUESTIONS.length}</span>
        {step > 0 && <button type="button" className="link-btn" onClick={back}>Back</button>}
      </div>
      <div className="check__progress" role="progressbar" aria-valuemin={0} aria-valuemax={QUESTIONS.length} aria-valuenow={step}>
        <span style={{ width: `${(step / QUESTIONS.length) * 100}%` }} />
      </div>
      <h3 style={{ fontSize: "1.2rem" }}>{q.question}</h3>
      <div className="check__options">
        {q.options.map((opt, i) => (
          <button key={opt} type="button" className="check__option" onClick={() => answer(i)}>{opt}</button>
        ))}
      </div>
    </div>
  );
}
