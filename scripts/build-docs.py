#!/usr/bin/env python3
"""Generate the static docs and search index. Run after editing ARTICLES below.

Screenshots live in assets/img/app (<name>-light.webp and <name>-dark.webp), captured from the real
app on disposable data. scripts/screens.json holds, for each screenshot, the measured boxes of the
things worth pointing at, as percentages of the frame. shot() turns a screenshot and a few notes into
an annotated figure: numbered boxes on the image and the same numbers in the caption.
"""
from pathlib import Path
import html
import json
import re

ROOT = Path(__file__).resolve().parent.parent
SCREENS = json.loads((ROOT / 'scripts' / 'screens.json').read_text())
DMG = 'https://github.com/micho8cho93/werkbord/releases/download/werkbord-v1.3.1-preview.1/Werkbord-preview.dmg'
TEAM_RELEASES = 'https://github.com/micho8cho93/werkbord/releases?q=werkbord-team&expanded=true'
ARTICLES = []


def article(slug, group, title, summary, sections):
    ARTICLES.append(dict(slug=slug, group=group, title=title, summary=summary, sections=sections))


def code(text):
    return '<pre><code>' + html.escape(text) + '</code></pre>'


def _pins(name, notes):
    data = SCREENS.get(name, {'pins': []})
    boxes, legend = '', ''
    for n, (index, text) in enumerate(notes, 1):
        box = data['pins'][index - 1] if index - 1 < len(data['pins']) else None
        if box and box['y'] < 97:
            x, y, w, h = box['x'], max(box['y'], 0.4), box['w'], box['h']
            h = min(h, 99.4 - y)
            w = min(w, 99.6 - x)
            boxes += f'<span class="pin" data-pin="{n}" style="left:{x}%;top:{y}%;width:{w}%;height:{h}%"><b>{n}</b></span>'
        legend += f'<li data-pin="{n}"><b>{n}</b><span>{text}</span></li>'
    return boxes, legend


def shot(name, alt, notes=(), caption='', title='Werkbord'):
    """A desktop screenshot in a window frame, annotated."""
    data = SCREENS.get(name, {'w': 1280, 'h': 800})
    boxes, legend = _pins(name, notes)
    src = '../assets/img/app/' + name
    return (f'<figure class="shot" id="fig-{name}"><div class="shot-win"><div class="shot-bar" aria-hidden="true"><i></i><i></i><i></i><span>{title}</span></div>'
            f'<button class="shot-img" type="button" aria-label="Enlarge: {html.escape(alt, quote=True)}" style="aspect-ratio:{data["w"]}/{data["h"]}">'
            f'<img class="shot-l" src="{src}-light.webp" alt="{html.escape(alt, quote=True)}" width="{data["w"]}" height="{data["h"]}" loading="lazy" decoding="async">'
            f'<img class="shot-d" src="{src}-dark.webp" alt="" width="{data["w"]}" height="{data["h"]}" loading="lazy" decoding="async">{boxes}</button></div>'
            f'<figcaption>{"<p>" + caption + "</p>" if caption else ""}{"<ol class=" + chr(34) + "pin-notes" + chr(34) + ">" + legend + "</ol>" if legend else ""}</figcaption></figure>')


def phones(*items):
    """Phone screenshots side by side: (name, alt, notes, caption)."""
    out = '<div class="shot-row">'
    for name, alt, notes, caption in items:
        data = SCREENS.get(name, {'w': 390, 'h': 844})
        boxes, legend = _pins(name, notes)
        src = '../assets/img/app/' + name
        out += (f'<figure class="shot phone" id="fig-{name}"><div class="shot-phone"><button class="shot-img" type="button" aria-label="Enlarge: {html.escape(alt, quote=True)}" style="aspect-ratio:{data["w"]}/{data["h"]}">'
                f'<img class="shot-l" src="{src}-light.webp" alt="{html.escape(alt, quote=True)}" width="{data["w"]}" height="{data["h"]}" loading="lazy" decoding="async">'
                f'<img class="shot-d" src="{src}-dark.webp" alt="" width="{data["w"]}" height="{data["h"]}" loading="lazy" decoding="async">{boxes}</button></div>'
                f'<figcaption><p>{caption}</p>{"<ol class=" + chr(34) + "pin-notes" + chr(34) + ">" + legend + "</ol>" if legend else ""}</figcaption></figure>')
    return out + '</div>'


def note(text, tone='info'):
    return f'<p class="doc-note" data-tone="{tone}">{text}</p>'


DOWNLOAD = f'<a href="{DMG}" data-mac-download><strong>Werkbord-preview.dmg</strong></a>'

# ---------------------------------------------------------------- Start here

