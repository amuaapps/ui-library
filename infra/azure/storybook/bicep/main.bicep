// Azure Bicep template for Storybook hosting
// Implements static website hosting with optional CDN and blue/green deployment

// Required Parameters
@minLength(3)
@maxLength(20)
@description('Project identifier used for resource naming (lowercase alphanumeric and hyphens only)')
param projectName string

@allowed(['dev', 'staging', 'prod'])
@description('Environment name for deployment isolation')
param environment string

@description('Azure region for resource deployment')
param location string = resourceGroup().location

// Optional Parameters
@description('Enable blue/green deployment strategy (recommended for prod)')
param enableBlueGreen bool = true

@description('Enable Azure CDN for global distribution (recommended for prod)')
param enableCdn bool = true

@description('Custom domain name for Storybook (e.g., storybook.example.com)')
param customDomainName string = ''

@description('Azure DNS zone resource ID for custom domain')
param dnsZoneResourceId string = ''

@minValue(1)
@maxValue(365)
@description('Number of days to retain access logs')
param retentionPolicyDays int = 30

@description('Additional tags to apply to all resources')
param tags object = {}

@allowed(['blue', 'green'])
@description('Active environment for blue/green switch (blue or green)')
param activeEnvironment string = 'blue'

// Local variables
var storageAccountPrefix = 'sb${replace(projectName, '-', '')}${environment}'
var blueStorageAccountName = take('${storageAccountPrefix}blue', 24)
var greenStorageAccountName = take('${storageAccountPrefix}green', 24)
var cdnProfileName = 'cdn-${projectName}-${environment}'
var cdnEndpointName = 'storybook-${projectName}-${environment}'

var commonTags = union({
  Project: projectName
  Environment: environment
  ManagedBy: 'Bicep'
  Component: 'Storybook'
}, tags)

// Storage Account for BLUE environment
resource blueStorageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: blueStorageAccountName
  location: location
  tags: commonTags
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: !enableCdn
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Allow'
    }
    encryption: {
      services: {
        blob: {
          enabled: true
        }
      }
      keySource: 'Microsoft.Storage'
    }
  }
}

// Enable static website hosting for BLUE
resource blueStaticWebsite 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: blueStorageAccount
  name: 'default'
  properties: {
    deleteRetentionPolicy: {
      enabled: true
      days: retentionPolicyDays
    }
  }
}

// Configure static website for BLUE
resource blueWebContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blueStaticWebsite
  name: '$web'
  properties: {
    publicAccess: enableCdn ? 'None' : 'Blob'
  }
}

// Storage Account for GREEN environment (conditional)
resource greenStorageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = if (enableBlueGreen) {
  name: greenStorageAccountName
  location: location
  tags: commonTags
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: !enableCdn
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Allow'
    }
    encryption: {
      services: {
        blob: {
          enabled: true
        }
      }
      keySource: 'Microsoft.Storage'
    }
  }
}

// Enable static website hosting for GREEN
resource greenStaticWebsite 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = if (enableBlueGreen) {
  parent: greenStorageAccount
  name: 'default'
  properties: {
    deleteRetentionPolicy: {
      enabled: true
      days: retentionPolicyDays
    }
  }
}

// Configure static website for GREEN
resource greenWebContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = if (enableBlueGreen) {
  parent: greenStaticWebsite
  name: '$web'
  properties: {
    publicAccess: enableCdn ? 'None' : 'Blob'
  }
}

// CDN Profile (conditional)
resource cdnProfile 'Microsoft.Cdn/profiles@2023-05-01' = if (enableCdn) {
  name: cdnProfileName
  location: 'Global'
  tags: commonTags
  sku: {
    name: 'Standard_Microsoft'
  }
}

// Determine active storage account endpoint
var activeStorageEndpoint = activeEnvironment == 'green' && enableBlueGreen 
  ? replace(replace(greenStorageAccount.properties.primaryEndpoints.web, 'https://', ''), '/', '')
  : replace(replace(blueStorageAccount.properties.primaryEndpoints.web, 'https://', ''), '/', '')

