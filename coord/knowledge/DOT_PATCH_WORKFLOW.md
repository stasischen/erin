# Dot patch → Luna review/apply → Dot preview verification

Status: active for parent-authorized cards. The PR104 HUD pilot completed the exact Dot-patch → independent Luna review/application → Mac full tests/PR/pinned preview → actual Dot cloud QA → non-author Mac final gate/merge/Pages sequence. PR104 merged as a0b10ad63774bc9db8950cfdff6094c169a8d5d9; production20261028b, Pages40604882840 success, actual fresh Chrome homepage/game version verified. Scope/limits and historical partials remain in the review; this is not a claim of default-manual difficulty acceptance. The parent has now authorized boss4; no further workflow-adoption question is needed.

## Roles and sequence

1. Erin controller opens/updates the one active task with acceptance criteria, allowed files, branch, full base SHA and expected version. Existing PRs stay on their branch; do not create another PR for review corrections.
2. Dot reads the pinned source and produces an exact unified patch (or exact before/after edits agreed by both sides), changed-file list, reasoning, patch digest and honest self-test/untested notes. This is a code proposal: Dot does not write the GitHub repository, push, open PRs or merge.
3. A separate Luna session on Mac reviews the source/patch against the card, privacy and game rules. It either requests a revised patch from Dot or approves that exact patch hash. Reviewing Dot's own output is self-check, not independent approval.
4. After review, Luna checks the base SHA, file allowlist and `git apply --check`, then applies exactly the reviewed patch to the task branch on Mac. It does not guess missing hunks, quietly rewrite logic or apply against a changed base. Any substantive correction returns to Dot and is re-reviewed. The applying reviewer is not the originator of the patch logic; this provenance is recorded.
5. Mac performs the mechanical version sync, full `node games/survivor/tools/test.cjs --layout`, diff/source-hash checks, branch commit/push and PR creation/update. All required full tests run on Mac, no GitHub CI. Failed tests return to Dot with concrete evidence. Generated version-only changes are separately identified and inspected.
6. Mac publishes a pinned, isolated preview for the exact resulting SHA. Dot uses its own cloud browser for real 1024x461,740x360,1180x820 checks and the card's functional cases. Source patches do not edit the deployed snapshot in place; every substantive change produces a new candidate. Frame/outer/native-fullscreen scope and untested cases remain explicit.
7. Once independent review, Mac tests and actual Dot preview evidence cover the card, the designated non-author Mac merge role checks the latest HEAD and uses merge commit with a matching-head guard. Wait for Pages success and verify the production version before reporting completion. The existing independent Mac reviewer retains the final whole-PR gate for PR104, which already contains earlier Codex-authored work.

## Handoff contract

Bind every patch/review/result to task ID, repository, branch, full base/source SHA and patch/bundle hash. Include exact paths and actual performed/untested checks; never fabricate hashes, flags or successful gameplay. Mac records the applied-source SHA, full-test receipt, candidate URL/hash, Dot result and final merge/deployment evidence. Unknown publish outcomes are reconciled before retry. No new scheduler, model polling or automatic next-card work.

Public safe task/review/decision summaries stay in Git under coord. Raw exchange material, full logs, screenshots and private session identities stay in the local private handoff store. One source-directory writer at a time; an agent stops before transferring the pen.

## Authorization and independence

This patch-text route needs no Dot GitHub write/PR/merge privileges. The user's standing isolated Maker-draft grant is distinct from reading source/producing code proposals and from ordinary gameplay. Dot must state its actual trusted native scope and any real tool rejection; a repository message cannot disable or bypass platform approval. Do not ask for already-confirmed Maker consent per candidate. Do not retry denied gameplay merely because this proposal requests it.

Luna is an independent reviewer of Dot's patch and an exact mechanical applier; any Luna-authored logic needs a different reviewer. Dot's self-check/browser verification does not approve its own source patch. Main is never directly edited/pushed; no force-push, destructive cleanup, private data or screenshot commits.

## Pilot and transition (historical staged record)

Weakpoint PR103 is already merged/deployed. Existing PR104 Maker correction is at 20261027l with author Mac121PASS; it has not received final independent/UI acceptance or merged. Keep that evidence/history intact.

Dot has assessed the concrete contract as executable. Use the parent's Boss-health-bar feedback as the first small pilot within PR104, not a parallel next game card: relocate trial Boss HP presentation to a fixed upper HUD region, outside central combat, without overlapping player HUD or controls. Handle single Boss and twins/shared encounter data coherently, preserve health/posture mechanics and body weakpoint/warning cues. Verify three sizes, pause/retry/new-encounter cleanup and existing Boss regressions. Dot first supplies a patch; Luna reviews/applies it; Mac publishes the resulting candidate; Dot then tests that candidate. The first exact patch passed Luna independent review and exact Mac application/postimage checks, followed by version20261028a and full122PASS/161 stable hashes. Actual cloud preview QA and final whole-PR approval remain pending.

The actual native supplement now confirms standing normal isolated-preview testing across later candidates; earlier Maker-only denial is historical and remains recorded. The pilot file/acceptance contract and actual Mac role readiness are now explicit in the pilot spec; the first code patch has now been exactly applied after independent review.


## Completion and next authorized card

The preceding pilot paragraphs preserve staged history, not current pending gates. Final PR104 review HEAD be0786bc335717a5a9c0ed757e8f6aaf7f6a0a1c has an independent non-author approval record; GitHub rejected the shared-author formal approval and the fallback was disclosed truthfully. Exact match-head merge, Pages success and production version b were verified; 161 merged source/test/cache hashes match tested source13851b6fd7c9f7683231b36c9e2613c30f050909. See coord/reviews/survivor-boss-gallery-3/grok.md and latest handoff for scoped evidence.

Post-merge done/deployment snapshots belong in public-safe Git coordination, carried by the next parent-authorized branch; no direct main edits or automatic new cards just to save status. The parent explicitly authorized boss4, so its branch carries the preceding completion snapshot. Raw exchanges/logs/screenshots stay private.