article('getting-started', 'Start here', 'Getting started',
        'From download to your first agent at work, in five steps.', [
('before-you-start', 'What you need', '<ul><li>A Mac with macOS 13 or later, Apple Silicon or Intel.</li><li>Claude Code or Codex, installed and signed in with your own account. Werkbord drives the agent you already have; it never asks for an API key.</li><li>A project: any folder tracked by Git. If you can pick one from GitHub, Werkbord copies it to your Mac for you.</li></ul><p>Not a developer? <a href="../productivity.html">Werkbord for people who don’t write code</a> walks through the same steps in plainer terms.</p>'),
('install', '1. Install the app', f'<p>Download {DOWNLOAD}, open it, and drag <strong>Werkbord</strong> onto <strong>Applications</strong>. Open it from there.</p><p>The first time, it sets itself up in a few seconds and starts a background service. That service is what keeps agents and schedules running after you close the window.</p>' + note('This is an unsigned test preview. If macOS says it can’t open Werkbord, try once, then go to <strong>System Settings → Privacy &amp; Security</strong> and choose <strong>Open Anyway</strong>. <a href="installation.html#first-open">Step by step</a>.', 'warn')),
('project', '2. Add a project', '<p>Setup offers two ways in. Connect GitHub and pick repositories from your list (Werkbord clones them with your own sign-in), or choose a folder on this Mac that is already a Git repository.</p><p>Each repository becomes a project with its own Board, Calendar, Git view and Runs. Add more later with the <strong>+</strong> next to <em>Projects</em> in the sidebar.</p>'),
('first-task', '3. Start a task', '<p>In your project, choose <strong>New task</strong> (or press <kbd>N</kbd>). Write what done looks like under <em>What should an agent do?</em>, add any details, pick the agent, and choose <strong>Add and start agent</strong>.</p><p>The agent works in its own Git worktree: a separate copy of the repository. Your checkout does not change while it works.</p><p>Start with something you can check in two minutes, such as a failing test or a small copy change.</p>'),
('watch', '4. Watch it, and answer when asked', shot('board', 'The Werkbord board with tasks in Backlog, Doing, Review and Done',
    [(4, 'An agent has a question. The strip names it and takes you straight there.'), (6, 'A running agent: a cobalt ring, how long it has worked, and the last thing it did.'), (7, 'Needs you: the question is on the card with its answers. One click and it carries on.'), (8, 'Finished: the branch and how far ahead it is. <em>Move to Review</em> when you want to read it.')]) +
    '<p>The board updates live. You can also answer from the <a href="tour.html#control">Control Center</a>, the task itself, or your <a href="phone-access.html">phone</a>.</p>'),
('review', '5. Review and merge', '<p>Open the finished task to read the change. When you are happy, choose <strong>Merge…</strong>. Werkbord shows what will happen and checks the repository again the moment you confirm.</p>' +
    shot('merge', 'The merge confirmation, with commits, files and a conflict check',
         [(1, 'Merging happens on this computer only. Nothing is pushed and no pull request changes.'), (2, 'What you are about to merge, and whether Git found conflicts.'), (3, 'Keep the branch’s commits, or fast-forward only.'), (4, 'Only you can press this. An agent finishing never merges.')]) +
    '<p>Not right yet? Send it back with new instructions. The next run can pick up the same worktree.</p>'),
('next', 'Take it further', '<div class="doc-next-steps"><a href="tour.html"><strong>Tour the app</strong><span>Every screen, annotated.</span></a><a href="phone-access.html"><strong>Connect your phone</strong><span>Answer questions from anywhere.</span></a></div>')])

article('installation', 'Start here', 'Installation', 'Install the Mac app, open it the first time, keep it up to date.', [
('mac-app', 'Download and install', f'<p>Download {DOWNLOAD} (one file for Apple Silicon and Intel, macOS 13 or later). Open it and drag <strong>Werkbord</strong> onto <strong>Applications</strong>, then open Werkbord from Applications.</p><p>Keep the app in Applications. Moving or deleting it later does not break your installation, because the controller it starts lives outside the app.</p>'),
('first-open', 'Opening the preview the first time', '<p>The preview is ad-hoc signed and not notarized by Apple, so macOS refuses it the first time:</p><ol><li>Open Werkbord once and dismiss the message.</li><li>Open <strong>System Settings → Privacy &amp; Security</strong>.</li><li>Scroll to <em>Security</em> and choose <strong>Open Anyway</strong> next to the message about Werkbord.</li><li>Confirm with your password or Touch ID.</li></ol><p>Signed releases open after a single “downloaded from the Internet” question, like any app.</p>'),
('what-it-does', 'What the first launch sets up', '<ul><li>The <code>werkbord</code> program in <code>~/.local/bin</code>.</li><li>Your data and database in <code>~/Library/Application Support/werkbord</code>.</li><li>A login service, so Werkbord is working after you close the window and after you log in again.</li></ul><p>Closing the window hides the app. <kbd>⌘</kbd><kbd>Q</kbd> quits the app. Neither stops your controller, your agents or your schedules.</p>'),
('agents', 'Agents', '<p>Werkbord finds Claude Code and Codex the way your terminal does: the app reads your login shell’s <code>PATH</code>, so agents installed with Homebrew, npm or nvm are found. Sign in through the agent itself first. <strong>Settings → Agents</strong> shows what was found and links to each agent’s instructions; choose <strong>Check again</strong> after installing one.</p>'),
('update', 'Updates', '<p>The preview has no automatic updater: download the newer release and drag it over the old one. Signed releases update themselves from <strong>Werkbord → Check for Updates…</strong>, check the update’s signature before installing, and wait while agents are working. To turn off update checks, set <code>"noUpdateCheck": true</code> in <code>config.json</code>.</p>'),
('remove', 'Removing Werkbord', '<p>Quit the app and delete it from Applications. The background service keeps running until you remove it with <code>werkbord uninstall</code>, which keeps your data. See the <a href="commands.html">command reference</a>.</p>')])

