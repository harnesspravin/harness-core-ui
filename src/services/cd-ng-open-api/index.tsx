/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* Generated by restful-react */

import React from 'react'
import { Get, GetProps, useGet, UseGetProps } from 'restful-react'

import { getConfig, getUsingFetch, GetUsingFetchProps } from '../config'
export const SPEC_VERSION = '1'
export interface CreateOrganizationRequest {
  org: Organization
}

/**
 * Create project request
 */
export interface CreateProjectRequest {
  project: Project
}

/**
 * Microservice Version Info
 */
export interface MicroserviceVersionInfo {
  /**
   * Microservices name
   */
  name?: string
  /**
   * Microservices version URL
   */
  version?: string
  /**
   * Microservices version
   */
  version_url?: string
}

/**
 * Type of Modules
 */
export type ModuleType =
  | 'CD'
  | 'CI'
  | 'CV'
  | 'CF'
  | 'CE'
  | 'STO'
  | 'CORE'
  | 'PMS'
  | 'TEMPLATESERVICE'
  | 'GOVERNANCE'
  | 'CHAOS'

/**
 * Module Versions Response Body
 */
export interface ModuleVersionsResponse {
  /**
   * Module display name
   */
  display_name?: string
  microservices_version_info?: MicroserviceVersionInfo[]
  /**
   * Module name
   */
  name?: string
  /**
   * Module Release Notes link
   */
  release_notes_link?: string
  /**
   * Module updated at
   */
  updated?: string
  /**
   * Module version
   */
  version?: string
  /**
   * Module version URL
   */
  version_url?: string
}

/**
 * Organization model
 */
export interface Organization {
  /**
   * Organization description
   */
  description?: string
  /**
   * Organization identifier
   */
  identifier: string
  /**
   * Organization name
   */
  name: string
  /**
   * Organization tags
   */
  tags?: {
    [key: string]: string
  }
}

/**
 * Organization response Model
 */
export interface OrganizationResponse {
  /**
   * Creation timestamp for organization
   */
  created?: number
  /**
   * This indicates if this organization is managed by Harness or not. If true, Harness can manage and modify this organization.
   */
  harness_managed?: boolean
  org?: Organization
  /**
   * Updated timestamp for organization
   */
  updated?: number
}

/**
 * Project model
 */
export interface Project {
  /**
   * Project color
   */
  color?: string
  /**
   * Project description
   */
  description?: string
  /**
   * Project identifier
   */
  identifier: string
  /**
   * List of modules for project
   */
  modules?: ModuleType[]
  /**
   * Project name
   */
  name: string
  /**
   * Organization identifier for the project
   */
  org?: string
  /**
   * Project tags
   */
  tags?: {
    [key: string]: string
  }
}

/**
 * Project response model
 */
export interface ProjectResponse {
  /**
   * Creation timestamp for the project
   */
  created?: number
  project?: Project
  /**
   * Updated timestamp for the project
   */
  updated?: number
}

/**
 * This is the SSH key authentication details defined in Harness.
 */
export type SSHKerberosTGTKeyTabFileSpec = SecretSpec & {
  /**
   * Kerberos keytab file path
   */
  key_path?: string
  /**
   * SSH port
   */
  port?: number
  /**
   * Kerberos principal
   */
  principal?: string
  /**
   * Kerberos realm
   */
  realm?: string
  /**
   * This specifies the type of secret
   */
  type: 'SSHKerberosTGTKeyTabFile'
}

/**
 * This is the SSH key authentication details defined in Harness.
 */
export type SSHKerberosTGTPasswordSpec = SecretSpec & {
  /**
   * Kerberos password
   */
  password?: string
  /**
   * SSH port
   */
  port?: number
  /**
   * Kerberos principal
   */
  principal?: string
  /**
   * Kerberos realm
   */
  realm?: string
  /**
   * This specifies the type of secret
   */
  type: 'SSHKerberosTGTPassword'
}

/**
 * This is the SSH key authentication details defined in Harness.
 */
export type SSHKeyPathSpec = SecretSpec & {
  /**
   * This is the passphrase provided while creating the SSH key for local encryption
   */
  encrypted_passphrase?: string
  /**
   * Path of the key file
   */
  key_path: string
  /**
   * SSH port
   */
  port?: number
  /**
   * This specifies the type of secret
   */
  type: 'SSHKeyPath'
  /**
   * SSH username
   */
  username: string
}

/**
 * This is the SSH key authentication details defined in Harness.
 */
export type SSHKeyReferenceSpec = SecretSpec & {
  /**
   * This is the passphrase provided while creating the SSH key for local encryption
   */
  encrypted_passphrase?: string
  /**
   * SSH key
   */
  key?: string
  /**
   * SSH port
   */
  port?: number
  /**
   * This specifies the type of secret
   */
  type: 'SSHKeyReference'
  /**
   * SSH username
   */
  username: string
}

