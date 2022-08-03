import React, { useEffect } from 'react'
import { useFormikContext } from 'formik'
import { FormInput, Layout, SelectOption } from '@harness/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type { AppDynamicsFomikFormInterface } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.types'
import { AppDynamicsMonitoringSourceFieldNames as FieldName } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.constants'
import ThresholdSelect from './ThresholdSelect'
import type { ThresholdCriteriaPropsType } from '../MetricThresholds.types'
import { getCriterialItems, getCriteriaPercentageDropdownOptions } from '../MetricThresholds.utils'
import { MetricCriteriaValues, PercentageCriteriaDropdownValues as PercentageType } from '../MetricThresholds.constants'
import css from './MetricThreshold.module.scss'

export default function ThresholdCriteria(props: ThresholdCriteriaPropsType): JSX.Element {
  const { index, thresholdTypeName, criteriaType, criteriaPercentageType, replaceFn } = props

  const { values: formValues, setFieldTouched } = useFormikContext<AppDynamicsFomikFormInterface>()

  const { getString } = useStrings()

  const isAbsoluteSelected = criteriaType === MetricCriteriaValues.Absolute

  const isGreaterThanSelected = criteriaPercentageType === PercentageType.GreaterThan
  const isLessThanSelected = criteriaPercentageType === PercentageType.LessThan

  const showGreaterThanInput = isAbsoluteSelected || isGreaterThanSelected
  const showLessThanInput = isAbsoluteSelected || isLessThanSelected

  useEffect(() => {
    setFieldTouched(`${thresholdTypeName}.${index}.criteria.spec.${FieldName.METRIC_THRESHOLD_GREATER_THAN}`, true)
    setFieldTouched(`${thresholdTypeName}.${index}.criteria.spec.${FieldName.METRIC_THRESHOLD_LESS_THAN}`, true)
  }, [index, setFieldTouched, thresholdTypeName, isAbsoluteSelected, criteriaPercentageType])

  const handleCriteriaUpdate = (selectedValue: string): void => {
    if (selectedValue === MetricCriteriaValues.Absolute) {
      return void 0
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const clonedThresholdValue = [...formValues[thresholdTypeName]]

    const updatedThresholds = { ...clonedThresholdValue[index] }

    const criteriaDetails = updatedThresholds[FieldName.METRIC_THRESHOLD_CRITERIA]

    // whenever the criteria value is changed to Percentage, Greater than value is set as default and Less than is set to undefined
    criteriaDetails.type = selectedValue
    criteriaDetails[FieldName.METRIC_THRESHOLD_CRITERIA_PERCENTAGE_TYPE] = PercentageType.GreaterThan
    criteriaDetails.spec[FieldName.METRIC_THRESHOLD_LESS_THAN] = undefined

    clonedThresholdValue[index] = updatedThresholds

    replaceFn(updatedThresholds)
  }

  const handleCriteriaPercentageUpdate = (selectedValue: string): void => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const clonedThresholdValue = [...formValues[thresholdTypeName]]

    const updatedThresholds = { ...clonedThresholdValue[index] }
    const criteriaDetails = updatedThresholds[FieldName.METRIC_THRESHOLD_CRITERIA]
    criteriaDetails.criteriaPercentageType = selectedValue

    if (selectedValue === PercentageType.GreaterThan) {
      criteriaDetails.spec[FieldName.METRIC_THRESHOLD_LESS_THAN] = undefined
    } else if (selectedValue === PercentageType.LessThan) {
      criteriaDetails.spec[FieldName.METRIC_THRESHOLD_GREATER_THAN] = undefined
    }

    clonedThresholdValue[index] = updatedThresholds

    replaceFn(updatedThresholds)
  }

  return (
    <Layout.Horizontal style={{ alignItems: 'center' }}>
      <ThresholdSelect
        items={getCriterialItems(getString)}
        className={cx(css.metricThresholdSelect, css.metricThresholdCriteria)}
        key={criteriaType || undefined}
        onChange={({ value }: SelectOption) => handleCriteriaUpdate(value as string)}
        name={`${thresholdTypeName}.${index}.${FieldName.METRIC_THRESHOLD_CRITERIA}.type`}
      />
      {criteriaType === MetricCriteriaValues.Percentage && (
        <ThresholdSelect
          items={getCriteriaPercentageDropdownOptions(getString)}
          className={cx(css.metricThresholdSelect, css.metricThresholdCriteria)}
          onChange={({ value }: SelectOption) => handleCriteriaPercentageUpdate(value as string)}
          name={`${thresholdTypeName}.${index}.${FieldName.METRIC_THRESHOLD_CRITERIA}.${FieldName.METRIC_THRESHOLD_CRITERIA_PERCENTAGE_TYPE}`}
        />
      )}
      {showGreaterThanInput && (
        <FormInput.Text
          inline
          className={css.metricThresholdInput}
          label={isAbsoluteSelected ? getString('cv.monitoringSources.appD.greaterThan') : null}
          inputGroup={{ type: 'number', min: 1 }}
          name={`${thresholdTypeName}.${index}.criteria.spec.${FieldName.METRIC_THRESHOLD_GREATER_THAN}`}
        />
      )}

      {showLessThanInput && (
        <FormInput.Text
          inline
          className={css.metricThresholdInput}
          label={isAbsoluteSelected ? getString('cv.monitoringSources.appD.lesserThan') : null}
          inputGroup={{ type: 'number', min: 1 }}
          name={`${thresholdTypeName}.${index}.criteria.spec.${FieldName.METRIC_THRESHOLD_LESS_THAN}`}
        />
      )}
    </Layout.Horizontal>
  )
}