/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHATWOOT_BASE_URL?: string;
  readonly VITE_CHATWOOT_INBOX_IDENTIFIER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
