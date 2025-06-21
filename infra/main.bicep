// main.bicep - Infraestructura para Next.js + FastAPI en Azure
param location string = resourceGroup().location
param containerRegistryName string = 'orryxregistry'
param webappBackendName string = 'orryx-fastapi'
param webappFrontendName string = 'orryx-nextjs'
param postgresServerName string = 'orryxpg${uniqueString(resourceGroup().id)}'
param postgresAdminUser string = 'orryxadmin'
@secure()
param postgresAdminPassword string

// Azure Container Registry
resource acr 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' = {
  name: containerRegistryName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

// Azure Database for PostgreSQL Flexible Server
resource postgres 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
  name: postgresServerName
  location: location
  sku: {
    name: 'Standard_B1ms' // Corregido
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: postgresAdminUser
    administratorLoginPassword: postgresAdminPassword
    version: '15'
    storage: {
      storageSizeGB: 32
    }
    highAvailability: {
      mode: 'Disabled'
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
  }
}

// App Service Plan para backend y frontend
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: 'orryx-appservice-plan'
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
}

// Web App para FastAPI backend
resource backendWebApp 'Microsoft.Web/sites@2022-03-01' = {
  name: webappBackendName
  location: location
  kind: 'app,linux,container'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'DOCKER|${acr.name}.azurecr.io/backend:latest'
      appSettings: [
        {
          name: 'DATABASE_URL'
          value: 'postgresql://${postgresAdminUser}:${postgresAdminPassword}@${postgres.name}.postgres.database.azure.com:5432/postgres'
        }
        {
          name: 'WEBSITES_PORT'
          value: '8000'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_URL'
          value: 'https://${acr.name}.azurecr.io'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_USERNAME'
          value: acr.listCredentials().username
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_PASSWORD'
          value: acr.listCredentials().passwords[0].value
        }
      ]
    }
    httpsOnly: true
  }
  identity: {
    type: 'SystemAssigned'
  }
}

// Web App para Next.js frontend
resource frontendWebApp 'Microsoft.Web/sites@2022-03-01' = {
  name: webappFrontendName
  location: location
  kind: 'app,linux,container'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'DOCKER|${acr.name}.azurecr.io/frontend:latest'
      appSettings: [
        {
          name: 'BACKEND_URL'
          value: 'https://${webappBackendName}.azurewebsites.net'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_URL'
          value: 'https://${acr.name}.azurecr.io'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_USERNAME'
          value: acr.listCredentials().username
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_PASSWORD'
          value: acr.listCredentials().passwords[0].value
        }
      ]
    }
    httpsOnly: true
  }
  identity: {
    type: 'SystemAssigned'
  }
  dependsOn: [backendWebApp]
}
