import { QUESTIONS, MAX_SCORE, scoreAnswers, getBand } from "./assessment";

test("max score matches question count", () => {
  expect(MAX_SCORE).toBe(QUESTIONS.length * 3);
});

test("scores sum the selected option values", () => {
  expect(scoreAnswers([0, 1, 2, 3])).toBe(6);
  expect(scoreAnswers([])).toBe(0);
});

test("bands cover the whole range", () => {
  expect(getBand(0).key).toBe("low");
  expect(getBand(9).key).toBe("low");
  expect(getBand(10).key).toBe("moderate");
  expect(getBand(19).key).toBe("moderate");
  expect(getBand(20).key).toBe("high");
  expect(getBand(MAX_SCORE).key).toBe("high");
});