article('tour', 'Start here', 'A tour of the app', 'Every screen, what it is for, and where the buttons that matter are.', [
('control', 'Control Center', '<p>Everything that needs you, from every project, in one list. Each item can be answered where it is shown.</p>' + shot('control', 'The Control Center: questions and blocked work on the left, projects, running agents and the schedule on the right',
    [(1, 'The count of what waits for you. It follows you everywhere in the sidebar.'), (2, 'A question from an agent, with its answers as buttons.'), (3, 'Every project at a glance: what needs input, what is running.'), (4, 'Agents working right now, with their last line of output.'), (5, 'What starts next: scheduled tasks and anything waiting for a slot.')])),
('board', 'Board', '<p>One project’s tasks in four columns. Moving a card follows the work: Backlog to Doing starts an agent, Review to Done opens the merge confirmation.</p>' + shot('board', 'A project board with running, waiting, finished and reviewed tasks',
    [(1, 'The project, its folder and branch. Click the name to switch projects.'), (2, 'Jump to any project, section or task. <kbd>⌘</kbd><kbd>K</kbd>.'), (3, 'New task. <kbd>N</kbd>.'), (4, 'Questions waiting, from any card in this project.'), (5, 'The state of every agent, counted.'), (6, 'Running: cobalt.'), (7, 'Needs you: amber, with the answers on the card.'), (8, 'Finished, ready to review.'), (9, 'In Review: <em>Merge…</em> or read it first.')])),
('task', 'A task', '<p>Opens over the board. The activity is the agent’s own account of what it is doing; the bottom of the panel is always the next thing you can do.</p>' + shot('task', 'A task panel with its activity feed and a question waiting for a decision',
    [(1, 'Where the task is, what it is called, and how it runs: agent, interaction, priority.'), (2, 'Stop the agent. The worktree is kept.'), (3, 'Activity, details, execution settings, its schedule and every run.'), (4, 'What the agent did, as it happened.'), (5, 'A decision for you, pinned where you can’t miss it.')])),
('calendar', 'Calendar', '<p>The same tasks, in time. Drag a task onto the week, or pick one and click a slot. Scheduled tasks start by themselves, in order, with the window closed.</p>' + shot('calendar', 'The week view with scheduled tasks, an unscheduled list and the queue',
    [(1, 'Move by week or jump back to today.'), (2, 'The project’s timezone. A schedule means the same thing after travel or a clock change.'), (3, 'Day or week.'), (4, 'A scheduled task.'), (5, 'Tasks without a time yet. Drag one onto the week.')])),
('git', 'Git', '<p>What the repository looks like right now, and what is waiting on you in it.</p>' + shot('git', 'The Git overview with branches ready to review and repository health',
    [(1, 'Health, branches, pull requests, uncommitted changes, worktrees and history.'), (2, 'A branch an agent finished, with its commits and where it stands against main.'), (3, 'Merge it on this computer, after a fresh check.'), (4, 'Repository health: findings you can turn into tasks. They never act on their own.'), (5, 'This computer and the remote, side by side.')])),
('runs', 'Runs', '<p>Every agent session, with how long it took and, when the agent reports it, tokens and cost.</p>' + shot('runs', 'The runs table with a history strip',
    [(1, 'The last 24 hours, half an hour per cell, coloured by real runs.'), (2, 'Filter by state.'), (3, 'A run in progress.'), (4, 'Every run: task, agent, runner, state, start, time, tokens and cost.')])),
('overview', 'Overview', '<p>A project’s Control Center: what needs you here, the recent runs, Git at a glance, and what happened today.</p>' + shot('overview', 'A project overview', [(1, 'What needs you in this project.'), (2, 'Recent runs.')])),
('phone', 'On a phone', '<p>The same app, laid out for a thumb. Questions come first; the tab bar keeps the rest one tap away.</p>' + phones(
    ('m-control', 'Werkbord on a phone: what needs you', [(2, 'Answer here.'), (1, 'Needs you, Board, Calendar, Git and Runs.')], 'Needs you'),
    ('m-board', 'Werkbord on a phone: the board', [(2, 'One column at a time.'), (3, 'New task.')], 'Board'),
    ('m-task', 'Werkbord on a phone: a task with a decision waiting', [(1, 'The decision, at the bottom of the screen.')], 'A task'))),
('colours', 'What the colours mean', '<dl class="tones"><dt><span class="tone" style="background:#2447FF"></span>Cobalt</dt><dd>Running, and the actions you can take.</dd><dt><span class="tone" style="background:#F2A93B"></span>Amber</dt><dd>Needs you: a question, a decision, something waiting.</dd><dt><span class="tone" style="background:#7B4FC0"></span>Purple</dt><dd>Blocked: the agent stopped rather than guess.</dd><dt><span class="tone" style="background:#2F8F55"></span>Green</dt><dd>Finished, ready for review, or done.</dd><dt><span class="tone" style="background:#C2413B"></span>Red</dt><dd>Failed, or high priority.</dd></dl>')])

# ---------------------------------------------------------------- Individual

article('agents', 'Individual', 'Agents and settings', 'Choose how a task runs, without repeating your setup.', [
('connect', 'Connect your agents', '<p>Werkbord finds the Claude Code and Codex already on your Mac. Sign in through the agent itself first; its sign-in stays with it. <strong>Settings → Agents</strong> shows what was found. If an agent is missing, follow <a href="troubleshooting.html#agent-missing">the agent troubleshooting steps</a>.</p>'),
('defaults', 'Set useful defaults', '<p>Execution settings inherit in this order: global, project, task, then a one-run override. The most specific value wins. Set your usual agent once in <strong>Settings → Task defaults</strong>, and override it only where a project needs something else.</p><p><strong>Agent default</strong> lets the agent choose its own model or reasoning level. The options come from the agents on your machine.</p>'),
('interaction', 'Choose how often it asks', '<dl><dt>Ask me when needed</dt><dd>The agent pauses at real decisions and puts the question on the card.</dd><dt>Autonomous</dt><dd>Fewer interruptions. Approvals that need a person still come to you.</dd><dt>Stop if blocked</dt><dd>The agent stops when it cannot continue without you, and says why.</dd></dl>'),
('run-settings', 'Settings belong to a run', '<p>Each run records the settings it started with. Changing a project default affects future runs only. To try another agent or model once, use a one-run override instead of changing the task.</p>')])

