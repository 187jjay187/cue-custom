# Cue Custom ? simple setup and user guide

Cue is a desktop assistant that can answer questions about your screen or conversation. This customized version adds **bionic reading**, separate **Fast / Smart** buttons, **Concise on/off**, automatic replies to recognized meeting-audio questions, and **Groq** support alongside **Google Gemini**.

This guide is written for people who do not code. For the Windows download, you do not need Node.js, a terminal, or to edit any files.

## Start here

1. [Download and open Cue](#1-download-and-open-cue-windows).
2. [Get your free-tier Gemini and Groq keys](#2-custom-setup-get-your-gemini-and-groq-api-keys).
3. [Paste the keys into Cue](#3-add-your-keys-to-cue).
4. [Add your background and allow microphone access](#4-finish-your-first-time-setup).
5. [Try a question and test listening](#5-your-first-test).
6. Keep the [button guide](#6-what-each-button-does) and [shortcut table](#7-keyboard-shortcuts) handy.

## 1. Download and open Cue (Windows)

You need a Windows computer, an internet connection, and access to this private GitHub repository. Sign in to the GitHub account that owns it, or an account invited to it.

1. Open [Downloadable Windows build](https://github.com/187jjay187/cue-custom/actions/workflows/windows-build.yml).
2. Click the latest run with a green check mark. Scroll down to **Artifacts**.
3. Click **cue-windows** to download it. An artifact is simply the download produced by a build.
4. In Downloads, right-click the downloaded ZIP and choose **Extract All**.
5. Open the extracted folder. There is another app ZIP inside: right-click that ZIP and choose **Extract All** too.
6. Open the second extracted folder and double-click **cue.exe**. Keep all the files in that folder together; do not move only the EXE.
7. For easier access later, right-click `cue.exe` and create a desktop shortcut.

If there is no completed build, choose **Run workflow**, leave the branch as **main**, and click the green **Run workflow** button. Wait for its green check mark, then follow the download steps above. Only accounts with the necessary repository permissions can start a build.

On another device, repeat these steps and add your keys again. They are not included in the app download.

## 2. Custom setup: get your Gemini and Groq API keys

An **API key** is a private access code that lets Cue use your AI account. Copy the key from the provider and paste it into Cue; you do not put it into the source code or GitHub.

**Both providers offer free-tier access with usage limits, not unlimited free answers.** Keep the account/project on its free plan if you want to avoid paid API usage. Availability depends on the model, account, and region, and limits can change. You do not need an OpenAI or Claude key for the recommended setup below.

### Google Gemini: screen questions and general answers

1. Open [Google AI Studio ? API keys](https://aistudio.google.com/apikey).
2. Sign in with your Google account and complete any first-time setup.
3. If AI Studio has already created a default key, open that key. Otherwise, choose **Create API key** and select or create a project you control.
4. Copy the key. Keep the page open until you have pasted it into Cue.
5. Check that the project's plan is **Free Tier**. Do not enable paid billing or choose a paid-only model if you want free-tier usage.

If your key already exists, use the same API keys page to view/manage it; there is no need to create a new one for every launch. Existing Google Cloud users may need to import their project into AI Studio first.

Google explains [key creation and project setup](https://ai.google.dev/gemini-api/docs/api-key), [free versus paid billing](https://ai.google.dev/gemini-api/docs/billing), and [model pricing/free-tier availability](https://ai.google.dev/gemini-api/docs/pricing).

### Groq: transcription, automatic replies, and backup answers

1. Open [Groq Console ? API keys](https://console.groq.com/keys).
2. Sign up or sign in and complete the account setup.
3. Choose **Create API Key**. Give it a recognizable name such as `Cue desktop`.
4. Copy the generated key into Cue's **Groq** field. Save it privately if you want to reuse it on another device; if you can no longer reveal it, create a replacement key.
5. Stay on the **Free** plan unless you intentionally want paid usage. You do not need to upgrade to start with available free-tier models.

See Groq's [getting-started guide](https://console.groq.com/docs/quickstart), [free-plan rate limits](https://console.groq.com/docs/rate-limits), and [billing information](https://console.groq.com/docs/billing-faqs).

Cue's Groq defaults are **GPT-OSS 20B for Fast** and **GPT-OSS 120B for Smart**. Despite the `openai/` prefix in their model names, they run through your **Groq** account; you do not need an OpenAI key. The older Llama 3.3 70B model was retired for free/developer accounts. See [Groq's current models](https://console.groq.com/docs/models) and [migration notice](https://console.groq.com/docs/deprecations).

## 3. Add your keys to Cue

1. Open Cue and click the **three dots (...)** beside its controls to open **Settings**.
2. Select the **Keys** tab.
3. Paste the Google key into **Gemini**, and the Groq key into **Groq**. Leave OpenAI, Anthropic, and Deepgram blank if you are not using them.
4. Select **Gemini** in the provider row. This keeps screen-based questions on Gemini.
5. Leave **Use Groq first for automatic answers** checked. With a saved Groq key, automatic conversation replies use Groq directly, without waiting for Gemini to fail.
6. Leave **Use Groq if Gemini is busy or unavailable** checked. Manual Gemini requests can switch to Groq on a service error, rate limit, or timeout before answer text starts arriving.
7. Click **Done** to save.

Leave the model fields at their defaults initially. To change Groq's models later, select **Groq**, edit its **Fast** and **Smart** fields, then select **Gemini** again before clicking **Done** if you want Gemini to remain the main provider.

**Screenshot limitation:** the configured Groq models accept text. Groq fallback uses your question and transcript, omits the screenshot, and tells you when this happens. If the question needs something visible on screen, copy that text into your question or retry with Gemini.

## 4. Finish your first-time setup

### Add your background (optional)

In **Settings**, fill in whichever tabs are relevant:

| Tab | What to enter |
|---|---|
| **Profile** | Your resume as pasted text and the job description. |
| **Interview Prep** | Real examples/stories, reasons for the role, and your work style. |
| **Q&A** | Salary expectations and questions you want to ask. |

Click **Done** when finished. Use real details so answers can draw from your background.

### Allow microphone access

On Windows, open **Settings > Privacy & security > Microphone**. Turn on **Microphone access** and **Let desktop apps access your microphone**. On older Windows versions, look under **Privacy > Microphone**. Allow any microphone prompt from Cue.

Meeting audio is captured from your computer's playback/output audio. Play the meeting through your computer so Cue can receive it; listening to a call on a separate phone does not send that audio to Cue.

### Choose your starting controls

Select **Fast**, **Concise on**, and **Auto on** for short automatic replies. Fast/Smart chooses the model; Concise changes the answer length independently.

Use Cue for practice, accessibility, and situations where assistance is permitted. Follow the meeting or assessment rules. Screen-share hiding is best-effort and should not be relied on to keep the app unseen.

## 5. Your first test

### Check that answers work

1. Type `What is teamwork?` in Cue's question box.
2. Press **Enter**. Answer text should start appearing as it is generated.
3. Switch **Concise off** and ask again to compare the fuller answer style.

### Check that listening works

1. Click the **start/stop listening button** in the top bar (the square/stop icon).
2. Click **Transcript** to see what Cue hears. **You** means your microphone; **Them** means audio playing on your computer.
3. In a practice call, have the other participant ask a question and pause, such as ?Tell me about your experience.?
4. With **Auto on**, Cue requests a reply after it recognizes a completed question from the **Them** channel. It shows **Preparing reply** while waiting for the answer to begin.
5. If automatic detection misses a question, click **What should I say?** to request a reply manually.
6. Click the listening button again when finished.

Speaking into your own microphone alone will not trigger Auto; Auto listens for questions on the **Them** channel. Transcription and generation still take time, and an internet/provider delay can slow them down. Groq's transcription uses uploaded audio segments, not a continuous real-time transcript stream. See [Groq speech-to-text](https://console.groq.com/docs/speech-to-text).

## 6. What each button does

| Button/control | What it does |
|---|---|
| **What should I say?** | Drafts a natural spoken reply from the conversation and your background. |
| **Assist** | Uses the screen and recent conversation to help with the current question. |
| **Follow-up** | Suggests questions you could ask next. |
| **Recap** | Summarizes what has been discussed. |
| **Transcript** | Shows or hides the words Cue has heard. |
| **Clear** | Clears the conversation transcript; use it before a new practice session. |
| **Fast** | Selects the Fast model. The selected button is highlighted. |
| **Smart** | Selects the Smart model for more involved questions. It may take longer. |
| **Concise on** | Requests short, natural answers, usually 1?2 sentences. Click to turn it off. |
| **Concise off** | Requests fuller explanations and more detailed stories. Click to turn it on. |
| **Auto on** | Automatically requests a reply to recognized completed meeting-audio questions while listening. |
| **Auto off** | Leaves answer requests to you; listening can still transcribe. |
| **Top-bar listening button** | Starts or stops microphone and meeting-audio capture. |
| **Hide** | Collapses or expands the answer panel. It does not quit Cue or stop listening. |
| **Three dots (...)** | Opens Settings. **Done** saves your changes. |
| **Cue logo** | Opens the built-in introductory walkthrough. This README covers the customized features in more detail. |

Drag the top bar to move Cue. **Bionic reading** is always applied when an answer finishes: the beginnings of words are bolded, while code is left unchanged. Auto, Concise, and Fast/Smart preferences are saved for future sessions.

## 7. Keyboard shortcuts

Hold the listed keys together. **Enter** is also called **Return**.

| Action | Windows | macOS |
|---|---|---|
| Assist with screen/conversation | **Ctrl + Enter** | **Command + Return** |
| What should I say? | **Ctrl + Shift + Enter** | **Command + Shift + Return** |
| Solve the coding problem on screen | **Ctrl + H** | **Command + H** |
| Quit Cue completely | **Ctrl + Shift + X** | **Command + Shift + X** |
| Open Settings while Cue has focus | **Ctrl + ,** | **Command + ,** |
| Send a typed question while in Cue's input box | **Enter** | **Return** |
| Close Settings and save while Settings is open | **Esc** | **Esc** |

The first four shortcuts are registered globally and can work while another app has focus. Settings and typing shortcuts require Cue to have focus. Another application or system shortcut may conflict; use the on-screen buttons if that happens.

Auto, Concise, Fast/Smart, and listening have on-screen buttons rather than dedicated keyboard shortcuts. Follow-up and Recap also use their buttons.

## 8. Common problems and simple fixes

| Problem | What to try |
|---|---|
| **503 / service unavailable** | The provider could not handle the request. With both keys saved, keep Groq fallback enabled. Retry later if both providers fail. |
| **429 / quota / rate limit** | A free-tier limit was reached. Wait for the provider's limit to reset and check its usage/limits page. Free does not mean unlimited. |
| **401 / invalid key** | Copy the full key again into the matching provider field, remove stray spaces, and click **Done**. Replace a revoked key. |
| **403 / model access error** | Check the key's project permissions and whether the chosen model is available to your plan. |
| **Model not found / retired model** | Check the provider's current model list and update its Fast/Smart model fields in Settings. Do not use the retired free-tier Llama 70B model. |
| **No automatic reply** | Check **Auto on**, listening is active, and **Transcript** shows the question under **Them**. Auto may miss unusual wording; use **What should I say?**. |
| **Nothing under Them** | Check meeting sound is playing through this computer. Toggle listening off/on and read any capture error shown in Cue. |
| **Meeting audio cannot start** | Restart Cue and check microphone access and your output device. If Windows reports no loopback track, check the playback device's exclusive-mode setting. |
| **Only mic input is heard** | Your mic and meeting audio are separate. Own-mic questions are not used to trigger Auto. Test with another participant's computer playback. |
| **Replies take time** | Use Fast, keep Groq-first automatic answers enabled, and check the network. Automatic detection waits for the question to finish; instant answers are not guaranteed. |
| **New controls are missing** | Fully quit Cue, reopen the latest downloaded build, and make sure you are not launching an older copy. |
| **Cannot see GitHub downloads** | Sign in with an account that has access to this private repository. Artifacts can expire; run a new build if needed. |

## 9. Updates and using another device

Download a newer successful Windows build from Actions, extract it into a new folder, quit the old copy, and launch the new one. There is no automatic update system. On a different computer, enter the keys and profile information again.

macOS users currently need the source setup below, or a properly signed release. Windows ZIPs do not run on macOS. Microphone/screen permissions and system-audio support depend on the platform; the Windows meeting-audio setup is the main tested path. Linux packaging is not configured.

## Privacy and your keys

Keys and profile settings are stored in a local `cue-data.json` file, not encrypted by this app. The file is excluded from Git. Do not publish keys, include them in screenshots, or upload that settings file to GitHub.

Cue contacts the configured AI providers: transcription sends audio; answers send the question and relevant conversation/profile information; screen features can send screenshots. Gemini-to-Groq fallback sends the text context to Groq when it runs. Provider terms and data policies still apply. No actual API keys are included in this README or the repository.

## Source setup (optional, for technical users)

Install Git and Node.js **22.12 or newer**. You need access to this private repository.

```bash
git clone https://github.com/187jjay187/cue-custom.git
cd cue-custom
npm ci
npm start
```

To check or package the app:

```bash
npm test
npm run dist:win
# On a Mac:
npm run dist:mac
```

The Windows workflow runs tests and creates the downloadable ZIP. Tagged releases use the separate release workflow; downloadable macOS releases require signing/notarization credentials. Do not add those credentials to source files.

## Credits and license

Based on [Blueturboguy07/cue](https://github.com/Blueturboguy07/cue), with the custom features described above. Original project inspirations include `pickle-com/glass` and `sohzm/cheating-daddy`.

License: [GPL-3.0-or-later](LICENSE).

Provider links and free-tier guidance checked on **5 October 2026**. Account screens, model availability, and limits can change; follow the providers' linked documentation if it differs.
