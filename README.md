# Lumon Outie Query System Interface (OQSI)

Have you ever wondered about your Outie but haven't had the pleasure of meeting Ms. Casey yet? Here's your chance to learn some facts about your Outie using the Outie Query System Interface, or OQSI (pronounced "oxy").

## Behind the Scenes

This was built over a five days during the evening using Cursor. So the code could be garbage but it's good enough to work for this novelty site.

This is a fan-made project. The concepts, characters, and writing from "Severance" are the copyright and property of the show's producers and Apple. The code for the site is under the MIT License.

Inter is being used as a substitute for Helvetica because it's free while Helvetica is not. (And I didn't want to rely on fallbacks.)

Music is licensed from Epidemic Sound.

I hope you enjoy.

## Tech Stack

OQSI is a modern web application built with Next.js 16, React 19, and TypeScript. Music is streamed from Bunny and the AI is gpt-4o-mini from OpenAI.

- **Framework**: Next.js 16.0.7 with App Router
- **UI**: React 19.2.1 with Tailwind CSS and shadcn/ui components
- **Language**: TypeScript
- **AI Integration**: LangChain with OpenAI
- **State Management**: Zustand
- **Video Streaming**: HLS.js
- **Styling**: Tailwind CSS with animations
- **Development Tools**: Turbopack for fast refresh

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   ```
3. Create a `.env.local` file in the root directory with the required environment variables (see Environment Variables section below)

5. Run the development server:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Development Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Project Structure

- `/src/app` - Next.js application routes and pages
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and shared logic
- `/src/types` - TypeScript type definitions
- `/public` - Static assets

## Environment Variables

The application requires several environment variables to be set in `.env.local`. 

### Required Variables

**OpenAI Configuration** (Server-side only - do NOT use `NEXT_PUBLIC_` prefix):
- `OPENAI_API_KEY` - Your OpenAI API key
- `OPENAI_MODEL` - Model name (default: "gpt-4o-mini")
- `OPENAI_TEMPERATURE` - Temperature setting (default: 0.8)

**Bunny.net Configuration** (Server-side only - do NOT use `NEXT_PUBLIC_` prefix):
- `BUNNY_LIBRARY_ID` - Your Bunny.net video library ID
- `BUNNY_PULL_ZONE` - Your Bunny.net pull zone identifier
- `BUNNY_API_KEY` - Your Bunny.net API key

**Google Analytics** (Client-side - uses `NEXT_PUBLIC_` prefix):
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics measurement ID

### Security Note

⚠️ **Important**: API keys and sensitive credentials should NEVER use the `NEXT_PUBLIC_` prefix. Variables with `NEXT_PUBLIC_` are exposed in the client-side bundle and visible to anyone. Only use `NEXT_PUBLIC_` for values that are safe to expose publicly (like Google Analytics IDs).

If you previously had `NEXT_PUBLIC_OPENAI_API_KEY` or other sensitive keys exposed, rotate them immediately in your respective service dashboards.

## License

The code for this project is licensed under the MIT License:

```
MIT License

Copyright (c) 2025 Roger Wong

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Note: The concepts, characters, and writing from "Severance" are the copyright and property of the show's producers and Apple. Only the code itself is under the MIT License.
