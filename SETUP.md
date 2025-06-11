# Setup Instructions

## Required Environment Variables

To use the Interactive Prompt Playground, you need to configure your OpenAI API key.

### Step 1: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in to your account
3. Click "Create new secret key"
4. Copy the generated API key

### Step 2: Create Environment File

Create a file named `.env.local` in the root directory of the project (same level as `package.json`) with the following content:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with the API key you copied from OpenAI.

### Step 3: Install Dependencies and Run

```bash
npm install
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Important Notes

- ⚠️ **Never commit your `.env.local` file to version control**
- 📝 The `.env.local` file is already included in `.gitignore`
- 💰 Running tests will consume OpenAI API credits
- 🔒 Keep your API key secure and private

## Troubleshooting

### "OpenAI API key is not configured" Error
- Ensure `.env.local` file exists in the root directory
- Verify the environment variable name is exactly `OPENAI_API_KEY`
- Restart the development server after adding the environment file

### API Rate Limits
- If you hit rate limits, wait a few minutes before trying again
- Consider using smaller batch sizes for testing
- GPT-4 has lower rate limits than GPT-3.5-turbo

### High API Costs
- Start with GPT-3.5-turbo for testing (cheaper)
- Use lower max token limits to reduce costs
- Test single configurations before running all combinations 