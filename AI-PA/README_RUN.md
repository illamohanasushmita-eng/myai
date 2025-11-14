Quick run instructions for this Next.js project (Windows PowerShell)

1) Open VS Code integrated terminal (Ctrl+`) and change to the project folder:

   cd "C:\Users\anu_d\MYAI\AI-PA"

2) Run the provided helper script which checks Node/npm, installs dependencies, and starts the dev server on port 3002:

   .\run-app.ps1

3) If you need a different port (e.g. 3003):

   .\run-app.ps1 -Port 3003

4) Common issues:
   - "Node not found": Install Node.js 18+ from https://nodejs.org/
   - "bcrypt" native build errors on Windows: install Visual Studio Build Tools or use `bcryptjs` as a platform-safe alternative.
   - Missing environment variables: the repo ignores `.env*`. Create a `.env.local` file with required variables (check project docs or any `.env.example`).

5) After successful start, open http://localhost:3002 (or your chosen port) in the browser.

If anything fails, copy and paste the terminal output here and I'll help troubleshoot.
