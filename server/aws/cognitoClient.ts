/**
 * Amazon Cognito Authentication Client for OpenShelf
 * Handles user registration, confirmation, login, and JWT verification.
 */

import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  AuthFlowType,
} from "@aws-sdk/client-cognito-identity-provider"
import { awsConfig } from "./config.ts"
import type { UserProfile } from "../types.ts"

export const cognitoClient = new CognitoIdentityProviderClient({
  region: awsConfig.region,
  ...(awsConfig.credentials ? { credentials: awsConfig.credentials } : {}),
})

export interface CognitoAuthResult {
  success: boolean
  user?: UserProfile
  token?: string
  message?: string
  isSimulation?: boolean
}

/**
 * Registers a new user in Amazon Cognito User Pool
 */
export async function cognitoSignUp(
  email: string,
  password: string,
  name: string,
  role: "learner" | "moderator" = "learner"
): Promise<CognitoAuthResult> {
  const { userPoolId, clientId } = awsConfig.cognito

  if (awsConfig.isConfigured && clientId) {
    try {
      const res = await cognitoClient.send(
        new SignUpCommand({
          ClientId: clientId,
          Username: email,
          Password: password,
          UserAttributes: [
            { Name: "email", Value: email },
            { Name: "name", Value: name },
            { Name: "custom:role", Value: role },
          ],
        })
      )

      return {
        success: true,
        user: {
          id: res.UserSub || `user-${Date.now()}`,
          name,
          email,
          role,
        },
        message: "Confirmation code sent to your email by Amazon Cognito.",
        isSimulation: false,
      }
    } catch (err: any) {
      console.warn(`[Cognito] SignUp fallback: ${err.message}`)
      return {
        success: false,
        message: err.message,
      }
    }
  }

  // Local simulated signup fallback
  return {
    success: true,
    user: {
      id: `local-${Date.now()}`,
      name,
      email,
      role,
    },
    message: "User registered (Local Simulation Mode).",
    isSimulation: true,
  }
}

/**
 * Confirms user email using the verification code sent by Amazon Cognito
 */
export async function cognitoConfirmSignUp(
  email: string,
  code: string
): Promise<{ success: boolean; message: string }> {
  const { clientId } = awsConfig.cognito

  if (awsConfig.isConfigured && clientId) {
    try {
      await cognitoClient.send(
        new ConfirmSignUpCommand({
          ClientId: clientId,
          Username: email,
          ConfirmationCode: code,
        })
      )
      return { success: true, message: "Email confirmed successfully via Cognito!" }
    } catch (err: any) {
      return { success: false, message: err.message }
    }
  }

  return { success: true, message: "Email confirmed (Simulation Mode)." }
}

/**
 * Authenticates user credentials via Amazon Cognito USER_PASSWORD_AUTH flow
 */
export async function cognitoSignIn(
  email: string,
  password: string
): Promise<CognitoAuthResult> {
  const { clientId } = awsConfig.cognito

  if (awsConfig.isConfigured && clientId) {
    try {
      const res = await cognitoClient.send(
        new InitiateAuthCommand({
          AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
          ClientId: clientId,
          AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
          },
        })
      )

      const idToken = res.AuthenticationResult?.IdToken
      const accessToken = res.AuthenticationResult?.AccessToken

      return {
        success: true,
        token: idToken || accessToken,
        isSimulation: false,
      }
    } catch (err: any) {
      console.warn(`[Cognito] SignIn fallback: ${err.message}`)
      return {
        success: false,
        message: err.message,
      }
    }
  }

  return {
    success: false,
    message: "Cognito User Pool not configured. Using local JWT authentication.",
    isSimulation: true,
  }
}

export default {
  cognitoClient,
  cognitoSignUp,
  cognitoConfirmSignUp,
  cognitoSignIn,
}