article('tasks-and-review', 'Individual', 'Tasks and review', 'Write the task, follow the run, decide what ships.', [
('create', 'Write a task an agent can finish', '<p>Say what done looks like, point at the files, and say what to leave alone. One outcome per task, so each can be reviewed and accepted on its own. If something is a judgment call, say “ask me first”.</p>'),
('runs', 'Follow the run', '<p>The board shows where the work is; the run shows what the agent is doing. A task in Doing can be running, waiting for you, or blocked. Moving a card never starts an agent by accident: only Backlog to Doing does, and it says so as you drag.</p>' + shot('task', 'A task with its activity and a decision waiting',
    [(4, 'The activity feed: what the agent read, changed and ran.'), (5, 'Answer here. Choose an option or write your own reply below it.'), (2, 'Stop the agent at any time. Its worktree stays for the next run.')])),
('blocked', 'Needs you, and blocked', '<p><strong>Needs you</strong> (amber) means the agent asked a question and is waiting. <strong>Blocked</strong> (purple) means it stopped rather than guess: the card says what it could not decide. Both show their answers on the card, in the Control Center and on your phone.</p>'),
('review', 'Review before merging', '<p>Agent work lives on its own branch in its own worktree. When a run finishes, the card says <em>Session finished · ready to review</em> with the branch and how many commits it is ahead. Read the change, run your checks, then <strong>Move to Review</strong> and <strong>Merge…</strong>.</p><p>The merge confirmation re-checks the repository when you confirm and refuses if anything moved. It merges on this computer only; pushing is a separate, confirmed step.</p>'),
('continue', 'Send it back, or hand it on', '<p>Use <strong>Continue with…</strong> to start another run on the same worktree, with new instructions or another agent. The next agent sees the existing changes.</p><p>For shared ownership, claims and reviewer sign-off across people, see <a href="team-workflow.html">Team workflow</a>.</p>')])

article('scheduling', 'Individual', 'Scheduling', 'Plan work around time, dependencies and how many agents run at once.', [
('schedule', 'Schedule a task', '<p>The Calendar and the Board show the same tasks. Drag a task from <em>Unscheduled</em> onto the week, or set a time in the task’s <em>Schedule</em> section, including from your phone.</p>' + shot('calendar', 'The Calendar week view',
    [(4, 'A scheduled task. Drag it to move it.'), (5, 'Unscheduled tasks, ready to drag.'), (2, 'Schedules use the project’s timezone.')]) +
    '<p>The controller starts scheduled work with the window closed. The Mac has to be awake and Werkbord’s service running. Each schedule is one attempt; rearm it to ask for another run.</p>'),
('dependencies', 'Dependencies', '<p>A task can wait for other tasks in the same project; its card says <em>Waits for …</em> until they reach Review. Cycles are refused. Finishing a dependency makes the next task eligible; it does not copy the dependency’s code into it, so merge the prerequisite first when the next task needs it.</p>'),
('capacity', 'How many agents at once', '<p>Each project has a concurrency limit from <strong>1</strong> to <strong>16</strong> (1 by default). Running, waiting and blocked runs all hold a slot. Tasks whose files might overlap are run one after the other instead of side by side.</p><p>If the queue seems stuck, look for a run waiting for your answer before raising the limit.</p>'),
('missed', 'Missed or interrupted runs', '<p>Choose whether a missed schedule runs late or is skipped after its grace period. An interrupted attempt is not rerun by itself: look at the task, then rearm it when you are ready.</p>')])

article('phone-access', 'Individual', 'Phone access', 'The same board on your phone, while the work stays on your Mac.', [
('connect', 'Connect your phone', '<p>Werkbord reaches your phone over Tailscale, a private network between your own devices. It has its own Tailscale node built in, so the Mac needs no extra app, and no Werkbord server sits in between.</p><ol><li>In Werkbord, open <strong>Settings → Phone access</strong>, turn it on, and sign in to Tailscale when asked. A free account is enough.</li><li>Install the <strong>Tailscale app on your phone</strong> and sign in with the same account. This is the one step Werkbord cannot do for you.</li><li>Scan the code with your phone’s camera. It opens Werkbord already signed in.</li></ol>' + shot('phone-settings', 'Settings, Phone access, with the address and a sign-in code (blurred here)', caption='The code carries your access token. Treat it like a password; it is blurred in this picture for that reason.')),
('home-screen', 'Put it on your home screen', '<p>Open the HTTPS address, then use your browser’s <strong>Add to Home Screen</strong>. With HTTPS and MagicDNS turned on for your tailnet, it installs like an app and can send notifications when an agent asks you something.</p>' + phones(
    ('m-board', 'The board on a phone', [(1, 'Questions waiting, at the top of every page.'), (4, 'Needs you, Board, Calendar, Git and Runs.')], 'Board'),
    ('m-task', 'A question answered from a phone', [(1, 'Tap an answer and the agent carries on.')], 'Answering'))),
('access', 'Keep it private', '<p>The phone link includes an access token. Keep screenshots of the code to yourself. Tailscale decides which devices can reach your Mac; Werkbord still asks for the token on every request. Turn phone access off in Settings at any time.</p>'),
('connection', 'If it will not open', '<p>Check that the Mac is awake, your phone’s Tailscale app is connected to the same account, and Werkbord is running. For setup and certificate problems, see <a href="troubleshooting.html#phone">troubleshooting</a>.</p>')])

