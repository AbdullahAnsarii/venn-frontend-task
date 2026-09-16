# Onboarding form

[![CI](https://github.com/AbdullahAnsarii/venn-frontend-task/actions/workflows/ci.yml/badge.svg)](https://github.com/AbdullahAnsarii/venn-frontend-task/actions/workflows/ci.yml)

Front end task for Venn.

Live preview:

## Running it

```bash
npm install
npm run dev
```

Open http://localhost:3000. The API base URL comes from `NEXT_PUBLIC_API_BASE_URL`. The committed `.env` points at the QA environment from the task to use another one, set the variable in `.env.local`, which git ignores. The app won't start without it instead of sending requests to an empty URL.

## Checks

```bash
npm test
npm run lint
npm run typecheck
npm run format
```

The same checks plus `next build` run in GitHub Actions on push to main and on pull requests.

## How it's built

Next.js 16 (app router), React 19 and TypeScript. react-hook-form with a zod schema for the rules, libphonenumber-js for the Canadian check, CSS modules for styling. Tests use Vitest, React Testing Library and MSW.

```
src/
  app/                      layout and page
  components/               TextField, Button, Spinner
  features/onboarding/
    Onboarding.tsx          step state, shows the form or the step 2 placeholder
    OnboardingForm.tsx      the form itself
    onboardingSchema.ts     validation rules
    hooks/                  useOnboardingForm, useCorporationNumberValidation
  lib/api/                  request helper and the two endpoints
  lib/phone.ts              Canadian number check
  test/                     msw server and test setup
```

## Decisions

1. Only Canadian numbers. `+1` is the whole North American numbering plan, so checking the prefix would let a Seattle number through. The field starts with `+1` and accepts exactly 10 digits after it and nothing else, which is the format the task asks for. Then `parsePhoneNumberFromString` from libphonenumber-js has to resolve the number to Canada and call it valid
2. One zod schema holds the synchronous rules and is plugged into react-hook-form. A field validates when it loses focus for the first time and on every change after that, so a message clears as soon as the value is fixed. Submit runs the same schema over everything and focuses the first invalid field.
3. The corporation number lookup is kept out of the schema so it only runs for that field and never on a keystroke. Nine characters are checked locally first, then the GET runs on blur with a spinner in the field. Typing a new value aborts the request in flight and a stale value guard drops any late answer. Definitive answers are cached for the page so re-blurring the same value doesn't refetch failures are not cached and get their own message. The API answers unknown numbers with a 404 whose body still says `{ valid: false, message }`, so that status means invalid, not failed.
4. Submit reuses a lookup that is already in flight instead of starting another, disables the button while the POST runs, puts a 400 message under the field it names (`Invalid phone number` goes under the phone field) and falls back to a form level message (`Missing required fields`).
5. Both API responses are parsed with zod at runtime and requests time out after 10 seconds. Anything going wrong there shows "couldn't verify" or "something went wrong", never a blank screen.
6. No proxy. The QA API sends `Access-Control-Allow-Origin: *`, checked from the browser, so the app calls it directly and there is no server code. A route handler would be the fix if that ever changes. 
7. Labels are tied to their inputs, errors use `role="alert"` and are linked through `aria-describedby` and `aria-invalid`, the lookup spinner has a status text for screen readers, and the step change moves focus to the new heading.
8. Tests are integration tests through the rendered flow with the API mocked, so no valid corporation numbers are hardcoded in the app. Every rule, the blur/submit dedupe, the stale response, lookup failure and retry, both kinds of 400 and the step change. One unit test for the phone check makes the interpretation visible meaning Vancouver passes, Seattle fails.

## Things I'd suggest left out on purpose

- Formatting the phone number as you type, `+1 (XXX) XXX-XXXX` style. The task says the number must contain nothing but digits after the leading `+`, so anything shown with brackets or dashes would look like it breaks that rule. In a product I'd format the display and keep the plain number underneath.
- Disabling Submit until every field has a value. The task says submitting should put a message under each missing field, and that needs a clickable button. It's a one-line change if the product wants it the other way.
