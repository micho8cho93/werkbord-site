#!/usr/bin/env python3
"""Generate the static docs and search index. Run after editing ARTICLES below."""
from pathlib import Path
import html
import json
import re

ROOT = Path(__file__).resolve().parent.parent
ARTICLES = []

def article(slug, group, title, summary, sections):
    ARTICLES.append(dict(slug=slug, group=group, title=title, summary=summary, sections=sections))

def code(text):
    return '<pre><code>' + html.escape(text) + '</code></pre>'

article('getting-started', 'Start here', 'Getting started',
        'From a local repository to your first agent run.', [
('before-you-start', 'Before you start', '<p>You need Git, a local repository, and Claude Code or Codex installed and signed in. Werkbord uses the agents and credentials already on your machine.</p><p>Joining a team? Start with <a href="team-setup.html">Team setup</a>, then return here to prepare your own runner.</p>'),
('install', '1. Install Werkbord', code('curl -fsSL https://raw.githubusercontent.com/micho8cho93/werkbord/main/scripts/install.sh | sh') + '<p>The installer starts a background service and opens setup in your browser. Add a repository when prompted. See <a href="installation.html">installation</a> for requirements and Windows support.</p>'),
('first-task', '2. Start a task', '<p>Open your project, choose <strong>New task</strong>, and describe a small change. Choose your agent, then start the run. Werkbord keeps the task’s changes in an isolated Git worktree.</p><p>Try something easy to review, such as adding a test or fixing a small UI issue.</p>'),
('review', '3. Review the result', '<p>Watch progress from the board. If the agent needs an answer or approval, open the task and respond. When it finishes, inspect the diff and test the change before merging.</p><p>Moving a card tracks workflow. Starting a run is a separate action. See <a href="tasks-and-review.html">tasks and review</a> for the full flow.</p>'),
('next', 'Take it further', '<div class="doc-next-steps"><a href="phone-access.html"><strong>Connect your phone</strong><span>Check runs and respond on the move.</span></a><a href="team-setup.html"><strong>Set up a team</strong><span>Coordinate work across local runners.</span></a></div>')])

article('installation', 'Start here', 'Installation', 'Install, update, and manage your local runner.', [
('requirements', 'Requirements', '<p>macOS or Linux, Git, and a signed-in Claude Code or Codex CLI. Run the installer from a terminal where your agent command works.</p>'),
('macos-linux', 'macOS and Linux', code('curl -fsSL https://raw.githubusercontent.com/micho8cho93/werkbord/main/scripts/install.sh | sh') + '<p>The installer verifies the release checksum, puts <code>werkbord</code> in <code>~/.local/bin</code> (with <code>devboard</code>, its earlier name, beside it), and sets up the local database, access token, and user background service. Browser setup handles repositories and optional GitHub integration.</p><p>If your shell cannot find <code>werkbord</code>, add <code>~/.local/bin</code> to your PATH and open a new terminal.</p>'),
('windows', 'Windows', '<p>Native Windows support is experimental. In PowerShell:</p>' + code('irm https://raw.githubusercontent.com/micho8cho93/werkbord/main/scripts/install.ps1 | iex') + '<p>Native Windows does not run the coding agents. To run agents on Windows, use the Linux installer inside WSL with Git and your agent installed there.</p>'),
('check', 'Check your setup', code('werkbord status\nwerkbord doctor\nwerkbord open') + '<p>If the browser opens but agents are missing, run <code>werkbord setup</code> from the terminal where Claude Code or Codex works. The background service needs that environment too.</p>'),
('update', 'Update or remove', code('werkbord update --check\nwerkbord update') + '<p>Updates create an automatic database backup. Check <code>werkbord status</code> and <code>werkbord doctor</code> after updating.</p><p><code>werkbord uninstall</code> removes the installed service and binary while preserving your data. Use <a href="commands.html">the command reference</a> for service controls.</p>')])

