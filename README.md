#  Storytelling Chatbot – StoryImpact

Effortlessly craft emotionally-resonant social impact stories through a guided conversational experience powered by AI — complete with narrative generation, flyer design, and downloadable exports.

**Try it now:** [Live Demo](https://app--story-impact-da3364fe.base44.app/Interview)

---

##  Table of Contents
- [Why This Project Exists](#why-this-project-exists)  
- [Features](#features)  
- [Technology Stack](#technology-stack)  
- [Demo Preview](#demo-preview)  
- [Getting Started](#getting-started)  
- [Usage](#usage)  
- [File Structure](#file-structure)  
- [Contributing](#contributing)  
- [License](#license)

---

##  Why This Project Exists
Inspired by the need to make storytelling more accessible and impactful, **StoryImpact** transforms personal experiences into powerful narratives. Whether for advocacy, fundraising, or awareness campaigns, this tool helps users articulate their message and make it visually compelling.

---

##  Features
- **Conversational Interview Flow** – Guided Q&A format builds raw prompts through multiple prompts (name/topic, protagonist, conflict, emotional core, hope/message).
- **AI-Powered Story Generation** – Uses LLM to craft a complete, emotionally compelling short story.
- **Flyer Creation** – Generates a dark-themed, elegant visual flyer to accompany the story.
- **Download Options** – Export the story as a `.txt` file and the flyer as an image.
- **Smooth UI** – Animated chat interface built with Tailwind CSS and Framer Motion.
- **State Management** – Manages interview progress, user input, generation states, and retention of story output.

---

##  Technology Stack
Built using modern web technologies:
- **Frontend**: React, Tailwind CSS, Framer Motion, Lucide Icons, shadcn/ui
- **AI Integration**: `InvokeLLM` for narrative generation, `GenerateImage` for visual flyers
- **Backend**: (Optional) Mongoose model to store structured story data

---

##  Demo Preview
Here’s how the flow works:

1. The chatbot initiates with a thoughtful question.
2. Users respond sequentially through the interview questions.
3. Upon completion, the AI generates a polished story and accompanying flyer.
4. Users can preview, download, and share their story and flyer.

*(Screenshot or GIF could go here — consider using animated preview for more engagement.)*

---

##  Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/story-impact-chatbot.git
   cd story-impact-chatbot
