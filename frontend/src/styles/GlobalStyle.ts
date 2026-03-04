import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    --primary: #12A152;
    --secondary: #64748b;
    --background: #f8fafc;
    --text: #0f172a;
    --white: #ffffff;
    --gray-100: #e2e8f0;
    
    /* Dark Sidebar Theme */
    --sidebar-dark: #0f172a;
    --sidebar-dark-accent: #1e293b;
    --sidebar-text: #94a3b8;
    --sidebar-text-hover: #ffffff;
    --sidebar-item-active: rgba(18, 161, 82, 0.15);
  }

  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }

  html,
  body {
    max-width: 100vw;
    overflow-x: hidden;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`;