/**
 * This is the SSH key authentication details defined in Harness.
 */
export type SSHPasswordSpec = SecretSpec & {
  /**
   * SSH password
   */
  password: string
  /**
   * SSH port
   */
  port?: number
  /**
   * This specifies the type of secret
   */
  type: 'SSHPassword'
  /**
   * SSH username
   */
  username: string
}

export interface Secret {
  /**
   * Secret description
   */
  description?: string
  /**
   * Secret identifier
   */
  identifier: string
  /**
   * Secret name
   */
  name: string
  /**
   * Organization identifier for secret
   */
  org?: string
  /**
   * Project identifier for secret
   */
  project?: string
  spec: SecretSpec
  /**
   * Secret tags
   */
  tags?: {
    [key: string]: string
  }
}

/**
 * This is the SSH key authentication details defined in Harness.
 */
export type SecretFileSpec = SecretSpec & {
  /**
   * Identifier of the secret manager used to manage the secret
   */
  secret_manager_identifier: string
  /**
   * This specifies the type of secret
   */
  type: 'SecretFile'
}

export interface SecretRequest {
  secret: Secret
}

/**
 * Secret response model
 */
export interface SecretResponse {
  /**
   * Creation timestamp for the secret
   */
  created?: number
  draft?: boolean
  /**
   * Governance metadata information
   */
  governance_metadata?: { [key: string]: any }
  secret?: Secret
  /**
   * Updated timestamp for the secret
   */
  updated?: number
}

/**
 * Details of the secret defined in Harness
 */
export interface SecretSpec {
  /**
   * This specifies the type of secret
   */
  type:
    | 'SSHKeyPath'
    | 'SSHKeyReference'
    | 'SSHPassword'
    | 'SSHKerberosTGTKeyTabFile'
    | 'SSHKerberosTGTPassword'
    | 'SecretFile'
    | 'SecretText'
    | 'WinRmTGTKeyTabFile'
    | 'WinRmTGTPassword'
    | 'WinRmNTLM'
}

/**
 * This is the SSH key authentication details defined in Harness.
 */
export type SecretTextSpec = SecretSpec & {
  /**
   * Identifier of the secret manager used to manage the secret
   */
  secret_manager_identifier: string
  /**
   * This specifies the type of secret
   */
  type: 'SecretText'
  /**
   * Value of the Secret
   */
  value?: string
  /**
   * This has details to specify if the secret value is inline or referenced
   */
  value_type: 'Inline' | 'Reference'
}

/**
 * This is the Service entity defined in Harness
 */
export interface Service {
  /**
   * Account Identifier
   */
  account?: string
  /**
   * Description of the entity
   */
  description?: string
  /**
   * Identifier of the Service Request.
   */
  identifier: string
  /**
   * Name of the Service Request.
   */
  name: string
  /**
   * Organization Identifier for the Entity.
   */
  org?: string
  /**
   * Project Identifier for the Entity.
   */
  project?: string
  /**
   * Service tags
   */
  tags?: {
    [key: string]: string
  }
  /**
   * Yaml related to service
   */
  yaml?: string
}

/**
 * Service Request Body
 */
export interface ServiceRequest {
  /**
   * Description of the entity
   */
  description?: string
  /**
   * Identifier of the Service
   */
  identifier: string
  /**
   * Name of the Service
   */
  name: string
  /**
   * Service tags
   */
  tags?: {
    [key: string]: string
  }
  /**
   * YAML for the Service Request
   */
  yaml?: string
}

/**
 * Default response when a service is returned
 */
export interface ServiceResponse {
  /**
   * Creation timestamp for Service.
   */
  created?: number
  service?: Service
  /**
   * Last modification timestamp for Service.
   */
  updated?: number
}

/**
 * Update oganization request
 */
export interface UpdateOrganizationRequest {
  org: Organization
}

/**
 * Update project request
 */
export interface UpdateProjectRequest {
  project: Project
}

/**
 * This is the SSH key authentication details defined in Harness.
 */
export type WinRmNTLMSpec = SecretSpec & {
  /**
   * This is the NTLM domain name
   */
  domain: string
  /**
   * This is the NTLM password
   */
  password: string
  /**
   * WinRm port
   */
  port?: number
  /**
   * This is the Kerberos either to skip certificate checks
   */
  skip_cert_checks?: boolean
  /**
   * This specifies the type of secret
   */
  type: 'WinRmNTLM'
  /**
   * This is the Kerberos powershell runs without loading profile
   */
  use_no_profile?: boolean
  /**
   * This is the NTLM either to use SSL/https
   */
  use_ssl?: boolean
  /**
   * This is the NTLM user name
   */
  username: string
}

/**
 * This is the SSH key authentication details defined in Harness.
 */
