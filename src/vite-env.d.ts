/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_NODE_ENV: string
  readonly VITE_ENABLE_WEBSOCKET: string
  readonly VITE_ENABLE_REAL_TIME: string
  readonly VITE_ENABLE_FILE_UPLOAD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}



