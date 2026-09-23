# Try Pruvello M1-R

M1-R is implemented. Use a synthetic example first; the skill prepares its temporary
project and handles the tools for you. Your real application stays outside this demo.

In the CEC repository's Codex project, send:

> $pruvello Let's try a synthetic example. Start with the first interaction.

From this task or anywhere outside that project, send this instead:

> Read C:\Users\Ash\Documents\Codex\CEC\.agents\skills\pruvello\SKILL.md and use it to help me try Pruvello with a disposable synthetic example. Start with the first interaction.

You should see a short Executive Summary and:

> Are you starting fresh, or do you already have a project in progress?

Choose a path, then use one of these synthetic starting points:

1. **Fresh:** “Agencies keep chasing clients for missing files. I want a profitable
   solo business. I don't know the buyer yet, and I'd like to build first.”
2. **Existing, no users:** “Use the unfinished invoice-tracker demo. No users yet;
   I want a profitable solo business. Preserve its JavaScript architecture.”
3. **Existing with feedback:** “Use the invoice-tracker demo. My synthetic scenario
   has two pilot users struggling to choose the next invoice to chase and one
   asking for reminders. I want to grow a B2B company.”

Review the small proposed scope. Say **Build now** when it fits. Codex should then
implement it in the disposable example, run real checks and show concise results.

You can also say **Correct my understanding**, **Why?**, **View research**,
**View evidence**, **View competitors**, **View sources** or **View checks**.
The detail below is optional—you can continue without reading it.

Look for a short summary, one useful next action, no repeated context questions,
clearly labeled uncertainty and an easy Build now path. Research should truthfully
say it has not run. Code checks must never be presented as proof of customer demand.

To try a different path after finishing, ask for a **new disposable synthetic demo**.
Each example supports one approved cycle. Do not delete stored state to reset it.
Temporary demos may be cleared by the operating system; they are not durable real
startup storage. The current milestone does not search the web or begin M2.

No prerequisite installation is needed on this prepared machine. If `$pruvello` is
not offered in an already-open task, use the explicit-path prompt above. The real
Codex scanner found the skill, but a fresh interactive M1-R session has not yet been
independently verified here. Your trial is the remaining UX acceptance step.

For the regression trial, start fresh with: "I can find promising stocks, but comparing them using my swing-trading criteria is difficult." Expect personal-versus-commercial intention and a problem reframe before a feature proposal. Try Build now immediately in a separate disposable example; it must skip business homework. No live market data is needed.
