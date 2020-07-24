import type { Router } from 'next/router'

import { configureStore } from 'src/state/store'
import { createWorkerPools } from 'src/workers/createWorkerPools'

export interface InitializeParams {
  router: Router
}

const allowResultsPage = process.env.NODE_ENV === 'development' && process.env.DEBUG_SET_INITIAL_DATA === 'true'

export async function initialize({ router }: InitializeParams) {
  if (!allowResultsPage && router.pathname === '/results') {
    await router.replace('/')
  }

  void router.prefetch('/') // eslint-disable-line no-void
  void router.prefetch('/results') // eslint-disable-line no-void

  const workerPools = createWorkerPools()

  const { persistor, store } = await configureStore({ router, workerPools })

  return { persistor, store }
}
