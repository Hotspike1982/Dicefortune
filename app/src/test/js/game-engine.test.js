"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const engine = require("../../main/assets/game-engine.js");

const solidSet = (color, face) => Array.from({ length: 3 }, () => ({ color, face }));
const noWinSet = [
  { color: 0, face: 1 },
  { color: 1, face: 2 },
  { color: 2, face: 3 }
];
const noWinSets = () => Array.from({ length: 4 }, () => noWinSet);
const noBonus = () => 0.5;

test("scores same color, same face, both, and no-match sets", () => {
  assert.deepEqual(engine.scoreSet(solidSet(2, 4)), {
    points: 500,
    combination: "same-color-and-face"
  });
  assert.deepEqual(engine.scoreSet([
    { color: 0, face: 4 }, { color: 1, face: 4 }, { color: 2, face: 4 }
  ]), { points: 200, combination: "same-face" });
  assert.deepEqual(engine.scoreSet([
    { color: 2, face: 1 }, { color: 2, face: 3 }, { color: 2, face: 6 }
  ]), { points: 100, combination: "same-color" });
  assert.deepEqual(engine.scoreSet(noWinSet), { points: 0, combination: "none" });
});

test("only active lines score and a full four-line win doubles base points", () => {
  const result = engine.calculateSpin({
    sets: Array.from({ length: 4 }, () => solidSet(1, 2)),
    active: [true, true, true, true],
    stakeCents: 20,
    random: noBonus
  });
  assert.equal(result.winningSets, 4);
  assert.equal(result.basePoints, 2000);
  assert.equal(result.fourSetMultiplier, 2);
  assert.equal(result.points, 4000);
  assert.equal(result.payoutCents, 800);

  const partial = engine.calculateSpin({
    sets: [solidSet(1, 2), solidSet(1, 2), solidSet(1, 2), solidSet(1, 2)],
    active: [true, false, false, false],
    stakeCents: 20,
    random: noBonus
  });
  assert.equal(partial.winningSets, 1);
  assert.equal(partial.lines[1].combination, "inactive");
  assert.equal(partial.payoutCents, 100);
});

test("bonus award is reproducible and added as virtual cents", () => {
  const values = [0.079, 0.99];
  const result = engine.calculateSpin({
    sets: noWinSets(),
    active: [true, false, false, false],
    stakeCents: 20,
    random: () => values.shift()
  });
  assert.equal(result.bonusCents, 100);
  assert.equal(result.payoutCents, 100);
});

test("settlement charges one stake per active set and adds payouts", () => {
  assert.deepEqual(engine.settleBalance(1000, 20, 3, 140), {
    wagerCents: 60,
    balanceCents: 1080
  });
  assert.throws(() => engine.settleBalance(50, 20, 3, 0), /Insufficient virtual credits/);
});

test("rejects invalid stakes, inactive spins, and malformed dice", () => {
  assert.throws(() => engine.scoreSet([{ color: 0, face: 1 }]), /exactly three dice/);
  assert.throws(() => engine.scoreSet(solidSet(7, 1)), /supported color and face/);
  assert.throws(() => engine.calculateSpin({
    sets: noWinSets(), active: [false, false, false, false], stakeCents: 20, random: noBonus
  }), /At least one/);
  assert.throws(() => engine.calculateSpin({
    sets: noWinSets(), active: [true, false, false, false], stakeCents: 0, random: noBonus
  }), /between 10 and 500/);
  assert.throws(() => engine.settleBalance(100, 0, 1, 0), /invalid/);
});