article('agents', 'Individual', 'Agents and settings', 'Choose how a task runs, without repeating your setup.', [
('connect', 'Connect your agents', '<p>Werkbord discovers installed Claude Code and Codex CLIs. Sign in through the agent’s own CLI first. Authentication stays with that agent on your machine.</p><p>If discovery fails, check the command in your terminal and follow <a href="troubleshooting.html#agent-missing">the agent troubleshooting steps</a>.</p>'),
('defaults', 'Set useful defaults', '<p>Execution settings inherit in this order: global, project, task, then a one-run override. The most specific value wins. Set your usual agent at the global level and override it only where needed.</p><p><strong>Agent default</strong> lets the installed agent choose its model or reasoning setting. Available options come from the agents on your machine.</p>'),
('interaction', 'Choose an interaction style', '<dl><dt>Ask when needed</dt><dd>Let the agent pause for your input.</dd><dt>Autonomous</dt><dd>Reduce routine interruptions. Required approvals still need a person.</dd><dt>Stop if blocked</dt><dd>Stop when the task cannot continue without intervention.</dd></dl>'),
('run-settings', 'Settings belong to a run', '<p>Each run records its selected settings when it starts. Changing a project default affects future runs. Use a one-run override to try a different agent or model without changing the task’s defaults.</p>')])

article('tasks-and-review', 'Individual', 'Tasks and review', 'Plan the change, run an agent, then decide what ships.', [
('create', 'Write a useful task', '<p>Give the task a clear outcome, the relevant files, and a way to check the result. Choose the project and agent before starting. A small, verifiable change is a useful first run.</p>'),
('runs', 'Follow the run', '<p>The board shows workflow; the run shows execution. A task can be in progress while its agent is running, waiting, or blocked. Moving a card does not implicitly launch an agent.</p><p>Open a waiting task to answer a question or approve a command. A blocked task needs attention before it can proceed.</p>'),
('review', 'Review before merging', '<p>Agent changes live in an isolated Git worktree. Open the diff, check the files touched, and run the project’s checks. Finishing a run does not merge it.</p><p>If it needs another pass, continue the task with more instructions. A continuation can reuse its worktree so the next agent has the existing changes.</p>'),
('handoff', 'Continue with another agent', '<p>Use <strong>Continue with</strong> to hand off a task for review or fixes. Keep the requested outcome explicit so the next run can pick up the work.</p><p>For shared ownership, claims, and reviewer sign-off, see <a href="team-workflow.html">Team workflow</a>.</p>')])

article('scheduling', 'Individual', 'Scheduling', 'Plan work around time, dependencies, and available capacity.', [
('schedule', 'Schedule a task', '<p>The calendar and board show the same tasks. Set a time in the scheduling form, including from your phone. Explicitly arm auto-run when you want the task to start automatically.</p><p>The controller handles scheduled work even with the browser closed. The computer and service must remain running.</p>'),
('dependencies', 'Set dependencies', '<p>A task can wait for other tasks in the same project. Cycles are rejected. Completing a dependency makes the next task eligible; it does not transfer the dependency’s code.</p><p>Merge or otherwise integrate prerequisite changes in Git before expecting a dependent task to use them.</p>'),
('capacity', 'Control concurrency', '<p>Capacity defaults to <strong>1</strong> and can be set from <strong>1 to 16</strong>. Starting, running, waiting, and blocked runs consume capacity. Unknown or overlapping paths are serialized to avoid unsafe parallel work.</p><p>If the queue stalls, check waiting or blocked runs before raising the limit.</p>'),
('missed', 'Missed or interrupted runs', '<p>Choose whether a missed schedule runs late or skips after its grace period. An interrupted attempt does not automatically rerun. Inspect the task and rearm it when you are ready.</p>')])

