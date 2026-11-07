# Dice Fortune Fun 2.0 — gameplay specification

## Evidence and limits

The Android project inspected for this milestone is a Java `Activity` that loads a
local HTML asset in a `WebView`. The existing GitHub Actions workflow runs
`gradle --no-daemon assembleDebug` and uploads the debug APK. Those are verified
repository facts.

The supplied Napoleon Casino reference returned HTTP 403 to both the page fetch
and a direct header request during this work. No game session, paytable, bonus
wheel, animation, or control behavior from Stakelogic could therefore be
observed. Nothing below should be read as a claim about the reference game's
internal rules, probabilities, or implementation.

## First playable milestone

The milestone is an offline, original-artwork implementation based on the
pre-existing local prototype. Its game engine is independent of the WebView and
accepts an injectable random source so scoring and settlement can be reproduced
in tests.

Each spin has four independently rolled sets of three dice. A set can be
deactivated; at least one must remain active. Each die has one of seven colors
and one of six faces. Stake is per active set, between 0.10 and 5.00 virtual
credits in 0.10 increments. The wager is deducted before payout. Balance,
stake, last win, and session winnings use integer cents; reset restores 5,000.00
virtual credits and clears session winnings.

| Set result | Prototype points |
| --- | ---: |
| Three dice share a color and face | 500 |
| Three dice share a face | 200 |
| Three dice share a color | 100 |
| No match | 0 |

Points convert to credits at `points × stake / 100`. When all four sets win,
base points are doubled before conversion. A bonus is rolled once per paid spin:
the existing prototype's 8% chance awards 0.20–1.00 virtual credits in 0.20
increments, independently of stake. The wheel is a visual indicator for this
prototype behavior, not a verified representation of the reference wheel.

## Verified vs. assumed

| Rule or behavior | Status |
| --- | --- |
| Offline Android wrapper and existing APK artifact workflow | Verified in repository |
| Four sets, three dice per set, selectable lines | Inherited from local prototype; not reference-verified |
| Seven colors and six faces | Inherited from local prototype; not reference-verified |
| 100/200/500-point combinations and four-set double | Inherited from local prototype; not reference-verified |
| Stake range, initial balance, and wager charged per active line | Inherited from local prototype; not reference-verified |
| Bonus chance and award range | Inherited from local prototype; not reference-verified |
| Reference screen layout, symbol mapping, scoring, wheel, and animations | Unknown; reference was inaccessible |

These prototype rules are intentionally identified as assumptions. They should
be replaced only after observable reference behavior is available; no matching
game assets or sound recordings are included.

Run the reproducible engine checks with
`node --test app/src/test/js/game-engine.test.js`.

## Development plan

1. **First playable (this milestone):** document evidence, isolate scoring and
   balance logic, add deterministic engine tests, and deliver an offline
   landscape game in the existing WebView APK.
2. **Reference verification:** compare layout and behavior against an accessible
   reference session; update this specification before changing uncertain rules.
3. **Polish:** refine original graphics, animations, sound, and tablet/Android
   device coverage without changing undocumented rules.
4. **Delivery:** keep the existing Actions build and downloadable APK artifact;
   run the debug build for each implementation milestone.
