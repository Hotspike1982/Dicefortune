(function (root) {
  "use strict";

  const SET_COUNT = 4;
  const DICE_PER_SET = 3;
  const COLOR_COUNT = 7;
  const FACE_COUNT = 6;
  const MIN_STAKE_CENTS = 10;
  const MAX_STAKE_CENTS = 500;
  const BONUS_CHANCE = 0.08;

  function assertInteger(value, name) {
    if (!Number.isSafeInteger(value)) {
      throw new TypeError(name + " must be a safe integer");
    }
  }

  function randomIndex(random, size) {
    const value = random();
    if (typeof value !== "number" || value < 0 || value >= 1) {
      throw new RangeError("Random source must return a number in [0, 1)");
    }
    return Math.floor(value * size);
  }

  function rollDie(random) {
    const source = random || Math.random;
    return {
      color: randomIndex(source, COLOR_COUNT),
      face: randomIndex(source, FACE_COUNT) + 1
    };
  }

  function rollSet(random) {
    const source = random || Math.random;
    return Array.from({ length: DICE_PER_SET }, function () {
      return rollDie(source);
    });
  }

  function scoreSet(dice) {
    if (!Array.isArray(dice) || dice.length !== DICE_PER_SET) {
      throw new TypeError("A set must contain exactly three dice");
    }
    dice.forEach(function (die) {
      if (!die || !Number.isInteger(die.color) || !Number.isInteger(die.face)) {
        throw new TypeError("Each die must have an integer color and face");
      }
      if (die.color < 0 || die.color >= COLOR_COUNT || die.face < 1 || die.face > FACE_COUNT) {
        throw new RangeError("Each die must use a supported color and face");
      }
    });

    const sameColor = dice.every(function (die) {
      return die.color === dice[0].color;
    });
    const sameFace = dice.every(function (die) {
      return die.face === dice[0].face;
    });

    if (sameColor && sameFace) {
      return { points: 500, combination: "same-color-and-face" };
    }
    if (sameFace) {
      return { points: 200, combination: "same-face" };
    }
    if (sameColor) {
      return { points: 100, combination: "same-color" };
    }
    return { points: 0, combination: "none" };
  }

  function calculateSpin(options) {
    const sets = options && options.sets;
    const active = options && options.active;
    const stakeCents = options && options.stakeCents;
    const random = (options && options.random) || Math.random;

    if (!Array.isArray(sets) || sets.length !== SET_COUNT) {
      throw new TypeError("A spin must contain exactly four sets");
    }
    if (!Array.isArray(active) || active.length !== SET_COUNT ||
        active.some(function (isActive) { return typeof isActive !== "boolean"; })) {
      throw new TypeError("Active selections must contain four booleans");
    }
    assertInteger(stakeCents, "stakeCents");
    if (stakeCents < MIN_STAKE_CENTS || stakeCents > MAX_STAKE_CENTS) {
      throw new RangeError("Stake must be between 10 and 500 cents");
    }
    const activeCount = active.filter(Boolean).length;
    if (activeCount === 0) {
      throw new RangeError("At least one dice set must be active");
    }

    const lines = sets.map(function (dice, index) {
      return active[index]
        ? Object.assign({ index: index }, scoreSet(dice))
        : { index: index, points: 0, combination: "inactive" };
    });
    const winningSets = lines.filter(function (line) {
      return line.points > 0;
    }).length;
    const fourSetMultiplier = winningSets === SET_COUNT ? 2 : 1;
    const basePoints = lines.reduce(function (sum, line) {
      return sum + line.points;
    }, 0);
    const points = basePoints * fourSetMultiplier;
    const bonusWon = random() < BONUS_CHANCE;
    const bonusCents = bonusWon ? (randomIndex(random, 5) + 1) * 20 : 0;
    const payoutCents = points * stakeCents / 100 + bonusCents;

    return {
      lines: lines,
      winningSets: winningSets,
      basePoints: basePoints,
      fourSetMultiplier: fourSetMultiplier,
      points: points,
      bonusCents: bonusCents,
      payoutCents: payoutCents
    };
  }

  function settleBalance(balanceCents, stakeCents, activeCount, payoutCents) {
    assertInteger(balanceCents, "balanceCents");
    assertInteger(stakeCents, "stakeCents");
    assertInteger(activeCount, "activeCount");
    assertInteger(payoutCents, "payoutCents");
    if (balanceCents < 0 || payoutCents < 0 || activeCount < 1 || activeCount > SET_COUNT ||
        stakeCents < MIN_STAKE_CENTS || stakeCents > MAX_STAKE_CENTS) {
      throw new RangeError("Balance, payout, or active set count is invalid");
    }
    const wagerCents = stakeCents * activeCount;
    if (balanceCents < wagerCents) {
      throw new RangeError("Insufficient virtual credits");
    }
    return {
      wagerCents: wagerCents,
      balanceCents: balanceCents - wagerCents + payoutCents
    };
  }

  const engine = {
    SET_COUNT: SET_COUNT,
    DICE_PER_SET: DICE_PER_SET,
    COLOR_COUNT: COLOR_COUNT,
    FACE_COUNT: FACE_COUNT,
    MIN_STAKE_CENTS: MIN_STAKE_CENTS,
    MAX_STAKE_CENTS: MAX_STAKE_CENTS,
    BONUS_CHANCE: BONUS_CHANCE,
    rollDie: rollDie,
    rollSet: rollSet,
    scoreSet: scoreSet,
    calculateSpin: calculateSpin,
    settleBalance: settleBalance
  };

  root.DiceGameEngine = engine;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = engine;
  }
}(typeof globalThis === "undefined" ? this : globalThis));
