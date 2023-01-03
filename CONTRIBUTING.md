# Contributing to Boxtribute

First off: **thank you**. You will be helping build software that distributes clothes and food to thousands of refugees and other people in need. It gives comfort and dignity to people in a vulnerable situation. Not only will you be contributing to the open source community / ecosystem of open source projects, but your contributions will directly benefits thousands of people who are stuck in a vulnerable system.

**If you want to join and support us**, just [write us at hello@boxtribute.org](mailto:hello@boxtribute.org) and include your github handle and / or CV!

**Do you need help using Boxtribute, or you found a bug, or got an idea for a feature?** [Please write us at helpme@boxtribute.org!](mailto:helpme@boxtribute.org)

### How do we work in general?

Quick summary:

- We follow [Agile methods](https://medium.com/@svharivinod/rolling-out-features-for-zomato-using-agile-8f24bba1ddd8) ([short video](https://www.youtube.com/watch?v=QCif_-r8eK4)) to roll out new features.
- Our [sprint](https://www.atlassian.com/agile/scrum/sprints) cycle is about a month. In this month we meet twice online - once in the middle of the month to check-in and discuss problems, once at the end/beginning of the month to demo our progress of the sprint. We ask you to join at least the demo call once per month.
- We use slack as our main communication tool and do asynchronous [stand-ups](https://en.wikipedia.org/wiki/Stand-up_meeting) there once a week.
- On Fridays, we offer a space for troubleshooting if you are stuck and need to dicuss something about your task.

### How do I get my tasks? Where do I find information about them?

We are using trello for Task Management. Our [product owner](https://www.youtube.com/watch?v=502ILHjX9EE) assigns the tickets to everybody taking part in a sprint. Each ticket should include a user story to understand why we need the ticket. If you are missing information, do not feel shy to write in slack.

### How do I start with my task?

We would like to do [test driven development](https://www.browserstack.com/guide/tdd-vs-bdd-vs-atdd) where possible. Thinking about the tests first forces you to have a clear image on what is needed for a screen, endpoint, or business process to work before you start coding, and to be efficient in your code by writing only the minimal amount of code needed for the tests to pass. Check out our [Testing Guidelines](#testing-guidelines) and also the READMEs for front-end and back-end which include more specific best practices.
Besides that, check our [general guidelines](#guidelines) and [development principles](#development-principles).

### I'm stuck. How do I get help?

Write in the #dev channel first, and ask for support head of the friday troubleshooting meeting if needed.
Please write in **public** channels and tag people instead of writing them privately. It is completely ok to be stuck and ask for help and this way others with the same problem find the solution easier.

If you want somebody to look at your code when you are stuck, then [**create a draft Pull Request**](https://github.blog/2019-02-14-introducing-draft-pull-requests/). It gives the others a quick insight in what you have done and is great to directly comment on the code.

If you schedule a pair-programming session and you both use VSCode as your IDE, please check out the [LiveShare extension.](https://marketplace.visualstudio.com/items?itemName=ms-vsliveshare.vsliveshare)

### I'm finished with my task. What now?

We are using git as versioning control and are using the methology of [Trunk Based Development](https://trunkbaseddevelopment.com/) for our [Software Development Life Cycle](https://en.wikipedia.org/wiki/Software_development_process).
If you haven't used GitHub before, [this is a tutorial](http://makeapullrequest.com/) that will help. Don't be afraid to ask for help, if you need it. (Everyone is a beginner at some point!)

- Commit all your progress on a branch which you started from master. [Here, guidelines how to write good commit messages](https://github.com/erlang/otp/wiki/writing-good-commit-messages).
- Before pushing your branch, try to keep your local source up-to-date with the `master`-branch and merge `master` into your branch if necessary. In the best case you check developments on `master` before you start your work.
- When everything is tested and ready to review, push your branch to github.
- Create a [Pull Request](https://docs.github.com/en/free-pro-team@latest/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request). The PR description should include an explanation of _why_ you ended up with the solution you did and the intended behavior. Be clear, especially if you had to make a ‘call’ diverging from the description.
- Try to make it as easy as possible for the reviewer so that she can get back to you quickly. **Screenshots** and **step-by-step** guides are especially helpful with big PRs.
- [Connect your trello ticket to the PR.](https://blog.trello.com/github-and-trello-integrate-your-commits)
- Make sure that all automated tests pass for your PR.
- **MOST IMPORTANT** You have to let us know that there is a PR waiting and that you need a review. Request reviews from the others. Nudge them in slack if you need the review now :)

### I want to review PRs. How should I do that?

PR reviews take time especially for larger PRs. Please take that time and do not rush it.
We suggest that you split up your review into a functional and code review.

#### Functional Review

For the functional review, check out the PR locally and get it running. In the best case there is a user flow that you can test. Check the browser console and the logs of the server if there are any warnings or errors in the background.
Either everything works according to the ticket or something is broken. In both cases, do still a code review. This way you can maybe help finding a bug in the code and also other issues can be resolved at once.

#### Code Review

Go to the PR in Github and the "Files Changed" Tab. Go through the changes and check if best practises are followed and if you can read the code.
Be constructive and do not forget to appreciate the effort.

[More documentation for code reviews in Github you can find here.](https://docs.github.com/en/free-pro-team@latest/github/collaborating-with-issues-and-pull-requests/reviewing-proposed-changes-in-a-pull-request)

### I want to suggest a task and create a ticket. How should I do that?

If you want to create a ticket, add it on the bottom of the "Feature Requests" list in our trello. In the best case, write a user story to explain your reasoning. If you can add a to-do list with the proposed development steps and maybe even a rough estimation how much time you guess it would take (See the T-Shirt sizeing for time estimation).You can also bring it up with our product owner directly in one of the dev meetings.
If you discovered a bug, there is a [template in trello](https://trello.com/c/YToLMBuq) to create a bug ticket. Please use it.
After creating the ticket, tag our product managers to review and prioritize your ticket.

### I want to suggest changes in our stack / architecture. How do I do that?

If possible create an Architecture Decision Record (ADR) as a starting point for your discussion. Please check the [ADR template](docs/adr/adr_template.md) for more information!

## Guidelines

- **Start small.** Contributing to a new project can be quite daunting.
- **Think about the tests first.** Try [test driven development](https://www.browserstack.com/guide/tdd-vs-bdd-vs-atdd) where possible.
- **Make sure your idea has support.** If a feature ends up being more complicated that expected in the T-shirt sizing, say something in #dev channel and tag our product owner.
- **Constructive criticism** If you do not like a contribution, feel free to air it. However, before doing so think first about how to improve and propose alternative solutions.

## Development Principles

These are the principles that have guided our development so far. If you're making a major contribution, it may be worth keeping them in mind.

- **Reliability > Sexiness / Flashiness** Boxtribute needs to keep on working for a long time with minimal work. We don't want to have to rewrite it every year because a technology we are using has gone out of fashion.
- **Minimal maintenance.** Our resources for support are minimal since we are all volunteers. The app should run with minimal server-poking.
- **Keep it simple.** 50 lines of straightforward, readable code is better than 10 lines of magic that nobody can understand. ([source](https://github.com/moby/moby/blob/master/project/PRINCIPLES.md))
- **Optimize for contributions.** The code needs to be approachable and easy to understand, particularly for junior developers. Consider whether that clever new technology is worth it if a junior developer will struggle to get their head around it.
- **Move fast and don't break things.** We ship continuously and test, test, test.
- **More small PRs than single larger PRs.** Big PRs are hard to review and often create dependencies.

## Testing Guidelines

When writing tests, try to follow these guidelines if possible:

- Tests should be as readable as possible and not complex at all. You should understand them by looking at them just once.
- Local helper functions defined in test files should have functional and easy-to-understand rather than technical names. Meaning, `clickNewUserButton()` is better than `clickElementByTypeAndTestId('button','new-user-button')`.
- More general use helpers like 'clickElementByTypeAndTestId' can be used within the local helper functions if preferred. The reason for functional naming preference lies in increased readability of tests.
- Avoid any duplication of helper functions across several files! If using the same functions in several tests (files), there's a tendency to copy-paste the whole file and then rewrite tests. This leads to code duplication of helper functions. Instead, helper functions needed in several locations should be defined in one place should be available globally. Find the matching one by name or create a new one. Avoid creating miscellaneuos file names as it tends to lead to chaos.
- Current codebase doesn't 100% follow everything stated above but it'd definitely help organising the test helpers accordingly from now on.

![Selection_599](https://user-images.githubusercontent.com/8964422/77221481-6a190d00-6b4a-11ea-88d7-9fc70ce1c982.png)

Up until now, we have mainly written unit tests and integration tests on front-end and back-end. Unit tests are testing single units of code in only one environment or framework, integration tests test the integration between different frameworks / technologies.
Please find here collection of [best practices for unit tests](https://medium.com/better-programming/13-tips-for-writing-useful-unit-tests-ca20706b5368).
