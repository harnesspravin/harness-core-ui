import { createContext } from 'react'
import { ThresholdTypes } from '../../AppDHealthSource.constants'
import type { MetricThresholdType } from '../../AppDHealthSource.types'
import type { AppDMetricThresholdContextType, SelectItem } from './AppDMetricThreshold.types'

export const AppDMetricThresholdContext = createContext<AppDMetricThresholdContextType>(
  {} as AppDMetricThresholdContextType
)

AppDMetricThresholdContext.displayName = 'AppDMetricThresholdContext'

export const MetricTypeValues = {
  Performance: 'Performance',
  Custom: 'Custom',
  Errors: 'Errors'
}

export const CriteriaValues: Record<string, 'Absolute' | 'Percentage'> = {
  Absolute: 'Absolute',
  Percentage: 'Percentage'
}

export const FailFastActionValues: Record<
  string,
  'FailImmediately' | 'FailAfterOccurrence' | 'FailAfterConsecutiveOccurrence'
> = {
  FailImmediately: 'FailImmediately',
  FailAfterOccurrences: 'FailAfterOccurrence',
  FailAfterConsecutiveOccurrences: 'FailAfterConsecutiveOccurrence'
}

export const PercentageCriteriaDropdownValues = {
  GreaterThan: 'greaterThan',
  LessThan: 'lessThan'
}

const IgnoreThresholdType = 'Ignore'

export const CustomMetricDropdownOption: SelectItem = {
  label: MetricTypeValues.Custom,
  value: MetricTypeValues.Custom
}

export const NewDefaultVauesForIgnoreThreshold: MetricThresholdType = {
  metricType: undefined,
  groupName: undefined,
  metricName: undefined,
  type: ThresholdTypes.IgnoreThreshold,
  spec: {
    action: IgnoreThresholdType
  },
  criteria: {
    type: CriteriaValues.Absolute,
    spec: {}
  }
}

export const NewDefaultVauesForFailFastThreshold: MetricThresholdType = {
  metricType: undefined,
  groupName: undefined,
  metricName: undefined,
  type: ThresholdTypes.FailImmediately,
  spec: {
    action: FailFastActionValues.FailImmediately,
    spec: {}
  },
  criteria: {
    type: CriteriaValues.Absolute,
    spec: {}
  }
}

export const MetricTypesForTransactionTextField = [MetricTypeValues.Performance, MetricTypeValues.Errors]