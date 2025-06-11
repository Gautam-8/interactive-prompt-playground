# Interactive Prompt Playground

A clean, modern web application to test OpenAI API parameters and see how they affect AI-generated responses in real-time.

## 🚀 Live Demo

**Try it now:** [https://interactive-prompt-playground-amber.vercel.app/](https://interactive-prompt-playground-amber.vercel.app/)

## Features

- **Real-time Parameter Testing** - Adjust temperature, tokens, penalties and see immediate results
- **Clean Two-Panel UI** - Configuration on left, results on right
- **Cost-Effective** - Single test mode to control API costs
- **Modern Interface** - Built with Next.js and Tailwind CSS

## Setup Instructions

### Step 1: Prerequisites
- Node.js 18 or higher
- npm package manager
- OpenAI API account and key

### Step 2: Installation
```bash
# Clone the repository
git clone <your-repo-url>

# Install dependencies
npm install
```

### Step 3: Environment Configuration
1. Create a `.env` file in the root directory
2. Add your OpenAI API key:
```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

**How to get your API key:**
- Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Sign in to your OpenAI account
- Click "Create new secret key"
- Copy the key and paste it in your `.env` file

### Step 4: Run the Application
```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:3000` (or the next available port)

## How to Use

### 1. Configure Parameters
- **Model**: Choose between GPT-3.5 (cheaper) or GPT-4 (smarter)
- **System Prompt**: Define the AI's role and behavior
- **User Prompt**: What you want the AI to do
- **Temperature**: 0.0 (focused) to 2.0 (creative)
- **Max Tokens**: 10-500 (response length)
- **Presence Penalty**: 0.0-2.0 (reduce topic repetition)
- **Frequency Penalty**: 0.0-2.0 (reduce word repetition)

### 2. Generate Response
- Click the "Generate" button
- Results appear in the right panel
- Each result shows the parameters used and timestamp

### 3. Compare Results
- Run multiple tests with different parameters
- Results stack up for easy comparison
- Use "Clear" to reset results

## Project Structure
```
├── src/
│   ├── app/
│   │   ├── api/openai/route.ts    # OpenAI API handler
│   │   ├── page.tsx               # Main interface
│   │   ├── layout.tsx             # App layout
│   │   └── globals.css            # Styles
├── .env                     # API key (create this)
├── package.json                   # Dependencies
└── README.md                      # This file
```


## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **API**: OpenAI GPT-3.5/GPT-4
- **Icons**: Lucide React