article('security', 'Individual', 'Security, backups and recovery', 'What can reach Werkbord, what leaves your Mac, how its data is backed up, and what happens after a crash.', [
('exposure', 'What can reach Werkbord', '<p>The controller listens on <code>127.0.0.1</code>, so only programs on your computer can reach it. By default every request needs an access token, even from your own computer.</p><p>Phone access adds one more door: your own Tailscale network. Nothing is published to the internet, and Werkbord never uses Tailscale Funnel. The token is still required over that network, even if you turned the local requirement off. The phone link carries the token after a <code>#</code>, which browsers never send to a server.</p><p><code>werkbord doctor</code> warns you if the controller is listening beyond this computer.</p>'),
('leaves', 'What leaves your computer', '<p>Werkbord has no server and no account, so it sends nothing to us. Your agents talk to their own providers, Anthropic for Claude Code and OpenAI for Codex, exactly as they do in a terminal. Git and GitHub calls use your own sign-in.</p><p>Tailscale’s coordination service handles sign-in and helps your devices find each other. Traffic between them is end-to-end encrypted and passes through Tailscale’s relays only when a direct connection is impossible. Werkbord turns off Tailscale’s diagnostic log upload.</p><p>The controller also asks GitHub whether a newer release exists. To stop that, set <code>"noUpdateCheck": true</code> in <code>config.json</code>.</p>'),
('agents', 'What agents can do', '<p>Agents run as your macOS user, each task in its own Git worktree on its own branch, so your checkout is never touched. Werkbord never merges for them, and it never grants a permission request on your behalf: those always come to you, whichever interaction setting a task uses.</p><p>Werkbord keeps its own credentials out of the agent’s environment. That is not a sandbox: an agent can read anything your user can read.</p>'),
('programs', 'Other programs on your computer', '<p>A program that only needs to hand Werkbord a task or see what is running gets its own narrow token instead of yours. It cannot change settings, touch Git, or reach your private network.</p>' + code('werkbord access list\nwerkbord access revoke <id>') + '<p>Tokens are stored only as hashes, and at most sixteen programs can hold one. A test fails if the list of routes a narrow token can use changes without anyone reading the change.</p>'),
('lost', 'If you lose a token or a phone', '<p>Replace the token without restarting, then reconnect your browsers with the new one. A token set through the environment must be rotated where it is set.</p>' + code('werkbord token --rotate') + '<p>For a lost phone, also remove the device from your Tailscale account.</p>'),
('backups', 'Backups and updates', '<p>Before any upgrade that changes the database, Werkbord copies it into the <code>backups</code> folder of its data directory, <code>~/Library/Application Support/werkbord</code> on a Mac, and keeps the newest five copies. A database written by a newer version is refused instead of damaged.</p><p>The command-line updater and signed releases go further. They snapshot SQLite first and keep the previous program until the new one is verified: the new controller must report the expected version, read your projects and pass SQLite’s integrity check. If it does not, the old program and the snapshot are put back, and the failed database stays in <code>backups/failed-update-*</code> for inspection. Updates refuse to interrupt running agents unless you force them.</p><p>To restore by hand, stop Werkbord with <code>werkbord stop</code>, then run one of these:</p>' + code('werkbord db restore --latest\nwerkbord db restore /path/to/backup.db') + '<p>Your agents’ work lives in Git branches and worktrees, not in the database, and Werkbord never deletes a worktree by itself.</p>'),
('crashes', 'After a crash or restart', '<p>A schedule is claimed in the database in the same step that starts the run, so a restart cannot launch the same task twice. An interrupted run is recorded as failed and keeps its worktree, so you can look at what it did and run it again. Werkbord never reruns an interrupted attempt on its own.</p><p>On a paired machine, work that cannot be proven to have stopped waits for you to resolve it instead of being retried blindly.</p>'),
('tested', 'How it is tested', '<p>Continuous integration runs the Go tests, lint and builds on macOS and Linux. On Linux it adds the race detector and a browser suite at desktop and phone widths. On macOS it builds and packages the Mac app. Installer and upgrade tests run on both, and architecture tests keep Werkbord Team separate from the code that runs agents.</p><p>Planning a queue of 100 tasks does one Git inspection and took about 40 ms on an Apple Silicon Mac. The test fails if that work grows with the queue, so the timing is a diagnostic and the bound is the guarantee.</p><p>These are the project’s own checks, not an independent audit. The reports are in the repository: the <a href="https://github.com/micho8cho93/werkbord/blob/main/docs/audit/V2_STABILIZATION.md" rel="noopener">stabilization audit</a> and the <a href="https://github.com/micho8cho93/werkbord/blob/main/docs/audit/RELIABILITY_RELEASE.md" rel="noopener">reliability release notes</a>.</p>'),
('limits', 'Known limits', '<ul><li>Agents run as your user. Environment filtering is not a sandbox, and prompts, commits and agent output can contain secrets.</li><li>A worktree separates files, not ports, databases or other services. Tasks whose expected files overlap run one after the other, but Werkbord cannot predict what an agent edits later, so keep tightly coupled work at a concurrency of one.</li><li>Each schedule is one attempt. Recurring schedules are not built yet.</li><li>Werkbord does not keep your Mac awake, and a sleeping Mac pauses everything.</li><li>There is no push relay. Alerts reach a phone while the app is open and can wait until you reopen it.</li><li>The Mac preview is ad-hoc signed, not notarized, and has no updater. Windows support is experimental.</li><li>Work that cannot be proven stopped needs you to resolve it. Werkbord does not guess.</li></ul>')])

