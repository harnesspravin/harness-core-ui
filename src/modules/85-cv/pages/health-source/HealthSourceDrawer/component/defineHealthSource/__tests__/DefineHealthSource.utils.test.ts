import { HealthSourceTypes } from '@cv/pages/health-source/types'
import { AWSDataSourceType } from '../DefineHealthSource.constant'
import {
  formValidation,
  getConnectorPlaceholderText,
  getDataSourceType,
  getIsConnectorDisabled
} from '../DefineHealthSource.utils'

describe('DefineHealthSource.utils.test', () => {
  test('should return correct connector placeholder text', () => {
    const result = getConnectorPlaceholderText('Aws')
    expect(result).toBe('AWS')
  })

  test('should return empty string, if invalid value is passed', () => {
    const result = getConnectorPlaceholderText()
    expect(result).toBe('')
  })

  test('should return correct value, if valid value is passed', () => {
    const result = getConnectorPlaceholderText('Dynatrace')
    expect(result).toBe('Dynatrace')
  })

  test('should return correct value, if data source type is AWS_PROMETHEUS', () => {
    const result = getConnectorPlaceholderText('Prometheus', 'AWS_PROMETHEUS')
    expect(result).toBe('AWS')
  })

  test('formValidation should return correct error, if dataSourceType is not provided and it is enabled and prometheus type is selected', () => {
    const result = formValidation({
      getString: a => a,
      values: { sourceType: 'Prometheus', healthSourceIdentifier: '322', healthSourceList: [] },
      isEdit: false
    })
    expect(result).toEqual({ dataSourceType: 'cv.healthSource.dataSourceTypeValidation' })
  })

  test('getIsConnectorDisabled should return true, if all the conditions are not matched', () => {
    const result = getIsConnectorDisabled({
      connectorRef: '',
      isEdit: false,
      sourceType: '',
      dataSourceType: ''
    })
    expect(result).toBe(true)
  })

  test('getIsConnectorDisabled should return false, if all the conditions are matched', () => {
    const result = getIsConnectorDisabled({
      connectorRef: '',
      isEdit: false,
      sourceType: 'Prometheus',
      dataSourceType: 'AwsPrometheus'
    })
    expect(result).toBe(false)
  })

  test('getDataSourceType should return AwsPrometheus, if selected dataSourceType is AWS', () => {
    const result = getDataSourceType({ dataSourceType: AWSDataSourceType })

    expect(result).toBe(AWSDataSourceType)
  })

  test('getDataSourceType should return AwsPrometheus, if selected health source type is AwsPrometheus', () => {
    const result = getDataSourceType({ type: HealthSourceTypes.AwsPrometheus })

    expect(result).toBe(AWSDataSourceType)
  })

  test('getDataSourceType should return Prometheus, if selected health source type is Prometheus', () => {
    const result = getDataSourceType({ type: HealthSourceTypes.Prometheus })

    expect(result).toBe(HealthSourceTypes.Prometheus)
  })

  test('getDataSourceType should return Prometheus, if selected datasource type is Prometheus', () => {
    const result = getDataSourceType({ dataSourceType: HealthSourceTypes.Prometheus })

    expect(result).toBe(HealthSourceTypes.Prometheus)
  })
})