article('phone-access', 'Individual', 'Phone access', 'Use the same board from your phone while work runs on your computer.', [
('connect', 'Connect both devices', '<ol><li>Sign in to Tailscale during Werkbord setup.</li><li>Install Tailscale on your phone and sign in to the same account.</li><li>On your computer, display the connection QR code:</li></ol>' + code('werkbord open --qr') + '<p>Scan it with your phone. Keep your computer awake and online while agents are running. You can also open the connection with <code>werkbord open --phone</code>.</p>'),
('home-screen', 'Add it to your home screen', '<p>Open the HTTPS address, then use your browser’s <strong>Add to Home Screen</strong> option. HTTPS and MagicDNS must be enabled for your tailnet so installation and browser notifications can work.</p><p>An HTTP address can still travel over an encrypted Tailscale connection, but it does not enable the browser’s HTTPS-only features.</p>'),
('access', 'Keep the connection private', '<p>The phone link includes an access token. Treat it like a password and keep QR screenshots private. Tailscale controls network access; Werkbord still requires a token for remote access.</p><p>You can turn phone access off in Settings.</p>'),
('connection', 'If the board will not open', '<p>Check that both devices are online, Tailscale is connected to the same account, and Werkbord is running. Run <code>werkbord doctor</code> on the computer for connection diagnostics.</p><p>For setup and certificate issues, see <a href="troubleshooting.html#phone">troubleshooting</a>.</p>')])

article('runners', 'Individual', 'Additional runners', 'Send tasks to another machine you control.', [
('pair', 'Pair a runner', '<p>Use the same Werkbord version on both machines. Install and sign in to the agent CLI on the new machine, with the Git credentials it needs.</p><p>In <strong>Settings → Runners → Add runner</strong>, choose its allowed projects. Run the generated <code>werkbord join</code> command on the new machine. Pairing codes expire after five minutes.</p>'),
('repos', 'Bind a repository', '<p>Each runner needs its own local clone. Bind the project to its absolute path:</p>' + code('werkbord runner repo <project-id> /absolute/path/to/repository') + '<p>Replace the placeholders with the project ID and real clone path. A project binding does not copy your repository or agent credentials.</p>'),
('routing', 'Enable routing deliberately', '<p>A new runner starts with capacity 1 and automatic routing off. Verify the repository and agent before enabling it for work. Stop an unneeded controller on that machine if it is intended only as a runner.</p>'),
('team', 'Runners and Team', '<p>An additional runner executes your own tasks on another machine. Werkbord Team coordinates people and their local runners. For a shared team workspace, use <a href="team-setup.html">Team setup</a>.</p>')])

article('team-setup', 'Team', 'Team setup', 'Create a workspace, invite people, and connect local runners.', [
('before', 'Before you install', '<p>These steps are for people with access to Werkbord Team. Each teammate runs agents on their own machine. The Team server coordinates tickets, reviews, and repository status.</p><p>Looking for access? <a href="../team.html#waitlist">Join the Team waitlist</a>.</p>'),
('install', '1. Install the Team server', code('curl -fsSL https://raw.githubusercontent.com/micho8cho93/werkbord/main/scripts/install-team.sh | sh') + '<p>The installer places the <code>werkbord-team</code> executable on your machine. It does not create a background service or start a server.</p>'),
('workspace', '2. Create a workspace', code('werkbord-team workspace create --name "Acme" --owner "Ada"\nwerkbord-team serve') + '<p>Replace the example names with yours. Workspace creation prints an owner token and sign-in link once. Store them securely. The server runs in the foreground at <code>http://127.0.0.1:7430</code>.</p>'),
('network', '3. Make it reachable', '<p>For other machines, serve on an appropriate network interface with <code>--addr</code> and put the server behind an HTTPS reverse proxy or on a trusted private network. Keep public access behind HTTPS; plain HTTP can expose tokens.</p><p>See <a href="team-security.html">access and security</a> before sharing the server address.</p>'),
('project', '4. Add a project', '<p>Open <strong>Projects</strong>, create a project, and add its repository address. Each teammate will need a local clone with that Git remote.</p>'),
('invite', '5. Invite your teammates', '<p>Open the project’s <strong>People &amp; invites</strong>, create an invite, select a role and expiry, and share the code with its intended recipient. Codes are shown once and can be revoked. Each member gets their own access token.</p><p>A lost token can be reissued; the old token stops working.</p>'),
('runner', '6. Run your first ticket', '<p>Install <a href="installation.html">individual Werkbord</a> on each teammate’s machine. Add a local repository with the matching Git remote. Create a ticket in Backlog and promote it to Available. Claim it, then choose <strong>Open in my runner</strong>.</p><p>Importing a handoff creates the local task. The agent starts when you start the run. Continue with <a href="team-workflow.html">Team workflow</a>.</p>')])