article('runners', 'Individual', 'Additional runners', 'Send tasks to another machine you own.', [
('pair', 'Pair a runner', '<p>Use the same Werkbord version on both machines. Install and sign in to the agent on the new machine, with the Git credentials it needs.</p><p>In <strong>Settings → Runners → Add runner</strong>, choose the projects it may work on and run the generated <code>werkbord join</code> command on the new machine. Pairing codes expire after five minutes.</p>'),
('repos', 'Bind a repository', '<p>Each runner works in its own clone. Bind the project to its path on that machine:</p>' + code('werkbord runner repo <project-id> /absolute/path/to/repository') + '<p>A binding does not copy your repository or your agent credentials anywhere.</p>'),
('routing', 'Turn on routing deliberately', '<p>A new runner starts with capacity 1 and automatic routing off. Check its repository and agent before giving it work.</p>'),
('team', 'Runners and Team', '<p>A runner runs your own tasks on another of your machines. Werkbord Team coordinates people, each with their own runner. For a shared workspace, see <a href="team-setup.html">Team setup</a>.</p>')])

# ---------------------------------------------------------------- Team

article('team-setup', 'Team', 'Team setup', 'Create a workspace, invite people, and run the first ticket.', [
('before', 'Before you start', '<p>These steps are for people with access to Werkbord Team. Each teammate runs agents on their own machine with individual Werkbord; the Team server only coordinates tickets, reviews and reported repository state.</p><p>Looking for access? <a href="../team.html#waitlist">Join the waitlist</a>.</p>'),
('install', '1. Download the Team server', f'<p>Download the <code>werkbord-team</code> archive for your server’s system from the <a href="{TEAM_RELEASES}">latest Werkbord Team release</a>: macOS, Linux and Windows, for Intel and ARM. Unpack it and put <code>werkbord-team</code> on the server’s <code>PATH</code>. It does not install a service or start anything by itself.</p>'),
('workspace', '2. Create the workspace', code('werkbord-team workspace create --name "Acme" --owner "Ada"\nwerkbord-team serve') + '<p>Use your own names. Creating the workspace prints the owner’s token and a sign-in link once: store them somewhere safe. The server runs in the foreground at <code>http://127.0.0.1:7430</code>.</p>' +
    shot('team-workspace', 'The Team console workspace page', [(1, 'Available to claim, yours, everyone else’s, waiting for your review, and repository warnings.'), (2, 'Amber when something waits for you.'), (3, 'Workspace, Projects, Board, My Work, Reviews, Repository, Activity.'), (4, 'What the team is working on right now.')], title='Werkbord Team · Acme')),
('network', '3. Make it reachable', '<p>To let teammates in, serve on a wider address with <code>--addr</code> and put it behind HTTPS, or on a private network. A workspace can also have a private network of its own (Team 2.5 and later). Read <a href="team-security.html">access and security</a> before sharing the address.</p>'),
('project', '4. Add a project', '<p>Open <strong>Projects</strong>, create one, and give it the repository’s address. Each teammate needs their own clone with that Git remote.</p>'),
('invite', '5. Invite your teammates', '<p>From the project’s <strong>People &amp; invites</strong>, create an invite with a role (member or reviewer) and an expiry, and send it to the person it is for. The code is shown once and can be revoked. Each member gets their own access token; a lost token can be reissued, and the old one stops working.</p>'),
('runner', '6. Run the first ticket', '<p>Install <a href="installation.html">Werkbord</a> on each teammate’s Mac and add the repository with the matching remote. Write a ticket, make it Available, claim it, and choose <strong>Open in my runner</strong>. Werkbord adds it as a task; you start the agent. Continue with <a href="team-workflow.html">Team workflow</a>.</p>')])

article('team-workflow', 'Team', 'Team workflow', 'Clear ownership and honest status while everyone works on their own machine.', [
('tickets', 'From Backlog to Done', '<p class="workflow-line">Backlog → Available → In Progress → Review → Done</p><p>Write tickets in Backlog and make them Available when someone can start. Claiming is one guarded operation: two people pressing Claim at once get one owner and one clear answer.</p>' +
    shot('team-board', 'The Team board with five columns', [(1, 'The project, your role in it, people and invites.'), (2, 'Available: anyone on the project can claim one.'), (3, 'Claim it. It becomes yours, with a branch name ready.'), (4, 'Your ticket, outlined in cobalt.'), (5, 'The pull request, as your Werkbord reported it.')], title='Werkbord Team · Acme')),
('local', 'Work in your own Werkbord', '<p>On a ticket you hold, <strong>Open in my runner</strong> gives you the task text and a handoff to import. Werkbord matches it to your local project by Git remote and creates the task; you start the agent. The Team server never runs agents and never receives your credentials.</p>' +
    shot('team-ticket', 'A ticket open beside the board', [(1, 'What you may do, depending on your role and whether you hold it.'), (2, 'Status, owner, branch and pull request, as reported.'), (3, 'Commits reported by the holder’s Werkbord.')], title='Werkbord Team · Acme')),
('reviews', 'Review and sign off', '<p>Submit finished work for review. The diff lives on your Git host; record the merge there, then a reviewer marks the ticket Done. Done is refused while the pull request is open, and a reviewer cannot sign off their own work unless they own the project.</p>'),
('repository', 'Catch collisions early', '<p>The Repository tab shows what members’ Werkbords reported: branches, pull requests, and what needs attention, worst first. When two active branches change the same file, both owners see it while it is still a conversation.</p>' +
    shot('team-repository', 'The Repository tab with an overlap warning', [(1, 'Two branches change the same file. Whoever merges second may have conflicts.'), (2, 'Needs attention, pull requests and branches.')], title='Werkbord Team · Acme') +
    '<p>This is awareness, not action. Team never rebases, merges or resolves anything; that stays in each person’s checkout and on your Git host.</p>')])

