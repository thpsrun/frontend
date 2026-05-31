# Contributing Guidelines
*All pull requests, bug reports, feature requests, and other forms of contribution are welcome!* :blue_heart:

#### Table of Contents
- [Contributing Guidelines](#contributing-guidelines)
      - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [Issue Tracking](#issue-tracking)
  - [Security Issues](#security-issues)
  - [Feature Requests](#feature-requests)
  - [Roadmap](#roadmap)
  - [Pull Requests](#pull-requests)
  - [Code Style](#code-style)
  - [Code Review](#code-review)
  - [Templates](#templates)

## Code of Conduct
The entire [Code of Conduct](https://github.com/thpsrun/frontend/blob/main/.github/CODE_OF_CONDUCT.md) is available for you to read. Essentially, don't be an idiot; this is an inclusive project. If you disagree, just go away.

## Issue Tracking
Before you [create an issue](https://help.github.com/en/github/managing-your-work-on-github/creating-an-issue), please check to make sure you are on the latest version of this project. If you are not on it, upgrade to the current `main` branch to see if it fixes your issues. If not, feel free to submit an issue!

This also includes bug reports and smaller issues; feel free to submit them for review. However, please provide as much information as possible (screenshots and console errors help too).

## Security Issues
Please review the [Security Policy](https://github.com/thpsrun/frontend/blob/main/.github/SECURITY.md) if you have any security or vulnerability concerns. Do __**NOT**__ submit a public issue with vulnerabilities, please!

## Feature Requests
Feature requests are most definitely welcome! All of these will be reviewed to see what can be added to the project and determine what could be eventually added to the roadmap. Again, give plenty of information about your suggestion! Just a single sentence like "pls add blah" may not suffice.

## Roadmap
Speaking of a roadmap, be sure to check the Projects section to see what is coming up in later iterations of this website!

## Pull Requests
If you are interested in assisting with the project, pull requests are a wonderful way to do it! Feel free to fork the repository and create a pull request if you wish to contribute.

For larger changes, please open an issue first so we can discuss the plan. Communication is key! Additionally, we ask you follow these rules:

-   **Readability**: Your code should be legible and understood. If a code block cannot be easily understood or explained, either refactor it OR add comments.
-   **Documentation**: Larger changes should be better documented. This includes JSDoc-style comments where useful and inline comments for anything non-obvious. Communication is key!
-   **TypeScript and Lint Gates**: All PRs must pass `npm run lint` (ESLint) and `npm run build` (which also runs `tsc -b` as the typecheck gate). CI will run these on every PR. Don't disable rules without explanation, and don't add `any` without a comment justifying it.
-   **Update CHANGELOG.md**: If a `CHANGELOG.md` exists at the time of your PR, try to follow the formatting examples throughout the document, and feel free to add some humor to it as well! Be sure to add a comment at the end of the change that includes your username and link to your GitHub so you are credited!
-   **Main Branch**: Always fork and branch from the `main` branch to stay up-to-date.
-   **Commit Messages**: Write a superb commit message! A good commit message summarizes what you did in the subject line, and goes over why the commit is needed. Add additional information, issue numbers, and so on as needed.

## Code Style
I (Anastasia) am not a stickler about coding standards, but it should definitely be legible, understandable, and not be overly complex. Here are the rules I stick to for this frontend:

-   **Indentation**: 4 spaces. Match the surrounding files.
-   **Quotes**: Double quotes for strings (the codebase is consistent on this even though ESLint doesn't enforce it). Single quotes only when escaping would be ugly.
-   **Line Length**: 100. No more than that (unless you have an incredibly valid reason).
-   **File Naming**: kebab-case for components and most files (`profile-settings-layout.tsx`). Hooks use camelCase with the `use*` prefix (`useApiKeys.ts`).
-   **TypeScript Strict Mode**: The project runs with `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, and `erasableSyntaxOnly`. Don't leave unused locals or parameters, even temporarily. Use `import type` for type-only imports.
-   **Component Conventions**:
    -   shadcn/ui primitives live flat in `src/components/ui/` and are div-based (not polymorphic). Compose them with `className` overrides via `cn()` from `src/lib/utils.ts`.
    -   Shared app-level widgets (PageShell, SectionPanel, GradientUsername, etc) live in `src/components/common/`.
    -   Feature components live in `src/components/<feature>/`.
-   **Server State**: All data fetching goes through TanStack Query hooks under `src/hooks/<feature>/`. New endpoints get an `*-api.ts` raw caller (which uses `apiFetch` from `src/lib/api-client.ts`) plus a `use*` query/mutation hook. Don't reach past the API client.
-   **Query Keys**: Always extend the `queryKeys` factory in `src/lib/query-keys.ts`. Don't hardcode keys at call sites. Mutations that need to invalidate must use the same factory.
-   **Forms**: Use `react-hook-form` with `zodResolver`. Schemas live in `src/lib/schemas.ts`. `src/lib/validation.ts` exposes thin wrappers for legacy callers; prefer the schema + resolver pattern for new forms. See `src/components/profile/sections/security-section.tsx` as the canonical example.
-   **Errors**: `apiFetch` throws `ApiError`. Branch on the helpers (`isAuthRequired`, `isForbidden`, `isRateLimited`) rather than raw status codes. A 401 from any endpoint means "needs auth", so redirect or gate accordingly.
-   **Comments**: Add comments where the *why* is non-obvious: hidden constraints, subtle invariants, workarounds. Don't comment what well-named code already says.

## Code Review
-   **Review the code, not the author.** Look for and suggest improvements without disparaging or insulting the author. Provide actionable feedback and explain your reasoning.
-   **You are not your code.** When your code is critiqued, questioned, or constructively criticized, remember that you are not your code. Do not take code review personally.
-   **Always do your best.** No one writes bugs on purpose. Do your best, and learn from your mistakes.
-   Kindly note any violations to the guidelines specified in this document.

## Templates
Templates will be added over time, depending on volume of project. If you want to contribute a template or idea, feel free to submit a PR with your ideas!