article('team-workflow', 'Team', 'Team workflow', 'Keep ownership and review clear while everyone works locally.', [
('tickets', 'From backlog to done', '<p class="workflow-line">Backlog → Available → In progress → Review → Done</p><p>Prepare a ticket in Backlog, then make it Available when someone can pick it up. Claiming assigns one owner through a guarded operation, so two people cannot claim the same ticket at once.</p>'),
('local', 'Work in your local runner', '<p>Use <strong>Open in my runner</strong> on your claimed ticket. The handoff matches your local repository by Git remote. Review the imported task and start the agent yourself.</p><p>Your runner handles execution and files. The Team server does not run agents or receive your agent credentials.</p>'),
('reviews', 'Request a review', '<p>Move finished work into Review and ask a project reviewer to check it. A reviewer cannot sign off their own work unless they are the project owner. An open pull request prevents the ticket from reaching Done.</p><p>Resolve feedback in your local runner, then return the ticket for review.</p>'),
('repository', 'Check repository status', '<p>The Repository view shows last-reported branches, conflicts, overlapping work, and branches behind the target. Use it to spot coordination problems early.</p><p>Status is a report, not a merge operation. Resolve conflicts and integrate changes in Git, then refresh the report.</p>')])

article('team-security', 'Team', 'Access and security', 'Know what is shared and who can act on it.', [
('data', 'What Team stores', '<p>Team stores coordination data such as tickets, reviews, membership, and repository status. Code execution and file contents stay with local runners. Agent and Git credentials stay on each person’s machine.</p>'),
('roles', 'Project roles', '<dl><dt>Member</dt><dd>Pick up tickets and contribute work.</dd><dt>Reviewer</dt><dd>Review work and provide sign-off within the project.</dd><dt>Owner</dt><dd>Manage the project and its access.</dd></dl><p>Project membership scopes what a person can see and do. Review rules prevent ordinary reviewers from approving their own tickets.</p>'),
('tokens', 'Tokens and invites', '<p>Access tokens use 256 bits of randomness. Store them securely and give each person their own token. Reissue a lost token to invalidate it.</p><p>Invite codes are shown once, stored as hashes, and can expire or be revoked. An invite code is separate from the member’s personal access token.</p>'),
('hosting', 'Hosting and backups', '<p>The server binds to localhost by default. Use HTTPS when exposing it beyond a trusted private connection. Configure the data directory with <code>WERKBORD_TEAM_DATA_DIR</code>.</p><p>The workspace lives in <code>team.db</code>. For a running server, use SQLite’s <code>.backup</code> command to create a consistent snapshot rather than copying an actively written database file.</p>'),
('sync', 'Board sync', '<p>Connected boards receive updates through long polling. Reconnecting clients reread the current state. In the product’s tests, board changes appear in under one second; network conditions affect real-world timing.</p>')])

article('troubleshooting', 'Reference', 'Troubleshooting', 'Start with the local service, then check the failing connection.', [
('first', 'Start here', code('werkbord status\nwerkbord doctor\nwerkbord logs -n 100') + '<p>Status checks the service. Doctor checks setup and dependencies. Logs show recent activity. Keep tokens and private task details out of anything you share.</p>'),
('agent-missing', 'My agent is missing', '<p>Run <code>claude --version</code> or <code>codex --version</code> in your terminal. If the command is missing, fix the agent installation first. Confirm that the agent is signed in.</p><p>If it works in the terminal but not Werkbord, run <code>werkbord setup</code> there to refresh the service environment, then <code>werkbord restart</code>.</p>'),
('browser', 'The local page will not open', '<p>Check <code>werkbord status</code>. Start a stopped service with <code>werkbord start</code>, then use <code>werkbord open</code> to get the current authenticated link.</p><p>If it still fails, inspect doctor output and recent logs before restarting repeatedly.</p>'),
('phone', 'My phone cannot connect', '<p>Keep the computer awake. Confirm that phone access is enabled and both devices are connected to the same Tailscale account. Generate a fresh link with <code>werkbord open --qr</code>.</p><p>If the page loads but home-screen installation or notifications fail, check HTTPS and MagicDNS for your tailnet.</p>'),
('queue', 'A scheduled task is not starting', '<p>Check that auto-run is armed, dependencies are complete, and capacity is available. Waiting and blocked runs still occupy slots. Inspect the missed-run policy and any interrupted attempt before rearming it.</p>'),
('handoff', 'A Team handoff cannot find my project', '<p>Check that individual Werkbord is running and that the local project has the matching Git remote. Import the handoff into that project. Importing alone does not start an agent.</p><p>For server or workspace setup, return to <a href="team-setup.html">Team setup</a>.</p>')])