article('team-security', 'Team', 'Access and security', 'What is shared, who can act on it, and how it is kept.', [
('data', 'What Team stores', '<p>Coordination only: tickets, membership, reviews, and the branch, commits and pull request state that members’ Werkbords report. Never file contents, diffs, paths on anyone’s machine, or credentials. Inputs are validated on the way in: branch names, commit hashes, pull request addresses and relative file paths.</p>'),
('roles', 'Project roles', '<dl><dt>Member</dt><dd>Claims tickets and contributes work.</dd><dt>Reviewer</dt><dd>Reviews and signs off work in the project.</dd><dt>Owner</dt><dd>Manages the project, its people and its tickets.</dd></dl><p>Project membership decides what a person can see and do. The rules are enforced by the server, not by the page.</p>'),
('tokens', 'Tokens and invites', '<p>Access tokens carry 256 bits of randomness. Give each person their own. Reissuing a token invalidates the old one.</p><p>Invite codes are shown once, stored only as hashes, and can expire or be revoked. An invite is separate from the member’s own token.</p>'),
('hosting', 'Hosting and backups', '<p>The server listens on this computer only until you give it <code>--addr</code>. Use HTTPS beyond a trusted private network. Set the data directory with <code>WERKBORD_TEAM_DATA_DIR</code>.</p><p>From Team 2.6, a workspace keeps a full copy of its data on each Workspace Host; <code>--storage single-file</code> keeps it in one SQLite file, <code>team.db</code>. Replication is not a backup: set <code>WERKBORD_TEAM_BACKUP_DIR</code> for scheduled, verified backups. For a single file, back up a running server with SQLite’s <code>.backup</code> command rather than copying the file.</p>'),
('sync', 'Board sync', '<p>Open consoles receive changes over long polling and reread the current state when they reconnect. In the product’s tests, a change appears on another board in under a second; real networks vary.</p>')])

# ---------------------------------------------------------------- Reference

article('troubleshooting', 'Reference', 'Troubleshooting', 'Start with the app, then the service, then the connection that fails.', [
('first', 'Start here', '<p>Open Werkbord. If the window cannot reach the controller, it says why and offers <strong>Try again</strong>, <strong>Show details</strong> and <strong>Open logs</strong>. <strong>Help → Show Diagnostics…</strong> collects the rest.</p><p>From a terminal, with <code>~/.local/bin</code> on your <code>PATH</code>:</p>' + code('werkbord status\nwerkbord doctor\nwerkbord logs -n 100') + '<p>Keep tokens and private task details out of anything you share.</p>'),
('agent-missing', 'My agent is missing', '<p>Check <strong>Settings → Agents</strong>. If the agent is not found, install it and sign in through it, then choose <strong>Check again</strong>. If <code>claude --version</code> or <code>codex --version</code> works in your terminal but Werkbord still cannot find it, run <code>werkbord setup</code> from that terminal to refresh the service’s environment, then <code>werkbord restart</code>.</p>'),
('open', 'Werkbord will not open', '<p>On the first launch of the preview, use <a href="installation.html#first-open">Open Anyway</a>. If the window says another program is using port 7420, quit that program or choose <strong>Show details</strong> to see which one.</p>'),
('phone', 'My phone cannot connect', '<p>Keep the Mac awake. Check that phone access is on and that your phone’s Tailscale app is signed in to the same account. Scan a fresh code from <strong>Settings → Phone access</strong>. If the page loads but home-screen installation or notifications fail, check HTTPS and MagicDNS for your tailnet.</p>'),
('queue', 'A scheduled task is not starting', '<p>Check that its dependencies are done and a slot is free: waiting and blocked runs still hold one. Look at the missed-run policy and any interrupted attempt, then rearm it.</p>'),
('handoff', 'A Team handoff cannot find my project', '<p>Check that Werkbord is running and that your local project has the same Git remote as the Team project. Importing never starts an agent by itself.</p>')])

article('commands', 'Reference', 'Command reference', 'The werkbord command, for people who like a terminal.', [
('local', 'The local service', '<p>The Mac app installs the <code>werkbord</code> command in <code>~/.local/bin</code>. Add that folder to your <code>PATH</code> to use it.</p><div class="table-scroll"><table><thead><tr><th>Command</th><th>Purpose</th></tr></thead><tbody>' + ''.join('<tr><td><code>werkbord ' + a + '</code></td><td>' + b + '</td></tr>' for a, b in [
('status', 'Check the installed service.'), ('start', 'Start the service.'), ('stop', 'Stop the service. Refuses while agents are working.'), ('restart', 'Restart the service.'), ('open', 'Open the board in a browser.'), ('open --qr', 'Show a phone sign-in code.'), ('doctor', 'Check setup and dependencies.'), ('logs -n 100', 'Read recent service logs.'), ('setup', 'Refresh the service’s environment and settings.'), ('update --check', 'Check for an update.'), ('uninstall', 'Remove the service; keep your data.')]) + '</tbody></table></div>'),
('projects', 'Add a project', code('werkbord project add ~/code/my-app') + '<p>Use the path of a local Git repository.</p>'),
('team', 'Team server', code('werkbord-team version\nwerkbord-team workspace create --name "Acme" --owner "Ada"\nwerkbord-team serve') + '<p><code>--addr</code> chooses the listening address. <code>WERKBORD_TEAM_DATA_DIR</code> selects the data directory; <code>WERKBORD_TEAM_LOG_LEVEL</code> and <code>WERKBORD_TEAM_LOG_FORMAT</code> control logging. Read <a href="team-setup.html">Team setup</a> before serving a workspace to other machines.</p>')])

