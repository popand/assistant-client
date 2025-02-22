# AI Assistant Client

An AI Assistant interface built with Next.js that connects to a local AI server/agent. The assistant provides an intuitive chat interface with debug information support.

## Features

- 🤖 Real-time AI chat interface
- 🎯 Draggable window positioning
- 🔍 Debug information panel
- 💬 Conversation thread management
- ⚡ Fast response times
- 🔄 Loading states and animations

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Running AI server at `http://localhost:8080`

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/popand/assistant-client.git
   cd assistant-client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Integration

The assistant connects to a local AI server endpoint:

```typescript
POST http://localhost:8080/execute
Content-Type: application/json

{
  "input": "Your question here",
  "debug": true
}
```

Response format:
```json
{
  "result": {
    "final_output": {
      "confidence": number,
      "response": string
    },
    "steps": [
      {
        "action": string,
        "input": object,
        "output": object,
        "timestamp": number
      }
    ]
  },
  "debug": [
    {
      "timestamp": string,
      "level": string,
      "message": string
    }
  ]
}
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── execute/
│   │       └── route.ts    # API route handler
│   │       └── page.tsx            # Main page component
│   │       └── layout.tsx          # Root layout
│   │       └── globals.css         # Global styles
│   ├── components/
│   │   ├── AIAssistant.tsx     # AI Assistant component
│   │   └── AIAssistant.css     # Component styles
│   └── components/
│       └── AIAssistant.tsx     # AI Assistant component
```

## Features in Detail

### Draggable Window
- Click and drag the header to move the assistant window
- Window stays within viewport bounds
- Smooth dragging animation

### Debug Information
- Click the info icon on any assistant message
- View detailed debug logs
- Includes timestamps and execution steps

### Thread Management
- Start new conversation threads
- Clear conversation history
- Automatic scroll to latest message

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables

No environment variables are required for basic functionality. The AI server URL is currently hardcoded to `http://localhost:8080`.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.