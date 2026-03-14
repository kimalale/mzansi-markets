export type AppView =
  | 'setup'
  | 'dashboard'
  | 'detail'
  | 'alert-add'
  | 'alerts'
  | 'loading'

export interface AppConfig {
  proxyUrl: string
}