article('commands', 'Reference', 'Command reference', 'The everyday commands for individual Werkbord and Team.', [
('local', 'Local service', '<div class="table-scroll"><table><thead><tr><th>Command</th><th>Purpose</th></tr></thead><tbody>' + ''.join('<tr><td><code>werkbord ' + a + '</code></td><td>' + b + '</td></tr>' for a,b in [
('setup','Configure repositories, agents, and the service.'),('status','Check the installed service.'),('start','Start the service.'),('stop','Stop the service.'),('restart','Restart the service.'),('open','Open the board.'),('open --qr','Show a phone connection QR code.'),('doctor','Check setup and dependencies.'),('logs -n 100','Read recent service logs.'),('update --check','Check for an update.'),('update','Update with a database backup.'),('uninstall','Remove the service and binary; preserve data.')]) + '</tbody></table></div>'),
('projects', 'Add a project', code('werkbord project add ~/code/my-app') + '<p>Use the path to an existing local repository.</p>'),
('team', 'Team server', code('werkbord-team version\nwerkbord-team workspace create --name "Acme" --owner "Ada"\nwerkbord-team serve') + '<p>Use <code>--addr</code> to choose the listening address. <code>WERKBORD_TEAM_DATA_DIR</code> selects the data directory; <code>WERKBORD_TEAM_LOG_LEVEL</code> and <code>WERKBORD_TEAM_LOG_FORMAT</code> control logging.</p><p>See <a href="team-setup.html">Team setup</a> before serving a workspace to other machines.</p>')])

home = (ROOT / 'index.html').read_text()
nav = re.search(r'<header class="nav">.*?</header>', home, re.S).group()
nav = nav.replace('href="./" aria-current="page"', 'href="../"').replace('href="./"', 'href="../"').replace('href="team.html"', 'href="../team.html"').replace('href="#install"', 'href="../#install"').replace('href="docs/getting-started.html"', 'href="getting-started.html" aria-current="page"').replace('src="assets/', 'src="../assets/')
footer = '<footer class="foot"><div class="wrap"><span class="footer-brand">werkbord</span><nav aria-label="Footer"><a href="../team.html">Team</a><a href="../#install">Install</a><a href="getting-started.html">Docs</a></nav></div></footer>'
head_script = re.search(r'<script>.*?</script>', home, re.S).group()
search = []
for i, page in enumerate(ARTICLES):
    sidebar = ''
    group = None
    for item in ARTICLES:
        if item['group'] != group:
            if group is not None: sidebar += '</ul></div>'
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
</div>{footer}<script src="../assets/js/common.js"></script><script src="../assets/js/docs.js"></script></body></html>'''
    (ROOT / 'docs' / (page['slug'] + '.html')).write_text(markup)
    searchable = ' '.join(title + ' ' + re.sub('<[^>]+>', ' ', content) for _, title, content in page['sections'])
    search.append(dict(title=page['title'], url=page['slug'] + '.html', summary=page['summary'], text=html.unescape(searchable)))
(ROOT / 'docs/search-index.json').write_text(json.dumps(search, ensure_ascii=False, indent=2) + '\n')
print(f'Built {len(ARTICLES)} documentation pages and search index.')