export type WinRmTGTKeyTabFileSpec = SecretSpec & {
  /**
   * Keytab file path
   */
  key_path?: string
  /**
   * WinRm port
   */
  port?: number
  /**
   * Kerberos principal
   */
  principal?: string
  /**
   * Kerberos realm
   */
  realm?: string
  /**
   * This is the Kerberos either to skip certificate checks
   */
  skip_cert_checks?: boolean
  /**
   * This specifies the type of secret
   */
  type: 'WinRmTGTKeyTabFile'
  /**
   * This is the Kerberos powershell runs without loading profile
   */
  use_no_profile?: boolean
  /**
   * This is the Kerberos either to use SSL/https
   */
  use_ssl?: boolean
}

/**
 * This is the SSH key authentication details defined in Harness.
 */
export type WinRmTGTPasswordSpec = SecretSpec & {
  /**
   * Kerberos password
   */
  password?: string
  /**
   * WinRm port
   */
  port?: number
  /**
   * Kerberos principal
   */
  principal?: string
  /**
   * Kerberos realm
   */
  realm?: string
  /**
   * This is the Kerberos either to skip certificate checks
   */
  skip_cert_checks?: boolean
  /**
   * This specifies the type of secret
   */
  type: 'WinRmTGTPassword'
  /**
   * This is the Kerberos powershell runs without loading profile
   */
  use_no_profile?: boolean
  /**
   * This is the Kerberos either to use SSL/https
   */
  use_ssl?: boolean
}

/**
 * Post the necessary fields for the API to create an organization.
 */
export type CreateOrganizationRequestRequestBody = CreateOrganizationRequest

/**
 * Post the necessary fields for the API to create a project.
 */
export type CreateProjectRequestRequestBody = CreateProjectRequest

export type SecretRequestRequestBody = SecretRequest

/**
 * Create Service request body
 */
export type ServiceRequestRequestBody = ServiceRequest

/**
 * Put the necessary fields for the API to update a organization.
 */
export type UpdateOrganizationRequestRequestBody = UpdateOrganizationRequest

/**
 * Put the necessary fields for the API to update a Project.
 */
export type UpdateProjectRequestRequestBody = UpdateProjectRequest

/**
 * Example response
 */
export type ModuleVersionsListResponseResponse = ModuleVersionsResponse[]

/**
 * Organization list response
 */
export type OrganizationListResponseResponse = OrganizationResponse[]

/**
 * Organization response
 */
export type OrganizationResponseResponse = OrganizationResponse

/**
 * Project list response
 */
export type ProjectListResponseResponse = ProjectResponse[]

/**
 * Project response
 */
export type ProjectResponseResponse = ProjectResponse

/**
 * Secret list response
 */
export type SecretListResponseResponse = SecretResponse[]

/**
 * Secret response
 */
export type SecretResponseResponse = SecretResponse

/**
 * Example response
 */
export type ServiceListResponseResponse = ServiceResponse[]

/**
 * Example response
 */
export type ServiceResponseResponse = ServiceResponse

export interface ListModuleVersionsQueryParams {
  /**
   * Pagination page number strategy: Specify the page number within the paginated collection related to the number of items in each page
   */
  page?: number
  /**
   * Pagination: Number of items to return
   */
  limit?: number
}

export type ListModuleVersionsProps = Omit<
  GetProps<ModuleVersionsListResponseResponse, unknown, ListModuleVersionsQueryParams, void>,
  'path'
>

/**
 * List Module Versions
 *
 * Lists Versions of different Modules.
 */
export const ListModuleVersions = (props: ListModuleVersionsProps) => (
  <Get<ModuleVersionsListResponseResponse, unknown, ListModuleVersionsQueryParams, void>
    path={`/v1/module-versions`}
    base={getConfig('ng/api')}
    {...props}
  />
)

export type UseListModuleVersionsProps = Omit<
  UseGetProps<ModuleVersionsListResponseResponse, unknown, ListModuleVersionsQueryParams, void>,
  'path'
>

/**
 * List Module Versions
 *
 * Lists Versions of different Modules.
 */
export const useListModuleVersions = (props: UseListModuleVersionsProps) =>
  useGet<ModuleVersionsListResponseResponse, unknown, ListModuleVersionsQueryParams, void>(`/v1/module-versions`, {
    base: getConfig('ng/api'),
    ...props
  })

/**
 * List Module Versions
 *
 * Lists Versions of different Modules.
 */
export const listModuleVersionsPromise = (
  props: GetUsingFetchProps<ModuleVersionsListResponseResponse, unknown, ListModuleVersionsQueryParams, void>,
  signal?: RequestInit['signal']
) =>
  getUsingFetch<ModuleVersionsListResponseResponse, unknown, ListModuleVersionsQueryParams, void>(
    getConfig('ng/api'),
    `/v1/module-versions`,
    props,
    signal
  )
