import { merge } from 'lodash'

import { DeepPartial } from 'ts-essentials'

import { AuspiceJsonV2 } from 'auspice'

import type { AnalysisResult } from 'src/algorithms/types'

import { ruleMissingData, QCRulesConfigMissingData, QCResultMissingData } from './ruleMissingData'
import { ruleMixedSites, QCRulesConfigMixedSites, QCResultMixedSites } from './ruleMixedSites'
import { QCResultSNPClusters, QCRulesConfigSNPClusters, ruleSnpClusters } from './ruleSnpClusters'
import { ruleDivergence, QCRulesConfigDivergence, QCResultDivergence } from './ruleDivergence'

// const TooHighDivergence = 'too high divergence'
// const ClusteredSNPsFlag = 'clustered SNPs'
// const TooManyMixedSites = 'Too many non-ACGT characters'
// const MissingData = 'missing data'

export type Enableable<T> = T & { enabled: boolean }

export interface QCRulesConfig {
  divergence: Enableable<QCRulesConfigDivergence>
  missingData: Enableable<QCRulesConfigMissingData>
  snpClusters: Enableable<QCRulesConfigSNPClusters>
  mixedSites: Enableable<QCRulesConfigMixedSites>
}

const qcRulesConfigDefault: QCRulesConfig = {
  divergence: {
    enabled: true,
    divergenceMean: 9, // expected number of mutations
    divergenceStd: 4, // expected standard deviation around mean
    nStd: 3, // number of standard deviations to trigger QC warning
  },
  missingData: {
    enabled: true,
    missingDataThreshold: 1000, // number of sites as N to trigger warning
    scoreWeight: 0.01,
    scoreBias: 0,
    scoreMax: Infinity,
  },
  snpClusters: {
    enabled: true,
    totalSNPsThreshold: 0,
    knownClusters: new Set([28881, 28882, 28883]),
    windowSize: 100, // window along the genome to look for a cluster
    clusterCutOff: 6, // number of mutations within that window to trigger a cluster
    scoreWeight: 1,
    scoreBias: 0,
    scoreMax: Infinity,
  },
  mixedSites: {
    enabled: true,
    mixedSitesThreshold: 10, // number of non-ACGTN sites to trigger warning
    scoreWeight: 1,
    scoreBias: 0,
    scoreMax: Infinity,
  },
} as const

export interface QCResult {
  seqName: string
  score: number
  divergence?: QCResultDivergence
  missingData?: QCResultMissingData
  snpClusters?: QCResultSNPClusters
  mixedSites?: QCResultMixedSites
}

export type Rule<Conf, Ret> = (analysisResult: AnalysisResult, config: Conf) => Ret

export function runOne<Conf extends Enableable<unknown>, Ret>(
  rule: Rule<Conf, Ret>,
  analysisResult: AnalysisResult,
  config: Conf,
): Ret | undefined {
  return config.enabled ? rule(analysisResult, config) : undefined
}

export interface RunQCParams {
  analysisResult: AnalysisResult
  auspiceData: AuspiceJsonV2
  qcRulesConfig: DeepPartial<QCRulesConfig>
}

export function runQC({ analysisResult, auspiceData, qcRulesConfig }: RunQCParams): QCResult {
  const configs: QCRulesConfig = merge(qcRulesConfigDefault, qcRulesConfig)

  const result = {
    divergence: runOne(ruleDivergence, analysisResult, configs.divergence),
    missingData: runOne(ruleMissingData, analysisResult, configs.missingData),
    snpClusters: runOne(ruleSnpClusters, analysisResult, configs.snpClusters),
    mixedSites: runOne(ruleMixedSites, analysisResult, configs.mixedSites),
  }

  const score = Object.values(result).reduce((acc, r) => acc + (r?.score ?? 0), 0)
  return { seqName: analysisResult.seqName, ...result, score }
}