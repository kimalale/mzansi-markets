import React, { useState, useEffect, useCallback } from 'react'
import { AppView, AppConfig } from './types'
import { Asset } from './engine/assets'
import { Quote, QuoteMap, setProxyUrl, loadProxyUrl } from './services/api'
import { DashboardView } from './views/DashboardView'
import { DetailView }    from './views/DetailView'
import { AlertsView, AddAlertView } from './views/AlertsView'
import { SetupView, LoadingView }   from './views/SetupView'

const CFG_KEY = 'mm_config'

export function App() {
  const [view,       setView]       = useState<AppView>('loading')
  const [config,     setConfig]     = useState<AppConfig | null>(null)
  const [activeAsset, setActiveAsset] = useState<Asset | null>(null)
  const [quotes,     setQuotes]     = useState<QuoteMap>({})

  useEffect(() => {
    const raw = localStorage.getItem(CFG_KEY)
    loadProxyUrl()
    if (raw) {
      const cfg: AppConfig = JSON.parse(raw)
      setConfig(cfg)
      if (cfg.proxyUrl) setProxyUrl(cfg.proxyUrl)
    }
    setTimeout(() => setView(raw ? 'dashboard' : 'setup'), 400)
  }, [])

  const saveConfig = useCallback((cfg: AppConfig) => {
    localStorage.setItem(CFG_KEY, JSON.stringify(cfg))
    setProxyUrl(cfg.proxyUrl)
    setConfig(cfg)
    setView('dashboard')
  }, [])

  const openDetail = useCallback((asset: Asset) => {
    setActiveAsset(asset)
    setView('detail')
  }, [])

  if (view === 'loading')   return <LoadingView />
  if (view === 'setup')     return <SetupView existing={config} onSave={saveConfig} />

  if (view === 'dashboard') return (
    <DashboardView
      onDetail={openDetail}
      onAlerts={() => setView('alerts')}
      onSetup={() => setView('setup')}
    />
  )

  if (view === 'detail' && activeAsset) return (
    <DetailView
      asset={activeAsset}
      quote={quotes[activeAsset.symbol]}
      onBack={() => setView('dashboard')}
      onAddAlert={(a) => { setActiveAsset(a); setView('alert-add') }}
    />
  )

  if (view === 'alerts')    return (
    <AlertsView onBack={() => setView('dashboard')} />
  )

  if (view === 'alert-add' && activeAsset) return (
    <AddAlertView
      asset={activeAsset}
      onSave={() => setView('alerts')}
      onBack={() => setView('detail')}
    />
  )

  return null
}
