# [Jernej] Collaborative code editing with monaco and automerge

## Project

## Goals

- Support collaborative code editing with scalable architecture. Consider how security should work in the architecture doc.
- Two users on two different internet connections can collaborate on the same code editor.
- If a user’s connection is intermittent, they can edit without those changes being lost.
- Nice to have: You can undo and redo changes and revert to a historical version.

## Technology

- Use [monaco](https://microsoft.github.io/monaco-editor/) for the text editor
- Use ‣ to support collaborative text editing
- We don’t care what front end libraries you use to get the monaco editor running — it can be React/Vanilla JS/whatever
- Use typescript and either websockets or webrtc to sync changes
- If you use a server, use node
- Create a private github repo and invite https://github.com/jperl and https://github.com/michael-pr
    - It’s nice to see commits along the way