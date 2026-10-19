/**
 * Automated Amazon Cognito User Pool Provisioner for OpenShelf
 * Sets up a user pool with email verification and an App Client for SPA authentication.
 */

import {
  CognitoIdentityProviderClient,
  CreateUserPoolCommand,
  CreateUserPoolClientCommand,
  ListUserPoolsCommand,
} from "@aws-sdk/client-cognito-identity-provider"
import { awsConfig } from "../aws/config.ts"

const cognito = new CognitoIdentityProviderClient({
  region: awsConfig.region,
  ...(awsConfig.credentials ? { credentials: awsConfig.credentials } : {}),
})

async function initCognito() {
  console.log("==================================================")
  console.log("   OpenShelf - Automated Amazon Cognito Setup")
  console.log("==================================================")
  console.log(`Region: ${awsConfig.region}`)
  console.log("--------------------------------------------------")

  const poolName = "OpenShelf-Users-Pool"

  try {
    const listRes = await cognito.send(new ListUserPoolsCommand({ MaxResults: 60 }))
    const existing = listRes.UserPools?.find((p) => p.Name === poolName)

    let userPoolId = existing?.Id

    if (userPoolId) {
      console.log(`✓ User Pool '${poolName}' already exists (ID: ${userPoolId})`)
    } else {
      process.stdout.write(`Creating Cognito User Pool '${poolName}'... `)
      const poolRes = await cognito.send(
        new CreateUserPoolCommand({
          PoolName: poolName,
          AutoVerifiedAttributes: ["email"],
          UsernameAttributes: ["email"],
          Schema: [
            {
              Name: "name",
              AttributeDataType: "String",
              Mutable: true,
              Required: true,
            },
            {
              Name: "role",
              AttributeDataType: "String",
              Mutable: true,
              Required: false,
            },
          ],
          Policies: {
            PasswordPolicy: {
              MinimumLength: 8,
              RequireUppercase: true,
              RequireLowercase: true,
              RequireNumbers: true,
              RequireSymbols: false,
            },
          },
        })
      )

      userPoolId = poolRes.UserPool?.Id
      console.log(`CREATED! (ID: ${userPoolId})`)
    }

    if (!userPoolId) {
      throw new Error("Could not acquire User Pool ID.")
    }

    // Create App Client
    process.stdout.write("Configuring SPA App Client (No client secret for browser)... ")
    const clientRes = await cognito.send(
      new CreateUserPoolClientCommand({
        UserPoolId: userPoolId,
        ClientName: "OpenShelf-WebApp-Client",
        GenerateSecret: false, // Essential for single-page apps / client code
        ExplicitAuthFlows: [
          "ALLOW_USER_PASSWORD_AUTH",
          "ALLOW_REFRESH_TOKEN_AUTH",
          "ALLOW_USER_SRP_AUTH",
        ],
      })
    )

    const clientId = clientRes.UserPoolClient?.ClientId
    console.log(`SUCCESS! (Client ID: ${clientId})`)

    console.log("==================================================")
    console.log("Amazon Cognito configured successfully!")
    console.log("Copy these two lines into your .env file:")
    console.log("--------------------------------------------------")
    console.log(`AWS_COGNITO_USER_POOL_ID=${userPoolId}`)
    console.log(`AWS_COGNITO_CLIENT_ID=${clientId}`)
    console.log("==================================================")
  } catch (err: any) {
    console.error("Cognito Provisioning Error:", err.message)
    console.log("Check that your AWS credentials in .env have permission for cognito-idp:*")
  }
}

initCognito()