// CDN Endpoint (conditional)
resource cdnEndpoint 'Microsoft.Cdn/profiles/endpoints@2023-05-01' = if (enableCdn) {
  parent: cdnProfile
  name: cdnEndpointName
  location: 'Global'
  tags: commonTags
  properties: {
    originHostHeader: activeStorageEndpoint
    isHttpAllowed: false
    isHttpsAllowed: true
    queryStringCachingBehavior: 'IgnoreQueryString'
    contentTypesToCompress: [
      'application/javascript'
      'application/json'
      'application/x-javascript'
      'text/css'
      'text/html'
      'text/javascript'
      'text/plain'
    ]
    isCompressionEnabled: true
    origins: [
      {
        name: 'storybook-origin'
        properties: {
          hostName: activeStorageEndpoint
          httpsPort: 443
          originHostHeader: activeStorageEndpoint
        }
      }
    ]
    deliveryPolicy: {
      rules: [
        {
          name: 'SpaRouting'
          order: 1
          conditions: [
            {
              name: 'UrlFileExtension'
              parameters: {
                typeName: 'DeliveryRuleUrlFileExtensionMatchConditionParameters'
                operator: 'LessThan'
                matchValues: [
                  '1'
                ]
              }
            }
          ]
          actions: [
            {
              name: 'UrlRewrite'
              parameters: {
                typeName: 'DeliveryRuleUrlRewriteActionParameters'
                sourcePattern: '/'
                destination: '/index.html'
              }
            }
          ]
        }
      ]
    }
  }
}

// Custom domain for CDN (conditional)
resource cdnCustomDomain 'Microsoft.Cdn/profiles/endpoints/customDomains@2023-05-01' = if (enableCdn && !empty(customDomainName)) {
  parent: cdnEndpoint
  name: replace(customDomainName, '.', '-')
  properties: {
    hostName: customDomainName
  }
}

// DNS Record for custom domain (conditional)
resource dnsRecord 'Microsoft.Network/dnsZones/CNAME@2018-05-01' = if (enableCdn && !empty(customDomainName) && !empty(dnsZoneResourceId)) {
  name: '${last(split(dnsZoneResourceId, '/'))}/${split(customDomainName, '.')[0]}'
  properties: {
    TTL: 3600
    CNAMERecord: {
      cname: cdnEndpoint.properties.hostName
    }
  }
}

// Outputs (per INTERFACE.md specification)

// Required Outputs
@description('Current active Storybook URL (points to blue or green based on activeEnvironment)')
output storybookUrlActive string = enableCdn 
  ? (!empty(customDomainName) ? 'https://${customDomainName}' : 'https://${cdnEndpoint.properties.hostName}')
  : (activeEnvironment == 'green' && enableBlueGreen 
      ? greenStorageAccount.properties.primaryEndpoints.web 
      : blueStorageAccount.properties.primaryEndpoints.web)

@description('Direct URL to BLUE environment')
output storybookUrlBlue string = enableCdn 
  ? 'https://${cdnEndpoint.properties.hostName}'
  : blueStorageAccount.properties.primaryEndpoints.web

@description('Direct URL to GREEN environment')
output storybookUrlGreen string = enableBlueGreen 
  ? (enableCdn 
      ? 'https://${cdnEndpoint.properties.hostName}' 
      : greenStorageAccount.properties.primaryEndpoints.web)
  : ''

@description('Storage account name for BLUE environment uploads')
output uploadTargetBlue string = blueStorageAccount.name

@description('Storage account name for GREEN environment uploads')
output uploadTargetGreen string = enableBlueGreen ? greenStorageAccount.name : ''

@description('CDN endpoint name (empty if CDN disabled)')
output cdnEndpointName string = enableCdn ? cdnEndpoint.name : ''

// Optional Outputs
@description('Resource group name')
output resourceGroupName string = resourceGroup().name

@description('BLUE storage account resource ID')
output blueStorageAccountId string = blueStorageAccount.id

@description('GREEN storage account resource ID')
output greenStorageAccountId string = enableBlueGreen ? greenStorageAccount.id : ''

@description('CDN profile name')
output cdnProfileName string = enableCdn ? cdnProfile.name : ''

@description('Currently active environment (blue or green)')
output activeEnvironment string = activeEnvironment