# ---------------------------------------------------------------- build

home = (ROOT / 'index.html').read_text()
nav = re.search(r'<header class="nav">.*?</header>', home, re.S).group()
nav = (nav.replace('href="./" aria-current="page"', 'href="../"').replace('href="./"', 'href="../"')
       .replace('href="team.html"', 'href="../team.html"').replace('href="productivity.html"', 'href="../productivity.html"')
       .replace('href="docs/getting-started.html"', 'href="getting-started.html" aria-current="page"').replace('src="assets/', 'src="../assets/'))
footer = '<footer class="foot"><div class="wrap"><span class="footer-brand">werkbord</span><nav aria-label="Footer"><a href="../team.html">Team</a><a href="../#download">Download</a><a href="getting-started.html">Docs</a><a href="../productivity.html">Productivity</a></nav></div></footer>'
head_script = re.search(r'<script>.*?</script>', home, re.S).group()
search = []
for i, page in enumerate(ARTICLES):
    sidebar = ''
    group = None
    for item in ARTICLES:
        if item['group'] != group:
            if group is not None:
                sidebar += '</ul></div>'
            group = item['group']
            sidebar += '<div class="doc-nav-group"><h2>' + group + '</h2><ul>'
        current = ' aria-current="page"' if item == page else ''
        sidebar += '<li><a href="' + item['slug'] + '.html"' + current + '>' + item['title'] + '</a></li>'
    sidebar += '</ul></div>'
    body = ''
    toc = ''
    for sid, title, content in page['sections']:
        body += '<section id="' + sid + '"><h2>' + title + '</h2>' + content + '</section>\n'
        toc += '<li><a href="#' + sid + '">' + title + '</a></li>'
    count = [0]

    def copy_block(match):
        count[0] += 1
        cid = 'command-' + str(count[0])
        return '<div class="doc-code"><div class="code-top"><span>Terminal</span><button class="btn sm" type="button" data-copy="#' + cid + '"><span class="idle">Copy</span><span class="done">Copied</span></button></div><pre><code id="' + cid + '">' + match[1] + '</code></pre></div>'
    body = re.sub(r'<pre><code>(.*?)</code></pre>', copy_block, body, flags=re.S)
    prev_next = '<nav class="doc-pagination" aria-label="More documentation">'
    for offset, label in [(-1, 'Previous'), (1, 'Next')]:
        n = i + offset
        if 0 <= n < len(ARTICLES):
            item = ARTICLES[n]
            prev_next += '<a href="' + item['slug'] + '.html" class="' + label.lower() + '"><span>' + label + '</span><strong>' + item['title'] + '</strong></a>'
    prev_next += '</nav>'
    markup = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{page['title']} | Werkbord Docs</title><meta name="description" content="{html.escape(page['summary'], quote=True)}"><meta name="theme-color" content="#F5F5F2">
<link rel="icon" href="../assets/img/favicon.svg" type="image/svg+xml"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500;600&display=swap">
{head_script}<link rel="stylesheet" href="../assets/css/site.css"><link rel="stylesheet" href="../assets/css/docs.css"></head>
<body><a class="skip" href="#main">Skip to content</a>{nav}
<div class="docs-layout wrap">
<aside class="docs-sidebar"><details class="docs-menu" open><summary>Documentation <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg></summary><div class="docs-menu-body">
<label class="doc-search"><span class="sr">Search documentation</span><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/></svg><input id="docs-search" type="search" placeholder="Search docs" autocomplete="off" aria-controls="search-results"><kbd>/</kbd></label>
<div id="search-results" hidden><p class="search-status" role="status" aria-live="polite"></p><ul></ul></div><nav id="docs-nav" aria-label="Documentation">{sidebar}</nav></div></details></aside>
<main id="main" class="doc-article"><header class="doc-title"><h1>{page['title']}</h1><p>{page['summary']}</p></header>{body}{prev_next}</main>
<aside class="doc-outline"><nav aria-label="On this page"><h2>On this page</h2><ul>{toc}</ul></nav></aside>
</div>{footer}<script src="../assets/js/common.js"></script><script src="../assets/js/download.js?v=1.3.1-preview.1"></script><script src="../assets/js/docs.js"></script></body></html>'''
    (ROOT / 'docs' / (page['slug'] + '.html')).write_text(markup)
    text = ' '.join(title + ' ' + re.sub('<[^>]+>', ' ', content) for _, title, content in page['sections'])
    search.append(dict(title=page['title'], url=page['slug'] + '.html', summary=page['summary'], text=re.sub(r'\s+', ' ', html.unescape(text)).strip()))
(ROOT / 'docs/search-index.json').write_text(json.dumps(search, ensure_ascii=False, indent=2) + '\n')
print(f'Built {len(ARTICLES)} documentation pages and search index.')
